<template>

  <AeListPage
    :title="resultsTitle$()"
    :countLabel="resultsCount$({ count: rows.length })"
    :subtitle="resultsIntro$()"
    :note="partialError ? resultsPartialError$() : ''"
    :loading="isLoadingResults"
    :errorText="errorMessage"
    :items="rows"
    :sortOptions="sortOptions"
    :emptyText="resultsEmpty$()"
    :noMatchText="resultsEmpty$()"
    :totalLabel="count => resultsCount$({ count })"
    @retry="refresh"
  >
    <template #filters>
      <label
        v-for="filter in filterFields"
        :key="filter.key"
        class="ae-list-filter"
      >
        <span>{{ filter.label }} :</span>
        <select
          v-model="filters[filter.key]"
          @change="loadResults"
        >
          <option value="">
            {{ filterAllOption$() }}
          </option>
          <option
            v-for="option in filter.options"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
        <AeIcon
          name="chevronDown"
          :size="18"
        />
      </label>
    </template>

    <template #head>
      <th scope="col">
        {{ colLearner$() }}
      </th>
      <th
        scope="col"
        class="ae-list-cell-grow"
      >
        {{ colExercise$() }}
      </th>
      <th scope="col">
        {{ colStatus$() }}
      </th>
      <th
        scope="col"
        class="ae-list-head-wrap"
      >
        {{ colScore$() }}
      </th>
      <th
        scope="col"
        class="ae-results-extra"
      >
        {{ colTries$() }}
      </th>
      <th
        scope="col"
        class="ae-list-head-wrap ae-results-extra"
      >
        {{ colMastery$() }}
      </th>
      <th
        scope="col"
        class="ae-list-head-wrap"
      >
        {{ colLastActivity$() }}
      </th>
    </template>
    <template #row="{ item }">
      <td class="ae-list-cell-nowrap">
        <span class="ae-list-cell-main">
          <AeAvatar
            :name="item.learner"
            :toneKey="item.learnerId"
          />
          <span class="ae-list-cell-name">{{ item.learner }}</span>
        </span>
      </td>
      <td class="ae-list-cell-grow ae-results-exercise-cell">
        <span class="ae-results-exercise">
          <span class="ae-list-cell-name">{{ item.exercise }}</span>
          <span
            v-if="item.parent"
            class="ae-results-parent"
          >{{ item.parent }}</span>
        </span>
      </td>
      <td class="ae-list-cell-nowrap">
        <span
          class="ae-results-status"
          :class="`ae-results-status-${item.status}`"
        >{{ item.statusLabel }}</span>
      </td>
      <td class="ae-list-cell-nowrap">
        {{ item.scoreLabel }}
      </td>
      <td class="ae-list-cell-nowrap ae-results-extra">
        {{ item.tries }}
      </td>
      <td class="ae-list-cell-nowrap ae-results-extra">
        {{ item.masteryLabel }}
      </td>
      <td class="ae-list-cell-nowrap">
        {{ item.lastActivityLabel }}
      </td>
    </template>
  </AeListPage>

</template>


