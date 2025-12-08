from django.db import models
from django.conf import settings
from .tenant_models import Tenant


class Student(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)

    LEVEL_CHOICES = [
        ("beginner", "Beginner"),
        ("intermediate", "Intermediate"),
        ("advanced", "Advanced"),
    ]
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default="beginner")
    created_at = models.DateTimeField(auto_now_add=True)  # ✅ 2025-10-04 추가
    
    def __str__(self):
        return f"{self.user.full_name} ({self.tenant.name})"
