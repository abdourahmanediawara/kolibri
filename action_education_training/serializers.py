from rest_framework import serializers

from action_education_training.models import Attendance
from action_education_training.models import Certificate
from action_education_training.models import Enrollment
from action_education_training.models import Training
from action_education_training.models import TrainingSession


class TrainingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Training
        fields = (
            "id",
            "title",
            "description",
            "facility",
            "channel_id",
            "status",
            "start_date",
            "end_date",
            "responsible",
            "date_created",
            "date_updated",
        )
        read_only_fields = ("id", "date_created", "date_updated")


class TrainingSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingSession
        fields = (
            "id",
            "training",
            "start_datetime",
            "end_datetime",
            "location",
            "trainer",
            "status",
            "notes",
            "date_created",
            "date_updated",
        )
        read_only_fields = ("id", "date_created", "date_updated")


class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = (
            "id",
            "training",
            "session",
            "learner",
            "date_enrolled",
            "status",
        )
        read_only_fields = ("id", "date_enrolled")


class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = (
            "id",
            "session",
            "learner",
            "status",
            "recorded_by",
            "date_recorded",
            "date_updated",
            "comment",
        )
        read_only_fields = ("id", "date_recorded", "date_updated")


class CertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certificate
        fields = (
            "id",
            "learner",
            "training",
            "issued_at",
            "certificate_number",
            "criteria_met",
            "printable_payload",
        )
        read_only_fields = ("id", "issued_at")
