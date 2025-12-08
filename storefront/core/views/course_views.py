# core/views/course_views.py
# Updated: 2025-11-29 — Added teacher-only "my_courses" API
import logging
from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action

from core.serializers.course_serializers import CourseSerializer
from core.models.course_models import Course

logger = logging.getLogger(__name__)


def is_owner_or_staff(user):
    return bool(
        user and (user.is_superuser or user.is_staff or getattr(user, "role", "") == "owner")
    )


class CourseViewSet(viewsets.ModelViewSet):
    """Owner 전용 Course CRUD + Teacher 전용 my_courses API"""
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["created_at", "name"]

    # ============================================================
    # 1) Tenant 기반 QuerySet 제한 (Owner/Teacher 공통)
    # ============================================================
    def get_queryset(self):
        tenant = getattr(self.request.user, "tenant", None)
        logger.debug(f"[CourseViewSet] {self.request.user.email} accessing tenant={tenant}")

        if tenant:
            return Course.objects.filter(tenant=tenant).order_by("-created_at")

        return Course.objects.none()

    # ============================================================
    # 2) CREATE — Owner/Staff만 가능
    # ============================================================
    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)

    def create(self, request, *args, **kwargs):
        if not is_owner_or_staff(request.user):
            return Response(
                {"error": "Permission denied", "detail": "Only owner/staff can create courses."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().create(request, *args, **kwargs)

    # ============================================================
    # 3) UPDATE — Owner/Staff만 가능
    # ============================================================
    def update(self, request, *args, **kwargs):
        if not is_owner_or_staff(request.user):
            return Response(
                {"error": "Permission denied", "detail": "Only owner/staff can update courses."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if not is_owner_or_staff(request.user):
            return Response(
                {"error": "Permission denied", "detail": "Only owner/staff can update courses."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().partial_update(request, *args, **kwargs)

    # ============================================================
    # 4) DELETE — Owner/Staff만 가능
    # ============================================================
    def destroy(self, request, *args, **kwargs):
        if not is_owner_or_staff(request.user):
            return Response(
                {"error": "Permission denied", "detail": "Only owner/staff can delete courses."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().destroy(request, *args, **kwargs)

    # ============================================================
    # 5) 기존 제공 API — 활성 강좌만 보기
    # ============================================================
    @action(detail=False, methods=["get"])
    def active(self, request):
        """GET /api/courses/active/ - 활성화된 강좌만 반환"""
        qs = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    # ============================================================
    # ⭐ NEW: Teacher 전용 API — 내가 담당한 Course 보기
    # ============================================================
    @action(detail=False, methods=["get"], url_path="my_courses")
    def my_courses(self, request):
        """
        ⭐ GET /api/courses/my_courses/
        Teacher가 담당중인 Course만 반환
        Owner/Staff는 모든 course 가능하지만,
        Teacher는 본인 course만 조회되도록 제한.
        """

        user = request.user

        # ------------------------------------------------------------
        # 🔒 Teacher role 체크 — user.teacher 속성이 있는지 확인
        # ------------------------------------------------------------
        if not hasattr(user, "teacher"):
            return Response(
                {"error": "Only teachers can access this endpoint"},
                status=status.HTTP_403_FORBIDDEN
            )

        teacher = user.teacher
        tenant = user.tenant

        # ------------------------------------------------------------
        # ⭐ 핵심: Teacher가 담당한 Course만 조회
        # ------------------------------------------------------------
        courses = Course.objects.filter(
            teacher=teacher,
            tenant=tenant
        ).select_related("subject", "teacher__user")

        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)
