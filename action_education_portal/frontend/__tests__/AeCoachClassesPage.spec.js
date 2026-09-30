/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/vue';
import { portalStrings } from '../strings';
import AeCoachClassesPage from '../views/coach/AeCoachClassesPage.vue';

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
const mockCreateClassroom = jest.fn();

jest.mock('../composables/useClassroomApi', () => ({
  useClassroomApi: () => ({
    fetchClassrooms: (...args) => mockFetchClassrooms(...args),
    createClassroom: (...args) => mockCreateClassroom(...args),
  }),
}));

const {
  learnersCount$,
  createClassTitle$,
  classNameLabel$,
  createClassAction$,
  classNameRequired$,
} = portalStrings;

const Blank = { render: h => h('div') };
const ROUTES = ['AeAdminHome', 'AeCoachLearners'].map(name => ({
  name,
  path: `/${name}`,
  component: Blank,
}));

const CLASS_TEST = { id: 'c1', name: 'Classe AE Test', learner_count: 2 };
const NEW_CLASS = { id: 'c2', name: 'Nouvelle classe du matin', learner_count: 0 };

function renderPage() {
  return render(AeCoachClassesPage, { routes: ROUTES });
}

describe('AeCoachClassesPage', () => {
  beforeEach(() => {
    mockFetchClassrooms.mockReset();
    mockCreateClassroom.mockReset();
    mockFetchClassrooms.mockResolvedValue([]);
  });

  it('lists the classrooms with their learner count', async () => {
    mockFetchClassrooms.mockResolvedValue([CLASS_TEST]);
    renderPage();

    await waitFor(() => expect(screen.getByText(CLASS_TEST.name)).toBeInTheDocument());
    expect(screen.getByText(learnersCount$({ count: 2 }))).toBeInTheDocument();
  });

  it('asks for a name before creating a classroom', async () => {
    renderPage();
    await fireEvent.click(await screen.findByRole('button', { name: createClassTitle$() }));
    await fireEvent.click(screen.getByRole('button', { name: createClassAction$() }));

    expect(screen.getByText(classNameRequired$())).toBeInTheDocument();
    expect(mockCreateClassroom).not.toHaveBeenCalled();
  });

  it('creates a classroom via the AE coach endpoint from the side panel', async () => {
    mockCreateClassroom.mockResolvedValue(NEW_CLASS);
    mockFetchClassrooms.mockResolvedValueOnce([]).mockResolvedValueOnce([NEW_CLASS]);
    renderPage();

    await fireEvent.click(await screen.findByRole('button', { name: createClassTitle$() }));
    await fireEvent.update(screen.getByLabelText(classNameLabel$()), NEW_CLASS.name);
    await fireEvent.click(screen.getByRole('button', { name: createClassAction$() }));

    await waitFor(() => expect(mockCreateClassroom).toHaveBeenCalledWith({ name: NEW_CLASS.name }));
    await waitFor(() => expect(screen.getByText(NEW_CLASS.name)).toBeInTheDocument());
  });
});
