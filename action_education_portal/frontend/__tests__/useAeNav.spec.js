/**
 * @jest-environment jsdom
 */

import useUser from 'kolibri/composables/useUser';
import { __setRoute } from 'vue-router/composables';
import { useAeNav, useAeLearnerNav, useAeCoachNav, useAeAdminNav } from '../composables/useAeNav';

jest.mock('vue-router/composables', () => {
  const { ref } = require('vue');
  const route = ref({ name: 'AeLearnFormations', path: '/apprenant/cours' });
  return {
    useRoute: () => route.value,
    __setRoute: next => {
      route.value = next;
    },
  };
});

jest.mock('kolibri/composables/useUser', () => {
  const { computed, ref } = require('vue');
  const kind = ref(['learner']);
  return {
    __esModule: true,
    default: () => ({
      isUserLoggedIn: computed(() => true),
      isLearner: computed(() => kind.value.includes('learner')),
      isCoach: computed(
        () => kind.value.includes('coach') || kind.value.includes('assignable_coach'),
      ),
      isAdmin: computed(() => kind.value.includes('admin') || kind.value.includes('superuser')),
      isSuperuser: computed(() => kind.value.includes('superuser')),
      isFacilityAdmin: computed(() => kind.value.includes('admin')),
      canManageContent: computed(() => kind.value.includes('can_manage_content')),
      userKind: computed(() => kind.value[0]),
      full_name: computed(() => 'Awa'),
      username: computed(() => 'awa'),
      currentUserId: computed(() => 'u1'),
      userFacilityId: computed(() => 'f1'),
      __setKind: kinds => {
        kind.value = kinds;
      },
    }),
  };
});

jest.mock('../strings', () => {
  const stub = key => () => key;
  return {
    portalStrings: new Proxy(
      {},
      {
        get: (_, prop) => {
          if (prop === '$tr') {
            return key => key;
          }
          if (typeof prop === 'string' && prop.endsWith('$')) {
            return stub(prop);
          }
          return stub(prop);
        },
      },
    ),
  };
});

describe('space navigation', () => {
  it('marks the longest matching learner path as active', () => {
    __setRoute({ name: 'AeLearnFormations', path: '/apprenant/cours' });
    const nav = useAeLearnerNav();
    expect(nav.activeId.value).toBe('learn-formations');
  });

  it('falls back to home for exact learner root', () => {
    __setRoute({ name: 'AeLearnHome', path: '/apprenant' });
    const nav = useAeLearnerNav();
    expect(nav.activeId.value).toBe('learn-home');
  });

  it('exposes learner menu without coach or admin items', () => {
    const nav = useAeLearnerNav();
    const ids = nav.items.value.map(i => i.id);
    expect(ids).toEqual([
      'learn-home',
      'learn-formations',
      'learn-library',
      'learn-quizzes',
      'learn-progress',
      'learn-profile',
      'learn-help',
    ]);
    expect(ids.some(id => id.startsWith('coach-'))).toBe(false);
    expect(ids.some(id => id.startsWith('admin-'))).toBe(false);
  });

  it('exposes coach menu without admin items', () => {
    __setRoute({ name: 'AeCoachHome', path: '/formateur' });
    const nav = useAeCoachNav();
    const ids = nav.items.value.map(i => i.id);
    expect(ids).toContain('coach-classes');
    expect(ids).toContain('coach-sessions');
    expect(ids.some(id => id.startsWith('admin-'))).toBe(false);
    expect(ids.some(id => id.startsWith('learn-'))).toBe(false);
  });

  it('shows sync to admins without device permissions', () => {
    const user = useUser();
    user.__setKind(['admin']);
    __setRoute({ name: 'AeAdminHome', path: '/administrateur' });
    const nav = useAeAdminNav();
    const ids = nav.items.value.map(i => i.id);
    expect(ids).toContain('admin-users');
    expect(ids).toContain('admin-settings');
    // Kolibri lets facility admins sync their own facility.
    expect(ids).toContain('admin-sync');
  });

  it('includes sync for device-capable admins', () => {
    const user = useUser();
    user.__setKind(['admin', 'can_manage_content']);
    const nav = useAeAdminNav();
    expect(nav.items.value.map(i => i.id)).toContain('admin-sync');
  });

  it('does not expose space switcher for ordinary coaches', () => {
    const user = useUser();
    user.__setKind(['coach', 'learner']);
    __setRoute({ name: 'AeCoachHome', path: '/formateur' });
    const nav = useAeNav();
    expect(nav.switcherLinks.value).toEqual([]);
  });

  it('exposes discrete switcher preview only for superusers', () => {
    const user = useUser();
    user.__setKind(['superuser']);
    __setRoute({ name: 'AeAdminHome', path: '/administrateur' });
    const nav = useAeNav();
    expect(nav.switcherLinks.value.map(l => l.id)).toEqual(['sw-learn', 'sw-coach', 'sw-admin']);
  });
});
