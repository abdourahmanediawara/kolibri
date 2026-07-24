from action_education_portal.kolibri_plugin import ActionEducationPortalPlugin
from action_education_portal.kolibri_plugin import AdminPortalRedirect
from action_education_portal.kolibri_plugin import CoachPortalRedirect
from action_education_portal.kolibri_plugin import PortalRedirect


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
        "AeLearnHome",
        "AeCoachHome",
        "AeAdminHome",
        "AeLearnFormations",
        "AeLearnLibrary",
        "AeLearnQuizzes",
        "AeLearnProgress",
        "AeLearnHelp",
        "AeCoachSessions",
        "AeCoachSessionDetail",
        "AeAdminReports",
        "AeForbidden",
    ):
        assert name in routes


def test_portal_side_nav_filters_role_routes():
    from pathlib import Path

    text = (
        Path(__file__)
        .resolve()
        .parents[1]
        .joinpath("frontend/views/PortalSideNavEntry.js")
        .read_text()
    )
    assert "portalSubRoutes" in text
    assert "isCoach.value" in text
    assert "isAdmin.value" in text


def test_route_guards_redirect_anonymous_to_signin():
    from pathlib import Path

    text = Path(__file__).resolve().parents[1].joinpath("frontend/routeGuards.js").read_text()
    assert "redirectToSignIn" in text
    assert "isUserLoggedIn" in text
