from django.test import TestCase

from action_education_portal.kolibri_plugin import ActionEducationPortalPlugin
from action_education_portal.kolibri_plugin import AdminPortalRedirect
from action_education_portal.kolibri_plugin import CoachPortalRedirect
from action_education_portal.kolibri_plugin import PortalAsset
from action_education_portal.kolibri_plugin import PortalRedirect
from kolibri.core.auth.test.helpers import clear_process_cache
from kolibri.core.auth.test.helpers import setup_device
from kolibri.core.device.models import DeviceSettings


def test_portal_url_slug():
    assert ActionEducationPortalPlugin().url_slug == "portal/"


def test_portal_redirect_targets_learners_only():
    from kolibri.core.auth.constants.user_kinds import LEARNER

    assert PortalRedirect.roles == (LEARNER,)


def test_coach_portal_redirect_roles():
    from kolibri.core.auth.constants.user_kinds import ASSIGNABLE_COACH
    from kolibri.core.auth.constants.user_kinds import COACH

    assert CoachPortalRedirect.roles == (COACH, ASSIGNABLE_COACH)


def test_admin_portal_redirect_roles():
    from kolibri.core.auth.constants.user_kinds import ADMIN

    assert AdminPortalRedirect.roles == (ADMIN,)


def test_portal_plugin_name():
    assert ActionEducationPortalPlugin().name("fr-fr") == "Plateforme de formation Action Éducation"


def test_build_plugins_includes_portal_not_theme():
    from pathlib import Path

    text = Path(__file__).resolve().parents[2].joinpath("build_tools/build_plugins.txt").read_text()
    assert "action_education_portal" in text
    assert "action_education_theme" not in text


def test_portal_frontend_routes_cover_ae_spaces():
    from pathlib import Path

    routes = Path(__file__).resolve().parents[1].joinpath("frontend/routes.js").read_text()
    for name in (
        "AeSignIn",
        "AeLearnHome",
        "AeCoachHome",
        "AeAdminHome",
        "AeLearnFormations",
        "AeLearnLibrary",
        "AeLearnQuizzes",
        "AeLearnProgress",
        "AeLearnHelp",
        "AeLearnProfile",
        "AeCoachSessions",
        "AeCoachSessionDetail",
        "AeCoachClasses",
        "AeAdminReports",
        "AeForbidden",
        "AeLearnerLayout",
        "AeCoachLayout",
        "AeAdminLayout",
    ):
        assert name in routes
    assert "path: '/apprenant'" in routes
    assert "path: '/formateur'" in routes
    assert "path: '/administrateur'" in routes
    assert "path: '/connexion'" in routes


def test_portal_side_nav_has_single_portal_entry():
    from pathlib import Path

    text = (
        Path(__file__)
        .resolve()
        .parents[1]
        .joinpath("frontend/views/PortalSideNavEntry.js")
        .read_text()
    )
    assert "portalLandingRoute" in text
    assert "portalSubRoutes" not in text
    assert "/ae/learn" not in text
    assert "/ae/coach" not in text


def test_route_guards_send_anonymous_to_ae_signin():
    from pathlib import Path

    text = Path(__file__).resolve().parents[1].joinpath("frontend/routeGuards.js").read_text()
    assert "AeSignIn" in text
    assert "isUserLoggedIn" in text
    assert "defaultLandingPath" in text


def test_layouts_exist_without_global_switcher():
    from pathlib import Path

    root = Path(__file__).resolve().parents[1].joinpath("frontend/views/layouts")
    for name in ("AeLearnerLayout.vue", "AeCoachLayout.vue", "AeAdminLayout.vue", "AeSpaceLayout.vue"):
        assert (root / name).exists()
    shell = root.joinpath("AeSpaceLayout.vue").read_text()
    assert "ae-switcher" not in shell
    assert "previewLinks" in shell


class PortalAssetPluginDataTests(TestCase):
    def setUp(self):
        # Device provisioning state is cached across tests.
        clear_process_cache()

    def test_unprovisioned_device_hides_sign_up(self):
        data = PortalAsset().plugin_data
        self.assertIsNone(data["defaultFacilityId"])
        self.assertFalse(data["allowLearnerSignUp"])
        self.assertIn("allowGuestAccess", data)

    def test_mirrors_default_facility_and_device_settings(self):
        facility, _ = setup_device()
        facility.dataset.learner_can_sign_up = False
        facility.dataset.save()
        device_settings = DeviceSettings.objects.get()
        device_settings.allow_guest_access = False
        device_settings.save()

        data = PortalAsset().plugin_data

        self.assertEqual(data["defaultFacilityId"], facility.id)
        self.assertFalse(data["allowLearnerSignUp"])
        self.assertFalse(data["allowGuestAccess"])
