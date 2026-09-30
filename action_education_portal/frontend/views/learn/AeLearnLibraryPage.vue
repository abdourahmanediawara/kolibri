<template>

  <div class="ae-lib">
    <AePageHeader
      :title="libraryTitle$()"
      :countLabel="loading ? '' : libraryCount$({ count: shownItems.length })"
      :subtitle="learnLibrarySubtitle$()"
    />

    <div class="ae-lib-toolbar">
      <div
        class="ae-lib-filters"
        role="group"
        :aria-label="libraryFilterLabel$()"
      >
        <button
          v-for="filter in filters"
          :key="filter.id"
          type="button"
          class="ae-lib-filter"
          :class="{ 'ae-lib-filter-on': activeFilter === filter.id }"
          :aria-pressed="activeFilter === filter.id ? 'true' : 'false'"
          @click="setFilter(filter.id)"
        >
          <AeIcon
            :name="filter.icon"
            :size="18"
          />
          <span>{{ filter.label }}</span>
        </button>
      </div>
      <label class="ae-lib-search">
        <AeIcon
          name="search"
          class="ae-lib-search-icon"
          :size="20"
        />
        <span class="ae-lib-visually-hidden">{{ librarySearchLabel$() }}</span>
        <input
          v-model="query"
          type="search"
          autocomplete="off"
          :placeholder="librarySearchLabel$()"
        >
      </label>
    </div>

    <KCircularLoader
      v-if="loading"
      :delay="false"
    />
    <div
      v-else-if="loadFailed"
      class="ae-lib-alert"
      role="alert"
    >
      <p>{{ loadError$() }}</p>
      <button
        type="button"
        class="ae-lib-outline"
        @click="loadItems(activeFilter)"
      >
        {{ retryAction$() }}
      </button>
    </div>
    <p
      v-else-if="!items.length"
      class="ae-lib-empty"
    >
      {{ catalogEmpty$() }}
    </p>
    <p
      v-else-if="!shownItems.length"
      class="ae-lib-empty"
    >
      {{ noMatch$() }}
    </p>

    <div
      v-else
      class="ae-lib-area"
    >
      <ul class="ae-lib-grid">
        <li
          v-for="item in shownItems"
          :key="item.id"
          class="ae-lib-card"
        >
          <div
            class="ae-lib-thumb"
            :class="`ae-lib-tone-${item.tone}`"
          >
            <img
              v-if="item.thumbnail"
              :src="item.thumbnail"
              alt=""
            >
            <AeIcon
              v-else
              :name="item.icon"
              :size="40"
            />
            <span class="ae-lib-kind">{{ item.kindLabel }}</span>
          </div>
          <div class="ae-lib-body">
            <h2 class="ae-lib-title">
              {{ item.title }}
            </h2>
            <p
              v-if="item.meta"
              class="ae-lib-meta"
            >
              {{ item.meta }}
            </p>
            <router-link
              class="ae-lib-open"
              :to="{ name: 'AeLearnResource', params: { nodeId: item.nodeId } }"
              :aria-label="libraryOpenOf$({ name: item.title })"
            >
              <span>{{ libraryOpenAction$() }}</span>
              <AeIcon
                name="arrowRight"
                :size="18"
              />
            </router-link>
          </div>
        </li>
      </ul>
    </div>
  </div>

</template>


