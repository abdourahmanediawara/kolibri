import uuid

from django.core.exceptions import ValidationError
from django.db import models

from action_education_training.constants import ATTENDANCE_STATUS_CHOICES
from action_education_training.constants import ENROLLMENT_ACTIVE
from action_education_training.constants import ENROLLMENT_STATUS_CHOICES
from action_education_training.constants import QUESTION_KIND_CHOICES
from action_education_training.constants import QUESTION_SINGLE
from action_education_training.constants import QUIZ_DEFAULT_PASS_PERCENT
from action_education_training.constants import QUIZ_KIND_CHOICES
from action_education_training.constants import QUIZ_KIND_QUIZ
from action_education_training.constants import RESOURCE_KIND_CHOICES
from action_education_training.constants import RESOURCE_OTHER
from action_education_training.constants import SESSION_SCHEDULED
from action_education_training.constants import SESSION_STATUS_CHOICES
from action_education_training.constants import STATUS_DRAFT
from action_education_training.constants import TRAINING_STATUS_CHOICES
from kolibri.core.auth.models import Facility
from kolibri.core.auth.models import FacilityUser
from kolibri.core.fields import DateTimeTzField
from kolibri.core.fields import JSONField
from kolibri.utils.time_utils import local_now


def _uuid_str():
    return uuid.uuid4().hex


def training_resource_upload_to(instance, filename):
    """Store under media/ae_training_resources/<training_id>/<uuid>_<safe_name>."""
    safe = "".join(c if c.isalnum() or c in "._-" else "_" for c in (filename or "file"))
    safe = safe[:120] or "file"
    return f"ae_training_resources/{instance.training_id}/{instance.id}_{safe}"


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


class TrainingResource(models.Model):
    """
    A course support, Moodle-style: an uploaded file (PDF, Word, video, audio, …)
    or a web link (YouTube video, website) with an empty file.
    """

    id = models.CharField(primary_key=True, max_length=32, default=_uuid_str, editable=False)
    training = models.ForeignKey(
        Training,
        related_name="resources",
        on_delete=models.CASCADE,
    )
    title = models.CharField(max_length=200)
    kind = models.CharField(
        max_length=20,
        choices=RESOURCE_KIND_CHOICES,
        default=RESOURCE_OTHER,
    )
    original_filename = models.CharField(max_length=255, blank=True, default="")
    mime_type = models.CharField(max_length=127, blank=True, default="")
    size_bytes = models.PositiveBigIntegerField(default=0)
    file = models.FileField(upload_to=training_resource_upload_to, max_length=512, blank=True)
    url = models.URLField(max_length=500, blank=True, default="")
    uploaded_by = models.ForeignKey(
        FacilityUser,
        related_name="ae_training_resources_uploaded",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    sort_order = models.PositiveIntegerField(default=0)
    date_created = DateTimeTzField(default=local_now, editable=False)

    class Meta:
        ordering = ("sort_order", "date_created")

    def __str__(self):
        return self.title


class ResourceView(models.Model):
    """A learner opened a course support: the basis of course progress."""

    id = models.CharField(primary_key=True, max_length=32, default=_uuid_str, editable=False)
    resource = models.ForeignKey(
        TrainingResource,
        related_name="views",
        on_delete=models.CASCADE,
    )
    learner = models.ForeignKey(
        FacilityUser,
        related_name="ae_resource_views",
        on_delete=models.CASCADE,
    )
    first_viewed = DateTimeTzField(default=local_now)
    last_viewed = DateTimeTzField(default=local_now)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("resource", "learner"),
                name="ae_resource_view_unique_resource_learner",
            ),
        ]


class Quiz(models.Model):
    """A mini quiz along the course, or its final exam."""

    id = models.CharField(primary_key=True, max_length=32, default=_uuid_str, editable=False)
    training = models.ForeignKey(
        Training,
        related_name="quizzes",
        on_delete=models.CASCADE,
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    kind = models.CharField(max_length=10, choices=QUIZ_KIND_CHOICES, default=QUIZ_KIND_QUIZ)
    status = models.CharField(
        max_length=20,
        choices=TRAINING_STATUS_CHOICES,
        default=STATUS_DRAFT,
    )
    pass_percent = models.PositiveSmallIntegerField(default=QUIZ_DEFAULT_PASS_PERCENT)
    # 0 means as many attempts as the learner wants.
    max_attempts = models.PositiveSmallIntegerField(default=0)
    # Show the right answers once an attempt is submitted.
    show_answers = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_by = models.ForeignKey(
        FacilityUser,
        related_name="ae_quizzes_created",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    date_created = DateTimeTzField(default=local_now, editable=False)
    date_updated = DateTimeTzField(default=local_now)

    class Meta:
        ordering = ("sort_order", "date_created")

    def save(self, *args, **kwargs):
        self.date_updated = local_now()
        return super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class QuizQuestion(models.Model):
    id = models.CharField(primary_key=True, max_length=32, default=_uuid_str, editable=False)
    quiz = models.ForeignKey(Quiz, related_name="questions", on_delete=models.CASCADE)
    prompt = models.TextField()
    kind = models.CharField(max_length=20, choices=QUESTION_KIND_CHOICES, default=QUESTION_SINGLE)
    points = models.PositiveSmallIntegerField(default=1)
    # Shown with the answers, after an attempt.
    explanation = models.TextField(blank=True, default="")
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("sort_order",)


class QuizChoice(models.Model):
    id = models.CharField(primary_key=True, max_length=32, default=_uuid_str, editable=False)
    question = models.ForeignKey(QuizQuestion, related_name="choices", on_delete=models.CASCADE)
    text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("sort_order",)


class QuizAttempt(models.Model):
    """A submitted attempt, graded by the server."""

    id = models.CharField(primary_key=True, max_length=32, default=_uuid_str, editable=False)
    quiz = models.ForeignKey(Quiz, related_name="attempts", on_delete=models.CASCADE)
    learner = models.ForeignKey(
        FacilityUser,
        related_name="ae_quiz_attempts",
        on_delete=models.CASCADE,
    )
    # {question_id: [choice_id, …]}
    answers = JSONField(default=dict, blank=True)
    score = models.PositiveIntegerField(default=0)
    max_score = models.PositiveIntegerField(default=0)
    percent = models.PositiveSmallIntegerField(default=0)
    passed = models.BooleanField(default=False)
    date_submitted = DateTimeTzField(default=local_now)

    class Meta:
        ordering = ("-date_submitted",)
