# ✅ 2025-10-22: Student 목록에서 user 정보 표시 가능하도록 수정
from rest_framework import serializers
from django.contrib.auth import get_user_model
from core.models import Student
import logging

logger = logging.getLogger(__name__)

User = get_user_model()


class UserNestedSerializer(serializers.ModelSerializer):
    """학생 목록 표시용 nested serializer"""
    class Meta:
        model = User
        fields = ["id", "full_name", "email"]


class StudentRegistrationSerializer(serializers.ModelSerializer):
    # 등록 시 필요한 필드
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField(write_only=True)

    # 조회 시 표시할 user 정보
    user = UserNestedSerializer(read_only=True)

    class Meta:
        model = Student
        fields = ["id", "email", "password", "full_name", "user"]

    def create(self, validated_data):
        """학생 등록 시 user도 함께 생성"""
        request = self.context.get("request")
        tenant = request.user.tenant

        user = User.objects.create_user(
            tenant=tenant,
            email=validated_data["email"],
            password=validated_data["password"],
            full_name=validated_data["full_name"],
            role="student",
        )
        return Student.objects.create(user=user, tenant=tenant)

    # ✅ 2025-11-06: Enhanced update() to support nested 'user' data + detailed logs
    def update(self, instance, validated_data):
        """✅ Update nested user info (full_name, email, password) with logging"""
        user = instance.user
        logger.info(f"[UPDATE] Called for student_id={instance.id}, user_id={user.id}")
        logger.info(f"[UPDATE] Incoming validated_data (raw): {validated_data}")

        # ✅ Extract 'user' nested data from raw request (fix for PATCH {'user': {...}})
        user_data = self.initial_data.get("user", {})
        logger.info(f"[UPDATE] Raw incoming user_data: {user_data}")

        # ✅ Merge both levels (validated + nested)
        full_name = user_data.get("full_name") or validated_data.get("full_name")
        email = user_data.get("email") or validated_data.get("email")
        password = user_data.get("password") or validated_data.get("password")

        # ✅ Apply updates
        if full_name:
            logger.info(f"[UPDATE] Changing full_name: {user.full_name} -> {full_name}")
            user.full_name = full_name
        if email:
            logger.info(f"[UPDATE] Changing email: {user.email} -> {email}")
            user.email = email
        if password:
            logger.info(f"[UPDATE] Changing password for {user.email}")
            user.set_password(password)

        user.save()
        instance.save()

        logger.info(f"[UPDATE] After save: user.full_name={user.full_name}, user.email={user.email}")
        return instance
