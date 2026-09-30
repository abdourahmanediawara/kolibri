"""
Quizzes of a course: mini quizzes along the way and a final exam.

Admins and the trainer the course is assigned to write the quizzes; learners
see the published quizzes of published courses, without the answer key, and
submit attempts that the server grades. Passing the final exam issues the
course certificate.
"""

from django.db import transaction
from django.db.models import Count
from django.db.models import Max
from rest_framework import serializers
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from action_education_training.constants import QUESTION_KIND_CHOICES
from action_education_training.constants import QUESTION_MULTIPLE
from action_education_training.constants import QUIZ_KIND_EXAM
from action_education_training.constants import STATUS_PUBLISHED
from action_education_training.models import Quiz
from action_education_training.models import QuizAttempt
from action_education_training.models import QuizChoice
from action_education_training.models import QuizQuestion
from action_education_training.models import Training
from action_education_training.permissions import _is_facility_staff
from action_education_training.permissions import can_manage_training_content
from action_education_training.permissions import IsFacilityStaffOrReadOwn
from action_education_training.reports import issue_certificate
from kolibri.core.api import ReadOnlyValuesViewset
from kolibri.core.api import ValuesViewset

MAX_QUESTIONS = 100
MAX_CHOICES = 10
QUESTION_KINDS = {kind for kind, _label in QUESTION_KIND_CHOICES}


class QuizChoiceInputSerializer(serializers.Serializer):
    text = serializers.CharField(max_length=500, trim_whitespace=True)
    is_correct = serializers.BooleanField(default=False)


class QuizQuestionInputSerializer(serializers.Serializer):
    prompt = serializers.CharField(max_length=2000, trim_whitespace=True)
    kind = serializers.ChoiceField(choices=sorted(QUESTION_KINDS))
    points = serializers.IntegerField(min_value=1, max_value=100, default=1)
    explanation = serializers.CharField(
        max_length=2000, allow_blank=True, required=False, default=""
    )
    choices = QuizChoiceInputSerializer(many=True)

    def validate(self, data):
        choices = data["choices"]
        if not 2 <= len(choices) <= MAX_CHOICES:
            raise serializers.ValidationError("A question needs 2 to 10 answers.")
        correct = sum(1 for choice in choices if choice["is_correct"])
        if data["kind"] == QUESTION_MULTIPLE:
            if correct < 1:
                raise serializers.ValidationError("Tick at least one right answer.")
        elif correct != 1:
            raise serializers.ValidationError("Tick exactly one right answer.")
        return data


class QuizSerializer(serializers.ModelSerializer):
    questions = QuizQuestionInputSerializer(many=True, write_only=True, required=False)

    class Meta:
        model = Quiz
        fields = (
            "id",
            "training",
            "title",
            "description",
            "kind",
            "status",
            "pass_percent",
            "max_attempts",
            "show_answers",
            "sort_order",
            "questions",
        )
        read_only_fields = ("id",)

    def validate_pass_percent(self, value):
        if value > 100:
            raise serializers.ValidationError("Between 0 and 100.")
        return value

    def validate_questions(self, value):
        if len(value) > MAX_QUESTIONS:
            raise serializers.ValidationError("Too many questions.")
        return value

    def validate(self, data):
        # A published quiz must have questions to answer.
        status_value = data.get("status", getattr(self.instance, "status", None))
        if status_value == STATUS_PUBLISHED:
            if "questions" in data:
                has_questions = bool(data["questions"])
            else:
                has_questions = bool(self.instance and self.instance.questions.exists())
            if not has_questions:
                raise serializers.ValidationError(
                    {"status": ["Add questions before publishing."]}
                )
        return data

    def _save_questions(self, quiz, questions):
        quiz.questions.all().delete()
        for question_order, question_data in enumerate(questions):
            question = QuizQuestion.objects.create(
                quiz=quiz,
                prompt=question_data["prompt"],
                kind=question_data["kind"],
                points=question_data["points"],
                explanation=question_data.get("explanation", ""),
                sort_order=question_order,
            )
            QuizChoice.objects.bulk_create(
                QuizChoice(
                    question=question,
                    text=choice["text"],
                    is_correct=choice["is_correct"],
                    sort_order=choice_order,
                )
                for choice_order, choice in enumerate(question_data["choices"])
            )

    @transaction.atomic
    def create(self, validated_data):
        questions = validated_data.pop("questions", [])
        quiz = super().create(validated_data)
        self._save_questions(quiz, questions)
        return quiz

    @transaction.atomic
    def update(self, instance, validated_data):
        questions = validated_data.pop("questions", None)
        quiz = super().update(instance, validated_data)
        if questions is not None:
            self._save_questions(quiz, questions)
        return quiz


