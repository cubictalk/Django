from rest_framework import viewsets
from django.http import JsonResponse
from core.models import User
from core.serializers import UserSerializer, CustomTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


def user_list(request):
    users = list(User.objects.values())
    return JsonResponse(users, safe=False)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
