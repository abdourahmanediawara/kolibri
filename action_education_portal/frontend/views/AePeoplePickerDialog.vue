<template>

  <transition name="ae-picker">
    <div
      v-if="open"
      class="ae-picker-root"
      @keydown.esc="close"
    >
      <div
        class="ae-picker-backdrop"
        aria-hidden="true"
        @click="close"
      ></div>

      <section
        class="ae-picker"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
      >
        <header class="ae-picker-head">
          <span
            class="ae-picker-head-icon"
            aria-hidden="true"
          >
            <AeIcon
              :name="icon"
              :size="32"
            />
          </span>
          <div class="ae-picker-head-text">
            <h2
              :id="titleId"
              class="ae-picker-title"
            >
              {{ title }}
            </h2>
            <p class="ae-picker-subtitle">
              {{ subtitle }}
            </p>
          </div>
          <img
            class="ae-picker-art"
            :src="artSrc"
            alt=""
          >
          <button
            type="button"
            class="ae-picker-close"
            :aria-label="closeAction$()"
            @click="close"
          >
            <AeIcon
              name="x"
              :size="24"
            />
          </button>
        </header>

        <div class="ae-picker-body">
          <p class="ae-picker-intro">
            {{ intro }}
          </p>
          <div
            v-if="alert && alert.text"
            class="ae-picker-alert"
            role="alert"
          >
            <AeIcon
              name="circleAlert"
              :size="22"
            />
            <span>{{ alert.text }}</span>
          </div>

          <div class="ae-picker-toolbar">
            <label class="ae-picker-search">
              <AeIcon
                name="search"
                class="ae-picker-search-icon"
                :size="20"
              />
              <span class="ae-picker-visually-hidden">{{ searchPeopleLabel$() }}</span>
              <input
                ref="searchField"
                v-model="query"
                type="search"
                autocomplete="off"
                :placeholder="searchPeopleLabel$()"
              >
            </label>
            <label class="ae-picker-filter">
              <AeIcon
                name="filter"
                :size="18"
              />
              <span class="ae-picker-visually-hidden">{{ filterByRoleLabel$() }}</span>
              <select v-model="roleFilter">
                <option value="">{{ allRolesOption$() }}</option>
                <option
                  v-for="option in roleOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
              <AeIcon
                name="chevronDown"
                :size="18"
              />
            </label>
          </div>

          <div class="ae-picker-table-wrap">
            <table
              v-if="shownPeople.length"
              class="ae-picker-table"
            >
              <thead>
                <tr>
                  <th
                    scope="col"
                    class="ae-picker-check-cell"
                  >
                    <label class="ae-picker-check-all">
                      <input
                        type="checkbox"
                        :checked="allPageSelected"
                        :indeterminate.prop="somePageSelected && !allPageSelected"
                        @change="togglePage($event.target.checked)"
                      >
                      <span>{{ selectAllLabel$() }}</span>
                    </label>
                  </th>
                  <th
                    scope="col"
                    :aria-sort="ariaSort('name')"
                  >
                    <button
                      type="button"
                      class="ae-picker-sort"
                      @click="sortBy('name')"
                    >
                      <span>{{ fullNameLabel$() }}</span>
                      <AeIcon
                        name="arrowUpDown"
                        :size="14"
                      />
                    </button>
                  </th>
                  <th
                    scope="col"
                    :aria-sort="ariaSort('username')"
                  >
                    <button
                      type="button"
                      class="ae-picker-sort"
                      @click="sortBy('username')"
                    >
                      <span>{{ usernameLabel$() }}</span>
                      <AeIcon
                        name="arrowUpDown"
                        :size="14"
                      />
                    </button>
                  </th>
                  <th scope="col">
                    {{ roleColumnLabel }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="person in pagePeople"
                  :key="person.id"
                  :class="{ 'ae-picker-row-on': isSelected(person) }"
                >
                  <td class="ae-picker-check-cell">
                    <input
                      :id="`ae-picker-${person.id}`"
                      type="checkbox"
                      :aria-label="person.name"
                      :checked="isSelected(person)"
                      @change="toggle(person, $event.target.checked)"
                    >
                  </td>
                  <td>
                    <label
                      :for="`ae-picker-${person.id}`"
                      class="ae-picker-person"
                    >
                      <AeAvatar
                        :name="person.name"
                        :toneKey="person.id"
                      />
                      <span>{{ person.name }}</span>
                    </label>
                  </td>
                  <td class="ae-picker-username">
                    {{ person.username }}
                  </td>
                  <td>
                    <span
                      v-if="person.roleLabel"
                      class="ae-picker-role"
                      :class="`ae-picker-role-${person.roleKey}`"
                    >{{ person.roleLabel }}</span>
                    <span
                      v-else
                      class="ae-picker-none"
                    >—</span>
                  </td>
                </tr>
              </tbody>
            </table>
            <p
              v-else
              class="ae-picker-empty"
            >
              {{ people.length ? noPeopleMatch$() : noPeopleAvailable$() }}
            </p>
          </div>

          <div class="ae-picker-note-row">
            <p class="ae-picker-note">
              <AeIcon
                name="circleAlert"
                :size="18"
              />
              <span>{{ note }}</span>
            </p>
            <span
              v-if="pageCount > 1"
              class="ae-picker-pager"
            >
              <span>{{ pageRange$({ start: pageStart + 1, end: pageEnd, total: shownPeople.length }) }}</span>
              <button
                v-for="number in pageCount"
                :key="number"
                type="button"
                class="ae-picker-page"
                :class="{ 'ae-picker-page-on': number === page }"
                :aria-current="number === page ? 'page' : null"
                @click="page = number"
              >
                {{ number }}
              </button>
            </span>
          </div>
        </div>

        <footer class="ae-picker-foot">
          <p
            class="ae-picker-count"
            aria-live="polite"
          >
            {{ peopleAvailableCount$({ count: people.length }) }} ·
            <strong>{{ peopleSelectedCount$({ count: selected.length }) }}</strong>
          </p>
          <div class="ae-picker-actions">
            <button
              type="button"
              class="ae-picker-cancel"
              @click="close"
            >
              {{ cancelAction$() }}
            </button>
            <button
              type="button"
              class="ae-picker-confirm"
              :disabled="!selected.length || busy"
              @click="$emit('confirm', [...selected])"
            >
              {{ confirmLabel(selected.length) }}
            </button>
          </div>
        </footer>
      </section>
    </div>
  </transition>

</template>


<script>

  import { computed, nextTick, ref, watch } from 'vue';
  import urls from 'kolibri/urls';
  import { coreStrings } from 'kolibri/uiText/commonCoreStrings';
  import { currentLanguage } from 'kolibri/utils/i18n';
  import { portalStrings } from '../strings';
  import AeAvatar from './AeAvatar';
  import AeIcon from './AeIcon';

  const PAGE_SIZE = 10;

  function normalize(text) {
    return String(text || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase();
  }

  /**
   * Centered dialog to pick several people: search, role filter, sortable table
   * with checkboxes and pages, then one confirm button ("Affecter 2 formateurs").
   * People: [{ id, name, username, roleKey, roleLabel }].
   */
  export default {
    name: 'AePeoplePickerDialog',
    components: { AeAvatar, AeIcon },
    setup(props, { emit }) {
      const {
        searchPeopleLabel$,
        filterByRoleLabel$,
        allRolesOption$,
        selectAllLabel$,
        fullNameLabel$,
        usernameLabel$,
        noPeopleMatch$,
        noPeopleAvailable$,
        peopleAvailableCount$,
        peopleSelectedCount$,
        pageRange$,
      } = portalStrings;
      const { closeAction$, cancelAction$ } = coreStrings;

      const query = ref('');
      const roleFilter = ref('');
      const sortKey = ref('name');
      const sortAscending = ref(true);
      const page = ref(1);
      const selected = ref([]);
      const searchField = ref(null);

      const collator = new Intl.Collator(currentLanguage, { sensitivity: 'base' });

      const shownPeople = computed(() => {
        const needle = normalize(query.value.trim());
        const found = props.people.filter(
          person =>
            (!roleFilter.value || person.roleKey === roleFilter.value) &&
            (!needle || normalize(`${person.name} ${person.username}`).includes(needle)),
        );
        const direction = sortAscending.value ? 1 : -1;
        return found.sort((a, b) => direction * collator.compare(a[sortKey.value], b[sortKey.value]));
      });

      const pageCount = computed(() => Math.max(1, Math.ceil(shownPeople.value.length / PAGE_SIZE)));
      const pageStart = computed(() => (page.value - 1) * PAGE_SIZE);
      const pageEnd = computed(() => Math.min(shownPeople.value.length, pageStart.value + PAGE_SIZE));
      const pagePeople = computed(() => shownPeople.value.slice(pageStart.value, pageEnd.value));

      function isSelected(person) {
        return selected.value.includes(person.id);
      }

      function toggle(person, checked) {
        selected.value = checked
          ? [...selected.value, person.id]
          : selected.value.filter(id => id !== person.id);
      }

      const allPageSelected = computed(
        () => pagePeople.value.length > 0 && pagePeople.value.every(isSelected),
      );
      const somePageSelected = computed(() => pagePeople.value.some(isSelected));

      function togglePage(checked) {
        const ids = pagePeople.value.map(person => person.id);
        selected.value = checked
          ? [...new Set([...selected.value, ...ids])]
          : selected.value.filter(id => !ids.includes(id));
      }

      function sortBy(key) {
        if (sortKey.value === key) {
          sortAscending.value = !sortAscending.value;
        } else {
          sortKey.value = key;
          sortAscending.value = true;
        }
      }

      function ariaSort(key) {
        if (sortKey.value !== key) {
          return 'none';
        }
        return sortAscending.value ? 'ascending' : 'descending';
      }

      function close() {
        emit('close');
      }

      watch([query, roleFilter], () => {
        page.value = 1;
      });
      watch(pageCount, count => {
        page.value = Math.min(page.value, count);
      });

      // Each opening starts from scratch, with the search field ready.
      let returnFocusTo = null;
      watch(
        () => props.open,
        isOpen => {
          if (isOpen) {
            returnFocusTo = document.activeElement;
            query.value = '';
            roleFilter.value = '';
            page.value = 1;
            selected.value = [];
            nextTick(() => searchField.value && searchField.value.focus());
          } else if (returnFocusTo && returnFocusTo.focus) {
            returnFocusTo.focus();
          }
        },
      );

      return {
        searchPeopleLabel$,
        filterByRoleLabel$,
        allRolesOption$,
        selectAllLabel$,
        fullNameLabel$,
        usernameLabel$,
        noPeopleMatch$,
        noPeopleAvailable$,
        peopleAvailableCount$,
        peopleSelectedCount$,
        pageRange$,
        closeAction$,
        cancelAction$,
        artSrc: urls.static('action_education_portal/ae-sidebar-books.png'),
        query,
        roleFilter,
        page,
        selected,
        searchField,
        shownPeople,
        pageCount,
        pageStart,
        pageEnd,
        pagePeople,
        allPageSelected,
        somePageSelected,
        isSelected,
        toggle,
        togglePage,
        sortBy,
        ariaSort,
        close,
      };
    },
    props: {
      open: {
        type: Boolean,
        default: false,
      },
      title: {
        type: String,
        required: true,
      },
      /** Usually the name of the class. */
      subtitle: {
        type: String,
        default: '',
      },
      intro: {
        type: String,
        default: '',
      },
      icon: {
        type: String,
        default: 'userPlus',
      },
      titleId: {
        type: String,
        required: true,
      },
      people: {
        type: Array,
        default: () => [],
      },
      /** Options of the role filter: [{ value (roleKey), label }]. */
      roleOptions: {
        type: Array,
        default: () => [],
      },
      roleColumnLabel: {
        type: String,
        required: true,
      },
      /** Short sentence under the table, e.g. who is not listed. */
      note: {
        type: String,
        default: '',
      },
      /** Label of the confirm button for a number of selected people. */
      confirmLabel: {
        type: Function,
        required: true,
      },
      busy: {
        type: Boolean,
        default: false,
      },
      /** Error of the last try: { text }, or null. */
      alert: {
        type: Object,
        default: null,
      },
    },
  };

</script>


<style lang="scss" scoped>

  @import '../styles/tokens';
  @import '../styles/components';

  .ae-picker-visually-hidden {
    @include ae-visually-hidden;
  }

  .ae-picker-root {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 30;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }

  .ae-picker-backdrop {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(31, 29, 61, 0.45);
  }

  .ae-picker {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 880px;
    max-width: 100%;
    max-height: 100%;
    overflow: hidden;
    background: var(--ae-surface);
    border-radius: var(--ae-radius-xl);
    box-shadow: var(--ae-shadow-raised);
  }

  .ae-picker-head {
    position: relative;
    display: flex;
    flex-shrink: 0;
    gap: 16px;
    align-items: center;
    min-height: 96px;
    padding: 16px 64px 16px 24px;
    overflow: hidden;
    background: linear-gradient(90deg, #fff0e8 0%, #fdf3ec 100%);
  }

  .ae-picker-head-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    color: var(--ae-orange);
    background: #ffffff;
    border-radius: var(--ae-radius-md);
  }

  .ae-picker-head-text {
    position: relative;
    z-index: 1;
    flex: 1;
    min-width: 0;
  }

  .ae-picker-title {
    margin: 0;
    font-size: 24px;
    font-weight: 800;
    color: var(--ae-navy);
  }

  .ae-picker-subtitle {
    margin: 2px 0 0;
    font-size: 16px;
    color: var(--ae-text-muted);
  }

  .ae-picker-art {
    width: 120px;
    height: 92px;
    object-fit: contain;
  }

  .ae-picker-close {
    position: absolute;
    top: 14px;
    right: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    color: var(--ae-navy);
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: var(--ae-radius-sm);

    &:hover {
      background: rgba(255, 255, 255, 0.7);
    }

    @include ae-focus-ring;
  }

  .ae-picker-body {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
    padding: 16px 24px 12px;
  }

  .ae-picker-intro {
    margin: 0;
    font-size: 16px;
    color: var(--ae-text);
  }

  .ae-picker-alert {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 10px 14px;
    font-weight: 700;
    color: var(--ae-danger);
    background: var(--ae-danger-soft);
    border: 1.5px solid var(--ae-danger);
    border-radius: var(--ae-radius-md);
  }

  .ae-picker-toolbar {
    display: flex;
    gap: 12px;
  }

  .ae-picker-search {
    position: relative;
    flex: 1;

    input {
      @include ae-field;

      height: 44px;
      padding-inline-start: 44px;
    }
  }

  .ae-picker-search-icon {
    position: absolute;
    top: 12px;
    inset-inline-start: 14px;
    color: var(--ae-text-subtle);
  }

  .ae-picker-filter {
    position: relative;
    display: flex;
    flex: 0 0 200px;
    align-items: center;
    color: var(--ae-text-muted);

    svg:first-of-type {
      position: absolute;
      inset-inline-start: 14px;
      pointer-events: none;
    }

    svg:last-of-type {
      position: absolute;
      inset-inline-end: 12px;
      pointer-events: none;
    }

    select {
      @include ae-field;

      height: 44px;
      padding-inline: 40px 36px;
      appearance: none;
    }
  }

  .ae-picker-table-wrap {
    flex: 1 1 auto;
    min-height: 120px;
    overflow-y: auto;
    border: 1px solid var(--ae-line);
    border-radius: var(--ae-radius-md);
  }

  .ae-picker-table {
    width: 100%;
    border-collapse: collapse;

    th {
      position: sticky;
      top: 0;
      z-index: 1;
      padding: 10px 12px;
      font-size: 14px;
      font-weight: 700;
      color: var(--ae-navy);
      text-align: start;
      background: var(--ae-surface-muted);
    }

    td {
      padding: 6px 12px;
      font-size: 15px;
      border-top: 1px solid var(--ae-line);
    }
  }

  .ae-picker-row-on td {
    background: var(--ae-orange-wash);
  }

  .ae-picker-check-cell {
    width: 150px;

    input {
      width: 18px;
      height: 18px;
      accent-color: var(--ae-orange);
      cursor: pointer;
    }
  }

  .ae-picker-check-all {
    display: inline-flex;
    gap: 10px;
    align-items: center;
    cursor: pointer;
  }

  .ae-picker-sort {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    padding: 0;
    font: inherit;
    font-weight: 700;
    color: inherit;
    cursor: pointer;
    background: none;
    border: 0;

    @include ae-focus-ring;
  }

  .ae-picker-person {
    display: inline-flex;
    gap: 10px;
    align-items: center;
    font-weight: 600;
    color: var(--ae-text);
    cursor: pointer;
  }

  .ae-picker-username {
    color: var(--ae-text-muted);
  }

  .ae-picker-role {
    display: inline-block;
    padding: 2px 10px;
    font-size: 13px;
    font-weight: 700;
    border-radius: var(--ae-radius-sm);
  }

  .ae-picker-role-superuser {
    color: var(--ae-navy);
    background: #e9e7f5;
  }

  .ae-picker-role-admin {
    color: #ffffff;
    background: #5b5e78;
  }

  .ae-picker-role-coach {
    color: #1b6e3c;
    background: var(--ae-kpi-green);
  }

  .ae-picker-none {
    color: var(--ae-text-subtle);
  }

  .ae-picker-empty {
    padding: 24px;
    margin: 0;
    color: var(--ae-text-muted);
    text-align: center;
  }

  .ae-picker-note-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
  }

  .ae-picker-note {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    padding: 6px 12px;
    margin: 0;
    font-size: 14px;
    color: var(--ae-text-muted);
    background: #fff8e6;
    border-radius: var(--ae-radius-sm);

    svg {
      color: #d99a00;
    }
  }

  .ae-picker-pager {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    font-size: 14px;
    color: var(--ae-text-muted);
  }

  .ae-picker-page {
    min-width: 32px;
    height: 32px;
    font: inherit;
    font-weight: 700;
    color: var(--ae-navy);
    cursor: pointer;
    background: var(--ae-surface-muted);
    border: 0;
    border-radius: var(--ae-radius-sm);

    @include ae-focus-ring;
  }

  .ae-picker-page-on {
    color: #ffffff;
    background: var(--ae-orange);
  }

  .ae-picker-foot {
    display: flex;
    flex-shrink: 0;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    padding: 14px 24px 18px;
    border-top: 1px solid var(--ae-line);
  }

  .ae-picker-count {
    margin: 0;
    color: var(--ae-text-muted);

    strong {
      color: var(--ae-orange-ink);
    }
  }

  .ae-picker-actions {
    display: flex;
    gap: 12px;
  }

  .ae-picker-cancel {
    @include ae-button-outline;

    min-width: 120px;
  }

  .ae-picker-confirm {
    @include ae-button-primary;

    min-height: 44px;
    font-size: 17px;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  .ae-picker-enter-active,
  .ae-picker-leave-active {
    transition: opacity 180ms ease;
  }

  .ae-picker-enter,
  .ae-picker-leave-to {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .ae-picker-enter-active,
    .ae-picker-leave-active {
      transition: none;
    }
  }

</style>
