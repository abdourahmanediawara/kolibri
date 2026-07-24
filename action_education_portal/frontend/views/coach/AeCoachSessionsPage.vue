<template>
  <div
    class="ae-page"
    :style="{ color: $themeTokens.text }"
  >
    <h1 class="title">
      {{ trainerSessionsTitle$() }}
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
        {{ trainerSessionsIntro$() }}
      </p>

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
          :invalid="Boolean(formError) && !form.title.trim()"
          :invalidText="formError"
        />
        <KTextbox
          v-model="form.location"
          :label="locationLabel$()"
          :floatingLabel="false"
          autocomplete="off"
        />
        <div class="datetime-row">
          <label class="field">
            <span class="field-label">{{ dateLabel$() }}</span>
            <input
              v-model="form.date"
              class="native-input"
              type="date"
              required
              :style="{
                borderColor: $themeTokens.fineLine,
                color: $themeTokens.text,
                backgroundColor: $themeTokens.surface,
              }"
            >
          </label>
          <label class="field">
            <span class="field-label">{{ timeLabel$() }}</span>
            <input
              v-model="form.time"
              class="native-input"
              type="time"
              required
              :style="{
                borderColor: $themeTokens.fineLine,
                color: $themeTokens.text,
                backgroundColor: $themeTokens.surface,
              }"
            >
          </label>
        </div>
        <p
          v-if="formError"
          class="hint"
          role="alert"
          :style="{ color: $themeTokens.error }"
        >
          {{ formError }}
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
          <router-link
            :to="{ name: 'AeCoachSessionDetail', params: { sessionId: session.id } }"
            class="attendance-link"
            :style="{ color: $themeTokens.primary }"
          >
            {{ openSessionAction$() }}
          </router-link>
        </li>
      </ul>
    </template>
  </div>
</template>

<script>
  import { onMounted, reactive, ref } from 'vue';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';
  import { useTrainingApi } from '../../composables/useTrainingApi';

  export default {
    name: 'AeCoachSessionsPage',
    setup() {
      const {
        trainerSessionsTitle$,
        trainerSessionsIntro$,
        trainerStaffOnly$,
        createSessionTitle$,
        trainingTitleLabel$,
        locationLabel$,
        dateLabel$,
        timeLabel$,
        createSessionAction$,
        sessionsEmpty$,
        openSessionAction$,
        saveSuccess$,
        saveError$,
        sessionDateRequired$,
        sessionStatusScheduled$,
        sessionStatusInProgress$,
        sessionStatusCompleted$,
        sessionStatusCancelled$,
      } = portalStrings;

      const { canManageSessions, currentUserId, userFacilityId } = useAePermissions();
      const api = useTrainingApi();

      const loading = ref(true);
      const saving = ref(false);
      const sessions = ref([]);
      const trainingsById = ref({});
      const formError = ref('');
      const saveMessage = ref('');
      const form = reactive({
        title: '',
        location: '',
        date: '',
        time: '',
      });

      function pad(n) {
        return String(n).padStart(2, '0');
      }

      function defaultDateTime() {
        const d = new Date();
        d.setMinutes(0, 0, 0);
        d.setHours(d.getHours() + 1);
        return {
          date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
          time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
        };
      }

      function trainingTitle(session) {
        const training = trainingsById.value[session.training];
        return (training && training.title) || session.training;
      }

      function statusLabel(status) {
        if (status === 'in_progress') {
          return sessionStatusInProgress$();
        }
        if (status === 'completed') {
          return sessionStatusCompleted$();
        }
        if (status === 'cancelled') {
          return sessionStatusCancelled$();
        }
        return sessionStatusScheduled$();
      }

      function formatWhen(iso) {
        if (!iso) {
          return '';
        }
        const dt = new Date(iso);
        if (Number.isNaN(dt.getTime())) {
          return String(iso);
        }
        return dt.toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }

      function sessionMeta(session) {
        const parts = [];
        const when = formatWhen(session.start_datetime);
        if (when) {
          parts.push(when);
        }
        if (session.location) {
          parts.push(session.location);
        }
        if (session.status) {
          parts.push(statusLabel(session.status));
        }
        return parts.join(' · ');
      }

      function parseDateTimeToIso(date, time) {
        if (!date || !time) {
          return null;
        }
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
        const timeMatch = /^(\d{2}):(\d{2})$/.exec(time);
        if (!match || !timeMatch) {
          return null;
        }
        const dt = new Date(
          Number(match[1]),
          Number(match[2]) - 1,
          Number(match[3]),
          Number(timeMatch[1]),
          Number(timeMatch[2]),
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
        const startIso = parseDateTimeToIso(form.date, form.time);
        if (!startIso) {
          formError.value = sessionDateRequired$();
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
            const defaults = defaultDateTime();
            form.date = defaults.date;
            form.time = defaults.time;
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
        const defaults = defaultDateTime();
        form.date = defaults.date;
        form.time = defaults.time;
        if (canManageSessions.value) {
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
        dateLabel$,
        timeLabel$,
        createSessionAction$,
        sessionsEmpty$,
        openSessionAction$,
        canManageSessions,
        loading,
        saving,
        sessions,
        form,
        formError,
        saveMessage,
        trainingTitle,
        sessionMeta,
        createSession,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .ae-page {
    max-width: 800px;
    margin: 0 auto;
  }

  .title {
    margin: 0 0 8px;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .intro,
  .hint {
    margin: 0 0 16px;
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

  .datetime-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 12px;
  }

  .field {
    display: flex;
    flex: 1 1 140px;
    flex-direction: column;
    gap: 6px;
  }

  .field-label {
    font-size: 0.875rem;
    font-weight: 600;
  }

  .native-input {
    min-height: 44px;
    padding: 8px 10px;
    font-size: 1rem;
    border: 1px solid;
    border-radius: 4px;
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

  .attendance-link {
    min-height: 44px;
    padding: 8px 0;
    font-weight: 600;
    text-decoration: none;
  }
</style>
