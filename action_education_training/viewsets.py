from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from action_education_training.constants import STATUS_PUBLISHED
from action_education_training.models import Attendance
from action_education_training.models import Certificate
from action_education_training.models import Enrollment
from action_education_training.models import Training
from action_education_training.models import TrainingSession
from action_education_training.permissions import _is_facility_admin
from action_education_training.permissions import _is_facility_staff
from action_education_training.permissions import IsFacilityStaffOrReadOwn
from action_education_training.serializers import AttendanceSerializer
from action_education_training.serializers import CertificateSerializer
from action_education_training.serializers import EnrollmentSerializer
from action_education_training.serializers import TrainingSerializer
from action_education_training.serializers import TrainingSessionSerializer
from kolibri.core.api import ValuesViewset


def _person_name(full_name, username):
    return full_name or username or ""


class TrainingViewSet(ValuesViewset):
    permission_classes = (IsFacilityStaffOrReadOwn,)
    serializer_class = TrainingSerializer
    values = (
        "id",
        "title",
        "description",
        "facility_id",
        "channel_id",
        "status",
        "start_date",
        "end_date",
        "responsible_id",
        "responsible__full_name",
        "responsible__username",
        "date_created",
        "date_updated",
    )
    field_map = {
        "facility": "facility_id",
        "responsible": "responsible_id",
        "responsible_name": lambda item: _person_name(
            item.pop("responsible__full_name"), item.pop("responsible__username")
        ),
    }

    def get_queryset(self):
        user = self.request.user
        qs = Training.objects.all()
        responsible = self.request.query_params.get("responsible")
        if responsible:
            qs = qs.filter(responsible_id=responsible)
        if _is_facility_staff(user):
            return qs.filter(facility_id=user.facility_id)
        return qs.filter(facility_id=user.facility_id, status=STATUS_PUBLISHED)

    # Admins create the courses and assign them to a trainer.
    def _require_admin(self):
        if not _is_facility_admin(self.request.user):
            raise PermissionDenied("Only facility admins manage courses.")

    def perform_create(self, serializer):
        self._require_admin()
        serializer.save(facility=self.request.user.facility)

    def perform_update(self, serializer):
        self._require_admin()
        serializer.save(facility=serializer.instance.facility)

    def perform_destroy(self, instance):
        self._require_admin()
        instance.delete()

    # Any signed-in user of the facility; the queryset only offers published courses to learners.
    @action(detail=True, methods=["post"], permission_classes=(IsAuthenticated,))
    def start(self, request, pk=None):
        """A learner starts a published course: they join its learners."""
        training = self.get_object()
        enrollment, created = Enrollment.objects.get_or_create(
            training=training, learner=request.user
        )
        return Response(
            EnrollmentSerializer(enrollment).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class TrainingSessionViewSet(ValuesViewset):
    permission_classes = (IsFacilityStaffOrReadOwn,)
    serializer_class = TrainingSessionSerializer
    values = (
        "id",
        "training_id",
        "start_datetime",
        "end_datetime",
        "location",
        "trainer_id",
        "status",
        "notes",
        "date_created",
        "date_updated",
    )
    field_map = {
        "training": "training_id",
        "trainer": "trainer_id",
    }

    def get_queryset(self):
        user = self.request.user
        qs = TrainingSession.objects.select_related("training")
        if _is_facility_staff(user):
            return qs.filter(training__facility_id=user.facility_id)
        return qs.filter(
            training__facility_id=user.facility_id,
            training__status=STATUS_PUBLISHED,
        )


class EnrollmentViewSet(ValuesViewset):
    permission_classes = (IsFacilityStaffOrReadOwn,)
    serializer_class = EnrollmentSerializer
    values = (
        "id",
        "training_id",
        "session_id",
        "learner_id",
        "date_enrolled",
        "status",
    )
    field_map = {
        "training": "training_id",
        "session": "session_id",
        "learner": "learner_id",
    }

    def get_queryset(self):
        user = self.request.user
        qs = Enrollment.objects.all()
        if _is_facility_staff(user):
            return qs.filter(training__facility_id=user.facility_id)
        return qs.filter(learner_id=user.id)


class AttendanceViewSet(ValuesViewset):
    permission_classes = (IsFacilityStaffOrReadOwn,)
    serializer_class = AttendanceSerializer
    values = (
        "id",
        "session_id",
        "learner_id",
        "status",
        "recorded_by_id",
        "date_recorded",
        "date_updated",
        "comment",
    )
    field_map = {
        "session": "session_id",
        "learner": "learner_id",
        "recorded_by": "recorded_by_id",
    }

    def get_queryset(self):
        user = self.request.user
        qs = Attendance.objects.all()
        if _is_facility_staff(user):
            return qs.filter(session__training__facility_id=user.facility_id)
        return qs.filter(learner_id=user.id)


class CertificateViewSet(ValuesViewset):
    permission_classes = (IsFacilityStaffOrReadOwn,)
    serializer_class = CertificateSerializer
    values = (
        "id",
        "learner_id",
        "training_id",
        "issued_at",
        "certificate_number",
        "criteria_met",
    )
    field_map = {
        "learner": "learner_id",
        "training": "training_id",
    }

    def get_queryset(self):
        user = self.request.user
        qs = Certificate.objects.all()
        if _is_facility_staff(user):
            return qs.filter(training__facility_id=user.facility_id)
        return qs.filter(learner_id=user.id)
