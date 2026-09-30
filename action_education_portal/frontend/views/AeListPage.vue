<template>

  <div class="ae-list">
    <AePageHeader
      :title="title"
      :crumbs="crumbs"
      :countLabel="loading ? '' : countLabel"
      :subtitle="subtitle"
      :note="note"
      :action="action"
    >
      <template
        v-if="$slots.actions"
        #actions
      >
        <slot name="actions"></slot>
      </template>
    </AePageHeader>

    <!-- Replaceable, e.g. by a summary of the page. -->
    <slot name="banner"></slot>
    <section
      v-if="bannerTitle && !$slots.banner"
      class="ae-list-banner"
      aria-labelledby="ae-list-banner-title"
    >
      <span
        class="ae-list-banner-icon"
        aria-hidden="true"
      >
        <KIcon
          :icon="bannerIcon"
          color="var(--ae-orange)"
        />
      </span>
      <div class="ae-list-banner-text">
        <h2
          id="ae-list-banner-title"
          class="ae-list-banner-title"
        >
          {{ bannerTitle }}
        </h2>
        <p class="ae-list-banner-subtitle">
          {{ bannerSubtitle }}
        </p>
      </div>
      <img
        v-if="bannerArt"
        class="ae-list-banner-art"
        :src="bannerArt"
        alt=""
        width="786"
        height="400"
      >
    </section>

    <section
      class="ae-list-card"
      :aria-label="title"
    >
      <div
        v-if="searchFields.length || $slots.filters || sortOptions.length > 1"
        class="ae-list-toolbar"
      >
        <label
          v-if="searchFields.length"
          class="ae-list-search"
        >
          <AeIcon
            name="search"
            class="ae-list-search-icon"
            :size="20"
          />
          <span class="ae-list-visually-hidden">{{ searchLabel }}</span>
          <input
            v-model="query"
            type="search"
            autocomplete="off"
            :placeholder="searchPlaceholder"
          >
        </label>
        <!-- Page filters: labels with the ae-list-filter class. -->
        <slot name="filters"></slot>
        <label
          v-if="sortOptions.length > 1"
          class="ae-list-sort"
        >
          <span>{{ sortLabel$() }}</span>
          <select v-model="sortKey">
            <option
              v-for="option in sortOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
          <AeIcon
            name="chevronDown"
            class="ae-list-sort-icon"
            :size="18"
          />
        </label>
      </div>

      <div
        ref="rowsArea"
        class="ae-list-table-wrap"
      >
        <KCircularLoader
          v-if="loading"
          :delay="false"
        />
        <div
          v-else-if="errorText"
          class="ae-list-error"
          role="alert"
        >
          <p>{{ errorText }}</p>
          <button
            type="button"
            class="ae-list-retry"
            @click="$emit('retry')"
          >
            {{ retryAction$() }}
          </button>
        </div>
        <p
          v-else-if="!items.length"
          class="ae-list-empty"
        >
          {{ emptyText }}
        </p>
        <p
          v-else-if="!filteredItems.length"
          class="ae-list-empty"
        >
          {{ noMatchText }}
        </p>
        <table
          v-else
          class="ae-list-table"
        >
          <thead>
            <tr>
              <slot name="head"></slot>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in pageRows"
              :key="item.id"
            >
              <slot
                name="row"
                :item="item"
                :openUp="index > 1 && index >= pageRows.length - 2"
              ></slot>
            </tr>
          </tbody>
        </table>
      </div>

      <footer
        v-if="!loading && !errorText && filteredItems.length"
        class="ae-list-foot"
      >
        <span>{{ totalLabel(filteredItems.length) }}</span>
        <span class="ae-list-pager">
          <span>{{ rangeLabel }}</span>
          <template v-if="pageCount > 1">
            <button
              type="button"
              class="ae-list-page-btn"
              :disabled="page === 1"
              :aria-label="previousPage$()"
              @click="page -= 1"
            >
              <AeIcon
                name="chevronLeft"
                :size="18"
              />
            </button>
            <button
              type="button"
              class="ae-list-page-btn"
              :disabled="page === pageCount"
              :aria-label="nextPage$()"
              @click="page += 1"
            >
              <AeIcon
                name="chevronRight"
                :size="18"
              />
            </button>
          </template>
        </span>
      </footer>
    </section>

    <!-- Overlays of the page, e.g. a create panel. -->
    <slot name="extra"></slot>
  </div>

</template>


