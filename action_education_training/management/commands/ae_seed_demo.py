"""
Demo courses to try AE Apprendre: supports (PDF, images, videos, audio, YouTube
links), mini quizzes, final exams, enrolled learners with some progress.

    kolibri manage ae_seed_demo [--media-dir DIR] [--trainer USERNAME]

Only for test devices. Idempotent: a course that already exists (same title in
the facility) is left as it is. Media files missing from --media-dir are skipped.
"""

import os

from django.core.files import File
from django.core.management.base import BaseCommand
from django.core.management.base import CommandError
from django.db import transaction

from action_education_training.constants import QUESTION_MULTIPLE
from action_education_training.constants import QUESTION_SINGLE
from action_education_training.constants import QUESTION_TRUE_FALSE
from action_education_training.constants import QUIZ_KIND_EXAM
from action_education_training.constants import RESOURCE_LINK
from action_education_training.constants import STATUS_DRAFT
from action_education_training.constants import STATUS_PUBLISHED
from action_education_training.models import Enrollment
from action_education_training.models import Quiz
from action_education_training.models import QuizAttempt
from action_education_training.models import QuizChoice
from action_education_training.models import QuizQuestion
from action_education_training.models import ResourceView
from action_education_training.models import Training
from action_education_training.models import TrainingResource
from action_education_training.permissions import _is_facility_staff
from action_education_training.reports import issue_certificate
from action_education_training.resource_utils import content_type_for_filename
from action_education_training.resource_utils import kind_for_filename
from kolibri.core.auth.models import Facility
from kolibri.core.auth.models import FacilityUser
from kolibri.utils.conf import KOLIBRI_HOME


def single(prompt, right, *wrong):
    return (QUESTION_SINGLE, prompt, [(right, True)] + [(text, False) for text in wrong])


def multiple(prompt, choices):
    return (QUESTION_MULTIPLE, prompt, choices)


def true_false(prompt, answer):
    return (QUESTION_TRUE_FALSE, prompt, [("Vrai", answer), ("Faux", not answer)])


