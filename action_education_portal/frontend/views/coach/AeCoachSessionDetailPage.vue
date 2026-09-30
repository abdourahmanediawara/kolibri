<template>

  <AeListPage
    :title="sessionHeading"
    :crumbs="[{ label: trainerSessionsTitle$(), to: { name: 'AeCoachSessions' } }]"
    :countLabel="session ? participantsCount$({ count: rows.length }) : ''"
    :subtitle="sessionMeta"
    :action="
      session ? { label: enrollLearnersTitle$(), icon: 'userPlus', onClick: openEnrollPanel } : null
    "
    :loading="canManageSessions && loading"
    :errorText="errorMessage"
    :items="rows"
    :searchFields="['name', 'username']"
    :searchLabel="searchLearnersLabel$()"
    :searchPlaceholder="usersSearchPlaceholder$()"
    :sortOptions="sortOptions"
    :emptyText="canManageSessions ? sessionNoParticipants$() : trainerStaffOnly$()"
    :noMatchText="learnersNoMatch$()"
    :totalLabel="count => participantsCount$({ count })"
    @retry="refresh"
  >
    <template
      v-if="session"
      #actions
    >
      <a
        :href="attendanceCsvHref"
        class="ae-session-csv"
      >
        <AeIcon
          name="download"
          :size="20"
        />
        <span>{{ attendanceCsvAction$() }}</span>
      </a>
    </template>

    <template
      v-if="session && rows.length"
      #banner
    >
      <ul class="ae-session-summary">
        <li
          v-for="chip in summary"
          :key="chip.id"
          class="ae-session-chip"
          :class="`ae-session-chip-${chip.id}`"
        >
          <span class="ae-session-chip-value">{{ chip.count }}</span>
          <span>{{ chip.label }}</span>
        </li>
      </ul>
    </template>

    <template #head>
      <th
        scope="col"
        class="ae-list-cell-grow"
      >
        {{ colLearner$() }}
      </th>
      <th scope="col">
        {{ columnAttendance$() }}
      </th>
    </template>
    <template #row="{ item }">
      <td class="ae-list-cell-grow">
        <span class="ae-list-cell-main">
          <AeAvatar
            :name="item.name"
            :toneKey="item.username"
          />
          <span class="ae-session-learner">
            <span class="ae-list-cell-name">{{ item.name }}</span>
            <span class="ae-session-username">{{ item.username }}</span>
          </span>
        </span>
      </td>
      <td class="ae-list-cell-nowrap">
        <div
          class="ae-attendance"
          role="group"
          :aria-label="markAttendanceOf$({ name: item.name })"
        >
          <button
            v-for="option in statusOptions"
            :key="option.value"
            type="button"
            class="ae-attendance-btn"
            :class="[
              `ae-attendance-${option.value}`,
              { 'ae-attendance-on': item.status === option.value },
            ]"
            :aria-pressed="item.status === option.value ? 'true' : 'false'"
            :disabled="savingId === item.id"
            @click="setStatus(item, option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </td>
    </template>

    <template #extra>
      <AeSidePanel
        :open="enrollPanelOpen"
        :title="enrollLearnersTitle$()"
        :subtitle="enrollLearnersSubtitle$()"
        icon="userPlus"
        titleId="ae-enroll-title"
        :alert="enrollError ? { kind: 'error', text: enrollError } : null"
        @close="closeEnrollPanel"
      >
        <div class="ae-session-enroll">
          <h3
            id="ae-enroll-learners-title"
            class="ae-side-panel-section"
          >
            <span
              class="ae-side-panel-section-icon"
              aria-hidden="true"
            >
              <KIcon
                icon="people"
                color="var(--ae-orange)"
              />
            </span>
            <span>{{ learnersTitle$() }}</span>
          </h3>
          <AePersonPicker
            v-model="selectedIds"
            :people="enrollablePeople"
            searchable
            :searchLabel="searchLearnersLabel$()"
            labelledby="ae-enroll-learners-title"
            :emptyText="
              enrollablePeople.length || !learnerPeople.length
                ? noLearnersAvailable$()
                : allLearnersEnrolled$()
            "
          />
        </div>

        <template #footer>
          <div class="ae-side-panel-foot-row">
            <button
              type="button"
              class="ae-side-panel-btn-neutral"
              @click="closeEnrollPanel"
            >
              {{ cancelAction$() }}
            </button>
            <button
              type="button"
              class="ae-side-panel-btn-primary"
              :disabled="enrolling || !selectedIds.length"
              @click="enrollSelected"
            >
              {{ enrollAction$() }}
            </button>
          </div>
        </template>
      </AeSidePanel>
    </template>
  </AeListPage>

