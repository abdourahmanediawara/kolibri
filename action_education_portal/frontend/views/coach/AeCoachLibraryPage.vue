<template>

  <AeListPage
    :title="libraryTitle$()"
    :countLabel="channelsCount$({ count: rows.length })"
    :subtitle="contentSubtitle$()"
    :note="libraryOpenInKolibriHint$()"
    :bannerTitle="libraryBannerTitle$()"
    :bannerSubtitle="libraryBannerSubtitle$()"
    bannerIcon="library"
    :bannerArt="bannerArt"
    :loading="isLoadingLibrary"
    :errorText="errorMessage"
    :items="rows"
    :searchFields="['name', 'description', 'language']"
    :searchLabel="channelsSearchLabel$()"
    :searchPlaceholder="channelsSearchPlaceholder$()"
    :sortOptions="sortOptions"
    :emptyText="catalogEmpty$()"
    :noMatchText="channelsNoMatch$()"
    :totalLabel="count => channelsCount$({ count })"
    @retry="refresh"
  >
    <template #head>
      <th
        scope="col"
        class="ae-list-cell-grow"
      >
        {{ columnChannel$() }}
      </th>
      <th
        scope="col"
        class="ae-list-cell-secondary"
      >
        {{ columnLanguage$() }}
      </th>
      <th scope="col">
        {{ columnResources$() }}
      </th>
      <th
        scope="col"
        class="ae-list-cell-shrink"
      >
        {{ columnActions$() }}
      </th>
    </template>
    <template #row="{ item }">
      <td class="ae-list-cell-grow">
        <span class="ae-list-cell-main">
          <img
            v-if="item.thumbnail"
            class="ae-library-thumb"
            :src="item.thumbnail"
            alt=""
          >
          <AeAvatar
            v-else
            :name="item.name"
            :toneKey="item.id"
            icon="channel"
          />
          <span class="ae-library-text">
            <span class="ae-list-cell-name">{{ item.name }}</span>
            <span
              v-if="item.description"
              class="ae-library-description"
            >{{ item.description }}</span>
          </span>
        </span>
      </td>
      <td class="ae-list-cell-nowrap ae-list-cell-secondary">
        {{ item.language }}
      </td>
      <td class="ae-list-cell-nowrap">
        {{ item.resources }}
      </td>
      <td class="ae-list-cell-shrink">
        <AeRowActions
          :primaryLabel="browseChannel$()"
          :primaryAriaLabel="browseChannelOf$({ name: item.name })"
          :primaryHref="item.href"
          primaryTarget="_blank"
        />
      </td>
    </template>
  </AeListPage>

</template>


<script>

  import { computed, onMounted, ref } from 'vue';
  import urls from 'kolibri/urls';
  import { currentLanguage } from 'kolibri/utils/i18n';
  import { portalStrings } from '../../strings';
  import { useLearnContent } from '../../composables/useLearnContent';
  import { useAsyncPageLoad } from '../../composables/useAsyncPageLoad';
  import { withTimeout } from '../../composables/useTrainingApi';
  import AeAvatar from '../AeAvatar';
  import AeListPage from '../AeListPage';
  import AeRowActions from '../AeRowActions';

  export default {
    name: 'AeCoachLibraryPage',
    components: { AeAvatar, AeListPage, AeRowActions },
    setup() {
      const {
        libraryTitle$,
        channelsCount$,
        contentSubtitle$,
        libraryOpenInKolibriHint$,
        libraryBannerTitle$,
        libraryBannerSubtitle$,
        channelsSearchLabel$,
        channelsSearchPlaceholder$,
        catalogEmpty$,
        channelsNoMatch$,
        columnChannel$,
        columnLanguage$,
        columnResources$,
        columnActions$,
        browseChannel$,
        browseChannelOf$,
        sortByName$,
        sortByResources$,
        loadError$,
        loadTimeout$,
      } = portalStrings;
      const { fetchChannels, channelHref, topicHref } = useLearnContent();
      const {
        isLoading: isLoadingLibrary,
        loadError,
        runLoad,
      } = useAsyncPageLoad('isLoadingLibrary');
      const channels = ref([]);

      const errorMessage = computed(() => {
        if (!loadError.value) {
          return '';
        }
        if (loadError.value.code === 'AE_REQUEST_TIMEOUT') {
          return loadTimeout$();
        }
        return loadError$();
      });

      const rows = computed(() =>
        channels.value.map(channel => ({
          id: channel.id,
          name: channel.name || channel.title,
          description: channel.description || '',
          language: channel.lang_name || '',
          resources: channel.total_resource_count || 0,
          thumbnail: channel.thumbnail || channel.thumbnail_url || '',
          href: channel.root ? topicHref(channel.root) : channelHref(channel.id),
        })),
      );

      const collator = new Intl.Collator(currentLanguage, { sensitivity: 'base' });
      const sortOptions = [
        {
          value: 'name',
          label: sortByName$(),
          compare: (a, b) => collator.compare(a.name, b.name),
        },
        {
          value: 'resources',
          label: sortByResources$(),
          compare: (a, b) => b.resources - a.resources,
        },
      ];

      async function refresh() {
        try {
          await runLoad(async () => {
            channels.value = (await withTimeout(fetchChannels())) || [];
          });
        } catch (e) {
          channels.value = [];
        }
      }

      onMounted(refresh);

      return {
        libraryTitle$,
        channelsCount$,
        contentSubtitle$,
        libraryOpenInKolibriHint$,
        libraryBannerTitle$,
        libraryBannerSubtitle$,
        channelsSearchLabel$,
        channelsSearchPlaceholder$,
        catalogEmpty$,
        channelsNoMatch$,
        columnChannel$,
        columnLanguage$,
        columnResources$,
        columnActions$,
        browseChannel$,
        browseChannelOf$,
        bannerArt: urls.static('action_education_portal/ae-users-banner.jpg'),
        isLoadingLibrary,
        errorMessage,
        rows,
        sortOptions,
        refresh,
      };
    },
  };

</script>


<style lang="scss" scoped>

  .ae-library-thumb {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    object-fit: cover;
    background: var(--ae-surface-muted);
    border-radius: var(--ae-radius-sm);
  }

  .ae-library-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
    line-height: 1.3;
  }

  .ae-library-description {
    overflow: hidden;
    font-size: 14px;
    color: var(--ae-text-subtle);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

</style>
