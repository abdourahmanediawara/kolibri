/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/vue';
import { portalStrings } from '../strings';
import AeCoachSessionDetailPage from '../views/coach/AeCoachSessionDetailPage.vue';

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

const mockFetchUsers = jest.fn();
jest.mock('kolibri-common/apiResources/FacilityUserResource', () => ({
  __esModule: true,
  default: { fetchCollection: (...args) => mockFetchUsers(...args) },
}));

const mockApi = {
  fetchSession: jest.fn(),
  fetchTrainings: jest.fn(),
  fetchEnrollments: jest.fn(),
  fetchAttendances: jest.fn(),
  createAttendance: jest.fn(),
  updateAttendance: jest.fn(),
  createEnrollment: jest.fn(),
  attendanceExportUrl: id => `/export/${id}/`,
};
jest.mock('../composables/useTrainingApi', () => {
  const actual = jest.requireActual('../composables/useTrainingApi');
  return { ...actual, useTrainingApi: () => mockApi };
});

const {
  statusPresent$,
  summaryPresent$,
  enrollLearnersTitle$,
  enrollAction$,
  sessionNoParticipants$,
} = portalStrings;

const Blank = { render: h => h('div') };
const ROUTES = [
  { name: 'AeAdminHome', path: '/admin', component: Blank },
  { name: 'AeCoachSessions', path: '/sessions', component: Blank },
  { name: 'AeCoachSessionDetail', path: '/sessions/:sessionId', component: Blank },
];

const SESSION = {
  id: 's1',
  training: 'tr-1',
  start_datetime: '2026-07-24T14:00:00.000Z',
  location: 'Conakry',
  status: 'scheduled',
};
const AWA = { id: 'u1', full_name: 'Awa Camara', username: 'awa', roles: [] };
const BINTA = { id: 'u2', full_name: 'Binta Diallo', username: 'binta', roles: [] };

function renderPage() {
  return render(AeCoachSessionDetailPage, { routes: ROUTES }, (vue, store, router) => {
    router.push({ name: 'AeCoachSessionDetail', params: { sessionId: SESSION.id } });
  });
}

describe('AeCoachSessionDetailPage', () => {
  beforeEach(() => {
    Object.values(mockApi).forEach(fn => fn.mockReset && fn.mockReset());
    mockApi.fetchSession.mockResolvedValue(SESSION);
    mockApi.fetchTrainings.mockResolvedValue([{ id: 'tr-1', title: 'Découvrir la Guinée' }]);
    mockApi.fetchEnrollments.mockResolvedValue([
      { id: 'e1', session: SESSION.id, training: 'tr-1', learner: AWA.id },
    ]);
    mockApi.fetchAttendances.mockResolvedValue([]);
    mockFetchUsers.mockResolvedValue([AWA, BINTA]);
  });

  it('records attendance with one click and updates the summary', async () => {
    mockApi.createAttendance.mockResolvedValue({ id: 'a1', status: 'present' });
    renderPage();

    const present = await screen.findByRole('button', { name: statusPresent$() });
    await fireEvent.click(present);

    await waitFor(() =>
      expect(mockApi.createAttendance).toHaveBeenCalledWith(
        expect.objectContaining({ session: SESSION.id, learner: AWA.id, status: 'present' }),
      ),
    );
    await waitFor(() => expect(present).toHaveAttribute('aria-pressed', 'true'));
    expect(screen.getByText(summaryPresent$({ count: 1 }))).toBeInTheDocument();
  });

  it('enrolls the ticked learners who are not enrolled yet', async () => {
    mockApi.createEnrollment.mockResolvedValue({ id: 'e2' });
    renderPage();

    await fireEvent.click(await screen.findByRole('button', { name: enrollLearnersTitle$() }));
    // Awa is already enrolled, so only Binta can be ticked.
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(1);
    await fireEvent.click(checkboxes[0]);
    await fireEvent.click(screen.getByRole('button', { name: enrollAction$() }));

    await waitFor(() =>
      expect(mockApi.createEnrollment).toHaveBeenCalledWith({
        training: SESSION.training,
        session: SESSION.id,
        learner: BINTA.id,
        status: 'active',
      }),
    );
  });

  it('explains how to enroll when nobody is enrolled', async () => {
    mockApi.fetchEnrollments.mockResolvedValue([]);
    renderPage();

    await waitFor(() => expect(screen.getByText(sessionNoParticipants$())).toBeInTheDocument());
  });
});
