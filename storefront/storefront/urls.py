from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from core.views.user_views import UserViewSet, CustomTokenObtainPairView
from core.views.student_views import StudentViewSet
from core.views.course_views import CourseViewSet
from core.views.subject_views import SubjectViewSet
from core.views.teacher_views import TeacherViewSet

from core.views.enrollment_views import EnrollmentViewSet  # ← 추가

from core.views.essay_views import (
    get_dummy_essay_title,
    submit_essay,
    my_essays,
    essay_detail,
)

from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView


router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'students', StudentViewSet, basename='student')
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'teachers', TeacherViewSet, basename='teacher')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')  # ← NEW


urlpatterns = [
    path("admin/", admin.site.urls),

    # JWT
    path("api/token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/token/blacklist/", TokenBlacklistView.as_view(), name="token_blacklist"),

    # API
    path("api/", include(router.urls)),

    # Essay
    path("dummy-essay-title/", get_dummy_essay_title),
    path("submit-essay/", submit_essay),
    path("my-essays/", my_essays),
    path("essay/<int:essay_id>/", essay_detail),
]
