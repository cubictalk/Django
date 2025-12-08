# core/admin/feedback_admin.py
from django.contrib import admin
from ..models import Feedback

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ("id", "essay", "reviewer", "created_at")
    search_fields = ("essay__title", "reviewer__user__full_name")
    ordering = ("-created_at",)
