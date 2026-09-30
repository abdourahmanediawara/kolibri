<template>

  <AeDashboard
    :title="coachDashTitle$()"
    :welcomeTitle="coachWelcomeTitle$()"
    :welcomeSubtitle="coachWelcomeSubtitle$()"
    :bannerSrc="bannerSrc"
    :loading="canManageSessions && isLoadingDashboard"
    :cards="canManageSessions ? summaryCards : []"
    :activityTitle="upcomingSessions.length ? upcomingSessionsTitle$() : recentSessionsTitle$()"
    :activityTo="{ name: 'AeCoachSessions' }"
    :activityItems="sessionItems"
    :activityEmpty="upcomingSessionsEmpty$()"
    :actionsTitle="adminQuickActionsTitle$()"
    :actions="quickActions"
    :footerLink="{ to: { name: 'AeCoachLibrary' }, icon: 'library', label: coachOpenLibrary$() }"
  >
    <template #notice>
      <p
        v-if="!canManageSessions"
        class="ae-coach-home-notice"
        role="alert"
      >
        {{ trainerStaffOnly$() }}
      </p>
      <div
        v-else-if="loadError"
        class="ae-coach-home-notice"
        role="alert"
      >
        <p>{{ errorMessage }}</p>
        <button
          type="button"
          class="ae-coach-home-retry"
          @click="refresh"
        >
          {{ retryAction$() }}
        </button>
      </div>
    </template>
  </AeDashboard>

</template>


