"""Coach-facing facility helpers.

Kolibri's auth APIs only allow Facility Admins to create classrooms and users.
Action Éducation coaches need those actions in the Formateur space, so we expose
thin staff-only endpoints that create the Kolibri objects via the ORM.
"""

from django.db import transaction
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from action_education_training.permissions import IsFacilityStaffOrReadOwn
from action_education_training.permissions import _is_facility_staff
from kolibri.core.auth.constants import role_kinds
from kolibri.core.auth.models import Classroom
from kolibri.core.auth.models import FacilityUser
from kolibri.core.auth.models import Membership
from kolibri.core.auth.models import Role
from kolibri.core.error_constants import USERNAME_ALREADY_EXISTS


class CoachCreateClassroomView(APIView):
    permission_classes = (IsFacilityStaffOrReadOwn,)

    def post(self, request):
        if not _is_facility_staff(request.user):
            return Response(
                [{"id": "PERMISSION_DENIED", "metadata": {"view": "AE Create Classroom"}}],
                status=status.HTTP_403_FORBIDDEN,
            )
        name = (request.data.get("name") or "").strip()
        if not name:
            return Response(
                {"name": ["This field is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        facility = request.user.facility
        with transaction.atomic():
            classroom = Classroom.objects.create(name=name, parent=facility)
            Role.objects.get_or_create(
                user=request.user,
                collection=classroom,
                kind=role_kinds.COACH,
            )
        return Response(
            {
                "id": classroom.id,
                "name": classroom.name,
                "parent": facility.id,
                "learner_count": 0,
                "coaches": [
                    {
                        "id": request.user.id,
                        "username": request.user.username,
                        "full_name": request.user.full_name,
                    }
                ],
            },
            status=status.HTTP_201_CREATED,
        )


class CoachCreateLearnerView(APIView):
    permission_classes = (IsFacilityStaffOrReadOwn,)

    def post(self, request):
        if not _is_facility_staff(request.user):
            return Response(
                [{"id": "PERMISSION_DENIED", "metadata": {"view": "AE Create Learner"}}],
                status=status.HTTP_403_FORBIDDEN,
            )
        username = (request.data.get("username") or "").strip()
        full_name = (request.data.get("full_name") or "").strip()
        password = request.data.get("password") or ""
        classroom_id = request.data.get("classroom_id") or ""

        errors = {}
        if not username:
            errors["username"] = ["This field is required."]
        if not full_name:
            errors["full_name"] = ["This field is required."]
        if not password:
            errors["password"] = ["This field is required."]
        if not classroom_id:
            errors["classroom_id"] = ["This field is required."]
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        facility = request.user.facility
        try:
            classroom = Classroom.objects.get(id=classroom_id, parent=facility)
        except Classroom.DoesNotExist:
            return Response(
                {"classroom_id": ["Classroom not found in this facility."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if FacilityUser.objects.filter(username=username, facility=facility).exists():
            return Response(
                [{"id": USERNAME_ALREADY_EXISTS, "metadata": {"field": "username"}}],
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            user = FacilityUser(username=username, full_name=full_name, facility=facility)
            user.set_password(password)
            user.save()
            Membership.objects.get_or_create(user=user, collection=classroom)

        return Response(
            {
                "id": user.id,
                "username": user.username,
                "full_name": user.full_name,
                "facility": facility.id,
                "classroom_id": classroom.id,
            },
            status=status.HTTP_201_CREATED,
        )