<script>

  import { computed, onMounted, ref } from 'vue';
  import { ContentNodeKinds } from 'kolibri/constants';
  import { portalStrings } from '../../strings';
  import { useLearnContent } from '../../composables/useLearnContent';
  import AeIcon from '../AeIcon';
  import AePageHeader from '../AePageHeader';

  function normalize(text) {
    return String(text || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase();
  }

  /** Kolibri channels and resources available on this device, as cards. */
  export default {
    name: 'AeLearnLibraryPage',
    components: { AeIcon, AePageHeader },
    setup() {
      const {
        libraryTitle$,
        libraryCount$,
        learnLibrarySubtitle$,
        libraryFilterLabel$,
        librarySearchLabel$,
        libraryCollections$,
        libraryOpenAction$,
        libraryOpenOf$,
        typeVideo$,
        typeDocument$,
        typeAudio$,
        typeHtml5$,
        catalogEmpty$,
        noMatch$,
        loadError$,
        retryAction$,
      } = portalStrings;
      const { fetchNodesByKind, fetchChannels } = useLearnContent();

      const FILTERS = [
        { id: 'all', label: libraryCollections$(), icon: 'bookOpen', tone: 'orange' },
        { id: ContentNodeKinds.VIDEO, label: typeVideo$(), icon: 'squarePlay', tone: 'red' },
        { id: ContentNodeKinds.DOCUMENT, label: typeDocument$(), icon: 'fileText', tone: 'blue' },
        { id: ContentNodeKinds.AUDIO, label: typeAudio$(), icon: 'headphones', tone: 'purple' },
        { id: ContentNodeKinds.HTML5, label: typeHtml5$(), icon: 'globe', tone: 'mint' },
      ];

      const loading = ref(true);
      const loadFailed = ref(false);
      const items = ref([]);
      const activeFilter = ref('all');
      const query = ref('');

      const shownItems = computed(() => {
        const needle = normalize(query.value.trim());
        return needle
          ? items.value.filter(item => normalize(`${item.title} ${item.meta}`).includes(needle))
          : items.value;
      });

      function toItem(filter, { id, nodeId, title, thumbnail, meta }) {
        return {
          id,
          nodeId,
          title,
          thumbnail: thumbnail || '',
          meta: meta || '',
          icon: filter.icon,
          tone: filter.tone,
          kindLabel: filter.label,
        };
      }

      async function loadItems(kind) {
        const filter = FILTERS.find(item => item.id === kind);
        loading.value = true;
        loadFailed.value = false;
        try {
          if (kind === 'all') {
            const channels = await fetchChannels();
            items.value = (channels || []).map(channel =>
              toItem(filter, {
                id: channel.id,
                nodeId: channel.root,
                title: channel.name || channel.title,
                thumbnail: channel.thumbnail || channel.thumbnail_url,
                meta: channel.description || channel.tagline,
              }),
            );
          } else {
            const nodes = await fetchNodesByKind(kind, { maxResults: 60 });
            items.value = (nodes || []).map(node =>
              toItem(filter, {
                id: node.id,
                nodeId: node.id,
                title: node.title,
                thumbnail: node.thumbnail || node.thumbnail_url,
                meta: node.description,
              }),
            );
          }
        } catch (e) {
          loadFailed.value = true;
          items.value = [];
        } finally {
          loading.value = false;
        }
      }

      function setFilter(id) {
        activeFilter.value = id;
        loadItems(id);
      }

      onMounted(() => loadItems('all'));

      return {
        libraryTitle$,
        libraryCount$,
        learnLibrarySubtitle$,
        libraryFilterLabel$,
        librarySearchLabel$,
        libraryOpenAction$,
        libraryOpenOf$,
        catalogEmpty$,
        noMatch$,
        loadError$,
        retryAction$,
        filters: FILTERS,
        activeFilter,
        query,
        loading,
        loadFailed,
        items,
        shownItems,
        setFilter,
        loadItems,
      };
    },
  };

</script>


<style lang="scss" scoped>

  @import '../../styles/tokens';
  @import '../../styles/components';

  .ae-lib-visually-hidden {
    @include ae-visually-hidden;
  }

  .ae-lib {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .ae-lib-outline {
    @include ae-button-outline;
  }

  .ae-lib-alert {
    @include ae-card;

    color: var(--ae-danger);
  }

  .ae-lib-empty {
    @include ae-card;

    margin: 0;
    color: var(--ae-text-muted);
  }

  .ae-lib-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
  }

  .ae-lib-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 4px;
    background: var(--ae-surface);
    border: 1px solid var(--ae-line);
    border-radius: 999px;
  }

  .ae-lib-filter {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    min-height: 38px;
    padding: 0 14px;
    font: inherit;
    font-size: 15px;
    font-weight: 700;
    color: var(--ae-text-muted);
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 999px;

    @include ae-focus-ring;
  }

  .ae-lib-filter-on {
    color: #ffffff;
    background: var(--ae-navy);
  }

  .ae-lib-search {
    position: relative;
    flex: 0 1 340px;

    input {
      @include ae-field;

      height: 44px;
      padding-inline-start: 44px;
    }
  }

  .ae-lib-search-icon {
    position: absolute;
    top: 12px;
    inset-inline-start: 14px;
    color: var(--ae-text-subtle);
  }

  .ae-lib-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .ae-lib-card {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--ae-surface);
    border: 1px solid var(--ae-line);
    border-radius: var(--ae-radius-lg);
    box-shadow: var(--ae-shadow-card);
  }

  .ae-lib-thumb {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 120px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .ae-lib-kind {
    position: absolute;
    top: 10px;
    inset-inline-start: 10px;
    padding: 2px 10px;
    font-size: 12px;
    font-weight: 800;
    color: var(--ae-navy);
    background: rgba(255, 255, 255, 0.92);
    border-radius: 999px;
  }

  .ae-lib-tone-orange {
    color: var(--ae-orange-deep);
    background: var(--ae-orange-wash);
  }

  .ae-lib-tone-red {
    color: #a3263a;
    background: var(--ae-kpi-red);
  }

  .ae-lib-tone-blue {
    color: #1f5f99;
    background: var(--ae-kpi-blue);
  }

  .ae-lib-tone-purple {
    color: #6d2e7f;
    background: var(--ae-kpi-purple);
  }

  .ae-lib-tone-mint {
    color: #176b63;
    background: var(--ae-kpi-mint);
  }

  .ae-lib-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 6px;
    padding: 12px 16px 14px;
  }

  .ae-lib-title {
    display: -webkit-box;
    margin: 0;
    overflow: hidden;
    font-size: 17px;
    font-weight: 800;
    line-height: 1.25;
    color: var(--ae-navy);
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .ae-lib-meta {
    display: -webkit-box;
    margin: 0;
    overflow: hidden;
    font-size: 14px;
    color: var(--ae-text-muted);
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .ae-lib-open {
    @include ae-button-outline;

    align-self: flex-start;
    min-height: 38px;
    margin-top: auto;
    font-size: 15px;
  }

  // Computers: the page never scrolls; the cards do.
  @media (min-width: 900px) and (min-height: 640px) {
    .ae-lib {
      flex: 1 1 auto;
      min-height: 0;
    }

    .ae-lib-area {
      flex: 1 1 0;
      min-height: 0;
      padding: 2px;
      overflow-y: auto;
    }
  }

</style>
