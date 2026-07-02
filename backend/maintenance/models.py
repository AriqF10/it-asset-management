from django.conf import settings
from django.db import models

from assets.models import Asset


class MaintenanceRecord(models.Model):
    class Type(models.TextChoices):
        SCHEDULED = 'scheduled', 'Scheduled Maintenance'
        REPAIR = 'repair', 'Repair'
        CALIBRATION = 'calibration', 'Calibration'

    class Status(models.TextChoices):
        PLANNED = 'planned', 'Planned'
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'

    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='maintenance_records')
    type = models.CharField(max_length=20, choices=Type.choices, default=Type.SCHEDULED)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PLANNED)
    description = models.TextField()
    performed_by = models.CharField(max_length=150, blank=True, help_text='Technician or vendor name')
    cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    scheduled_date = models.DateField(null=True, blank=True)
    completed_date = models.DateField(null=True, blank=True)
    next_due_date = models.DateField(null=True, blank=True)

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.asset.asset_tag} - {self.get_type_display()}'