</template>


<script>

  import { computed, onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router/composables';
  import { currentLanguage } from 'kolibri/utils/i18n';
  import useSnackbar from 'kolibri/composables/useSnackbar';
  import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';
  import { useTrainingApi } from '../../composables/useTrainingApi';
  import { useClassroomApi } from '../../composables/useClassroomApi';
  import { useAsyncPageLoad } from '../../composables/useAsyncPageLoad';
  import AeAvatar from '../AeAvatar';
  import AeIcon from '../AeIcon';
  import AeListPage from '../AeListPage';
  import AePersonPicker from '../AePersonPicker';
  import AeSidePanel from '../AeSidePanel';

  const STATUS_ORDER = ['present', 'late', 'excused', 'absent', ''];

  export default {
    name: 'AeCoachSessionDetailPage',
    components: { AeAvatar, AeIcon, AeListPage, AePersonPicker, AeSidePanel },
    setup() {
      const {
        attendancePageTitle$,
        trainerSessionsTitle$,
        trainerStaffOnly$,
        participantsCount$,
        searchLearnersLabel$,
        usersSearchPlaceholder$,
        sessionNoParticipants$,
        learnersNoMatch$,
        learnersTitle$,
        colLearner$,
        columnAttendance$,
        markAttendanceOf$,
        attendanceCsvAction$,
        sortByName$,
        colStatus$,
        statusPresent$,
        statusAbsent$,
        statusLate$,
        statusExcused$,
        summaryPresent$,
        summaryAbsent$,
        summaryLate$,
        summaryExcused$,
        summaryNotRecorded$,
        sessionStatusScheduled$,
        sessionStatusInProgress$,
        sessionStatusCompleted$,
        sessionStatusCancelled$,
        enrollLearnersTitle$,
        enrollLearnersSubtitle$,
        enrollAction$,
        noLearnersAvailable$,
        allLearnersEnrolled$,
        learnersEnrolled$,
        enrollError$,
        cancelAction$,
        saveError$,
        loadError$,
        loadTimeout$,
      } = portalStrings;

      const route = useRoute();
      const { createSnackbar } = useSnackbar();
      const { canManageSessions, currentUserId, userFacilityId } = useAePermissions();
      const api = useTrainingApi();
      const { isStaffUser } = useClassroomApi();
      const { isLoading: loading, loadError, runLoad } = useAsyncPageLoad('isLoadingSession');

      const session = ref(null);
      const training = ref(null);
      const rows = ref([]);
      const facilityUsers = ref([]);
      const savingId = ref('');
      const enrollPanelOpen = ref(false);
      const selectedIds = ref([]);
      const enrolling = ref(false);
      const enrollError = ref('');

      const statusOptions = [
        { value: 'present', label: statusPresent$() },
        { value: 'absent', label: statusAbsent$() },
        { value: 'late', label: statusLate$() },
        { value: 'excused', label: statusExcused$() },
      ];

      const SESSION_STATUS = {
        scheduled: sessionStatusScheduled$,
        in_progress: sessionStatusInProgress$,
        completed: sessionStatusCompleted$,
        cancelled: sessionStatusCancelled$,
      };

      const errorMessage = computed(() => {
        if (!loadError.value) {
          return '';
        }
        if (loadError.value.code === 'AE_REQUEST_TIMEOUT') {
          return loadTimeout$();
        }
        return loadError$();
      });

      const sessionHeading = computed(
        () => (training.value && training.value.title) || attendancePageTitle$(),
      );

      const whenFormat = new Intl.DateTimeFormat(currentLanguage, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const sessionMeta = computed(() => {
        if (!session.value) {
          return '';
        }
        const start = new Date(session.value.start_datetime);
        const status = SESSION_STATUS[session.value.status];
        return [
          Number.isNaN(start.getTime()) ? '' : whenFormat.format(start),
          session.value.location,
          status ? status() : '',
        ]
          .filter(Boolean)
          .join(' · ');
      });

      const summary = computed(() => {
        const count = status => rows.value.filter(row => row.status === status).length;
        return [
          { id: 'present', count: count('present'), label: summaryPresent$ },
          { id: 'absent', count: count('absent'), label: summaryAbsent$ },
          { id: 'late', count: count('late'), label: summaryLate$ },
          { id: 'excused', count: count('excused'), label: summaryExcused$ },
          { id: 'none', count: count(''), label: summaryNotRecorded$ },
        ].map(chip => ({ ...chip, label: chip.label({ count: chip.count }) }));
      });

      const collator = new Intl.Collator(currentLanguage, { sensitivity: 'base' });
      const sortOptions = [
        {
          value: 'name',
          label: sortByName$(),
          compare: (a, b) => collator.compare(a.name, b.name),
        },
        {
          value: 'status',
          label: colStatus$(),
          compare: (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
        },
      ];

      const learnerPeople = computed(() =>
        facilityUsers.value
          .filter(user => !isStaffUser(user))
          .map(user => ({
            id: user.id,
            fullName: user.full_name || user.username,
            username: user.username,
            meta: user.username,
          }))
          .sort((a, b) => collator.compare(a.fullName, b.fullName)),
      );

      const enrollablePeople = computed(() => {
        const enrolled = new Set(rows.value.map(row => row.id));
        return learnerPeople.value.filter(person => !enrolled.has(person.id));
      });

      const attendanceCsvHref = computed(() =>
        session.value ? api.attendanceExportUrl(session.value.id) : '',
      );

      async function refresh() {
        const sessionId = route.params.sessionId;
        try {
          await runLoad(async () => {
            const sessionData = await api.fetchSession(sessionId);
            const [trainings, enrollments, attendances, users] = await Promise.all([
              api.fetchTrainings(),
              api.fetchEnrollments(),
              api.fetchAttendances(),
              FacilityUserResource.fetchCollection({
                getParams: { member_of: userFacilityId.value },
                force: true,
              }),
            ]);
            session.value = sessionData;
            training.value =
              (trainings || []).find(item => item.id === sessionData.training) || null;
            facilityUsers.value = users || [];
            const userById = {};
            facilityUsers.value.forEach(user => {
              userById[user.id] = user;
            });
            const attendanceByLearner = {};
            (attendances || [])
              .filter(attendance => attendance.session === sessionId)
              .forEach(attendance => {
                attendanceByLearner[attendance.learner] = attendance;
              });
            const seen = new Set();
            rows.value = (enrollments || [])
              .filter(
                enrollment =>
                  enrollment.session === sessionId || enrollment.training === sessionData.training,
              )
              .filter(enrollment => {
                // One line per learner, even when enrolled twice.
                if (seen.has(enrollment.learner)) {
                  return false;
                }
                seen.add(enrollment.learner);
                return true;
              })
              .map(enrollment => {
                const user = userById[enrollment.learner] || {};
                const attendance = attendanceByLearner[enrollment.learner];
                return {
                  id: enrollment.learner,
                  name: user.full_name || user.username || enrollment.learner,
                  username: user.username || '',
                  attendanceId: attendance ? attendance.id : null,
                  status: attendance ? attendance.status : '',
                };
              });
          });
        } catch (e) {
          rows.value = [];
        }
      }

      async function setStatus(row, status) {
        savingId.value = row.id;
        try {
          const saved = row.attendanceId
            ? await api.updateAttendance(row.attendanceId, {
              status,
              recorded_by: currentUserId.value,
            })
            : await api.createAttendance({
              session: session.value.id,
              learner: row.id,
              status,
              recorded_by: currentUserId.value,
              comment: '',
            });
          row.status = status;
          if (saved && saved.id) {
            row.attendanceId = saved.id;
          }
        } catch (e) {
          createSnackbar(saveError$());
        } finally {
          savingId.value = '';
        }
      }

      function openEnrollPanel() {
        selectedIds.value = [];
        enrollError.value = '';
        enrollPanelOpen.value = true;
      }

      function closeEnrollPanel() {
        enrollPanelOpen.value = false;
      }

      async function enrollSelected() {
        enrollError.value = '';
        enrolling.value = true;
        const results = await Promise.allSettled(
          selectedIds.value.map(learner =>
            api.createEnrollment({
              training: session.value.training,
              session: session.value.id,
              learner,
              status: 'active',
            }),
          ),
        );
        enrolling.value = false;
        const enrolled = results.filter(result => result.status === 'fulfilled').length;
        if (enrolled) {
          createSnackbar(learnersEnrolled$({ count: enrolled }));
        }
        if (enrolled < results.length) {
          enrollError.value = enrollError$();
          selectedIds.value = selectedIds.value.filter(
            (id, index) => results[index].status === 'rejected',
          );
        } else {
          closeEnrollPanel();
        }
        await refresh();
      }

      onMounted(() => {
        if (canManageSessions.value) {
          refresh();
        } else {
          loading.value = false;
        }
      });

      return {
        trainerSessionsTitle$,
        trainerStaffOnly$,
        participantsCount$,
        searchLearnersLabel$,
        usersSearchPlaceholder$,
        sessionNoParticipants$,
        learnersNoMatch$,
        learnersTitle$,
        colLearner$,
        columnAttendance$,
        markAttendanceOf$,
        attendanceCsvAction$,
        enrollLearnersTitle$,
        enrollLearnersSubtitle$,
        enrollAction$,
        noLearnersAvailable$,
        allLearnersEnrolled$,
        cancelAction$,
        canManageSessions,
        loading,
        errorMessage,
        session,
        sessionHeading,
        sessionMeta,
        summary,
        rows,
        sortOptions,
        statusOptions,
        savingId,
        learnerPeople,
        enrollablePeople,
        attendanceCsvHref,
        enrollPanelOpen,
        selectedIds,
        enrolling,
        enrollError,
        setStatus,
        openEnrollPanel,
        closeEnrollPanel,
        enrollSelected,
        refresh,
      };
    },
  };

</script>


<style lang="scss" scoped>

  @import '../../styles/components';

  .ae-session-csv {
    @include ae-button-outline;

    min-height: 48px;
    font-size: 17px;
  }

  /* ---------- Attendance summary (in place of the banner) ---------- */

  .ae-session-summary {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 14px;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .ae-session-chip {
    display: flex;
    gap: 10px;
    align-items: baseline;
    padding: 14px 18px;
    font-size: 16px;
    font-weight: 600;
    border-radius: var(--ae-radius-lg);
  }

  .ae-session-chip-value {
    font-size: 30px;
    font-weight: 800;
    line-height: 1;
  }

  .ae-session-chip-present {
    color: #1b6e3c;
    background: var(--ae-kpi-green);
  }

  .ae-session-chip-absent {
    color: #a3262a;
    background: var(--ae-kpi-red);
  }

  .ae-session-chip-late {
    color: #8a5a00;
    background: var(--ae-kpi-yellow);
  }

  .ae-session-chip-excused {
    color: #0b5aa3;
    background: var(--ae-kpi-blue);
  }

  .ae-session-chip-none {
    color: var(--ae-text-muted);
    background: var(--ae-surface-muted);
  }

  /* ---------- Rows ---------- */

  .ae-session-learner {
    display: flex;
    flex-direction: column;
    min-width: 0;
    line-height: 1.3;
  }

  .ae-session-username {
    font-size: 14px;
    color: var(--ae-text-subtle);
  }

  .ae-attendance {
    display: inline-flex;
    gap: 6px;
  }

  .ae-attendance-btn {
    min-width: 88px;
    height: 34px;
    padding: 0 12px;
    font: inherit;
    font-size: 14px;
    font-weight: 700;
    color: var(--ae-text-muted);
    cursor: pointer;
    background: var(--ae-surface);
    border: 1.5px solid var(--ae-field-line);
    border-radius: 999px;

    &:hover:not(:disabled) {
      border-color: var(--ae-navy);
    }

    &:disabled {
      cursor: progress;
      opacity: 0.6;
    }

    @include ae-focus-ring;
  }

  .ae-attendance-present.ae-attendance-on {
    color: #1b6e3c;
    background: var(--ae-kpi-green);
    border-color: #1b6e3c;
  }

  .ae-attendance-absent.ae-attendance-on {
    color: #a3262a;
    background: var(--ae-kpi-red);
    border-color: #a3262a;
  }

  .ae-attendance-late.ae-attendance-on {
    color: #8a5a00;
    background: var(--ae-kpi-yellow);
    border-color: #8a5a00;
  }

  .ae-attendance-excused.ae-attendance-on {
    color: #0b5aa3;
    background: var(--ae-kpi-blue);
    border-color: #0b5aa3;
  }

  // The enroll list takes the height left in the panel and scrolls on its own.
  .ae-session-enroll {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  @media (min-width: 900px) and (max-height: 799px) {
    .ae-session-summary {
      gap: 10px;
    }

    .ae-session-chip {
      padding: 10px 14px;
    }

    .ae-session-chip-value {
      font-size: 24px;
    }
  }

  @media (max-width: 1279px) {
    .ae-attendance-btn {
      min-width: 0;
      padding: 0 10px;
    }
  }

  @media (max-width: 899px) {
    .ae-session-summary {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .ae-attendance {
      flex-wrap: wrap;
    }
  }

</style>
