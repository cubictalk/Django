# core/views/teacher_views.py
# DEBUG VERSION — created 2025-11-17

import logging
from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action

from core.serializers.teacher_serializers import TeacherRegistrationSerializer
from core.serializers.subject_serializers import SubjectSerializer

from core.models.teacher_models import Teacher

logger = logging.getLogger(__name__)


def is_owner_or_staff(user):
    """Check if user has permission to modify teachers"""
    return bool(
        user and (user.is_superuser or user.is_staff or getattr(user, "role", "") == "owner")
    )


class TeacherViewSet(viewsets.ModelViewSet):
    """Owner 전용 Teacher CRUD (tenant scope)"""

    queryset = Teacher.objects.all()
    serializer_class = TeacherRegistrationSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["user__full_name", "subjects__name"]
    ordering_fields = ["user__full_name", "id"]

    # ----------------------------------------------------------------------
    # 🔍 DEBUG: List endpoint
    # ----------------------------------------------------------------------
    def list(self, request, *args, **kwargs):
        logger.info("[TeacherViewSet.list] React called GET /teachers/")
        logger.debug(
            f"[TeacherViewSet.list] User={request.user.email}, "
            f"role={getattr(request.user, 'role', None)}, "
            f"tenant={getattr(request.user, 'tenant', None)}"
        )

        qs = self.get_queryset()
        logger.debug(f"[TeacherViewSet.list] queryset count = {qs.count()}")

        for t in qs:
            logger.debug(
                f"[TeacherViewSet.list] Teacher -> id={t.id}, "
                f"name={t.user.full_name}, "
                f"subjects={[s.name for s in t.subjects.all()]}"
            )

        return super().list(request, *args, **kwargs)

    # ----------------------------------------------------------------------
    # 🔍 DEBUG: Queryset filter
    # ----------------------------------------------------------------------
    def get_queryset(self):
        tenant = getattr(self.request.user, "tenant", None)

        logger.debug("=== [TeacherViewSet.get_queryset] START ===")
        logger.debug(f"user={self.request.user.email}")
        logger.debug(f"user role={getattr(self.request.user, 'role', None)}")
        logger.debug(f"tenant={tenant}")

        if not tenant:
            logger.warning("[TeacherViewSet.get_queryset] No tenant! Returning empty list.")
            return Teacher.objects.none()

        qs = (
            Teacher.objects.filter(tenant=tenant)
            .select_related("user", "tenant")
            .prefetch_related("subjects")
        )

        logger.debug(f"[TeacherViewSet.get_queryset] teacher count={qs.count()}")

        for t in qs:
            logger.debug(
                f"[TeacherViewSet.get_queryset] Teacher -> id={t.id}, "
                f"name={t.user.full_name}, "
                f"subjects={[s.name for s in t.subjects.all()]}"
            )

        logger.debug("=== [TeacherViewSet.get_queryset] END ===")
        return qs

    # ----------------------------------------------------------------------
    # 🔍 DEBUG: Create
    # ----------------------------------------------------------------------
    def perform_create(self, serializer):
        user = self.request.user
        logger.debug(
            f"[TeacherViewSet.perform_create] Creating teacher: user={user.email}, tenant={getattr(user, 'tenant', None)}"
        )
        serializer.save(tenant=user.tenant)

    def create(self, request, *args, **kwargs):
        logger.info("[TeacherViewSet.create] Called from React UI")
        logger.debug(f"[TeacherViewSet.create] Incoming data={request.data}")
        logger.debug(
            f"[TeacherViewSet.create] User={request.user.email}, "
            f"role={getattr(request.user, 'role', None)}, "
            f"is_staff={request.user.is_staff}"
        )

        if not is_owner_or_staff(request.user):
            logger.warning("[TeacherViewSet.create] Permission denied")
            return Response(
                {"error": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            response = super().create(request, *args, **kwargs)
            logger.info("[TeacherViewSet.create] Teacher created successfully")
            return response
        except Exception as e:
            logger.exception(f"[TeacherViewSet.create] ERROR: {e}")
            return Response(
                {"error": "Teacher creation failed", "detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

    # ----------------------------------------------------------------------
    # 🔍 DEBUG: Update / Partial Update
    # ----------------------------------------------------------------------
    def update(self, request, *args, **kwargs):
        logger.debug("[TeacherViewSet.update] Called")
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        logger.debug("[TeacherViewSet.partial_update] Called")
        return super().partial_update(request, *args, **kwargs)

    # ----------------------------------------------------------------------
    # 🔍 DEBUG: Destroy
    # ----------------------------------------------------------------------
    def destroy(self, request, *args, **kwargs):
        logger.debug("[TeacherViewSet.destroy] Called")
        return super().destroy(request, *args, **kwargs)

    # ----------------------------------------------------------------------
    # 🔍 GET /api/teachers/with_subjects/
    # ----------------------------------------------------------------------
    @action(detail=False, methods=["get"])
    def with_subjects(self, request):
        logger.info("[TeacherViewSet.with_subjects] Called")
        qs = self.get_queryset().prefetch_related("subjects")
        logger.debug(f"[TeacherViewSet.with_subjects] Count={qs.count()}")
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)
