# core/admin/tenant_admin.py
from django.contrib import admin
from django.core.exceptions import PermissionDenied
from ..models import Tenant

@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "business_type", "domain", "created_at")
    search_fields = ("name", "domain")
    ordering = ("id",)

    # Tenant는 슈퍼유저만 접근 가능
    def has_module_permission(self, request):
        return request.user.is_superuser

    def has_view_permission(self, request, obj=None):
        return request.user.is_superuser

    def has_add_permission(self, request):
        return request.user.is_superuser

    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser
