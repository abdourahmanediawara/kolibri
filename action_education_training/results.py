"""Coach-facing learner assessment results from real Kolibri logger models.

Reuses ContentSummaryLog / MasteryLog / AttemptLog — does not invent quiz scores
from progress alone.
"""
from django.db.models import Count
from django.db.models import Max
from django.db.models import Sum
from django.utils.dateparse import parse_datetime
from le_utils.constants import content_kinds
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from rest_framework.views import APIView

from action_education_training.constants import ENROLLMENT_ACTIVE
from action_education_training.models import Enrollment
from action_education_training.models import Training
from action_education_training.permissions import _is_facility_staff
from kolibri.core.auth.constants import role_kinds
from kolibri.core.auth.models import Classroom
from kolibri.core.auth.models import FacilityUser
from kolibri.core.content.models import ContentNode
from kolibri.core.logger.models import AttemptLog
from kolibri.core.logger.models import ContentSummaryLog
from kolibri.core.logger.models import MasteryLog


STATUS_NOT_STARTED = "not_started"
STATUS_STARTED = "started"
STATUS_COMPLETED = "completed"

STAFF_KINDS = (role_kinds.ADMIN, role_kinds.COACH, role_kinds.ASSIGNABLE_COACH)


class IsFacilityStaffOnly(BasePermission):
    """Coach/admin results — learners must not call this endpoint."""

    def has_permission(self, request, view):
        return _is_facility_staff(request.user)


def _staff_user_ids(facility_id):
    return set(
        FacilityUser.objects.filter(
            facility_id=facility_id,
            roles__kind__in=STAFF_KINDS,
        ).values_list("id", flat=True)
    )


def _learner_queryset(user, training_id=None, classroom_id=None, learner_id=None):
    facility_id = user.facility_id
    staff_ids = _staff_user_ids(facility_id)
    qs = FacilityUser.objects.filter(facility_id=facility_id).exclude(id__in=staff_ids)

    if training_id:
        enrolled = Enrollment.objects.filter(
            training_id=training_id,
            training__facility_id=facility_id,
            status=ENROLLMENT_ACTIVE,
        ).values_list("learner_id", flat=True)
        qs = qs.filter(id__in=enrolled)

    if classroom_id:
        try:
            classroom = Classroom.objects.get(id=classroom_id, parent_id=facility_id)
        except Classroom.DoesNotExist:
            return FacilityUser.objects.none()
        if not (
            user.is_superuser
            or user.has_role_for_collection(
                [role_kinds.ADMIN, role_kinds.COACH, role_kinds.ASSIGNABLE_COACH],
                classroom,
            )
            or user.has_role_for_collection(
                [role_kinds.ADMIN, role_kinds.COACH, role_kinds.ASSIGNABLE_COACH],
                user.facility,
            )
        ):
            return FacilityUser.objects.none()
        member_ids = classroom.get_members().values_list("id", flat=True)
        qs = qs.filter(id__in=member_ids)

    if learner_id:
        qs = qs.filter(id=learner_id)

    return qs.distinct()


def _exercise_nodes(channel_id=None, content_id=None):
    qs = ContentNode.objects.filter(available=True, kind=content_kinds.EXERCISE)
    if channel_id:
        qs = qs.filter(channel_id=channel_id)
    if content_id:
        qs = qs.filter(content_id=content_id)
    return qs.values("id", "content_id", "title", "channel_id", "kind", "parent_id")


def _status_from_progress(progress, has_summary):
    if not has_summary:
        return STATUS_NOT_STARTED
    if progress is not None and progress >= 1:
        return STATUS_COMPLETED
    return STATUS_STARTED


def _mastery_stats(learner_ids, content_ids):
    """Attempt totals and mastery_level per learner×content (no invented %)."""
    if not learner_ids or not content_ids:
        return {}

    try_counts = {
        (row["user_id"], row["summarylog__content_id"]): row["c"]
        for row in MasteryLog.objects.filter(
            user_id__in=learner_ids,
            summarylog__content_id__in=content_ids,
        )
        .values("user_id", "summarylog__content_id")
        .annotate(c=Count("id"))
    }

    mastery_levels = {
        (row["user_id"], row["summarylog__content_id"]): row["level"]
        for row in MasteryLog.objects.filter(
            user_id__in=learner_ids,
            summarylog__content_id__in=content_ids,
        )
        .values("user_id", "summarylog__content_id")
        .annotate(level=Max("mastery_level"))
    }

    attempt_sums = {
        (row["masterylog__user_id"], row["masterylog__summarylog__content_id"]): row
        for row in AttemptLog.objects.filter(
            masterylog__user_id__in=learner_ids,
            masterylog__summarylog__content_id__in=content_ids,
        )
        .values(
            "masterylog__user_id",
            "masterylog__summarylog__content_id",
        )
        .annotate(
            num_answered=Count("id"),
            num_correct=Sum("correct"),
            last_attempt=Max("end_timestamp"),
        )
    }

    out = {}
    for key in set(try_counts) | set(attempt_sums) | set(mastery_levels):
        attempts = attempt_sums.get(key)
        out[key] = {
            "tries": try_counts.get(key, 0),
            "mastery_level": mastery_levels.get(key),
            "num_answered": attempts["num_answered"] if attempts else None,
            "num_correct": (
                float(attempts["num_correct"])
                if attempts and attempts["num_correct"] is not None
                else None
            ),
            "last_attempt": attempts["last_attempt"] if attempts else None,
        }
    return out


