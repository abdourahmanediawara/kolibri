import { ref } from 'vue';
import { useClassroomApi } from './useClassroomApi';

/**
 * Says, as soon as a username is typed, whether a new account can use it:
 * '' (not checked), 'checking', 'available', 'taken' or 'invalid'.
 * The server still checks again when the account is saved.
 */
export function useUsernameCheck() {
  const { checkUsername } = useClassroomApi();
  const usernameStatus = ref('');
  let latest = '';

  function resetUsernameStatus() {
    latest = '';
    usernameStatus.value = '';
  }

  async function checkUsernameAvailable(value) {
    const username = (value || '').trim();
    latest = username;
    if (!username) {
      usernameStatus.value = '';
      return '';
    }
    usernameStatus.value = 'checking';
    try {
      const result = await checkUsername(username);
      // A newer check started while this one was running.
      if (latest !== username) {
        return usernameStatus.value;
      }
      if (!result.valid) {
        usernameStatus.value = 'invalid';
      } else {
        usernameStatus.value = result.available ? 'available' : 'taken';
      }
    } catch (e) {
      if (latest === username) {
        usernameStatus.value = '';
      }
    }
    return usernameStatus.value;
  }

  return { usernameStatus, checkUsernameAvailable, resetUsernameStatus };
}
