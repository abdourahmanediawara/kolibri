<template>
  <li
    class="ae-file-row"
    :style="{
      backgroundColor: $themeTokens.surface,
      borderColor: $themeTokens.fineLine,
    }"
  >
    <div class="ae-file-row__main">
      <p class="ae-file-row__title">
        {{ resource.title }}
      </p>
      <p
        v-if="showMeta"
        class="ae-file-row__meta"
        :style="{ color: $themeTokens.annotation }"
      >
        {{ resource.original_filename }}
        <span v-if="resource.size_bytes">
          · {{ formattedSize }}
        </span>
      </p>
      <div
        class="ae-file-row__dots"
        aria-hidden="true"
        :style="{ borderBottomColor: $themeTokens.fineLine }"
      />
    </div>
    <a
      class="ae-file-row__download"
      :href="downloadUrl"
      :aria-label="downloadLabel"
      :title="downloadLabel"
    >
      <AeFileTypeBadge
        :filename="resource.original_filename"
        :kind="resource.kind"
      />
    </a>
    <KButton
      v-if="canDelete"
      class="ae-file-row__delete"
      :text="deleteLabel"
      appearance="flat-button"
      :disabled="deleting"
      @click="$emit('delete', resource)"
    />
  </li>
</template>

<script>
  import { computed } from 'vue';
  import AeFileTypeBadge from './AeFileTypeBadge';

  export default {
    name: 'AeResourceFileRow',
    components: { AeFileTypeBadge },
    props: {
      resource: {
        type: Object,
        required: true,
      },
      downloadUrl: {
        type: String,
        required: true,
      },
      downloadLabel: {
        type: String,
        required: true,
      },
      canDelete: {
        type: Boolean,
        default: false,
      },
      deleteLabel: {
        type: String,
        default: '',
      },
      deleting: {
        type: Boolean,
        default: false,
      },
      showMeta: {
        type: Boolean,
        default: true,
      },
    },
    setup(props) {
      const formattedSize = computed(() => {
        const bytes = props.resource && props.resource.size_bytes;
        if (!bytes || bytes < 1024) {
          return `${bytes || 0} o`;
        }
        if (bytes < 1024 * 1024) {
          return `${Math.round(bytes / 1024)} Ko`;
        }
        return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
      });
      return { formattedSize };
    },
  };
</script>

<style lang="scss" scoped>
  .ae-file-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    margin-bottom: 12px;
    padding: 14px 16px;
    border: 1px solid;
    border-radius: 8px;
  }

  .ae-file-row__main {
    display: flex;
    flex: 1 1 200px;
    flex-wrap: wrap;
    gap: 4px 12px;
    align-items: baseline;
    min-width: 0;
  }

  .ae-file-row__title {
    flex-shrink: 0;
    max-width: 100%;
    margin: 0;
    font-size: 1.05rem;
    font-weight: 600;
  }

  .ae-file-row__meta {
    flex-basis: 100%;
    margin: 0;
    font-size: 0.875rem;
  }

  .ae-file-row__dots {
    flex: 1 1 40px;
    min-width: 24px;
    margin: 0 4px;
    border-bottom: 1px dotted;
  }

  .ae-file-row__download {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    min-width: 48px;
    min-height: 52px;
    text-decoration: none;
  }

  .ae-file-row__delete {
    flex-shrink: 0;
  }
</style>
