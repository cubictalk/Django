from django.db import models
from .tenant_models import Tenant


class Subscription(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="subscriptions")
    plan = models.CharField(max_length=50)
    status = models.CharField(max_length=30, default="active")
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    plan_name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.tenant.name} - {self.plan} ({self.status})"
