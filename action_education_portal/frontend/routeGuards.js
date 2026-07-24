import urls from 'kolibri/urls';
import { useAePermissions } from './composables/useAePermissions';

function portalAbsoluteUrl(hashPath = '') {
  const portalPath = urls['kolibri:action_education_portal:portal']();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const hash = hashPath ? `#${hashPath}` : '';
  return `${origin}${portalPath}${hash}`;
}

export function signInUrl(nextUrl) {
  const auth = urls['kolibri:kolibri.plugins.user_auth:user_auth'];
  if (!auth) {
    return '/';
  }
  const next = encodeURIComponent(nextUrl || portalAbsoluteUrl());
  return `${auth()}#/signin?next=${next}`;
}

export function redirectToSignIn(hashPath = '') {
  if (typeof window === 'undefined') {
    return;
  }
  window.location.assign(signInUrl(portalAbsoluteUrl(hashPath)));
}

export function requirePerm(getterName) {
  return (to, from, next) => {
    const perms = useAePermissions();
    if (!perms.isUserLoggedIn.value) {
      redirectToSignIn(to.fullPath || '/ae/learn');
      return;
    }
    if (perms[getterName] && perms[getterName].value) {
      next();
      return;
    }
    next({ name: 'AeForbidden' });
  };
}

export function redirectRoot(to, from, next) {
  const perms = useAePermissions();
  if (!perms.isUserLoggedIn.value) {
    redirectToSignIn();
    return;
  }
  next(perms.defaultLandingPath.value);
}
