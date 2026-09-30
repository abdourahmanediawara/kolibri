"""Contrast checks for AE Apprendre brand colors (WCAG 2.1)."""
from action_education_theme.brand_colors import ACCENT_HEX
from action_education_theme.brand_colors import BRAND_PRIMARY
from action_education_theme.brand_colors import BRAND_SECONDARY
from action_education_theme.brand_colors import contrast_ratio
from action_education_theme.brand_colors import NAVY_HEX
from action_education_theme.brand_colors import PRIMARY_HEX
from action_education_theme.brand_colors import SURFACE_HEX

# WCAG AA normal text
AA_NORMAL = 4.5
# WCAG AA large text / UI component graphics
AA_LARGE = 3.0


def test_navy_text_on_app_bar_orange_meets_aa():
    # Navy button/title labels on orange app bar (Action Éducation).
    assert contrast_ratio(NAVY_HEX, PRIMARY_HEX) >= AA_LARGE


def test_white_text_on_primary_fill_token_meets_aa():
    # TOKEN_MAPPING maps primary → v_600 for light-text fills.
    assert contrast_ratio("#FFFFFF", BRAND_PRIMARY["v_600"]) >= AA_NORMAL


def test_black_text_on_white_surface_meets_aa():
    assert contrast_ratio("#000000", SURFACE_HEX) >= AA_NORMAL


def test_navy_on_white_meets_aa_for_text_and_links():
    assert contrast_ratio(NAVY_HEX, SURFACE_HEX) >= AA_NORMAL


def test_brand_orange_on_white_is_large_accent_only():
    """
    Brand orange on white is below AA for normal text (~3.4:1).
    It may be used as a decorative accent / large graphic, not body text.
    """
    ratio = contrast_ratio(ACCENT_HEX, SURFACE_HEX)
    assert ratio < AA_NORMAL
    assert ratio >= AA_LARGE


def test_white_text_on_navy_meets_aa():
    assert contrast_ratio("#FFFFFF", BRAND_SECONDARY["v_500"]) >= AA_NORMAL


def test_black_text_on_accent_meets_aa():
    assert contrast_ratio("#000000", ACCENT_HEX) >= AA_NORMAL


def test_primary_scale_v600_darker_than_v500():
    assert contrast_ratio("#FFFFFF", BRAND_PRIMARY["v_600"]) > contrast_ratio(
        "#FFFFFF", BRAND_PRIMARY["v_500"]
    )
