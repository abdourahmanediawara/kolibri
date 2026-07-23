<template>
  <AppBarPage :title="reportsTitle$()">
    <KPageContainer>
      <div
        class="reports-page"
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
            {{ reportsIntro$() }}
          </p>

          <KCircularLoader
            v-if="loading"
            :delay="false"
          />

          <template v-else>
            <section
              class="block"
              :style="{
                backgroundColor: $themeTokens.surface,
                borderColor: $themeTokens.fineLine,
              }"
            >
              <h2 class="section-title">
                {{ exportCertificatesTitle$() }}
              </h2>
              <p :style="{ color: $themeTokens.annotation }">
                {{ exportCertificatesDesc$() }}
              </p>
              <KButton
                :text="downloadCsvAction$()"
                :primary="true"
                :href="certificatesCsvHref"
              />
            </section>

            <section
              class="block"
              :style="{
                backgroundColor: $themeTokens.surface,
                borderColor: $themeTokens.fineLine,
              }"
            >
              <h2 class="section-title">
                {{ exportAttendanceTitle$() }}
              </h2>
              <p
                v-if="!sessions.length"
                :style="{ color: $themeTokens.annotation }"
              >
                {{ sessionsEmpty$() }}
              </p>
              <ul
                v-else
                class="list"
              >
                <li
                  v-for="session in sessions"
                  :key="session.id"
                  class="row"
                >
                  <div>
                    <p class="row-title">
                      {{ session.title }}
                    </p>
                    <p :style="{ color: $themeTokens.annotation }">
                      {{ session.meta }}
                    </p>
                  </div>
                  <KButton
                    :text="downloadCsvAction$()"
                    appearance="raised-button"
                    :href="session.exportHref"
                  />
                </li>
              </ul>
            </section>

            <section
              class="block"
              :style="{
                backgroundColor: $themeTokens.surface,
                borderColor: $themeTokens.fineLine,
              }"
            >
              <h2 class="section-title">
                {{ exportEnrollmentsTitle$() }}
              </h2>
              <p
                v-if="!trainings.length"
                :style="{ color: $themeTokens.annotation }"
              >
                {{ trainingsEmpty$() }}
              </p>
              <ul
                v-else
                class="list"
              >
                <li
                  v-for="training in trainings"
                  :key="training.id"
                  class="row"
                >
                  <p class="row-title">
                    {{ training.title }}
                  </p>
                  <KButton
                    :text="downloadCsvAction$()"
                    appearance="raised-button"
                    :href="training.exportHref"
                  />
                </li>
              </ul>
            </section>
          </template>
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
    name: 'ReportsPage',
    components: {
      AppBarPage,
    },
    setup() {
      const {
        reportsTitle$,
        reportsIntro$,
        trainerStaffOnly$,
        exportCertificatesTitle$,
        exportCertificatesDesc$,
        exportAttendanceTitle$,
        exportEnrollmentsTitle$,
        downloadCsvAction$,
        sessionsEmpty$,
        trainingsEmpty$,
        backHome$,
      } = portalStrings;

      const { isCoach, isAdmin, isSuperuser } = useUser();
      const api = useTrainingApi();
      const canManage = computed(
        () => isCoach.value || isAdmin.value || isSuperuser.value,
      );
      const loading = ref(true);
      const sessions = ref([]);
      const trainings = ref([]);

      const homeHref = computed(() => urls['kolibri:action_education_portal:portal']());
      const certificatesCsvHref = computed(() => api.certificatesExportUrl());

      onMounted(() => {
        if (!canManage.value) {
          loading.value = false;
          return;
        }
        Promise.all([api.fetchTrainings(), api.fetchSessions()])
          .then(([trainingList, sessionList]) => {
            const map = {};
            (trainingList || []).forEach(t => {
              map[t.id] = t;
            });
            trainings.value = (trainingList || []).map(t => ({
              id: t.id,
              title: t.title,
              exportHref: api.enrollmentsExportUrl(t.id),
            }));
            sessions.value = (sessionList || []).map(s => ({
              id: s.id,
              title: (map[s.training] && map[s.training].title) || s.training,
              meta: [s.location, String(s.start_datetime || '').slice(0, 19)]
                .filter(Boolean)
                .join(' · '),
              exportHref: api.attendanceExportUrl(s.id),
            }));
          })
          .finally(() => {
            loading.value = false;
          });
      });

      return {
        reportsTitle$,
        reportsIntro$,
        trainerStaffOnly$,
        exportCertificatesTitle$,
        exportCertificatesDesc$,
        exportAttendanceTitle$,
        exportEnrollmentsTitle$,
        downloadCsvAction$,
        sessionsEmpty$,
        trainingsEmpty$,
        backHome$,
        canManage,
        loading,
        sessions,
        trainings,
        homeHref,
        certificatesCsvHref,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .reports-page {
    max-width: 880px;
    margin: 0 auto;
    padding: 16px 8px 32px;
  }

  .intro {
    margin: 0 0 16px;
  }

  .block {
    margin-bottom: 16px;
    padding: 16px;
    border: 1px solid;
    border-radius: 8px;
  }

  .section-title,
  .row-title {
    margin: 0 0 8px;
    font-weight: 600;
  }

  .list {
    margin: 12px 0 0;
    padding: 0;
    list-style: none;
  }

  .row {
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
