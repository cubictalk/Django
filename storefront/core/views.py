from django.shortcuts import render
from django.http import JsonResponse
# core/views.py
from rest_framework import viewsets
from .models import User
from .serializers import UserSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer
#student 
from rest_framework.permissions import IsAuthenticated
from .serializers import StudentRegistrationSerializer
from .models import Student
from .utils import generate_dummy_title
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
# core/views.py 맨 위 import 부분에 추가
from .models import Essay, Feedback
from .serializers import EssaySerializer, FeedbackSerializer
from rest_framework import status


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

def user_list(request):
    users = list(User.objects.values())
    return JsonResponse(users, safe=False)


# Create your views here.
# core/views.py
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentRegistrationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Owner의 tenant만 필터
        tenant = self.request.user.tenant
        return Student.objects.filter(tenant=tenant)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_dummy_essay_title(request):
    """로그인한 학생의 레벨에 맞는 더미 에세이 타이틀 반환"""
    try:
        student = Student.objects.get(user=request.user)
    except Student.DoesNotExist:
        return Response({"error": "학생 계정이 아닙니다."}, status=400)

    dummy_title = generate_dummy_title(student.level)
    return Response({"title": dummy_title, "level": student.level})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_essay(request):
    """
    학생이 작성한 에세이를 저장하고,
    dummy feedback(임시 AI 피드백)을 DB에 생성 후 같이 반환한다.
    """
    try:
        student = Student.objects.get(user=request.user)
    except Student.DoesNotExist:
        return Response({"error": "학생 계정이 아닙니다."}, status=400)

    # 요청 데이터에서 title, content 가져오기
    title = request.data.get("title")
    content = request.data.get("content")

    if not title or not content:
        return Response({"error": "title과 content는 필수입니다."}, status=400)

    # 1) Essay 저장
    essay = Essay.objects.create(
        tenant=student.tenant,
        student=student,
        title=title,
        content=content,
        status="submitted",
    )

    # 2) Dummy feedback 생성 (나중에 AI 피드백으로 대체)
    dummy_ai_comment = f"Good effort on '{title}'. Try to improve grammar and vocabulary."
    feedback = Feedback.objects.create(
        tenant=student.tenant,   # Feedback 모델 요구
        essay=essay,
        reviewer=None,           # 처음엔 교사 없음
        corrected_text=None,
        score={"grammar": 70, "vocab": 65},  # 더미 점수
        comments=dummy_ai_comment
    )

    # 3) serializer 로 응답 반환
    essay_data = EssaySerializer(essay).data
    feedback_data = FeedbackSerializer(feedback).data

    return Response(
        {"essay": essay_data, "feedback": feedback_data},
        status=status.HTTP_201_CREATED
    )


# ==============================================
# core/views.py
# Last updated: 2025-10-04
# 신규 추가: Essay 목록 조회 + 상세보기 API
# ==============================================

# 🆕 [NEW - 2025-10-04]
# ✅ 학생 본인의 에세이 목록 조회
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_essays(request):
    """
    로그인한 학생의 에세이 목록 반환
    """
    try:
        student = Student.objects.get(user=request.user)
    except Student.DoesNotExist:
        return Response({"error": "학생 계정이 아닙니다."}, status=400)

    essays = Essay.objects.filter(student=student).order_by("-created_at")
    serializer = EssaySerializer(essays, many=True)
    return Response(serializer.data)


# 🆕 [NEW - 2025-10-04]
# ✅ 개별 에세이 상세 + 피드백 조회
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def essay_detail(request, essay_id):
    """
    특정 에세이의 상세 내용 및 피드백 반환
    """
    try:
        student = Student.objects.get(user=request.user)
    except Student.DoesNotExist:
        return Response({"error": "학생 계정이 아닙니다."}, status=400)

    try:
        essay = Essay.objects.get(id=essay_id, student=student)
    except Essay.DoesNotExist:
        return Response({"error": "해당 에세이를 찾을 수 없습니다."}, status=404)

    essay_data = EssaySerializer(essay).data
    feedback = Feedback.objects.filter(essay=essay).first()
    if feedback:
        essay_data["feedback"] = FeedbackSerializer(feedback).data

    return Response(essay_data, status=200)

