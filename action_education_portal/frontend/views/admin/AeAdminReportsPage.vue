<template>

  <div class="ae-report">
    <AePageHeader
      :title="monitoringTitle$()"
      :subtitle="reportsIntro$()"
    />

    <KCircularLoader
      v-if="loading"
      :delay="false"
    />

    <div
      v-else
      class="ae-report-grid"
    >
      <div class="ae-report-col">
        <section
          class="ae-report-card"
          aria-labelledby="ae-report-certificates"
        >
          <div class="ae-report-card-head">
            <span
              class="ae-report-badge"
              aria-hidden="true"
            >
              <KIcon
                icon="lesson"
                color="var(--ae-orange)"
              />
            </span>
            <div>
              <h2
                id="ae-report-certificates"
                class="ae-report-card-title"
              >
                {{ exportCertificatesTitle$() }}
              </h2>
              <p class="ae-report-card-text">
                {{ exportCertificatesDesc$() }}
              </p>
            </div>
          </div>
          <a
            :href="certificatesCsvHref"
            class="ae-report-button"
          >
            <AeIcon
              name="download"
              :size="22"
            />
            <span>{{ downloadCsvAction$() }}</span>
          </a>
        </section>

        <section
          class="ae-report-card"
          aria-labelledby="ae-report-issue"
        >
          <div class="ae-report-card-head">
            <span
              class="ae-report-badge"
              aria-hidden="true"
            >
              <KIcon
                icon="person"
                color="var(--ae-orange)"
              />
            </span>
            <div>
              <h2
                id="ae-report-issue"
                class="ae-report-card-title"
              >
                {{ issueCertificateTitle$() }}
              </h2>
              <p class="ae-report-card-text">
                {{ issueCertificateIntro$() }}
              </p>
            </div>
          </div>

          <form
            class="ae-report-form"
            novalidate
            @submit.prevent="issue"
          >
            <label
              for="ae-report-learner"
              class="ae-report-label"
            >{{ learnerUsernameLabel$() }}</label>
            <input
              id="ae-report-learner"
              v-model.trim="form.learnerUsername"
              class="ae-report-input"
              type="text"
              list="ae-report-learners"
              autocomplete="off"
            >
            <datalist id="ae-report-learners">
              <option
                v-for="name in usernames"
                :key="name"
                :value="name"
              ></option>
            </datalist>

            <label
              for="ae-report-training"
              class="ae-report-label"
            >{{ trainingSelectLabel$() }}</label>
            <span class="ae-report-select">
              <select
                id="ae-report-training"
                v-model="form.trainingId"
                class="ae-report-input"
              >
                <option value="">
                  {{ trainingSelectPlaceholder$() }}
                </option>
                <option
                  v-for="training in trainings"
                  :key="training.id"
                  :value="training.id"
                >
                  {{ training.title }}
                </option>
              </select>
              <AeIcon
                name="chevronDown"
                class="ae-report-select-icon"
                :size="18"
              />
            </span>

            <button
              type="submit"
              class="ae-report-button"
              :disabled="issuing"
            >
              {{ issueCertificateAction$() }}
            </button>
            <p
              v-if="message"
              class="ae-report-message"
              :class="{ 'ae-report-message-error': messageIsError }"
              role="status"
            >
              {{ message }}
            </p>
          </form>
        </section>
      </div>

      <section
        class="ae-report-card ae-report-sessions"
        aria-labelledby="ae-report-attendance"
      >
        <div class="ae-report-card-head">
          <span
            class="ae-report-badge"
            aria-hidden="true"
          >
            <KIcon
              icon="classes"
              color="var(--ae-orange)"
            />
          </span>
          <div>
            <h2
              id="ae-report-attendance"
              class="ae-report-card-title"
            >
              {{ exportAttendanceTitle$() }}
            </h2>
            <p class="ae-report-card-text">
              {{ attendanceIntro$() }}
            </p>
          </div>
        </div>

        <div
          ref="sessionsArea"
          class="ae-report-list-wrap"
        >
          <p
            v-if="!sessions.length"
            class="ae-report-card-text"
          >
            {{ sessionsEmpty$() }}
          </p>
          <ul
            v-else
            class="ae-report-list"
          >
            <li
              v-for="session in pageRows"
              :key="session.id"
              class="ae-report-row"
            >
              <span class="ae-report-row-text">
                <span class="ae-report-row-title">{{ session.title }}</span>
                <span
                  v-if="session.meta"
                  class="ae-report-row-meta"
                >{{ session.meta }}</span>
              </span>
              <a
                :href="session.exportHref"
                class="ae-report-row-button"
                :aria-label="downloadAttendanceOf$({ name: session.title })"
              >
                <AeIcon
                  name="download"
                  :size="18"
                />
                <span>{{ csvFileLabel$() }}</span>
              </a>
            </li>
          </ul>
        </div>

        <footer
          v-if="sessions.length"
          class="ae-report-foot"
        >
          <span>{{ sessionsCount$({ count: sessions.length }) }}</span>
          <span class="ae-report-pager">
            <span>{{ rangeLabel }}</span>
            <template v-if="pageCount > 1">
              <button
                type="button"
                class="ae-report-page-btn"
                :disabled="page === 1"
                :aria-label="previousPage$()"
                @click="page -= 1"
              >
                <AeIcon
                  name="chevronLeft"
                  :size="18"
                />
              </button>
              <button
                type="button"
                class="ae-report-page-btn"
                :disabled="page === pageCount"
                :aria-label="nextPage$()"
                @click="page += 1"
              >
                <AeIcon
                  name="chevronRight"
                  :size="18"
                />
              </button>
            </template>
          </span>
        </footer>
      </section>
    </div>
  </div>

