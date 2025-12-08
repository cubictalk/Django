from django.db import models
from django.conf import settings
from .tenant_models import Tenant
from .subject_models import Subject
class Teacher(models.Model):
    """교사"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    subjects = models.ManyToManyField(Subject, related_name="teachers")

    def __str__(self):
        return f"{self.user.full_name} ({self.tenant.name})"
