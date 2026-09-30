from datetime import timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from action_education_training.constants import ATTENDANCE_PRESENT
from action_education_training.constants import STATUS_PUBLISHED
from action_education_training.models import Attendance
from action_education_training.models import Enrollment
from action_education_training.models import Training
from action_education_training.models import TrainingSession
from kolibri.core.auth.constants import role_kinds
from kolibri.core.auth.test.helpers import provision_device
from kolibri.core.auth.test.test_api import DUMMY_PASSWORD
from kolibri.core.auth.test.test_api import FacilityFactory
from kolibri.core.auth.test.test_api import FacilityUserFactory


class TrainingAPITests(APITestCase):
    databases = "__all__"

    @classmethod
    def setUpTestData(cls):
        provision_device()
        cls.facility = FacilityFactory.create()
        cls.admin = FacilityUserFactory.create(facility=cls.facility)
        cls.facility.add_role(cls.admin, role_kinds.ADMIN)
        cls.learner = FacilityUserFactory.create(facility=cls.facility)

    def setUp(self):
        self.client.login(username=self.admin.username, password=DUMMY_PASSWORD, facility=self.facility)

    def test_coach_can_create_training_session_enrollment_attendance(self):
        training_url = reverse("kolibri:action_education_training:aetraining-list")
        response = self.client.post(
            training_url,
            {
                "title": "Jury Citoyen",
                "description": "Session pilote",
                "facility": self.facility.id,
                "status": STATUS_PUBLISHED,
                "responsible": self.admin.id,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201, response.content)
        training_id = response.data["id"]

        start = timezone.now()
        session_url = reverse("kolibri:action_education_training:aesession-list")
        response = self.client.post(
            session_url,
            {
                "training": training_id,
                "start_datetime": start.isoformat().replace("+00:00", "Z"),
                "end_datetime": (start + timedelta(hours=2))
                .isoformat()
                .replace("+00:00", "Z"),
                "location": "Maison des jeunes",
                "trainer": self.admin.id,
                "status": "scheduled",
                "notes": "",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201, response.content)
        session_id = response.data["id"]

        enrollment_url = reverse("kolibri:action_education_training:aeenrollment-list")
        response = self.client.post(
            enrollment_url,
            {
                "training": training_id,
                "session": session_id,
                "learner": self.learner.id,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201, response.content)

        attendance_url = reverse("kolibri:action_education_training:aeattendance-list")
        response = self.client.post(
            attendance_url,
            {
                "session": session_id,
                "learner": self.learner.id,
                "status": ATTENDANCE_PRESENT,
                "recorded_by": self.admin.id,
                "comment": "",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201, response.content)
        self.assertEqual(Attendance.objects.filter(session_id=session_id).count(), 1)
        self.assertEqual(Enrollment.objects.filter(training_id=training_id).count(), 1)
        self.assertEqual(TrainingSession.objects.filter(training_id=training_id).count(), 1)
        self.assertTrue(Training.objects.filter(id=training_id).exists())

    def test_learner_cannot_create_attendance(self):
        training = Training.objects.create(
            title="T",
            facility=self.facility,
            status=STATUS_PUBLISHED,
        )
        start = timezone.now()
        session = TrainingSession.objects.create(
            training=training,
            start_datetime=start,
            end_datetime=start + timedelta(hours=1),
        )
        self.client.logout()
        self.client.login(
            username=self.learner.username,
            password=DUMMY_PASSWORD,
            facility=self.facility,
        )
        attendance_url = reverse("kolibri:action_education_training:aeattendance-list")
        response = self.client.post(
            attendance_url,
            {
                "session": session.id,
                "learner": self.learner.id,
                "status": ATTENDANCE_PRESENT,
            },
            format="json",
        )
        self.assertIn(response.status_code, (403, 405))

    def test_learner_cannot_create_training_or_session(self):
        self.client.logout()
        self.client.login(
            username=self.learner.username,
            password=DUMMY_PASSWORD,
            facility=self.facility,
        )
        training_url = reverse("kolibri:action_education_training:aetraining-list")
        response = self.client.post(
            training_url,
            {
                "title": "Forbidden",
                "description": "",
                "facility": self.facility.id,
                "status": STATUS_PUBLISHED,
            },
            format="json",
        )
        self.assertIn(response.status_code, (403, 405))

        training = Training.objects.create(
            title="Allowed by staff",
            facility=self.facility,
            status=STATUS_PUBLISHED,
        )
        start = timezone.now()
        session_url = reverse("kolibri:action_education_training:aesession-list")
        response = self.client.post(
            session_url,
            {
                "training": training.id,
                "start_datetime": start.isoformat().replace("+00:00", "Z"),
                "end_datetime": (start + timedelta(hours=2))
                .isoformat()
                .replace("+00:00", "Z"),
                "location": "Somewhere",
                "trainer": self.learner.id,
                "status": "scheduled",
                "notes": "",
            },
            format="json",
        )
        self.assertIn(response.status_code, (403, 405))
