<template>
  <div
    class="ae-page"
    :style="{ color: $themeTokens.text }"
  >
    <h1 class="title">
      {{ libraryTitle$() }}
    </h1>

    <div
      class="filters"
      role="tablist"
      :aria-label="libraryTitle$()"
    >
      <KButton
        v-for="filter in filters"
        :key="filter.id"
        :text="filter.label"
        :primary="activeFilter === filter.id"
        appearance="flat-button"
        @click="setFilter(filter.id)"
      />
    </div>

    <KCircularLoader
      v-if="loading"
      :delay="false"
    />

    <p
      v-else-if="loadFailed"
      role="alert"
      :style="{ color: $themeTokens.error }"
    >
      {{ loadError$() }}
      <KButton
        :text="retryAction$()"
        appearance="flat-button"
        @click="loadItems(activeFilter)"
      />
    </p>

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
        :icon="item.icon"
        :thumbnail="item.thumbnail"
        :meta="item.meta"
      />
    </div>
  </div>
</template>

<script>
  import { computed, onMounted, ref } from 'vue';
  import { ContentNodeKinds } from 'kolibri/constants';
  import { portalStrings } from '../../strings';
  import { useLearnContent } from '../../composables/useLearnContent';
  import ContentCard from '../ContentCard';

  export default {
    name: 'AeLearnLibraryPage',
    components: {
      ContentCard,
    },
    setup() {
      const {
        libraryTitle$,
        filterAll$,
        typeVideo$,
        typeDocument$,
        typeAudio$,
        typeHtml5$,
        catalogEmpty$,
        loadError$,
        retryAction$,
      } = portalStrings;
      const {
        fetchNodesByKind,
        fetchChannels,
        contentHref,
        topicHref,
        channelHref,
      } = useLearnContent();

      const loading = ref(true);
      const loadFailed = ref(false);
      const items = ref([]);
      const activeFilter = ref('all');

      const filters = computed(() => [
        { id: 'all', label: filterAll$() },
        { id: ContentNodeKinds.VIDEO, label: typeVideo$() },
        { id: ContentNodeKinds.DOCUMENT, label: typeDocument$() },
        { id: ContentNodeKinds.AUDIO, label: typeAudio$() },
        { id: ContentNodeKinds.HTML5, label: typeHtml5$() },
      ]);

      function loadItems(kind) {
        loading.value = true;
        loadFailed.value = false;
        const request =
          kind === 'all'
            ? fetchChannels().then(channels =>
                (channels || []).map(channel => ({
                  id: channel.id,
                  title: channel.name || channel.title,
                  href: channel.root ? topicHref(channel.root) : channelHref(channel.id),
                  icon: 'library',
                  thumbnail: channel.thumbnail || channel.thumbnail_url || '',
                  meta: channel.description || '',
                })),
              )
            : fetchNodesByKind(kind, { maxResults: 50 }).then(nodes =>
                (nodes || []).map(node => ({
                  id: node.id,
                  title: node.title,
                  href: contentHref(node.id),
                  icon:
                    kind === ContentNodeKinds.VIDEO
                      ? 'video'
                      : kind === ContentNodeKinds.AUDIO
                        ? 'audio'
                        : 'document',
                  thumbnail: node.thumbnail || node.thumbnail_url || '',
                  meta: node.description || '',
                })),
              );

        return request
          .then(result => {
            items.value = result;
          })
          .catch(() => {
            loadFailed.value = true;
            items.value = [];
          })
          .finally(() => {
            loading.value = false;
          });
      }

      function setFilter(id) {
        activeFilter.value = id;
        loadItems(id);
      }

      onMounted(() => loadItems('all'));

      return {
        libraryTitle$,
        catalogEmpty$,
        loadError$,
        retryAction$,
        filters,
        activeFilter,
        loading,
        loadFailed,
        items,
        setFilter,
        loadItems,
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

  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 20px;
  }

  .cards {
    display: grid;
    gap: 12px;
  }
</style>
