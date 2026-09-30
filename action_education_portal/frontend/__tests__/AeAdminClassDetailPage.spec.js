/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor, within } from '@testing-library/vue';
import { portalStrings } from '../strings';
import AeAdminClassDetailPage from '../views/admin/AeAdminClassDetailPage.vue';

jest.mock('kolibri/urls');
jest.mock('kolibri/composables/useUser', () => {
  const { computed } = require('vue');
  return {
    __esModule: true,
    default: () => ({
      isUserLoggedIn: computed(() => true),
      isLearner: computed(() => false),
      isCoach: computed(() => false),
      isAdmin: computed(() => true),
      isSuperuser: computed(() => false),
      isFacilityAdmin: computed(() => true),
      canManageContent: computed(() => true),
      userKind: computed(() => 'admin'),
      currentUserId: computed(() => 'admin-1'),
      userFacilityId: computed(() => 'facility-1'),
    }),
  };
});

const CLASS = { id: 'class-1', name: 'Classe AE Test', parent: 'facility-1' };
const USERS = [
  { id: 'coach-1', full_name: 'Formateur AE Test', username: 'ae_coach', roles: [{ collection: 'facility-1', kind: 'coach' }] },
  { id: 'coach-2', full_name: 'Formateur Kaloum', username: 'formateur_kaloum', roles: [{ collection: 'facility-1', kind: 'coach' }] },
  { id: 'learner-1', full_name: 'Amadou Camara', username: 'amadou_camara', roles: [] },
  { id: 'learner-2', full_name: 'Apprenant Dixinn', username: 'apprenant_dixinn', roles: [] },
];

const mockRoles = jest.fn();
const mockMemberships = jest.fn();
const mockSaveRoles = jest.fn();
const mockSaveMemberships = jest.fn();
const mockDeleteMembership = jest.fn();
const mockCreateSnackbar = jest.fn();

jest.mock('kolibri-common/apiResources/ClassroomResource', () => ({
  __esModule: true,
  default: { fetchModel: () => Promise.resolve(CLASS) },
}));
jest.mock('kolibri-common/apiResources/FacilityUserResource', () => ({
  __esModule: true,
  default: { fetchCollection: () => Promise.resolve(USERS) },
}));
jest.mock('kolibri-common/apiResources/RoleResource', () => ({
  __esModule: true,
  default: {
    fetchCollection: () => mockRoles(),
    saveCollection: (...args) => mockSaveRoles(...args),
  },
}));
jest.mock('kolibri-common/apiResources/MembershipResource', () => ({
  __esModule: true,
  default: {
    fetchCollection: () => mockMemberships(),
    saveCollection: (...args) => mockSaveMemberships(...args),
    deleteModel: (...args) => mockDeleteMembership(...args),
  },
}));
jest.mock('kolibri/composables/useSnackbar', () => ({
  __esModule: true,
  default: () => ({ createSnackbar: (...args) => mockCreateSnackbar(...args) }),
}));

const {
  assignCoachAction$,
  assignCoachesConfirm$,
  coachesAssigned$,
  noCoachAssignedTitle$,
  removeFromClassOf$,
  removedFromClass$,
  enrollLearnersTitle$,
  enrollLearnersConfirm$,
  learnersEnrolledInClass$,
  enrollLearnersError$,
} = portalStrings;

const [, SECOND_COACH, LEARNER, OTHER_LEARNER] = USERS;
const Blank = { render: h => h('div') };
const ROUTES = [
  { name: 'AeAdminHome', path: '/admin', component: Blank },
  { name: 'AeAdminClasses', path: '/classes', component: Blank },
  { name: 'AeAdminClassDetail', path: '/classes/:classId', component: Blank },
];

function renderPage() {
  return render(AeAdminClassDetailPage, { routes: ROUTES }, (vue, store, router) => {
    router.push({ name: 'AeAdminClassDetail', params: { classId: CLASS.id } });
  });
}

describe('AeAdminClassDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRoles.mockResolvedValue([]);
    mockMemberships.mockResolvedValue([{ id: 'm-1', user: LEARNER.id, collection: CLASS.id }]);
  });

  it('invites to assign a trainer when the class has none', async () => {
    renderPage();
    expect(await screen.findByText(noCoachAssignedTitle$())).toBeInTheDocument();
    expect(screen.getByText(LEARNER.full_name)).toBeInTheDocument();
  });

  it('assigns the trainers picked in the dialog', async () => {
    mockSaveRoles.mockResolvedValue([]);
    renderPage();
    await fireEvent.click(await screen.findByRole('button', { name: assignCoachAction$() }));

    const dialog = screen.getByRole('dialog');
    // Only staff accounts can be picked as trainers.
    expect(within(dialog).queryByText(LEARNER.full_name)).not.toBeInTheDocument();
    await fireEvent.click(within(dialog).getByLabelText(SECOND_COACH.full_name));
    await fireEvent.click(
      within(dialog).getByRole('button', { name: assignCoachesConfirm$({ count: 1 }) }),
    );

    await waitFor(() => expect(mockSaveRoles).toHaveBeenCalled());
    expect(mockSaveRoles).toHaveBeenCalledWith({
      data: [{ collection: CLASS.id, user: SECOND_COACH.id, kind: 'coach' }],
    });
    expect(mockCreateSnackbar).toHaveBeenCalledWith(coachesAssigned$({ count: 1 }));
  });

  it('keeps the learner picker open with a clear error when enrolling fails', async () => {
    mockSaveMemberships.mockRejectedValue(new Error('offline'));
    renderPage();
    await fireEvent.click(await screen.findByRole('button', { name: enrollLearnersTitle$() }));

    const dialog = screen.getByRole('dialog');
    // Learners already in the class are not offered again.
    expect(within(dialog).queryByText(LEARNER.full_name)).not.toBeInTheDocument();
    await fireEvent.click(within(dialog).getByLabelText(OTHER_LEARNER.full_name));
    await fireEvent.click(
      within(dialog).getByRole('button', { name: enrollLearnersConfirm$({ count: 1 }) }),
    );

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(enrollLearnersError$());
    expect(mockCreateSnackbar).not.toHaveBeenCalledWith(learnersEnrolledInClass$({ count: 1 }));
  });

  it('removes a learner from the class and says the account is kept', async () => {
    mockDeleteMembership.mockResolvedValue('m-1');
    renderPage();
    await fireEvent.click(
      await screen.findByRole('button', { name: removeFromClassOf$({ name: LEARNER.full_name }) }),
    );

    await waitFor(() => expect(mockDeleteMembership).toHaveBeenCalledWith({ id: 'm-1' }));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(removedFromClass$({ name: LEARNER.full_name }));
  });
});