COURSES = [
    {
        "title": "Le rôle de la commune",
        "description": "Découvrez qui dirige la commune, ce qu'elle fait pour les habitants "
        "et comment participer à la vie locale.",
        "trainer": "main",
        "status": STATUS_PUBLISHED,
        "supports": [
            ("file", "Guide de l'apprenant", "guide-role-de-la-commune.pdf"),
            ("file", "Schéma : l'organisation de la commune", "schema-organisation-commune.png"),
            (
                "link",
                "Vidéo : à quoi ça sert un élu ? (1 jour, 1 question)",
                "https://www.youtube.com/watch?v=LPCWtrCgzs4",
            ),
        ],
        "quizzes": [
            (
                "Mini-quiz 1 : qui dirige la commune ?",
                "quiz",
                [
                    single("Qui élit le conseil communal ?", "Les habitants", "Le président", "Le maire"),
                    single("Le maire est élu par…", "Le conseil communal", "Le gouverneur", "Les enseignants"),
                    true_false("La commune est la collectivité la plus proche des habitants.", True),
                ],
            ),
            (
                "Mini-quiz 2 : les services de la commune",
                "quiz",
                [
                    multiple(
                        "Quels services relèvent de la commune ?",
                        [
                            ("L'état civil", True),
                            ("L'entretien des écoles primaires", True),
                            ("La collecte des déchets", True),
                            ("La défense nationale", False),
                        ],
                    ),
                    single("Où déclarer une naissance ?", "À la mairie, au service de l'état civil", "Au marché", "À la gendarmerie"),
                    true_false("Seuls les élus peuvent assister aux sessions du conseil communal.", False),
                ],
            ),
            (
                "Examen final : le rôle de la commune",
                "exam",
                [
                    single("Qui vote le budget de la commune ?", "Le conseil communal", "Le maire seul", "Les commerçants"),
                    multiple(
                        "Comment les habitants peuvent-ils participer ?",
                        [
                            ("Voter aux élections locales", True),
                            ("Assister aux sessions publiques du conseil", True),
                            ("Participer aux réunions de quartier", True),
                            ("Ne jamais s'informer", False),
                        ],
                    ),
                    true_false("Le maire représente la commune.", True),
                    single(
                        "Quel domaine n'est PAS géré par la commune ?",
                        "La politique étrangère",
                        "Les marchés",
                        "Les points d'eau",
                    ),
                    single(
                        "Le budget participatif permet…",
                        "aux habitants de proposer des projets",
                        "au maire de ne pas publier le budget",
                        "de supprimer les élections",
                    ),
                ],
            ),
        ],
    },
    {
        "title": "Hygiène et santé au quotidien",
        "description": "Les bons gestes pour se protéger : lavage des mains, eau potable "
        "et prévention du paludisme.",
        "trainer": "main",
        "status": STATUS_PUBLISHED,
        "supports": [
            ("file", "Fiche pratique", "fiche-hygiene-au-quotidien.pdf"),
            ("file", "Affiche : se laver les mains en 6 gestes", "affiche-lavage-des-mains.png"),
            (
                "link",
                "Vidéo : technique de lavage des mains en 7 étapes",
                "https://www.youtube.com/watch?v=t8yCimVcer4",
            ),
            (
                "link",
                "Vidéo : la comptine du lavage des mains",
                "https://www.youtube.com/watch?v=YGFInacOOqA",
            ),
        ],
        "quizzes": [
            (
                "Mini-quiz : le lavage des mains",
                "quiz",
                [
                    single("Combien de temps faut-il se frotter les mains ?", "Au moins 20 secondes", "2 secondes", "5 minutes"),
                    multiple(
                        "Quand faut-il se laver les mains ?",
                        [
                            ("Avant de manger", True),
                            ("Après être allé aux toilettes", True),
                            ("Après avoir touché des déchets", True),
                            ("Uniquement le dimanche", False),
                        ],
                    ),
                    true_false("L'eau seule suffit, le savon est inutile.", False),
                ],
            ),
            (
                "Examen final : hygiène et santé",
                "exam",
                [
                    multiple(
                        "Comment rendre l'eau de boisson plus sûre ?",
                        [
                            ("La faire bouillir", True),
                            ("La traiter au chlore", True),
                            ("La laisser dans un seau ouvert", False),
                        ],
                    ),
                    single(
                        "La meilleure protection contre le paludisme la nuit :",
                        "Dormir sous une moustiquaire imprégnée",
                        "Laisser la fenêtre ouverte",
                        "Boire du thé chaud",
                    ),
                    single(
                        "En cas de fièvre, il faut…",
                        "consulter rapidement un centre de santé",
                        "attendre une semaine",
                        "prendre n'importe quel médicament",
                    ),
                    true_false("Les eaux stagnantes favorisent les moustiques.", True),
                ],
            ),
        ],
    },
    {
        "title": "Apprendre les maths avec les jeux traditionnels",
        "description": "Compter, raisonner et anticiper grâce aux jeux de plateau "
        "traditionnels du monde entier.",
        "trainer": "main",
        "status": STATUS_PUBLISHED,
        "supports": [
            ("file", "Vidéo : le Mehen", "video-mehen.mp4"),
            ("file", "Vidéo : le Surakarta", "video-surakarta.mp4"),
            ("file", "Vidéo : les cinq lignes", "video-les-cinq-lignes.mp4"),
            ("file", "Règles et activités", "regles-jeux-traditionnels.pdf"),
        ],
        "quizzes": [
            (
                "Mini-quiz : compter et anticiper",
                "quiz",
                [
                    single("Dans le Mehen, on avance ses pions…", "en comptant les cases", "au hasard", "en reculant toujours"),
                    single("2, 4, 6, 8… quel nombre vient ensuite ?", "10", "9", "12"),
                    true_false("Les jeux de stratégie font travailler la logique.", True),
                ],
            ),
            (
                "Examen final : jeux et calcul",
                "exam",
                [
                    single("5, 10, 15, 20… quel nombre vient ensuite ?", "25", "21", "30"),
                    single("Le Surakarta est un jeu originaire…", "d'Indonésie", "du Brésil", "du Canada"),
                    multiple(
                        "Quelles compétences ces jeux développent-ils ?",
                        [
                            ("Le calcul", True),
                            ("La logique", True),
                            ("La stratégie", True),
                            ("La couture", False),
                        ],
                    ),
                ],
            ),
        ],
    },
    {
        "title": "Anglais de base : se présenter",
        "description": "Saluer, dire son nom, d'où l'on vient et compter jusqu'à dix, "
        "avec des dialogues à écouter.",
        "trainer": "second",
        "status": STATUS_PUBLISHED,
        "supports": [
            ("file", "Dialogue 1 : bonjour !", "dialogue-1-bonjour.wav"),
            ("file", "Dialogue 2 : d'où viens-tu ?", "dialogue-2-d-ou-viens-tu.wav"),
            ("file", "Compter de 1 à 10", "compter-de-1-a-10.wav"),
            ("file", "Vocabulaire", "vocabulaire-anglais-se-presenter.pdf"),
        ],
        "quizzes": [
            (
                "Mini-quiz : les salutations",
                "quiz",
                [
                    single("Comment dit-on « Je m'appelle Awa » ?", "My name is Awa", "I am from Awa", "Goodbye Awa"),
                    single("« Nice to meet you » veut dire…", "Enchanté(e)", "Au revoir", "Merci beaucoup"),
                    true_false("« seven » signifie 7.", True),
                ],
            ),
            (
                "Examen final : se présenter en anglais",
                "exam",
                [
                    single("« Where are you from? » signifie…", "D'où viens-tu ?", "Où vas-tu ?", "Quel âge as-tu ?"),
                    multiple(
                        "Quelles phrases servent à se présenter ?",
                        [
                            ("My name is…", True),
                            ("I am from…", True),
                            ("I live in…", True),
                            ("See you soon!", False),
                        ],
                    ),
                    single("« ten » correspond au nombre…", "10", "2", "12"),
                ],
            ),
        ],
    },
    {
        "title": "Les droits de l'enfant",
        "description": "La Convention internationale des droits de l'enfant expliquée simplement.",
        "trainer": "main",
        "status": STATUS_DRAFT,
        "supports": [
            (
                "link",
                "Vidéo : c'est quoi les droits de l'enfant ? (1 jour, 1 question)",
                "https://www.youtube.com/watch?v=y63NNvyWumY",
            ),
        ],
        "quizzes": [],
    },
]


