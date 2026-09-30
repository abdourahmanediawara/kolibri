/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/vue';
import { portalStrings } from '../strings';
import AeCoachHomePage from '../views/coach/AeCoachHomePage.vue';
import AeCoachFormationsPage from '../views/coach/AeCoachFormationsPage.vue';

jest.mock('kolibri/urls');
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

const mockFetchTrainings = jest.fn();
const mockFetchSessions = jest.fn();
const mockFetchEnrollments = jest.fn();
const mockFetchAttendances = jest.fn();
const mockFetchClassrooms = jest.fn();

jest.mock('../composables/useTrainingApi', () => {
  const actual = jest.requireActual('../composables/useTrainingApi');
  return {
    ...actual,
    useTrainingApi: () => ({
      fetchTrainings: (...args) => mockFetchTrainings(...args),
      fetchSessions: (...args) => mockFetchSessions(...args),
      fetchEnrollments: (...args) => mockFetchEnrollments(...args),
      fetchAttendances: (...args) => mockFetchAttendances(...args),
      fetchResources: () => Promise.resolve([]),
      fetchQuizzes: () => Promise.resolve([]),
      fetchProgressOverview: () => Promise.resolve([]),
    }),
  };
});

jest.mock('../composables/useClassroomApi', () => ({
  useClassroomApi: () => ({
    fetchClassrooms: (...args) => mockFetchClassrooms(...args),
  }),
}));

const { myCourses$, dashAttendanceLabel$, loadError$, retryAction$, coachNoAssignedCourse$ } =
  portalStrings;

const Blank = { render: h => h('div') };
const ROUTES = [
  'AeAdminHome',
  'AeCoachSessions',
  'AeCoachFormations',
  'AeCoachLearners',
  'AeCoachResults',
  'AeCoachLibrary',
]
  .map(name => ({ name, path: `/${name}`, component: Blank }))
  .concat([
    { name: 'AeCoachSessionDetail', path: '/sessions/:sessionId', component: Blank },
    { name: 'AeCoachCourseDetail', path: '/cours/:trainingId', component: Blank },
  ]);

const FAILURE = { response: { status: 403 }, message: 'Forbidden' };

describe('coach page loaders', () => {
  beforeEach(() => {
    [
      mockFetchTrainings,
      mockFetchSessions,
      mockFetchEnrollments,
      mockFetchAttendances,
      mockFetchClassrooms,
    ].forEach(mock => {
      mock.mockReset();
      mock.mockResolvedValue([]);
    });
  });

  it('shows the dashboard cards once empty lists are loaded', async () => {
    render(AeCoachHomePage, { routes: ROUTES });

    // "Mes cours" is both a dashboard card and a quick action.
    await waitFor(() =>
      expect(screen.getByText(myCourses$(), { selector: '.ae-dash-kpi-label' })).toBeInTheDocument(),
    );
    expect(screen.getByText(dashAttendanceLabel$())).toBeInTheDocument();
  });

  it('shows an error with a retry button when nothing can be loaded', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    [
      mockFetchTrainings,
      mockFetchSessions,
      mockFetchEnrollments,
      mockFetchAttendances,
      mockFetchClassrooms,
    ].forEach(mock => mock.mockRejectedValue(FAILURE));
    render(AeCoachHomePage, { routes: ROUTES });

    await waitFor(() => expect(screen.getByText(loadError$())).toBeInTheDocument());
    expect(screen.getByRole('button', { name: retryAction$() })).toBeInTheDocument();
    consoleError.mockRestore();
  });

  it('shows the courses error when courses cannot be loaded', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockFetchTrainings.mockRejectedValue({ response: { status: 500 } });
    render(AeCoachFormationsPage, { routes: ROUTES });

    await waitFor(() => expect(screen.getByText(loadError$())).toBeInTheDocument());
    expect(screen.getByRole('button', { name: retryAction$() })).toBeInTheDocument();
    consoleError.mockRestore();
  });

  it('lists only the courses assigned to the trainer', async () => {
    render(AeCoachFormationsPage, { routes: ROUTES });

    await waitFor(() => expect(screen.getByText(coachNoAssignedCourse$())).toBeInTheDocument());
    expect(mockFetchTrainings).toHaveBeenCalledWith({ responsible: expect.any(String) });
  });
});
