from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager,
)
from .tenant_models import Tenant


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, tenant=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")

        email = self.normalize_email(email)

        # ✅ MVP: tenant 자동 할당
        if tenant is None:
            tenant = Tenant.objects.first()
            if tenant is None:
                raise ValueError("At least one Tenant must exist")

        user = self.model(
            email=email,
            tenant=tenant,
            **extra_fields,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, tenant=None, **extra_fields):
        extra_fields.setdefault("role", "superadmin")
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, tenant, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name="users",
    )

    # ✅ 전역 unique
    email = models.EmailField(max_length=150, unique=True)

    full_name = models.CharField(max_length=200, null=True, blank=True)

    ROLE_CHOICES = [
        ("superadmin", "Super Admin"),
        ("owner", "Owner"),
        ("teacher", "Teacher"),
        ("student", "Student"),
        ("parent", "Parent"),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="student")

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []  # ✅ tenant 제거

    class Meta:
        db_table = "core_user"

    def __str__(self):
        return self.email
