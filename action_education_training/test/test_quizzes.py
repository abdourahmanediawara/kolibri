"""Mini quizzes and final exams: written by the course trainer, graded by the server."""

from django.urls import reverse
from rest_framework.test import APITestCase

from action_education_training.constants import QUESTION_MULTIPLE
from action_education_training.constants import QUESTION_SINGLE
from action_education_training.constants import QUESTION_TRUE_FALSE
from action_education_training.constants import QUIZ_KIND_EXAM
from action_education_training.constants import STATUS_DRAFT
from action_education_training.constants import STATUS_PUBLISHED
from action_education_training.models import Certificate
from action_education_training.models import Quiz
from action_education_training.models import QuizAttempt
from action_education_training.models import Training
from kolibri.core.auth.constants import role_kinds
from kolibri.core.auth.test.helpers import provision_device
from kolibri.core.auth.test.test_api import DUMMY_PASSWORD
from kolibri.core.auth.test.test_api import FacilityFactory
from kolibri.core.auth.test.test_api import FacilityUserFactory

NS = "kolibri:action_education_training"

QUESTIONS = [
    {
        "prompt": "Qui dirige la commune ?",
        "kind": QUESTION_SINGLE,
        "points": 2,
        "explanation": "Le maire est élu par le conseil communal.",
        "choices": [
            {"text": "Le maire", "is_correct": True},
            {"text": "Le préfet", "is_correct": False},
        ],
    },
    {
        "prompt": "Que fait la commune ?",
        "kind": QUESTION_MULTIPLE,
        "choices": [
            {"text": "L'état civil", "is_correct": True},
            {"text": "Les écoles primaires", "is_correct": True},
            {"text": "L'armée", "is_correct": False},
        ],
    },
    {
        "prompt": "Le conseil communal est élu.",
        "kind": QUESTION_TRUE_FALSE,
        "choices": [
            {"text": "Vrai", "is_correct": True},
            {"text": "Faux", "is_correct": False},
        ],
    },
]


class QuizTests(APITestCase):
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
        cls.learner = FacilityUserFactory.create(facility=cls.facility)
        cls.training = Training.objects.create(
            title="Le rôle de la commune",
            facility=cls.facility,
            status=STATUS_PUBLISHED,
            responsible=cls.coach,
        )

    def login(self, user):
        self.client.logout()
        self.client.login(username=user.username, password=DUMMY_PASSWORD, facility=self.facility)

    def create_quiz(self, **data):
        payload = {
            "training": self.training.id,
            "title": "Quiz 1",
            "status": STATUS_PUBLISHED,
            "questions": QUESTIONS,
            **data,
        }
        return self.client.post(reverse(f"{NS}:aequiz-list"), payload, format="json")

    def published_quiz(self, **data):
        self.login(self.coach)
        response = self.create_quiz(**data)
        self.assertEqual(response.status_code, 201, response.content)
        return response.data

    def right_answers(self, quiz):
        return {
            question["id"]: [choice["id"] for choice in question["choices"] if choice["is_correct"]]
            for question in quiz["questions"]
        }

    def submit(self, quiz_id, answers):
        url = reverse(f"{NS}:aequiz-submit", kwargs={"pk": quiz_id})
        return self.client.post(url, {"answers": answers}, format="json")

    def test_course_trainer_writes_a_quiz(self):
        quiz = self.published_quiz()

        self.assertEqual(quiz["question_count"], 3)
        self.assertEqual(quiz["total_points"], 4)
        self.assertTrue(quiz["questions"][0]["choices"][0]["is_correct"])

    def test_other_trainer_cannot_write_a_quiz_for_the_course(self):
        self.login(self.other_coach)

        self.assertEqual(self.create_quiz().status_code, 403)

    def test_learner_cannot_write_a_quiz(self):
        self.login(self.learner)

        self.assertEqual(self.create_quiz().status_code, 403)

    def test_a_question_needs_exactly_one_right_answer(self):
        self.login(self.coach)
        wrong = dict(QUESTIONS[0], choices=[
            {"text": "A", "is_correct": True},
            {"text": "B", "is_correct": True},
        ])

        self.assertEqual(self.create_quiz(questions=[wrong]).status_code, 400)

    def test_a_quiz_without_questions_cannot_be_published(self):
        self.login(self.coach)

        self.assertEqual(self.create_quiz(questions=[]).status_code, 400)
        self.assertEqual(self.create_quiz(questions=[], status=STATUS_DRAFT).status_code, 201)

    def test_learner_never_receives_the_answer_key(self):
        quiz = self.published_quiz()
        self.login(self.learner)
        response = self.client.get(reverse(f"{NS}:aequiz-detail", kwargs={"pk": quiz["id"]}))

        choices = [choice for q in response.data["questions"] for choice in q["choices"]]
        self.assertTrue(choices)
        self.assertFalse(any("is_correct" in choice for choice in choices))
        self.assertFalse(any(q["explanation"] for q in response.data["questions"]))

    def test_learner_does_not_see_draft_quizzes(self):
        self.published_quiz(status=STATUS_DRAFT, questions=[])
        self.login(self.learner)
        response = self.client.get(reverse(f"{NS}:aequiz-list"), {"training": self.training.id})

        self.assertEqual(response.data, [])

    def test_server_grades_the_attempt(self):
        quiz = self.published_quiz()
        answers = self.right_answers(quiz)
        # Half of the multiple choice question: no points for it.
        multiple = quiz["questions"][1]
        answers[multiple["id"]] = answers[multiple["id"]][:1]
        self.login(self.learner)
        response = self.submit(quiz["id"], answers)

        self.assertEqual(response.status_code, 201, response.content)
        self.assertEqual((response.data["score"], response.data["max_score"]), (3, 4))
        self.assertEqual(response.data["percent"], 75)
        self.assertTrue(response.data["passed"])
        self.assertIn("right_choices", response.data["results"][0])

    def test_answers_stay_hidden_when_the_trainer_says_so(self):
        quiz = self.published_quiz(show_answers=False)
        self.login(self.learner)
        response = self.submit(quiz["id"], {})

        self.assertFalse(response.data["passed"])
        self.assertNotIn("right_choices", response.data["results"][0])

    def test_attempts_are_limited(self):
        quiz = self.published_quiz(max_attempts=1)
        self.login(self.learner)

        self.assertEqual(self.submit(quiz["id"], {}).status_code, 201)
        response = self.submit(quiz["id"], {})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data[0]["id"], "NO_ATTEMPTS_LEFT")

    def test_passing_the_final_exam_issues_the_certificate(self):
        exam = self.published_quiz(kind=QUIZ_KIND_EXAM, title="Examen final")
        self.login(self.learner)
        response = self.submit(exam["id"], self.right_answers(exam))

        self.assertTrue(response.data["passed"])
        self.assertTrue(response.data["certificate_number"])
        self.assertTrue(
            Certificate.objects.filter(learner=self.learner, training=self.training).exists()
        )

    def test_learners_only_see_their_own_attempts(self):
        quiz = self.published_quiz()
        other = FacilityUserFactory.create(facility=self.facility)
        QuizAttempt.objects.create(quiz=Quiz.objects.get(id=quiz["id"]), learner=other)
        self.login(self.learner)
        self.submit(quiz["id"], {})
        response = self.client.get(reverse(f"{NS}:aequizattempt-list"))

        self.assertEqual({row["learner"] for row in response.data}, {self.learner.id})