def _quizzes_for_user(user):
    qs = Quiz.objects.select_related("training").filter(
        training__facility_id=user.facility_id
    )
    if _is_facility_staff(user):
        return qs
    return qs.filter(status=STATUS_PUBLISHED, training__status=STATUS_PUBLISHED)


def grade_attempt(quiz, answers):
    """
    Grade {question_id: [choice_id, …]} against the answer key.
    A question scores its points when exactly the right answers are ticked.
    """
    score = 0
    max_score = 0
    results = []
    questions = quiz.questions.prefetch_related("choices")
    for question in questions:
        max_score += question.points
        right = {choice.id for choice in question.choices.all() if choice.is_correct}
        raw = answers.get(question.id) or []
        selected = {str(choice_id) for choice_id in raw} if isinstance(raw, list) else set()
        correct = selected == right
        if correct:
            score += question.points
        results.append(
            {
                "question": question.id,
                "selected": sorted(selected),
                "correct": correct,
                "right_choices": sorted(right),
                "explanation": question.explanation,
            }
        )
    percent = round(score * 100 / max_score) if max_score else 0
    return score, max_score, percent, results


class QuizViewSet(ValuesViewset):
    permission_classes = (IsFacilityStaffOrReadOwn,)
    serializer_class = QuizSerializer
    values = (
        "id",
        "training_id",
        "title",
        "description",
        "kind",
        "status",
        "pass_percent",
        "max_attempts",
        "show_answers",
        "sort_order",
        "date_created",
        "date_updated",
    )
    field_map = {"training": "training_id"}

    def get_queryset(self):
        qs = _quizzes_for_user(self.request.user)
        training_id = self.request.query_params.get("training")
        if training_id:
            qs = qs.filter(training_id=training_id)
        return qs

    def consolidate(self, items, queryset):
        """Adds the questions; the answer key only for those who manage the course."""
        if not items:
            return items
        user = self.request.user
        quiz_ids = [item["id"] for item in items]
        trainings = {
            training.id: training
            for training in Training.objects.filter(
                id__in={item["training"] for item in items}
            )
        }
        questions = {}
        for question in (
            QuizQuestion.objects.filter(quiz_id__in=quiz_ids)
            .prefetch_related("choices")
            .order_by("sort_order")
        ):
            questions.setdefault(question.quiz_id, []).append(question)

        attempts = {
            row["quiz_id"]: row
            for row in QuizAttempt.objects.filter(quiz_id__in=quiz_ids, learner=user)
            .values("quiz_id")
            .annotate(count=Count("id"), best=Max("percent"))
        }
        passed = set(
            QuizAttempt.objects.filter(
                quiz_id__in=quiz_ids, learner=user, passed=True
            ).values_list("quiz_id", flat=True)
        )

        for item in items:
            manager = can_manage_training_content(user, trainings.get(item["training"]))
            item_questions = questions.get(item["id"], [])
            item["question_count"] = len(item_questions)
            item["total_points"] = sum(question.points for question in item_questions)
            item["questions"] = [
                {
                    "id": question.id,
                    "prompt": question.prompt,
                    "kind": question.kind,
                    "points": question.points,
                    "explanation": question.explanation if manager else "",
                    "choices": [
                        {
                            "id": choice.id,
                            "text": choice.text,
                            **({"is_correct": choice.is_correct} if manager else {}),
                        }
                        for choice in question.choices.all()
                    ],
                }
                for question in item_questions
            ]
            mine = attempts.get(item["id"])
            item["can_manage"] = manager
            item["my_attempts"] = mine["count"] if mine else 0
            item["my_best_percent"] = mine["best"] if mine else None
            item["my_passed"] = item["id"] in passed
        return items

    def _check_manage(self, training):
        if not can_manage_training_content(self.request.user, training):
            raise PermissionDenied("Only admins and the course trainer write its quizzes.")

    def perform_create(self, serializer):
        training = serializer.validated_data["training"]
        if training.facility_id != self.request.user.facility_id:
            raise PermissionDenied("Course of another facility.")
        self._check_manage(training)
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        self._check_manage(serializer.instance.training)
        new_training = serializer.validated_data.get("training")
        if new_training and new_training.id != serializer.instance.training_id:
            raise PermissionDenied("A quiz stays in its course.")
        serializer.save()

    def perform_destroy(self, instance):
        self._check_manage(instance.training)
        instance.delete()

    @action(detail=True, methods=["post"], permission_classes=(IsAuthenticated,))
    def submit(self, request, pk=None):
        quiz = self.get_object()
        answers = request.data.get("answers")
        if not isinstance(answers, dict):
            return Response(
                [{"id": "INVALID_ANSWERS", "metadata": {"field": "answers"}}],
                status=status.HTTP_400_BAD_REQUEST,
            )
        previous = QuizAttempt.objects.filter(quiz=quiz, learner=request.user).count()
        if quiz.max_attempts and previous >= quiz.max_attempts:
            return Response(
                [{"id": "NO_ATTEMPTS_LEFT", "metadata": {"max_attempts": quiz.max_attempts}}],
                status=status.HTTP_400_BAD_REQUEST,
            )

        score, max_score, percent, results = grade_attempt(quiz, answers)
        passed = percent >= quiz.pass_percent
        attempt = QuizAttempt.objects.create(
            quiz=quiz,
            learner=request.user,
            answers={
                result["question"]: result["selected"] for result in results
            },
            score=score,
            max_score=max_score,
            percent=percent,
            passed=passed,
        )

        certificate = None
        if quiz.kind == QUIZ_KIND_EXAM and passed:
            certificate, _created = issue_certificate(
                request.user,
                quiz.training,
                criteria_met=f"Examen final réussi ({percent} %).",
            )

        if not quiz.show_answers:
            results = [
                {"question": result["question"], "correct": result["correct"]}
                for result in results
            ]
        attempts_used = previous + 1
        return Response(
            {
                "id": attempt.id,
                "score": score,
                "max_score": max_score,
                "percent": percent,
                "passed": passed,
                "results": results,
                "attempts_left": (
                    max(quiz.max_attempts - attempts_used, 0) if quiz.max_attempts else None
                ),
                "certificate_number": certificate.certificate_number if certificate else None,
            },
            status=status.HTTP_201_CREATED,
        )


class QuizAttemptViewSet(ReadOnlyValuesViewset):
    """Attempts: learners see theirs, staff those of their facility."""

    permission_classes = (IsFacilityStaffOrReadOwn,)
    values = (
        "id",
        "quiz_id",
        "quiz__training_id",
        "learner_id",
        "score",
        "max_score",
        "percent",
        "passed",
        "date_submitted",
    )
    field_map = {
        "quiz": "quiz_id",
        "training": "quiz__training_id",
        "learner": "learner_id",
    }

    def get_queryset(self):
        user = self.request.user
        qs = QuizAttempt.objects.filter(quiz__training__facility_id=user.facility_id)
        if not _is_facility_staff(user):
            qs = qs.filter(learner=user)
        params = self.request.query_params
        for param, field in (
            ("quiz", "quiz_id"),
            ("training", "quiz__training_id"),
            ("learner", "learner_id"),
        ):
            if params.get(param):
                qs = qs.filter(**{field: params[param]})
        return qs.order_by("-date_submitted")
