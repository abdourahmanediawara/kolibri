/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/vue';
import { portalStrings } from '../strings';
import AeCoachSessionsPage from '../views/coach/AeCoachSessionsPage.vue';

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

const mockCreateSession = jest.fn();
const mockFetchTrainings = jest.fn();
const mockFetchSessions = jest.fn();

jest.mock('../composables/useTrainingApi', () => {
  const actual = jest.requireActual('../composables/useTrainingApi');
  return {
    ...actual,
    useTrainingApi: () => ({
      createSession: (...args) => mockCreateSession(...args),
      fetchTrainings: (...args) => mockFetchTrainings(...args),
      fetchSessions: (...args) => mockFetchSessions(...args),
    }),
  };
});

const {
  createSessionTitle$,
  createSession$,
  filterTrainingLabel$,
  locationLabel$,
  dateLabel$,
  timeLabel$,
  sessionCourseRequired$,
  sessionsEmpty$,
  loadError$,
} = portalStrings;

const Blank = { render: h => h('div') };
const ROUTES = [
  { name: 'AeAdminHome', path: '/admin', component: Blank },
  { name: 'AeCoachSessionDetail', path: '/sessions/:sessionId', component: Blank },
];

const TRAINING = { id: 'tr-1', title: 'Formation citoyenneté' };
const PLACE = 'Bureau Action Éducation';

function renderPage() {
  return render(AeCoachSessionsPage, { routes: ROUTES });
}

async function openCreatePanel() {
  await fireEvent.click(await screen.findByRole('button', { name: createSessionTitle$() }));
}

describe('AeCoachSessionsPage', () => {
  beforeEach(() => {
    mockCreateSession.mockReset();
    mockFetchTrainings.mockReset();
    mockFetchSessions.mockReset();
    mockFetchTrainings.mockResolvedValue([TRAINING]);
    mockFetchSessions.mockResolvedValue([]);
  });

  it('does not POST when no course is selected', async () => {
    renderPage();
    await openCreatePanel();
    await fireEvent.click(screen.getByRole('button', { name: createSession$() }));

    expect(mockCreateSession).not.toHaveBeenCalled();
    expect(screen.getByText(sessionCourseRequired$())).toBeInTheDocument();
  });

  it('POSTs a session only against an existing course, then lists it', async () => {
    mockCreateSession.mockResolvedValue({ id: 'sess-1' });
    mockFetchSessions.mockResolvedValueOnce([]).mockResolvedValueOnce([
      {
        id: 'sess-1',
        training: TRAINING.id,
        start_datetime: '2026-07-24T14:00:00.000Z',
        location: PLACE,
        status: 'scheduled',
      },
    ]);
    renderPage();
    await openCreatePanel();

    await fireEvent.update(screen.getByLabelText(filterTrainingLabel$()), TRAINING.id);
    await fireEvent.update(screen.getByLabelText(locationLabel$()), PLACE);
    await fireEvent.update(screen.getByLabelText(dateLabel$()), '2026-07-24');
    await fireEvent.update(screen.getByLabelText(timeLabel$()), '14:00');
    await fireEvent.click(screen.getByRole('button', { name: createSession$() }));

    await waitFor(() => expect(mockCreateSession).toHaveBeenCalledTimes(1));
    expect(mockCreateSession.mock.calls[0][0]).toMatchObject({
      training: TRAINING.id,
      location: PLACE,
      trainer: 'coach-1',
      status: 'scheduled',
    });
    await waitFor(() => expect(screen.getByText(TRAINING.title)).toBeInTheDocument());
  });

  it('shows the empty list once loaded', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText(sessionsEmpty$())).toBeInTheDocument());
  });

  it('shows the list error when sessions cannot be loaded', async () => {
    // The failed request is logged on purpose.
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockFetchSessions.mockRejectedValue({ response: { status: 500 } });
    renderPage();
    await waitFor(() => expect(screen.getByText(loadError$())).toBeInTheDocument());
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
