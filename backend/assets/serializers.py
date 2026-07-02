from rest_framework import serializers

from accounts.serializers import UserSerializer
from .models import Asset, AssetAssignment, Employee


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['id', 'name', 'email', 'department', 'position', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class AssetAssignmentSerializer(serializers.ModelSerializer):
    employee = EmployeeSerializer(read_only=True)
    assigned_by = UserSerializer(read_only=True)

    class Meta:
        model = AssetAssignment
        fields = ['id', 'asset', 'employee', 'assigned_by', 'assigned_at', 'returned_at', 'notes']
        read_only_fields = ['id', 'asset', 'employee', 'assigned_by', 'assigned_at', 'returned_at']


class AssetListSerializer(serializers.ModelSerializer):
    assigned_to = EmployeeSerializer(read_only=True)
    is_warranty_expiring_soon = serializers.ReadOnlyField()
    is_warranty_expired = serializers.ReadOnlyField()

    class Meta:
        model = Asset
        fields = [
            'id', 'name', 'category', 'asset_tag', 'status', 'location',
            'assigned_to', 'warranty_expiry', 'is_warranty_expiring_soon',
            'is_warranty_expired', 'created_at',
        ]


class AssetDetailSerializer(serializers.ModelSerializer):
    assigned_to = EmployeeSerializer(read_only=True)
    assignments = AssetAssignmentSerializer(many=True, read_only=True)
    maintenance_records = serializers.SerializerMethodField()
    is_warranty_expiring_soon = serializers.ReadOnlyField()
    is_warranty_expired = serializers.ReadOnlyField()

    class Meta:
        model = Asset
        fields = [
            'id', 'name', 'category', 'asset_tag', 'serial_number', 'brand', 'model_name',
            'location', 'status', 'purchase_date', 'purchase_cost', 'warranty_expiry',
            'assigned_to', 'notes', 'created_at', 'updated_at',
            'is_warranty_expiring_soon', 'is_warranty_expired',
            'assignments', 'maintenance_records',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'assigned_to']

    def get_maintenance_records(self, obj):
        from maintenance.serializers import MaintenanceRecordSerializer
        return MaintenanceRecordSerializer(obj.maintenance_records.all(), many=True).data


class AssetWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = [
            'id', 'name', 'category', 'asset_tag', 'serial_number', 'brand', 'model_name',
            'location', 'status', 'purchase_date', 'purchase_cost', 'warranty_expiry', 'notes',
        ]
        read_only_fields = ['id']

    def validate_status(self, value):
        instance = getattr(self, 'instance', None)
        if value == Asset.Status.ASSIGNED and (not instance or not instance.assigned_to_id):
            raise serializers.ValidationError(
                'Use the assign action to mark an asset as assigned; it cannot be set directly.'
            )
        if (
            instance and instance.assigned_to_id
            and value not in (Asset.Status.ASSIGNED, Asset.Status.IN_MAINTENANCE)
        ):
            raise serializers.ValidationError(
                'Unassign this asset first before changing its status to this value.'
            )
        return value


class AssignAssetSerializer(serializers.Serializer):
    employee_id = serializers.PrimaryKeyRelatedField(queryset=Employee.objects.filter(is_active=True))
    notes = serializers.CharField(required=False, allow_blank=True, default='')
