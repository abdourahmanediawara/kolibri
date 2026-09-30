<template>

  <AeDashboard
    :title="dashboardTitle$()"
    :welcomeTitle="adminWelcomeTitle$()"
    :welcomeSubtitle="adminWelcomeSubtitle$()"
    :bannerSrc="bannerSrc"
    :loading="loading"
    :cards="summaryCards"
    :activityTitle="adminRecentActivityTitle$()"
    :activityTo="{ name: 'AeAdminUsers' }"
    :activityItems="activityItems"
    :activityEmpty="adminRecentActivityEmpty$()"
    :actionsTitle="adminQuickActionsTitle$()"
    :actions="quickActions"
    :footerLink="{
      to: { name: 'AeAdminSettings' },
      icon: 'settings',
      label: adminQuickOpenSettings$(),
    }"
  />

</template>


<script>

  import { computed, onMounted, ref } from 'vue';
  import { UserKinds } from 'kolibri/constants';
  import urls from 'kolibri/urls';
  import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
  import ClassroomResource from 'kolibri-common/apiResources/ClassroomResource';
  import ChannelResource from 'kolibri-common/apiResources/ChannelResource';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';
  import { useTrainingApi } from '../../composables/useTrainingApi';
  import AeDashboard from '../AeDashboard';

  export default {
    name: 'AeAdminHomePage',
    components: { AeDashboard },
    setup() {
      const {
        dashboardTitle$,
        adminWelcomeTitle$,
        adminWelcomeSubtitle$,
        adminRecentActivityTitle$,
        adminRecentActivityEmpty$,
        adminQuickActionsTitle$,
        adminQuickAddUser$,
        adminQuickCreateGroup$,
        adminQuickCreateTraining$,
        adminQuickConfigureChannel$,
        adminQuickOpenSettings$,
        activityTypeUser$,
        activityTypeGroup$,
        activityTypeTraining$,
        dashUsersLabel$,
        dashUsersBreakdown$,
        dashChannelsLabel$,
        dashTrainingsLabel$,
        dashSessionsLabel$,
        coachesTitle$,
        classesTitle$,
      } = portalStrings;

      const { userFacilityId } = useAePermissions();
      const api = useTrainingApi();
      const loading = ref(true);
      const counts = ref({
        users: null,
        learners: null,
        coaches: null,
        classes: null,
        channels: null,
        trainings: null,
        sessions: null,
      });
      const usersRaw = ref([]);
      const classroomsRaw = ref([]);
      const trainingsRaw = ref([]);

      const summaryCards = computed(() => {
        const { users, learners, coaches, classes, channels, trainings, sessions } = counts.value;
        const hasBreakdown = typeof learners === 'number' && typeof coaches === 'number';
        return [
          {
            id: 'users',
            value: users,
            label: dashUsersLabel$(),
            detail: hasBreakdown ? dashUsersBreakdown$({ learners, coaches }) : '',
            icon: 'people',
            tone: 'orange',
          },
          { id: 'classes', value: classes, label: classesTitle$(), icon: 'people', tone: 'purple' },
          {
            id: 'trainings',
            value: trainings,
            label: dashTrainingsLabel$(),
            icon: 'lesson',
            tone: 'orange',
          },
          {
            id: 'channels',
            value: channels,
            label: dashChannelsLabel$(),
            icon: 'channel',
            tone: 'blue',
          },
          {
            id: 'sessions',
            value: sessions,
            label: dashSessionsLabel$(),
            icon: 'classes',
            tone: 'indigo',
          },
          { id: 'coaches', value: coaches, label: coachesTitle$(), icon: 'coach', tone: 'green' },
        ].filter(card => typeof card.value === 'number');
      });

      const activityItems = computed(() => {
        const users = usersRaw.value.slice(0, 3).map((user, index) => ({
          id: `user-${user.id || index}`,
          title: user.full_name || user.username,
          meta: user.username ? `${activityTypeUser$()} · ${user.username}` : activityTypeUser$(),
          icon: 'person',
          tone: 'orange',
          to: { name: 'AeAdminUsers' },
        }));
        const groups = classroomsRaw.value.slice(0, 2).map((classroom, index) => ({
          id: `class-${classroom.id || index}`,
          title: classroom.name,
          meta: activityTypeGroup$(),
          icon: 'people',
          tone: 'blue',
          to: { name: 'AeAdminClasses' },
        }));
        const trainings = trainingsRaw.value.slice(0, 2).map((training, index) => ({
          id: `training-${training.id || index}`,
          title: training.title || training.name || '',
          meta: activityTypeTraining$(),
          icon: 'lesson',
          tone: 'green',
          to: { name: 'AeAdminCourseDetail', params: { trainingId: training.id } },
        }));
        return [...users, ...groups, ...trainings].slice(0, 5);
      });

      const quickActions = [
        {
          id: 'add-user',
          icon: 'person',
          title: adminQuickAddUser$(),
          // Opens the users page with the create panel already open.
          to: { name: 'AeAdminUsers', query: { creer: '1' } },
        },
        {
          id: 'create-group',
          icon: 'people',
          title: adminQuickCreateGroup$(),
          to: { name: 'AeAdminClasses', query: { creer: '1' } },
        },
        {
          id: 'create-training',
          icon: 'lesson',
          title: adminQuickCreateTraining$(),
          // Admins create the courses, then assign each one to a trainer.
          to: { name: 'AeAdminCourses', query: { creer: '1' } },
        },
        {
          id: 'configure-channel',
          icon: 'channel',
          title: adminQuickConfigureChannel$(),
          to: { name: 'AeAdminContent' },
        },
      ];

      function isStaffUser(user) {
        return Boolean(
          (user.roles || []).find(
            role =>
              role.kind === UserKinds.COACH ||
              role.kind === UserKinds.ASSIGNABLE_COACH ||
              role.kind === UserKinds.ADMIN,
          ),
        );
      }

      function sortByNewest(list, dateKey) {
        return [...list].sort((a, b) => {
          const da = a[dateKey] ? new Date(a[dateKey]).getTime() : 0;
          const db = b[dateKey] ? new Date(b[dateKey]).getTime() : 0;
          return db - da;
        });
      }

      onMounted(() => {
        Promise.allSettled([
          FacilityUserResource.fetchCollection({
            getParams: { member_of: userFacilityId.value },
          }),
          ClassroomResource.fetchCollection({
            getParams: { facility: userFacilityId.value },
          }),
          ChannelResource.fetchCollection({ getParams: { available: true } }),
          api.fetchTrainings(),
          api.fetchSessions(),
        ]).then(results => {
          const users = results[0].status === 'fulfilled' ? results[0].value || [] : null;
          const classrooms = results[1].status === 'fulfilled' ? results[1].value || [] : null;
          const channelsRaw = results[2].status === 'fulfilled' ? results[2].value : null;
          const trainings = results[3].status === 'fulfilled' ? results[3].value || [] : null;
          const sessions = results[4].status === 'fulfilled' ? results[4].value || [] : null;

          let channelList = null;
          if (channelsRaw != null) {
            channelList = Array.isArray(channelsRaw)
              ? channelsRaw
              : (channelsRaw && channelsRaw.results) || [];
          }

          const staff = users ? users.filter(isStaffUser) : null;
          const learners = users ? users.filter(user => !isStaffUser(user)) : null;

          usersRaw.value = users ? sortByNewest(users, 'date_joined') : [];
          classroomsRaw.value = classrooms ? sortByNewest(classrooms, 'last_updated') : [];
          trainingsRaw.value = trainings ? sortByNewest(trainings, 'date_updated') : [];

          counts.value = {
            users: users ? users.length : null,
            learners: learners ? learners.length : null,
            coaches: staff ? staff.length : null,
            classes: classrooms ? classrooms.length : null,
            channels: channelList ? channelList.length : null,
            trainings: trainings ? trainings.length : null,
            sessions: sessions ? sessions.length : null,
          };
          loading.value = false;
        });
      });

      return {
        dashboardTitle$,
        adminWelcomeTitle$,
        adminWelcomeSubtitle$,
        adminRecentActivityTitle$,
        adminRecentActivityEmpty$,
        adminQuickActionsTitle$,
        adminQuickOpenSettings$,
        bannerSrc: urls.static('action_education_portal/ae-admin-banner.png'),
        loading,
        summaryCards,
        activityItems,
        quickActions,
      };
    },
  };

</script>
