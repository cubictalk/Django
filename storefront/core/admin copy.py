
# Register your from django.contrib import admin
from django.contrib import admin
from .models import Tenant, User, ParentStudent, Essay, Feedback, Subscription

admin.site.register(Tenant)
admin.site.register(User)
admin.site.register(ParentStudent)
admin.site.register(Essay)
admin.site.register(Feedback)
admin.site.register(Subscription)

