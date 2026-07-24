from django.contrib.auth.views import redirect_to_login
from django.urls import NoReverseMatch
from django.urls import reverse
from django.views.generic.base import TemplateView


class PortalView(TemplateView):
    """Serve the AE portal SPA; redirect anonymous users to Auth."""

    template_name = "action_education_portal/portal.html"

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            try:
                login_url = reverse("kolibri:kolibri.plugins.user_auth:user_auth")
            except NoReverseMatch:
                login_url = reverse("kolibri:core:redirect_user")
            return redirect_to_login(request.get_full_path(), login_url=login_url)
        return super().dispatch(request, *args, **kwargs)
