import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

const previousFullPath = ref(null);
let historyHookInstalled = false;

function ensureHistoryHook(router) {
  if (historyHookInstalled) {
    return;
  }
  historyHookInstalled = true;
  router.afterEach((to, from) => {
    if (from && from.matched && from.matched.length) {
      previousFullPath.value = from.fullPath;
    }
  });
}

/**
 * In-app back navigation for AE space layouts (hash router).
 * Uses the previous portal route when available, otherwise a space root fallback.
 */
export function useAeHistory(fallbackTo = '/') {
  const router = useRouter();
  const route = useRoute();
  ensureHistoryHook(router);

  const showBack = computed(() => {
    // Hide on each space home (no deeper page to leave).
    return !/^\/(apprenant|formateur|administrateur)\/?$/.test(route.path);
  });

  function goBack() {
    const fallback =
      typeof fallbackTo === 'object' && fallbackTo && 'value' in fallbackTo
        ? fallbackTo.value
        : fallbackTo;
    const prev = previousFullPath.value;
    if (prev && prev !== route.fullPath) {
      router.push(prev);
      return;
    }
    router.push(fallback || '/');
  }

  return {
    showBack,
    goBack,
    previousFullPath,
  };
}
