# core/serializers/course_serializers.py
# Updated: 2025-10-22
from rest_framework import serializers
from core.models.course_models import Course


class CourseSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    teacher_name = serializers.CharField(source="teacher.user.full_name", read_only=True)

    class Meta:
        model = Course
        fields = [
            "id",
            "subject",
            "subject_name",
            "teacher",
            "teacher_name",
            "name",
            "description",
            "level",
            "duration_minutes",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_duration_minutes(self, value):
        if value <= 0:
            raise serializers.ValidationError("Duration must be greater than zero.")
        return value
