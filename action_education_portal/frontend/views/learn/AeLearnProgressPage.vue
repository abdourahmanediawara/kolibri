<template>
  <div
    class="ae-page"
    :style="{ color: $themeTokens.text }"
  >
    <h1 class="title">
      {{ progressTitle$() }}
    </h1>
    <p
      class="intro"
      :style="{ color: $themeTokens.annotation }"
    >
      {{ progressIntro$() }}
    </p>

    <KCircularLoader
      v-if="loading"
      :delay="false"
    />

    <p
      v-else-if="!items.length"
      :style="{ color: $themeTokens.annotation }"
    >
      {{ progressEmpty$() }}
    </p>

    <div
      v-else
      class="cards"
    >
      <ContentCard
        v-for="item in items"
        :key="item.id"
        :title="item.title"
        :href="item.href"
        icon="inProgress"
        :thumbnail="item.thumbnail"
        :meta="item.meta"
        :progressLabel="item.progressLabel"
      />
    </div>
  </div>
</template>

<script>
  import { onMounted, ref } from 'vue';
  import client from 'kolibri/client';
  import urls from 'kolibri/urls';
  import { portalStrings } from '../../strings';
  import { useLearnContent } from '../../composables/useLearnContent';
  import ContentCard from '../ContentCard';

  export default {
    name: 'AeLearnProgressPage',
    components: {
      ContentCard,
    },
    setup() {
      const {
        progressTitle$,
        progressIntro$,
        progressEmpty$,
        progressPercent$,
        continueAction$,
      } = portalStrings;
      const { contentHref, progressFraction } = useLearnContent();

      const loading = ref(true);
      const items = ref([]);

      onMounted(() => {
        client({ url: urls['kolibri:kolibri.plugins.learn:homehydrate']() })
          .then(response => {
            const payload = response.data || {};
            const resources = payload.resumable_resources || {};
            const nodes = resources.results || [];
            const progressList = payload.resumable_resources_progress || [];
            if (!nodes.length) {
              items.value = [];
              return;
            }
            items.value = nodes.map(node => {
              const progressEntry = progressList.find(
                item =>
                  item.content_id === node.content_id ||
                  item.contentnode_id === node.id ||
                  item.id === node.id,
              );
              const fraction = progressFraction(progressEntry);
              return {
                id: node.id,
                title: node.title,
                href: contentHref(node.id),
                thumbnail: node.thumbnail || node.thumbnail_url || '',
                meta: continueAction$(),
                progressLabel:
                  typeof fraction === 'number'
                    ? progressPercent$({ percent: Math.round(fraction * 100) })
                    : '',
              };
            });
          })
          .finally(() => {
            loading.value = false;
          });
      });

      return {
        progressTitle$,
        progressIntro$,
        progressEmpty$,
        loading,
        items,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .ae-page {
    max-width: 960px;
    margin: 0 auto;
  }

  .title {
    margin: 0 0 8px;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .intro {
    margin: 0 0 16px;
  }

  .cards {
    display: grid;
    gap: 12px;
  }
</style>
