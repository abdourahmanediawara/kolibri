from django.urls import reverse

from kolibri.core.auth.models import Facility
from kolibri.core.auth.models import FacilityUser
from kolibri.core.auth.test.helpers import create_superuser
from kolibri.core.auth.test.helpers import DUMMY_PASSWORD
from kolibri.core.auth.test.helpers import KolibriAPITestCase
from kolibri.core.auth.test.helpers import provision_device
from kolibri.core.device.models import DevicePermissions


class AdminContentPermissionTestCase(KolibriAPITestCase):
    """Centre admins can import content: they manage content with their admin role."""

    databases = "__all__"

    def setUp(self):
        provision_device()
        self.facility = Facility.objects.create(name="Centre AE")
        self.user = FacilityUser.objects.create(
            username="mariama", facility=self.facility
        )
        self.user.set_password(DUMMY_PASSWORD)
        self.user.save()

    def can_manage_content(self, user):
        return FacilityUser.objects.get(pk=user.pk).can_manage_content

    def login(self, user):
        response = self.client.post(
            reverse("kolibri:core:session-list"),
            data={
                "username": user.username,
                "password": DUMMY_PASSWORD,
                "facility": self.facility.id,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 200)

    def current_session(self):
        # Like the frontend, which refreshes its session with a PUT.
        return self.client.put(
            reverse("kolibri:core:session-detail", kwargs={"pk": "current"})
        ).data

    def test_new_admin_can_manage_content(self):
        self.facility.add_admin(self.user)

        self.assertTrue(self.can_manage_content(self.user))

    def test_coach_cannot_manage_content(self):
        self.facility.add_coach(self.user)

        self.assertFalse(self.can_manage_content(self.user))

    def test_former_admin_can_no_longer_manage_content(self):
        self.facility.add_admin(self.user)
        self.facility.remove_admin(self.user)

        self.assertFalse(self.can_manage_content(self.user))

    def test_superuser_stays_superuser_when_admin_role_is_removed(self):
        superuser = create_superuser(self.facility)
        self.facility.add_admin(superuser)
        self.facility.remove_admin(superuser)

        self.assertTrue(DevicePermissions.objects.get(user=superuser).is_superuser)

    def test_existing_admin_can_manage_content_after_login(self):
        self.facility.add_admin(self.user)
        # Admins created before this rule have no content permission yet.
        permissions = DevicePermissions.objects.get(user=self.user)
        permissions.can_manage_content = False
        permissions.save()

        self.login(self.user)

        self.assertTrue(self.can_manage_content(self.user))

    def test_login_keeps_content_permission_given_to_a_non_admin(self):
        DevicePermissions.objects.create(user=self.user, can_manage_content=True)

        self.login(self.user)

        self.assertTrue(self.can_manage_content(self.user))

    def test_session_shows_content_permission_as_soon_as_user_becomes_admin(self):
        self.login(self.user)
        self.assertFalse(self.current_session()["can_manage_content"])

        self.facility.add_admin(self.user)

        self.assertTrue(self.current_session()["can_manage_content"])
