# core/models/parent_models.py
from django.db import models
from .user_models import User
from .student_models import Student


class Parent(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="parent_profile")

    def __str__(self):
        return f"Parent: {self.user.full_name or self.user.email}"

    class Meta:
        db_table = "core_parent"

# ✅ 2025-10-04: Parent 모델 기본 구조 추가 (relationship_models import 오류 방지용)