class LearnerResultsView(APIView):
    """
    GET /action_education_training/api/learnerresults/

    Query params (all optional):
      training, learner, classroom, content_id, channel_id,
      start_date, end_date (ISO datetime — filter last_activity)
    """

    permission_classes = (IsFacilityStaffOnly,)

    def get(self, request):
        user = request.user
        training_id = request.query_params.get("training") or None
        learner_id = request.query_params.get("learner") or None
        classroom_id = request.query_params.get("classroom") or None
        content_id = request.query_params.get("content_id") or None
        channel_id = request.query_params.get("channel_id") or None
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")

        training = None
        if training_id:
            try:
                training = Training.objects.get(
                    id=training_id, facility_id=user.facility_id
                )
            except Training.DoesNotExist:
                return Response({"detail": "Training not found."}, status=404)
            if not channel_id and training.channel_id:
                channel_id = training.channel_id

        learners = list(
            _learner_queryset(
                user,
                training_id=training_id,
                classroom_id=classroom_id,
                learner_id=learner_id,
            ).values("id", "username", "full_name")
        )
        learner_ids = [learner["id"] for learner in learners]

        nodes = list(_exercise_nodes(channel_id=channel_id, content_id=content_id))
        content_map = {}
        for node in nodes:
            content_map.setdefault(
                node["content_id"],
                {
                    "content_id": node["content_id"],
                    "title": node["title"],
                    "kind": node["kind"],
                    "channel_id": node["channel_id"],
                    "node_id": node["id"],
                    "parent_id": node.get("parent_id"),
                },
            )
        contents = list(content_map.values())
        content_ids = list(content_map.keys())

        parent_ids = {c["parent_id"] for c in contents if c.get("parent_id")}
        parent_titles = {
            parent["id"]: parent["title"]
            for parent in ContentNode.objects.filter(id__in=parent_ids).values(
                "id", "title"
            )
        }
        for content in contents:
            pid = content.pop("parent_id", None)
            content["parent_title"] = parent_titles.get(pid) if pid else None

        logs = {}
        if learner_ids and content_ids:
            for row in ContentSummaryLog.objects.filter(
                user_id__in=learner_ids, content_id__in=content_ids
            ).values(
                "user_id",
                "content_id",
                "progress",
                "time_spent",
                "end_timestamp",
                "kind",
            ):
                logs[(row["user_id"], row["content_id"])] = row

        mastery = _mastery_stats(learner_ids, content_ids)

        start_dt = parse_datetime(start_date) if start_date else None
        end_dt = parse_datetime(end_date) if end_date else None

        results = []
        for learner in learners:
            for content in contents:
                key = (learner["id"], content["content_id"])
                log = logs.get(key)
                mastery_row = mastery.get(key, {})
                has_summary = log is not None
                progress = log["progress"] if log else None
                last_activity = log["end_timestamp"] if log else None
                if mastery_row.get("last_attempt") and (
                    last_activity is None
                    or mastery_row["last_attempt"] > last_activity
                ):
                    last_activity = mastery_row["last_attempt"]

                if start_dt and (last_activity is None or last_activity < start_dt):
                    continue
                if end_dt and (last_activity is None or last_activity > end_dt):
                    continue

                status = _status_from_progress(progress, has_summary)

                results.append(
                    {
                        "learner_id": learner["id"],
                        "learner_name": learner["full_name"] or learner["username"],
                        "learner_username": learner["username"],
                        "content_id": content["content_id"],
                        "content_title": content["title"],
                        "content_kind": content["kind"],
                        "result_type": "exercise",
                        "parent_title": content.get("parent_title"),
                        "channel_id": content["channel_id"],
                        "training_id": training.id if training else None,
                        "training_title": training.title if training else None,
                        "status": status,
                        "progress": progress,
                        "time_spent": log["time_spent"] if log else None,
                        "tries": mastery_row.get("tries")
                        or (1 if has_summary else 0),
                        "mastery_level": mastery_row.get("mastery_level"),
                        "num_correct": mastery_row.get("num_correct"),
                        "num_answered": mastery_row.get("num_answered"),
                        "last_activity": last_activity,
                        "score_available": mastery_row.get("num_answered") is not None,
                    }
                )

        return Response(
            {
                "learners": learners,
                "contents": contents,
                "results": results,
                "training": (
                    {
                        "id": training.id,
                        "title": training.title,
                        "channel_id": training.channel_id,
                    }
                    if training
                    else None
                ),
            }
        )
