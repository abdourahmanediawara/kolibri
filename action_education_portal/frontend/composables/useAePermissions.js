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

  /** Staff roles that own a dedicated non-learner space. */
  const isStaff = computed(() => isCoach.value || isAdmin.value || isSuperuser.value);

  /**
   * Learner space: pure learners, or superuser preview.
   * Coaches/admins do not share the learner menu.
   */
  const canViewLearnerArea = computed(
    () => isUserLoggedIn.value && ((isLearner.value && !isStaff.value) || isSuperuser.value),
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
      isUserLoggedIn.value && (sessionCanManageContent.value || isAdmin.value || isSuperuser.value),
  );

  /**
   * Kolibri Device plugin: superusers see everything (name, settings, facilities),
   * content managers see the channels to import. AE admins manage content with
   * their role (see action_education_portal/signals.py).
   * Based only on real Kolibri DevicePermissions session flags — never isAdmin alone.
   */
  const canAccessDeviceAdministration = computed(
    () => isUserLoggedIn.value && (isSuperuser.value || Boolean(sessionCanManageContent.value)),
  );

  /** Kolibri lets facility admins sync their own facility (Facility › Data). */
  const canSyncFacility = computed(() => canViewAdminDashboard.value);

  /** @deprecated Prefer canAccessDeviceAdministration — kept as alias for existing templates. */
  const canAccessTechnicalAdministration = canAccessDeviceAdministration;

  /** Post-login landing hash path inside /portal/ — based on real role, never UI choice. */
  const defaultLandingPath = computed(() => {
    if (canViewAdminDashboard.value) {
      return '/administrateur';
    }
    if (canViewCoachArea.value) {
      return '/formateur';
    }
    return '/apprenant';
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
    isStaff,
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
    canSyncFacility,
    defaultLandingPath,
  };
}
