from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from action_education_training.models import Certificate
from action_education_training.models import Training
from action_education_training.models import TrainingSession
from action_education_training.permissions import IsFacilityStaffOrReadOwn
from action_education_training.permissions import _is_facility_staff
from action_education_training.reports import attendance_csv_for_session
from action_education_training.reports import attendance_rate_for_session
from action_education_training.reports import certificates_csv_for_facility
from action_education_training.reports import enrollments_csv_for_training
from action_education_training.reports import issue_certificate
from action_education_training.serializers import CertificateSerializer
from kolibri.core.auth.models import FacilityUser


def _csv_http_response(content, filename):
    response = HttpResponse(content, content_type="text/csv; charset=utf-8")
    response["Content-Disposition"] = 'attachment; filename="{}"'.format(filename)
    return response


class IssueCertificateView(APIView):
    permission_classes = (IsFacilityStaffOrReadOwn,)

    def post(self, request):
        if not _is_facility_staff(request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)
        learner_id = request.data.get("learner")
        training_id = request.data.get("training")
        criteria = request.data.get("criteria_met", "")
        if not learner_id or not training_id:
            return Response(
                {"detail": "learner and training are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        training = get_object_or_404(
            Training, id=training_id, facility_id=request.user.facility_id
        )
        learner = get_object_or_404(
            FacilityUser, id=learner_id, facility_id=request.user.facility_id
        )
        cert, created = issue_certificate(learner, training, criteria_met=criteria)
        data = CertificateSerializer(cert).data
        data["created"] = created
        return Response(
            data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )


class CertificatePrintView(APIView):
    permission_classes = (IsFacilityStaffOrReadOwn,)

    def get(self, request, pk):
        cert = get_object_or_404(Certificate, id=pk)
        if _is_facility_staff(request.user):
            if cert.training.facility_id != request.user.facility_id:
                return Response(status=status.HTTP_403_FORBIDDEN)
        elif cert.learner_id != request.user.id:
            return Response(status=status.HTTP_403_FORBIDDEN)
        html = cert.printable_payload or "<p>Certificat indisponible</p>"
        return HttpResponse(html, content_type="text/html; charset=utf-8")


class AttendanceExportView(APIView):
    permission_classes = (IsFacilityStaffOrReadOwn,)

    def get(self, request, session_id):
        if not _is_facility_staff(request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)
        session = get_object_or_404(
            TrainingSession,
            id=session_id,
            training__facility_id=request.user.facility_id,
        )
        content = attendance_csv_for_session(session)
        return _csv_http_response(content, "ae-attendance-{}.csv".format(session_id[:8]))


class EnrollmentExportView(APIView):
    permission_classes = (IsFacilityStaffOrReadOwn,)

    def get(self, request, training_id):
        if not _is_facility_staff(request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)
        training = get_object_or_404(
            Training, id=training_id, facility_id=request.user.facility_id
        )
        content = enrollments_csv_for_training(training)
        return _csv_http_response(content, "ae-enrollments-{}.csv".format(training_id[:8]))


class CertificatesExportView(APIView):
    permission_classes = (IsFacilityStaffOrReadOwn,)

    def get(self, request):
        if not _is_facility_staff(request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)
        content = certificates_csv_for_facility(request.user.facility_id)
        return _csv_http_response(content, "ae-certificates.csv")


class SessionSummaryView(APIView):
    permission_classes = (IsFacilityStaffOrReadOwn,)

    def get(self, request, session_id):
        if not _is_facility_staff(request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)
        session = get_object_or_404(
            TrainingSession,
            id=session_id,
            training__facility_id=request.user.facility_id,
        )
        return Response(
            {
                "session": session.id,
                "training": session.training_id,
                "training_title": session.training.title,
                "attendance_rate": attendance_rate_for_session(session),
            }
        )
