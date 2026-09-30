/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/vue';
import { LoginErrors } from 'kolibri/constants';
import { portalStrings } from '../strings';
import AeSignInPage from '../views/AeSignInPage.vue';

const mockLogin = jest.fn();

jest.mock('kolibri/urls');
jest.mock('kolibri-plugin-data', () => ({
  __esModule: true,
  default: {
    defaultFacilityId: 'facility-1',
    allowGuestAccess: true,
    allowLearnerSignUp: false,
  },
}));
jest.mock('kolibri/composables/useUser', () => {
  const { computed } = require('vue');
  return {
    __esModule: true,
    default: () => ({
      login: (...args) => mockLogin(...args),
      isUserLoggedIn: computed(() => false),
    }),
  };
});
jest.mock('../composables/useAePermissions', () => ({
  useAePermissions: () => ({ defaultLandingPath: { value: '/apprenant' } }),
}));

const {
  usernameLabel$,
  passwordLabel$,
  signInAction$,
  signInContinue$,
  signInCreateAccount$,
  signInExploreAsGuest$,
  signInUsernameRequired$,
  signInUsernameNotFound$,
  signInPasswordIncorrect$,
} = portalStrings;

function renderPage() {
  return render(AeSignInPage, { routes: [] });
}

async function submitUsername(username) {
  await fireEvent.update(screen.getByLabelText(usernameLabel$()), username);
  await fireEvent.click(screen.getByRole('button', { name: signInContinue$() }));
}

describe('AeSignInPage', () => {
  beforeEach(() => {
    mockLogin.mockReset();
  });

  it('asks for a username before calling the server', async () => {
    renderPage();
    await fireEvent.click(screen.getByRole('button', { name: signInContinue$() }));

    expect(mockLogin).not.toHaveBeenCalled();
    expect(screen.getByText(signInUsernameRequired$())).toBeInTheDocument();
  });

  it('moves to the password step when the account needs a password', async () => {
    mockLogin.mockResolvedValue({ data: null, error: LoginErrors.PASSWORD_MISSING });
    renderPage();

    await submitUsername('ae_learner');

    // A single payload argument: Kolibri then redirects each role to its own space.
    expect(mockLogin).toHaveBeenCalledWith({
      username: 'ae_learner',
      password: '',
      facility: 'facility-1',
    });
    await waitFor(() => expect(screen.getByLabelText(passwordLabel$())).toBeInTheDocument());
  });

  it('keeps the username step and explains when the user is unknown', async () => {
    mockLogin.mockResolvedValue({ data: null, error: LoginErrors.USER_NOT_FOUND });
    renderPage();

    await submitUsername('inconnu');

    await waitFor(() => expect(screen.getByText(signInUsernameNotFound$())).toBeInTheDocument());
    expect(screen.queryByLabelText(passwordLabel$())).not.toBeInTheDocument();
  });

  it('clears the password and shows an error when it is wrong', async () => {
    mockLogin
      .mockResolvedValueOnce({ data: null, error: LoginErrors.PASSWORD_MISSING })
      .mockResolvedValueOnce({ data: null, error: LoginErrors.INVALID_CREDENTIALS });
    renderPage();

    await submitUsername('ae_learner');
    const passwordInput = await screen.findByLabelText(passwordLabel$());
    await fireEvent.update(passwordInput, 'faux');
    await fireEvent.click(screen.getByRole('button', { name: signInAction$() }));

    expect(mockLogin).toHaveBeenLastCalledWith({
      username: 'ae_learner',
      password: 'faux',
      facility: 'facility-1',
    });
    await waitFor(() => expect(screen.getByText(signInPasswordIncorrect$())).toBeInTheDocument());
    expect(passwordInput.value).toBe('');
  });

  it('only offers the options Kolibri allows on this device', () => {
    renderPage();

    expect(screen.getByRole('link', { name: signInExploreAsGuest$() })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: signInCreateAccount$() })).not.toBeInTheDocument();
  });
});
