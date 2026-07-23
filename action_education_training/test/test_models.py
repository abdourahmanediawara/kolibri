from action_education_training.kolibri_plugin import ActionEducationTrainingPlugin
from action_education_training.models import Attendance
from action_education_training.models import Enrollment
from action_education_training.models import Training
from action_education_training.models import TrainingSession
from action_education_training.constants import ATTENDANCE_PRESENT
from action_education_training.constants import STATUS_PUBLISHED
from kolibri.core.auth.test.helpers import provision_device
from kolibri.core.auth.test.test_api import FacilityFactory
from kolibri.core.auth.test.test_api import FacilityUserFactory
from django.test import TestCase
from django.db import IntegrityError
from django.utils import timezone
from datetime import timedelta


class TrainingPluginTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        provision_device()
        cls.facility = FacilityFactory.create()
        cls.coach = FacilityUserFactory.create(facility=cls.facility)
        cls.learner = FacilityUserFactory.create(facility=cls.facility)

    def test_plugin_name(self):
        assert ActionEducationTrainingPlugin().name("fr-fr") == "AE Formations"

    def test_training_and_session_create(self):
        training = Training.objects.create(
            title="Citoyenneté Locale",
            facility=self.facility,
            status=STATUS_PUBLISHED,
            responsible=self.coach,
        )
        start = timezone.now()
        session = TrainingSession.objects.create(
            training=training,
            start_datetime=start,
            end_datetime=start + timedelta(hours=2),
            location="Salle A",
            trainer=self.coach,
        )
        self.assertEqual(training.sessions.count(), 1)
        self.assertEqual(session.training_id, training.id)

    def test_enrollment_unique_per_learner(self):
        training = Training.objects.create(title="T1", facility=self.facility)
        Enrollment.objects.create(training=training, learner=self.learner)
        with self.assertRaises(IntegrityError):
            Enrollment.objects.create(training=training, learner=self.learner)

    def test_attendance_unique_per_session_learner(self):
        training = Training.objects.create(title="T2", facility=self.facility)
        start = timezone.now()
        session = TrainingSession.objects.create(
            training=training,
            start_datetime=start,
            end_datetime=start + timedelta(hours=1),
        )
        Attendance.objects.create(
            session=session,
            learner=self.learner,
            status=ATTENDANCE_PRESENT,
            recorded_by=self.coach,
        )
        with self.assertRaises(IntegrityError):
            Attendance.objects.create(
                session=session,
                learner=self.learner,
                status=ATTENDANCE_PRESENT,
                recorded_by=self.coach,
            )
