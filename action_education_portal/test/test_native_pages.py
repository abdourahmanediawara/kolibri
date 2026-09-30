"""Native Kolibri pages send people to their AE space instead."""
from django.urls import reverse
from rest_framework.test import APITestCase

from kolibri.core.auth.constants import role_kinds
from kolibri.core.auth.test.helpers import provision_device
from kolibri.core.auth.test.test_api import DUMMY_PASSWORD
from kolibri.core.auth.test.test_api import FacilityFactory
from kolibri.core.auth.test.test_api import FacilityUserFactory

LEARN = "kolibri:kolibri.plugins.learn:learn"
COACH = "kolibri:kolibri.plugins.coach:coach"
FACILITY = "kolibri:kolibri.plugins.facility:facility_management"
PROFILE = "kolibri:kolibri.plugins.user_profile:user_profile"
AUTH = "kolibri:kolibri.plugins.user_auth:user_auth"
DEVICE = "kolibri:kolibri.plugins.device:device_management"


class NativePagesTests(APITestCase):
    databases = "__all__"

    @classmethod
    def setUpTestData(cls):
        provision_device()
        cls.facility = FacilityFactory.create()
        cls.learner = FacilityUserFactory.create(facility=cls.facility)
        cls.coach = FacilityUserFactory.create(facility=cls.facility)
        cls.facility.add_role(cls.coach, role_kinds.COACH)
        cls.admin = FacilityUserFactory.create(facility=cls.facility)
        cls.facility.add_role(cls.admin, role_kinds.ADMIN)

    def login(self, user):
        self.client.login(username=user.username, password=DUMMY_PASSWORD, facility=self.facility)

    def assert_sent_to_portal(self, url_name, hash_path, query=""):
        response = self.client.get(reverse(url_name) + query)
        self.assertEqual(response.status_code, 302)
        self.assertIn("/portal/", response["Location"])
        self.assertTrue(response["Location"].endswith(hash_path), response["Location"])

    def test_learners_are_sent_to_their_ae_space(self):
        self.login(self.learner)
        self.assert_sent_to_portal(LEARN, "#/apprenant")
        self.assert_sent_to_portal(PROFILE, "#/apprenant/profil")
        self.assert_sent_to_portal(COACH, "#/apprenant")
        self.assert_sent_to_portal(DEVICE, "#/apprenant")

    def test_staff_are_sent_to_their_ae_space(self):
        self.login(self.coach)
        self.assert_sent_to_portal(COACH, "#/formateur")
        self.assert_sent_to_portal(PROFILE, "#/formateur/profil")
        self.client.logout()
        self.login(self.admin)
        self.assert_sent_to_portal(FACILITY, "#/administrateur")

    def test_visitors_are_sent_to_the_ae_sign_in_page(self):
        self.assert_sent_to_portal(AUTH, "#/connexion")
        self.assert_sent_to_portal(PROFILE, "#/connexion")

    def test_ae_pages_can_still_open_an_exercise_or_set_a_password(self):
        self.login(self.learner)
        response = self.client.get(reverse(LEARN) + "?ae_exercise=1")
        self.assertNotIn("/portal/", response.get("Location", ""))
        self.client.logout()
        response = self.client.get(reverse(AUTH) + "?ae_auth=1")
        self.assertNotIn("/portal/", response.get("Location", ""))
        # Data sync still runs in Kolibri facility management.
        self.login(self.admin)
        response = self.client.get(reverse(FACILITY) + "?ae_advanced=1")
        self.assertNotIn("/portal/", response.get("Location", ""))
