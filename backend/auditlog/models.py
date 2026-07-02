from django.conf import settings
from django.db import models


class AuditLog(models.Model):
    class Action(models.TextChoices):
        CREATED = 'created', 'Created'
        UPDATED = 'updated', 'Updated'
        ASSIGNED = 'assigned', 'Assigned'
        UNASSIGNED = 'unassigned', 'Unassigned'
        STATUS_CHANGED = 'status_changed', 'Status Changed'
        DELETED = 'deleted', 'Deleted'
        MAINTENANCE_LOGGED = 'maintenance_logged', 'Maintenance Logged'

    action = models.CharField(max_length=30, choices=Action.choices)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    asset_tag = models.CharField(max_length=50, blank=True)
    asset_name = models.CharField(max_length=200, blank=True)
    details = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.get_action_display()} - {self.asset_tag} @ {self.created_at}'


class WebhookDelivery(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        SUCCESS = 'success', 'Success'
        FAILED = 'failed', 'Failed'

    audit_log = models.ForeignKey(AuditLog, on_delete=models.CASCADE, related_name='webhook_deliveries')
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    response_code = models.IntegerField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    attempted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-attempted_at']

    def __str__(self):
        return f'Webhook for log #{self.audit_log_id} - {self.status}'
