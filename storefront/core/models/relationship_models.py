# core/models/relationship_models.py
# created 2025-10-04

# core/models/relationship_models.py
from django.db import models
from .student_models import Student
from .parent_models import Parent

class ParentStudent(models.Model):
    parent = models.ForeignKey(Parent, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)  # ✅ 2025-10-04 추가
    
    class Meta:
        unique_together = ('parent', 'student')
        verbose_name = "Parent-Student Relationship"
        verbose_name_plural = "Parent-Student Relationships"

    def __str__(self):
        return f"{self.parent} ↔ {self.student}"