<script>

  import { computed, ref, watch } from 'vue';
  import { portalStrings } from '../strings';
  import { useFitPageSize } from '../composables/useFitPageSize';
  import AeIcon from './AeIcon';
  import AePageHeader from './AePageHeader';

  function normalize(text) {
    return String(text || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase();
  }

  /**
   * AE list page: breadcrumb, title, banner, then a searchable, sortable table.
   * On computers the page never scrolls: the page size follows the room left.
   * Pages provide the header cells (#head) and the cells of each row (#row).
   */
  export default {
    name: 'AeListPage',
    components: { AePageHeader, AeIcon },
    setup(props) {
      const { sortLabel$, pageRange$, previousPage$, nextPage$, retryAction$ } = portalStrings;

      const query = ref('');
      const sortKey = ref(props.sortOptions.length ? props.sortOptions[0].value : '');
      const page = ref(1);
      const {
        area: rowsArea,
        pageSize,
        measure,
      } = useFitPageSize({ rowSelector: 'tbody tr', headSelector: 'thead' });

      const filteredItems = computed(() => {
        const needle = normalize(query.value.trim());
        const option = props.sortOptions.find(o => o.value === sortKey.value);
        const found = props.items.filter(
          item => !needle || props.searchFields.some(key => normalize(item[key]).includes(needle)),
        );
        return option ? found.sort(option.compare) : found;
      });

      const pageCount = computed(() =>
        Math.max(1, Math.ceil(filteredItems.value.length / pageSize.value)),
      );

      const pageRows = computed(() => {
        const start = (page.value - 1) * pageSize.value;
        return filteredItems.value.slice(start, start + pageSize.value);
      });

      const rangeLabel = computed(() => {
        const total = filteredItems.value.length;
        const start = (page.value - 1) * pageSize.value + 1;
        const end = Math.min(total, page.value * pageSize.value);
        return pageRange$({ start, end, total });
      });

      watch([query, sortKey], () => {
        page.value = 1;
      });
      watch(pageCount, count => {
        page.value = Math.min(page.value, count);
      });

      // Row height is only known once rows exist.
      watch(
        () => props.loading,
        loading => {
          if (!loading) {
            measure();
          }
        },
      );

      return {
        sortLabel$,
        retryAction$,
        previousPage$,
        nextPage$,
        query,
        sortKey,
        page,
        pageCount,
        pageRows,
        filteredItems,
        rangeLabel,
        rowsArea,
      };
    },
    props: {
      title: {
        type: String,
        required: true,
      },
      countLabel: {
        type: String,
        default: '',
      },
      subtitle: {
        type: String,
        default: '',
      },
      /** Short extra line under the subtitle. */
      note: {
        type: String,
        default: '',
      },
      /** Levels between the space home and this page, see AePageHeader. */
      crumbs: {
        type: Array,
        default: () => [],
      },
      /** Main button, see AePageHeader. */
      action: {
        type: Object,
        default: null,
      },
      /** Without a title (and without a #banner slot), the page has no banner. */
      bannerTitle: {
        type: String,
        default: '',
      },
      bannerSubtitle: {
        type: String,
        default: '',
      },
      bannerIcon: {
        type: String,
        default: 'lesson',
      },
      bannerArt: {
        type: String,
        default: '',
      },
      loading: {
        type: Boolean,
        default: false,
      },
      /** Shown with a retry button (emits `retry`) instead of the rows. */
      errorText: {
        type: String,
        default: '',
      },
      /** Rows; each needs a unique `id`. */
      items: {
        type: Array,
        required: true,
      },
      /** Item keys the search looks into; none hides the search. */
      searchFields: {
        type: Array,
        default: () => [],
      },
      searchLabel: {
        type: String,
        default: '',
      },
      searchPlaceholder: {
        type: String,
        default: '',
      },
      /** [{ value, label, compare(a, b) }]; the first one is the default. */
      sortOptions: {
        type: Array,
        default: () => [],
      },
      emptyText: {
        type: String,
        required: true,
      },
      noMatchText: {
        type: String,
        required: true,
      },
      /** count => "8 utilisateurs" */
      totalLabel: {
        type: Function,
        required: true,
      },
    },
  };

</script>


<style lang="scss" scoped>

  @import '../styles/tokens';
  @import '../styles/components';

  .ae-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .ae-list-visually-hidden {
    @include ae-visually-hidden;
  }

  /* ---------- Banner ---------- */

  .ae-list-banner {
    position: relative;
    display: flex;
    gap: 28px;
    align-items: center;
    min-height: 138px;
    padding: 24px 32px;
    overflow: hidden;
    // Ends in the illustration's cream so the artwork melts into the banner.
    background: linear-gradient(90deg, #feece1 0%, #fdf0e6 55%, #fcf6ee 100%);
    border-radius: var(--ae-radius-lg);
  }

  .ae-list-banner-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 76px;
    height: 76px;
    background: var(--ae-surface);
    border-radius: 50%;

    svg {
      width: 36px;
      height: 36px;
    }
  }

  .ae-list-banner-text {
    position: relative;
    z-index: 1;
    max-width: 55%;
  }

  .ae-list-banner-title {
    margin: 0;
    font-size: 26px;
    font-weight: 800;
    line-height: 1.2;
    color: var(--ae-navy);
  }

  .ae-list-banner-subtitle {
    margin: 6px 0 0;
    font-size: 17px;
    color: var(--ae-text-muted);
  }

  .ae-list-banner-art {
    position: absolute;
    top: 0;
    right: 0;
    width: auto;
    max-width: 42%;
    height: 100%;
    pointer-events: none;
    object-fit: cover;
    object-position: right top;
    mask-image: linear-gradient(to right, transparent, #000000 30%);
  }

  /* ---------- Card, toolbar ---------- */

  .ae-list-card {
    display: flex;
    flex-direction: column;
    padding: 20px 22px 12px;
    background: var(--ae-surface);
    border: 1px solid var(--ae-line);
    border-radius: var(--ae-radius-lg);
    box-shadow: var(--ae-shadow-card);
  }

  // Filters go to a second line rather than getting too narrow.
  .ae-list-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 16px;
    align-items: center;
    margin-bottom: 14px;
  }

  .ae-list-search {
    position: relative;
    display: flex;
    flex: 1;
    align-items: center;
    min-width: 200px;

    input {
      width: 100%;
      height: 44px;
      padding: 0 16px 0 48px;
      font: inherit;
      font-size: 16px;
      color: var(--ae-text);
      background: var(--ae-surface);
      border: 1.5px solid var(--ae-field-line);
      border-radius: var(--ae-radius-sm);
      outline: none;
      transition:
        border-color 150ms ease,
        box-shadow 150ms ease;

      &::placeholder {
        color: var(--ae-placeholder);
        opacity: 1;
      }

      &:focus {
        border-color: var(--ae-orange);
        box-shadow: 0 0 0 4px rgba(241, 90, 36, 0.16);
      }
    }
  }

  .ae-list-search-icon {
    position: absolute;
    left: 16px;
    color: var(--ae-text-subtle);
    pointer-events: none;
  }

  .ae-list-sort {
    position: relative;
    display: inline-flex;
    flex-shrink: 0;
    gap: 6px;
    align-items: center;
    height: 44px;
    padding: 0 12px 0 16px;
    font-size: 16px;
    font-weight: 700;
    color: var(--ae-navy);
    background: var(--ae-surface);
    border: 1.5px solid var(--ae-field-line);
    border-radius: var(--ae-radius-sm);

    &:focus-within {
      border-color: var(--ae-orange);
      box-shadow: 0 0 0 4px rgba(241, 90, 36, 0.16);
    }

    select {
      padding: 0 24px 0 0;
      font: inherit;
      color: inherit;
      appearance: none;
      cursor: pointer;
      background: transparent;
      border: 0;
      outline: none;
    }
  }

  .ae-list-sort-icon {
    position: absolute;
    right: 12px;
    pointer-events: none;
  }

  // Page filters (slot content), styled like the sort select.
  // Filters share the width; a long value ends with an ellipsis.
  .ae-list-toolbar /deep/ .ae-list-filter {
    position: relative;
    display: inline-flex;
    flex: 1 1 0;
    gap: 6px;
    align-items: center;
    min-width: 170px;
    max-width: 300px;
    height: 44px;
    padding: 0 12px 0 16px;
    font-size: 16px;
    font-weight: 700;
    color: var(--ae-navy);
    background: var(--ae-surface);
    border: 1.5px solid var(--ae-field-line);
    border-radius: var(--ae-radius-sm);

    &:focus-within {
      border-color: var(--ae-orange);
      box-shadow: 0 0 0 4px rgba(241, 90, 36, 0.16);
    }

    span {
      flex-shrink: 0;
    }

    select {
      flex: 1;
      min-width: 0;
      max-width: 100%;
      padding: 0 24px 0 0;
      overflow: hidden;
      font: inherit;
      color: inherit;
      text-overflow: ellipsis;
      appearance: none;
      cursor: pointer;
      background: transparent;
      border: 0;
      outline: none;
    }

    svg {
      position: absolute;
      right: 12px;
      pointer-events: none;
    }
  }

  /* ---------- Table (cells come from the page slots) ---------- */

  .ae-list-table-wrap {
    position: relative;
  }

  .ae-list-table {
    width: 100%;
    border-collapse: collapse;

    /deep/ th {
      height: 42px;
      padding: 0 12px;
      font-size: 15px;
      font-weight: 700;
      color: var(--ae-navy);
      text-align: start;
      white-space: nowrap;
      background: var(--ae-surface-muted);

      &:first-child {
        border-radius: var(--ae-radius-sm) 0 0 var(--ae-radius-sm);
      }

      &:last-child {
        border-radius: 0 var(--ae-radius-sm) var(--ae-radius-sm) 0;
      }
    }

    // Long headers of dense tables may take two lines.
    /deep/ th.ae-list-head-wrap {
      line-height: 1.2;
      white-space: normal;
    }

    /deep/ td {
      height: 48px;
      padding: 0 12px;
      font-size: 16px;
      color: var(--ae-text-muted);
      border-bottom: 1px solid var(--ae-line);
    }

    // Shared cell helpers for the pages.
    /deep/ .ae-list-cell-main {
      display: flex;
      gap: 14px;
      align-items: center;
      min-width: 0;
    }

    /deep/ .ae-list-cell-name {
      overflow: hidden;
      font-weight: 700;
      color: var(--ae-navy);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /deep/ .ae-list-cell-shrink {
      width: 1%;
      white-space: nowrap;
    }

    // The main column takes the rest and truncates long names instead of widening the table.
    /deep/ .ae-list-cell-grow {
      width: 100%;
      max-width: 0;
    }

    /deep/ .ae-list-cell-nowrap {
      white-space: nowrap;
    }
  }

  .ae-list-empty {
    margin: 24px 12px;
    color: var(--ae-text-muted);
  }

  .ae-list-error {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 20px;
    align-items: center;
    padding: 14px 16px;
    margin: 12px 0;
    color: var(--ae-danger);
    background: var(--ae-danger-soft);
    border-radius: var(--ae-radius-md);

    p {
      margin: 0;
      font-weight: 600;
    }
  }

  .ae-list-retry {
    @include ae-button-outline;
  }

  .ae-list-foot {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    padding-top: 10px;
    font-size: 16px;
    color: var(--ae-text-muted);
  }

  .ae-list-pager {
    display: inline-flex;
    gap: 8px;
    align-items: center;
  }

  .ae-list-page-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    color: var(--ae-navy);
    cursor: pointer;
    background: var(--ae-surface);
    border: 1.5px solid var(--ae-field-line);
    border-radius: var(--ae-radius-sm);

    &:disabled {
      cursor: default;
      opacity: 0.4;
    }

    &:focus-visible {
      outline: none;
      box-shadow: var(--ae-focus-ring);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ae-list-search input {
      transition: none;
    }
  }

  /* ---------- Responsive ---------- */

  // Computers: the card takes the remaining height, rows fill it (see page size).
  @media (min-width: 900px) and (min-height: 640px) {
    .ae-list {
      flex: 1 1 auto;
      min-height: 0;
    }

    .ae-list-card {
      flex: 1 1 auto;
      min-height: 0;
    }

    // Height comes from the free space only, never from the rows it holds.
    .ae-list-table-wrap {
      flex: 1 1 0;
      min-height: 0;
    }
  }

  @media (min-width: 900px) and (max-height: 959px) {
    .ae-list {
      gap: 12px;
    }

    .ae-list-banner {
      min-height: 108px;
      padding: 16px 28px;
    }

    .ae-list-banner-icon {
      width: 64px;
      height: 64px;
    }

    .ae-list-banner-title {
      font-size: 23px;
    }

    .ae-list-banner-subtitle {
      font-size: 16px;
    }

    .ae-list-card {
      padding-top: 16px;
    }

    .ae-list-toolbar {
      margin-bottom: 10px;
    }
  }

  @media (min-width: 900px) and (max-height: 799px) {
    .ae-list {
      gap: 10px;
    }

    .ae-list-banner {
      gap: 18px;
      min-height: 80px;
      padding: 12px 24px;
    }

    .ae-list-banner-icon {
      width: 52px;
      height: 52px;

      svg {
        width: 26px;
        height: 26px;
      }
    }

    .ae-list-banner-title {
      font-size: 20px;
    }

    .ae-list-banner-subtitle {
      margin-top: 2px;
      font-size: 15px;
    }

    .ae-list-card {
      padding: 14px 18px 8px;
    }

    .ae-list-search input,
    .ae-list-sort {
      height: 40px;
    }

    .ae-list-table {
      /deep/ th {
        height: 38px;
      }

      /deep/ td {
        height: 44px;
      }
    }

    .ae-list-foot {
      padding-top: 6px;
      font-size: 15px;
    }
  }

  // Very short screens: the banner steps aside for the list.
  @media (min-width: 900px) and (max-height: 699px) {
    .ae-list-banner {
      display: none;
    }
  }

  @media (max-width: 899px) {
    .ae-list-banner-art {
      display: none;
    }

    .ae-list-banner-text {
      max-width: none;
    }

    // Secondary columns give way first on narrow screens.
    .ae-list-table /deep/ .ae-list-cell-secondary {
      display: none;
    }
  }

  @media (max-width: 719px) {
    .ae-list-banner {
      padding: 18px 20px;
    }

    .ae-list-banner-icon {
      display: none;
    }

    .ae-list-toolbar {
      flex-wrap: wrap;
    }

    .ae-list-search {
      flex-basis: 100%;
    }
  }

</style>
