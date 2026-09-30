<template>

  <div class="ae-page-header">
    <nav
      class="ae-page-header-crumbs"
      :aria-label="breadcrumbLabel$()"
    >
      <ol>
        <li
          v-for="crumb in trail"
          :key="crumb.label"
        >
          <router-link :to="crumb.to">
            {{ crumb.label }}
          </router-link>
        </li>
        <li aria-current="page">
          {{ title }}
        </li>
      </ol>
    </nav>

    <router-link
      v-if="back"
      :to="back.to"
      class="ae-page-header-back"
    >
      <AeIcon
        name="arrowLeft"
        :size="18"
      />
      <span>{{ back.label }}</span>
    </router-link>

    <header class="ae-page-header-main">
      <div class="ae-page-header-text">
        <div class="ae-page-header-title-row">
          <AeIcon
            v-if="icon"
            :name="icon"
            class="ae-page-header-icon"
            :size="34"
          />
          <h1 class="ae-page-header-title">
            {{ title }}
          </h1>
          <span
            v-if="countLabel"
            class="ae-page-header-pill"
          >{{ countLabel }}</span>
        </div>
        <p
          v-if="subtitle"
          class="ae-page-header-subtitle"
        >
          {{ subtitle }}
        </p>
        <p
          v-if="note"
          class="ae-page-header-note"
        >
          {{ note }}
        </p>
      </div>
      <div
        v-if="action || $slots.actions"
        class="ae-page-header-actions"
      >
        <!-- Secondary buttons, before the main one. -->
        <slot name="actions"></slot>
        <component
          :is="actionTag"
          v-if="action"
          v-bind="actionAttrs"
          class="ae-page-header-action"
          @click="action.onClick && action.onClick()"
        >
          <AeIcon
            :name="action.icon || 'plus'"
            :size="22"
          />
          <span>{{ action.label }}</span>
        </component>
      </div>
    </header>
  </div>

</template>


<script>

  import { computed, inject } from 'vue';
  import { portalStrings } from '../strings';
  import AeIcon from './AeIcon';

  /**
   * Breadcrumb, title (with an optional count pill), subtitle and main button of AE pages.
   * The breadcrumb starts at the space home, which each space layout provides as
   * `aeSpaceRoot` ({ label, to }).
   */
  export default {
    name: 'AePageHeader',
    components: { AeIcon },
    setup(props) {
      const { breadcrumbAdmin$, breadcrumbLabel$ } = portalStrings;
      const spaceRoot = inject('aeSpaceRoot', null);

      const trail = computed(() => [
        spaceRoot || { label: breadcrumbAdmin$(), to: { name: 'AeAdminHome' } },
        ...props.crumbs,
      ]);

      const actionTag = computed(() => {
        if (!props.action) {
          return null;
        }
        if (props.action.to) {
          return 'router-link';
        }
        return props.action.href ? 'a' : 'button';
      });

      const actionAttrs = computed(() => {
        if (!props.action) {
          return {};
        }
        if (props.action.to) {
          return { to: props.action.to };
        }
        return props.action.href ? { href: props.action.href } : { type: 'button' };
      });

      return { breadcrumbLabel$, trail, actionTag, actionAttrs };
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
      /** Levels between the space home and this page: [{ label, to }]. */
      crumbs: {
        type: Array,
        default: () => [],
      },
      /**
       * Main button: { label, to } (app page), { label, href } (other page) or
       * { label, onClick } (action), with an optional AeIcon `icon`; or null.
       */
      action: {
        type: Object,
        default: null,
      },
      /** Link back to the parent list: { label, to }. */
      back: {
        type: Object,
        default: null,
      },
      /** AeIcon name shown before the title. */
      icon: {
        type: String,
        default: '',
      },
    },
  };

</script>


