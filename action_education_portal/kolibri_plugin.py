from kolibri.core.auth.constants.user_kinds import ADMIN
from kolibri.core.auth.constants.user_kinds import ANONYMOUS
from kolibri.core.auth.constants.user_kinds import ASSIGNABLE_COACH
from kolibri.core.auth.constants.user_kinds import COACH
from kolibri.core.auth.constants.user_kinds import LEARNER
from kolibri.core.auth.constants.user_kinds import SUPERUSER
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

    @property
    def plugin_data(self):
        """Sign-in page options, mirrored from Kolibri's own auth settings."""
        from kolibri.core.auth.models import Facility
        from kolibri.core.device.utils import get_device_setting

        facility = Facility.get_default_facility()
        return {
            "defaultFacilityId": facility.id if facility else None,
            "allowGuestAccess": get_device_setting("allow_guest_access"),
            "allowLearnerSignUp": bool(facility and facility.dataset.learner_can_sign_up),
        }


@register_hook
class PortalNavItem(NavigationHook):
    bundle_id = "side_nav"


@register_hook
class SignInPortalRedirect(RoleBasedRedirectHook):
    """Visitors who are not signed in open the AE sign-in page first."""

    roles = (ANONYMOUS,)

    @property
    def url(self):
        return self.plugin_url(ActionEducationPortalPlugin, "portal") + "#/connexion"


@register_hook
class PortalRedirect(RoleBasedRedirectHook):
    """Learners land on the AE learner space after login."""

    roles = (LEARNER,)

    @property
    def url(self):
        return self.plugin_url(ActionEducationPortalPlugin, "portal") + "#/apprenant"


@register_hook
class CoachPortalRedirect(RoleBasedRedirectHook):
    """Coaches land on the AE coach space after login."""

    roles = (COACH, ASSIGNABLE_COACH)
    require_full_facility = True
    require_no_on_my_own_facility = True

    @property
    def url(self):
        return self.plugin_url(ActionEducationPortalPlugin, "portal") + "#/formateur"


@register_hook
class AdminPortalRedirect(RoleBasedRedirectHook):
    """Facility admins and super admins land on the AE admin space after login."""

    roles = (SUPERUSER, ADMIN)
    require_full_facility = True
    require_no_on_my_own_facility = True

    @property
    def url(self):
        return self.plugin_url(ActionEducationPortalPlugin, "portal") + "#/administrateur"
