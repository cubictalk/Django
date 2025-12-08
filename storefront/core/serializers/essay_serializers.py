from rest_framework import serializers
from core.models import Essay

class EssaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Essay
        fields = ["id", "student", "title", "content", "status", "created_at"]
        read_only_fields = ["id", "created_at"]
