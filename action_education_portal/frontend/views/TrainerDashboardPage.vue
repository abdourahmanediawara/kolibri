<template>
  <AppBarPage :title="trainerDashTitle$()">
    <KPageContainer>
      <div
        class="dash"
        :style="{ color: $themeTokens.text }"
      >
        <p
          v-if="!canManage"
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

          <section class="actions">
            <KButton
              :text="openSessionsAction$()"
              :primary="true"
              :href="sessionsHref"
            />
            <KButton
              :text="openCertificatesAction$()"
              appearance="raised-button"
              :href="certificatesHref"
            />
            <KButton
              :text="openReportsAction$()"
              appearance="raised-button"
              :href="reportsHref"
            />
            <KButton
              :text="openCoachAction$()"
              appearance="raised-button"
              :href="coachHref"
            />
          </section>

          <section
            v-if="todaySessions.length"
            class="today"
          >
            <h2 class="section-title">
              {{ todaySessionsTitle$() }}
            </h2>
            <ul class="list">
              <li
                v-for="session in todaySessions"
                :key="session.id"
                class="item"
                :style="{
                  backgroundColor: $themeTokens.surface,
                  borderColor: $themeTokens.fineLine,
                }"
              >
                <div>
                  <p class="item-title">
                    {{ session.title }}
                  </p>
                  <p :style="{ color: $themeTokens.annotation }">
                    {{ session.meta }}
                  </p>
                </div>
                <KButton
                  :text="takeAttendanceAction$()"
                  :primary="true"
                  :href="session.href"
                />
              </li>
            </ul>
          </section>

          <p
            v-else-if="!loading"
            :style="{ color: $themeTokens.annotation }"
          >
            {{ todaySessionsEmpty$() }}
          </p>
        </template>

        <p class="back">
          <KButton
            :text="backHome$()"
            appearance="basic-link"
            :href="homeHref"
          />
        </p>
      </div>
    </KPageContainer>
  </AppBarPage>
</template>

<script>
  import { computed, onMounted, ref } from 'vue';
  import urls from 'kolibri/urls';
  import useUser from 'kolibri/composables/useUser';
  import AppBarPage from 'kolibri/components/pages/AppBarPage';
  import { portalStrings } from '../strings';
  import { useTrainingApi } from '../composables/useTrainingApi';

  export default {
    name: 'TrainerDashboardPage',
    components: {
      AppBarPage,
    },
    setup() {
      const {
        trainerDashTitle$,
        trainerDashIntro$,
        trainerStaffOnly$,
        openSessionsAction$,
        openCertificatesAction$,
        openReportsAction$,
        openCoachAction$,
        todaySessionsTitle$,
        todaySessionsEmpty$,
        takeAttendanceAction$,
        backHome$,
        dashTrainingsLabel$,
        dashSessionsLabel$,
        dashEnrollmentsLabel$,
        dashAttendanceLabel$,
      } = portalStrings;

      const { isCoach, isAdmin, isSuperuser } = useUser();
      const api = useTrainingApi();
      const canManage = computed(
        () => isCoach.value || isAdmin.value || isSuperuser.value,
      );
      const loading = ref(true);
      const counts = ref({ trainings: 0, sessions: 0, enrollments: 0, attendance: 0 });
      const todaySessions = ref([]);

      const homeHref = computed(() => urls['kolibri:action_education_portal:portal']());
      const portalBase = computed(() => urls['kolibri:action_education_portal:portal']());
      const sessionsHref = computed(() => `${portalBase.value}#/trainer/sessions`);
      const certificatesHref = computed(() => `${portalBase.value}#/certificates`);
      const reportsHref = computed(() => `${portalBase.value}#/reports`);
      const coachHref = computed(() => urls['kolibri:kolibri.plugins.coach:coach']());

      const summaryCards = computed(() => [
        { id: 't', value: counts.value.trainings, label: dashTrainingsLabel$() },
        { id: 's', value: counts.value.sessions, label: dashSessionsLabel$() },
        { id: 'e', value: counts.value.enrollments, label: dashEnrollmentsLabel$() },
        { id: 'a', value: counts.value.attendance, label: dashAttendanceLabel$() },
      ]);

      function isToday(stamp) {
        if (!stamp) {
          return false;
        }
        const raw = String(stamp).slice(0, 10);
        const today = new Date();
        const pad = n => String(n).padStart(2, '0');
        const key = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(
          today.getDate(),
        )}`;
        return raw === key;
      }

      onMounted(() => {
        if (!canManage.value) {
          loading.value = false;
          return;
        }
        Promise.all([
          api.fetchTrainings(),
          api.fetchSessions(),
          api.fetchEnrollments(),
          api.fetchAttendances(),
        ])
          .then(([trainings, sessions, enrollments, attendance]) => {
            const trainingMap = {};
            (trainings || []).forEach(t => {
              trainingMap[t.id] = t;
            });
            counts.value = {
              trainings: (trainings || []).length,
              sessions: (sessions || []).length,
              enrollments: (enrollments || []).length,
              attendance: (attendance || []).length,
            };
            todaySessions.value = (sessions || [])
              .filter(s => isToday(s.start_datetime))
              .map(s => ({
                id: s.id,
                title: (trainingMap[s.training] && trainingMap[s.training].title) || s.training,
                meta: [s.location, String(s.start_datetime || '').slice(0, 19)]
                  .filter(Boolean)
                  .join(' · '),
                href: `${portalBase.value}#/trainer/sessions/${s.id}`,
              }));
          })
          .finally(() => {
            loading.value = false;
          });
      });

      return {
        trainerDashTitle$,
        trainerDashIntro$,
        trainerStaffOnly$,
        openSessionsAction$,
        openCertificatesAction$,
        openReportsAction$,
        openCoachAction$,
        todaySessionsTitle$,
        todaySessionsEmpty$,
        takeAttendanceAction$,
        backHome$,
        canManage,
        loading,
        summaryCards,
        todaySessions,
        homeHref,
        sessionsHref,
        certificatesHref,
        reportsHref,
        coachHref,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .dash {
    max-width: 900px;
    margin: 0 auto;
    padding: 16px 8px 32px;
  }

  .intro {
    margin: 0 0 16px;
    font-size: 1.05rem;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
    margin-bottom: 20px;
  }

  .card,
  .item {
    padding: 16px;
    border: 1px solid;
    border-radius: 8px;
  }

  .card-value {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
  }

  .card-label,
  .section-title,
  .item-title {
    margin: 4px 0 0;
    font-weight: 600;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 24px;
  }

  .list {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .item {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .back {
    margin-top: 24px;
  }
</style>
