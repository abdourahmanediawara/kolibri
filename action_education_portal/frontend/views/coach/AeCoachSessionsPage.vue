<template>

  <AeListPage
    :title="trainerSessionsTitle$()"
    :countLabel="sessionsCount$({ count: rows.length })"
    :subtitle="trainerSessionsIntro$()"
    :action="canManageSessions ? { label: createSessionTitle$(), onClick: openCreatePanel } : null"
    :bannerTitle="sessionsBannerTitle$()"
    :bannerSubtitle="sessionsBannerSubtitle$()"
    bannerIcon="schedule"
    :bannerArt="bannerArt"
    :loading="canManageSessions && isLoadingSessions"
    :errorText="listError"
    :items="rows"
    :searchFields="['course', 'location']"
    :searchLabel="sessionsSearchLabel$()"
    :searchPlaceholder="sessionsSearchPlaceholder$()"
    :sortOptions="sortOptions"
    :emptyText="canManageSessions ? sessionsEmpty$() : trainerStaffOnly$()"
    :noMatchText="sessionsNoMatch$()"
    :totalLabel="count => sessionsCount$({ count })"
    @retry="refresh"
  >
    <template #head>
      <th
        scope="col"
        class="ae-list-cell-grow"
      >
        {{ columnCourse$() }}
      </th>
      <th scope="col">
        {{ columnWhen$() }}
      </th>
      <th
        scope="col"
        class="ae-list-cell-secondary"
      >
        {{ locationLabel$() }}
      </th>
      <th scope="col">
        {{ colStatus$() }}
      </th>
      <th
        scope="col"
        class="ae-list-cell-shrink"
      >
        {{ columnActions$() }}
      </th>
    </template>
    <template #row="{ item }">
      <td class="ae-list-cell-grow">
        <span class="ae-list-cell-main">
          <AeAvatar
            :name="item.course"
            :toneKey="item.courseId"
            icon="schedule"
          />
          <span class="ae-list-cell-name">{{ item.course }}</span>
        </span>
      </td>
      <td class="ae-list-cell-nowrap">
        {{ item.whenLabel }}
      </td>
      <td class="ae-list-cell-nowrap ae-list-cell-secondary">
        {{ item.location }}
      </td>
      <td class="ae-list-cell-nowrap">
        <span
          class="ae-coach-status"
          :class="`ae-coach-status-${item.status.replace('_', '-')}`"
        >{{ item.statusLabel }}</span>
      </td>
      <td class="ae-list-cell-shrink">
        <AeRowActions
          :primaryLabel="openSessionAction$()"
          :primaryAriaLabel="openSessionOf$({ name: item.course })"
          :primaryHref="item.href"
        />
      </td>
    </template>

    <template #extra>
      <AeSidePanel
        :open="createPanelOpen"
        :title="createSessionTitle$()"
        :subtitle="createSessionSubtitle$()"
        icon="plus"
        titleId="ae-create-session-title"
        :alert="formError ? { kind: 'error', text: formError } : null"
        @close="closeCreatePanel"
      >
        <form
          novalidate
          @submit.prevent="createSession"
        >
          <div class="ae-side-panel-field">
            <label for="ae-cs-course">{{ filterTrainingLabel$() }}</label>
            <span class="ae-side-panel-affix">
              <select
                id="ae-cs-course"
                ref="courseField"
                v-model="form.trainingId"
                :aria-invalid="fieldErrors.training ? 'true' : 'false'"
                aria-describedby="ae-cs-course-error"
              >
                <option value="">
                  {{ selectCourseOption$() }}
                </option>
                <option
                  v-for="training in trainingOptions"
                  :key="training.id"
                  :value="training.id"
                >
                  {{ training.title }}
                </option>
              </select>
              <AeIcon
                name="chevronDown"
                :size="18"
              />
            </span>
            <p
              v-if="fieldErrors.training"
              id="ae-cs-course-error"
              class="ae-side-panel-error"
            >
              {{ fieldErrors.training }}
            </p>
            <p
              v-else-if="!trainingOptions.length"
              class="ae-coach-sessions-hint"
            >
              {{ sessionNeedsCourseHint$() }}
            </p>
          </div>

          <div class="ae-side-panel-field">
            <label for="ae-cs-location">{{ locationLabel$() }}</label>
            <input
              id="ae-cs-location"
              v-model="form.location"
              type="text"
              maxlength="200"
              autocomplete="off"
            >
          </div>

          <div class="ae-side-panel-row">
            <div class="ae-side-panel-field">
              <label for="ae-cs-date">{{ dateLabel$() }}</label>
              <input
                id="ae-cs-date"
                v-model="form.date"
                type="date"
                :aria-invalid="fieldErrors.dateTime ? 'true' : 'false'"
                aria-describedby="ae-cs-datetime-error"
              >
            </div>
            <div class="ae-side-panel-field">
              <label for="ae-cs-time">{{ timeLabel$() }}</label>
              <input
                id="ae-cs-time"
                v-model="form.time"
                type="time"
                :aria-invalid="fieldErrors.dateTime ? 'true' : 'false'"
                aria-describedby="ae-cs-datetime-error"
              >
            </div>
          </div>
          <p
            v-if="fieldErrors.dateTime"
            id="ae-cs-datetime-error"
            class="ae-side-panel-error"
          >
            {{ fieldErrors.dateTime }}
          </p>

        </form>

        <template #footer>
          <div class="ae-side-panel-foot-row">
            <button
              type="button"
              class="ae-side-panel-btn-neutral"
              @click="closeCreatePanel"
            >
              {{ cancelAction$() }}
            </button>
            <button
              type="button"
              class="ae-side-panel-btn-primary"
              :disabled="isCreatingSession || !trainingOptions.length"
              @click="createSession"
            >
              {{ createSession$() }}
            </button>
          </div>
        </template>
      </AeSidePanel>
    </template>
  </AeListPage>

