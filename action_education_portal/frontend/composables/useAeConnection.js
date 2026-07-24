import { computed, onMounted, onUnmounted, ref } from 'vue';

/**
 * Lightweight online/offline awareness for AE portal status lines.
 * Relies on browser navigator.onLine + online/offline events (no network probes).
 */
export function useAeConnection() {
  const online = ref(typeof navigator !== 'undefined' ? navigator.onLine : true);

  function sync() {
    online.value = typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  onMounted(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    sync();
  });

  onUnmounted(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.removeEventListener('online', sync);
    window.removeEventListener('offline', sync);
  });

  const isOnline = computed(() => online.value);

  return {
    isOnline,
  };
}
