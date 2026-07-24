from django.urls import re_path
from rest_framework import routers

from .report_views import AttendanceExportView
from .report_views import CertificatePrintView
from .report_views import CertificatesExportView
from .report_views import EnrollmentExportView
from .report_views import IssueCertificateView
from .report_views import SessionSummaryView
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

urlpatterns = [
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