</template>


<script>

  import { computed, nextTick, onMounted, reactive, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router/composables';
  import urls from 'kolibri/urls';
  import { currentLanguage } from 'kolibri/utils/i18n';
  import useSnackbar from 'kolibri/composables/useSnackbar';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';
  import { useTrainingApi } from '../../composables/useTrainingApi';
  import { useAsyncPageLoad } from '../../composables/useAsyncPageLoad';
  import AeAvatar from '../AeAvatar';
  import AeIcon from '../AeIcon';
  import AeListPage from '../AeListPage';
  import AeRowActions from '../AeRowActions';
  import AeSidePanel from '../AeSidePanel';

  // Sessions last two hours unless the trainer changes it later.
  const SESSION_HOURS = 2;

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  // Next full hour, in the fields' local format.
  function defaultDateTime() {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    return {
      date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    };
  }

  function parseDateTimeToIso(date, time) {
    const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date || '');
    const timeMatch = /^(\d{2}):(\d{2})$/.exec(time || '');
    if (!dateMatch || !timeMatch) {
      return null;
    }
    const dt = new Date(
      Number(dateMatch[1]),
      Number(dateMatch[2]) - 1,
      Number(dateMatch[3]),
      Number(timeMatch[1]),
      Number(timeMatch[2]),
    );
    return Number.isNaN(dt.getTime()) ? null : dt.toISOString();
  }

  export default {
    name: 'AeCoachSessionsPage',
    components: { AeAvatar, AeIcon, AeListPage, AeRowActions, AeSidePanel },
    setup() {
      const {
        trainerSessionsTitle$,
        trainerSessionsIntro$,
        trainerStaffOnly$,
        sessionsCount$,
        sessionsBannerTitle$,
        sessionsBannerSubtitle$,
        sessionsSearchLabel$,
        sessionsSearchPlaceholder$,
        sessionsEmpty$,
        sessionsNoMatch$,
        formHasErrors$,
        columnCourse$,
        columnWhen$,
        locationLabel$,
        colStatus$,
        columnActions$,
        openSessionAction$,
        openSessionOf$,
        sortByDate$,
        sortByCourse$,
        sessionStatusScheduled$,
        sessionStatusInProgress$,
        sessionStatusCompleted$,
        sessionStatusCancelled$,
        createSessionTitle$,
        createSessionSubtitle$,
        createSession$,
        filterTrainingLabel$,
        selectCourseOption$,
        sessionNeedsCourseHint$,
        dateLabel$,
        timeLabel$,
        sessionCourseRequired$,
        sessionDateRequired$,
        sessionCreated$,
        cancelAction$,
        saveError$,
        loadError$,
        loadTimeout$,
      } = portalStrings;

      const route = useRoute();
      const router = useRouter();
      const { createSnackbar } = useSnackbar();
      const { canManageSessions, currentUserId } = useAePermissions();
      const api = useTrainingApi();
      const {
        isLoading: isLoadingSessions,
        loadError: listLoadError,
        runLoad,
      } = useAsyncPageLoad('isLoadingSessions');

      const sessions = ref([]);
      const trainingsById = ref({});
      const createPanelOpen = ref(false);
      const isCreatingSession = ref(false);
      const courseField = ref(null);
      const formError = ref('');
      const fieldErrors = reactive({ training: '', dateTime: '' });
      const form = reactive({ trainingId: '', location: '', date: '', time: '' });

      const collator = new Intl.Collator(currentLanguage, { sensitivity: 'base' });

      const trainingOptions = computed(() =>
        Object.values(trainingsById.value).sort((a, b) => collator.compare(a.title, b.title)),
      );

      const listError = computed(() => {
        if (!listLoadError.value) {
          return '';
        }
        if (listLoadError.value.code === 'AE_REQUEST_TIMEOUT') {
          return loadTimeout$();
        }
        return loadError$();
      });

      const STATUS_LABELS = {
        scheduled: sessionStatusScheduled$,
        in_progress: sessionStatusInProgress$,
        completed: sessionStatusCompleted$,
        cancelled: sessionStatusCancelled$,
      };

      const whenFormat = new Intl.DateTimeFormat(currentLanguage, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const rows = computed(() =>
        sessions.value.map(session => {
          const training = trainingsById.value[session.training];
          const start = new Date(session.start_datetime);
          const status = STATUS_LABELS[session.status] ? session.status : 'scheduled';
          return {
            id: session.id,
            courseId: session.training,
            course: (training && training.title) || '',
            start: start.getTime() || 0,
            whenLabel: Number.isNaN(start.getTime()) ? '' : whenFormat.format(start),
            location: session.location || '',
            status,
            statusLabel: STATUS_LABELS[status](),
            href: router.resolve({
              name: 'AeCoachSessionDetail',
              params: { sessionId: session.id },
            }).href,
          };
        }),
      );

      const sortOptions = [
        { value: 'date', label: sortByDate$(), compare: (a, b) => b.start - a.start },
        {
          value: 'course',
          label: sortByCourse$(),
          compare: (a, b) => collator.compare(a.course, b.course),
        },
      ];

      async function refresh() {
        try {
          await runLoad(async () => {
            const [trainings, sessionList] = await Promise.all([
              api.fetchTrainings(),
              api.fetchSessions(),
            ]);
            const map = {};
            (trainings || []).forEach(training => {
              map[training.id] = training;
            });
            trainingsById.value = map;
            sessions.value = sessionList || [];
          });
        } catch (e) {
          sessions.value = [];
        }
      }

      function openCreatePanel() {
        Object.assign(form, { trainingId: '', location: '', ...defaultDateTime() });
        fieldErrors.training = '';
        fieldErrors.dateTime = '';
        formError.value = '';
        createPanelOpen.value = true;
        nextTick(() => courseField.value && courseField.value.focus());
      }

      function closeCreatePanel() {
        createPanelOpen.value = false;
      }

      async function createSession() {
        formError.value = '';
        fieldErrors.training = form.trainingId ? '' : sessionCourseRequired$();
        const startIso = parseDateTimeToIso(form.date, form.time);
        fieldErrors.dateTime = startIso ? '' : sessionDateRequired$();
        if (fieldErrors.training || fieldErrors.dateTime) {
          formError.value = formHasErrors$();
          return;
        }
        const end = new Date(startIso);
        end.setHours(end.getHours() + SESSION_HOURS);
        isCreatingSession.value = true;
        try {
          await api.createSession({
            training: form.trainingId,
            start_datetime: startIso,
            end_datetime: end.toISOString(),
            location: form.location.trim(),
            trainer: currentUserId.value,
            status: 'scheduled',
            notes: '',
          });
        } catch (e) {
          formError.value = saveError$();
          return;
        } finally {
          isCreatingSession.value = false;
        }
        closeCreatePanel();
        createSnackbar(sessionCreated$());
        await refresh();
      }

      onMounted(() => {
        if (!canManageSessions.value) {
          isLoadingSessions.value = false;
          return;
        }
        refresh();
        if (route.query.creer) {
          openCreatePanel();
          router.replace({ query: {} });
        }
      });

      return {
        trainerSessionsTitle$,
        trainerSessionsIntro$,
        trainerStaffOnly$,
        sessionsCount$,
        sessionsBannerTitle$,
        sessionsBannerSubtitle$,
        sessionsSearchLabel$,
        sessionsSearchPlaceholder$,
        sessionsEmpty$,
        sessionsNoMatch$,
        columnCourse$,
        columnWhen$,
        locationLabel$,
        colStatus$,
        columnActions$,
        openSessionAction$,
        openSessionOf$,
        createSessionTitle$,
        createSessionSubtitle$,
        createSession$,
        filterTrainingLabel$,
        selectCourseOption$,
        sessionNeedsCourseHint$,
        dateLabel$,
        timeLabel$,
        cancelAction$,
        bannerArt: urls.static('action_education_portal/ae-users-banner.jpg'),
        canManageSessions,
        isLoadingSessions,
        listError,
        rows,
        sortOptions,
        trainingOptions,
        createPanelOpen,
        isCreatingSession,
        courseField,
        form,
        fieldErrors,
        formError,
        openCreatePanel,
        closeCreatePanel,
        createSession,
        refresh,
      };
    },
  };

</script>


<style lang="scss" scoped>

  .ae-coach-status {
    display: inline-block;
    padding: 4px 12px;
    font-size: 14px;
    font-weight: 700;
    border-radius: 999px;
  }

  .ae-coach-status-scheduled {
    color: #0b5aa3;
    background: var(--ae-kpi-blue);
  }

  .ae-coach-status-in-progress {
    color: var(--ae-orange-deep);
    background: var(--ae-orange-wash);
  }

  .ae-coach-status-completed {
    color: #1b6e3c;
    background: var(--ae-kpi-green);
  }

  .ae-coach-status-cancelled {
    color: var(--ae-text-muted);
    background: var(--ae-surface-muted);
  }

  .ae-coach-sessions-hint {
    margin: 6px 0 0;
    font-size: 14px;
    color: var(--ae-text-subtle);
  }

</style>
