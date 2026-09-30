<template>

  <div
    class="ae-media"
    :class="`ae-media-kind-${kind}`"
  >
    <video
      v-if="kind === 'video'"
      :key="src"
      class="ae-media-visual"
      :src="src"
      controls
      preload="metadata"
    >
      {{ mediaNotSupported$() }}
    </video>
    <div
      v-else-if="kind === 'audio'"
      class="ae-media-panel"
    >
      <AeIcon
        name="headphones"
        :size="72"
      />
      <audio
        :key="src"
        :src="src"
        controls
        preload="metadata"
      >
        {{ mediaNotSupported$() }}
      </audio>
    </div>
    <img
      v-else-if="kind === 'image'"
      class="ae-media-visual ae-media-image"
      :src="src"
      :alt="resource.title"
    >
    <iframe
      v-else-if="kind === 'pdf'"
      class="ae-media-frame"
      :src="src"
      :title="resource.title"
    ></iframe>
    <template v-else-if="kind === 'youtube'">
      <iframe
        class="ae-media-frame ae-media-youtube"
        :src="youtubeSrc"
        :title="resource.title"
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin"
      ></iframe>
      <p class="ae-media-note">
        {{ youtubeNeedsInternet$() }}
      </p>
    </template>
    <div
      v-else
      class="ae-media-panel"
    >
      <AeIcon
        :name="kind === 'link' ? 'globe' : 'download'"
        :size="56"
      />
      <p>{{ kind === 'link' ? resource.url : downloadToOpen$() }}</p>
    </div>
  </div>

</template>


<script>

  import { computed } from 'vue';
  import { portalStrings } from '../strings';
  import { previewKind, youtubeEmbedUrl } from '../composables/resourceMedia';
  import AeIcon from './AeIcon';

  /**
   * A course support itself: video or audio player, image, PDF, YouTube player,
   * or what to do for links and files browsers cannot show.
   * It fills the height its parent gives it.
   */
  export default {
    name: 'AeResourceMedia',
    components: { AeIcon },
    setup(props) {
      const { mediaNotSupported$, youtubeNeedsInternet$, downloadToOpen$ } = portalStrings;
      const kind = computed(() => previewKind(props.resource));
      const youtubeSrc = computed(() => youtubeEmbedUrl(props.resource.url));
      return { mediaNotSupported$, youtubeNeedsInternet$, downloadToOpen$, kind, youtubeSrc };
    },
    props: {
      resource: {
        type: Object,
        required: true,
      },
      /** Address to show the file in the page. */
      src: {
        type: String,
        default: '',
      },
    },
  };

</script>


<style lang="scss" scoped>

  .ae-media {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: 0;
  }

  .ae-media-visual {
    max-width: 100%;
    max-height: 100%;
    background: #000000;
    border-radius: var(--ae-radius-sm);
  }

  .ae-media-image {
    background: #ffffff;
  }

  // A frame has no size of its own: it takes the room given.
  .ae-media-frame {
    flex: 1 1 auto;
    width: 100%;
    min-height: 0;
    background: #ffffff;
    border: 0;
    border-radius: var(--ae-radius-sm);
  }

  .ae-media-panel {
    display: flex;
    flex-direction: column;
    gap: 18px;
    align-items: center;
    padding: 28px 16px;
    color: var(--ae-orange);

    audio {
      width: 520px;
      max-width: 100%;
    }

    p {
      max-width: 36em;
      margin: 0;
      color: var(--ae-text-muted);
      text-align: center;
      word-break: break-word;
    }
  }

  .ae-media-note {
    flex-shrink: 0;
    margin: 10px 0 0;
    font-size: 14px;
    color: var(--ae-text-muted);
  }

</style>
