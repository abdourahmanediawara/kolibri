<template>
  <a
    class="content-card"
    :href="href"
    :style="{
      backgroundColor: $themeTokens.surface,
      borderColor: $themeTokens.fineLine,
      color: $themeTokens.text,
    }"
  >
    <div
      class="thumb"
      :style="{ backgroundColor: $themeTokens.annotation }"
    >
      <img
        v-if="thumbnail"
        :src="thumbnail"
        :alt="title"
        class="thumb-img"
      />
      <KIcon
        v-else
        :icon="icon"
        class="thumb-icon"
        :style="{ fill: $themeTokens.surface }"
      />
    </div>
    <div class="body">
      <p class="title">
        {{ title }}
      </p>
      <p
        v-if="meta"
        class="meta"
        :style="{ color: $themeTokens.annotation }"
      >
        {{ meta }}
      </p>
      <p
        v-if="progressLabel"
        class="progress"
        :style="{ color: $themeTokens.primary }"
      >
        {{ progressLabel }}
      </p>
    </div>
  </a>
</template>

<script>
  export default {
    name: 'ContentCard',
    props: {
      title: {
        type: String,
        required: true,
      },
      href: {
        type: String,
        required: true,
      },
      icon: {
        type: String,
        default: 'library',
      },
      thumbnail: {
        type: String,
        default: '',
      },
      meta: {
        type: String,
        default: '',
      },
      progressLabel: {
        type: String,
        default: '',
      },
    },
    setup() {
      return {};
    },
  };
</script>

<style lang="scss" scoped>
  .content-card {
    display: flex;
    gap: 12px;
    min-height: 88px;
    padding: 12px;
    text-decoration: none;
    border: 1px solid;
    border-radius: 8px;
  }

  .content-card:focus {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  .thumb {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    overflow: hidden;
    border-radius: 6px;
  }

  .thumb-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .thumb-icon {
    width: 32px;
    height: 32px;
  }

  .title {
    margin: 0 0 4px;
    font-size: 1.05rem;
    font-weight: 600;
  }

  .meta,
  .progress {
    margin: 0;
    font-size: 0.9rem;
  }
</style>
