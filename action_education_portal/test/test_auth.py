from django.contrib.auth.models import AnonymousUser
from django.test import RequestFactory
from django.test import TestCase

from action_education_portal.views import PortalView


class PortalViewAuthTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def test_anonymous_user_is_redirected_to_login(self):
        request = self.factory.get("/fr-fr/portal/")
        request.user = AnonymousUser()
        response = PortalView.as_view()(request)
        self.assertEqual(response.status_code, 302)
        self.assertTrue(response.url)
        self.assertNotIn("/portal/", response.url.split("?")[0])

    def test_authenticated_user_gets_portal_template(self):
        request = self.factory.get("/fr-fr/portal/")
        request.user = type("User", (), {"is_authenticated": True})()
        response = PortalView.as_view()(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.template_name, ["action_education_portal/portal.html"])
