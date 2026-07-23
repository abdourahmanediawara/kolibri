"""
Brand color scales and accessibility helpers for AE Apprendre.

Primary (#29217E) and accent (#F15A24) follow Material-style v_100…v_600
scales expected by Kolibri Design System / ThemeHook.
"""

PLATFORM_NAME = "AE Apprendre"
ORGANIZATION_NAME = "Action Éducation"
LOGO_ALT_TEXT = "Action Éducation"

PRIMARY_HEX = "#29217E"
ACCENT_HEX = "#F15A24"
SURFACE_HEX = "#FFFFFF"
APP_BAR_TEXT_HEX = "#FFFFFF"

# Primary scale — v_500 is the institutional blue/purple.
BRAND_PRIMARY = {
    "v_100": "#DFDEEC",
    "v_200": "#B4B1D2",
    "v_300": "#7F7AB2",
    "v_400": "#544D98",
    "v_500": PRIMARY_HEX,
    "v_600": "#1F195E",
}

# Secondary / accent scale — v_500 is the brand orange.
# White text on v_500 fails WCAG AA (~3.4:1); use v_600 for filled
# controls that need light text, or place accent on white with dark text.
BRAND_SECONDARY = {
    "v_100": "#FDE6DE",
    "v_200": "#FAC5B2",
    "v_300": "#F79C7C",
    "v_400": "#F37345",
    "v_500": ACCENT_HEX,
    "v_600": "#9D3A17",
}

BRAND_COLORS = {
    "primary": BRAND_PRIMARY,
    "secondary": BRAND_SECONDARY,
}

# Remap tokens so chrome that expects light text does not sit on orange.
TOKEN_MAPPING = {
    # Default KDS maps appBar → brand.secondary.v_400 (would be orange here).
    "appBar": "brand.primary.v_500",
    "appBarDark": "brand.primary.v_600",
    # Secondary token used as fill + light text: use darker orange (AA).
    "secondary": "brand.secondary.v_600",
    "secondaryDark": "brand.secondary.v_600",
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
