from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import IsAdmin
from auditlog.models import AuditLog
from auditlog.services import record_action
from .models import Asset, AssetAssignment, Employee
from .serializers import (
    AssetDetailSerializer,
    AssetListSerializer,
    AssetWriteSerializer,
    AssignAssetSerializer,
    EmployeeSerializer,
)


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer

    def get_permissions(self):
        if self.action == 'destroy':
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]


class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.select_related('assigned_to')

    def get_permissions(self):
        if self.action == 'destroy':
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'list':
            return AssetListSerializer
        if self.action in ('create', 'update', 'partial_update'):
            return AssetWriteSerializer
        return AssetDetailSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status')
        category_param = self.request.query_params.get('category')
        if status_param:
            qs = qs.filter(status=status_param)
        if category_param:
            qs = qs.filter(category=category_param)
        return qs

    def perform_create(self, serializer):
        asset = serializer.save()
        record_action(AuditLog.Action.CREATED, self.request.user, asset, {
            'category': asset.category, 'status': asset.status,
        })

    def perform_update(self, serializer):
        old_status = serializer.instance.status
        asset = serializer.save()
        if asset.status != old_status:
            record_action(AuditLog.Action.STATUS_CHANGED, self.request.user, asset, {
                'from': old_status, 'to': asset.status,
            })
        else:
            record_action(AuditLog.Action.UPDATED, self.request.user, asset, {
                'fields': list(serializer.validated_data.keys()),
            })

    def perform_destroy(self, instance):
        record_action(AuditLog.Action.DELETED, self.request.user, instance, {})
        instance.delete()

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        qs = self.get_queryset()
        by_status = {choice: qs.filter(status=choice).count() for choice, _ in Asset.Status.choices}
        by_category = {choice: qs.filter(category=choice).count() for choice, _ in Asset.Category.choices}
        warranty_expiring_soon = sum(1 for a in qs if a.is_warranty_expiring_soon)
        warranty_expired = sum(1 for a in qs if a.is_warranty_expired)
        return Response({
            'total': qs.count(),
            'by_status': by_status,
            'by_category': by_category,
            'warranty_expiring_soon': warranty_expiring_soon,
            'warranty_expired': warranty_expired,
        })

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        asset = self.get_object()
        serializer = AssignAssetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        employee = serializer.validated_data['employee_id']

        AssetAssignment.objects.create(
            asset=asset, employee=employee, assigned_by=request.user,
            notes=serializer.validated_data.get('notes', ''),
        )
        asset.assigned_to = employee
        asset.status = Asset.Status.ASSIGNED
        asset.save(update_fields=['assigned_to', 'status'])

        record_action(AuditLog.Action.ASSIGNED, request.user, asset, {'employee': employee.name})
        return Response(AssetDetailSerializer(asset).data)

    @action(detail=True, methods=['post'])
    def unassign(self, request, pk=None):
        asset = self.get_object()
        open_assignment = asset.assignments.filter(returned_at__isnull=True).first()
        if open_assignment:
            open_assignment.returned_at = timezone.now()
            open_assignment.save(update_fields=['returned_at'])

        previous_employee = asset.assigned_to.name if asset.assigned_to else None
        asset.assigned_to = None
        asset.status = Asset.Status.AVAILABLE
        asset.save(update_fields=['assigned_to', 'status'])

        record_action(AuditLog.Action.UNASSIGNED, request.user, asset, {'employee': previous_employee})
        return Response(AssetDetailSerializer(asset).data)
