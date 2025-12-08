from django.db import models
from django.conf import settings
from .tenant_models import Tenant
from .essay_models import Essay


class Feedback(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="feedbacks")
    essay = models.ForeignKey(Essay, on_delete=models.CASCADE, related_name="feedbacks")
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviews"
    )
    corrected_text = models.TextField(null=True, blank=True)
    score = models.JSONField(default=dict, blank=True)
    comments = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        reviewer = self.reviewer.full_name if self.reviewer else "AI"
        return f"Feedback for {self.essay.title} by {reviewer}"
