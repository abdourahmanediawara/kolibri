<template>

  <AeListPage
    :title="dashUsersLabel$()"
    :countLabel="usersAccountsCount$({ count: rows.length })"
    :subtitle="usersSubtitle$()"
    :action="{ label: adminQuickAddUser$(), onClick: openCreatePanel }"
    :bannerTitle="usersBannerTitle$()"
    :bannerSubtitle="usersBannerSubtitle$()"
    bannerIcon="people"
    :bannerArt="bannerArt"
    :loading="loading"
    :items="rows"
    :searchFields="['fullName', 'username']"
    :searchLabel="usersSearchLabel$()"
    :searchPlaceholder="usersSearchPlaceholder$()"
    :sortOptions="sortOptions"
    :emptyText="learnersEmpty$()"
    :noMatchText="usersNoMatch$()"
    :totalLabel="count => usersTotal$({ count })"
  >
    <template #head>
      <th scope="col">
        {{ columnFullName$() }}
      </th>
      <th
        scope="col"
        class="ae-list-cell-secondary"
      >
        {{ usernameLabel$() }}
      </th>
      <th
        scope="col"
        class="ae-list-cell-shrink"
      >
        {{ columnActions$() }}
      </th>
    </template>
    <template #row="{ item, openUp }">
      <td>
        <span class="ae-list-cell-main">
          <AeAvatar
            :name="item.fullName"
            :toneKey="item.username"
          />
          <span class="ae-list-cell-name">{{ item.fullName }}</span>
        </span>
      </td>
      <td class="ae-list-cell-nowrap ae-list-cell-secondary">
        {{ item.username }}
      </td>
      <td class="ae-list-cell-shrink">
        <AeRowActions
          :primaryLabel="viewProfile$()"
          :primaryAriaLabel="viewProfileOf$({ name: item.fullName })"
          :primaryHref="item.href"
          :moreLabel="moreActionsFor$({ name: item.fullName })"
          :menuItems="[
            { label: editAccount$(), href: item.href },
            { label: manageAllAccounts$(), href: `${facilityUsersPath}/` },
          ]"
          :openUp="openUp"
        />
      </td>
    </template>
    <template #extra>
      <AeUserCreatePanel
        :open="createPanelOpen"
        :facilityId="userFacilityId"
        :defaultKind="learnerKind"
        @close="createPanelOpen = false"
        @created="fetchUsers"
      />
    </template>
  </AeListPage>

</template>


<script>

  import { computed, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router/composables';
  import urls from 'kolibri/urls';
  import { UserKinds } from 'kolibri/constants';
  import { currentLanguage } from 'kolibri/utils/i18n';
  import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';
  import AeAvatar from '../AeAvatar';
  import AeRowActions from '../AeRowActions';
  import AeListPage from '../AeListPage';
  import AeUserCreatePanel from './AeUserCreatePanel';

  export default {
    name: 'AeAdminUsersPage',
    components: { AeListPage, AeAvatar, AeRowActions, AeUserCreatePanel },
    setup() {
      const {
        dashUsersLabel$,
        usersAccountsCount$,
        usersSubtitle$,
        adminQuickAddUser$,
        usersBannerTitle$,
        usersBannerSubtitle$,
        usersSearchLabel$,
        usersSearchPlaceholder$,
        sortByName$,
        sortByUsername$,
        sortByNewest$,
        columnFullName$,
        usernameLabel$,
        columnActions$,
        viewProfile$,
        viewProfileOf$,
        moreActionsFor$,
        editAccount$,
        manageAllAccounts$,
        usersTotal$,
        usersNoMatch$,
        learnersEmpty$,
      } = portalStrings;
      const { userFacilityId } = useAePermissions();

      const route = useRoute();
      const router = useRouter();
      const loading = ref(true);
      const users = ref([]);
      const createPanelOpen = ref(false);

      function openCreatePanel() {
        createPanelOpen.value = true;
      }

      // Account pages live in Kolibri facility management.
      const facilityUsersPath = computed(
        () =>
          `${urls['kolibri:kolibri.plugins.facility:facility_management']()}#/${userFacilityId.value}/users`,
      );

      const rows = computed(() =>
        users.value.map(user => ({
          id: user.id,
          fullName: user.full_name || user.username,
          username: user.username,
          dateJoined: user.date_joined ? new Date(user.date_joined).getTime() : 0,
          href: `${facilityUsersPath.value}/${user.id}`,
        })),
      );

      const collator = new Intl.Collator(currentLanguage, { sensitivity: 'base' });
      const sortOptions = [
        {
          value: 'name',
          label: sortByName$(),
          compare: (a, b) => collator.compare(a.fullName, b.fullName),
        },
        {
          value: 'username',
          label: sortByUsername$(),
          compare: (a, b) => collator.compare(a.username, b.username),
        },
        { value: 'newest', label: sortByNewest$(), compare: (a, b) => b.dateJoined - a.dateJoined },
      ];

      function fetchUsers() {
        return FacilityUserResource.fetchCollection({
          getParams: { member_of: userFacilityId.value },
          force: true,
        })
          .then(result => {
            users.value = result || [];
          })
          .finally(() => {
            loading.value = false;
          });
      }

      onMounted(() => {
        fetchUsers();
        // The dashboard "Ajouter un utilisateur" action lands here with ?creer=1.
        if (route.query.creer) {
          openCreatePanel();
          router.replace({ query: {} });
        }
      });

      return {
        dashUsersLabel$,
        usersAccountsCount$,
        usersSubtitle$,
        adminQuickAddUser$,
        usersBannerTitle$,
        usersBannerSubtitle$,
        usersSearchLabel$,
        usersSearchPlaceholder$,
        columnFullName$,
        usernameLabel$,
        columnActions$,
        viewProfile$,
        viewProfileOf$,
        moreActionsFor$,
        editAccount$,
        manageAllAccounts$,
        usersTotal$,
        usersNoMatch$,
        learnersEmpty$,
        bannerArt: urls.static('action_education_portal/ae-users-banner.jpg'),
        facilityUsersPath,
        userFacilityId,
        learnerKind: UserKinds.LEARNER,
        createPanelOpen,
        openCreatePanel,
        fetchUsers,
        loading,
        rows,
        sortOptions,
      };
    },
  };

</script>
