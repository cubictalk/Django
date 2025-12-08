# core/views/enrollment_views.py
# FINAL VERSION — 2025-11-30
# ⭐ Includes fix for GET /enrollments/students_by_course/ (was 405)

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action   # ⭐ ADDED — for students_by_course API

from core.models import StudentCourseEnrollment, Student, Course
from core.serializers.enrollment_serializer import EnrollmentSerializer


def is_owner_or_staff(user):
    return bool(
        user and (user.is_superuser or user.is_staff or getattr(user, "role", "") == "owner")
    )


class EnrollmentViewSet(viewsets.ViewSet):
    """학생-강좌 등록 관리"""

    permission_classes = [IsAuthenticated]

    # ---------------------------------------------------------------------
    # LIST
    # ---------------------------------------------------------------------
    def list(self, request):
        user = request.user
        tenant = user.tenant

        enrollments = StudentCourseEnrollment.objects.filter(
            student__tenant=tenant
        ).select_related(
            "student__user",
            "course__subject",
            "course__teacher__user"
        )

        # ⭐ NO CHANGE — Teacher restriction
        if hasattr(user, "teacher"):
            enrollments = enrollments.filter(course__teacher=user.teacher)

        serializer = EnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)

    # ---------------------------------------------------------------------
    # CREATE
    # ---------------------------------------------------------------------
    def create(self, request):
        if not is_owner_or_staff(request.user):
            return Response({"error": "Permission denied"}, status=403)

        student_id = request.data.get("student_id")
        course_id = request.data.get("course_id")

        if not student_id or not course_id:
            return Response({"error": "student_id and course_id required"}, status=400)

        # ⭐ CHANGED — tenant-safe lookup
        try:
            student = Student.objects.get(id=student_id, tenant=request.user.tenant)
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=404)

        try:
            course = Course.objects.get(id=course_id, tenant=request.user.tenant)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=404)

        enrollment, created = StudentCourseEnrollment.objects.get_or_create(
            student=student,
            course=course
        )

        serializer = EnrollmentSerializer(enrollment)
        return Response(
            {"message": "created" if created else "already exists", "data": serializer.data},
            status=200
        )

    # ---------------------------------------------------------------------
    # PATCH (partial_update)
    # ---------------------------------------------------------------------
    def partial_update(self, request, pk=None):
        if not is_owner_or_staff(request.user):
            return Response({"error": "Permission denied"}, status=403)

        try:
            enrollment = StudentCourseEnrollment.objects.get(id=pk)
        except StudentCourseEnrollment.DoesNotExist:
            return Response({"error": "Enrollment not found"}, status=404)

        if enrollment.student.tenant != request.user.tenant:
            return Response({"error": "Tenant mismatch"}, status=400)

        student_id = request.data.get("student_id")
        course_id = request.data.get("course_id")

        # ⭐ CHANGED — tenant-safe update
        if student_id:
            try:
                student = Student.objects.get(id=student_id, tenant=request.user.tenant)
            except Student.DoesNotExist:
                return Response({"error": "Student not found"}, status=404)
            enrollment.student = student

        if course_id:
            try:
                course = Course.objects.get(id=course_id, tenant=request.user.tenant)
            except Course.DoesNotExist:
                return Response({"error": "Course not found"}, status=404)

            # ⭐ FIXED — typo sta=400 → status=400
            enrollment.course = course

        enrollment.save()
        serializer = EnrollmentSerializer(enrollment)
        return Response({"message": "updated", "data": serializer.data}, status=200)

    # ---------------------------------------------------------------------
    # DELETE
    # ---------------------------------------------------------------------
    def destroy(self, request, pk=None):
        try:
            enrollment = StudentCourseEnrollment.objects.get(id=pk)
        except StudentCourseEnrollment.DoesNotExist:
            return Response({"error": "Not found"}, status=404)

        if enrollment.student.tenant != request.user.tenant:
            return Response({"error": "Tenant mismatch"}, status=400)

        enrollment.delete()
        return Response({"message": "Enrollment deleted"}, status=200)

    # ---------------------------------------------------------------------
    # ⭐⭐ NEW: GET students_by_course (Fix for 405 error)
    # ---------------------------------------------------------------------
    @action(detail=False, methods=["get"])
    def students_by_course(self, request):
        """특정 강좌에 등록된 학생 리스트 반환"""

        # ⭐ ADDED — fixed 405 GET not allowed
        course_id = request.query_params.get("course_id")

        if not course_id:
            return Response({"error": "course_id required"}, status=400)

        tenant = request.user.tenant

        # tenant-safe lookup
        try:
            course = Course.objects.get(id=course_id, tenant=tenant)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=404)

        enrollments = StudentCourseEnrollment.objects.filter(
            course=course
        ).select_related("student__user")

        result = [
            {
                "student_id": e.student.id,
                "full_name": e.student.user.full_name,
                "email": e.student.user.email,
            }
            for e in enrollments
        ]

        return Response(result, status=200)
