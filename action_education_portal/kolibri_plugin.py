from kolibri.core.auth.constants.user_kinds import LEARNER
from kolibri.core.hooks import NavigationHook
from kolibri.core.hooks import RoleBasedRedirectHook
from kolibri.core.webpack import hooks as webpack_hooks
from kolibri.plugins import KolibriPluginBase
from kolibri.plugins.hooks import register_hook


class ActionEducationPortalPlugin(KolibriPluginBase):
    """Simplified learner home for AE Apprendre."""

    translated_view_urls = "urls"

    @property
    def url_slug(self):
        return "portal/"

    def name(self, lang):
        return "AE Apprendre"


@register_hook
class PortalAsset(webpack_hooks.WebpackBundleHook):
    bundle_id = "app"


@register_hook
class PortalNavItem(NavigationHook):
    bundle_id = "side_nav"


@register_hook
class PortalRedirect(RoleBasedRedirectHook):
    """
    Prefer portal for learners after login when this plugin loads before Learn.
    Coach/admin/superuser redirects remain unaffected (higher roles win first).
    """

    roles = (LEARNER,)

    @property
    def url(self):
        return self.plugin_url(ActionEducationPortalPlugin, "portal")
