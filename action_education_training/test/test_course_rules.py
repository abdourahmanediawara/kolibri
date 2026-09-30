"""Admins create and assign the courses; the assigned trainer manages their supports."""

from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework.test import APITestCase

from action_education_training.constants import RESOURCE_LINK
from action_education_training.constants import STATUS_PUBLISHED
from action_education_training.models import Enrollment
from action_education_training.models import ResourceView
from action_education_training.models import Training
from kolibri.core.auth.constants import role_kinds
from kolibri.core.auth.test.helpers import provision_device
from kolibri.core.auth.test.test_api import DUMMY_PASSWORD
from kolibri.core.auth.test.test_api import FacilityFactory
from kolibri.core.auth.test.test_api import FacilityUserFactory

NS = "kolibri:action_education_training"


class CourseRulesTests(APITestCase):
    databases = "__all__"

    @classmethod
    def setUpTestData(cls):
        provision_device()
        cls.facility = FacilityFactory.create()
        cls.other_facility = FacilityFactory.create()
        cls.admin = FacilityUserFactory.create(facility=cls.facility)
        cls.facility.add_role(cls.admin, role_kinds.ADMIN)
        cls.coach = FacilityUserFactory.create(facility=cls.facility)
        cls.facility.add_role(cls.coach, role_kinds.COACH)
        cls.other_coach = FacilityUserFactory.create(facility=cls.facility)
        cls.facility.add_role(cls.other_coach, role_kinds.COACH)
        cls.learner = FacilityUserFactory.create(facility=cls.facility)
        cls.training = Training.objects.create(
            title="Le rôle de la commune",
            facility=cls.facility,
            status=STATUS_PUBLISHED,
            responsible=cls.coach,
        )

    def login(self, user):
        self.client.login(username=user.username, password=DUMMY_PASSWORD, facility=self.facility)

    def create_course(self, **data):
        payload = {"title": "Hygiène et santé", "status": STATUS_PUBLISHED, **data}
        return self.client.post(reverse(f"{NS}:aetraining-list"), payload, format="json")

    # Courses

    def test_admin_creates_a_course_assigned_to_a_trainer_in_their_facility(self):
        self.login(self.admin)
        response = self.create_course(responsible=self.coach.id, facility=self.other_facility.id)

        self.assertEqual(response.status_code, 201, response.content)
        training = Training.objects.get(id=response.data["id"])
        self.assertEqual(training.responsible_id, self.coach.id)
        # The facility sent by the page is ignored: the course stays in the admin's facility.
        self.assertEqual(training.facility_id, self.facility.id)

    def test_trainer_cannot_create_a_course(self):
        self.login(self.coach)
        response = self.create_course(responsible=self.coach.id)

        self.assertEqual(response.status_code, 403, response.content)

    def test_trainer_cannot_reassign_their_course(self):
        self.login(self.coach)
        url = reverse(f"{NS}:aetraining-detail", kwargs={"pk": self.training.id})
        response = self.client.patch(url, {"responsible": self.other_coach.id}, format="json")

        self.assertEqual(response.status_code, 403, response.content)

    def test_admin_reassigns_a_course(self):
        self.login(self.admin)
        url = reverse(f"{NS}:aetraining-detail", kwargs={"pk": self.training.id})
        response = self.client.patch(url, {"responsible": self.other_coach.id}, format="json")

        self.assertEqual(response.status_code, 200, response.content)
        self.training.refresh_from_db()
        self.assertEqual(self.training.responsible_id, self.other_coach.id)

    def test_course_cannot_be_assigned_to_a_learner(self):
        self.login(self.admin)
        response = self.create_course(responsible=self.learner.id)

        self.assertEqual(response.status_code, 400, response.content)

    def test_trainer_lists_their_courses(self):
        Training.objects.create(title="Autre", facility=self.facility, responsible=self.other_coach)
        self.login(self.coach)
        response = self.client.get(
            reverse(f"{NS}:aetraining-list"), {"responsible": self.coach.id}
        )

        self.assertEqual([course["id"] for course in response.data], [self.training.id])

    def test_learners_see_the_name_of_the_trainer(self):
        self.login(self.learner)
        url = reverse(f"{NS}:aetraining-detail", kwargs={"pk": self.training.id})
        data = self.client.get(url).data

        self.assertEqual(data["responsible_name"], self.coach.full_name or self.coach.username)
        self.assertNotIn("responsible__full_name", data)
        self.assertNotIn("responsible__username", data)

    def test_learner_starts_a_published_course_once(self):
        self.login(self.learner)
        url = reverse(f"{NS}:aetraining-start", kwargs={"pk": self.training.id})

        self.assertEqual(self.client.post(url).status_code, 201)
        self.assertEqual(self.client.post(url).status_code, 200)
        self.assertEqual(
            Enrollment.objects.filter(training=self.training, learner=self.learner).count(), 1
        )

    # Supports

    def upload(self, filename="guide.pdf", content=b"%PDF-1.4 guide", content_type="application/pdf"):
        uploaded = SimpleUploadedFile(filename, content, content_type=content_type)
        return self.client.post(
            reverse(f"{NS}:aeresource_upload"),
            {"training": self.training.id, "file": uploaded},
            format="multipart",
        )

    def test_assigned_trainer_and_admin_upload_supports(self):
        self.login(self.coach)
        self.assertEqual(self.upload().status_code, 201)
        self.client.logout()
        self.login(self.admin)
        self.assertEqual(self.upload().status_code, 201)

    def test_other_trainer_cannot_upload_to_the_course(self):
        self.login(self.other_coach)

        self.assertEqual(self.upload().status_code, 403)

    def test_file_type_comes_from_the_extension_not_the_browser(self):
        self.login(self.coach)
        response = self.upload(content_type="text/html")

        self.assertEqual(response.data["mime_type"], "application/pdf")

    def test_trainer_adds_a_youtube_link(self):
        self.login(self.coach)
        response = self.client.post(
            reverse(f"{NS}:aeresource_link"),
            {
                "training": self.training.id,
                "title": "La commune expliquée",
                "url": "https://www.youtube.com/watch?v=abc123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201, response.content)
        self.assertEqual(response.data["kind"], RESOURCE_LINK)

    def test_links_must_be_web_addresses(self):
        self.login(self.coach)
        response = self.client.post(
            reverse(f"{NS}:aeresource_link"),
            {"training": self.training.id, "url": "javascript:alert(1)"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data[0]["id"], "URL_NOT_ALLOWED")

    def download(self, resource_id, **headers):
        url = reverse(f"{NS}:aeresource_download", kwargs={"pk": resource_id})
        return self.client.get(f"{url}?inline=1", **headers)

    def test_pdf_opens_in_the_page_and_players_can_seek(self):
        self.login(self.coach)
        resource_id = self.upload().data["id"]

        inline = self.download(resource_id)
        self.assertTrue(inline["Content-Disposition"].startswith("inline"))
        self.assertEqual(inline["X-Content-Type-Options"], "nosniff")

        ranged = self.download(resource_id, HTTP_RANGE="bytes=0-3")
        self.assertEqual(ranged.status_code, 206)
        self.assertEqual(ranged["Content-Range"], "bytes 0-3/14")
        self.assertEqual(b"".join(ranged.streaming_content), b"%PDF")

    def test_svg_is_always_downloaded(self):
        self.login(self.coach)
        resource_id = self.upload(
            filename="schema.svg", content=b"<svg onload='alert(1)'/>", content_type="image/svg+xml"
        ).data["id"]

        response = self.download(resource_id)
        self.assertTrue(response["Content-Disposition"].startswith("attachment"))
        self.assertIn("sandbox", response["Content-Security-Policy"])

    def test_learner_view_counts_once(self):
        self.login(self.coach)
        resource_id = self.upload().data["id"]
        self.client.logout()
        self.login(self.learner)
        url = reverse(f"{NS}:aeresource_viewed", kwargs={"pk": resource_id})

        self.assertEqual(self.client.post(url).status_code, 201)
        self.assertEqual(self.client.post(url).status_code, 200)
        self.assertEqual(ResourceView.objects.filter(learner=self.learner).count(), 1)

    def test_learner_sees_which_supports_they_opened(self):
        self.login(self.coach)
        opened = self.upload().data["id"]
        unopened = self.upload().data["id"]
        self.client.logout()
        self.login(self.learner)
        self.client.post(reverse(f"{NS}:aeresource_viewed", kwargs={"pk": opened}))

        rows = self.client.get(
            reverse(f"{NS}:aeresource-list"), {"training": self.training.id}
        ).data
        viewed = {row["id"]: row["viewed"] for row in rows}
        self.assertEqual(viewed, {opened: True, unopened: False})

    def test_learner_cannot_delete_a_support(self):
        self.login(self.coach)
        resource_id = self.upload().data["id"]
        self.client.logout()
        self.login(self.learner)
        url = reverse(f"{NS}:aeresource-detail", kwargs={"pk": resource_id})

        self.assertEqual(self.client.delete(url).status_code, 403)
