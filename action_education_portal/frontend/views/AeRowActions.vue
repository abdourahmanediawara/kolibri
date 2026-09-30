<template>

  <div
    ref="root"
    class="ae-row-actions"
  >
    <a
      v-if="primaryHref"
      :href="primaryHref"
      class="ae-row-actions-primary"
      :aria-label="primaryAriaLabel || null"
      :target="primaryTarget || null"
      :rel="primaryTarget ? 'noopener noreferrer' : null"
    >{{ primaryLabel }}</a>
    <button
      v-else
      type="button"
      class="ae-row-actions-primary"
      :aria-label="primaryAriaLabel || null"
      @click="$emit('primary')"
    >
      {{ primaryLabel }}
    </button>
    <div
      v-if="menuItems.length"
      class="ae-row-actions-more"
    >
      <button
        ref="button"
        type="button"
        class="ae-row-actions-more-btn"
        aria-haspopup="menu"
        :aria-expanded="open ? 'true' : 'false'"
        :aria-label="moreLabel"
        @click="open = !open"
      >
        <AeIcon
          name="ellipsis"
          :size="20"
        />
      </button>
      <ul
        v-show="open"
        class="ae-row-actions-menu"
        :class="{ 'ae-row-actions-menu-up': openUp }"
        role="menu"
      >
        <li
          v-for="item in menuItems"
          :key="item.label"
          role="none"
        >
          <a
            v-if="item.href"
            role="menuitem"
            class="ae-row-actions-item"
            :href="item.href"
          >{{ item.label }}</a>
          <button
            v-else
            type="button"
            role="menuitem"
            class="ae-row-actions-item"
            :class="{ 'ae-row-actions-item-danger': item.danger }"
            @click="select(item)"
          >
            {{ item.label }}
          </button>
        </li>
      </ul>
    </div>
  </div>

</template>


<script>

  import AeIcon from './AeIcon';

  /** "Voir…" button plus an optional "…" menu, for one row of an AE list. */
  export default {
    name: 'AeRowActions',
    components: { AeIcon },
    props: {
      primaryLabel: {
        type: String,
        required: true,
      },
      /** Longer accessible name, e.g. "Voir le profil de Fatou Diawara". */
      primaryAriaLabel: {
        type: String,
        default: '',
      },
      /** Link of the main button; without it, the button emits `primary`. */
      primaryHref: {
        type: String,
        default: '',
      },
      /** E.g. "_blank" to open the primary link in a new tab. */
      primaryTarget: {
        type: String,
        default: '',
      },
      moreLabel: {
        type: String,
        default: '',
      },
      /** [{ label, href }] for links, [{ label, onClick, danger? }] for actions. */
      menuItems: {
        type: Array,
        default: () => [],
      },
      /** Open the menu above the button (last rows of a list). */
      openUp: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return { open: false };
    },
    mounted() {
      document.addEventListener('click', this.onDocumentClick);
      document.addEventListener('keydown', this.onKeydown);
    },
    beforeDestroy() {
      document.removeEventListener('click', this.onDocumentClick);
      document.removeEventListener('keydown', this.onKeydown);
    },
    methods: {
      select(item) {
        this.open = false;
        item.onClick();
      },
      onDocumentClick(event) {
        if (this.open && !this.$refs.root.contains(event.target)) {
          this.open = false;
        }
      },
      onKeydown(event) {
        if (this.open && event.key === 'Escape') {
          this.open = false;
          this.$refs.button.focus();
        }
      },
    },
  };

</script>


<style lang="scss" scoped>

  // Lives inside AeSpaceLayout, which defines the --ae-* tokens.
  .ae-row-actions {
    display: inline-flex;
    gap: 12px;
    align-items: center;
  }

  .ae-row-actions-primary {
    display: inline-flex;
    align-items: center;
    height: 34px;
    padding: 0 16px;
    font: inherit;
    font-size: 14px;
    font-weight: 700;
    color: var(--ae-orange-ink);
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
    background: var(--ae-surface);
    border: 1.5px solid var(--ae-orange);
    border-radius: var(--ae-radius-sm);

    &:hover {
      background: var(--ae-orange-wash);
    }
  }

  .ae-row-actions-more {
    position: relative;
  }

  .ae-row-actions-more-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 34px;
    color: var(--ae-navy);
    cursor: pointer;
    background: var(--ae-surface);
    border: 1.5px solid var(--ae-field-line);
    border-radius: var(--ae-radius-sm);

    &:hover {
      background: var(--ae-surface-muted);
    }
  }

  .ae-row-actions-menu {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    z-index: 5;
    min-width: 230px;
    padding: 6px;
    margin: 0;
    list-style: none;
    background: var(--ae-surface);
    border: 1px solid var(--ae-line);
    border-radius: var(--ae-radius-md);
    box-shadow: var(--ae-shadow-raised);
  }

  .ae-row-actions-menu-up {
    top: auto;
    bottom: calc(100% + 6px);
  }

  .ae-row-actions-item {
    display: flex;
    align-items: center;
    width: 100%;
    min-height: 40px;
    padding: 0 12px;
    font: inherit;
    font-size: 15px;
    font-weight: 600;
    color: var(--ae-navy);
    text-align: start;
    text-decoration: none;
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: var(--ae-radius-sm);

    &:hover {
      background: var(--ae-surface-muted);
    }
  }

  .ae-row-actions-item-danger {
    color: var(--ae-danger);
  }

  .ae-row-actions-primary,
  .ae-row-actions-more-btn,
  .ae-row-actions-item {
    &:focus-visible {
      outline: none;
      box-shadow: var(--ae-focus-ring);
    }
  }

</style>
