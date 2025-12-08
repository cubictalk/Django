# core/admin/parent_admin.py
from django.contrib import admin
from ..models import ParentStudent

@admin.register(ParentStudent)
class ParentStudentAdmin(admin.ModelAdmin):
    list_display = ("id", "parent", "student", "created_at")
    search_fields = ("parent__user__full_name", "student__user__full_name")
    ordering = ("-created_at",)
