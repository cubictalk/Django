from django.db import models
from .tenant_models import Tenant
from .student_models import Student


class Essay(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="essays")
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="essays")
    title = models.CharField(max_length=250, null=True, blank=True)
    content = models.TextField()

    STATUS_CHOICES = [
        ("assigned", "Assigned"),
        ("submitted", "Submitted"),
        ("reviewed", "Reviewed"),
    ]
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="assigned")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.user.full_name} - {self.title} ({self.status})"
