# core/admin/user_admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.core.exceptions import PermissionDenied
from django.utils.translation import gettext_lazy as _
from ..models import User
from ..forms import UserCreationForm, UserChangeForm

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    form = UserChangeForm
    add_form = UserCreationForm

    list_display = ("id", "email", "full_name", "tenant", "role", "is_staff", "is_superuser", "is_active")
    list_filter = ("role", "tenant", "is_staff", "is_superuser")
    search_fields = ("email", "full_name")
    ordering = ("id",)

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (_("Personal info"), {"fields": ("full_name",)}),
        (_("Tenant / Role"), {"fields": ("tenant", "role")}),
        (_("Permissions"), {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        (_("Important dates"), {"fields": ("last_login",)}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("tenant", "email", "full_name", "role", "password1", "password2", "is_staff", "is_active"),
        }),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(tenant=request.user.tenant)

    def save_model(self, request, obj, form, change):
        if not change and obj.role == "owner" and not request.user.is_superuser:
            raise PermissionDenied("Only superusers can create Owner accounts.")
        if not request.user.is_superuser:
            obj.tenant = request.user.tenant
        super().save_model(request, obj, form, change)

    def get_readonly_fields(self, request, obj=None):
        ro = list(super().get_readonly_fields(request, obj))
        if not request.user.is_superuser:
            ro += ["tenant", "is_superuser"]
        return ro

    def has_module_permission(self, request):
        return bool(request.user and request.user.is_active and (request.user.is_staff or request.user.is_superuser))
