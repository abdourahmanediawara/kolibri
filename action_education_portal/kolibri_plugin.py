from kolibri.core.auth.constants.user_kinds import ADMIN
from kolibri.core.auth.constants.user_kinds import ASSIGNABLE_COACH
from kolibri.core.auth.constants.user_kinds import COACH
from kolibri.core.auth.constants.user_kinds import LEARNER
from kolibri.core.hooks import NavigationHook
from kolibri.core.hooks import RoleBasedRedirectHook
from kolibri.core.webpack import hooks as webpack_hooks
from kolibri.plugins import KolibriPluginBase
from kolibri.plugins.hooks import register_hook


class ActionEducationPortalPlugin(KolibriPluginBase):
    """Plateforme de formation Action Éducation — interface publique."""

    translated_view_urls = "urls"

    @property
    def url_slug(self):
        return "portal/"

    def name(self, lang):
        return "Plateforme de formation Action Éducation"


@register_hook
class PortalAsset(webpack_hooks.WebpackBundleHook):
    bundle_id = "app"


@register_hook
class PortalNavItem(NavigationHook):
    bundle_id = "side_nav"


@register_hook
class PortalRedirect(RoleBasedRedirectHook):
    """Learners land on the AE learner space after login."""

    roles = (LEARNER,)

    @property
    def url(self):
        return self.plugin_url(ActionEducationPortalPlugin, "portal") + "#/ae/learn"


@register_hook
class CoachPortalRedirect(RoleBasedRedirectHook):
    """Coaches land on the AE coach space after login."""

    roles = (COACH, ASSIGNABLE_COACH)
    require_full_facility = True
    require_no_on_my_own_facility = True

    @property
    def url(self):
        return self.plugin_url(ActionEducationPortalPlugin, "portal") + "#/ae/coach"


@register_hook
class AdminPortalRedirect(RoleBasedRedirectHook):
    """Facility admins land on the AE admin space after login."""

    roles = (ADMIN,)
    require_full_facility = True
    require_no_on_my_own_facility = True

    @property
    def url(self):
        return self.plugin_url(ActionEducationPortalPlugin, "portal") + "#/ae/admin"
