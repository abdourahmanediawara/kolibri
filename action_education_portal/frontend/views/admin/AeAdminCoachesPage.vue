<template>

  <AeListPage
    :title="coachesTitle$()"
    :countLabel="coachesCount$({ count: rows.length })"
    :subtitle="coachesSubtitle$()"
    :action="{ label: addCoachAction$(), onClick: openCreatePanel }"
    :bannerTitle="coachesBannerTitle$()"
    :bannerSubtitle="coachesBannerSubtitle$()"
    bannerIcon="coach"
    :bannerArt="bannerArt"
    :loading="loading"
    :items="rows"
    :searchFields="['fullName', 'username']"
    :searchLabel="coachesSearchLabel$()"
    :searchPlaceholder="usersSearchPlaceholder$()"
    :sortOptions="sortOptions"
    :emptyText="coachesEmpty$()"
    :noMatchText="coachesNoMatch$()"
    :totalLabel="count => coachesCount$({ count })"
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
      <th scope="col">
        {{ columnRole$() }}
      </th>
      <th scope="col">
        {{ columnGroups$() }}
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
      <td class="ae-list-cell-nowrap">
        {{ item.role }}
      </td>
      <td class="ae-list-cell-nowrap">
        {{ item.groupCount }}
      </td>
      <td class="ae-list-cell-shrink">
        <AeRowActions
          :primaryLabel="viewProfile$()"
          :primaryAriaLabel="viewProfileOf$({ name: item.fullName })"
          :moreLabel="moreActionsFor$({ name: item.fullName })"
          :menuItems="[{ label: editAccount$(), onClick: () => (editing = item.user) }]"
          :openUp="openUp"
          @primary="editing = item.user"
        />
      </td>
    </template>
    <template #extra>
      <AeUserEditPanel
        :user="editing"
        @close="editing = null"
        @saved="onAccountSaved"
      />
      <AeUserCreatePanel
        :open="createPanelOpen"
        :facilityId="userFacilityId"
        :defaultKind="coachKind"
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
  import ClassroomResource from 'kolibri-common/apiResources/ClassroomResource';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';
  import AeAvatar from '../AeAvatar';
  import AeRowActions from '../AeRowActions';
  import AeListPage from '../AeListPage';
  import AeUserCreatePanel from './AeUserCreatePanel';
  import AeUserEditPanel from './AeUserEditPanel';

  const COACH_KINDS = [UserKinds.COACH, UserKinds.ASSIGNABLE_COACH, UserKinds.ADMIN];

  export default {
    name: 'AeAdminCoachesPage',
    components: { AeListPage, AeAvatar, AeRowActions, AeUserCreatePanel, AeUserEditPanel },
    setup() {
      const {
        coachesTitle$,
        coachesCount$,
        coachesSubtitle$,
        addCoachAction$,
        coachesBannerTitle$,
        coachesBannerSubtitle$,
        coachesSearchLabel$,
        usersSearchPlaceholder$,
        sortByName$,
        sortByGroups$,
        columnFullName$,
        usernameLabel$,
        columnRole$,
        columnGroups$,
        columnActions$,
        viewProfile$,
        viewProfileOf$,
        moreActionsFor$,
        editAccount$,
        coachesEmpty$,
        coachesNoMatch$,
        spaceAdmin$,
        spaceCoach$,
      } = portalStrings;
      const { userFacilityId } = useAePermissions();

      const route = useRoute();
      const router = useRouter();
      const loading = ref(true);
      const users = ref([]);
      const classrooms = ref([]);
      const createPanelOpen = ref(false);

      function openCreatePanel() {
        createPanelOpen.value = true;
      }

      // The account being changed in the edit panel.
      const editing = ref(null);

      const groupCounts = computed(() => {
        const counts = {};
        classrooms.value.forEach(classroom => {
          (classroom.coaches || []).forEach(coach => {
            counts[coach.id] = (counts[coach.id] || 0) + 1;
          });
        });
        return counts;
      });

      const rows = computed(() =>
        users.value
          .filter(user => (user.roles || []).some(role => COACH_KINDS.includes(role.kind)))
          .map(user => {
            const isAdmin = user.roles.some(role => role.kind === UserKinds.ADMIN);
            return {
              id: user.id,
              fullName: user.full_name || user.username,
              username: user.username,
              role: isAdmin ? spaceAdmin$() : spaceCoach$(),
              groupCount: groupCounts.value[user.id] || 0,
          user,
            };
          }),
      );

      const collator = new Intl.Collator(currentLanguage, { sensitivity: 'base' });
      const sortOptions = [
        {
          value: 'name',
          label: sortByName$(),
          compare: (a, b) => collator.compare(a.fullName, b.fullName),
        },
        { value: 'groups', label: sortByGroups$(), compare: (a, b) => b.groupCount - a.groupCount },
      ];

      function onAccountSaved() {
        editing.value = null;
        fetchUsers();
      }

      function fetchUsers() {
        return Promise.allSettled([
          FacilityUserResource.fetchCollection({
            getParams: { member_of: userFacilityId.value },
            force: true,
          }),
          ClassroomResource.fetchCollection({
            getParams: { facility: userFacilityId.value },
            force: true,
          }),
        ]).then(([usersResult, classroomsResult]) => {
          users.value = usersResult.status === 'fulfilled' ? usersResult.value || [] : [];
          // Group counts are a bonus: the list still shows if classes fail to load.
          classrooms.value =
            classroomsResult.status === 'fulfilled' ? classroomsResult.value || [] : [];
          loading.value = false;
        });
      }

      onMounted(() => {
        fetchUsers();
        if (route.query.creer) {
          openCreatePanel();
          router.replace({ query: {} });
        }
      });

      return {
        coachesTitle$,
        coachesCount$,
        coachesSubtitle$,
        addCoachAction$,
        coachesBannerTitle$,
        coachesBannerSubtitle$,
        coachesSearchLabel$,
        usersSearchPlaceholder$,
        columnFullName$,
        usernameLabel$,
        columnRole$,
        columnGroups$,
        columnActions$,
        viewProfile$,
        viewProfileOf$,
        moreActionsFor$,
        editAccount$,
        coachesEmpty$,
        coachesNoMatch$,
        bannerArt: urls.static('action_education_portal/ae-users-banner.jpg'),
        editing,
        onAccountSaved,
        userFacilityId,
        coachKind: UserKinds.COACH,
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
