from django.views.generic.base import TemplateView


class PortalView(TemplateView):
    """Serve the AE portal SPA (including the AE sign-in page for anonymous users)."""

    template_name = "action_education_portal/portal.html"
