<template>

  <transition name="ae-side-panel">
    <div
      v-if="open"
      class="ae-side-panel-root"
      @keydown.esc="$emit('close')"
    >
      <div
        class="ae-side-panel-backdrop"
        aria-hidden="true"
        @click="$emit('close')"
      ></div>

      <section
        ref="dialog"
        class="ae-side-panel"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
      >
        <header class="ae-side-panel-head">
          <span
            class="ae-side-panel-head-icon"
            aria-hidden="true"
          >
            <AeIcon
              :name="icon"
              :size="34"
            />
          </span>
          <div class="ae-side-panel-head-text">
            <h2
              :id="titleId"
              class="ae-side-panel-title"
            >
              {{ title }}
            </h2>
            <p class="ae-side-panel-subtitle">
              {{ subtitle }}
            </p>
          </div>
          <button
            type="button"
            class="ae-side-panel-close"
            :aria-label="closeAction$()"
            @click="$emit('close')"
          >
            <AeIcon
              name="x"
              :size="26"
            />
          </button>
        </header>

        <div class="ae-side-panel-body">
          <slot></slot>
        </div>

        <footer class="ae-side-panel-foot">
          <slot name="footer"></slot>
        </footer>
      </section>
    </div>
  </transition>

</template>


<script>

  import { coreStrings } from 'kolibri/uiText/commonCoreStrings';
  import AeIcon from './AeIcon';

  /**
   * Right-hand side panel (drawer) for AE forms: header, scrollable body, footer buttons.
   * Content can use the helper classes ae-side-panel-section / -row (-row-3) / -field / -error.
   */
  export default {
    name: 'AeSidePanel',
    components: { AeIcon },
    setup() {
      const { closeAction$ } = coreStrings;
      return { closeAction$ };
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
      subtitle: {
        type: String,
        default: '',
      },
      /** AeIcon name shown in the header circle. */
      icon: {
        type: String,
        required: true,
      },
      /** Unique id for the title, used by aria-labelledby. */
      titleId: {
        type: String,
        required: true,
      },
    },
    data() {
      return { returnFocusTo: null };
    },
    watch: {
      open(isOpen) {
        if (isOpen) {
          this.returnFocusTo = document.activeElement;
        } else if (this.returnFocusTo && this.returnFocusTo.focus) {
          this.returnFocusTo.focus();
        }
      },
    },
  };

</script>


