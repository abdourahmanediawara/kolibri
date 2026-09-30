import { onUnmounted, ref } from 'vue';
import { normalizeError } from './useTrainingApi';

/**
 * Per-page async load helper: always clears loading in finally, supports cancel
 * on unmount, and normalizes errors (including timeouts).
 */
export function useAsyncPageLoad(loadingRefName = 'isLoading') {
  const isLoading = ref(true);
  const loadError = ref(null);
  let cancelled = false;

  onUnmounted(() => {
    cancelled = true;
  });

  async function runLoad(loader) {
    isLoading.value = true;
    loadError.value = null;
    try {
      const result = await loader();
      if (!cancelled) {
        return result;
      }
      return undefined;
    } catch (err) {
      // Keep real errors visible in the console for diagnosis.
      // eslint-disable-next-line no-console
      console.error(`[AE ${loadingRefName}]`, err);
      if (!cancelled) {
        loadError.value = normalizeError(err);
      }
      throw err;
    } finally {
      if (!cancelled) {
        isLoading.value = false;
      }
    }
  }

  return {
    isLoading,
    loadError,
    runLoad,
    get isCancelled() {
      return cancelled;
    },
  };
}
