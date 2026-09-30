from django.urls import reverse
from rest_framework.test import APITestCase

from kolibri.core.auth.constants import role_kinds
from kolibri.core.auth.models import Classroom
from kolibri.core.auth.models import FacilityUser
from kolibri.core.auth.models import Membership
from kolibri.core.auth.models import Role
from kolibri.core.auth.test.helpers import provision_device
from kolibri.core.auth.test.test_api import DUMMY_PASSWORD
from kolibri.core.auth.test.test_api import FacilityFactory
from kolibri.core.auth.test.test_api import FacilityUserFactory


class CoachFacilityAPITests(APITestCase):
    databases = "__all__"

    @classmethod
    def setUpTestData(cls):
        provision_device()
        cls.facility = FacilityFactory.create()
        cls.coach = FacilityUserFactory.create(facility=cls.facility)
        cls.facility.add_role(cls.coach, role_kinds.COACH)
        cls.learner = FacilityUserFactory.create(facility=cls.facility)

    def setUp(self):
        self.client.login(
            username=self.coach.username,
            password=DUMMY_PASSWORD,
            facility=self.facility,
        )

    def test_coach_can_create_classroom(self):
        url = reverse("kolibri:action_education_training:aecoach_classroom")
        response = self.client.post(url, {"name": "Classe 6A"}, format="json")
        self.assertEqual(response.status_code, 201, response.content)
        classroom = Classroom.objects.get(id=response.data["id"])
        self.assertEqual(classroom.name, "Classe 6A")
        self.assertEqual(classroom.parent_id, self.facility.id)
        self.assertTrue(
            Role.objects.filter(
                user=self.coach,
                collection=classroom,
                kind=role_kinds.COACH,
            ).exists()
        )

    def test_coach_can_create_learner_in_classroom(self):
        classroom = Classroom.objects.create(name="Classe B", parent=self.facility)
        url = reverse("kolibri:action_education_training:aecoach_learner")
        response = self.client.post(
            url,
            {
                "username": "ousmane",
                "full_name": "Ousmane Diawara",
                "password": "Secret123!",
                "classroom_id": classroom.id,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201, response.content)
        user = FacilityUser.objects.get(username="ousmane", facility=self.facility)
        self.assertEqual(user.full_name, "Ousmane Diawara")
        self.assertTrue(
            Membership.objects.filter(user=user, collection=classroom).exists()
        )

    def test_duplicate_username_returns_400(self):
        classroom = Classroom.objects.create(name="Classe C", parent=self.facility)
        url = reverse("kolibri:action_education_training:aecoach_learner")
        payload = {
            "username": self.learner.username,
            "full_name": "Autre",
            "password": "Secret123!",
            "classroom_id": classroom.id,
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, 400, response.content)

    def test_learner_cannot_create_classroom(self):
        self.client.logout()
        self.client.login(
            username=self.learner.username,
            password=DUMMY_PASSWORD,
            facility=self.facility,
        )
        url = reverse("kolibri:action_education_training:aecoach_classroom")
        response = self.client.post(url, {"name": "Hacker"}, format="json")
        self.assertEqual(response.status_code, 403, response.content)
