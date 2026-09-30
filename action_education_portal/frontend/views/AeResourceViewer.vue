<template>

  <transition name="ae-viewer">
    <div
      v-if="resource"
      class="ae-viewer-root"
      @keydown.esc="$emit('close')"
    >
      <div
        class="ae-viewer-backdrop"
        aria-hidden="true"
        @click="$emit('close')"
      ></div>
      <section
        class="ae-viewer"
        :class="`ae-viewer-kind-${kind}`"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ae-viewer-title"
      >
        <header class="ae-viewer-head">
          <span
            class="ae-viewer-icon"
            aria-hidden="true"
          >
            <AeIcon
              :name="icon"
              :size="22"
            />
          </span>
          <div class="ae-viewer-head-text">
            <h2
              id="ae-viewer-title"
              class="ae-viewer-title"
            >
              {{ resource.title }}
            </h2>
            <p class="ae-viewer-kind">
              {{ kindLabel }}
            </p>
          </div>
          <button
            ref="closeButton"
            type="button"
            class="ae-viewer-close"
            :aria-label="closeAction$()"
            @click="$emit('close')"
          >
            <AeIcon
              name="x"
              :size="24"
            />
          </button>
        </header>

        <div class="ae-viewer-body">
          <AeResourceMedia
            :resource="resource"
            :src="src"
          />
        </div>

        <footer class="ae-viewer-foot">
          <a
            v-if="kind === 'link' || kind === 'youtube'"
            class="ae-viewer-action"
            :href="resource.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AeIcon
              name="externalLink"
              :size="20"
            />
            <span>{{ kind === 'youtube' ? openOnYoutube$() : openLinkAction$() }}</span>
          </a>
          <a
            v-else
            class="ae-viewer-action"
            :href="downloadHref"
            download
          >
            <AeIcon
              name="download"
              :size="20"
            />
            <span>{{ downloadResourceAction$() }}</span>
          </a>
        </footer>
      </section>
    </div>
  </transition>

</template>


<script>

  import { computed, nextTick, ref, watch } from 'vue';
  import { coreStrings } from 'kolibri/uiText/commonCoreStrings';
  import { portalStrings } from '../strings';
  import { previewIcon, previewKind } from '../composables/resourceMedia';
  import AeIcon from './AeIcon';
  import AeResourceMedia from './AeResourceMedia';

  /** Shows a course support over the page: player, image, PDF, YouTube video or link. */
  export default {
    name: 'AeResourceViewer',
    components: { AeIcon, AeResourceMedia },
    setup(props) {
      const {
        openOnYoutube$,
        openLinkAction$,
        downloadResourceAction$,
        kindVideo$,
        kindAudio$,
        kindImage$,
        kindPdf$,
        kindYoutube$,
        kindLink$,
        kindFile$,
      } = portalStrings;
      const { closeAction$ } = coreStrings;

      const KIND_LABELS = {
        video: kindVideo$,
        audio: kindAudio$,
        image: kindImage$,
        pdf: kindPdf$,
        youtube: kindYoutube$,
        link: kindLink$,
        download: kindFile$,
      };

      const kind = computed(() => (props.resource ? previewKind(props.resource) : 'download'));
      const icon = computed(() => previewIcon(kind.value));
      const kindLabel = computed(() => KIND_LABELS[kind.value]());

      // Focus goes to the close button, then back where it was.
      const closeButton = ref(null);
      let returnFocusTo = null;
      watch(
        () => props.resource,
        (resource, previous) => {
          if (resource && !previous) {
            returnFocusTo = document.activeElement;
            nextTick(() => closeButton.value && closeButton.value.focus());
          } else if (!resource && returnFocusTo && returnFocusTo.focus) {
            returnFocusTo.focus();
          }
        },
      );

      return {
        closeAction$,
        openOnYoutube$,
        openLinkAction$,
        downloadResourceAction$,
        kind,
        icon,
        kindLabel,
        closeButton,
      };
    },
    props: {
      /** The support to show, or null when closed. */
      resource: {
        type: Object,
        default: null,
      },
      /** Address to show the file in the page. */
      src: {
        type: String,
        default: '',
      },
      downloadHref: {
        type: String,
        default: '',
      },
    },
  };

</script>


<style lang="scss" scoped>

  @import '../styles/components';

  .ae-viewer-root {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 40;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }

  .ae-viewer-backdrop {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(20, 18, 40, 0.72);
  }

  .ae-viewer {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 1000px;
    max-width: 100%;
    max-height: 100%;
    overflow: hidden;
    background: var(--ae-surface);
    border-radius: var(--ae-radius-lg);
    box-shadow: 0 24px 60px -20px rgba(0, 0, 0, 0.5);
  }

  // Nothing to watch: a smaller window.
  .ae-viewer-kind-audio,
  .ae-viewer-kind-link,
  .ae-viewer-kind-download {
    width: 640px;
  }

  .ae-viewer-head {
    display: flex;
    flex-shrink: 0;
    gap: 14px;
    align-items: center;
    padding: 14px 16px 14px 22px;
    border-bottom: 1px solid var(--ae-line);
  }

  .ae-viewer-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    color: var(--ae-orange);
    background: var(--ae-orange-soft);
    border-radius: 50%;
  }

  .ae-viewer-head-text {
    flex: 1;
    min-width: 0;
  }

  .ae-viewer-title {
    margin: 0;
    overflow: hidden;
    font-size: 19px;
    font-weight: 800;
    color: var(--ae-navy);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ae-viewer-kind {
    margin: 0;
    font-size: 14px;
    color: var(--ae-text-muted);
  }

  .ae-viewer-close {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
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

  .ae-viewer-body {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
    padding: 16px;
    overflow: auto;
    background: #f6f3ef;
  }

  // Things to watch get a player-sized window.
  .ae-viewer-kind-video,
  .ae-viewer-kind-image,
  .ae-viewer-kind-pdf,
  .ae-viewer-kind-youtube {
    .ae-viewer-body {
      height: calc(100vh - 170px);
      max-height: 760px;
    }
  }

  .ae-viewer-foot {
    display: flex;
    flex-shrink: 0;
    justify-content: flex-end;
    padding: 12px 18px;
    border-top: 1px solid var(--ae-line);
  }

  .ae-viewer-action {
    @include ae-button-outline;
  }

  .ae-viewer-enter-active,
  .ae-viewer-leave-active {
    transition: opacity 180ms ease;
  }

  .ae-viewer-enter,
  .ae-viewer-leave-to {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .ae-viewer-enter-active,
    .ae-viewer-leave-active {
      transition: none;
    }
  }

</style>
