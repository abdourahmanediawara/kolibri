from django.apps import AppConfig


class ActionEducationPortalConfig(AppConfig):
    name = "action_education_portal"
    verbose_name = "Action Education Portal"

    def ready(self):
        # Runs after all INSTALLED_APPS (including Learn/Coach/Facility) have
        # registered their hooks — safe place to unregister competing redirects.
        from action_education_portal.redirects import prefer_portal_role_redirects
        from action_education_portal.redirects import send_native_pages_to_portal

        prefer_portal_role_redirects()
        # People who open a native Kolibri page (bookmark, old link) land in their AE space.
        send_native_pages_to_portal()

        from action_education_portal import signals  # noqa: F401
