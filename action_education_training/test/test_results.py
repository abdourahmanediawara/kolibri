import uuid

from django.urls import reverse
from django.utils import timezone
from le_utils.constants import content_kinds
from rest_framework.test import APITestCase

from action_education_training.constants import ENROLLMENT_ACTIVE
from action_education_training.constants import STATUS_PUBLISHED
from action_education_training.models import Enrollment
from action_education_training.models import Training
from kolibri.core.auth.constants import role_kinds
from kolibri.core.auth.test.helpers import provision_device
from kolibri.core.auth.test.test_api import ClassroomFactory
from kolibri.core.auth.test.test_api import DUMMY_PASSWORD
from kolibri.core.auth.test.test_api import FacilityFactory
from kolibri.core.auth.test.test_api import FacilityUserFactory
from kolibri.core.content.models import ContentNode
from kolibri.core.logger.models import ContentSummaryLog


class LearnerResultsAPITests(APITestCase):
    databases = "__all__"

    @classmethod
    def setUpTestData(cls):
        provision_device()
        cls.facility = FacilityFactory.create()
        cls.admin = FacilityUserFactory.create(facility=cls.facility)
        cls.facility.add_role(cls.admin, role_kinds.ADMIN)
        cls.coach = FacilityUserFactory.create(facility=cls.facility)
        cls.facility.add_role(cls.coach, role_kinds.COACH)
        cls.learner = FacilityUserFactory.create(facility=cls.facility)
        cls.learner_no_attempt = FacilityUserFactory.create(facility=cls.facility)
        cls.classroom = ClassroomFactory.create(parent=cls.facility)
        cls.classroom.add_member(cls.learner)
        cls.classroom.add_member(cls.learner_no_attempt)
        cls.classroom.add_coach(cls.coach)

        cls.channel_id = uuid.uuid4().hex
        cls.content_id = uuid.uuid4().hex
        cls.exercise = ContentNode.objects.create(
            id=uuid.uuid4().hex,
            title="Exercice test AE",
            content_id=cls.content_id,
            channel_id=cls.channel_id,
            kind=content_kinds.EXERCISE,
            available=True,
        )

        cls.training = Training.objects.create(
            title="Formation résultats",
            facility=cls.facility,
            channel_id=cls.channel_id,
            status=STATUS_PUBLISHED,
            responsible=cls.coach,
        )
        Enrollment.objects.create(
            training=cls.training,
            learner=cls.learner,
            status=ENROLLMENT_ACTIVE,
        )
        Enrollment.objects.create(
            training=cls.training,
            learner=cls.learner_no_attempt,
            status=ENROLLMENT_ACTIVE,
        )

        ContentSummaryLog.objects.create(
            user=cls.learner,
            content_id=cls.content_id,
            channel_id=cls.channel_id,
            start_timestamp=timezone.now(),
            end_timestamp=timezone.now(),
            progress=0.4,
            kind=content_kinds.EXERCISE,
        )

    def _url(self):
        return reverse("kolibri:action_education_training:aelearnerresults")

    def test_learner_forbidden(self):
        self.client.login(
            username=self.learner.username,
            password=DUMMY_PASSWORD,
            facility=self.facility,
        )
        response = self.client.get(self._url())
        self.assertEqual(response.status_code, 403)

    def test_coach_sees_not_started_and_started(self):
        self.client.login(
            username=self.coach.username,
            password=DUMMY_PASSWORD,
            facility=self.facility,
        )
        response = self.client.get(
            self._url(),
            {"training": self.training.id, "content_id": self.content_id},
        )
        self.assertEqual(response.status_code, 200, response.content)
        by_user = {r["learner_id"]: r for r in response.data["results"]}
        self.assertEqual(by_user[self.learner.id]["status"], "started")
        self.assertEqual(by_user[self.learner.id]["progress"], 0.4)
        self.assertFalse(by_user[self.learner.id]["score_available"])
        self.assertEqual(by_user[self.learner_no_attempt.id]["status"], "not_started")
        learner_ids = {l["id"] for l in response.data["learners"]}
        self.assertNotIn(self.coach.id, learner_ids)
        self.assertNotIn(self.admin.id, learner_ids)

    def test_completed_exercise(self):
        ContentSummaryLog.objects.filter(user=self.learner).update(progress=1.0)
        self.client.login(
            username=self.coach.username,
            password=DUMMY_PASSWORD,
            facility=self.facility,
        )
        response = self.client.get(
            self._url(),
            {"learner": self.learner.id, "content_id": self.content_id},
        )
        self.assertEqual(response.status_code, 200)
        row = response.data["results"][0]
        self.assertEqual(row["status"], "completed")
        self.assertEqual(row["progress"], 1.0)

    def test_admin_can_access(self):
        self.client.login(
            username=self.admin.username,
            password=DUMMY_PASSWORD,
            facility=self.facility,
        )
        response = self.client.get(self._url())
        self.assertEqual(response.status_code, 200)

    def test_empty_contents_ok(self):
        self.client.login(
            username=self.coach.username,
            password=DUMMY_PASSWORD,
            facility=self.facility,
        )
        response = self.client.get(self._url(), {"content_id": "0" * 32})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["results"], [])
        self.assertEqual(response.data["contents"], [])
