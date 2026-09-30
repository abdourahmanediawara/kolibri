import urls from 'kolibri/urls';
import plugin_data from 'kolibri-plugin-data';
import { useAePermissions } from './composables/useAePermissions';

function portalAbsoluteUrl(hashPath = '') {
  const portalPath = urls['kolibri:action_education_portal:portal']();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const hash = hashPath ? `#${hashPath}` : '';
  return `${origin}${portalPath}${hash}`;
}

export function signInUrl(nextUrl) {
  // Prefer the AE sign-in page when already inside the portal SPA.
  const portalPath = urls['kolibri:action_education_portal:portal']();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  if (nextUrl) {
    return `${origin}${portalPath}#/connexion`;
  }
  return `${origin}${portalPath}#/connexion`;
}

export function redirectToSignIn() {
  if (typeof window === 'undefined') {
    return;
  }
  window.location.assign(signInUrl());
}

export function requirePerm(getterName) {
  return (to, from, next) => {
    const perms = useAePermissions();
    if (!perms.isUserLoggedIn.value) {
      next({ name: 'AeSignIn', query: { next: to.fullPath } });
      return;
    }
    if (perms[getterName] && perms[getterName].value) {
      next();
      return;
    }
    next({ name: 'AeForbidden' });
  };
}

/**
 * Learner pages open to visitors ("Explorer sans compte") when the device allows guests:
 * the library and the help. Other learner pages send visitors to the library.
 */
export function allowGuests(getterName, { guestPage = true } = {}) {
  const signedIn = requirePerm(getterName);
  return (to, from, next) => {
    const perms = useAePermissions();
    if (!perms.isUserLoggedIn.value && plugin_data.allowGuestAccess) {
      next(guestPage ? undefined : { name: 'AeLearnLibrary' });
      return;
    }
    signedIn(to, from, next);
  };
}

export function redirectRoot(to, from, next) {
  const perms = useAePermissions();
  if (!perms.isUserLoggedIn.value) {
    next({ name: 'AeSignIn' });
    return;
  }
  next(perms.defaultLandingPath.value);
}

export function requireAnonymousOrRedirect(to, from, next) {
  const perms = useAePermissions();
  if (perms.isUserLoggedIn.value) {
    next(perms.defaultLandingPath.value);
    return;
  }
  next();
}

export { portalAbsoluteUrl };
