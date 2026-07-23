from rest_framework import routers

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

urlpatterns = router.urls
