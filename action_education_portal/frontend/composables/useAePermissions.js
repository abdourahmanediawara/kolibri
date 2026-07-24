import { computed } from 'vue';
import useUser from 'kolibri/composables/useUser';

/**
 * Single source of truth for Action Éducation UI permissions.
 * Derived from Kolibri session kinds / flags — never from group names alone.
 */
export function useAePermissions() {
  const {
    isUserLoggedIn,
    isLearner,
    isCoach,
    isAdmin,
    isSuperuser,
    isFacilityAdmin,
    canManageContent: sessionCanManageContent,
    userKind,
    full_name,
    username,
    currentUserId,
    userFacilityId,
  } = useUser();

  const canViewLearnerArea = computed(
    () => isUserLoggedIn.value && (isLearner.value || isCoach.value || isAdmin.value || isSuperuser.value),
  );

  const canViewCoachArea = computed(
    () => isUserLoggedIn.value && (isCoach.value || isAdmin.value || isSuperuser.value),
  );

  const canManageSessions = computed(() => canViewCoachArea.value);

  const canViewAdminDashboard = computed(
    () => isUserLoggedIn.value && (isAdmin.value || isSuperuser.value),
  );

  const canManageUsers = computed(() => canViewAdminDashboard.value);

  const canManageContent = computed(
    () =>
      isUserLoggedIn.value &&
      (sessionCanManageContent.value || isAdmin.value || isSuperuser.value),
  );

  const canAccessTechnicalAdministration = computed(
    () => isUserLoggedIn.value && (isSuperuser.value || canManageContent.value),
  );

  /** Post-login landing hash path inside /portal/ */
  const defaultLandingPath = computed(() => {
    if (canViewAdminDashboard.value) {
      return '/ae/admin';
    }
    if (canViewCoachArea.value) {
      return '/ae/coach';
    }
    return '/ae/learn';
  });

  const displayName = computed(() => {
    const name = (full_name && full_name.value) || '';
    if (name) {
      const first = name.trim().split(/\s+/)[0];
      return first || name;
    }
    return (username && username.value) || '';
  });

  return {
    isUserLoggedIn,
    isLearner,
    isCoach,
    isAdmin,
    isSuperuser,
    isFacilityAdmin,
    userKind,
    currentUserId,
    userFacilityId,
    displayName,
    canViewLearnerArea,
    canViewCoachArea,
    canManageSessions,
    canViewAdminDashboard,
    canManageUsers,
    canManageContent,
    canAccessTechnicalAdministration,
    defaultLandingPath,
  };
}
