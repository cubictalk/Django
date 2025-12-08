# core/views/student_views.py
# Created: 2025-11-03
# Based on CourseViewSet structure for consistent tenant-based access

import logging
from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action

from core.models.student_models import Student
from core.serializers.student_serializers import StudentRegistrationSerializer

logger = logging.getLogger(__name__)


def is_owner_or_staff(user):
    return bool(
        user and (user.is_superuser or user.is_staff or getattr(user, "role", "") == "owner")
    )


class StudentViewSet(viewsets.ModelViewSet):
    """Owner 전용 Student CRUD (tenant scope)"""
    queryset = Student.objects.all()
    serializer_class = StudentRegistrationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["user__full_name", "user__email"]
    ordering_fields = ["created_at", "user__full_name"]

    def get_queryset(self):
        tenant = getattr(self.request.user, "tenant", None)
        logger.debug(f"[StudentViewSet] {self.request.user.email} accessing tenant={tenant}")
        if tenant:
            return Student.objects.filter(tenant=tenant).order_by("-created_at")
        return Student.objects.none()

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)

    def create(self, request, *args, **kwargs):
        if not is_owner_or_staff(request.user):
            return Response(
                {"error": "Permission denied", "detail": "Only owner/staff can create students."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not is_owner_or_staff(request.user):
            return Response(
                {"error": "Permission denied", "detail": "Only owner/staff can update students."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)

    # ✅ 2025-11-04: Added logging to debug update and partial_update issues

    def partial_update(self, request, *args, **kwargs):
        if not is_owner_or_staff(request.user):
            return Response(
                {"error": "Permission denied", "detail": "Only owner/staff can update students."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # ✅ Add debug logging here
        logger.info(f"[PARTIAL_UPDATE] Called by {request.user.email}")
        logger.info(f"[PARTIAL_UPDATE] Request data: {request.data}")

        response = super().partial_update(request, *args, **kwargs)

        # ✅ Log response for debugging
        logger.info(f"[PARTIAL_UPDATE] Response status: {response.status_code}")
        logger.info(f"[PARTIAL_UPDATE] Response data: {response.data}")

        return response

    def destroy(self, request, *args, **kwargs):
        if not is_owner_or_staff(request.user):
            return Response(
                {"error": "Permission denied", "detail": "Only owner/staff can delete students."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=["get"])
    def active(self, request):
        """GET /api/students/active/ - 활성화된 학생만"""
        qs = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)
