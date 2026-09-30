from django.urls import re_path
from rest_framework import routers

from .coach_facility_views import CoachCreateClassroomView
from .coach_facility_views import CoachCreateLearnerView
from .coach_facility_views import UsernameAvailableView
from .report_views import AttendanceExportView
from .report_views import CertificatePrintView
from .report_views import CertificatesExportView
from .report_views import EnrollmentExportView
from .report_views import IssueCertificateView
from .progress import CourseProgressView
from .progress import MyProgressView
from .progress import ProgressOverviewView
from .quiz_views import QuizAttemptViewSet
from .quiz_views import QuizViewSet
from .report_views import SessionSummaryView
from .resource_views import ResourceViewedView
from .resource_views import TrainingResourceDownloadView
from .resource_views import TrainingResourceLinkView
from .resource_views import TrainingResourceUploadView
from .resource_views import TrainingResourceViewSet
from .results import LearnerResultsView
from .viewsets import AttendanceViewSet
from .viewsets import CertificateViewSet
from .viewsets import EnrollmentViewSet
from .viewsets import TrainingSessionViewSet
from .viewsets import TrainingViewSet

router = routers.SimpleRouter()
router.register(r"training", TrainingViewSet, basename="aetraining")
router.register(r"session", TrainingSessionViewSet, basename="aesession")
router.register(r"enrollment", EnrollmentViewSet, basename="aeenrollment")
router.register(r"attendance", AttendanceViewSet, basename="aeattendance")
router.register(r"certificate", CertificateViewSet, basename="aecertificate")
router.register(r"resource", TrainingResourceViewSet, basename="aeresource")
router.register(r"quiz", QuizViewSet, basename="aequiz")
router.register(r"quizattempt", QuizAttemptViewSet, basename="aequizattempt")

urlpatterns = [
    re_path(
        r"^coach/classroom/$",
        CoachCreateClassroomView.as_view(),
        name="aecoach_classroom",
    ),
    re_path(
        r"^coach/learner/$",
        CoachCreateLearnerView.as_view(),
        name="aecoach_learner",
    ),
    re_path(
        r"^username-available/$",
        UsernameAvailableView.as_view(),
        name="aeusername_available",
    ),
    re_path(
        r"^resource/upload/$",
        TrainingResourceUploadView.as_view(),
        name="aeresource_upload",
    ),
    re_path(
        r"^resource/link/$",
        TrainingResourceLinkView.as_view(),
        name="aeresource_link",
    ),
    re_path(
        r"^resource/(?P<pk>[^/]+)/download/$",
        TrainingResourceDownloadView.as_view(),
        name="aeresource_download",
    ),
    re_path(
        r"^resource/(?P<pk>[^/]+)/viewed/$",
        ResourceViewedView.as_view(),
        name="aeresource_viewed",
    ),
    re_path(
        r"^progress/course/(?P<training_id>[^/]+)/$",
        CourseProgressView.as_view(),
        name="aeprogress_course",
    ),
    re_path(
        r"^progress/overview/$",
        ProgressOverviewView.as_view(),
        name="aeprogress_overview",
    ),
    re_path(
        r"^progress/me/$",
        MyProgressView.as_view(),
        name="aeprogress_me",
    ),
    re_path(
        r"^learnerresults/$",
        LearnerResultsView.as_view(),
        name="aelearnerresults",
    ),
    re_path(
        r"^certificate/issue/$",
        IssueCertificateView.as_view(),
        name="aecertificate-issue",
    ),
    re_path(
        r"^certificate/(?P<pk>[^/]+)/print/$",
        CertificatePrintView.as_view(),
        name="aecertificate-print",
    ),
    re_path(
        r"^export/attendance/(?P<session_id>[^/]+)/$",
        AttendanceExportView.as_view(),
        name="aeexport-attendance",
    ),
    re_path(
        r"^export/enrollments/(?P<training_id>[^/]+)/$",
        EnrollmentExportView.as_view(),
        name="aeexport-enrollments",
    ),
    re_path(
        r"^export/certificates/$",
        CertificatesExportView.as_view(),
        name="aeexport-certificates",
    ),
    re_path(
        r"^summary/session/(?P<session_id>[^/]+)/$",
        SessionSummaryView.as_view(),
        name="aesummary-session",
    ),
] + router.urls
