"""Course progress: supports opened, mini quizzes passed, final exam passed."""

from django.core.files.base import ContentFile
from django.urls import reverse
from rest_framework.test import APITestCase

from action_education_training.constants import QUIZ_KIND_EXAM
from action_education_training.constants import STATUS_PUBLISHED
from action_education_training.models import Enrollment
from action_education_training.models import Quiz
from action_education_training.models import QuizAttempt
from action_education_training.models import ResourceView
from action_education_training.models import Training
from action_education_training.models import TrainingResource
from kolibri.core.auth.constants import role_kinds
from kolibri.core.auth.test.helpers import provision_device
from kolibri.core.auth.test.test_api import DUMMY_PASSWORD
from kolibri.core.auth.test.test_api import FacilityFactory
from kolibri.core.auth.test.test_api import FacilityUserFactory

NS = "kolibri:action_education_training"


class ProgressTests(APITestCase):
    databases = "__all__"

    @classmethod
    def setUpTestData(cls):
        provision_device()
        cls.facility = FacilityFactory.create()
        cls.admin = FacilityUserFactory.create(facility=cls.facility)
        cls.facility.add_role(cls.admin, role_kinds.ADMIN)
        cls.coach = FacilityUserFactory.create(facility=cls.facility)
        cls.facility.add_role(cls.coach, role_kinds.COACH)
        cls.other_coach = FacilityUserFactory.create(facility=cls.facility)
        cls.facility.add_role(cls.other_coach, role_kinds.COACH)
        cls.learner = FacilityUserFactory.create(facility=cls.facility, full_name="Awa")
        cls.beginner = FacilityUserFactory.create(facility=cls.facility, full_name="Binta")
        cls.training = Training.objects.create(
            title="Le rôle de la commune",
            facility=cls.facility,
            status=STATUS_PUBLISHED,
            responsible=cls.coach,
        )
        cls.resources = []
        for name in ("guide.pdf", "video.mp4"):
            resource = TrainingResource(training=cls.training, title=name, original_filename=name)
            resource.file.save(name, ContentFile(b"data"), save=True)
            cls.resources.append(resource)
        cls.quiz = Quiz.objects.create(training=cls.training, title="Quiz", status=STATUS_PUBLISHED)
        cls.exam = Quiz.objects.create(
            training=cls.training, title="Examen", kind=QUIZ_KIND_EXAM, status=STATUS_PUBLISHED
        )
        # Awa did everything; Binta just joined.
        for resource in cls.resources:
            ResourceView.objects.create(resource=resource, learner=cls.learner)
        QuizAttempt.objects.create(quiz=cls.quiz, learner=cls.learner, percent=80, passed=True)
        QuizAttempt.objects.create(quiz=cls.exam, learner=cls.learner, percent=40, passed=False)
        QuizAttempt.objects.create(quiz=cls.exam, learner=cls.learner, percent=90, passed=True)
        Enrollment.objects.create(training=cls.training, learner=cls.beginner)

    def login(self, user):
        self.client.logout()
        self.client.login(username=user.username, password=DUMMY_PASSWORD, facility=self.facility)

    def course_progress(self):
        url = reverse(f"{NS}:aeprogress_course", kwargs={"training_id": self.training.id})
        return self.client.get(url)

    def test_trainer_follows_each_learner_of_their_course(self):
        self.login(self.coach)
        response = self.course_progress()

        self.assertEqual(response.status_code, 200)
        awa, binta = response.data
        self.assertEqual((awa["full_name"], awa["percent"], awa["completed"]), ("Awa", 100, True))
        self.assertEqual(awa["exam_best_percent"], 90)
        self.assertEqual((binta["full_name"], binta["percent"]), ("Binta", 0))

    def test_admin_follows_every_course(self):
        self.login(self.admin)
        self.assertEqual(self.course_progress().status_code, 200)

        overview = self.client.get(reverse(f"{NS}:aeprogress_overview")).data
        self.assertEqual(overview[0]["learners"], 2)
        self.assertEqual(overview[0]["completed"], 1)
        self.assertEqual(overview[0]["average_percent"], 50)

    def test_trainer_overview_lists_only_their_courses(self):
        self.login(self.coach)
        overview = self.client.get(reverse(f"{NS}:aeprogress_overview")).data
        self.assertEqual([row["training"] for row in overview], [self.training.id])
        self.assertEqual(overview[0]["average_percent"], 50)

        self.login(self.other_coach)
        self.assertEqual(self.client.get(reverse(f"{NS}:aeprogress_overview")).data, [])

    def test_other_trainer_and_learners_cannot_see_course_progress(self):
        self.login(self.other_coach)
        self.assertEqual(self.course_progress().status_code, 403)
        self.login(self.learner)
        self.assertEqual(self.course_progress().status_code, 403)
        self.assertEqual(self.client.get(reverse(f"{NS}:aeprogress_overview")).status_code, 403)

    def test_learner_follows_their_own_courses(self):
        self.login(self.beginner)
        rows = self.client.get(reverse(f"{NS}:aeprogress_me")).data

        self.assertEqual(len(rows), 1)
        self.assertTrue(rows[0]["enrolled"])
        self.assertEqual(rows[0]["percent"], 0)
        self.assertEqual(rows[0]["resources_total"], 2)