<script>

  import { computed, onMounted, reactive, ref } from 'vue';
  import { useRoute } from 'vue-router/composables';
  import { currentLanguage } from 'kolibri/utils/i18n';
  import ClassroomResource from 'kolibri-common/apiResources/ClassroomResource';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';
  import { useTrainingApi, withTimeout } from '../../composables/useTrainingApi';
  import { useAsyncPageLoad } from '../../composables/useAsyncPageLoad';
  import AeAvatar from '../AeAvatar';
  import AeIcon from '../AeIcon';
  import AeListPage from '../AeListPage';

  const STATUS_ORDER = ['completed', 'started', 'not-started'];

  export default {
    name: 'AeCoachResultsPage',
    components: { AeAvatar, AeIcon, AeListPage },
    setup() {
      const {
        resultsTitle$,
        resultsIntro$,
        resultsCount$,
        resultsEmpty$,
        resultsPartialError$,
        resultsLoadError$,
        filterLearnerLabel$,
        filterClassroomLabel$,
        filterTrainingLabel$,
        filterExerciseLabel$,
        filterAllOption$,
        colLearner$,
        colExercise$,
        colStatus$,
        colScore$,
        colTries$,
        colLastActivity$,
        colMastery$,
        statusNotStarted$,
        statusStarted$,
        statusCompleted$,
        scoreUnavailable$,
        sortByActivity$,
        sortByName$,
        loadTimeout$,
      } = portalStrings;

      const route = useRoute();
      const { userFacilityId } = useAePermissions();
      const api = useTrainingApi();
      const {
        isLoading: isLoadingResults,
        loadError,
        runLoad,
      } = useAsyncPageLoad('isLoadingResults');

      const partialError = ref(false);
      const results = ref([]);
      const learnerOptions = ref([]);
      const classroomOptions = ref([]);
      const trainingOptions = ref([]);
      const contentOptions = ref([]);
      // "Voir les résultats" of a learner opens this page already filtered.
      const filters = reactive({
        learner: route.query.learner ? String(route.query.learner) : '',
        classroom: '',
        training: '',
        content_id: '',
      });

      const errorMessage = computed(() => {
        if (!loadError.value) {
          return '';
        }
        if (loadError.value.code === 'AE_REQUEST_TIMEOUT') {
          return loadTimeout$();
        }
        return resultsLoadError$();
      });

      const filterFields = computed(() => [
        { key: 'learner', label: filterLearnerLabel$(), options: learnerOptions.value },
        { key: 'classroom', label: filterClassroomLabel$(), options: classroomOptions.value },
        { key: 'training', label: filterTrainingLabel$(), options: trainingOptions.value },
        { key: 'content_id', label: filterExerciseLabel$(), options: contentOptions.value },
      ]);

      const dateFormat = new Intl.DateTimeFormat(currentLanguage, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      function statusOf(status) {
        if (status === 'completed' || status === 'started') {
          return status;
        }
        return 'not-started';
      }

      const STATUS_LABELS = {
        completed: statusCompleted$,
        started: statusStarted$,
        'not-started': statusNotStarted$,
      };

      const rows = computed(() =>
        results.value.map(row => {
          const status = statusOf(row.status);
          const lastActivity = row.last_activity ? new Date(row.last_activity) : null;
          return {
            id: `${row.learner_id}-${row.content_id}`,
            learnerId: String(row.learner_id),
            learner: row.learner_name,
            exercise: row.content_title,
            parent: row.parent_title || '',
            status,
            statusLabel: STATUS_LABELS[status](),
            scoreLabel: row.score_available
              ? `${row.num_correct || 0} / ${row.num_answered || 0}`
              : scoreUnavailable$(),
            tries: row.tries,
            masteryLabel: row.mastery_level != null ? row.mastery_level : scoreUnavailable$(),
            lastActivity: lastActivity ? lastActivity.getTime() : 0,
            lastActivityLabel: lastActivity ? dateFormat.format(lastActivity) : scoreUnavailable$(),
          };
        }),
      );

      const collator = new Intl.Collator(currentLanguage, { sensitivity: 'base' });
      const sortOptions = [
        {
          value: 'activity',
          label: sortByActivity$(),
          compare: (a, b) => b.lastActivity - a.lastActivity,
        },
        {
          value: 'learner',
          label: sortByName$(),
          compare: (a, b) => collator.compare(a.learner, b.learner),
        },
        {
          value: 'status',
          label: colStatus$(),
          compare: (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
        },
      ];

      function applyResultsPayload(data) {
        results.value = (data && data.results) || [];
        if (data && data.learners) {
          learnerOptions.value = data.learners.map(learner => ({
            value: learner.id,
            label: learner.full_name || learner.username,
          }));
        }
        if (data && data.contents) {
          contentOptions.value = data.contents.map(content => ({
            value: content.content_id,
            label: content.title,
          }));
        }
      }

      function activeFilters() {
        const params = {};
        Object.keys(filters).forEach(key => {
          if (filters[key]) {
            params[key] = filters[key];
          }
        });
        return params;
      }

      async function loadResults() {
        try {
          await runLoad(async () => {
            applyResultsPayload(await api.fetchLearnerResults(activeFilters()));
          });
        } catch (e) {
          results.value = [];
        }
      }

      async function refresh() {
        partialError.value = false;
        try {
          await runLoad(async () => {
            const facilityId = userFacilityId.value;
            const loaded = await Promise.allSettled([
              api.fetchTrainings(),
              facilityId
                ? withTimeout(
                  ClassroomResource.fetchCollection({ getParams: { parent: facilityId } }),
                )
                : Promise.resolve([]),
              api.fetchLearnerResults(activeFilters()),
            ]);
            partialError.value = loaded.some(result => result.status === 'rejected');
            if (loaded[0].status === 'fulfilled') {
              trainingOptions.value = (loaded[0].value || []).map(training => ({
                value: training.id,
                label: training.title,
              }));
            }
            if (loaded[1].status === 'fulfilled') {
              classroomOptions.value = (loaded[1].value || []).map(classroom => ({
                value: classroom.id,
                label: classroom.name,
              }));
            }
            if (loaded[2].status === 'rejected') {
              results.value = [];
              throw loaded[2].reason || new Error('learnerresults failed');
            }
            applyResultsPayload(loaded[2].value || {});
          });
        } catch (e) {
          // loadError is set by runLoad.
        }
      }

      onMounted(refresh);

      return {
        resultsTitle$,
        resultsIntro$,
        resultsCount$,
        resultsEmpty$,
        resultsPartialError$,
        filterAllOption$,
        colLearner$,
        colExercise$,
        colStatus$,
        colScore$,
        colTries$,
        colLastActivity$,
        colMastery$,
        isLoadingResults,
        errorMessage,
        partialError,
        filters,
        filterFields,
        rows,
        sortOptions,
        loadResults,
        refresh,
      };
    },
  };

</script>


<style lang="scss" scoped>

  // The exercise column truncates, but never disappears.
  .ae-results-exercise-cell {
    min-width: 100px;
  }

  .ae-results-exercise {
    display: flex;
    flex-direction: column;
    min-width: 0;
    line-height: 1.3;
  }

  .ae-results-parent {
    overflow: hidden;
    font-size: 14px;
    color: var(--ae-text-subtle);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ae-results-status {
    display: inline-block;
    padding: 4px 12px;
    font-size: 14px;
    font-weight: 700;
    border-radius: 999px;
  }

  .ae-results-status-completed {
    color: #1b6e3c;
    background: var(--ae-kpi-green);
  }

  .ae-results-status-started {
    color: var(--ae-orange-deep);
    background: var(--ae-orange-wash);
  }

  .ae-results-status-not-started {
    color: var(--ae-text-muted);
    background: var(--ae-surface-muted);
  }

  // Narrower computers keep the essential columns.
  @media (max-width: 1365px) {
    .ae-results-extra {
      display: none;
    }
  }

</style>
