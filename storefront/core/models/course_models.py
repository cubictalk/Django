# core/models/course_models.py
# ✅ created 2025-10-22
from django.db import models
from .tenant_models import Tenant
from .subject_models import Subject
from .teacher_models import Teacher


class Course(models.Model):
    """강좌 (예: IELTS Writing, TOEIC Listening 등)"""
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="courses")
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True, related_name="courses")

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    level = models.CharField(
        max_length=20,
        choices=[
            ("beginner", "Beginner"),
            ("intermediate", "Intermediate"),
            ("advanced", "Advanced"),
        ],
        default="beginner",
    )
    duration_minutes = models.PositiveIntegerField(default=25)  # 수업 시간 (예: 25분)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "core_course"
        ordering = ["subject", "name"]

    def __str__(self):
        teacher_name = self.teacher.user.full_name if self.teacher else "Unassigned"
        return f"{self.name} - {teacher_name} ({self.subject.name})"
