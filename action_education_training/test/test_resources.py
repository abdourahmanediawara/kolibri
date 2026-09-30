from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework.test import APITestCase

from action_education_training.constants import RESOURCE_DOCUMENT
from action_education_training.constants import RESOURCE_VIDEO
from action_education_training.constants import STATUS_PUBLISHED
from action_education_training.models import Training
from action_education_training.models import TrainingResource
from kolibri.core.auth.constants import role_kinds
from kolibri.core.auth.test.helpers import provision_device
from kolibri.core.auth.test.test_api import DUMMY_PASSWORD
from kolibri.core.auth.test.test_api import FacilityFactory
from kolibri.core.auth.test.test_api import FacilityUserFactory


class TrainingResourceAPITests(APITestCase):
    databases = "__all__"

    @classmethod
    def setUpTestData(cls):
        provision_device()
        cls.facility = FacilityFactory.create()
        cls.admin = FacilityUserFactory.create(facility=cls.facility)
        cls.facility.add_role(cls.admin, role_kinds.ADMIN)
        cls.coach = FacilityUserFactory.create(facility=cls.facility)
        cls.facility.add_role(cls.coach, role_kinds.COACH)
        cls.learner = FacilityUserFactory.create(facility=cls.facility)
        cls.training = Training.objects.create(
            title="Cours PDF",
            description="Avec pieces jointes",
            facility=cls.facility,
            status=STATUS_PUBLISHED,
            responsible=cls.coach,
        )

    def _upload(self, user, filename="cours.pdf", content=b"%PDF-1.4 fake", title="Fiche"):
        self.client.login(username=user.username, password=DUMMY_PASSWORD, facility=self.facility)
        url = reverse("kolibri:action_education_training:aeresource_upload")
        uploaded = SimpleUploadedFile(filename, content, content_type="application/pdf")
        return self.client.post(
            url,
            {"training": self.training.id, "title": title, "file": uploaded},
            format="multipart",
        )

    def test_coach_can_upload_pdf_and_list(self):
        response = self._upload(self.coach)
        self.assertEqual(response.status_code, 201, response.content)
        self.assertEqual(response.data["kind"], RESOURCE_DOCUMENT)
        self.assertEqual(response.data["title"], "Fiche")
        self.assertEqual(response.data["training"], self.training.id)
        self.assertEqual(TrainingResource.objects.filter(training=self.training).count(), 1)

        list_url = reverse("kolibri:action_education_training:aeresource-list")
        listed = self.client.get(list_url, {"training": self.training.id})
        self.assertEqual(listed.status_code, 200)
        self.assertEqual(len(listed.data), 1)

    def test_coach_can_upload_video(self):
        response = self._upload(
            self.coach,
            filename="intro.mp4",
            content=b"\x00\x00\x00\x18ftypmp42",
            title="Video intro",
        )
        self.assertEqual(response.status_code, 201, response.content)
        self.assertEqual(response.data["kind"], RESOURCE_VIDEO)

    def test_rejects_disallowed_extension(self):
        response = self._upload(self.coach, filename="malware.exe", content=b"MZ")
        self.assertEqual(response.status_code, 400, response.content)
        self.assertEqual(response.data[0]["id"], "FILE_TYPE_NOT_ALLOWED")

    def test_learner_cannot_upload(self):
        response = self._upload(self.learner)
        self.assertEqual(response.status_code, 403, response.content)

    def test_learner_can_list_and_download(self):
        upload = self._upload(self.coach)
        resource_id = upload.data["id"]

        self.client.logout()
        self.client.login(
            username=self.learner.username,
            password=DUMMY_PASSWORD,
            facility=self.facility,
        )
        list_url = reverse("kolibri:action_education_training:aeresource-list")
        listed = self.client.get(list_url, {"training": self.training.id})
        self.assertEqual(listed.status_code, 200)
        self.assertEqual(len(listed.data), 1)

        download_url = reverse(
            "kolibri:action_education_training:aeresource_download",
            kwargs={"pk": resource_id},
        )
        downloaded = self.client.get(download_url)
        self.assertEqual(downloaded.status_code, 200)
        self.assertIn(b"%PDF", b"".join(downloaded.streaming_content))

    def test_coach_can_delete_resource(self):
        upload = self._upload(self.coach)
        resource_id = upload.data["id"]
        detail = reverse(
            "kolibri:action_education_training:aeresource-detail",
            kwargs={"pk": resource_id},
        )
        deleted = self.client.delete(detail)
        self.assertEqual(deleted.status_code, 204)
        self.assertFalse(TrainingResource.objects.filter(id=resource_id).exists())
