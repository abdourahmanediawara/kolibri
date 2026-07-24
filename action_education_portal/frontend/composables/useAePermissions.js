/**
 * Single source of truth for Action Éducation UI permissions.
 * Derived from Kolibri session kinds / flags — never from group names alone.
 */
import { computed } from 'vue';
import useUser from 'kolibri/composables/useUser';

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
    () =>
      isUserLoggedIn.value &&
      (isLearner.value || isCoach.value || isAdmin.value || isSuperuser.value),
  );

  const canViewCoachArea = computed(
    () => isUserLoggedIn.value && (isCoach.value || isAdmin.value || isSuperuser.value),
  );

  const canManageSessions = computed(() => canViewCoachArea.value);

  const canViewAdminDashboard = computed(
    () => isUserLoggedIn.value && (isAdmin.value || isSuperuser.value),
  );

  const canManageUsers = computed(() => canViewAdminDashboard.value);

  /**
   * Facility-level content overview in the AE admin area (not Device import).
   * Facility admins may browse available channels; Device import is separate.
   */
  const canManageContent = computed(
    () =>
      isUserLoggedIn.value &&
      (sessionCanManageContent.value || isAdmin.value || isSuperuser.value),
  );

  /**
   * Technical Device administration (name, sync, import, settings).
   * Based only on real Kolibri DevicePermissions session flags — never isAdmin alone.
   */
  const canAccessDeviceAdministration = computed(
    () =>
      isUserLoggedIn.value && (isSuperuser.value || Boolean(sessionCanManageContent.value)),
  );

  /** @deprecated Prefer canAccessDeviceAdministration — kept as alias for existing templates. */
  const canAccessTechnicalAdministration = canAccessDeviceAdministration;

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
    canAccessDeviceAdministration,
    canAccessTechnicalAdministration,
    defaultLandingPath,
  };
}
