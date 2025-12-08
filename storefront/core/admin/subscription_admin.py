# core/admin/subscription_admin.py
from django.contrib import admin
from ..models import Subscription

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ("id", "tenant", "plan_name", "start_date", "end_date", "is_active")
    list_filter = ("is_active", "plan_name")
    search_fields = ("tenant__name",)
    ordering = ("-start_date",)
