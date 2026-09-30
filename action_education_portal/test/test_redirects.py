import pytest
from action_education_portal.redirects import prefer_portal_role_redirects
from kolibri.core.auth.constants.user_kinds import ADMIN
from kolibri.core.auth.constants.user_kinds import ANONYMOUS
from kolibri.core.auth.constants.user_kinds import COACH
from kolibri.core.auth.constants.user_kinds import LEARNER
from kolibri.core.auth.constants.user_kinds import SUPERUSER
from kolibri.core.hooks import RoleBasedRedirectHook
from kolibri.core.views import get_url_by_role


@pytest.mark.django_db
def test_prefer_portal_redirects_unregisters_native_hooks():
    prefer_portal_role_redirects()

    modules = {type(hook).__module__ for hook in RoleBasedRedirectHook.registered_hooks}
    assert "kolibri.plugins.learn.kolibri_plugin" not in modules
    assert "kolibri.plugins.coach.kolibri_plugin" not in modules
    assert "kolibri.plugins.facility.kolibri_plugin" not in modules
    assert "kolibri.plugins.user_auth.kolibri_plugin" not in modules
    # Super admins land in the AE admin space too, not in Kolibri Device.
    assert "kolibri.plugins.device.kolibri_plugin" not in modules
    assert any("action_education_portal" in m for m in modules)


@pytest.mark.django_db
def test_get_url_by_role_returns_portal_hashes_for_three_roles():
    prefer_portal_role_redirects()

    learner_url = get_url_by_role(LEARNER)
    coach_url = get_url_by_role(COACH, full_facility_import=True)
    admin_url = get_url_by_role(ADMIN, full_facility_import=True)

    assert learner_url and learner_url.endswith("#/apprenant")
    assert coach_url and coach_url.endswith("#/formateur")
    assert admin_url and admin_url.endswith("#/administrateur")
    assert "portal" in learner_url
    assert "portal" in coach_url
    assert "portal" in admin_url
    assert learner_url.count("#") == 1
    assert coach_url.count("#") == 1
    assert admin_url.count("#") == 1


@pytest.mark.django_db
def test_super_admins_land_in_the_ae_admin_space():
    prefer_portal_role_redirects()

    url = get_url_by_role(SUPERUSER, full_facility_import=True)

    assert url and "portal" in url
    assert url.endswith("#/administrateur")


@pytest.mark.django_db
def test_portal_redirect_hook_urls_include_role_hash():
    from action_education_portal.kolibri_plugin import AdminPortalRedirect
    from action_education_portal.kolibri_plugin import CoachPortalRedirect
    from action_education_portal.kolibri_plugin import PortalRedirect

    assert PortalRedirect().url.endswith("#/apprenant")
    assert CoachPortalRedirect().url.endswith("#/formateur")
    assert AdminPortalRedirect().url.endswith("#/administrateur")


@pytest.mark.django_db
def test_anonymous_visitors_open_the_ae_sign_in_page():
    prefer_portal_role_redirects()

    url = get_url_by_role(ANONYMOUS)

    assert url and "portal" in url
    assert url.endswith("#/connexion")
