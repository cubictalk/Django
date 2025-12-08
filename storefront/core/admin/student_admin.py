# core/admin/student_admin.py
from django.contrib import admin
from ..models import Student

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "tenant", "level", "created_at")
    search_fields = ("user__email", "user__full_name")
    list_filter = ("level", "tenant")
    ordering = ("-created_at",)
