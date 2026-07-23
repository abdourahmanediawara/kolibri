import uuid

from django.core.exceptions import ValidationError
from django.db import models

from action_education_training.constants import ATTENDANCE_STATUS_CHOICES
from action_education_training.constants import ENROLLMENT_ACTIVE
from action_education_training.constants import ENROLLMENT_STATUS_CHOICES
from action_education_training.constants import SESSION_SCHEDULED
from action_education_training.constants import SESSION_STATUS_CHOICES
from action_education_training.constants import STATUS_DRAFT
from action_education_training.constants import TRAINING_STATUS_CHOICES
from kolibri.core.auth.models import Facility
from kolibri.core.auth.models import FacilityUser
from kolibri.core.fields import DateTimeTzField
from kolibri.utils.time_utils import local_now


def _uuid_str():
    return uuid.uuid4().hex


class Training(models.Model):
    """An Action Éducation training linked optionally to a Kolibri channel."""

    id = models.CharField(primary_key=True, max_length=32, default=_uuid_str, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    facility = models.ForeignKey(
        Facility,
        related_name="ae_trainings",
        on_delete=models.CASCADE,
    )
    # Optional Kolibri channel id (hex UUID without dashes), not a hard FK.
    channel_id = models.CharField(max_length=32, blank=True, default="")
    status = models.CharField(
        max_length=20,
        choices=TRAINING_STATUS_CHOICES,
        default=STATUS_DRAFT,
    )
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    responsible = models.ForeignKey(
        FacilityUser,
        related_name="ae_trainings_responsible",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    date_created = DateTimeTzField(default=local_now, editable=False)
    date_updated = DateTimeTzField(default=local_now)

    class Meta:
        ordering = ("-date_created",)

    def clean(self):
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValidationError("end_date must be on or after start_date")

    def save(self, *args, **kwargs):
        self.date_updated = local_now()
        self.full_clean()
        return super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class TrainingSession(models.Model):
    id = models.CharField(primary_key=True, max_length=32, default=_uuid_str, editable=False)
    training = models.ForeignKey(
        Training,
        related_name="sessions",
        on_delete=models.CASCADE,
    )
    start_datetime = DateTimeTzField()
    end_datetime = DateTimeTzField()
    location = models.CharField(max_length=200, blank=True, default="")
    trainer = models.ForeignKey(
        FacilityUser,
        related_name="ae_sessions_as_trainer",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    status = models.CharField(
        max_length=20,
        choices=SESSION_STATUS_CHOICES,
        default=SESSION_SCHEDULED,
    )
    notes = models.TextField(blank=True, default="")
    date_created = DateTimeTzField(default=local_now, editable=False)
    date_updated = DateTimeTzField(default=local_now)

    class Meta:
        ordering = ("start_datetime",)

    def clean(self):
        if self.end_datetime and self.start_datetime and self.end_datetime < self.start_datetime:
            raise ValidationError("end_datetime must be on or after start_datetime")

    def save(self, *args, **kwargs):
        self.date_updated = local_now()
        self.full_clean()
        return super().save(*args, **kwargs)


class Enrollment(models.Model):
    id = models.CharField(primary_key=True, max_length=32, default=_uuid_str, editable=False)
    training = models.ForeignKey(
        Training,
        related_name="enrollments",
        on_delete=models.CASCADE,
    )
    session = models.ForeignKey(
        TrainingSession,
        related_name="enrollments",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    learner = models.ForeignKey(
        FacilityUser,
        related_name="ae_enrollments",
        on_delete=models.CASCADE,
    )
    date_enrolled = DateTimeTzField(default=local_now)
    status = models.CharField(
        max_length=20,
        choices=ENROLLMENT_STATUS_CHOICES,
        default=ENROLLMENT_ACTIVE,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("training", "learner"),
                name="ae_enrollment_unique_training_learner",
            ),
        ]


class Attendance(models.Model):
    id = models.CharField(primary_key=True, max_length=32, default=_uuid_str, editable=False)
    session = models.ForeignKey(
        TrainingSession,
        related_name="attendances",
        on_delete=models.CASCADE,
    )
    learner = models.ForeignKey(
        FacilityUser,
        related_name="ae_attendances",
        on_delete=models.CASCADE,
    )
    status = models.CharField(max_length=20, choices=ATTENDANCE_STATUS_CHOICES)
    recorded_by = models.ForeignKey(
        FacilityUser,
        related_name="ae_attendances_recorded",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    date_recorded = DateTimeTzField(default=local_now)
    date_updated = DateTimeTzField(default=local_now)
    comment = models.CharField(max_length=255, blank=True, default="")

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("session", "learner"),
                name="ae_attendance_unique_session_learner",
            ),
        ]

    def save(self, *args, **kwargs):
        self.date_updated = local_now()
        return super().save(*args, **kwargs)


class Certificate(models.Model):
    id = models.CharField(primary_key=True, max_length=32, default=_uuid_str, editable=False)
    learner = models.ForeignKey(
        FacilityUser,
        related_name="ae_certificates",
        on_delete=models.CASCADE,
    )
    training = models.ForeignKey(
        Training,
        related_name="certificates",
        on_delete=models.CASCADE,
    )
    issued_at = DateTimeTzField(default=local_now)
    certificate_number = models.CharField(max_length=64, unique=True)
    criteria_met = models.TextField(blank=True, default="")
    # Optional printable representation path or inline HTML/PDF marker for later phases.
    printable_payload = models.TextField(blank=True, default="")

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("learner", "training"),
                name="ae_certificate_unique_learner_training",
            ),
        ]
