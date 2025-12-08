# core/admin/essay_admin.py
from django.contrib import admin
from ..models import Essay

@admin.register(Essay)
class EssayAdmin(admin.ModelAdmin):
    list_display = ("id", "tenant", "student", "title", "status", "created_at")
    search_fields = ("title", "student__user__full_name")
    list_filter = ("status", "tenant")
    ordering = ("-created_at",)
