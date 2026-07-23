from rest_framework.permissions import BasePermission
from rest_framework.permissions import SAFE_METHODS

from kolibri.core.auth.constants import role_kinds
from kolibri.core.auth.models import FacilityUser


def _is_facility_staff(user):
    if not user or not getattr(user, "is_authenticated", False):
        return False
    if not isinstance(user, FacilityUser):
        return False
    if user.is_superuser:
        return True
    facility = getattr(user, "facility", None)
    if facility is None:
        return False
    return user.has_role_for_collection(
        [role_kinds.ADMIN, role_kinds.COACH, role_kinds.ASSIGNABLE_COACH],
        facility,
    )


class IsFacilityStaffOrReadOwn(BasePermission):
    """
    Coaches/admins: full access.
    Learners: safe methods only on objects they own (when applicable).
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if _is_facility_staff(user):
            return True
        return request.method in SAFE_METHODS

    def has_object_permission(self, request, view, obj):
        user = request.user
        if _is_facility_staff(user):
            return True
        if request.method not in SAFE_METHODS:
            return False
        learner = getattr(obj, "learner", None)
        if learner is not None:
            return learner_id_equals(learner, user)
        # Training / session readable for authenticated facility learners.
        return True


def learner_id_equals(a, b):
    return getattr(a, "id", a) == getattr(b, "id", b)