<script>

  import { computed, onMounted, ref } from 'vue';
  import urls from 'kolibri/urls';
  import { currentLanguage } from 'kolibri/utils/i18n';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';
  import { useTrainingApi } from '../../composables/useTrainingApi';
  import { useClassroomApi } from '../../composables/useClassroomApi';
  import { useAsyncPageLoad } from '../../composables/useAsyncPageLoad';
  import AeDashboard from '../AeDashboard';

  const SESSIONS_LIMIT = 5;

  export default {
    name: 'AeCoachHomePage',
    components: { AeDashboard },
    setup() {
      const {
        coachDashTitle$,
        coachWelcomeTitle$,
        coachWelcomeSubtitle$,
        trainerStaffOnly$,
        myClasses$,
        myLearners$,
        myCourses$,
        dashSessionsLabel$,
        dashEnrollmentsLabel$,
        dashAttendanceLabel$,
        upcomingSessionsCount$,
        upcomingSessionsTitle$,
        recentSessionsTitle$,
        upcomingSessionsEmpty$,
        adminQuickActionsTitle$,
        createSessionShortcut$,
        coachQuickMyCourses$,
        addLearnerTitle$,
        coachQuickResults$,
        coachOpenLibrary$,
        loadTimeout$,
        loadError$,
        retryAction$,
      } = portalStrings;

      const { canManageSessions, userFacilityId } = useAePermissions();
      const api = useTrainingApi();
      const classroomApi = useClassroomApi();
      const {
        isLoading: isLoadingDashboard,
        loadError,
        runLoad,
      } = useAsyncPageLoad('isLoadingDashboard');

      // null: that count could not be loaded, so its card is hidden.
      const counts = ref({
        classes: null,
        learners: null,
        trainings: null,
        sessions: null,
        enrollments: null,
        attendance: null,
      });
      const sessions = ref([]);
      const trainingTitles = ref({});

      const errorMessage = computed(() => {
        if (!loadError.value) {
          return '';
        }
        if (loadError.value.code === 'AE_REQUEST_TIMEOUT') {
          return loadTimeout$();
        }
        return loadError$();
      });

      const upcomingSessions = computed(() => {
        const now = Date.now();
        return sessions.value
          .filter(session => new Date(session.start_datetime).getTime() >= now)
          .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));
      });

      const summaryCards = computed(() => {
        const { classes, learners, trainings, enrollments, attendance } = counts.value;
        return [
          { id: 'classes', value: classes, label: myClasses$(), icon: 'classes', tone: 'purple' },
          { id: 'learners', value: learners, label: myLearners$(), icon: 'people', tone: 'orange' },
          { id: 'courses', value: trainings, label: myCourses$(), icon: 'lesson', tone: 'yellow' },
          {
            id: 'sessions',
            value: counts.value.sessions,
            label: dashSessionsLabel$(),
            detail: upcomingSessionsCount$({ count: upcomingSessions.value.length }),
            icon: 'schedule',
            tone: 'blue',
          },
          {
            id: 'enrollments',
            value: enrollments,
            label: dashEnrollmentsLabel$(),
            icon: 'person',
            tone: 'mint',
          },
          {
            id: 'attendance',
            value: attendance,
            label: dashAttendanceLabel$(),
            icon: 'correct',
            tone: 'green',
          },
        ].filter(card => typeof card.value === 'number');
      });

      const whenFormat = new Intl.DateTimeFormat(currentLanguage, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      });

      // The next sessions, or the last ones when none is planned.
      const shownSessions = computed(() => {
        if (upcomingSessions.value.length) {
          return upcomingSessions.value;
        }
        return [...sessions.value].sort(
          (a, b) => new Date(b.start_datetime) - new Date(a.start_datetime),
        );
      });

      const sessionItems = computed(() =>
        shownSessions.value.slice(0, SESSIONS_LIMIT).map(session => ({
          id: session.id,
          title: trainingTitles.value[session.training] || '',
          meta: [whenFormat.format(new Date(session.start_datetime)), session.location]
            .filter(Boolean)
            .join(' · '),
          icon: 'schedule',
          tone: 'blue',
          to: { name: 'AeCoachSessionDetail', params: { sessionId: session.id } },
        })),
      );

      // The create panels of the other pages open straight away (?creer=1).
      const quickActions = [
        {
          id: 'create-session',
          icon: 'schedule',
          title: createSessionShortcut$(),
          to: { name: 'AeCoachSessions', query: { creer: '1' } },
        },
        {
          id: 'my-courses',
          icon: 'lesson',
          title: coachQuickMyCourses$(),
          to: { name: 'AeCoachFormations' },
        },
        {
          id: 'add-learner',
          icon: 'person',
          title: addLearnerTitle$(),
          to: { name: 'AeCoachLearners', query: { creer: '1' } },
        },
        {
          id: 'results',
          icon: 'reports',
          title: coachQuickResults$(),
          to: { name: 'AeCoachResults' },
        },
      ];

      async function refresh() {
        if (!canManageSessions.value) {
          isLoadingDashboard.value = false;
          return;
        }
        try {
          await runLoad(async () => {
            const results = await Promise.allSettled([
              api.fetchTrainings(),
              api.fetchSessions(),
              api.fetchEnrollments(),
              api.fetchAttendances(),
              classroomApi.fetchClassrooms(userFacilityId.value),
            ]);
            const valueOf = result => (result.status === 'fulfilled' ? result.value || [] : null);
            const [trainings, sessionList, enrollments, attendance, classrooms] =
              results.map(valueOf);
            const titles = {};
            (trainings || []).forEach(training => {
              titles[training.id] = training.title;
            });
            trainingTitles.value = titles;
            sessions.value = sessionList || [];
            counts.value = {
              classes: classrooms ? classrooms.length : null,
              learners: classrooms
                ? classrooms.reduce((sum, classroom) => sum + (classroom.learner_count || 0), 0)
                : null,
              trainings: trainings ? trainings.length : null,
              sessions: sessionList ? sessionList.length : null,
              enrollments: enrollments ? enrollments.length : null,
              attendance: attendance ? attendance.length : null,
            };
            if (results.every(result => result.status === 'rejected')) {
              throw results[0].reason || new Error('All dashboard requests failed');
            }
          });
        } catch (e) {
          // loadError is set by runLoad.
        }
      }

      onMounted(refresh);

      return {
        coachDashTitle$,
        coachWelcomeTitle$,
        coachWelcomeSubtitle$,
        trainerStaffOnly$,
        upcomingSessionsTitle$,
        recentSessionsTitle$,
        upcomingSessionsEmpty$,
        adminQuickActionsTitle$,
        coachOpenLibrary$,
        retryAction$,
        bannerSrc: urls.static('action_education_portal/ae-admin-banner.png'),
        canManageSessions,
        isLoadingDashboard,
        loadError,
        errorMessage,
        summaryCards,
        upcomingSessions,
        sessionItems,
        quickActions,
        refresh,
      };
    },
  };

</script>


<style lang="scss" scoped>

  @import '../../styles/components';

  .ae-coach-home-notice {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 20px;
    align-items: center;
    padding: 14px 18px;
    margin: 0;
    font-weight: 600;
    color: var(--ae-danger);
    background: var(--ae-danger-soft);
    border-radius: var(--ae-radius-md);

    p {
      margin: 0;
    }
  }

  .ae-coach-home-retry {
    @include ae-button-outline;
  }

</style>
