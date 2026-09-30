/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/vue';
import { UserKinds } from 'kolibri/constants';
import { coreStrings } from 'kolibri/uiText/commonCoreStrings';
import { portalStrings } from '../strings';
import AeGroupCreatePanel from '../views/admin/AeGroupCreatePanel.vue';

const mockFetchUsers = jest.fn();
const mockFetchClassrooms = jest.fn();
const mockSaveClassroom = jest.fn();
const mockSaveRoles = jest.fn();
const mockSaveMemberships = jest.fn();
const mockCreateSnackbar = jest.fn();

jest.mock('kolibri-common/apiResources/FacilityUserResource', () => ({
  __esModule: true,
  default: { fetchCollection: (...args) => mockFetchUsers(...args) },
}));
jest.mock('kolibri-common/apiResources/ClassroomResource', () => ({
  __esModule: true,
  default: {
    fetchCollection: (...args) => mockFetchClassrooms(...args),
    saveModel: (...args) => mockSaveClassroom(...args),
  },
}));
jest.mock('kolibri-common/apiResources/RoleResource', () => ({
  __esModule: true,
  default: { saveCollection: (...args) => mockSaveRoles(...args) },
}));
jest.mock('kolibri-common/apiResources/MembershipResource', () => ({
  __esModule: true,
  default: { saveCollection: (...args) => mockSaveMemberships(...args) },
}));
jest.mock('kolibri/composables/useSnackbar', () => ({
  __esModule: true,
  default: () => ({ createSnackbar: (...args) => mockCreateSnackbar(...args) }),
}));

const {
  columnGroupName$,
  saveAndClose$,
  fieldRequired$,
  groupNameTaken$,
  groupMembersError$,
  searchLearnersLabel$,
  groupCreated$,
} = portalStrings;

const USERS = [
  { id: 'u-coach', full_name: 'Awa Camara', username: 'awa', roles: [{ kind: UserKinds.COACH }] },
  { id: 'u-learner', full_name: 'Élodie Diallo', username: 'elodie', roles: [] },
  { id: 'u-other', full_name: 'Moussa Bah', username: 'moussa', roles: [] },
];

const [COACH, LEARNER, OTHER_LEARNER] = USERS;

// Checkbox labels hold the avatar, the name and a detail line.
function personCheckbox(user) {
  return { name: new RegExp(user.full_name) };
}

async function renderOpenPanel() {
  const result = render(AeGroupCreatePanel, {
    props: { open: false, facilityId: 'facility-1' },
  });
  await result.updateProps({ open: true });
  await waitFor(() =>
    expect(screen.getByRole('checkbox', personCheckbox(OTHER_LEARNER))).toBeInTheDocument(),
  );
  return result;
}

async function typeName(name) {
  await fireEvent.update(screen.getByLabelText(columnGroupName$()), name);
}

describe('AeGroupCreatePanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchUsers.mockResolvedValue(USERS);
    mockFetchClassrooms.mockResolvedValue([{ id: 'c-1', name: 'Classe  Citoyenneté' }]);
    mockSaveClassroom.mockResolvedValue({ id: 'c-new', name: 'Groupe du matin' });
    mockSaveRoles.mockResolvedValue([]);
    mockSaveMemberships.mockResolvedValue([]);
  });

  it('asks for a name before creating anything', async () => {
    await renderOpenPanel();
    await fireEvent.click(screen.getByRole('button', { name: saveAndClose$() }));

    expect(screen.getByText(fieldRequired$())).toBeInTheDocument();
    expect(mockSaveClassroom).not.toHaveBeenCalled();
  });

  it('refuses a name already used, ignoring case and extra spaces', async () => {
    await renderOpenPanel();
    await typeName('  classe citoyenneté ');
    await fireEvent.click(screen.getByRole('button', { name: saveAndClose$() }));

    expect(screen.getByText(groupNameTaken$())).toBeInTheDocument();
    expect(mockSaveClassroom).not.toHaveBeenCalled();
  });

  it('creates the class, then its coaches and learners', async () => {
    const { emitted } = await renderOpenPanel();
    await typeName('  Groupe   du matin ');
    await fireEvent.click(screen.getByRole('checkbox', personCheckbox(COACH)));
    await fireEvent.click(screen.getByRole('checkbox', personCheckbox(LEARNER)));
    await fireEvent.click(screen.getByRole('button', { name: saveAndClose$() }));

    await waitFor(() => expect(emitted().close).toBeTruthy());
    expect(mockSaveClassroom).toHaveBeenCalledWith({
      data: { name: 'Groupe du matin', parent: 'facility-1' },
    });
    expect(mockSaveRoles).toHaveBeenCalledWith({
      data: [{ collection: 'c-new', user: 'u-coach', kind: UserKinds.COACH }],
    });
    expect(mockSaveMemberships).toHaveBeenCalledWith({
      data: [{ collection: 'c-new', user: 'u-learner' }],
    });
    expect(emitted().created).toHaveLength(1);
    expect(mockCreateSnackbar).toHaveBeenCalledWith(groupCreated$({ name: 'Groupe du matin' }));
  });

  it('keeps the panel open when members could not be added', async () => {
    mockSaveMemberships.mockRejectedValue(new Error('network'));
    const { emitted } = await renderOpenPanel();
    await typeName('Groupe du matin');
    await fireEvent.click(screen.getByRole('checkbox', personCheckbox(OTHER_LEARNER)));
    await fireEvent.click(screen.getByRole('button', { name: saveAndClose$() }));

    await waitFor(() => expect(screen.getByText(groupMembersError$())).toBeInTheDocument());
    // The class exists, so the list still refreshes, but the panel stays open.
    expect(emitted().created).toHaveLength(1);
    expect(emitted().close).toBeFalsy();
  });

  it('finds learners without typing accents', async () => {
    await renderOpenPanel();
    await fireEvent.update(screen.getByLabelText(searchLearnersLabel$()), 'elodie');

    expect(screen.getByRole('checkbox', personCheckbox(LEARNER))).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', personCheckbox(OTHER_LEARNER))).not.toBeInTheDocument();
    // Trainers are listed on their own, whatever the search.
    expect(screen.getByRole('checkbox', personCheckbox(COACH))).toBeInTheDocument();
  });

  it('closes without saving on cancel', async () => {
    const { emitted } = await renderOpenPanel();
    await fireEvent.click(screen.getByRole('button', { name: coreStrings.cancelAction$() }));

    expect(emitted().close).toBeTruthy();
    expect(mockSaveClassroom).not.toHaveBeenCalled();
  });
});
