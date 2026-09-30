/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/vue';
import { portalStrings } from '../strings';
import AeCoachLearnersPage from '../views/coach/AeCoachLearnersPage.vue';

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

const mockFetchClassrooms = jest.fn();
const mockFetchUsersInCollection = jest.fn();
const mockCreateLearner = jest.fn();

jest.mock('../composables/useClassroomApi', () => ({
  useClassroomApi: () => ({
    fetchClassrooms: (...args) => mockFetchClassrooms(...args),
    fetchUsersInCollection: (...args) => mockFetchUsersInCollection(...args),
    createLearner: (...args) => mockCreateLearner(...args),
    isStaffUser: user => Boolean(user.roles && user.roles.length),
  }),
}));

const {
  addLearnerTitle$,
  addLearnerAction$,
  fullNameLabel$,
  usernameLabel$,
  passwordLabel$,
  usernameTaken$,
} = portalStrings;

const Blank = { render: h => h('div') };
const ROUTES = ['AeAdminHome', 'AeCoachLearners', 'AeCoachResults'].map(name => ({
  name,
  path: `/${name}`,
  component: Blank,
}));

const ALPHA = { id: 'c1', name: 'Alpha' };
const ZEBRA = { id: 'c2', name: 'Zèbre' };
const LEARNER = { id: 'u1', full_name: 'Awa Camara', username: 'awa', roles: [] };
const COACH = { id: 'u2', full_name: 'Moussa Bah', username: 'moussa', roles: [{ kind: 'coach' }] };
const NEW_LEARNER = { fullName: 'Mariama Sow', username: 'mariama', password: 'kolibri' };

function renderPage() {
  return render(AeCoachLearnersPage, { routes: ROUTES });
}

async function fillAndSubmit() {
  await fireEvent.click(await screen.findByRole('button', { name: addLearnerTitle$() }));
  await fireEvent.update(screen.getByLabelText(fullNameLabel$()), NEW_LEARNER.fullName);
  await fireEvent.update(screen.getByLabelText(usernameLabel$()), NEW_LEARNER.username);
  await fireEvent.update(screen.getByLabelText(passwordLabel$()), NEW_LEARNER.password);
  await fireEvent.click(screen.getByRole('button', { name: addLearnerAction$() }));
}

describe('AeCoachLearnersPage', () => {
  beforeEach(() => {
    mockFetchClassrooms.mockReset();
    mockFetchUsersInCollection.mockReset();
    mockCreateLearner.mockReset();
    mockFetchClassrooms.mockResolvedValue([ZEBRA, ALPHA]);
    mockFetchUsersInCollection.mockResolvedValue([LEARNER, COACH]);
  });

  it('shows the learners of the first class by name, without the trainers', async () => {
    renderPage();

    await waitFor(() => expect(screen.getByText(LEARNER.full_name)).toBeInTheDocument());
    expect(mockFetchUsersInCollection).toHaveBeenCalledWith(ALPHA.id);
    expect(screen.queryByText(COACH.full_name)).not.toBeInTheDocument();
  });

  it('adds a learner to the chosen class', async () => {
    mockCreateLearner.mockResolvedValue({ id: 'u3' });
    renderPage();
    await fillAndSubmit();

    await waitFor(() =>
      expect(mockCreateLearner).toHaveBeenCalledWith({ ...NEW_LEARNER, classroomId: ALPHA.id }),
    );
  });

  it('says when the username is already taken', async () => {
    mockCreateLearner.mockRejectedValue({
      response: { data: [{ id: 'USERNAME_ALREADY_EXISTS' }] },
    });
    renderPage();
    await fillAndSubmit();

    await waitFor(() => expect(screen.getByText(usernameTaken$())).toBeInTheDocument());
  });
});
