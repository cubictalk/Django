# core/views/subject_views.py
# ✅ updated 2025-11-04 — added detailed logging for subject creation debugging

import logging
from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from core.serializers.subject_serializers import SubjectSerializer
from core.models.subject_models import Subject

logger = logging.getLogger(__name__)


def is_owner_or_staff(user):
    """Check if user has permission to modify subjects"""
    return bool(
        user and (user.is_superuser or user.is_staff or getattr(user, "role", "") == "owner")
    )


class SubjectViewSet(viewsets.ModelViewSet):
    """Owner 전용 Subject CRUD (tenant scope)"""
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["created_at", "name"]

    def get_queryset(self):
        tenant = getattr(self.request.user, "tenant", None)
        logger.debug(f"[SubjectViewSet.get_queryset] user={self.request.user.email}, tenant={tenant}")
        if tenant:
            return Subject.objects.filter(tenant=tenant).order_by("-created_at")
        return Subject.objects.none()

    def perform_create(self, serializer):
        """Attach tenant automatically and log creation data"""
        user = self.request.user
        logger.debug(f"[SubjectViewSet.perform_create] user={user.email}, tenant={getattr(user, 'tenant', None)}")
        serializer.save(tenant=user.tenant)

    def create(self, request, *args, **kwargs):
        logger.info("[SubjectViewSet.create] Called from React UI")
        logger.debug(f"[SubjectViewSet.create] Incoming data: {request.data}")
        logger.debug(f"[SubjectViewSet.create] User info: email={request.user.email}, role={getattr(request.user, 'role', None)}, is_staff={request.user.is_staff}")

        if not is_owner_or_staff(request.user):
            logger.warning(f"[SubjectViewSet.create] Permission denied for user={request.user.email}")
            return Response(
                {"error": "Permission denied", "detail": "Only owner/staff can create subjects."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            response = super().create(request, *args, **kwargs)
            logger.info(f"[SubjectViewSet.create] Subject created successfully for tenant={getattr(request.user, 'tenant', None)}")
            return response
        except Exception as e:
            logger.exception(f"[SubjectViewSet.create] Failed to create subject: {e}")
            return Response(
                {"error": "Subject creation failed", "detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def update(self, request, *args, **kwargs):
        if not is_owner_or_staff(request.user):
            return Response(
                {"error": "Permission denied", "detail": "Only owner/staff can update subjects."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if not is_owner_or_staff(request.user):
            return Response(
                {"error": "Permission denied", "detail": "Only owner/staff can update subjects."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not is_owner_or_staff(request.user):
            return Response(
                {"error": "Permission denied", "detail": "Only owner/staff can delete subjects."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=["get"])
    def active(self, request):
        """GET /api/subjects/active/ - 활성화된 과목만"""
        qs = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)
