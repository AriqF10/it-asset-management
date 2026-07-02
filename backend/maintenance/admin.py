from django.contrib import admin
from .models import MaintenanceRecord


@admin.register(MaintenanceRecord)
class MaintenanceRecordAdmin(admin.ModelAdmin):
    list_display = ('asset', 'type', 'status', 'scheduled_date', 'completed_date', 'next_due_date')
    list_filter = ('type', 'status')
    search_fields = ('asset__asset_tag', 'asset__name', 'description')
