<template>
  <div
    class="ae-page"
    :style="{ color: $themeTokens.text }"
  >
    <h1 class="title">
      {{ quizzesTitle$() }}
    </h1>
    <p
      class="intro"
      :style="{ color: $themeTokens.annotation }"
    >
      {{ quizzesIntro$() }}
    </p>

    <form
      class="search"
      @submit.prevent="refresh"
    >
      <KTextbox
        v-model="searchText"
        :label="searchLabel$()"
        :floatingLabel="false"
        autocomplete="off"
      />
      <KButton
        :text="searchAction$()"
        :primary="true"
        type="submit"
      />
    </form>

    <KCircularLoader
      v-if="loading"
      :delay="false"
    />

    <p
      v-else-if="!items.length"
      :style="{ color: $themeTokens.annotation }"
    >
      {{ quizzesEmpty$() }}
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
        icon="quiz"
        :thumbnail="item.thumbnail"
        :progressLabel="item.progressLabel"
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
    name: 'AeLearnQuizzesPage',
    components: {
      ContentCard,
    },
    setup() {
      const {
        quizzesTitle$,
        quizzesIntro$,
        quizzesEmpty$,
        searchLabel$,
        searchAction$,
        progressPercent$,
        notStarted$,
      } = portalStrings;
      const {
        fetchNodesByKind,
        fetchProgressForIds,
        progressMapFromList,
        progressFraction,
        contentHref,
        ContentNodeKinds,
      } = useLearnContent();

      const loading = ref(true);
      const items = ref([]);
      const searchText = ref('');

      function refresh() {
        loading.value = true;
        const keywords = searchText.value.trim();
        return fetchNodesByKind(ContentNodeKinds.EXERCISE, { keywords, maxResults: 50 })
          .then(nodes => {
            const list = nodes || [];
            return fetchProgressForIds(list.map(n => n.id)).then(progressList => {
              const map = progressMapFromList(progressList);
              return list.map(node => {
                const fraction = progressFraction(map[node.content_id]);
                return {
                  id: node.id,
                  title: node.title,
                  href: contentHref(node.id),
                  thumbnail: node.thumbnail || node.thumbnail_url || '',
                  progressLabel:
                    typeof fraction === 'number'
                      ? progressPercent$({ percent: Math.round(fraction * 100) })
                      : notStarted$(),
                };
              });
            });
          })
          .then(result => {
            items.value = result;
          })
          .finally(() => {
            loading.value = false;
          });
      }

      onMounted(refresh);

      return {
        quizzesTitle$,
        quizzesIntro$,
        quizzesEmpty$,
        searchLabel$,
        searchAction$,
        loading,
        items,
        searchText,
        refresh,
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

  .search {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: flex-end;
    margin-bottom: 20px;
  }

  .cards {
    display: grid;
    gap: 12px;
  }
</style>
