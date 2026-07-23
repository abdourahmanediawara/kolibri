from action_education_training.constants import STATUS_PUBLISHED
from action_education_training.models import Attendance
from action_education_training.models import Certificate
from action_education_training.models import Enrollment
from action_education_training.models import Training
from action_education_training.models import TrainingSession
from action_education_training.permissions import IsFacilityStaffOrReadOwn
from action_education_training.permissions import _is_facility_staff
from action_education_training.serializers import AttendanceSerializer
from action_education_training.serializers import CertificateSerializer
from action_education_training.serializers import EnrollmentSerializer
from action_education_training.serializers import TrainingSerializer
from action_education_training.serializers import TrainingSessionSerializer
from kolibri.core.api import ValuesViewset


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
        "date_created",
        "date_updated",
    )
    field_map = {
        "facility": "facility_id",
        "responsible": "responsible_id",
    }

    def get_queryset(self):
        user = self.request.user
        qs = Training.objects.all()
        if _is_facility_staff(user):
            return qs.filter(facility_id=user.facility_id)
        return qs.filter(facility_id=user.facility_id, status=STATUS_PUBLISHED)


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
        "printable_payload",
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
