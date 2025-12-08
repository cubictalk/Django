from rest_framework import serializers
from core.models import Feedback

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = [
            "id",
            "essay",
            "reviewer",
            "corrected_text",
            "score",
            "comments",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
