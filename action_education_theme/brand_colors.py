"""
Brand color scales and accessibility helpers for AE Apprendre.

Primary (#F15A24 orange) matches Action Éducation chrome / hero.
Navy (#29217E) is used for text and secondary accents on white.
Scales follow Material-style v_100…v_600 expected by Kolibri Design System.
"""

PLATFORM_NAME = "AE Apprendre"
ORGANIZATION_NAME = "Action Éducation"
LOGO_ALT_TEXT = "Action Éducation"

# Brand orange — app bar, CTAs, hero chrome (Action Éducation).
PRIMARY_HEX = "#F15A24"
# Brand navy — body / title text on white surfaces.
NAVY_HEX = "#29217E"
# Alias kept for older imports / docs.
ACCENT_HEX = PRIMARY_HEX
SURFACE_HEX = "#FFFFFF"
# Navy labels on orange app bar (Action Éducation).
APP_BAR_TEXT_HEX = NAVY_HEX

# Primary scale — v_500 is Action Éducation orange.
# White text on v_500 is ~3.4:1 (OK for large UI chrome); use v_600 for
# filled controls that need WCAG AA normal text with light labels.
BRAND_PRIMARY = {
    "v_100": "#FDE6DE",
    "v_200": "#FAC5B2",
    "v_300": "#F79C7C",
    "v_400": "#F37345",
    "v_500": PRIMARY_HEX,
    "v_600": "#9D3A17",
}

# Secondary scale — v_500 is institutional navy (text / secondary chrome).
BRAND_SECONDARY = {
    "v_100": "#DFDEEC",
    "v_200": "#B4B1D2",
    "v_300": "#7F7AB2",
    "v_400": "#544D98",
    "v_500": NAVY_HEX,
    "v_600": "#1F195E",
}

BRAND_COLORS = {
    "primary": BRAND_PRIMARY,
    "secondary": BRAND_SECONDARY,
}

TOKEN_MAPPING = {
    # Chrome / hero: brand orange.
    "appBar": "brand.primary.v_500",
    "appBarDark": "brand.primary.v_600",
    # Primary fill + light text: darker orange (AA).
    "primary": "brand.primary.v_600",
    "primaryDark": "brand.primary.v_600",
}


def _srgb_channel_to_linear(channel):
    channel = channel / 255.0
    if channel <= 0.03928:
        return channel / 12.92
    return ((channel + 0.055) / 1.055) ** 2.4


def relative_luminance(hex_color):
    hex_color = hex_color.lstrip("#")
    r = _srgb_channel_to_linear(int(hex_color[0:2], 16))
    g = _srgb_channel_to_linear(int(hex_color[2:4], 16))
    b = _srgb_channel_to_linear(int(hex_color[4:6], 16))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast_ratio(foreground, background):
    lighter = max(relative_luminance(foreground), relative_luminance(background))
    darker = min(relative_luminance(foreground), relative_luminance(background))
    return (lighter + 0.05) / (darker + 0.05)
