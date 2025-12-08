from django.db import models
from .student_models import Student
from .course_models import Course

class StudentCourseEnrollment(models.Model):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="enrollments"
    )
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="enrollments"
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("student", "course")  # 🔒 Prevent duplicate enrollment
        verbose_name = "Student Course Enrollment"
        verbose_name_plural = "Student Course Enrollments"

    def __str__(self):
        return f"{self.student.user.full_name} → {self.course.name}"