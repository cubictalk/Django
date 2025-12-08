from django.db import models
from .tenant_models import Tenant
from .teacher_models import Teacher, Subject
from .student_models import Student


class ClassGroup(models.Model):
    """반 / 그룹"""
    name = models.CharField(max_length=100)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    students = models.ManyToManyField(Student, through="Enrollment")

    def __str__(self):
        return f"{self.name} - {self.subject.name} ({self.tenant.name})"


class Enrollment(models.Model):
    """학생 ↔ 반 매핑"""
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    class_group = models.ForeignKey(ClassGroup, on_delete=models.CASCADE)
    date_joined = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ("student", "class_group")

    def __str__(self):
        return f"{self.student.user.full_name} in {self.class_group.name}"
