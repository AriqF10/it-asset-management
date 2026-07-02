from rest_framework import permissions, viewsets

from assets.models import Asset
from auditlog.models import AuditLog
from auditlog.services import record_action
from .models import MaintenanceRecord
from .serializers import MaintenanceRecordSerializer


class MaintenanceRecordViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRecord.objects.select_related('asset', 'created_by')
    serializer_class = MaintenanceRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        asset_id = self.request.query_params.get('asset')
        status_param = self.request.query_params.get('status')
        if asset_id:
            qs = qs.filter(asset_id=asset_id)
        if status_param:
            qs = qs.filter(status=status_param)
        return qs

    def perform_create(self, serializer):
        record = serializer.save(created_by=self.request.user)
        asset = record.asset

        if record.status == MaintenanceRecord.Status.IN_PROGRESS:
            asset.status = Asset.Status.IN_MAINTENANCE
            asset.save(update_fields=['status'])
        elif record.status == MaintenanceRecord.Status.COMPLETED:
            asset.status = Asset.Status.ASSIGNED if asset.assigned_to_id else Asset.Status.AVAILABLE
            asset.save(update_fields=['status'])

        record_action(AuditLog.Action.MAINTENANCE_LOGGED, self.request.user, asset, {
            'type': record.type, 'status': record.status,
        })

    def perform_update(self, serializer):
        record = serializer.save()
        asset = record.asset

        if record.status == MaintenanceRecord.Status.IN_PROGRESS:
            asset.status = Asset.Status.IN_MAINTENANCE
            asset.save(update_fields=['status'])
        elif record.status == MaintenanceRecord.Status.COMPLETED:
            asset.status = Asset.Status.ASSIGNED if asset.assigned_to_id else Asset.Status.AVAILABLE
            asset.save(update_fields=['status'])

        record_action(AuditLog.Action.MAINTENANCE_LOGGED, self.request.user, asset, {
            'type': record.type, 'status': record.status, 'updated': True,
        })
