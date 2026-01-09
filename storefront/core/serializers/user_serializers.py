from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    기본 User API serializer
    (프론트에서 사용자 정보 조회용)
    """
    class Meta:
        model = User
        fields = ["id", "email", "role"]  # username 안 쓰면 제거 권장


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    JWT 로그인 serializer
    - email 기반 로그인
    - 토큰 + response body에 사용자 정보 포함
    """

    username_field = "email"  # ✅ 명시 (Fly/Prod 안정성)

    @classmethod
    def get_token(cls, user):
        """
        Access / Refresh Token payload에 포함될 커스텀 클레임
        """
        token = super().get_token(user)
        token["role"] = user.role
        token["tenant_id"] = user.tenant.id if user.tenant else None
        token["full_name"] = user.full_name
        return token

    def validate(self, attrs):
        """
        로그인 성공 시 response body에 포함될 데이터
        """
        data = super().validate(attrs)
        data["role"] = self.user.role
        data["tenant_id"] = self.user.tenant.id if self.user.tenant else None
        data["full_name"] = self.user.full_name
        return data
