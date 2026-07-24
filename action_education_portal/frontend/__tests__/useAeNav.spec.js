/**
 * @jest-environment jsdom
 */

jest.mock('vue-router/composables', () => {
  const { ref } = require('vue');
  const route = ref({ name: 'AeLearnFormations', path: '/ae/learn/formations' });
  return {
    useRoute: () => route.value,
    __setRoute: next => {
      route.value = next;
    },
  };
});

jest.mock('kolibri/composables/useUser', () => {
  const { computed } = require('vue');
  return {
    __esModule: true,
    default: () => ({
      isUserLoggedIn: computed(() => true),
      isLearner: computed(() => true),
      isCoach: computed(() => false),
      isAdmin: computed(() => false),
      isSuperuser: computed(() => false),
      isFacilityAdmin: computed(() => false),
      canManageContent: computed(() => false),
      userKind: computed(() => 'learner'),
      full_name: computed(() => 'Awa'),
      username: computed(() => 'awa'),
      currentUserId: computed(() => 'u1'),
      userFacilityId: computed(() => 'f1'),
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

import { useAeNav } from '../composables/useAeNav';
import { __setRoute } from 'vue-router/composables';

describe('useAeNav', () => {
  it('marks the longest matching learner path as active', () => {
    __setRoute({ name: 'AeLearnFormations', path: '/ae/learn/formations' });
    const nav = useAeNav();
    expect(nav.activeId.value).toBe('learn-formations');
  });

  it('falls back to home for exact learn root', () => {
    __setRoute({ name: 'AeLearnHome', path: '/ae/learn' });
    const nav = useAeNav();
    expect(nav.activeId.value).toBe('learn-home');
  });
});
