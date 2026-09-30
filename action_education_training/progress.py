"""
Course progress, computed from what learners did (never stored):
supports opened, mini quizzes passed, final exam passed.

- The trainer of a course and the admins follow each of its learners.
- Admins get an overview of every course, trainers of their own courses.
- Learners follow their own courses.
"""

from django.db.models import Max
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from action_education_training.constants import QUIZ_KIND_EXAM
from action_education_training.constants import STATUS_PUBLISHED
from action_education_training.models import Certificate
from action_education_training.models import Enrollment
from action_education_training.models import Quiz
from action_education_training.models import QuizAttempt
from action_education_training.models import ResourceView
from action_education_training.models import Training
from action_education_training.permissions import _is_facility_admin
from action_education_training.permissions import _is_facility_staff
from action_education_training.permissions import can_manage_training_content
from kolibri.core.auth.models import FacilityUser


def _latest(*dates):
    known = [date for date in dates if date]
    return max(known) if known else None


class CourseProgress:
    """What a course asks of its learners, and what each of them has done."""

    def __init__(self, training):
        self.training = training
        self.resource_ids = set(training.resources.values_list("id", flat=True))
        published = Quiz.objects.filter(training=training, status=STATUS_PUBLISHED)
        self.quiz_ids = set(published.exclude(kind=QUIZ_KIND_EXAM).values_list("id", flat=True))
        self.exam_ids = set(published.filter(kind=QUIZ_KIND_EXAM).values_list("id", flat=True))

    @property
    def steps_total(self):
        return len(self.resource_ids) + len(self.quiz_ids) + (1 if self.exam_ids else 0)

    def for_learners(self, learner_ids):
        learner_ids = list(learner_ids)
        views = {}
        for row in ResourceView.objects.filter(
            resource_id__in=self.resource_ids, learner_id__in=learner_ids
        ).values("learner_id", "resource_id", "last_viewed"):
            views.setdefault(row["learner_id"], []).append(row)

        quiz_ids = self.quiz_ids | self.exam_ids
        attempts = {}
        for row in (
            QuizAttempt.objects.filter(quiz_id__in=quiz_ids, learner_id__in=learner_ids)
            .values("learner_id", "quiz_id")
            .annotate(best=Max("percent"), last=Max("date_submitted"))
        ):
            attempts.setdefault(row["learner_id"], {})[row["quiz_id"]] = row
        passed = {}
        for learner_id, quiz_id in QuizAttempt.objects.filter(
            quiz_id__in=quiz_ids, learner_id__in=learner_ids, passed=True
        ).values_list("learner_id", "quiz_id"):
            passed.setdefault(learner_id, set()).add(quiz_id)

        return {
            learner_id: self._entry(
                views.get(learner_id, []),
                attempts.get(learner_id, {}),
                passed.get(learner_id, set()),
            )
            for learner_id in learner_ids
        }

    def _entry(self, views, attempts, passed):
        exam_best = max(
            (attempts[quiz_id]["best"] for quiz_id in self.exam_ids if quiz_id in attempts),
            default=None,
        )
        exam_passed = bool(self.exam_ids & passed)
        quizzes_passed = len(self.quiz_ids & passed)
        done = len(views) + quizzes_passed + (1 if exam_passed else 0)
        total = self.steps_total
        last_activity = _latest(
            *(view["last_viewed"] for view in views),
            *(row["last"] for row in attempts.values()),
        )
        return {
            "resources_viewed": len(views),
            "resources_total": len(self.resource_ids),
            "quizzes_passed": quizzes_passed,
            "quizzes_total": len(self.quiz_ids),
            "has_exam": bool(self.exam_ids),
            "exam_best_percent": exam_best,
            "exam_passed": exam_passed,
            "percent": round(done * 100 / total) if total else 0,
            "completed": bool(total) and done == total,
            "last_activity": last_activity,
        }


def _active_learner_ids(training):
    """Enrolled learners, and those who already opened or tried something."""
    ids = set(
        Enrollment.objects.filter(training=training).values_list("learner_id", flat=True)
    )
    ids |= set(
        ResourceView.objects.filter(resource__training=training).values_list(
            "learner_id", flat=True
        )
    )
    ids |= set(
        QuizAttempt.objects.filter(quiz__training=training).values_list(
            "learner_id", flat=True
        )
    )
    return ids


class CourseProgressView(APIView):
    """GET progress/course/<training_id>/: each learner of one course."""

    permission_classes = (IsAuthenticated,)

    def get(self, request, training_id):
        training = Training.objects.filter(
            id=training_id, facility_id=request.user.facility_id
        ).first()
        if training is None:
            return Response([{"id": "NOT_FOUND"}], status=status.HTTP_404_NOT_FOUND)
        if not can_manage_training_content(request.user, training):
            return Response(
                [{"id": "PERMISSION_DENIED", "metadata": {"view": "AE Course progress"}}],
                status=status.HTTP_403_FORBIDDEN,
            )
        learner_ids = _active_learner_ids(training)
        progress = CourseProgress(training).for_learners(learner_ids)
        certified = set(
            Certificate.objects.filter(training=training).values_list("learner_id", flat=True)
        )
        learners = FacilityUser.objects.filter(id__in=learner_ids).values(
            "id", "full_name", "username"
        )
        rows = [
            {
                "learner": learner["id"],
                "full_name": learner["full_name"] or learner["username"],
                "username": learner["username"],
                "certified": learner["id"] in certified,
                **progress[learner["id"]],
            }
            for learner in learners
        ]
        rows.sort(key=lambda row: row["full_name"].lower())
        return Response(rows)


class ProgressOverviewView(APIView):
    """
    GET progress/overview/: how each course is going.
    Admins see every course, trainers the courses assigned to them.
    """

    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user
        trainings = Training.objects.filter(facility_id=user.facility_id)
        if not _is_facility_admin(user):
            if not _is_facility_staff(user):
                return Response(
                    [{"id": "PERMISSION_DENIED", "metadata": {"view": "AE Progress overview"}}],
                    status=status.HTTP_403_FORBIDDEN,
                )
            trainings = trainings.filter(responsible=user)
        rows = []
        for training in trainings:
            learner_ids = _active_learner_ids(training)
            progress = CourseProgress(training).for_learners(learner_ids).values()
            count = len(learner_ids)
            rows.append(
                {
                    "training": training.id,
                    "title": training.title,
                    "responsible": training.responsible_id,
                    "status": training.status,
                    "learners": count,
                    "completed": sum(1 for entry in progress if entry["completed"]),
                    "average_percent": (
                        round(sum(entry["percent"] for entry in progress) / count)
                        if count
                        else 0
                    ),
                }
            )
        rows.sort(key=lambda row: row["title"].lower())
        return Response(rows)


class MyProgressView(APIView):
    """GET progress/me/: the courses a learner started or joined."""

    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user
        trainings = Training.objects.filter(
            facility_id=user.facility_id, status=STATUS_PUBLISHED
        )
        enrolled = set(
            Enrollment.objects.filter(learner=user).values_list("training_id", flat=True)
        )
        certificates = dict(
            Certificate.objects.filter(learner=user).values_list(
                "training_id", "certificate_number"
            )
        )
        rows = []
        for training in trainings:
            entry = CourseProgress(training).for_learners([user.id])[user.id]
            started = training.id in enrolled or entry["last_activity"] is not None
            rows.append(
                {
                    "training": training.id,
                    "enrolled": training.id in enrolled,
                    "started": started,
                    "certificate_number": certificates.get(training.id),
                    **entry,
                }
            )
        return Response(rows)
