<template>
  <div
    class="ae-page"
    :style="{ color: $themeTokens.text }"
  >
    <h1 class="title">
      {{ coachDashTitle$() }}
    </h1>

    <p
      v-if="!canManageSessions"
      role="alert"
    >
      {{ trainerStaffOnly$() }}
    </p>

    <template v-else>
      <p
        class="intro"
        :style="{ color: $themeTokens.annotation }"
      >
        {{ trainerDashIntro$() }}
      </p>

      <KCircularLoader
        v-if="loading"
        :delay="false"
      />

      <div
        v-else
        class="cards"
      >
        <div
          v-for="card in summaryCards"
          :key="card.id"
          class="card"
          :style="{
            backgroundColor: $themeTokens.surface,
            borderColor: $themeTokens.fineLine,
          }"
        >
          <p class="card-value">
            {{ card.value }}
          </p>
          <p class="card-label">
            {{ card.label }}
          </p>
        </div>
      </div>

      <section class="shortcuts">
        <router-link
          v-for="link in shortcutLinks"
          :key="link.id"
          :to="link.to"
          class="shortcut"
          :style="{
            backgroundColor: $themeTokens.surface,
            borderColor: $themeTokens.fineLine,
            color: $themeTokens.text,
          }"
        >
          {{ link.label }}
        </router-link>
      </section>

      <p class="preview">
        <router-link
          to="/ae/learn"
          :style="{ color: $themeTokens.primary }"
        >
          {{ previewLearner$() }}
        </router-link>
      </p>
    </template>
  </div>
</template>

<script>
  import { computed, onMounted, ref } from 'vue';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';
  import { useTrainingApi } from '../../composables/useTrainingApi';

  export default {
    name: 'AeCoachHomePage',
    setup() {
      const {
        coachDashTitle$,
        trainerDashIntro$,
        trainerStaffOnly$,
        dashTrainingsLabel$,
        dashSessionsLabel$,
        dashEnrollmentsLabel$,
        dashAttendanceLabel$,
        createSessionShortcut$,
        viewLearnersShortcut$,
        resultsTitle$,
        previewLearner$,
      } = portalStrings;

      const { canManageSessions } = useAePermissions();
      const api = useTrainingApi();
      const loading = ref(true);
      const counts = ref({ trainings: 0, sessions: 0, enrollments: 0, attendance: 0 });

      const summaryCards = computed(() =>
        [
          { id: 't', value: counts.value.trainings, label: dashTrainingsLabel$() },
          { id: 's', value: counts.value.sessions, label: dashSessionsLabel$() },
          { id: 'e', value: counts.value.enrollments, label: dashEnrollmentsLabel$() },
          { id: 'a', value: counts.value.attendance, label: dashAttendanceLabel$() },
        ].filter(card => typeof card.value === 'number' && card.value > 0),
      );

      const shortcutLinks = computed(() => [
        {
          id: 'sessions',
          label: createSessionShortcut$(),
          to: { name: 'AeCoachSessions' },
        },
        {
          id: 'learners',
          label: viewLearnersShortcut$(),
          to: { name: 'AeCoachLearners' },
        },
        {
          id: 'results',
          label: resultsTitle$(),
          to: { name: 'AeCoachResults' },
        },
      ]);

      onMounted(() => {
        if (!canManageSessions.value) {
          loading.value = false;
          return;
        }
        Promise.allSettled([
          api.fetchTrainings(),
          api.fetchSessions(),
          api.fetchEnrollments(),
          api.fetchAttendances(),
        ]).then(results => {
          const valueOf = (result, fallback = []) =>
            result.status === 'fulfilled' ? result.value || fallback : fallback;
          const trainings = valueOf(results[0]);
          const sessions = valueOf(results[1]);
          const enrollments = valueOf(results[2]);
          const attendance = valueOf(results[3]);
          counts.value = {
            trainings: trainings.length,
            sessions: sessions.length,
            enrollments: enrollments.length,
            attendance: attendance.length,
          };
          loading.value = false;
        });
      });

      return {
        coachDashTitle$,
        trainerDashIntro$,
        trainerStaffOnly$,
        previewLearner$,
        canManageSessions,
        loading,
        summaryCards,
        shortcutLinks,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .ae-page {
    max-width: 900px;
    margin: 0 auto;
  }

  .title {
    margin: 0 0 8px;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .intro {
    margin: 0 0 16px;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
    margin-bottom: 20px;
  }

  .card {
    padding: 16px;
    border: 1px solid;
    border-radius: 8px;
  }

  .card-value {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
  }

  .card-label {
    margin: 4px 0 0;
    font-weight: 600;
  }

  .shortcuts {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 16px;
  }

  .shortcut {
    min-height: 44px;
    padding: 12px 16px;
    font-weight: 600;
    text-decoration: none;
    border: 1px solid;
    border-radius: 8px;
  }

  .preview {
    margin: 0;
  }
</style>
