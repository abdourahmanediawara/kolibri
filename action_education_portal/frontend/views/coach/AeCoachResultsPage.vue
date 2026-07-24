<template>
  <div
    class="ae-page"
    :style="{ color: $themeTokens.text }"
  >
    <h1 class="title">
      {{ resultsTitle$() }}
    </h1>
    <p
      class="intro"
      :style="{ color: $themeTokens.annotation }"
    >
      {{ resultsIntro$() }}
    </p>

    <section
      class="filters"
      :style="{
        backgroundColor: $themeTokens.surface,
        borderColor: $themeTokens.fineLine,
      }"
    >
      <label class="filter">
        <span>{{ filterLearnerLabel$() }}</span>
        <select
          v-model="filters.learner"
          class="select"
        >
          <option value="">
            {{ filterAllOption$() }}
          </option>
          <option
            v-for="learner in learnerOptions"
            :key="learner.id"
            :value="learner.id"
          >
            {{ learner.label }}
          </option>
        </select>
      </label>
      <label class="filter">
        <span>{{ filterClassroomLabel$() }}</span>
        <select
          v-model="filters.classroom"
          class="select"
        >
          <option value="">
            {{ filterAllOption$() }}
          </option>
          <option
            v-for="classroom in classroomOptions"
            :key="classroom.id"
            :value="classroom.id"
          >
            {{ classroom.name }}
          </option>
        </select>
      </label>
      <label class="filter">
        <span>{{ filterTrainingLabel$() }}</span>
        <select
          v-model="filters.training"
          class="select"
        >
          <option value="">
            {{ filterAllOption$() }}
          </option>
          <option
            v-for="training in trainingOptions"
            :key="training.id"
            :value="training.id"
          >
            {{ training.title }}
          </option>
        </select>
      </label>
      <label class="filter">
        <span>{{ filterExerciseLabel$() }}</span>
        <select
          v-model="filters.content_id"
          class="select"
        >
          <option value="">
            {{ filterAllOption$() }}
          </option>
          <option
            v-for="content in contentOptions"
            :key="content.content_id"
            :value="content.content_id"
          >
            {{ content.title }}
          </option>
        </select>
      </label>
      <KButton
        :text="applyFiltersAction$()"
        :primary="true"
        @click="loadResults"
      />
    </section>

    <p
      v-if="partialError"
      class="banner"
      :style="{ color: $themeTokens.annotation }"
    >
      {{ resultsPartialError$() }}
    </p>
    <p
      v-if="loadError"
      class="banner"
      role="alert"
      :style="{ color: $themeTokens.error }"
    >
      {{ resultsLoadError$() }}
    </p>

    <KCircularLoader
      v-if="loading"
      :delay="false"
    />

    <template v-else-if="!loadError">
      <p
        v-if="!rows.length"
        :style="{ color: $themeTokens.annotation }"
      >
        {{ resultsEmpty$() }}
      </p>
      <div
        v-else
        class="table-wrap"
      >
        <table class="results-table">
          <thead>
            <tr>
              <th>{{ colLearner$() }}</th>
              <th>{{ colExercise$() }}</th>
              <th>{{ colParent$() }}</th>
              <th>{{ colStatus$() }}</th>
              <th>{{ colScore$() }}</th>
              <th>{{ colTries$() }}</th>
              <th>{{ colMastery$() }}</th>
              <th>{{ colLastActivity$() }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in rows"
              :key="`${row.learner_id}-${row.content_id}`"
            >
              <td>{{ row.learner_name }}</td>
              <td>{{ row.content_title }}</td>
              <td>{{ row.parent_title || scoreUnavailable$() }}</td>
              <td>{{ statusLabel(row.status) }}</td>
              <td>{{ scoreLabel(row) }}</td>
              <td>{{ row.tries }}</td>
              <td>
                {{
                  row.mastery_level != null ? row.mastery_level : scoreUnavailable$()
                }}
              </td>
              <td>{{ formatDate(row.last_activity) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

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
      <KButton
        :text="downloadCsvAction$()"
        :primary="false"
        :href="certificatesCsvHref"
      />
      <ul
        v-if="certificates.length"
        class="cert-list"
      >
        <li
          v-for="cert in certificates"
          :key="cert.id"
          class="cert-row"
        >
          <span>{{ cert.number }} — {{ cert.meta }}</span>
          <KButton
            :text="printCertificateAction$()"
            :primary="true"
            :href="cert.printHref"
            target="_blank"
          />
        </li>
      </ul>
      <p
        v-else
        :style="{ color: $themeTokens.annotation }"
      >
        {{ certificatesEmpty$() }}
      </p>
    </section>
  </div>
</template>

<script>
  import { computed, onMounted, ref } from 'vue';
  import ClassroomResource from 'kolibri-common/apiResources/ClassroomResource';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';
  import { useTrainingApi } from '../../composables/useTrainingApi';

  export default {
    name: 'AeCoachResultsPage',
    setup() {
      const {
        resultsTitle$,
        resultsIntro$,
        resultsEmpty$,
        resultsPartialError$,
        resultsLoadError$,
        filterLearnerLabel$,
        filterClassroomLabel$,
        filterTrainingLabel$,
        filterExerciseLabel$,
        filterAllOption$,
        applyFiltersAction$,
        colLearner$,
        colExercise$,
        colParent$,
        colStatus$,
        colScore$,
        colTries$,
        colLastActivity$,
        colMastery$,
        statusNotStarted$,
        statusStarted$,
        statusCompleted$,
        scoreUnavailable$,
        exportCertificatesTitle$,
        downloadCsvAction$,
        certificatesEmpty$,
        printCertificateAction$,
      } = portalStrings;

      const { userFacilityId } = useAePermissions();
      const api = useTrainingApi();

      const loading = ref(true);
      const loadError = ref(false);
      const partialError = ref(false);
      const rows = ref([]);
      const learnerOptions = ref([]);
      const classroomOptions = ref([]);
      const trainingOptions = ref([]);
      const contentOptions = ref([]);
      const certificates = ref([]);
      const filters = ref({
        learner: '',
        classroom: '',
        training: '',
        content_id: '',
      });

      const certificatesCsvHref = computed(() => api.certificatesExportUrl());

      function statusLabel(status) {
        if (status === 'completed') {
          return statusCompleted$();
        }
        if (status === 'started') {
          return statusStarted$();
        }
        return statusNotStarted$();
      }

      function scoreLabel(row) {
        if (!row.score_available) {
          return scoreUnavailable$();
        }
        const correct = row.num_correct != null ? row.num_correct : 0;
        const answered = row.num_answered != null ? row.num_answered : 0;
        return `${correct} / ${answered}`;
      }

      function formatDate(value) {
        if (!value) {
          return scoreUnavailable$();
        }
        try {
          return new Date(value).toLocaleString();
        } catch (e) {
          return String(value);
        }
      }

      function loadResults() {
        loading.value = true;
        loadError.value = false;
        const params = {};
        Object.keys(filters.value).forEach(key => {
          if (filters.value[key]) {
            params[key] = filters.value[key];
          }
        });
        return api
          .fetchLearnerResults(params)
          .then(data => {
            rows.value = data.results || [];
            if (!learnerOptions.value.length && data.learners) {
              learnerOptions.value = (data.learners || []).map(l => ({
                id: l.id,
                label: l.full_name || l.username,
              }));
            }
            if (data.contents && data.contents.length) {
              contentOptions.value = data.contents;
            }
          })
          .catch(() => {
            loadError.value = true;
            rows.value = [];
          })
          .finally(() => {
            loading.value = false;
          });
      }

      onMounted(() => {
        Promise.allSettled([
          api.fetchTrainings(),
          api.fetchCertificates(),
          ClassroomResource.fetchCollection({
            getParams: { facility: userFacilityId.value },
          }),
          api.fetchLearnerResults({}),
        ]).then(results => {
          partialError.value = results.some(r => r.status === 'rejected');
          if (results[0].status === 'fulfilled') {
            trainingOptions.value = results[0].value || [];
          }
          if (results[1].status === 'fulfilled') {
            const certList = results[1].value || [];
            const tmap = {};
            (trainingOptions.value || []).forEach(t => {
              tmap[t.id] = t;
            });
            certificates.value = certList.map(c => ({
              id: c.id,
              number: c.certificate_number,
              meta: [c.learner, tmap[c.training] && tmap[c.training].title]
                .filter(Boolean)
                .join(' · '),
              printHref: api.certificatePrintUrl(c.id),
            }));
          }
          if (results[2].status === 'fulfilled') {
            classroomOptions.value = results[2].value || [];
          }
          if (results[3].status === 'fulfilled') {
            const data = results[3].value || {};
            rows.value = data.results || [];
            learnerOptions.value = (data.learners || []).map(l => ({
              id: l.id,
              label: l.full_name || l.username,
            }));
            contentOptions.value = data.contents || [];
          } else {
            loadError.value = true;
          }
          loading.value = false;
        });
      });

      return {
        resultsTitle$,
        resultsIntro$,
        resultsEmpty$,
        resultsPartialError$,
        resultsLoadError$,
        filterLearnerLabel$,
        filterClassroomLabel$,
        filterTrainingLabel$,
        filterExerciseLabel$,
        filterAllOption$,
        applyFiltersAction$,
        colLearner$,
        colExercise$,
        colParent$,
        colStatus$,
        colScore$,
        colTries$,
        colLastActivity$,
        colMastery$,
        scoreUnavailable$,
        exportCertificatesTitle$,
        downloadCsvAction$,
        certificatesEmpty$,
        printCertificateAction$,
        loading,
        loadError,
        partialError,
        rows,
        filters,
        learnerOptions,
        classroomOptions,
        trainingOptions,
        contentOptions,
        certificates,
        certificatesCsvHref,
        statusLabel,
        scoreLabel,
        formatDate,
        loadResults,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .ae-page {
    max-width: 1100px;
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

  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: flex-end;
    margin-bottom: 16px;
    padding: 16px;
    border: 1px solid;
    border-radius: 8px;
  }

  .filter {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 140px;
  }

  .select {
    min-height: 36px;
    padding: 4px 8px;
  }

  .banner {
    margin: 0 0 12px;
  }

  .table-wrap {
    overflow-x: auto;
    margin-bottom: 24px;
  }

  .results-table {
    width: 100%;
    border-collapse: collapse;
  }

  .results-table th,
  .results-table td {
    padding: 8px 10px;
    text-align: start;
    border-bottom: 1px solid;
    border-color: inherit;
    vertical-align: top;
  }

  .block {
    margin-top: 24px;
    padding: 16px;
    border: 1px solid;
    border-radius: 8px;
  }

  .section-title {
    margin: 0 0 12px;
    font-weight: 600;
  }

  .cert-list {
    margin: 16px 0 0;
    padding: 0;
    list-style: none;
  }

  .cert-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
</style>
