from django.contrib import admin
from .models import AuditLog, WebhookDelivery


class WebhookDeliveryInline(admin.TabularInline):
    model = WebhookDelivery
    extra = 0
    readonly_fields = ('status', 'response_code', 'error_message', 'attempted_at')


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'asset_tag', 'asset_name', 'actor', 'created_at')
    list_filter = ('action',)
    search_fields = ('asset_tag', 'asset_name')
    inlines = [WebhookDeliveryInline]
