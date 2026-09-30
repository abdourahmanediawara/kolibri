import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

// Same breakpoint as AeSpaceLayout: on computers the portal never scrolls.
const FIT_MEDIA = '(min-width: 900px) and (min-height: 640px)';

/**
 * How many rows fit in a list area whose height comes from the free space.
 * Off computers (tablets, phones) the page scrolls, so a fixed size is used.
 *
 * Bind `area` to the element holding the rows (it may appear later, e.g. after
 * loading); call `measure()` once rows are rendered.
 */
export function useFitPageSize({
  rowSelector,
  headSelector = null,
  defaultSize = 20,
  minSize = 3,
  fallbackRowHeight = 48,
} = {}) {
  const area = ref(null);
  const pageSize = ref(defaultSize);
  let fitQuery = null;
  let resizeObserver = null;

  function measureNow() {
    const element = area.value;
    if (!element || !fitQuery || !fitQuery.matches) {
      pageSize.value = defaultSize;
      return;
    }
    const head = headSelector ? element.querySelector(headSelector) : null;
    const row = element.querySelector(rowSelector);
    const rowHeight = row ? row.offsetHeight : fallbackRowHeight;
    const available = element.clientHeight - (head ? head.offsetHeight : 0);
    pageSize.value = Math.max(minSize, Math.floor(available / rowHeight));
  }

  function measure() {
    nextTick(measureNow);
  }

  // Follow the area element as it appears, changes or goes away.
  watch(
    area,
    (element, previous) => {
      if (window.ResizeObserver && !resizeObserver) {
        resizeObserver = new ResizeObserver(measureNow);
      }
      if (resizeObserver) {
        if (previous) {
          resizeObserver.unobserve(previous);
        }
        if (element) {
          resizeObserver.observe(element);
        }
      }
      measureNow();
    },
    { flush: 'post' },
  );

  onMounted(() => {
    // Without matchMedia (old browsers, tests) the page simply keeps its default size.
    fitQuery = window.matchMedia ? window.matchMedia(FIT_MEDIA) : null;
    if (fitQuery) {
      fitQuery.addEventListener('change', measureNow);
    }
    if (!window.ResizeObserver) {
      window.addEventListener('resize', measureNow);
    }
    measureNow();
  });

  onBeforeUnmount(() => {
    if (fitQuery) {
      fitQuery.removeEventListener('change', measureNow);
    }
    if (resizeObserver) {
      resizeObserver.disconnect();
    } else {
      window.removeEventListener('resize', measureNow);
    }
  });

  return { area, pageSize, measure };
}
