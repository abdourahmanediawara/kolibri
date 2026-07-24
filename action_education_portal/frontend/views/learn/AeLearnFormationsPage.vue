<template>
  <div
    class="ae-page"
    :style="{ color: $themeTokens.text }"
  >
    <h1 class="title">
      {{ myTrainingsTitle$() }}
    </h1>

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
      v-else-if="!filteredChannels.length"
      :style="{ color: $themeTokens.annotation }"
    >
      {{ emptyFormationsLearner$() }}
    </p>

    <ul
      v-else
      class="list"
    >
      <li
        v-for="channel in filteredChannels"
        :key="channel.id"
        class="card"
        :style="{
          backgroundColor: $themeTokens.surface,
          borderColor: $themeTokens.fineLine,
        }"
      >
        <a
          class="card-link"
          :href="channel.href"
          :style="{ color: $themeTokens.text }"
        >
          <p class="card-title">
            {{ channel.title }}
          </p>
          <p
            v-if="channel.description"
            class="card-desc"
            :style="{ color: $themeTokens.annotation }"
          >
            {{ channel.description }}
          </p>
          <p
            class="card-meta"
            :style="{ color: $themeTokens.annotation }"
          >
            {{ channel.meta }}
          </p>
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
  import { computed, onMounted, ref } from 'vue';
  import { portalStrings } from '../../strings';
  import { useLearnContent } from '../../composables/useLearnContent';

  export default {
    name: 'AeLearnFormationsPage',
    setup() {
      const {
        myTrainingsTitle$,
        emptyFormationsLearner$,
        searchLabel$,
        searchAction$,
        channelMeta$,
      } = portalStrings;
      const { fetchChannels, channelHref, topicHref } = useLearnContent();

      const loading = ref(true);
      const channels = ref([]);
      const searchText = ref('');

      const filteredChannels = computed(() => {
        const q = searchText.value.trim().toLowerCase();
        if (!q) {
          return channels.value;
        }
        return channels.value.filter(
          ch =>
            (ch.title || '').toLowerCase().includes(q) ||
            (ch.description || '').toLowerCase().includes(q),
        );
      });

      function refresh() {
        loading.value = true;
        return fetchChannels()
          .then(list =>
            (list || []).map(channel => ({
              id: channel.id,
              title: channel.name || channel.title,
              description: channel.description || '',
              href: channel.root ? topicHref(channel.root) : channelHref(channel.id),
              meta: channelMeta$({ count: channel.total_resource_count || 0 }),
            })),
          )
          .then(result => {
            channels.value = result;
          })
          .finally(() => {
            loading.value = false;
          });
      }

      onMounted(refresh);

      return {
        myTrainingsTitle$,
        emptyFormationsLearner$,
        searchLabel$,
        searchAction$,
        loading,
        searchText,
        filteredChannels,
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
    margin: 0 0 16px;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .search {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: flex-end;
    margin-bottom: 20px;
  }

  .list {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .card {
    margin-bottom: 12px;
    border: 1px solid;
    border-radius: 8px;
  }

  .card-link {
    display: block;
    min-height: 44px;
    padding: 16px;
    text-decoration: none;
  }

  .card-title {
    margin: 0 0 4px;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .card-desc,
  .card-meta {
    margin: 0;
    font-size: 0.95rem;
  }
</style>
