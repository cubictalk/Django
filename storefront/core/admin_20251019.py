
# Register your from django.contrib import admin
from django.contrib import admin
from .models import Tenant, User, ParentStudent, Essay, Feedback, Subscription

# core/admin.py
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.core.exceptions import PermissionDenied
from django.utils.translation import gettext_lazy as _
from django import forms

from .models import Tenant, User
from .forms import UserCreationForm, UserChangeForm

@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "business_type", "domain", "created_at")
    search_fields = ("name", "domain")
    ordering = ("id",)

    # Tenant는 오직 슈퍼유저만 생성/수정/삭제 가능하도록 권한 체크
    def has_module_permission(self, request):
        return bool(request.user and request.user.is_active and request.user.is_superuser)

    def has_view_permission(self, request, obj=None):
        return bool(request.user and request.user.is_active and request.user.is_superuser)

    def has_add_permission(self, request):
        return bool(request.user and request.user.is_active and request.user.is_superuser)

    def has_change_permission(self, request, obj=None):
        return bool(request.user and request.user.is_active and request.user.is_superuser)

    def has_delete_permission(self, request, obj=None):
        return bool(request.user and request.user.is_active and request.user.is_superuser)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # forms
    form = UserChangeForm
    add_form = UserCreationForm

    # admin에서 보여줄 필드
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

    # non-superuser가 보는 queryset: 자신의 tenant 소속 유저만 보게 함
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        # staff나 owner 등은 자기 tenant 유저만 조회 (슈퍼유저만 전체 조회)
        return qs.filter(tenant=request.user.tenant)

    # Owner(혹은 role이 owner)가 생성될 때 슈퍼유저만 생성 가능하도록 제한
    def save_model(self, request, obj, form, change):
        # 새로 생성하는 경우(change == False)
        if not change:
            creating_role = getattr(obj, "role", None)
            if creating_role == "owner" and not request.user.is_superuser:
                raise PermissionDenied("Only superusers can create Owner accounts.")
        # non-superuser가 tenant 필드를 다른 tenant로 변경하지 못하게 방지
        if not request.user.is_superuser:
            # ensure the obj.tenant equals request.user.tenant
            obj.tenant = request.user.tenant
        super().save_model(request, obj, form, change)

    # non-superuser는 tenant 필드 폼에서 선택 못하게 하고, 읽기 전용으로 할 수 있음
    def get_readonly_fields(self, request, obj=None):
        ro = list(super().get_readonly_fields(request, obj))
        if not request.user.is_superuser:
            # 일반 staff/owner는 tenant 변경 불가
            ro.append("tenant")
            # 또한 is_superuser 변경 불가
            ro.append("is_superuser")
        return ro

    # Admin 메뉴 자체 접근 권한: 로그인된 사용자(스태프 이상)만 접근 가능
    def has_module_permission(self, request):
        return bool(request.user and request.user.is_active and (request.user.is_staff or request.user.is_superuser))

admin.site.register(ParentStudent)
admin.site.register(Essay)
admin.site.register(Feedback)
admin.site.register(Subscription)

