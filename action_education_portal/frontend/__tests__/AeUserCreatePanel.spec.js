/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/vue';
import { UserKinds } from 'kolibri/constants';
import { portalStrings } from '../strings';
import AeUserCreatePanel from '../views/admin/AeUserCreatePanel.vue';

const mockSaveUser = jest.fn();
const mockCheckUsername = jest.fn();
const mockCreateSnackbar = jest.fn();

jest.mock('kolibri-common/apiResources/FacilityUserResource', () => ({
  __esModule: true,
  default: {
    saveModel: (...args) => mockSaveUser(...args),
    fetchCollection: () => Promise.resolve([]),
  },
}));
jest.mock('kolibri-common/apiResources/ClassroomResource', () => ({
  __esModule: true,
  default: { fetchCollection: () => Promise.resolve([]) },
}));
jest.mock('kolibri-common/apiResources/RoleResource', () => ({
  __esModule: true,
  default: { saveModel: () => Promise.resolve({}) },
}));
jest.mock('kolibri-common/apiResources/MembershipResource', () => ({
  __esModule: true,
  default: { saveModel: () => Promise.resolve({}) },
}));
// The username check calls the AE API through Kolibri's HTTP client.
jest.mock('kolibri/client', () => ({
  __esModule: true,
  default: options => mockCheckUsername(options),
}));
jest.mock('kolibri/composables/useSnackbar', () => ({
  __esModule: true,
  default: () => ({ createSnackbar: (...args) => mockCreateSnackbar(...args) }),
}));

const {
  fullNameLabel$,
  usernameLabel$,
  passwordLabel$,
  confirmPasswordLabel$,
  saveAndClose$,
  saveAndAddAnother$,
  usernameTaken$,
  usernameTakenAlert$,
  usernameAvailable$,
  formHasErrors$,
  fieldRequired$,
  userCreated$,
  userCreatedAddAnother$,
} = portalStrings;

const NEW_USER = { fullName: 'Awa Camara', username: 'awa_camara', password: 'Motdepasse1' };

function renderPanel() {
  return render(AeUserCreatePanel, {
    props: { open: false, facilityId: 'facility-1', defaultKind: UserKinds.LEARNER },
  });
}

async function openPanel() {
  const result = renderPanel();
  await result.updateProps({ open: true });
  return result;
}

async function fillForm(user = NEW_USER) {
  await fireEvent.update(screen.getByLabelText(fullNameLabel$()), user.fullName);
  await fireEvent.update(screen.getByLabelText(usernameLabel$()), user.username);
  await fireEvent.update(screen.getByLabelText(passwordLabel$()), user.password);
  await fireEvent.update(screen.getByLabelText(confirmPasswordLabel$()), user.password);
}

describe('AeUserCreatePanel', () => {
  beforeEach(() => {
    mockSaveUser.mockReset();
    mockCheckUsername.mockReset();
    mockCreateSnackbar.mockReset();
    mockCheckUsername.mockResolvedValue({ data: { valid: true, available: true } });
  });

  it('says clearly that the username is already used', async () => {
    mockSaveUser.mockRejectedValue({
      response: { status: 400, data: [{ id: 'USERNAME_ALREADY_EXISTS' }] },
    });
    await openPanel();
    await fillForm();
    await fireEvent.click(screen.getByRole('button', { name: saveAndClose$() }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(usernameTakenAlert$({ username: NEW_USER.username }));
    expect(screen.getByText(usernameTaken$())).toBeInTheDocument();
    expect(screen.getByLabelText(usernameLabel$())).toHaveAttribute('aria-invalid', 'true');
    expect(mockCreateSnackbar).not.toHaveBeenCalled();
  });

  it('checks the username as soon as the field is left', async () => {
    mockCheckUsername.mockResolvedValue({ data: { valid: true, available: false } });
    await openPanel();
    const field = screen.getByLabelText(usernameLabel$());
    await fireEvent.update(field, 'awa');
    await fireEvent.blur(field);

    expect(await screen.findByText(usernameTaken$())).toBeInTheDocument();
    expect(mockCheckUsername).toHaveBeenCalledWith(
      expect.objectContaining({ params: { username: 'awa' } }),
    );
  });

  it('confirms a free username', async () => {
    await openPanel();
    const field = screen.getByLabelText(usernameLabel$());
    await fireEvent.update(field, NEW_USER.username);
    await fireEvent.blur(field);

    expect(await screen.findByText(usernameAvailable$())).toBeInTheDocument();
  });

  it('lists what to correct before saving anything', async () => {
    await openPanel();
    await fireEvent.click(screen.getByRole('button', { name: saveAndClose$() }));

    expect(screen.getByRole('alert')).toHaveTextContent(formHasErrors$());
    expect(screen.getAllByText(fieldRequired$()).length).toBeGreaterThan(0);
    expect(mockSaveUser).not.toHaveBeenCalled();
  });

  it('confirms the account, and keeps the panel open to add another', async () => {
    mockSaveUser.mockResolvedValue({ id: 'u-1', full_name: NEW_USER.fullName });
    const { emitted } = await openPanel();
    await fillForm();
    await fireEvent.click(screen.getByRole('button', { name: saveAndAddAnother$() }));

    await waitFor(() => expect(emitted().created).toBeTruthy());
    expect(mockCreateSnackbar).toHaveBeenCalledWith(userCreated$({ name: NEW_USER.fullName }));
    expect(screen.getByRole('status')).toHaveTextContent(
      userCreatedAddAnother$({ name: NEW_USER.fullName }),
    );
  });
});
