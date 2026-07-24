import { useAePermissions } from './composables/useAePermissions';

export function requirePerm(getterName) {
  return (to, from, next) => {
    const perms = useAePermissions();
    if (perms[getterName] && perms[getterName].value) {
      next();
      return;
    }
    next({ name: 'AeForbidden' });
  };
}

export function redirectRoot(to, from, next) {
  const perms = useAePermissions();
  next(perms.defaultLandingPath.value);
}
