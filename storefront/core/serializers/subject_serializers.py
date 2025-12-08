# core/serializers/subject_serializers.py
# ✅ created 2025-10-27
from rest_framework import serializers
from core.models.subject_models import Subject


class SubjectSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source="tenant.name", read_only=True)

    class Meta:
        model = Subject
        fields = [
            "id",
            "tenant",
            "tenant_name",
            "name",
            "description",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "tenant"]  # 👈 ADD tenant here

    def validate_name(self, value):
        """
        Prevent empty or overly short subject names.
        """
        if not value.strip():
            raise serializers.ValidationError("Subject name cannot be empty.")
        if len(value) < 2:
            raise serializers.ValidationError("Subject name must be at least 2 characters long.")
        return value

    def validate(self, attrs):
        """
        Ensure subject name is unique per tenant.
        """
        tenant = attrs.get("tenant") or getattr(self.instance, "tenant", None)
        name = attrs.get("name") or getattr(self.instance, "name", None)
        if tenant and name:
            exists = Subject.objects.filter(tenant=tenant, name__iexact=name).exclude(id=getattr(self.instance, "id", None)).exists()
            if exists:
                raise serializers.ValidationError({"name": "This subject name already exists for this tenant."})
        return attrs
