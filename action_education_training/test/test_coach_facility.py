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

    def create_learner(self, username, classroom):
        url = reverse("kolibri:action_education_training:aecoach_learner")
        payload = {
            "username": username,
            "full_name": "Autre",
            "password": "Secret123!",
            "classroom_id": classroom.id,
        }
        return self.client.post(url, payload, format="json")

    def test_usernames_are_taken_whatever_the_case(self):
        classroom = Classroom.objects.create(name="Classe D", parent=self.facility)
        response = self.create_learner(self.learner.username.upper(), classroom)

        self.assertEqual(response.status_code, 400, response.content)
        self.assertEqual(response.data[0]["id"], "USERNAME_ALREADY_EXISTS")

    def test_invalid_username_is_refused(self):
        classroom = Classroom.objects.create(name="Classe E", parent=self.facility)
        response = self.create_learner("awa camara!", classroom)

        self.assertEqual(response.status_code, 400, response.content)
        self.assertEqual(response.data[0]["id"], "INVALID_USERNAME")

    def test_class_names_are_unique_in_the_facility(self):
        Classroom.objects.create(name="Classe 6A", parent=self.facility)
        url = reverse("kolibri:action_education_training:aecoach_classroom")
        response = self.client.post(url, {"name": "classe 6a"}, format="json")

        self.assertEqual(response.status_code, 400, response.content)
        self.assertEqual(response.data[0]["id"], "UNIQUE")
        self.assertEqual(Classroom.objects.filter(parent=self.facility).count(), 1)

    def test_staff_check_if_a_username_is_available(self):
        url = reverse("kolibri:action_education_training:aeusername_available")

        taken = self.client.get(url, {"username": self.learner.username.upper()}).data
        free = self.client.get(url, {"username": "nouvel_eleve"}).data
        invalid = self.client.get(url, {"username": "awa camara!"}).data

        self.assertEqual((taken["valid"], taken["available"]), (True, False))
        self.assertEqual((free["valid"], free["available"]), (True, True))
        self.assertEqual((invalid["valid"], invalid["available"]), (False, False))

    def test_learners_cannot_check_usernames(self):
        self.client.logout()
        self.client.login(
            username=self.learner.username,
            password=DUMMY_PASSWORD,
            facility=self.facility,
        )
        url = reverse("kolibri:action_education_training:aeusername_available")
        response = self.client.get(url, {"username": "abc"})
        self.assertEqual(response.status_code, 403, response.content)
