from action_education_portal.redirects import prefer_portal_role_redirects
from kolibri.core.auth.constants.user_kinds import ADMIN
from kolibri.core.auth.constants.user_kinds import COACH
from kolibri.core.auth.constants.user_kinds import LEARNER
from kolibri.core.hooks import RoleBasedRedirectHook
from kolibri.core.views import get_url_by_role


def test_prefer_portal_redirects_unregisters_native_hooks():
    prefer_portal_role_redirects()

    modules = {type(hook).__module__ for hook in RoleBasedRedirectHook.registered_hooks}
    assert "kolibri.plugins.learn.kolibri_plugin" not in modules
    assert "kolibri.plugins.coach.kolibri_plugin" not in modules
    assert "kolibri.plugins.facility.kolibri_plugin" not in modules
    assert any("action_education_portal" in m for m in modules)


def test_get_url_by_role_returns_portal_hashes_for_three_roles():
    prefer_portal_role_redirects()

    learner_url = get_url_by_role(LEARNER)
    coach_url = get_url_by_role(COACH, full_facility_import=True)
    admin_url = get_url_by_role(ADMIN, full_facility_import=True)

    assert learner_url and learner_url.endswith("#/ae/learn")
    assert coach_url and coach_url.endswith("#/ae/coach")
    assert admin_url and admin_url.endswith("#/ae/admin")
    assert "portal" in learner_url
    assert "portal" in coach_url
    assert "portal" in admin_url


def test_portal_redirect_hook_urls_include_role_hash():
    from action_education_portal.kolibri_plugin import AdminPortalRedirect
    from action_education_portal.kolibri_plugin import CoachPortalRedirect
    from action_education_portal.kolibri_plugin import PortalRedirect

    assert PortalRedirect().url.endswith("#/ae/learn")
    assert CoachPortalRedirect().url.endswith("#/ae/coach")
    assert AdminPortalRedirect().url.endswith("#/ae/admin")
