<template>

  <div
    class="ae-picker"
    :class="`ae-picker-${layout}`"
  >
    <div
      v-if="searchable"
      class="ae-picker-search-row"
    >
      <span class="ae-picker-search">
        <AeIcon
          name="search"
          :size="20"
        />
        <input
          v-model="query"
          type="search"
          autocomplete="off"
          :aria-label="searchLabel"
          :placeholder="searchLabel"
          @keydown.enter.prevent
        >
      </span>
      <span
        class="ae-picker-count"
        aria-live="polite"
      >
        {{ selectedCount$({ count: value.length }) }}
      </span>
    </div>

    <div
      class="ae-picker-people"
      role="group"
      :aria-labelledby="labelledby || null"
    >
      <label
        v-for="person in visiblePeople"
        :key="person.id"
        class="ae-picker-person"
        :class="{ 'ae-picker-person-checked': value.includes(person.id) }"
      >
        <input
          type="checkbox"
          :checked="value.includes(person.id)"
          @change="toggle(person.id, $event.target.checked)"
        >
        <AeAvatar
          :name="person.fullName"
          :toneKey="person.username"
        />
        <span class="ae-picker-text">
          <span class="ae-picker-name">{{ person.fullName }}</span>
          <span class="ae-picker-meta">{{ person.meta }}</span>
        </span>
      </label>
      <p
        v-if="!visiblePeople.length && !loading"
        class="ae-picker-empty"
      >
        {{ emptyText }}
      </p>
    </div>
  </div>

</template>


<script>

  import { computed, ref } from 'vue';
  import { portalStrings } from '../strings';
  import AeAvatar from './AeAvatar';
  import AeIcon from './AeIcon';

  // Accent and case insensitive, so "eleve" finds "Élève".
  function searchKey(text) {
    return String(text || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase();
  }

  /**
   * People to tick (v-model: the ticked ids), with an optional search.
   * The "list" layout takes the height left in its parent and scrolls on its own.
   */
  export default {
    name: 'AePersonPicker',
    components: { AeAvatar, AeIcon },
    setup(props, { emit }) {
      const { selectedCount$ } = portalStrings;
      const query = ref('');

      const visiblePeople = computed(() => {
        const needle = searchKey(query.value.trim());
        if (!needle) {
          return props.people;
        }
        return props.people.filter(
          person =>
            searchKey(person.fullName).includes(needle) ||
            searchKey(person.username).includes(needle),
        );
      });

      function toggle(id, checked) {
        const others = props.value.filter(value => value !== id);
        emit('input', checked ? [...others, id] : others);
      }

      return { selectedCount$, query, visiblePeople, toggle };
    },
    props: {
      /** [{ id, fullName, username, meta }] */
      people: {
        type: Array,
        required: true,
      },
      /** Ticked ids. */
      value: {
        type: Array,
        required: true,
      },
      /** "list": one per line, fills the height; "grid": two columns, a few rows. */
      layout: {
        type: String,
        default: 'list',
      },
      searchable: {
        type: Boolean,
        default: false,
      },
      searchLabel: {
        type: String,
        default: '',
      },
      /** Id of the heading naming the group of checkboxes. */
      labelledby: {
        type: String,
        default: '',
      },
      emptyText: {
        type: String,
        default: '',
      },
      /** Hides the empty text while people load. */
      loading: {
        type: Boolean,
        default: false,
      },
    },
  };

</script>


<style lang="scss" scoped>

  @import '../styles/components';

  .ae-picker-list {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
  }

  .ae-picker-search-row {
    display: flex;
    flex-shrink: 0;
    gap: 16px;
    align-items: center;
    margin-bottom: 10px;
  }

  .ae-picker-search {
    position: relative;
    display: block;
    flex: 1;
    min-width: 0;

    svg {
      position: absolute;
      top: 50%;
      left: 14px;
      color: var(--ae-text-muted);
      pointer-events: none;
      transform: translateY(-50%);
    }

    input {
      @include ae-field;

      height: 44px;
      padding-left: 44px;
    }
  }

  .ae-picker-count {
    flex-shrink: 0;
    padding: 6px 12px;
    font-size: 14px;
    font-weight: 700;
    color: var(--ae-orange-ink);
    background: var(--ae-orange-wash);
    border-radius: 999px;
  }

  .ae-picker-people {
    padding: 2px;
    overflow-y: auto;
  }

  .ae-picker-list .ae-picker-people {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 8px;
    min-height: 120px;
  }

  .ae-picker-grid .ae-picker-people {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px 12px;
    max-height: 132px;
  }

  .ae-picker-person {
    display: flex;
    gap: 12px;
    align-items: center;
    min-height: 56px;
    padding: 8px 12px;
    cursor: pointer;
    background: var(--ae-surface);
    border: 1.5px solid var(--ae-line);
    border-radius: var(--ae-radius-sm);
    transition:
      border-color 150ms ease,
      background-color 150ms ease;

    &:hover {
      border-color: var(--ae-field-line);
    }

    input {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      margin: 0;
      accent-color: var(--ae-orange);
      cursor: pointer;
    }

    &:focus-within {
      box-shadow: var(--ae-focus-ring);
    }

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  }

  .ae-picker-person-checked,
  .ae-picker-person-checked:hover {
    background: var(--ae-orange-wash);
    border-color: var(--ae-orange);
  }

  .ae-picker-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .ae-picker-name,
  .ae-picker-meta {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ae-picker-name {
    font-size: 16px;
    font-weight: 700;
    color: var(--ae-navy);
  }

  .ae-picker-meta {
    font-size: 14px;
    color: var(--ae-text-muted);
  }

  .ae-picker-empty {
    margin: 4px 0 8px;
    font-size: 15px;
    color: var(--ae-text-muted);
  }

  @media (max-height: 959px) {
    .ae-picker-grid .ae-picker-people {
      max-height: 116px;
    }

    .ae-picker-person {
      min-height: 50px;
      padding-block: 6px;
    }
  }

  @media (max-height: 799px) {
    .ae-picker-list .ae-picker-people {
      min-height: 96px;
    }
  }

  @media (max-height: 699px) {
    .ae-picker-grid .ae-picker-people {
      max-height: 100px;
    }

    .ae-picker-person {
      min-height: 44px;
      padding-block: 4px;
    }

    .ae-picker-search-row {
      margin-bottom: 8px;
    }

    .ae-picker-search input {
      height: 40px;
    }

    .ae-picker-list .ae-picker-people {
      min-height: 88px;
    }
  }

  @media (max-width: 719px) {
    .ae-picker-grid .ae-picker-people {
      grid-template-columns: minmax(0, 1fr);
    }
  }

</style>
