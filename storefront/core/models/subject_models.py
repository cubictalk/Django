# core/models/subject_models.py
# ✅ created 2025-10-27

from django.db import models
from .tenant_models import Tenant


class Subject(models.Model):
    """
    과목 (예: 영어, 수학, 과학 등)
    각 과목은 특정 테넌트(학원/학교)에 속한다.
    """
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="subjects")
    name = models.CharField(max_length=100, help_text="과목 이름 (예: 영어, 수학)")
    description = models.TextField(blank=True, help_text="과목 설명 (선택사항)")

    is_active = models.BooleanField(default=True, help_text="과목 활성화 여부")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "core_subject"
        ordering = ["tenant", "name"]
        unique_together = ("tenant", "name")
        verbose_name = "Subject"
        verbose_name_plural = "Subjects"

    def __str__(self):
        return f"{self.name} ({self.tenant.name})"
