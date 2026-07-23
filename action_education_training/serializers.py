import datetime

import datetime

from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework import serializers

from action_education_training.models import Attendance
from action_education_training.models import Certificate
from action_education_training.models import Enrollment
from action_education_training.models import Training
from action_education_training.models import TrainingSession
from kolibri.core.fields import create_timezonestamp
from kolibri.core.fields import parse_timezonestamp


class FlexibleDateTimeTzField(serializers.Field):
    """Accept ISO-8601 or Kolibri DateTimeTz stamps for write APIs."""

    def to_representation(self, value):
        if value is None:
            return None
        if isinstance(value, datetime.datetime):
            return create_timezonestamp(value)
        return value

    def to_internal_value(self, data):
        if isinstance(data, datetime.datetime):
            return data
        if not data:
            raise serializers.ValidationError("This field is required.")
        if not isinstance(data, str):
            raise serializers.ValidationError("Invalid datetime.")
        normalized = data.replace("Z", "+00:00") if data.endswith("Z") else data
        parsed = parse_datetime(normalized)
        if parsed is not None:
            if timezone.is_naive(parsed):
                parsed = timezone.make_aware(parsed, timezone.utc)
            return parsed
        try:
            return parse_timezonestamp(data)
        except Exception as exc:
            raise serializers.ValidationError("Invalid datetime format.") from exc


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
    start_datetime = FlexibleDateTimeTzField()
    end_datetime = FlexibleDateTimeTzField()

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
