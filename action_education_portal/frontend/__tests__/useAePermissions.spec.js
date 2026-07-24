/**
 * @jest-environment jsdom
 */

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

import useUser from 'kolibri/composables/useUser';
import { useAePermissions } from '../composables/useAePermissions';

describe('useAePermissions', () => {
  it('grants session management to facility admins', () => {
    const user = useUser();
    user.__setKind(['admin']);
    const perms = useAePermissions();
    expect(perms.canManageSessions.value).toBe(true);
    expect(perms.canViewAdminDashboard.value).toBe(true);
    expect(perms.defaultLandingPath.value).toBe('/ae/admin');
  });

  it('grants coach area to coaches but not admin dashboard', () => {
    const user = useUser();
    user.__setKind(['coach', 'learner']);
    const perms = useAePermissions();
    expect(perms.canViewCoachArea.value).toBe(true);
    expect(perms.canViewAdminDashboard.value).toBe(false);
    expect(perms.defaultLandingPath.value).toBe('/ae/coach');
  });

  it('keeps learners in the learner area only', () => {
    const user = useUser();
    user.__setKind(['learner']);
    const perms = useAePermissions();
    expect(perms.canViewLearnerArea.value).toBe(true);
    expect(perms.canManageSessions.value).toBe(false);
    expect(perms.canViewAdminDashboard.value).toBe(false);
    expect(perms.canAccessTechnicalAdministration.value).toBe(false);
    expect(perms.defaultLandingPath.value).toBe('/ae/learn');
  });

  it('grants technical administration to superusers', () => {
    const user = useUser();
    user.__setKind(['superuser', 'can_manage_content']);
    const perms = useAePermissions();
    expect(perms.canViewAdminDashboard.value).toBe(true);
    expect(perms.canAccessTechnicalAdministration.value).toBe(true);
    expect(perms.defaultLandingPath.value).toBe('/ae/admin');
  });
});
