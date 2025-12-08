from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.conf import settings

# 1) tenants
class Tenant(models.Model):
    name = models.CharField(max_length=200)
    business_type = models.CharField(max_length=50)  # 'academy', 'salon', 'fitness'
    domain = models.CharField(max_length=150, unique=True, null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# 2) users
class UserManager(BaseUserManager):
    def create_user(self, tenant, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        user = self.model(tenant=tenant, email=email, **extra_fields)
        user.set_password(password)  # 비밀번호 해시 저장
        user.save(using=self._db)
        return user

    def create_superuser(self, tenant, email, password=None, **extra_fields):
        extra_fields.setdefault("role", "superadmin")
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(tenant, email, password, **extra_fields)


# 실제 사용자 테이블 (AUTH_USER_MODEL)
class User(AbstractBaseUser, PermissionsMixin):            
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="users")
    email = models.EmailField(max_length=150, unique=True)
    password = models.CharField(max_length=200)  # Django Auth 적용 시 해싱됨
    full_name = models.CharField(max_length=200, null=True, blank=True)
    
    ROLE_CHOICES = [
        ("superadmin", "Super Admin"),
        ("owner", "Owner"),
        ("teacher", "Teacher"),
        ("student", "Student"),
        ("parent", "Parent"),
    ]
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="student",
    )
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)  # admin site 접근 여부
    created_at = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["tenant"]

    class Meta:
        db_table = "core_user"
        constraints = [
            models.UniqueConstraint(fields=["tenant", "email"], name="unique_tenant_email")
        ]

    def __str__(self):
        return f"{self.full_name} ({self.email})"


# 3) parent_student (N:M 관계)
class ParentStudent(models.Model):
    parent = models.ForeignKey(User, on_delete=models.CASCADE, related_name="children")
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="parents")

    class Meta:
        unique_together = ("parent", "student")


# ==============================
# 4) 학원 관리 도메인 모델
# ==============================

class Subject(models.Model):
    """과목 (영어, 수학, 과학 등)"""
    name = models.CharField(max_length=100)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.name} ({self.tenant.name})"


class Teacher(models.Model):
    """교사"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    subjects = models.ManyToManyField(Subject, related_name="teachers")  # 교사 ↔ 과목 (M:N)

    def __str__(self):
        return f"{self.user.full_name} ({self.tenant.name})"


class Student(models.Model):
    """학생"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)

    ### 추가됨: 학습 레벨 (Phase1 요구사항)
    LEVEL_CHOICES = [
        ("beginner", "Beginner"),
        ("intermediate", "Intermediate"),
        ("advanced", "Advanced"),
    ]
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default="beginner")  # ### 추가됨

    def __str__(self):
        return f"{self.user.full_name} ({self.tenant.name})"


class ClassGroup(models.Model):
    """반 / 그룹"""
    name = models.CharField(max_length=100)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    students = models.ManyToManyField(Student, through="Enrollment")

    def __str__(self):
        return f"{self.name} - {self.subject.name} ({self.tenant.name})"


class Enrollment(models.Model):
    """학생 ↔ 반 매핑"""
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    class_group = models.ForeignKey(ClassGroup, on_delete=models.CASCADE)
    date_joined = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ("student", "class_group")

    def __str__(self):
        return f"{self.student.user.full_name} in {self.class_group.name}"


# 5) essays
class Essay(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="essays")
    student = models.ForeignKey("Student", on_delete=models.CASCADE, related_name="essays")
    title = models.CharField(max_length=250, null=True, blank=True)
    content = models.TextField()
    
    ### 변경됨: 상태 흐름 Phase1 정의
    STATUS_CHOICES = [
        ("assigned", "Assigned"),   # ### 추가됨
        ("submitted", "Submitted"),
        ("reviewed", "Reviewed"),
    ]
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="assigned")  # ### 변경됨
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
       return f"{self.student.user.username} - {self.title} ({self.status})"


# 6) feedbacks
class Feedback(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="feedbacks")
    essay = models.ForeignKey(Essay, on_delete=models.CASCADE, related_name="feedbacks")
    reviewer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="reviews")  
    corrected_text = models.TextField(null=True, blank=True)
    score = models.JSONField(default=dict, blank=True)  # {"grammar":80,"vocab":70}
    comments = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


# 7) subscriptions
class Subscription(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="subscriptions")
    plan = models.CharField(max_length=50)
    status = models.CharField(max_length=30, default="active")
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
