from rest_framework import serializers

from accounts.serializers import UserSerializer
from .models import MaintenanceRecord


class MaintenanceRecordSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = MaintenanceRecord
        fields = [
            'id', 'asset', 'type', 'status', 'description', 'performed_by', 'cost',
            'scheduled_date', 'completed_date', 'next_due_date',
            'created_by', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
