from rest_framework import serializers

from accounts.serializers import UserSerializer
from .models import AuditLog, WebhookDelivery


class WebhookDeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = WebhookDelivery
        fields = ['id', 'status', 'response_code', 'error_message', 'attempted_at']


class AuditLogSerializer(serializers.ModelSerializer):
    actor = UserSerializer(read_only=True)
    webhook_deliveries = WebhookDeliverySerializer(many=True, read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            'id', 'action', 'actor', 'asset_tag', 'asset_name',
            'details', 'created_at', 'webhook_deliveries',
        ]
