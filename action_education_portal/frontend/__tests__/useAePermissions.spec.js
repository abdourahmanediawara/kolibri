/**
 * @jest-environment jsdom
 */

import useUser from 'kolibri/composables/useUser';
import { useAePermissions } from '../composables/useAePermissions';

jest.mock('kolibri/composables/useUser', () => {
  const { ref, computed } = require('vue');
  const kind = ref(['admin']);
  return {
    __esModule: true,
    default: () => ({
      isUserLoggedIn: computed(() => !kind.value.includes('anonymous')),
      isLearner: computed(() => kind.value.includes('learner')),
      isCoach: computed(
        () => kind.value.includes('coach') || kind.value.includes('assignable_coach'),
      ),
      isAdmin: computed(() => kind.value.includes('admin') || kind.value.includes('superuser')),
      isSuperuser: computed(() => kind.value.includes('superuser')),
      isFacilityAdmin: computed(() => kind.value.includes('admin')),
      canManageContent: computed(() => kind.value.includes('can_manage_content')),
      userKind: computed(() => kind.value[0]),
      full_name: computed(() => 'Awa Diallo'),
      username: computed(() => 'awa'),
      currentUserId: computed(() => 'u1'),
      userFacilityId: computed(() => 'f1'),
      __setKind: kinds => {
        kind.value = kinds;
      },
    }),
  };
});

describe('useAePermissions', () => {
  it('lands facility admins on /administrateur', () => {
    const user = useUser();
    user.__setKind(['admin']);
    const perms = useAePermissions();
    expect(perms.canManageSessions.value).toBe(true);
    expect(perms.canViewAdminDashboard.value).toBe(true);
    expect(perms.canViewLearnerArea.value).toBe(false);
    expect(perms.defaultLandingPath.value).toBe('/administrateur');
  });

  it('lands coaches on /formateur without admin dashboard', () => {
    const user = useUser();
    user.__setKind(['coach', 'learner']);
    const perms = useAePermissions();
    expect(perms.canViewCoachArea.value).toBe(true);
    expect(perms.canViewAdminDashboard.value).toBe(false);
    expect(perms.canViewLearnerArea.value).toBe(false);
    expect(perms.defaultLandingPath.value).toBe('/formateur');
  });

  it('keeps pure learners on /apprenant only', () => {
    const user = useUser();
    user.__setKind(['learner']);
    const perms = useAePermissions();
    expect(perms.canViewLearnerArea.value).toBe(true);
    expect(perms.canManageSessions.value).toBe(false);
    expect(perms.canViewAdminDashboard.value).toBe(false);
    expect(perms.canAccessTechnicalAdministration.value).toBe(false);
    expect(perms.defaultLandingPath.value).toBe('/apprenant');
  });

  it('grants technical administration to superusers and learner preview', () => {
    const user = useUser();
    user.__setKind(['superuser', 'can_manage_content']);
    const perms = useAePermissions();
    expect(perms.canViewAdminDashboard.value).toBe(true);
    expect(perms.canViewLearnerArea.value).toBe(true);
    expect(perms.canAccessDeviceAdministration.value).toBe(true);
    expect(perms.defaultLandingPath.value).toBe('/administrateur');
  });

  it('denies device administration to facility admins without DevicePermissions', () => {
    const user = useUser();
    user.__setKind(['admin']);
    const perms = useAePermissions();
    expect(perms.canViewAdminDashboard.value).toBe(true);
    expect(perms.canManageContent.value).toBe(true);
    expect(perms.canAccessDeviceAdministration.value).toBe(false);
  });

  it('grants device administration when session can_manage_content is set', () => {
    const user = useUser();
    user.__setKind(['admin', 'can_manage_content']);
    const perms = useAePermissions();
    expect(perms.canAccessDeviceAdministration.value).toBe(true);
  });

  it('lets facility admins sync their facility without device permissions', () => {
    const user = useUser();
    user.__setKind(['admin']);
    const perms = useAePermissions();
    expect(perms.canSyncFacility.value).toBe(true);
  });

  it('does not let coaches sync the facility', () => {
    const user = useUser();
    user.__setKind(['coach', 'learner']);
    const perms = useAePermissions();
    expect(perms.canSyncFacility.value).toBe(false);
  });
});
