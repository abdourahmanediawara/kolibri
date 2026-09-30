<template>

  <AeListPage
    :title="classesTitle$()"
    :countLabel="groupsCount$({ count: rows.length })"
    :subtitle="groupsSubtitle$()"
    :action="{ label: adminQuickCreateGroup$(), onClick: openCreatePanel }"
    :bannerTitle="groupsBannerTitle$()"
    :bannerSubtitle="groupsBannerSubtitle$()"
    bannerIcon="people"
    :bannerArt="bannerArt"
    :loading="loading"
    :items="rows"
    :searchFields="['name', 'coachNames']"
    :searchLabel="groupsSearchLabel$()"
    :searchPlaceholder="groupsSearchPlaceholder$()"
    :sortOptions="sortOptions"
    :emptyText="groupsEmpty$()"
    :noMatchText="groupsNoMatch$()"
    :totalLabel="count => groupsCount$({ count })"
  >
    <template #head>
      <th scope="col">
        {{ columnGroupName$() }}
      </th>
      <th scope="col">
        {{ columnLearners$() }}
      </th>
      <th
        scope="col"
        class="ae-list-cell-secondary"
      >
        {{ coachesTitle$() }}
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
            :name="item.name"
            :toneKey="item.id"
            icon="people"
          />
          <span class="ae-list-cell-name">{{ item.name }}</span>
        </span>
      </td>
      <td class="ae-list-cell-nowrap">
        {{ item.learnerCount }}
      </td>
      <td class="ae-list-cell-secondary">
        {{ item.coachNames || noCoachAssigned$() }}
      </td>
      <td class="ae-list-cell-shrink">
        <AeRowActions
          :primaryLabel="viewGroup$()"
          :primaryAriaLabel="viewGroupOf$({ name: item.name })"
          :primaryHref="item.href"
          :moreLabel="moreActionsFor$({ name: item.name })"
          :menuItems="[
            { label: editGroup$(), href: item.href },
            { label: manageAllGroups$(), href: `${facilityClassesPath}/` },
          ]"
          :openUp="openUp"
        />
      </td>
    </template>
    <template #extra>
      <AeGroupCreatePanel
        :open="createPanelOpen"
        :facilityId="userFacilityId"
        @close="createPanelOpen = false"
        @created="fetchClassrooms"
      />
    </template>
  </AeListPage>

</template>


<script>

  import { computed, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router/composables';
  import urls from 'kolibri/urls';
  import { currentLanguage } from 'kolibri/utils/i18n';
  import ClassroomResource from 'kolibri-common/apiResources/ClassroomResource';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';
  import AeAvatar from '../AeAvatar';
  import AeRowActions from '../AeRowActions';
  import AeListPage from '../AeListPage';
  import AeGroupCreatePanel from './AeGroupCreatePanel';

  export default {
    name: 'AeAdminClassesPage',
    components: { AeListPage, AeAvatar, AeGroupCreatePanel, AeRowActions },
    setup() {
      const {
        classesTitle$,
        groupsCount$,
        groupsSubtitle$,
        adminQuickCreateGroup$,
        groupsBannerTitle$,
        groupsBannerSubtitle$,
        groupsSearchLabel$,
        groupsSearchPlaceholder$,
        sortByName$,
        sortByLearners$,
        columnGroupName$,
        columnLearners$,
        coachesTitle$,
        columnActions$,
        viewGroup$,
        viewGroupOf$,
        moreActionsFor$,
        editGroup$,
        manageAllGroups$,
        groupsEmpty$,
        groupsNoMatch$,
        noCoachAssigned$,
      } = portalStrings;
      const { userFacilityId } = useAePermissions();

      const route = useRoute();
      const router = useRouter();
      const loading = ref(true);
      const classrooms = ref([]);
      const createPanelOpen = ref(false);

      function openCreatePanel() {
        createPanelOpen.value = true;
      }

      // Classes are created and edited in Kolibri facility management.
      const facilityClassesPath = computed(
        () =>
          `${urls['kolibri:kolibri.plugins.facility:facility_management']()}#/${userFacilityId.value}/classes`,
      );

      const rows = computed(() =>
        classrooms.value.map(classroom => ({
          id: classroom.id,
          name: classroom.name,
          learnerCount: classroom.learner_count || 0,
          coachNames: (classroom.coaches || [])
            .map(coach => coach.full_name || coach.username)
            .join(', '),
          href: `${facilityClassesPath.value}/${classroom.id}`,
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
          value: 'learners',
          label: sortByLearners$(),
          compare: (a, b) => b.learnerCount - a.learnerCount,
        },
      ];

      function fetchClassrooms() {
        return ClassroomResource.fetchCollection({
          getParams: { facility: userFacilityId.value },
          force: true,
        })
          .then(result => {
            classrooms.value = result || [];
          })
          .catch(() => {
            classrooms.value = [];
          })
          .finally(() => {
            loading.value = false;
          });
      }

      onMounted(() => {
        fetchClassrooms();
        if (route.query.creer) {
          openCreatePanel();
          router.replace({ query: {} });
        }
      });

      return {
        classesTitle$,
        groupsCount$,
        groupsSubtitle$,
        adminQuickCreateGroup$,
        groupsBannerTitle$,
        groupsBannerSubtitle$,
        groupsSearchLabel$,
        groupsSearchPlaceholder$,
        columnGroupName$,
        columnLearners$,
        coachesTitle$,
        columnActions$,
        viewGroup$,
        viewGroupOf$,
        moreActionsFor$,
        editGroup$,
        manageAllGroups$,
        groupsEmpty$,
        groupsNoMatch$,
        noCoachAssigned$,
        bannerArt: urls.static('action_education_portal/ae-users-banner.jpg'),
        facilityClassesPath,
        userFacilityId,
        createPanelOpen,
        openCreatePanel,
        fetchClassrooms,
        loading,
        rows,
        sortOptions,
      };
    },
  };

</script>