<style lang="scss" scoped>

  // Lives inside AeSpaceLayout, which defines the --ae-* tokens.
  .ae-page-header {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .ae-page-header-back {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    align-self: flex-start;
    margin-top: -6px;
    font-size: 15px;
    font-weight: 600;
    color: var(--ae-orange-ink);

    &:hover {
      text-decoration: underline;
    }
  }

  .ae-page-header-icon {
    flex-shrink: 0;
    color: var(--ae-orange);
  }

  .ae-page-header-crumbs ol {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 0;
    margin: 0;
    font-size: 15px;
    color: var(--ae-text-muted);
    list-style: none;

    li + li::before {
      margin-inline-end: 8px;
      color: var(--ae-text-subtle);
      content: '/';
    }

    a {
      color: var(--ae-text-muted);
      text-decoration: none;
      border-radius: 4px;

      &:hover {
        color: var(--ae-navy);
        text-decoration: underline;
      }

      &:focus-visible {
        outline: none;
        box-shadow: var(--ae-focus-ring);
      }
    }

    [aria-current='page'] {
      font-weight: 700;
      color: var(--ae-orange-ink);
    }
  }

  .ae-page-header-main {
    display: flex;
    flex-wrap: wrap;
    gap: 16px 24px;
    align-items: flex-start;
    justify-content: space-between;
  }

  // The text takes the free width, so a long subtitle wraps next to the button.
  .ae-page-header-text {
    flex: 1 1 320px;
    min-width: 0;
  }

  .ae-page-header-title-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
    align-items: center;
  }

  .ae-page-header-title {
    margin: 0;
    font-size: 40px;
    font-weight: 800;
    line-height: 1.1;
    color: var(--ae-navy);
    letter-spacing: -0.02em;
  }

  .ae-page-header-pill {
    padding: 5px 14px;
    font-size: 14px;
    font-weight: 700;
    color: var(--ae-orange-deep);
    background: var(--ae-orange-wash);
    border-radius: 999px;
  }

  .ae-page-header-subtitle {
    margin: 4px 0 0;
    font-size: 17px;
    color: var(--ae-text-muted);
  }

  .ae-page-header-note {
    max-width: 48em;
    margin: 4px 0 0;
    font-size: 14px;
    color: var(--ae-text-subtle);
  }

  .ae-page-header-actions {
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  .ae-page-header-action {
    display: inline-flex;
    gap: 10px;
    align-items: center;
    min-height: 48px;
    padding: 0 24px;
    font: inherit;
    // 19px bold counts as large text: white on brand orange stays AA.
    font-size: 19px;
    font-weight: 800;
    color: #ffffff;
    text-decoration: none;
    cursor: pointer;
    background: var(--ae-orange);
    border: 0;
    border-radius: var(--ae-radius-md);
    box-shadow: 0 8px 20px -10px rgba(241, 90, 36, 0.7);
    transition:
      background-color 150ms ease,
      transform 150ms ease;

    &:hover {
      background: var(--ae-orange-hover);
    }

    &:active {
      transform: scale(0.98);
    }

    &:focus-visible {
      outline: none;
      box-shadow: var(--ae-focus-ring);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ae-page-header-action {
      transition: none;
    }
  }

  @media (min-width: 900px) and (max-height: 959px) {
    .ae-page-header {
      gap: 12px;
    }

    .ae-page-header-title {
      font-size: 34px;
    }
  }

  @media (min-width: 900px) and (max-height: 799px) {
    .ae-page-header {
      gap: 10px;
    }

    .ae-page-header-crumbs ol {
      font-size: 14px;
    }

    .ae-page-header-title {
      font-size: 28px;
    }

    .ae-page-header-subtitle {
      font-size: 15px;
    }

    .ae-page-header-action {
      min-height: 44px;
      padding: 0 18px;
    }
  }

  @media (max-width: 719px) {
    .ae-page-header-title {
      font-size: 30px;
    }

    .ae-page-header-actions,
    .ae-page-header-action {
      justify-content: center;
      width: 100%;
    }
  }

</style>
