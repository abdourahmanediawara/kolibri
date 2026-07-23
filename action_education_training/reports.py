import csv
import io
import uuid

from django.utils.html import escape
from django.utils.timezone import localtime

from action_education_training.constants import ATTENDANCE_LATE
from action_education_training.constants import ATTENDANCE_PRESENT
from action_education_training.models import Attendance
from action_education_training.models import Certificate
from action_education_training.models import Enrollment
from kolibri.utils.time_utils import local_now


def generate_certificate_number(training_id):
    stamp = local_now().strftime("%Y%m%d")
    short = (training_id or "AE")[:6].upper()
    suffix = uuid.uuid4().hex[:6].upper()
    return "AE-{}-{}-{}".format(short, stamp, suffix)


def build_certificate_html(certificate, learner_name, training_title, organization="Action Éducation"):
    issued = certificate.issued_at
    if hasattr(issued, "strftime"):
        try:
            issued_label = localtime(issued).strftime("%d/%m/%Y")
        except Exception:
            issued_label = issued.strftime("%d/%m/%Y")
    else:
        issued_label = str(issued)[:10]
    return """<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Certificat {number}</title>
  <style>
    body {{ font-family: Arial, sans-serif; margin: 40px; color: #1F2937; }}
    .frame {{ border: 4px solid #29217E; padding: 32px; max-width: 800px; margin: 0 auto; }}
    h1 {{ color: #29217E; margin-bottom: 8px; }}
    .accent {{ color: #F15A24; font-weight: bold; }}
    .meta {{ margin-top: 24px; color: #5F6470; }}
    .sign {{ margin-top: 48px; border-top: 1px solid #5F6470; width: 240px; padding-top: 8px; }}
    @media print {{ body {{ margin: 0; }} }}
  </style>
</head>
<body>
  <div class="frame">
    <p class="accent">{org}</p>
    <h1>AE Apprendre</h1>
    <p>Certificat de participation</p>
    <p>Décerné à <strong>{learner}</strong></p>
    <p>pour la formation <strong>{training}</strong></p>
    <p class="meta">N° {number}<br/>Date : {date}</p>
    <p class="meta">{criteria}</p>
    <div class="sign">Signature</div>
  </div>
</body>
</html>
""".format(
        org=escape(organization),
        learner=escape(learner_name or ""),
        training=escape(training_title or ""),
        number=escape(certificate.certificate_number),
        date=escape(issued_label),
        criteria=escape(certificate.criteria_met or ""),
    )


def issue_certificate(learner, training, criteria_met=""):
    existing = Certificate.objects.filter(learner=learner, training=training).first()
    if existing:
        return existing, False
    cert = Certificate(
        learner=learner,
        training=training,
        certificate_number=generate_certificate_number(training.id),
        criteria_met=criteria_met
        or "Participation à la formation et critères validés par le formateur.",
    )
    learner_name = getattr(learner, "full_name", None) or getattr(learner, "username", "")
    cert.printable_payload = build_certificate_html(cert, learner_name, training.title)
    cert.save()
    return cert, True


def _csv_response_rows(fieldnames, rows):
    buffer = io.StringIO()
    # Excel-friendly UTF-8 BOM for French Windows users.
    buffer.write("\ufeff")
    writer = csv.DictWriter(buffer, fieldnames=fieldnames, delimiter=";")
    writer.writeheader()
    for row in rows:
        writer.writerow(row)
    return buffer.getvalue()


def attendance_csv_for_session(session):
    rows = []
    for item in Attendance.objects.filter(session=session).select_related("learner", "recorded_by"):
        rows.append(
            {
                "session_id": session.id,
                "training": session.training.title,
                "location": session.location,
                "learner_username": item.learner.username,
                "learner_name": item.learner.full_name,
                "status": item.status,
                "recorded_by": item.recorded_by.username if item.recorded_by else "",
                "date_recorded": str(item.date_recorded),
                "comment": item.comment,
            }
        )
    return _csv_response_rows(
        [
            "session_id",
            "training",
            "location",
            "learner_username",
            "learner_name",
            "status",
            "recorded_by",
            "date_recorded",
            "comment",
        ],
        rows,
    )


def enrollments_csv_for_training(training):
    rows = []
    for item in Enrollment.objects.filter(training=training).select_related("learner", "session"):
        rows.append(
            {
                "training": training.title,
                "learner_username": item.learner.username,
                "learner_name": item.learner.full_name,
                "session_id": item.session_id or "",
                "status": item.status,
                "date_enrolled": str(item.date_enrolled),
            }
        )
    return _csv_response_rows(
        [
            "training",
            "learner_username",
            "learner_name",
            "session_id",
            "status",
            "date_enrolled",
        ],
        rows,
    )


def certificates_csv_for_facility(facility_id):
    rows = []
    qs = Certificate.objects.filter(training__facility_id=facility_id).select_related(
        "learner", "training"
    )
    for item in qs:
        rows.append(
            {
                "certificate_number": item.certificate_number,
                "training": item.training.title,
                "learner_username": item.learner.username,
                "learner_name": item.learner.full_name,
                "issued_at": str(item.issued_at),
                "criteria_met": item.criteria_met,
            }
        )
    return _csv_response_rows(
        [
            "certificate_number",
            "training",
            "learner_username",
            "learner_name",
            "issued_at",
            "criteria_met",
        ],
        rows,
    )


def attendance_rate_for_session(session):
    total = Enrollment.objects.filter(session=session).count()
    if total == 0:
        total = Enrollment.objects.filter(training=session.training).count()
    present = Attendance.objects.filter(
        session=session, status__in=(ATTENDANCE_PRESENT, ATTENDANCE_LATE)
    ).count()
    if total == 0:
        return 0.0
    return round((present / float(total)) * 100.0, 1)
