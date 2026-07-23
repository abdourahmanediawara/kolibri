from action_education_portal.kolibri_plugin import ActionEducationPortalPlugin
from action_education_portal.kolibri_plugin import PortalRedirect


def test_portal_url_slug():
    assert ActionEducationPortalPlugin().url_slug == "portal/"


def test_portal_redirect_targets_learners_only():
    from kolibri.core.auth.constants.user_kinds import LEARNER

    assert PortalRedirect.roles == (LEARNER,)


def test_portal_plugin_name():
    assert ActionEducationPortalPlugin().name("fr-fr") == "AE Apprendre"


def test_build_plugins_includes_portal_not_theme():
    from pathlib import Path

    text = Path(__file__).resolve().parents[2].joinpath("build_tools/build_plugins.txt").read_text()
    assert "action_education_portal" in text
    assert "action_education_theme" not in text


def test_portal_frontend_routes_cover_phase3_and_trainer():
    from pathlib import Path

    routes = Path(__file__).resolve().parents[1].joinpath("frontend/routes.js").read_text()
    for name in (
        "PortalCatalog",
        "PortalVideos",
        "PortalQuizzes",
        "PortalProgress",
        "PortalHelp",
        "PortalAdminDashboard",
        "PortalTrainerDashboard",
        "PortalTrainerSessions",
        "PortalSessionAttendance",
    ):
        assert name in routes
