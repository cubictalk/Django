from django.db import models

class Tenant(models.Model):
    """기관 (학원, 피트니스, 살롱 등)"""
    name = models.CharField(max_length=200)
    business_type = models.CharField(max_length=50)  # 'academy', 'salon', 'fitness'
    domain = models.CharField(max_length=150, unique=True, null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
