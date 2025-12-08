# core/serializers/teacher_serializer.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from core.models import Teacher, Subject
from core.serializers.subject_serializers import SubjectSerializer
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class UserNestedSerializer(serializers.ModelSerializer):
    """Displayed nested user info when listing teachers."""
    class Meta:
        model = User
        fields = ["id", "full_name", "email"]


class TeacherRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for:
    - Creating teacher (POST)
    - Updating teacher (PATCH)
    - Returning teacher details (GET)
    """

    # Registration input fields
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField(write_only=True)

    # Support both single subject and multiple subject inputs
    subject = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
    )
    subject_ids = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(),
        many=True,
        write_only=True,
        required=False,
    )

    # Output
    user = UserNestedSerializer(read_only=True)
    subjects = SubjectSerializer(many=True, read_only=True)

    class Meta:
        model = Teacher
        fields = [
            "id",
            "email",
            "password",
            "full_name",
            "user",
            "subjects",
            "subject",
            "subject_ids",
        ]
        read_only_fields = ["id", "user"]

    # ────────────────────────────────────────────────────────────────
    # CREATE (POST)
    # ────────────────────────────────────────────────────────────────
    def create(self, validated_data):
        """
        Create Teacher + User account.
        Accepts:
        - subject: 3
        - subject_ids: [3,4]
        """
        request = self.context.get("request")
        tenant = request.user.tenant

        subject = validated_data.pop("subject", None)
        subject_ids = validated_data.pop("subject_ids", [])

        # Create linked User
        user = User.objects.create_user(
            tenant=tenant,
            email=validated_data["email"],
            password=validated_data["password"],
            full_name=validated_data["full_name"],
            role="teacher",
        )

        # Create teacher
        teacher = Teacher.objects.create(user=user, tenant=tenant)

        # Set subjects
        if subject is not None:
            teacher.subjects.set([subject])
        elif subject_ids:
            teacher.subjects.set(subject_ids)

        return teacher

    # ────────────────────────────────────────────────────────────────
    # UPDATE (PATCH)
    # ────────────────────────────────────────────────────────────────
    def update(self, instance, validated_data):
        """
        Update teacher and nested user info.
        Accepts:
        - PATCH {"user": {"full_name": "..."}}
        - PATCH {"subject": 5}
        - PATCH {"subject_ids": [5,6]}
        """
        logger.info(f"[TEACHER UPDATE] teacher_id={instance.id}")

        user = instance.user

        # Extract nested user fields from request
        user_data = self.initial_data.get("user", {})

        full_name = user_data.get("full_name") or validated_data.get("full_name")
        email = user_data.get("email") or validated_data.get("email")
        password = user_data.get("password") or validated_data.get("password")

        # Update user fields
        if full_name:
            user.full_name = full_name
        if email:
            user.email = email
        if password:
            user.set_password(password)
        user.save()

        # Handle subjects update
        subject = validated_data.get("subject", None)
        subject_ids = validated_data.get("subject_ids", None)

        if subject is not None:
            # Single subject case
            instance.subjects.set([subject])

        elif subject_ids is not None:
            # Multiple subjects case
            instance.subjects.set(subject_ids)

        instance.save()
        return instance
