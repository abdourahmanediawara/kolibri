<template>
  <div
    class="ae-page"
    :style="{ color: $themeTokens.text }"
  >
    <h1 class="title">
      {{ libraryTitle$() }}
    </h1>

    <KCircularLoader
      v-if="loading"
      :delay="false"
    />

    <p
      v-else-if="!items.length"
      :style="{ color: $themeTokens.annotation }"
    >
      {{ catalogEmpty$() }}
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
        icon="library"
        :thumbnail="item.thumbnail"
        :meta="item.meta"
      />
    </div>
  </div>
</template>

<script>
  import { onMounted, ref } from 'vue';
  import { portalStrings } from '../../strings';
  import { useLearnContent } from '../../composables/useLearnContent';
  import ContentCard from '../ContentCard';

  export default {
    name: 'AeCoachLibraryPage',
    components: {
      ContentCard,
    },
    setup() {
      const { libraryTitle$, catalogEmpty$, channelMeta$ } = portalStrings;
      const { fetchChannels, channelHref, topicHref } = useLearnContent();

      const loading = ref(true);
      const items = ref([]);

      onMounted(() => {
        fetchChannels()
          .then(channels =>
            (channels || []).map(channel => ({
              id: channel.id,
              title: channel.name || channel.title,
              href: channel.root ? topicHref(channel.root) : channelHref(channel.id),
              thumbnail: channel.thumbnail || channel.thumbnail_url || '',
              meta: channelMeta$({ count: channel.total_resource_count || 0 }),
            })),
          )
          .then(result => {
            items.value = result;
          })
          .finally(() => {
            loading.value = false;
          });
      });

      return {
        libraryTitle$,
        catalogEmpty$,
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
    margin: 0 0 16px;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .cards {
    display: grid;
    gap: 12px;
  }
</style>
