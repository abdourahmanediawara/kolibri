<template>
  <AppBarPage :title="trainerSessionsTitle$()">
    <KPageContainer>
      <div
        class="trainer-page"
        :style="{ color: $themeTokens.text }"
      >
        <p
          class="intro"
          :style="{ color: $themeTokens.annotation }"
        >
          {{ trainerSessionsIntro$() }}
        </p>

        <p
          v-if="!canManage"
          role="alert"
        >
          {{ trainerStaffOnly$() }}
        </p>

        <template v-else>
          <section
            class="create-card"
            :style="{
              backgroundColor: $themeTokens.surface,
              borderColor: $themeTokens.fineLine,
            }"
          >
            <h2 class="section-title">
              {{ createSessionTitle$() }}
            </h2>
            <KTextbox
              v-model="form.title"
              :label="trainingTitleLabel$()"
              :floatingLabel="false"
              autocomplete="off"
            />
            <KTextbox
              v-model="form.location"
              :label="locationLabel$()"
              :floatingLabel="false"
              autocomplete="off"
            />
            <KTextbox
              v-model="form.startLocal"
              :label="startLabel$()"
              :floatingLabel="false"
              autocomplete="off"
              :invalid="Boolean(formError)"
              :invalidText="formError"
            />
            <p
              class="hint"
              :style="{ color: $themeTokens.annotation }"
            >
              {{ startHint$() }}
            </p>
            <KButton
              :text="createSessionAction$()"
              :primary="true"
              :disabled="saving"
              @click="createSession"
            />
            <p
              v-if="saveMessage"
              role="status"
            >
              {{ saveMessage }}
            </p>
          </section>

          <KCircularLoader
            v-if="loading"
            :delay="false"
          />

          <p
            v-else-if="!sessions.length"
            :style="{ color: $themeTokens.annotation }"
          >
            {{ sessionsEmpty$() }}
          </p>

          <ul
            v-else
            class="session-list"
          >
            <li
              v-for="session in sessions"
              :key="session.id"
              class="session-item"
              :style="{
                backgroundColor: $themeTokens.surface,
                borderColor: $themeTokens.fineLine,
              }"
            >
              <div>
                <p class="session-title">
                  {{ trainingTitle(session) }}
                </p>
                <p :style="{ color: $themeTokens.annotation }">
                  {{ sessionMeta(session) }}
                </p>
              </div>
              <KButton
                :text="takeAttendanceAction$()"
                :primary="true"
                :href="attendanceHref(session.id)"
              />
            </li>
          </ul>
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
  import { computed, onMounted, reactive, ref } from 'vue';
  import urls from 'kolibri/urls';
  import useUser from 'kolibri/composables/useUser';
  import AppBarPage from 'kolibri/components/pages/AppBarPage';
  import { portalStrings } from '../strings';
  import { useTrainingApi } from '../composables/useTrainingApi';

  export default {
    name: 'TrainerSessionsPage',
    components: {
      AppBarPage,
    },
    setup() {
      const {
        trainerSessionsTitle$,
        trainerSessionsIntro$,
        trainerStaffOnly$,
        createSessionTitle$,
        trainingTitleLabel$,
        locationLabel$,
        startLabel$,
        startHint$,
        createSessionAction$,
        sessionsEmpty$,
        takeAttendanceAction$,
        backHome$,
        saveSuccess$,
        saveError$,
      } = portalStrings;

      const { isCoach, isAdmin, isSuperuser, userFacilityId, currentUserId } = useUser();
      const api = useTrainingApi();

      const canManage = computed(
        () => isCoach.value || isAdmin.value || isSuperuser.value,
      );
      const loading = ref(true);
      const saving = ref(false);
      const sessions = ref([]);
      const trainingsById = ref({});
      const formError = ref('');
      const saveMessage = ref('');
      const form = reactive({
        title: '',
        location: '',
        startLocal: '',
      });

      const homeHref = computed(() => urls['kolibri:action_education_portal:portal']());
      const portalBase = computed(() => urls['kolibri:action_education_portal:portal']());

      function attendanceHref(sessionId) {
        return `${portalBase.value}#/trainer/sessions/${sessionId}`;
      }

      function trainingTitle(session) {
        const training = trainingsById.value[session.training];
        return (training && training.title) || session.training;
      }

      function sessionMeta(session) {
        const parts = [];
        if (session.location) {
          parts.push(session.location);
        }
        if (session.start_datetime) {
          parts.push(String(session.start_datetime).slice(0, 19));
        }
        return parts.join(' · ');
      }

      function defaultStartLocal() {
        const d = new Date();
        d.setMinutes(0, 0, 0);
        d.setHours(d.getHours() + 1);
        const pad = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
          d.getHours(),
        )}:${pad(d.getMinutes())}`;
      }

      function parseLocalToIso(value) {
        // Expect YYYY-MM-DDTHH:MM from the text field.
        const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value || '');
        if (!match) {
          return null;
        }
        const [, y, m, day, h, min] = match;
        const dt = new Date(
          Number(y),
          Number(m) - 1,
          Number(day),
          Number(h),
          Number(min),
        );
        if (Number.isNaN(dt.getTime())) {
          return null;
        }
        return dt.toISOString();
      }

      function refresh() {
        loading.value = true;
        return Promise.all([api.fetchTrainings(), api.fetchSessions()])
          .then(([trainings, sessionList]) => {
            const map = {};
            (trainings || []).forEach(t => {
              map[t.id] = t;
            });
            trainingsById.value = map;
            sessions.value = sessionList || [];
          })
          .finally(() => {
            loading.value = false;
          });
      }

      function createSession() {
        formError.value = '';
        saveMessage.value = '';
        if (!form.title.trim()) {
          formError.value = saveError$();
          return;
        }
        const startIso = parseLocalToIso(form.startLocal || defaultStartLocal());
        if (!startIso) {
          formError.value = startHint$();
          return;
        }
        const end = new Date(startIso);
        end.setHours(end.getHours() + 2);
        saving.value = true;
        api
          .createTraining({
            title: form.title.trim(),
            description: '',
            facility: userFacilityId.value,
            status: 'published',
            responsible: currentUserId.value,
          })
          .then(training =>
            api.createSession({
              training: training.id,
              start_datetime: startIso,
              end_datetime: end.toISOString(),
              location: form.location.trim(),
              trainer: currentUserId.value,
              status: 'scheduled',
              notes: '',
            }),
          )
          .then(() => {
            saveMessage.value = saveSuccess$();
            form.title = '';
            form.location = '';
            form.startLocal = defaultStartLocal();
            return refresh();
          })
          .catch(() => {
            formError.value = saveError$();
          })
          .finally(() => {
            saving.value = false;
          });
      }

      onMounted(() => {
        form.startLocal = defaultStartLocal();
        if (canManage.value) {
          refresh();
        } else {
          loading.value = false;
        }
      });

      return {
        trainerSessionsTitle$,
        trainerSessionsIntro$,
        trainerStaffOnly$,
        createSessionTitle$,
        trainingTitleLabel$,
        locationLabel$,
        startLabel$,
        startHint$,
        createSessionAction$,
        sessionsEmpty$,
        takeAttendanceAction$,
        backHome$,
        canManage,
        loading,
        saving,
        sessions,
        form,
        formError,
        saveMessage,
        homeHref,
        attendanceHref,
        trainingTitle,
        sessionMeta,
        createSession,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .trainer-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 16px 8px 32px;
  }

  .intro,
  .hint {
    margin: 0 0 16px;
    font-size: 1.05rem;
  }

  .create-card,
  .session-item {
    margin-bottom: 16px;
    padding: 16px;
    border: 1px solid;
    border-radius: 8px;
  }

  .section-title,
  .session-title {
    margin: 0 0 12px;
    font-size: 1.15rem;
    font-weight: 600;
  }

  .session-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .session-item {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
  }

  .back {
    margin-top: 24px;
  }
</style>