</template>


<script>

  import { computed, onMounted, reactive, ref, watch } from 'vue';
  import { currentLanguage } from 'kolibri/utils/i18n';
  import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';
  import { useFitPageSize } from '../../composables/useFitPageSize';
  import { useTrainingApi } from '../../composables/useTrainingApi';
  import AeIcon from '../AeIcon';
  import AePageHeader from '../AePageHeader';

  export default {
    name: 'AeAdminReportsPage',
    components: { AePageHeader, AeIcon },
    setup() {
      const {
        monitoringTitle$,
        reportsIntro$,
        exportCertificatesTitle$,
        exportCertificatesDesc$,
        exportAttendanceTitle$,
        attendanceIntro$,
        downloadCsvAction$,
        downloadAttendanceOf$,
        csvFileLabel$,
        sessionsEmpty$,
        sessionsCount$,
        issueCertificateTitle$,
        issueCertificateIntro$,
        learnerUsernameLabel$,
        trainingSelectLabel$,
        trainingSelectPlaceholder$,
        issueCertificateAction$,
        certificateIssued$,
        certificateIssueError$,
        pageRange$,
        previousPage$,
        nextPage$,
      } = portalStrings;

      const { userFacilityId } = useAePermissions();
      const api = useTrainingApi();
      const loading = ref(true);
      const issuing = ref(false);
      const sessions = ref([]);
      const trainings = ref([]);
      const usersById = ref({});
      const message = ref('');
      const messageIsError = ref(false);
      const form = reactive({
        learnerUsername: '',
        trainingId: '',
      });

      const certificatesCsvHref = computed(() => api.certificatesExportUrl());
      const usernames = computed(() =>
        Object.values(usersById.value)
          .map(user => user.username)
          .sort(),
      );

      const dateFormat = new Intl.DateTimeFormat(currentLanguage, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      // Attendance list: as many sessions as fit, then pages.
      const page = ref(1);
      const {
        area: sessionsArea,
        pageSize,
        measure,
      } = useFitPageSize({ rowSelector: '.ae-report-row', fallbackRowHeight: 64 });
      const pageCount = computed(() =>
        Math.max(1, Math.ceil(sessions.value.length / pageSize.value)),
      );
      const pageRows = computed(() => {
        const start = (page.value - 1) * pageSize.value;
        return sessions.value.slice(start, start + pageSize.value);
      });
      const rangeLabel = computed(() => {
        const total = sessions.value.length;
        const start = (page.value - 1) * pageSize.value + 1;
        const end = Math.min(total, page.value * pageSize.value);
        return pageRange$({ start, end, total });
      });
      watch(pageCount, count => {
        page.value = Math.min(page.value, count);
      });

      function showMessage(text, isError) {
        message.value = text;
        messageIsError.value = isError;
      }

      function issue() {
        message.value = '';
        const username = form.learnerUsername;
        const learner = Object.values(usersById.value).find(
          user => (user.username || '').toLowerCase() === username.toLowerCase(),
        );
        if (!username || !form.trainingId || !learner) {
          showMessage(certificateIssueError$(), true);
          return;
        }
        issuing.value = true;
        api
          .issueCertificate({
            learner: learner.id,
            training: form.trainingId,
          })
          .then(() => {
            showMessage(certificateIssued$(), false);
            form.learnerUsername = '';
          })
          .catch(() => {
            showMessage(certificateIssueError$(), true);
          })
          .finally(() => {
            issuing.value = false;
          });
      }

      onMounted(() => {
        Promise.all([
          api.fetchTrainings(),
          api.fetchSessions(),
          FacilityUserResource.fetchCollection({
            getParams: { member_of: userFacilityId.value },
          }),
        ])
          .then(([trainingList, sessionList, users]) => {
            const trainingsById = {};
            (trainingList || []).forEach(training => {
              trainingsById[training.id] = training;
            });
            trainings.value = trainingList || [];
            const byId = {};
            (users || []).forEach(user => {
              byId[user.id] = user;
            });
            usersById.value = byId;
            sessions.value = (sessionList || []).map(session => {
              const date = session.start_datetime
                ? dateFormat.format(new Date(session.start_datetime))
                : '';
              return {
                id: session.id,
                title:
                  (trainingsById[session.training] && trainingsById[session.training].title) ||
                  session.training,
                meta: [date, session.location].filter(Boolean).join(' · '),
                exportHref: api.attendanceExportUrl(session.id),
              };
            });
          })
          .finally(() => {
            loading.value = false;
            measure();
          });
      });

      return {
        monitoringTitle$,
        reportsIntro$,
        exportCertificatesTitle$,
        exportCertificatesDesc$,
        exportAttendanceTitle$,
        attendanceIntro$,
        downloadCsvAction$,
        downloadAttendanceOf$,
        csvFileLabel$,
        sessionsEmpty$,
        sessionsCount$,
        issueCertificateTitle$,
        issueCertificateIntro$,
        learnerUsernameLabel$,
        trainingSelectLabel$,
        trainingSelectPlaceholder$,
        issueCertificateAction$,
        previousPage$,
        nextPage$,
        loading,
        issuing,
        sessions,
        trainings,
        usernames,
        form,
        message,
        messageIsError,
        certificatesCsvHref,
        issue,
        sessionsArea,
        page,
        pageCount,
        pageRows,
        rangeLabel,
      };
    },
  };

</script>


<style lang="scss" scoped>

  @import '../../styles/components';

  .ae-report {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .ae-report-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
    gap: 20px;
    align-items: start;
  }

  .ae-report-col {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .ae-report-card {
    @include ae-card;

    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .ae-report-card-head {
    @include ae-card-head;
  }

  .ae-report-badge {
    @include ae-card-badge;
  }

  .ae-report-card-title {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
    line-height: 1.25;
    color: var(--ae-navy);
  }

  .ae-report-card-text {
    margin: 4px 0 0;
    font-size: 16px;
    color: var(--ae-text-muted);
  }

  .ae-report-button {
    @include ae-button-primary;

    align-self: flex-start;
  }

  .ae-report-form {
    display: flex;
    flex-direction: column;

    .ae-report-button {
      margin-top: 18px;
    }
  }

  .ae-report-label {
    margin: 0 0 8px;
    font-size: 16px;
    font-weight: 700;
    color: var(--ae-navy);

    & ~ & {
      margin-top: 14px;
    }
  }

  .ae-report-input {
    @include ae-field;
  }

  .ae-report-select {
    position: relative;
    display: block;

    select {
      padding-right: 44px;
      appearance: none;
      cursor: pointer;
    }
  }

  .ae-report-select-icon {
    position: absolute;
    top: 50%;
    right: 14px;
    color: var(--ae-navy);
    pointer-events: none;
    transform: translateY(-50%);
  }

  .ae-report-message {
    padding: 10px 14px;
    margin: 14px 0 0;
    font-size: 15px;
    font-weight: 600;
    color: #166b3a;
    background: var(--ae-kpi-green);
    border-radius: var(--ae-radius-sm);
  }

  .ae-report-message-error {
    color: var(--ae-danger);
    background: var(--ae-danger-soft);
  }

  /* ---------- Attendance list ---------- */

  .ae-report-list {
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .ae-report-row {
    display: flex;
    gap: 16px;
    align-items: center;
    min-height: 64px;
    padding: 8px 4px;
    border-bottom: 1px solid var(--ae-line);
  }

  .ae-report-row-text {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    line-height: 1.35;
  }

  .ae-report-row-title {
    overflow: hidden;
    font-size: 16px;
    font-weight: 700;
    color: var(--ae-navy);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ae-report-row-meta {
    font-size: 14px;
    color: var(--ae-text-subtle);
  }

  .ae-report-row-button {
    @include ae-button-outline;

    flex-shrink: 0;
    min-height: 36px;
    padding: 0 14px;
    font-size: 14px;
  }

  .ae-report-foot {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    font-size: 15px;
    color: var(--ae-text-muted);
  }

  .ae-report-pager {
    display: inline-flex;
    gap: 8px;
    align-items: center;
  }

  .ae-report-page-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    color: var(--ae-navy);
    cursor: pointer;
    background: var(--ae-surface);
    border: 1.5px solid var(--ae-field-line);
    border-radius: var(--ae-radius-sm);

    &:disabled {
      cursor: default;
      opacity: 0.4;
    }

    @include ae-focus-ring;
  }

  /* ---------- Responsive ---------- */

  // Computers: the attendance card takes the full height, its list fills it.
  @media (min-width: 900px) and (min-height: 640px) {
    .ae-report {
      flex: 1 1 auto;
      min-height: 0;
    }

    .ae-report-grid {
      flex: 1 1 auto;
      align-items: stretch;
      min-height: 0;
    }

    .ae-report-sessions {
      min-height: 0;
    }

    // Height comes from the free space only, never from the rows it holds.
    .ae-report-list-wrap {
      flex: 1 1 0;
      min-height: 0;
    }
  }

  @media (min-width: 900px) and (max-height: 799px) {
    .ae-report,
    .ae-report-grid,
    .ae-report-col {
      gap: 14px;
    }

    .ae-report-card {
      gap: 12px;
      padding: 16px 18px;
    }

    .ae-report-card-title {
      font-size: 19px;
    }

    .ae-report-card-text {
      font-size: 15px;
    }

    .ae-report-input {
      height: 42px;
    }

    .ae-report-label ~ .ae-report-label {
      margin-top: 10px;
    }

    .ae-report-form .ae-report-button {
      margin-top: 12px;
    }

    .ae-report-button {
      min-height: 44px;
    }

    .ae-report-row {
      min-height: 56px;
    }
  }

  // Very short screens: the card texts step aside.
  @media (min-width: 900px) and (max-height: 699px) {
    .ae-report-card-text {
      display: none;
    }

    .ae-report-badge {
      width: 40px;
      height: 40px;
    }
  }

  @media (max-width: 899px) {
    .ae-report-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }

</style>
