"""Prefer Action Education portal role redirects without patching Kolibri core.

Native Learn / Coach / Facility plugins each register a RoleBasedRedirectHook.
Hook selection is first-match by registration order, which is not reliably
controlled by plugins.json. After all plugins have loaded, unregister those
competing redirects so PortalRedirect / CoachPortalRedirect / AdminPortalRedirect
are the only matches for LEARNER / COACH / ADMIN / SUPERUSER, and
SignInPortalRedirect the only match for ANONYMOUS.

Super admins also land in the AE admin space; Kolibri Device stays reachable from
the "Administration technique" link of their account menu.
"""
import logging

from django.http import HttpResponseRedirect

logger = logging.getLogger(__name__)

_COMPETING_REDIRECTS = (
    ("kolibri.plugins.learn.kolibri_plugin", "LearnRedirect"),
    ("kolibri.plugins.coach.kolibri_plugin", "CoachRedirect"),
    ("kolibri.plugins.facility.kolibri_plugin", "FacilityRedirect"),
    # Anonymous visitors: the AE sign-in page replaces Kolibri's own.
    ("kolibri.plugins.user_auth.kolibri_plugin", "LogInRedirect"),
    # Super admins: the AE admin space replaces Kolibri Device as landing page.
    ("kolibri.plugins.device.kolibri_plugin", "DeviceRedirect"),
)


def prefer_portal_role_redirects():
    """Unregister native Learn/Coach/Facility/UserAuth/Device RoleBasedRedirectHook classes."""
    for module_path, class_name in _COMPETING_REDIRECTS:
        try:
            module = __import__(module_path, fromlist=[class_name])
            redirect_cls = getattr(module, class_name)
            redirect_cls.remove_hook_from_registries()
            logger.debug("Unregistered competing redirect %s.%s", module_path, class_name)
        except Exception:
            logger.exception(
                "Could not unregister competing redirect %s.%s", module_path, class_name
            )


# Native Kolibri pages the AE portal replaces: (module, view class, query flag that keeps
# the page open when an AE page sends someone there on purpose, AE page to open instead).
_NATIVE_PAGES = (
    ("kolibri.plugins.learn.views", "LearnView", "ae_exercise", ""),
    ("kolibri.plugins.learn.views", "MyDownloadsView", None, ""),
    ("kolibri.plugins.coach.views", "CoachView", None, ""),
    ("kolibri.plugins.facility.views", "FacilityManagementView", "ae_advanced", ""),
    ("kolibri.plugins.user_profile.views", "UserProfileView", None, "/profil"),
    ("kolibri.plugins.user_auth.views", "UserAuthView", "ae_auth", ""),
)


def _ae_space_url(request, section=""):
    """The AE space of the person (the sign-in page for visitors), plus an optional section."""
    from kolibri.core.views import RootURLRedirectView

    view = RootURLRedirectView()
    view.request = request
    url = view.get_redirect_url()
    if section and request.user.is_authenticated:
        url += section
    return url


def _can_use_device_page(user):
    return user.is_authenticated and (
        user.is_superuser or getattr(user, "can_manage_content", False)
    )


def _send_to_ae_space(view_class, keep_flag, section):
    original = view_class.dispatch
    if getattr(original, "ae_portal", False):
        return

    def dispatch(self, request, *args, **kwargs):
        if keep_flag and keep_flag in request.GET:
            return original(self, request, *args, **kwargs)
        return HttpResponseRedirect(_ae_space_url(request, section))

    dispatch.ae_portal = True
    view_class.dispatch = dispatch


def _keep_device_for_technical_admins(view_class):
    """Kolibri Device (content import, device settings) stays for those who manage the device."""
    original = view_class.dispatch
    if getattr(original, "ae_portal", False):
        return

    def dispatch(self, request, *args, **kwargs):
        if _can_use_device_page(request.user):
            return original(self, request, *args, **kwargs)
        return HttpResponseRedirect(_ae_space_url(request))

    dispatch.ae_portal = True
    view_class.dispatch = dispatch


def send_native_pages_to_portal():
    """Native Learn / Coach / Facility / Profile / sign-in pages open the AE space instead."""
    for module_path, class_name, keep_flag, section in _NATIVE_PAGES:
        try:
            module = __import__(module_path, fromlist=[class_name])
            _send_to_ae_space(getattr(module, class_name), keep_flag, section)
        except Exception:
            logger.exception("Could not redirect native page %s.%s", module_path, class_name)
    try:
        from kolibri.plugins.device.views import DeviceManagementView

        _keep_device_for_technical_admins(DeviceManagementView)
    except Exception:
        logger.exception("Could not restrict the native device page")