<style lang="scss" scoped>

  @import '../styles/components';

  .ae-side-panel-root {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 30;
  }

  .ae-side-panel-backdrop {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(31, 29, 61, 0.45);
  }

  .ae-side-panel {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    width: 784px;
    max-width: 100%;
    background: var(--ae-surface);
    box-shadow: -24px 0 48px -16px rgba(31, 29, 61, 0.25);
  }

  /* ---------- Head ---------- */

  .ae-side-panel-head {
    display: flex;
    flex-shrink: 0;
    gap: 22px;
    align-items: center;
    padding: 20px 28px 16px 40px;
    background: linear-gradient(90deg, #fdf3ec 0%, #ffffff 70%);
  }

  .ae-side-panel-head-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    color: var(--ae-orange);
    background: var(--ae-orange-soft);
    border-radius: 50%;
  }

  .ae-side-panel-head-text {
    flex: 1;
    min-width: 0;
  }

  .ae-side-panel-title {
    margin: 0;
    font-size: 32px;
    font-weight: 800;
    line-height: 1.15;
    color: var(--ae-navy);
    letter-spacing: -0.01em;
  }

  .ae-side-panel-subtitle {
    margin: 4px 0 0;
    font-size: 17px;
    color: var(--ae-text-muted);
  }

  .ae-side-panel-close {
    display: inline-flex;
    align-items: center;
    align-self: flex-start;
    justify-content: center;
    width: 44px;
    height: 44px;
    color: var(--ae-navy);
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: var(--ae-radius-sm);

    &:hover {
      background: var(--ae-surface-muted);
    }

    @include ae-focus-ring;
  }

  /* ---------- Body and its helper classes (slot content) ---------- */

  .ae-side-panel-body {
    flex: 1 1 auto;
    min-height: 0;
    padding: 8px 32px 20px 36px;
    // Last resort on short screens; the footer buttons always stay visible.
    overflow-y: auto;

    /deep/ .ae-side-panel-section {
      display: flex;
      gap: 12px;
      align-items: center;
      margin: 20px 0 12px -8px;
      font-size: 22px;
      font-weight: 800;
      color: var(--ae-navy);

      &::after {
        flex: 1;
        height: 1px;
        margin-inline-start: 8px;
        content: '';
        background: var(--ae-line);
      }
    }

    /deep/ .ae-side-panel-section-icon {
      display: inline-flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 46px;
      height: 46px;
      background: var(--ae-orange-soft);
      border-radius: 50%;

      svg {
        width: 24px;
        height: 24px;
      }
    }

    // Forms without a section heading still start clear of the header.
    /deep/ form > .ae-side-panel-field:first-child,
    /deep/ form > .ae-side-panel-row:first-child {
      margin-top: 16px;
    }

    /deep/ .ae-side-panel-row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0 24px;
    }

    /deep/ .ae-side-panel-row-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0 20px;
    }

    /deep/ .ae-side-panel-field {
      display: flex;
      flex-direction: column;
      margin-bottom: 14px;

      label {
        margin-bottom: 8px;
        font-size: 16px;
        font-weight: 700;
        color: var(--ae-navy);
      }

      input:not([type='checkbox']),
      select {
        @include ae-field;
      }

      [aria-invalid='true'] {
        border-color: var(--ae-danger);
      }
    }

    // Wrapper giving a field a trailing icon (select chevron) or button (show password).
    /deep/ .ae-side-panel-affix {
      position: relative;
      display: block;

      > svg {
        position: absolute;
        top: 50%;
        right: 14px;
        color: var(--ae-navy);
        pointer-events: none;
        transform: translateY(-50%);
      }

      input {
        padding-right: 52px;
      }

      select {
        padding-right: 44px;
        appearance: none;
        cursor: pointer;
      }

      button {
        position: absolute;
        top: 50%;
        right: 6px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        color: var(--ae-text-muted);
        cursor: pointer;
        background: transparent;
        border: 0;
        border-radius: var(--ae-radius-sm);
        transform: translateY(-50%);

        &:hover {
          color: var(--ae-navy);
          background: var(--ae-surface-muted);
        }

        @include ae-focus-ring;
      }
    }

    /deep/ .ae-side-panel-error {
      margin: 6px 0 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--ae-danger);
    }

    /deep/ .ae-side-panel-form-error {
      padding: 12px 14px;
      margin: 8px 0 0;
      font-size: 15px;
      font-weight: 600;
      color: var(--ae-danger);
      background: var(--ae-danger-soft);
      border-radius: var(--ae-radius-md);
    }
  }

  /* ---------- Footer and its buttons (slot content) ---------- */

  .ae-side-panel-foot {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: 14px;
    padding: 14px 32px 20px 36px;
    border-top: 1px solid var(--ae-line);

    /deep/ .ae-side-panel-foot-row {
      display: flex;
      gap: 16px;
      justify-content: space-between;
    }

    /deep/ .ae-side-panel-btn-outline {
      @include ae-button-outline;

      width: 100%;
      font-size: 17px;
    }

    /deep/ .ae-side-panel-btn-neutral {
      @include ae-button-outline;

      min-width: 130px;
      color: var(--ae-navy);
      border-color: var(--ae-field-line);

      &:hover {
        background: var(--ae-surface-muted);
      }
    }

    /deep/ .ae-side-panel-btn-primary {
      @include ae-button-primary;
    }
  }

  /* ---------- Motion ---------- */

  .ae-side-panel-enter-active,
  .ae-side-panel-leave-active {
    transition: opacity 220ms ease;

    .ae-side-panel {
      transition: transform 220ms ease;
    }
  }

  .ae-side-panel-enter,
  .ae-side-panel-leave-to {
    opacity: 0;

    .ae-side-panel {
      transform: translateX(40px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ae-side-panel-enter-active,
    .ae-side-panel-leave-active,
    .ae-side-panel-enter-active .ae-side-panel,
    .ae-side-panel-leave-active .ae-side-panel {
      transition: none;
    }
  }

  /* ---------- Shorter and narrower screens ---------- */

  @media (max-height: 959px) {
    .ae-side-panel-head {
      padding-block: 14px 10px;
    }

    .ae-side-panel-head-icon {
      width: 60px;
      height: 60px;
    }

    .ae-side-panel-title {
      font-size: 28px;
    }

    .ae-side-panel-body {
      /deep/ .ae-side-panel-section {
        margin: 14px 0 8px -8px;
        font-size: 20px;
      }

      /deep/ .ae-side-panel-section-icon {
        width: 40px;
        height: 40px;
      }

      /deep/ .ae-side-panel-field {
        margin-bottom: 10px;

        label {
          margin-bottom: 6px;
        }

        input:not([type='checkbox']),
        select {
          height: 44px;
        }
      }
    }

    .ae-side-panel-foot {
      gap: 10px;
      padding-block: 10px 14px;

      /deep/ .ae-side-panel-btn-primary,
      /deep/ .ae-side-panel-btn-outline,
      /deep/ .ae-side-panel-btn-neutral {
        min-height: 44px;
      }
    }
  }

  // Laptop screens (1366×768 minus the browser bars): everything still fits.
  @media (max-height: 699px) {
    .ae-side-panel-head {
      gap: 16px;
      padding-block: 10px 8px;
    }

    .ae-side-panel-head-icon {
      width: 48px;
      height: 48px;

      svg {
        width: 26px;
        height: 26px;
      }
    }

    .ae-side-panel-title {
      font-size: 24px;
    }

    .ae-side-panel-subtitle {
      margin-top: 2px;
      font-size: 15px;
    }

    .ae-side-panel-body {
      padding-block: 2px 10px;

      /deep/ .ae-side-panel-section {
        margin: 10px 0 6px -8px;
        font-size: 18px;
      }

      /deep/ .ae-side-panel-section-icon {
        width: 34px;
        height: 34px;

        svg {
          width: 20px;
          height: 20px;
        }
      }

      /deep/ .ae-side-panel-field {
        margin-bottom: 8px;

        label {
          margin-bottom: 4px;
          font-size: 15px;
        }

        input:not([type='checkbox']),
        select {
          height: 40px;
        }
      }
    }

    .ae-side-panel-foot {
      gap: 8px;
      padding-block: 8px 10px;

      /deep/ .ae-side-panel-btn-primary,
      /deep/ .ae-side-panel-btn-outline,
      /deep/ .ae-side-panel-btn-neutral {
        min-height: 40px;
      }
    }
  }

  @media (max-width: 719px) {
    .ae-side-panel-head {
      padding: 14px 12px 10px 20px;
    }

    .ae-side-panel-head-icon {
      display: none;
    }

    .ae-side-panel-title {
      font-size: 24px;
    }

    .ae-side-panel-body,
    .ae-side-panel-foot {
      padding-inline: 20px;
    }

    .ae-side-panel-body /deep/ .ae-side-panel-row {
      grid-template-columns: minmax(0, 1fr);
    }
  }

</style>
