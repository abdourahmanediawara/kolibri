from django.templatetags.static import static

from .brand_colors import APP_BAR_TEXT_HEX
from .brand_colors import BRAND_COLORS
from .brand_colors import LOGO_ALT_TEXT
from .brand_colors import ORGANIZATION_NAME
from .brand_colors import PLATFORM_NAME
from .brand_colors import PRIMARY_HEX
from .brand_colors import TOKEN_MAPPING
from kolibri.core import theme_hook
from kolibri.plugins import KolibriPluginBase
from kolibri.plugins.hooks import register_hook

_LOGO_STATIC = "assets/action_education_theme/action-education-logo.png"
# Horizontal wordmark: constrain height, keep aspect ratio.
_LOGO_STYLE_APP = "height: 36px; width: auto; max-width: 200px;"
_LOGO_STYLE_SIGN_IN = (
    "margin-bottom: 12px; height: 64px; width: auto; max-width: 280px;"
)


class ActionEducationThemePlugin(KolibriPluginBase):
    """AE Apprendre theme — replaces default_theme when enabled."""

    def name(self, lang):
        return PLATFORM_NAME


@register_hook
class ActionEducationThemeHook(theme_hook.ThemeHook):
    @property
    def theme(self):
        logo_src = static(_LOGO_STATIC)
        logo = {
            "src": logo_src,
            "alt": LOGO_ALT_TEXT,
            "style": _LOGO_STYLE_APP,
        }
        return {
            "siteTitle": PLATFORM_NAME,
            "brandColors": BRAND_COLORS,
            "tokenMapping": TOKEN_MAPPING,
            "appBar": {
                "background": PRIMARY_HEX,
                "textColor": APP_BAR_TEXT_HEX,
                "topLogo": dict(logo),
            },
            "sideNav": {
                "title": PLATFORM_NAME,
                "topLogo": dict(logo),
                "showKolibriFooterLogo": False,
                "brandedFooter": {
                    "logo": {
                        "src": logo_src,
                        "alt": LOGO_ALT_TEXT,
                        "style": "height: 32px; width: auto; max-width: 180px;",
                    },
                    "paragraphArray": [ORGANIZATION_NAME],
                },
            },
            "signIn": {
                # White surface — no remote/decorative photo (offline-first).
                "background": None,
                "scrimOpacity": 0,
                "topLogo": {
                    "src": logo_src,
                    "alt": LOGO_ALT_TEXT,
                    "style": _LOGO_STYLE_SIGN_IN,
                },
                "title": PLATFORM_NAME,
                "showTitle": True,
                "titleStyle": {
                    "fontWeight": "600",
                    "fontSize": "20px",
                    "color": PRIMARY_HEX,
                },
                "showKolibriFooterLogo": False,
                "showPoweredBy": False,
            },
            "logos": [
                {
                    "src": logo_src,
                    "alt": LOGO_ALT_TEXT,
                    "content_type": "image/png",
                    "size": "275x97",
                    "maskable": False,
                },
                {
                    "src": logo_src,
                    "alt": LOGO_ALT_TEXT,
                    "content_type": "image/png",
                    "size": "192x192",
                    "maskable": False,
                },
                {
                    "src": logo_src,
                    "alt": LOGO_ALT_TEXT,
                    "content_type": "image/png",
                    "size": "512x512",
                    "maskable": False,
                },
            ],
        }
