from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from core.models import Essay, Feedback, Student
from core.serializers import EssaySerializer, FeedbackSerializer
from core.utils import generate_dummy_title


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_dummy_essay_title(request):
    try:
        student = Student.objects.get(user=request.user)
    except Student.DoesNotExist:
        return Response({"error": "학생 계정이 아닙니다."}, status=400)

    dummy_title = generate_dummy_title(student.level)
    return Response({"title": dummy_title, "level": student.level})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_essay(request):
    try:
        student = Student.objects.get(user=request.user)
    except Student.DoesNotExist:
        return Response({"error": "학생 계정이 아닙니다."}, status=400)

    title = request.data.get("title")
    content = request.data.get("content")
    if not title or not content:
        return Response({"error": "title과 content는 필수입니다."}, status=400)

    essay = Essay.objects.create(
        tenant=student.tenant,
        student=student,
        title=title,
        content=content,
        status="submitted",
    )

    feedback = Feedback.objects.create(
        tenant=student.tenant,
        essay=essay,
        reviewer=None,
        corrected_text=None,
        score={"grammar": 70, "vocab": 65},
        comments=f"Good effort on '{title}'. Try to improve grammar and vocabulary."
    )

    return Response(
        {"essay": EssaySerializer(essay).data,
         "feedback": FeedbackSerializer(feedback).data},
        status=status.HTTP_201_CREATED
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_essays(request):
    student = Student.objects.filter(user=request.user).first()
    if not student:
        return Response({"error": "학생 계정이 아닙니다."}, status=400)

    essays = Essay.objects.filter(student=student).order_by("-created_at")
    return Response(EssaySerializer(essays, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def essay_detail(request, essay_id):
    student = Student.objects.filter(user=request.user).first()
    if not student:
        return Response({"error": "학생 계정이 아닙니다."}, status=400)

    essay = Essay.objects.filter(id=essay_id, student=student).first()
    if not essay:
        return Response({"error": "해당 에세이를 찾을 수 없습니다."}, status=404)

    essay_data = EssaySerializer(essay).data
    feedback = Feedback.objects.filter(essay=essay).first()
    if feedback:
        essay_data["feedback"] = FeedbackSerializer(feedback).data

    return Response(essay_data)
