<template>

  <AeDashboard
    :title="learnDashTitle$()"
    :welcomeTitle="welcomeTitle"
    :welcomeSubtitle="learnWelcomeSubtitle$()"
    :bannerSrc="bannerSrc"
    :loading="isLoading"
    :cards="cards"
    :activityTitle="resumeItems.length ? learnResumeTitle$() : learnDiscoverTitle$()"
    :activityTo="{ name: 'AeLearnFormations' }"
    :activityItems="activityItems"
    :activityEmpty="emptyFormationsLearner$()"
    :actionsTitle="adminQuickActionsTitle$()"
    :actions="quickActions"
    :footerLink="{ to: { name: 'AeLearnHelp' }, icon: 'help', label: learnHelpLink$() }"
  >
    <template #notice>
      <div
        v-if="loadError"
        class="ae-learn-home-notice"
        role="alert"
      >
        <p>{{ errorMessage }}</p>
        <button
          type="button"
          class="ae-learn-home-retry"
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
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';
  import { useTrainingApi } from '../../composables/useTrainingApi';
  import { useAsyncPageLoad } from '../../composables/useAsyncPageLoad';
  import AeDashboard from '../AeDashboard';

  const ACTIVITY_LIMIT = 5;

  /** Learner home: where they stand, the courses to pick up again, shortcuts. */
  export default {
    name: 'AeLearnHomePage',
    components: { AeDashboard },
    setup() {
      const {
        learnDashTitle$,
        greetingNamed$,
        greetingGeneric$,
        learnWelcomeSubtitle$,
        learnResumeTitle$,
        learnDiscoverTitle$,
        emptyFormationsLearner$,
        adminQuickActionsTitle$,
        learnHelpLink$,
        retryAction$,
        learnKpiActive$,
        learnKpiCompleted$,
        learnKpiQuizzesPassed$,
        learnKpiCertificates$,
        learnResumeMeta$,
        learnCourseStatusNew$,
        myCourses$,
        myQuizzes$,
        libraryTitle$,
        progressTitle$,
        loadError$,
        loadTimeout$,
      } = portalStrings;

      const { displayName } = useAePermissions();
      const api = useTrainingApi();
      const { isLoading, loadError, runLoad } = useAsyncPageLoad('isLoadingLearnerHome');

      const trainings = ref([]);
      const progress = ref([]);

      const errorMessage = computed(() => {
        if (!loadError.value) {
          return '';
        }
        return loadError.value.code === 'AE_REQUEST_TIMEOUT' ? loadTimeout$() : loadError$();
      });

      const welcomeTitle = computed(() =>
        displayName.value ? greetingNamed$({ name: displayName.value }) : greetingGeneric$(),
      );

      const rows = computed(() => {
        const byTraining = {};
        progress.value.forEach(row => {
          byTraining[row.training] = row;
        });
        // `course`, not `training`: progress rows already hold the course id there.
        return trainings.value.map(training => ({
          ...(byTraining[training.id] || { percent: 0 }),
          course: training,
        }));
      });

      const cards = computed(() => [
        {
          id: 'active',
          value: rows.value.filter(row => row.started && !row.completed).length,
          label: learnKpiActive$(),
          icon: 'lesson',
          tone: 'blue',
        },
        {
          id: 'completed',
          value: rows.value.filter(row => row.completed).length,
          label: learnKpiCompleted$(),
          icon: 'correct',
          tone: 'green',
        },
        {
          id: 'quizzes',
          value: rows.value.reduce((total, row) => total + (row.quizzes_passed || 0), 0),
          label: learnKpiQuizzesPassed$(),
          icon: 'quiz',
          tone: 'purple',
        },
        {
          id: 'certificates',
          value: rows.value.filter(row => row.certificate_number).length,
          label: learnKpiCertificates$(),
          icon: 'star',
          tone: 'yellow',
        },
      ]);

      const courseRoute = training => ({
        name: 'AeLearnCourseDetail',
        params: { trainingId: training.id },
      });

      // Courses started and not finished, the latest first.
      const resumeItems = computed(() =>
        rows.value
          .filter(row => row.started && !row.completed)
          .sort((a, b) => new Date(b.last_activity || 0) - new Date(a.last_activity || 0))
          .slice(0, ACTIVITY_LIMIT)
          .map(row => ({
            id: row.course.id,
            title: row.course.title,
            meta: learnResumeMeta$({ percent: row.percent }),
            icon: 'lesson',
            tone: 'blue',
            to: courseRoute(row.course),
          })),
      );

      // Nothing to resume: the courses not started yet.
      const activityItems = computed(() => {
        if (resumeItems.value.length) {
          return resumeItems.value;
        }
        return rows.value
          .filter(row => !row.started)
          .slice(0, ACTIVITY_LIMIT)
          .map(row => ({
            id: row.course.id,
            title: row.course.title,
            meta: learnCourseStatusNew$(),
            icon: 'lesson',
            tone: 'green',
            to: courseRoute(row.course),
          }));
      });

      const quickActions = [
        { id: 'courses', icon: 'lesson', title: myCourses$(), to: { name: 'AeLearnFormations' } },
        { id: 'quizzes', icon: 'quiz', title: myQuizzes$(), to: { name: 'AeLearnQuizzes' } },
        { id: 'library', icon: 'library', title: libraryTitle$(), to: { name: 'AeLearnLibrary' } },
        {
          id: 'progress',
          icon: 'inProgress',
          title: progressTitle$(),
          to: { name: 'AeLearnProgress' },
        },
      ];

      async function refresh() {
        try {
          await runLoad(async () => {
            const [list, mine] = await Promise.all([
              api.fetchTrainings(),
              api.fetchMyProgress().catch(() => []),
            ]);
            trainings.value = (list || []).filter(training => training.status === 'published');
            progress.value = mine || [];
          });
        } catch (e) {
          // loadError is set by runLoad.
        }
      }

      onMounted(refresh);

      return {
        learnDashTitle$,
        learnWelcomeSubtitle$,
        learnResumeTitle$,
        learnDiscoverTitle$,
        emptyFormationsLearner$,
        adminQuickActionsTitle$,
        learnHelpLink$,
        retryAction$,
        bannerSrc: urls.static('action_education_portal/ae-admin-banner.png'),
        welcomeTitle,
        isLoading,
        loadError,
        errorMessage,
        cards,
        resumeItems,
        activityItems,
        quickActions,
        refresh,
      };
    },
  };

</script>


<style lang="scss" scoped>

  @import '../../styles/components';

  .ae-learn-home-notice {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 20px;
    align-items: center;
    padding: 14px 18px;
    margin: 0;
    color: var(--ae-danger);
    background: var(--ae-danger-soft);
    border-radius: var(--ae-radius-md);

    p {
      margin: 0;
      font-weight: 700;
    }
  }

  .ae-learn-home-retry {
    @include ae-button-outline;
  }

</style>
