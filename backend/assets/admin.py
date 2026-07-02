from django.contrib import admin
from .models import Asset, AssetAssignment, Employee


class AssetAssignmentInline(admin.TabularInline):
    model = AssetAssignment
    extra = 0


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ('asset_tag', 'name', 'category', 'status', 'assigned_to', 'warranty_expiry')
    list_filter = ('category', 'status')
    search_fields = ('asset_tag', 'name', 'serial_number')
    inlines = [AssetAssignmentInline]


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'department', 'position', 'is_active')
    list_filter = ('department', 'is_active')
    search_fields = ('name', 'email')


@admin.register(AssetAssignment)
class AssetAssignmentAdmin(admin.ModelAdmin):
    list_display = ('asset', 'employee', 'assigned_at', 'returned_at')
    list_filter = ('assigned_at',)
