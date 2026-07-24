<template>
  <div
    class="ae-page"
    :style="{ color: $themeTokens.text }"
  >
    <h1 class="title">
      {{ reportsTitle$() }}
    </h1>
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
          {{ issueCertificateTitle$() }}
        </h2>
        <KTextbox
          v-model="form.learnerUsername"
          :label="learnerUsernameLabel$()"
          :floatingLabel="false"
          autocomplete="off"
        />
        <label
          class="select-label"
          for="ae-admin-cert-training"
        >{{ trainingSelectLabel$() }}</label>
        <select
          id="ae-admin-cert-training"
          v-model="form.trainingId"
          class="select"
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
        <KButton
          :text="issueCertificateAction$()"
          :primary="true"
          :disabled="issuing"
          @click="issue"
        />
        <p
          v-if="message"
          role="status"
        >
          {{ message }}
        </p>
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
          class="export-list"
        >
          <li
            v-for="session in sessions"
            :key="session.id"
            class="export-row"
          >
            <span>{{ session.title }}</span>
            <KButton
              :text="downloadCsvAction$()"
              appearance="raised-button"
              :href="session.exportHref"
            />
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<script>
  import { computed, onMounted, reactive, ref } from 'vue';
  import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';
  import { useTrainingApi } from '../../composables/useTrainingApi';

  export default {
    name: 'AeAdminReportsPage',
    setup() {
      const {
        reportsTitle$,
        reportsIntro$,
        exportCertificatesTitle$,
        exportCertificatesDesc$,
        exportAttendanceTitle$,
        downloadCsvAction$,
        sessionsEmpty$,
        issueCertificateTitle$,
        learnerUsernameLabel$,
        trainingSelectLabel$,
        trainingSelectPlaceholder$,
        issueCertificateAction$,
        certificateIssued$,
        certificateIssueError$,
      } = portalStrings;

      const { userFacilityId } = useAePermissions();
      const api = useTrainingApi();
      const loading = ref(true);
      const issuing = ref(false);
      const sessions = ref([]);
      const trainings = ref([]);
      const usersById = ref({});
      const message = ref('');
      const form = reactive({
        learnerUsername: '',
        trainingId: '',
      });

      const certificatesCsvHref = computed(() => api.certificatesExportUrl());

      function issue() {
        message.value = '';
        const username = form.learnerUsername.trim();
        if (!username || !form.trainingId) {
          message.value = certificateIssueError$();
          return;
        }
        const learner = Object.values(usersById.value).find(
          u => (u.username || '').toLowerCase() === username.toLowerCase(),
        );
        if (!learner) {
          message.value = certificateIssueError$();
          return;
        }
        issuing.value = true;
        api
          .issueCertificate({
            learner: learner.id,
            training: form.trainingId,
          })
          .then(() => {
            message.value = certificateIssued$();
            form.learnerUsername = '';
          })
          .catch(() => {
            message.value = certificateIssueError$();
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
            const map = {};
            (trainingList || []).forEach(t => {
              map[t.id] = t;
            });
            trainings.value = trainingList || [];
            const umap = {};
            (users || []).forEach(u => {
              umap[u.id] = u;
            });
            usersById.value = umap;
            sessions.value = (sessionList || []).map(s => ({
              id: s.id,
              title: (map[s.training] && map[s.training].title) || s.training,
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
        exportCertificatesTitle$,
        exportCertificatesDesc$,
        exportAttendanceTitle$,
        downloadCsvAction$,
        sessionsEmpty$,
        issueCertificateTitle$,
        learnerUsernameLabel$,
        trainingSelectLabel$,
        trainingSelectPlaceholder$,
        issueCertificateAction$,
        loading,
        issuing,
        sessions,
        trainings,
        form,
        message,
        certificatesCsvHref,
        issue,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .ae-page {
    max-width: 880px;
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

  .block {
    margin-bottom: 16px;
    padding: 16px;
    border: 1px solid;
    border-radius: 8px;
  }

  .section-title {
    margin: 0 0 8px;
    font-weight: 600;
  }

  .select-label {
    display: block;
    margin: 8px 0 4px;
  }

  .select {
    display: block;
    width: 100%;
    max-width: 420px;
    min-height: 44px;
    margin-bottom: 12px;
    padding: 8px;
    font-size: 1rem;
  }

  .export-list {
    margin: 12px 0 0;
    padding: 0;
    list-style: none;
  }

  .export-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
</style>
