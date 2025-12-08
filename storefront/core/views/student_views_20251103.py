from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from core.models import Student
from core.serializers import StudentRegistrationSerializer


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentRegistrationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        tenant = self.request.user.tenant
        return Student.objects.filter(tenant=tenant)