class Command(BaseCommand):
    help = "Create demo courses, supports, quizzes and learner progress (test devices only)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--media-dir",
            default=os.path.join(KOLIBRI_HOME, "ae_demo_media"),
            help="Folder with the demo files (PDF, PNG, MP4, WAV).",
        )
        parser.add_argument("--trainer", default="ae_coach", help="Trainer of most courses.")
        parser.add_argument(
            "--second-trainer",
            default="adiawara",
            help="Trainer of the English course (falls back to --trainer).",
        )

    def handle(self, *args, **options):
        facility = Facility.get_default_facility()
        if facility is None:
            raise CommandError("No facility on this device.")
        main = self._staff(facility, options["trainer"])
        if main is None:
            raise CommandError(f"Trainer {options['trainer']} not found in {facility.name}.")
        trainers = {"main": main, "second": self._staff(facility, options["second_trainer"]) or main}
        learners = [
            user
            for user in FacilityUser.objects.filter(facility=facility).order_by("username")
            if not _is_facility_staff(user)
        ]
        media_dir = options["media_dir"]

        created = []
        for spec in COURSES:
            if Training.objects.filter(facility=facility, title=spec["title"]).exists():
                self.stdout.write(f"Exists, left as is: {spec['title']}")
                continue
            with transaction.atomic():
                created.append(self._course(facility, spec, trainers, media_dir))
            self.stdout.write(self.style.SUCCESS(f"Created: {spec['title']}"))

        if created:
            self._learner_activity(created, learners)
        self.stdout.write(self.style.SUCCESS(f"{len(created)} demo course(s) created."))

    def _staff(self, facility, username):
        user = FacilityUser.objects.filter(facility=facility, username=username).first()
        return user if user and _is_facility_staff(user) else None

    def _course(self, facility, spec, trainers, media_dir):
        trainer = trainers[spec["trainer"]]
        training = Training.objects.create(
            title=spec["title"],
            description=spec["description"],
            facility=facility,
            status=spec["status"],
            responsible=trainer,
        )
        for order, (kind, title, source) in enumerate(spec["supports"]):
            if kind == "link":
                TrainingResource.objects.create(
                    training=training,
                    title=title,
                    kind=RESOURCE_LINK,
                    url=source,
                    uploaded_by=trainer,
                    sort_order=order,
                )
                continue
            path = os.path.join(media_dir, source)
            if not os.path.exists(path):
                self.stdout.write(self.style.WARNING(f"  Missing file, skipped: {path}"))
                continue
            resource = TrainingResource(
                training=training,
                title=title,
                kind=kind_for_filename(source),
                original_filename=source,
                mime_type=content_type_for_filename(source),
                size_bytes=os.path.getsize(path),
                uploaded_by=trainer,
                sort_order=order,
            )
            with open(path, "rb") as handle:
                resource.file.save(source, File(handle), save=False)
            resource.save()

        for order, (title, kind, questions) in enumerate(spec["quizzes"]):
            quiz = Quiz.objects.create(
                training=training,
                title=title,
                kind=QUIZ_KIND_EXAM if kind == "exam" else kind,
                status=STATUS_PUBLISHED,
                pass_percent=60 if kind == "exam" else 50,
                max_attempts=3 if kind == "exam" else 0,
                show_answers=kind != "exam",
                sort_order=order,
                created_by=trainer,
            )
            for question_order, (question_kind, prompt, choices) in enumerate(questions):
                question = QuizQuestion.objects.create(
                    quiz=quiz, prompt=prompt, kind=question_kind, sort_order=question_order
                )
                for choice_order, (text, is_correct) in enumerate(choices):
                    QuizChoice.objects.create(
                        question=question, text=text, is_correct=is_correct, sort_order=choice_order
                    )
        return training

    def _learner_activity(self, trainings, learners):
        """Some learners are enrolled and moved forward, so progress screens have data."""
        published = [training for training in trainings if training.status == STATUS_PUBLISHED]
        for index, learner in enumerate(learners):
            for course_index, training in enumerate(published):
                Enrollment.objects.get_or_create(training=training, learner=learner)
                # Earlier learners in the list went further, in the first courses.
                depth = max(0, 3 - index - course_index)
                resources = list(training.resources.all())
                for resource in resources[: depth + 1]:
                    ResourceView.objects.get_or_create(resource=resource, learner=learner)
                quizzes = list(training.quizzes.order_by("sort_order"))
                for quiz in quizzes[:depth]:
                    passed = quiz.kind != QUIZ_KIND_EXAM or depth >= 3
                    percent = 100 if passed else 40
                    QuizAttempt.objects.create(
                        quiz=quiz,
                        learner=learner,
                        score=percent,
                        max_score=100,
                        percent=percent,
                        passed=passed,
                    )
                    if quiz.kind == QUIZ_KIND_EXAM and passed:
                        issue_certificate(
                            learner, training, criteria_met=f"Examen final réussi ({percent} %)."
                        )
