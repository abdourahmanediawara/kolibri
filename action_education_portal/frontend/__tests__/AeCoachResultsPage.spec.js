/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/vue';
import { portalStrings } from '../strings';
import AeCoachResultsPage from '../views/coach/AeCoachResultsPage.vue';

jest.mock('kolibri/composables/useUser', () => {
  const { computed } = require('vue');
  return {
    __esModule: true,
    default: () => ({
      isUserLoggedIn: computed(() => true),
      isLearner: computed(() => false),
      isCoach: computed(() => true),
      isAdmin: computed(() => false),
      isSuperuser: computed(() => false),
      isFacilityAdmin: computed(() => false),
      canManageContent: computed(() => false),
      userKind: computed(() => 'coach'),
      full_name: computed(() => 'Formateur'),
      username: computed(() => 'ae_coach'),
      currentUserId: computed(() => 'coach-1'),
      userFacilityId: computed(() => 'facility-1'),
    }),
  };
});

jest.mock('kolibri-common/apiResources/ClassroomResource', () => ({
  __esModule: true,
  default: {
    fetchCollection: jest.fn(() => Promise.resolve([])),
  },
}));

const mockFetchTrainings = jest.fn(() => Promise.resolve([]));
const mockFetchLearnerResults = jest.fn(() =>
  Promise.resolve({ results: [], learners: [], contents: [] }),
);

jest.mock('../composables/useTrainingApi', () => {
  const actual = jest.requireActual('../composables/useTrainingApi');
  return {
    ...actual,
    useTrainingApi: () => ({
      fetchTrainings: (...args) => mockFetchTrainings(...args),
      fetchLearnerResults: (...args) => mockFetchLearnerResults(...args),
    }),
  };
});

const { resultsTitle$, resultsIntro$, resultsEmpty$ } = portalStrings;

const Blank = { render: h => h('div') };
const ROUTES = [
  { name: 'AeAdminHome', path: '/admin', component: Blank },
  { name: 'AeCoachResults', path: '/resultats', component: Blank },
];

describe('AeCoachResultsPage', () => {
  beforeEach(() => {
    mockFetchTrainings.mockClear();
    mockFetchLearnerResults.mockClear();
  });

  it('renders the title, the filters and the empty results', async () => {
    render(AeCoachResultsPage, { routes: ROUTES });

    expect(screen.getByRole('heading', { level: 1, name: resultsTitle$() })).toBeInTheDocument();
    expect(screen.getByText(resultsIntro$())).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(resultsEmpty$())).toBeInTheDocument());
    // Learner, class, course and exercise filters, plus the sort.
    expect(screen.getAllByRole('combobox')).toHaveLength(5);
  });

  it('opens already filtered on the learner of the link', async () => {
    render(AeCoachResultsPage, { routes: ROUTES }, (vue, store, router) => {
      router.push({ name: 'AeCoachResults', query: { learner: 'learner-7' } });
    });

    await waitFor(() =>
      expect(mockFetchLearnerResults).toHaveBeenCalledWith({ learner: 'learner-7' }),
    );
  });
});
