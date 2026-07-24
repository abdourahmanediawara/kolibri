"""Prefer Action Education portal role redirects without patching Kolibri core.

Native Learn / Coach / Facility plugins each register a RoleBasedRedirectHook.
Hook selection is first-match by registration order, which is not reliably
controlled by plugins.json. After all plugins have loaded, unregister those
competing redirects so PortalRedirect / CoachPortalRedirect / AdminPortalRedirect
are the only matches for LEARNER / COACH / ADMIN.

DeviceRedirect (SUPERUSER) is intentionally left in place for technical admins.
"""
import logging

logger = logging.getLogger(__name__)

_COMPETING_REDIRECTS = (
    ("kolibri.plugins.learn.kolibri_plugin", "LearnRedirect"),
    ("kolibri.plugins.coach.kolibri_plugin", "CoachRedirect"),
    ("kolibri.plugins.facility.kolibri_plugin", "FacilityRedirect"),
)


def prefer_portal_role_redirects():
    """Unregister native Learn/Coach/Facility RoleBasedRedirectHook classes."""
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
