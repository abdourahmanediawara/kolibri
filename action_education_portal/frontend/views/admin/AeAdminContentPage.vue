<template>

  <AeListPage
    :title="contentManageTitle$()"
    :countLabel="channelsCount$({ count: rows.length })"
    :subtitle="contentSubtitle$()"
    :note="canAccessDeviceAdministration ? '' : importAfterSignInHint$()"
    :action="
      canAccessDeviceAdministration
        ? { label: importContentAction$(), href: `${deviceHref}#/content` }
        : null
    "
    :bannerTitle="contentBannerTitle$()"
    :bannerSubtitle="contentBannerSubtitle$()"
    bannerIcon="channel"
    :bannerArt="bannerArt"
    :loading="loading"
    :items="rows"
    :searchFields="['name', 'description', 'language']"
    :searchLabel="channelsSearchLabel$()"
    :searchPlaceholder="channelsSearchPlaceholder$()"
    :sortOptions="sortOptions"
    :emptyText="channelsEmpty$()"
    :noMatchText="channelsNoMatch$()"
    :totalLabel="count => channelsCount$({ count })"
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
        class="ae-list-cell-secondary"
      >
        {{ columnSize$() }}
      </th>
      <th
        scope="col"
        class="ae-list-cell-shrink"
      >
        {{ columnActions$() }}
      </th>
    </template>
    <template #row="{ item, openUp }">
      <td class="ae-list-cell-grow">
        <span class="ae-list-cell-main">
          <AeAvatar
            :name="item.name"
            :toneKey="item.id"
            icon="channel"
          />
          <span class="ae-list-cell-name">{{ item.name }}</span>
        </span>
      </td>
      <td class="ae-list-cell-nowrap ae-list-cell-secondary">
        {{ item.language }}
      </td>
      <td class="ae-list-cell-nowrap">
        {{ item.resources }}
      </td>
      <td class="ae-list-cell-nowrap ae-list-cell-secondary">
        {{ item.sizeLabel }}
      </td>
      <td class="ae-list-cell-shrink">
        <AeRowActions
          :primaryLabel="browseChannel$()"
          :primaryAriaLabel="browseChannelOf$({ name: item.name })"
          :primaryHref="item.browseHref"
          :moreLabel="moreActionsFor$({ name: item.name })"
          :menuItems="
            canAccessDeviceAdministration
              ? [{ label: manageOnDevice$(), href: item.manageHref }]
              : []
          "
          :openUp="openUp"
        />
      </td>
    </template>
  </AeListPage>

</template>


<script>

  import { computed, onMounted, ref } from 'vue';
  import urls from 'kolibri/urls';
  import { currentLanguage } from 'kolibri/utils/i18n';
  import bytesForHumans from 'kolibri/uiText/bytesForHumans';
  import ChannelResource from 'kolibri-common/apiResources/ChannelResource';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';
  import AeAvatar from '../AeAvatar';
  import AeRowActions from '../AeRowActions';
  import AeListPage from '../AeListPage';

  export default {
    name: 'AeAdminContentPage',
    components: { AeListPage, AeAvatar, AeRowActions },
    setup() {
      const {
        contentManageTitle$,
        channelsCount$,
        contentSubtitle$,
        importAfterSignInHint$,
        importContentAction$,
        contentBannerTitle$,
        contentBannerSubtitle$,
        channelsSearchLabel$,
        channelsSearchPlaceholder$,
        sortByName$,
        sortByResources$,
        columnChannel$,
        columnLanguage$,
        columnResources$,
        columnSize$,
        columnActions$,
        browseChannel$,
        browseChannelOf$,
        moreActionsFor$,
        manageOnDevice$,
        channelsEmpty$,
        channelsNoMatch$,
      } = portalStrings;

      const { canAccessDeviceAdministration } = useAePermissions();
      const loading = ref(true);
      const channels = ref([]);

      const deviceHref = urls['kolibri:kolibri.plugins.device:device_management']();
      const learnHref = urls['kolibri:kolibri.plugins.learn:learn']();

      const rows = computed(() =>
        channels.value.map(channel => ({
          id: channel.id,
          name: channel.name,
          description: channel.description || '',
          language: channel.lang_name || '',
          resources: channel.total_resource_count || 0,
          sizeLabel: channel.published_size ? bytesForHumans(channel.published_size) : '',
          browseHref: `${learnHref}#/topics/${channel.id}`,
          manageHref: `${deviceHref}#/content/manage_channel/${channel.id}`,
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

      onMounted(() => {
        ChannelResource.fetchCollection({ getParams: { available: true } })
          .then(result => {
            channels.value = Array.isArray(result) ? result : (result && result.results) || [];
          })
          .catch(() => {
            channels.value = [];
          })
          .finally(() => {
            loading.value = false;
          });
      });

      return {
        contentManageTitle$,
        channelsCount$,
        contentSubtitle$,
        importAfterSignInHint$,
        importContentAction$,
        contentBannerTitle$,
        contentBannerSubtitle$,
        channelsSearchLabel$,
        channelsSearchPlaceholder$,
        columnChannel$,
        columnLanguage$,
        columnResources$,
        columnSize$,
        columnActions$,
        browseChannel$,
        browseChannelOf$,
        moreActionsFor$,
        manageOnDevice$,
        channelsEmpty$,
        channelsNoMatch$,
        canAccessDeviceAdministration,
        bannerArt: urls.static('action_education_portal/ae-signin-illustration.jpg'),
        deviceHref,
        loading,
        rows,
        sortOptions,
      };
    },
  };

</script>
