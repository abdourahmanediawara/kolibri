"""Tests for AE Apprendre theme structure and ThemeHook contract."""
from unittest.mock import patch

from action_education_theme.brand_colors import ACCENT_HEX
from action_education_theme.brand_colors import BRAND_COLORS
from action_education_theme.brand_colors import BRAND_PRIMARY
from action_education_theme.brand_colors import BRAND_SECONDARY
from action_education_theme.brand_colors import LOGO_ALT_TEXT
from action_education_theme.brand_colors import ORGANIZATION_NAME
from action_education_theme.brand_colors import PLATFORM_NAME
from action_education_theme.brand_colors import PRIMARY_HEX
from action_education_theme.brand_colors import TOKEN_MAPPING


REQUIRED_SCALE_KEYS = ("v_100", "v_200", "v_300", "v_400", "v_500", "v_600")


def test_brand_scales_have_required_material_keys():
    for scale_name, scale in BRAND_COLORS.items():
        for key in REQUIRED_SCALE_KEYS:
            assert key in scale, f"{scale_name} missing {key}"
            assert scale[key].startswith("#") and len(scale[key]) == 7


def test_primary_and_accent_anchors():
    from action_education_theme.brand_colors import NAVY_HEX

    assert BRAND_PRIMARY["v_500"] == PRIMARY_HEX
    assert BRAND_PRIMARY["v_500"] == ACCENT_HEX
    assert BRAND_SECONDARY["v_500"] == NAVY_HEX


def test_token_mapping_keeps_app_bar_on_orange_primary():
    assert TOKEN_MAPPING["appBar"] == "brand.primary.v_500"
    assert TOKEN_MAPPING["appBarDark"] == "brand.primary.v_600"
    # Orange v_500 is not used as a light-text fill token.
    assert TOKEN_MAPPING["primary"] == "brand.primary.v_600"
    assert TOKEN_MAPPING["primaryDark"] == "brand.primary.v_600"


def test_theme_hook_returns_ae_apprendre_identity():
    from action_education_theme.kolibri_plugin import ActionEducationThemeHook

    with patch(
        "action_education_theme.kolibri_plugin.static",
        side_effect=lambda path: f"/static/{path}",
    ):
        theme = ActionEducationThemeHook().theme

    assert theme["siteTitle"] == PLATFORM_NAME
    assert theme["signIn"]["title"] == PLATFORM_NAME
    assert theme["sideNav"]["title"] == PLATFORM_NAME
    assert theme["sideNav"]["brandedFooter"]["paragraphArray"] == [ORGANIZATION_NAME]

    assert theme["brandColors"] == BRAND_COLORS
    assert theme["tokenMapping"] == TOKEN_MAPPING

    from action_education_theme.brand_colors import NAVY_HEX

    assert theme["appBar"]["background"] == PRIMARY_HEX
    assert theme["appBar"]["textColor"] == NAVY_HEX
    assert theme["appBar"]["topLogo"]["href"]

    for section in ("appBar", "sideNav", "signIn"):
        logo = (
            theme[section]["topLogo"]
            if section != "sideNav"
            else theme["sideNav"]["topLogo"]
        )
        assert logo["alt"] == LOGO_ALT_TEXT
        assert logo["src"].endswith(
            "assets/action_education_theme/action-education-logo.png"
        )

    assert theme["signIn"]["showKolibriFooterLogo"] is False
    assert theme["sideNav"]["showKolibriFooterLogo"] is False
    assert theme["logos"]
    for entry in theme["logos"]:
        assert entry["alt"] == LOGO_ALT_TEXT


def test_theme_hook_is_kolibri_theme_hook_subclass():
    from kolibri.core.theme_hook import ThemeHook

    from action_education_theme.kolibri_plugin import ActionEducationThemeHook

    assert issubclass(ActionEducationThemeHook, ThemeHook)


def test_static_logo_file_is_packaged():
    import os

    import action_education_theme as pkg

    path = os.path.join(
        os.path.dirname(pkg.__file__),
        "static",
        "assets",
        "action_education_theme",
        "action-education-logo.png",
    )
    assert os.path.isfile(path)
    assert os.path.getsize(path) > 0
