from datetime import timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from action_education_training.constants import ATTENDANCE_PRESENT
from action_education_training.constants import STATUS_PUBLISHED
from action_education_training.models import Attendance
from action_education_training.models import Certificate
from action_education_training.models import Enrollment
from action_education_training.models import Training
from action_education_training.models import TrainingSession
from action_education_training.reports import issue_certificate
from kolibri.core.auth.constants import role_kinds
from kolibri.core.auth.test.helpers import provision_device
from kolibri.core.auth.test.test_api import DUMMY_PASSWORD
from kolibri.core.auth.test.test_api import FacilityFactory
from kolibri.core.auth.test.test_api import FacilityUserFactory


class TrainingReportsAPITests(APITestCase):
    databases = "__all__"

    @classmethod
    def setUpTestData(cls):
        provision_device()
        cls.facility = FacilityFactory.create()
        cls.admin = FacilityUserFactory.create(facility=cls.facility)
        cls.facility.add_role(cls.admin, role_kinds.ADMIN)
        cls.learner = FacilityUserFactory.create(facility=cls.facility)
        cls.training = Training.objects.create(
            title="Citoyenneté Locale",
            facility=cls.facility,
            status=STATUS_PUBLISHED,
            responsible=cls.admin,
        )
        start = timezone.now()
        cls.session = TrainingSession.objects.create(
            training=cls.training,
            start_datetime=start,
            end_datetime=start + timedelta(hours=2),
            location="Salle A",
            trainer=cls.admin,
        )
        Enrollment.objects.create(
            training=cls.training,
            session=cls.session,
            learner=cls.learner,
        )
        Attendance.objects.create(
            session=cls.session,
            learner=cls.learner,
            status=ATTENDANCE_PRESENT,
            recorded_by=cls.admin,
        )

    def setUp(self):
        self.client.login(
            username=self.admin.username,
            password=DUMMY_PASSWORD,
            facility=self.facility,
        )

    def test_issue_certificate_and_print(self):
        url = reverse("kolibri:action_education_training:aecertificate-issue")
        response = self.client.post(
            url,
            {"learner": self.learner.id, "training": self.training.id},
            format="json",
        )
        self.assertEqual(response.status_code, 201, response.content)
        self.assertTrue(response.data["certificate_number"].startswith("AE-"))
        cert_id = response.data["id"]
        self.assertEqual(Certificate.objects.filter(id=cert_id).count(), 1)

        # Idempotent second call
        response = self.client.post(
            url,
            {"learner": self.learner.id, "training": self.training.id},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data["created"])

        print_url = reverse(
            "kolibri:action_education_training:aecertificate-print",
            kwargs={"pk": cert_id},
        )
        response = self.client.get(print_url)
        self.assertEqual(response.status_code, 200)
        self.assertIn("text/html", response["Content-Type"])
        self.assertIn("AE Apprendre", response.content.decode("utf-8"))
        self.assertIn(self.learner.full_name or self.learner.username, response.content.decode("utf-8"))

    def test_attendance_csv_export(self):
        url = reverse(
            "kolibri:action_education_training:aeexport-attendance",
            kwargs={"session_id": self.session.id},
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertIn("text/csv", response["Content-Type"])
        body = response.content.decode("utf-8-sig")
        self.assertIn("learner_username", body)
        self.assertIn(self.learner.username, body)
        self.assertIn("present", body)

    def test_enrollments_and_certificates_csv(self):
        issue_certificate(self.learner, self.training)
        enroll_url = reverse(
            "kolibri:action_education_training:aeexport-enrollments",
            kwargs={"training_id": self.training.id},
        )
        response = self.client.get(enroll_url)
        self.assertEqual(response.status_code, 200)
        self.assertIn(self.learner.username, response.content.decode("utf-8-sig"))

        certs_url = reverse("kolibri:action_education_training:aeexport-certificates")
        response = self.client.get(certs_url)
        self.assertEqual(response.status_code, 200)
        self.assertIn("certificate_number", response.content.decode("utf-8-sig"))

    def test_learner_cannot_export(self):
        self.client.logout()
        self.client.login(
            username=self.learner.username,
            password=DUMMY_PASSWORD,
            facility=self.facility,
        )
        url = reverse("kolibri:action_education_training:aeexport-certificates")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 403)
