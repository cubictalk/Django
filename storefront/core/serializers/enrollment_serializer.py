# core/serializers/enrollment_serializer.py
# FINAL VERSION — FULLY MATCHED WITH EnrollmentManager.js (2025-11-28)

from rest_framework import serializers
from core.models import StudentCourseEnrollment


class EnrollmentSerializer(serializers.ModelSerializer):
    """
    FINAL serializer for Enrollment API
    ----------------------------------
    ✔ Accepts student_id, course_id for create/update
    ✔ Returns student + course IDs for React logic
    ✔ Returns readable nested names (student_name, course_name, etc.)
    ✔ 100% compatible with EnrollmentManager.js
    """

    # -----------------------------
    # INPUT FIELDS (write_only)
    # -----------------------------
    student_id = serializers.IntegerField(write_only=True)
    course_id = serializers.IntegerField(write_only=True)

    # -----------------------------
    # OUTPUT FIELDS (read_only)
    # -----------------------------
    # React expects: enr.student → ID
    student = serializers.IntegerField(source="student.id", read_only=True)
    course = serializers.IntegerField(source="course.id", read_only=True)

    # Display info
    student_name = serializers.CharField(source="student.user.full_name", read_only=True)
    student_email = serializers.CharField(source="student.user.email", read_only=True)

    course_name = serializers.CharField(source="course.name", read_only=True)
    subject_name = serializers.CharField(source="course.subject.name", read_only=True)
    teacher_name = serializers.CharField(
        source="course.teacher.user.full_name",
        read_only=True,
    )

    class Meta:
        model = StudentCourseEnrollment
        fields = [
            "id",

            # write-only input
            "student_id",
            "course_id",

            # returned IDs that React uses
            "student",
            "course",

            # extra display info
            "student_name",
            "student_email",
            "course_name",
            "subject_name",
            "teacher_name",

            "enrolled_at",
        ]

    # -----------------------------
    # CREATE OVERRIDE
    # -----------------------------
    def create(self, validated_data):
        """
        Handles POST request:
        { student_id: 3, course_id: 5 }
        """
        student_id = validated_data.pop("student_id")
        course_id = validated_data.pop("course_id")

        return StudentCourseEnrollment.objects.create(
            student_id=student_id,
            course_id=course_id,
            **validated_data
        )

    # -----------------------------
    # UPDATE OVERRIDE (PATCH)
    # -----------------------------
    def update(self, instance, validated_data):
        """
        Allows PATCH updates:
        { student_id: X, course_id: Y }
        """
        if "student_id" in validated_data:
            instance.student_id = validated_data.pop("student_id")

        if "course_id" in validated_data:
            instance.course_id = validated_data.pop("course_id")

        return super().update(instance, validated_data)
