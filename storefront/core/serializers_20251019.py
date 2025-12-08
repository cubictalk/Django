# core/serializers.py
# ================================================
# Updated: 2025-10-04
# 변경사항 요약:
# - FeedbackSerializer 구조 수정 (teacher_comment → reviewer 등 최신 모델 반영)
# - EssaySerializer read_only_fields 조정
# - 전체 import 정리
# ================================================

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import Student, Essay, Feedback

User = get_user_model()


# ----------------------------------------
# User Serializer
# ----------------------------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role"]


# ----------------------------------------
# Custom JWT Token Serializer
# ----------------------------------------
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["tenant_id"] = user.tenant.id if user.tenant else None
        token["full_name"] = user.full_name
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["role"] = self.user.role
        data["tenant_id"] = self.user.tenant.id if self.user.tenant else None
        data["full_name"] = self.user.full_name
        return data


# ----------------------------------------
# Student Registration Serializer
# ----------------------------------------
class StudentRegistrationSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField(write_only=True)

    class Meta:
        model = Student
        fields = ["id", "email", "password", "full_name"]

    def create(self, validated_data):
        tenant = self.context["request"].user.tenant  # Owner와 동일 tenant
        user = User.objects.create_user(
            tenant=tenant,
            email=validated_data["email"],
            password=validated_data["password"],
            full_name=validated_data["full_name"],
            role="student",
        )
        student = Student.objects.create(user=user, tenant=tenant)
        return student


# ----------------------------------------
# Essay Serializer
# ----------------------------------------
class EssaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Essay
        fields = ["id", "student", "title", "content", "status", "created_at"]
        read_only_fields = ["id", "created_at"]
        # ### [2025-10-04 변경됨]
        # student/status는 클라이언트가 지정할 수도 있도록 read_only_fields에서 제거됨


# ----------------------------------------
# Feedback Serializer
# ----------------------------------------
class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = [
            "id",
            "essay",
            "reviewer",          # ### [2025-10-04 변경됨]: teacher_comment → reviewer
            "corrected_text",    # ### [2025-10-04 추가됨]
            "score",             # {"grammar":80,"vocab":70}
            "comments",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
