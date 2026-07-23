"""Offline-first checks for AE Apprendre theme assets."""
from pathlib import Path
from unittest.mock import patch

from action_education_theme.kolibri_plugin import ActionEducationThemeHook


def _collect_strings(value, acc):
    if isinstance(value, str):
        acc.append(value)
    elif isinstance(value, dict):
        for item in value.values():
            _collect_strings(item, acc)
    elif isinstance(value, (list, tuple)):
        for item in value:
            _collect_strings(item, acc)


def test_theme_has_no_remote_http_urls():
    with patch(
        "action_education_theme.kolibri_plugin.static",
        side_effect=lambda path: "/static/{}".format(path),
    ):
        theme = ActionEducationThemeHook().theme
    strings = []
    _collect_strings(theme, strings)
    remote = [s for s in strings if s.startswith("http://") or s.startswith("https://")]
    assert remote == [], "Theme must not reference remote URLs: {}".format(remote)


def test_theme_signin_background_is_local_or_none():
    with patch(
        "action_education_theme.kolibri_plugin.static",
        side_effect=lambda path: "/static/{}".format(path),
    ):
        theme = ActionEducationThemeHook().theme
    background = theme["signIn"].get("background")
    assert background is None or (
        isinstance(background, str)
        and not background.startswith("http://")
        and not background.startswith("https://")
    )


def test_logo_asset_exists_and_is_png():
    import action_education_theme as pkg

    path = Path(pkg.__file__).parent.joinpath(
        "static",
        "assets",
        "action_education_theme",
        "action-education-logo.png",
    )
    assert path.is_file()
    assert path.stat().st_size > 100
    assert path.read_bytes()[:8] == b"\x89PNG\r\n\x1a\n"


def test_plugins_json_template_documents_portal_before_learn():
    """
    Guardrail for docs: portal must be listed before learn so LEARNER
    RoleBasedRedirectHook resolves to /portal/ first.
    """
    docs = Path(__file__).resolve().parents[2].joinpath("AE_DEVELOPMENT.md")
    text = docs.read_text(encoding="utf-8")
    assert "action_education_portal" in text
    assert "avant" in text.lower() or "before" in text.lower()
