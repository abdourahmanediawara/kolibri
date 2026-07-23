<template>
  <AppBarPage :title="title">
    <KPageContainer>
      <div
        class="list-page"
        :style="{ color: $themeTokens.text }"
      >
        <p
          class="intro"
          :style="{ color: $themeTokens.annotation }"
        >
          {{ intro }}
        </p>

        <form
          v-if="showSearch"
          class="search"
          @submit.prevent="onSearch"
        >
          <KTextbox
            v-model="searchText"
            :label="searchLabel"
            :floatingLabel="false"
            autocomplete="off"
          />
          <KButton
            :text="searchAction"
            :primary="true"
            type="submit"
          />
        </form>

        <KCircularLoader
          v-if="loading"
          :delay="false"
        />

        <p
          v-else-if="error"
          role="alert"
        >
          {{ error }}
        </p>

        <p
          v-else-if="!items.length"
          :style="{ color: $themeTokens.annotation }"
        >
          {{ emptyText }}
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
            :progressLabel="item.progressLabel"
          />
        </div>

        <p class="back">
          <KButton
            :text="backHomeLabel"
            appearance="basic-link"
            :href="homeHref"
          />
        </p>
      </div>
    </KPageContainer>
  </AppBarPage>
</template>

<script>
  import { computed, ref } from 'vue';
  import urls from 'kolibri/urls';
  import AppBarPage from 'kolibri/components/pages/AppBarPage';
  import ContentCard from './ContentCard';

  export default {
    name: 'ContentListPage',
    components: {
      AppBarPage,
      ContentCard,
    },
    props: {
      title: {
        type: String,
        required: true,
      },
      intro: {
        type: String,
        required: true,
      },
      emptyText: {
        type: String,
        required: true,
      },
      showSearch: {
        type: Boolean,
        default: false,
      },
      searchLabel: {
        type: String,
        default: '',
      },
      searchAction: {
        type: String,
        default: '',
      },
      loadItems: {
        type: Function,
        required: true,
      },
      backHomeLabel: {
        type: String,
        required: true,
      },
    },
    setup(props) {
      const loading = ref(true);
      const error = ref('');
      const items = ref([]);
      const searchText = ref('');
      const homeHref = computed(() => urls['kolibri:action_education_portal:portal']());

      function refresh(keywords = '') {
        loading.value = true;
        error.value = '';
        return Promise.resolve(props.loadItems(keywords))
          .then(result => {
            items.value = Array.isArray(result) ? result : [];
          })
          .catch(() => {
            error.value = props.emptyText;
            items.value = [];
          })
          .finally(() => {
            loading.value = false;
          });
      }

      function onSearch() {
        refresh(searchText.value.trim());
      }

      refresh();

      return {
        loading,
        error,
        items,
        searchText,
        homeHref,
        onSearch,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .list-page {
    max-width: 960px;
    margin: 0 auto;
    padding: 16px 8px 32px;
  }

  .intro {
    margin: 0 0 16px;
    font-size: 1.05rem;
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
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .back {
    margin-top: 24px;
  }
</style>
