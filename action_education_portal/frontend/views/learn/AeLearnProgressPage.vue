<template>

  <AeListPage
    :title="progressTitle$()"
    :countLabel="coursesCount$({ count: rows.length })"
    :subtitle="learnProgressSubtitle$()"
    :loading="isLoading"
    :errorText="errorMessage"
    :items="rows"
    :searchFields="['title']"
    :searchLabel="coursesSearchLabel$()"
    :searchPlaceholder="coursesSearchPlaceholder$()"
    :sortOptions="sortOptions"
    :emptyText="learnProgressEmpty$()"
    :noMatchText="coursesNoMatch$()"
    :totalLabel="count => coursesCount$({ count })"
    @retry="refresh"
  >
    <template #banner>
      <ul
        v-if="!isLoading && !errorMessage"
        class="ae-lp-kpis"
      >
        <li
          v-for="card in kpis"
          :key="card.id"
          class="ae-lp-kpi"
        >
          <span
            class="ae-lp-kpi-badge"
            :class="`ae-lp-tone-${card.tone}`"
            aria-hidden="true"
          >
            <AeIcon
              :name="card.icon"
              :size="24"
            />
          </span>
          <span class="ae-lp-kpi-text">
            <span class="ae-lp-kpi-value">{{ card.value }}</span>
            <span class="ae-lp-kpi-label">{{ card.label }}</span>
          </span>
        </li>
      </ul>
    </template>

    <template #head>
      <th
        scope="col"
        class="ae-list-cell-grow"
      >
        {{ columnCourse$() }}
      </th>
      <th scope="col">
        {{ columnProgress$() }}
      </th>
      <th
        scope="col"
        class="ae-list-cell-secondary"
      >
        {{ columnSupportsSeen$() }}
      </th>
      <th
        scope="col"
        class="ae-list-cell-secondary"
      >
        {{ columnQuizzesPassed$() }}
      </th>
      <th scope="col">
        {{ quizKindExam$() }}
      </th>
      <th scope="col">
        {{ columnCertificate$() }}
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
          <span class="ae-list-cell-name">{{ item.title }}</span>
        </span>
      </td>
      <td class="ae-list-cell-nowrap">
        <span class="ae-lp-progress">
          <span
            class="ae-lp-bar"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="item.percent"
            :aria-label="progressOf$({ name: item.title })"
          >
            <span
              class="ae-lp-bar-fill"
              :class="{ 'ae-lp-bar-done': item.completed }"
              :style="{ width: `${item.percent}%` }"
            ></span>
          </span>
          <span>{{ item.percent }} %</span>
        </span>
      </td>
      <td class="ae-list-cell-nowrap ae-list-cell-secondary">
        {{ item.supports }}
      </td>
      <td class="ae-list-cell-nowrap ae-list-cell-secondary">
        {{ item.quizzes }}
      </td>
      <td class="ae-list-cell-nowrap">
        <span
          v-if="item.examPassed"
          class="ae-lp-pill ae-lp-pill-ok"
        >{{ learnExamPassed$({ percent: item.examBest }) }}</span>
        <span v-else>{{ item.exam }}</span>
      </td>
      <td class="ae-list-cell-nowrap">
        <a
          v-if="item.certificateHref"
          class="ae-lp-certificate"
          :href="item.certificateHref"
          target="_blank"
          rel="noopener"
          :aria-label="learnPrintCertificateOf$({ name: item.title })"
        >
          <AeIcon
            name="award"
            :size="18"
          />
          <span>{{ learnPrintCertificate$() }}</span>
        </a>
        <span v-else>—</span>
      </td>
      <td class="ae-list-cell-shrink">
        <AeRowActions
          :primaryLabel="openCourseAction$()"
          :primaryAriaLabel="openCourseOf$({ name: item.title })"
          :primaryHref="item.href"
        />
      </td>
    </template>
  </AeListPage>

</template>


<script>

  import { computed, onMounted, ref } from 'vue';
  import { useRouter } from 'vue-router/composables';
  import { currentLanguage } from 'kolibri/utils/i18n';
  import { portalStrings } from '../../strings';
  import { useTrainingApi } from '../../composables/useTrainingApi';
  import { useAsyncPageLoad } from '../../composables/useAsyncPageLoad';
  import AeIcon from '../AeIcon';
  import AeListPage from '../AeListPage';
  import AeRowActions from '../AeRowActions';

  const TEMPLATE_STRINGS = [
    'progressTitle$',
    'coursesCount$',
    'learnProgressSubtitle$',
    'coursesSearchLabel$',
    'coursesSearchPlaceholder$',
    'learnProgressEmpty$',
    'coursesNoMatch$',
    'columnCourse$',
    'columnProgress$',
    'columnSupportsSeen$',
    'columnQuizzesPassed$',
    'quizKindExam$',
    'columnCertificate$',
    'columnActions$',
    'progressOf$',
    'learnExamPassed$',
    'learnPrintCertificate$',
    'learnPrintCertificateOf$',
    'openCourseAction$',
    'openCourseOf$',
  ];

  /** The learner's progress in each course they started, and their certificates. */
  export default {
    name: 'AeLearnProgressPage',
    components: { AeIcon, AeListPage, AeRowActions },
    setup() {
      const {
        learnKpiStarted$,
        learnKpiCompleted$,
        learnKpiQuizzesPassed$,
        learnKpiCertificates$,
        learnExamBest$,
        sortByProgress$,
        sortByName$,
        sortByRecent$,
        loadError$,
        loadTimeout$,
      } = portalStrings;
      const templateStrings = Object.fromEntries(
        TEMPLATE_STRINGS.map(name => [name, portalStrings[name]]),
      );

      const router = useRouter();
      const api = useTrainingApi();
      const { isLoading, loadError, runLoad } = useAsyncPageLoad('isLoadingLearnerProgress');

      const progress = ref([]);
      const trainings = ref([]);
      const certificates = ref([]);

      const errorMessage = computed(() => {
        if (!loadError.value) {
          return '';
        }
        return loadError.value.code === 'AE_REQUEST_TIMEOUT' ? loadTimeout$() : loadError$();
      });

      const rows = computed(() => {
        const titles = {};
        trainings.value.forEach(training => {
          titles[training.id] = training.title;
        });
        const certificateIds = {};
        certificates.value.forEach(certificate => {
          certificateIds[certificate.training] = certificate.id;
        });
        return progress.value
          .filter(row => row.started && titles[row.training])
          .map(row => {
            let exam = '—';
            if (row.has_exam && row.exam_best_percent !== null) {
              exam = learnExamBest$({ percent: row.exam_best_percent });
            }
            return {
              id: row.training,
              title: titles[row.training],
              percent: row.percent,
              completed: row.completed,
              supports: `${row.resources_viewed} / ${row.resources_total}`,
              quizzes: `${row.quizzes_passed} / ${row.quizzes_total}`,
              exam,
              examPassed: row.exam_passed,
              examBest: row.exam_best_percent,
              certificateHref: certificateIds[row.training]
                ? api.certificatePrintUrl(certificateIds[row.training])
                : '',
              lastActivity: row.last_activity ? new Date(row.last_activity).getTime() : 0,
              href: router.resolve({
                name: 'AeLearnCourseDetail',
                params: { trainingId: row.training },
              }).href,
            };
          });
      });

      const kpis = computed(() => [
        {
          id: 'started',
          value: rows.value.length,
          label: learnKpiStarted$(),
          icon: 'bookOpen',
          tone: 'blue',
        },
        {
          id: 'completed',
          value: rows.value.filter(row => row.completed).length,
          label: learnKpiCompleted$(),
          icon: 'circleCheck',
          tone: 'green',
        },
        {
          id: 'quizzes',
          value: progress.value.reduce((total, row) => total + (row.quizzes_passed || 0), 0),
          label: learnKpiQuizzesPassed$(),
          icon: 'listChecks',
          tone: 'purple',
        },
        {
          id: 'certificates',
          value: certificates.value.length,
          label: learnKpiCertificates$(),
          icon: 'award',
          tone: 'yellow',
        },
      ]);

      const collator = new Intl.Collator(currentLanguage, { sensitivity: 'base' });
      const sortOptions = [
        {
          value: 'recent',
          label: sortByRecent$(),
          compare: (a, b) => b.lastActivity - a.lastActivity,
        },
        { value: 'progress', label: sortByProgress$(), compare: (a, b) => b.percent - a.percent },
        { value: 'name', label: sortByName$(), compare: (a, b) => collator.compare(a.title, b.title) },
      ];

      async function refresh() {
        try {
          await runLoad(async () => {
            const [mine, list, certificateList] = await Promise.all([
              api.fetchMyProgress(),
              api.fetchTrainings(),
              api.fetchCertificates().catch(() => []),
            ]);
            progress.value = mine || [];
            trainings.value = list || [];
            certificates.value = certificateList || [];
          });
        } catch (e) {
          progress.value = [];
        }
      }

      onMounted(refresh);

      return {
        ...templateStrings,
        isLoading,
        errorMessage,
        rows,
        kpis,
        sortOptions,
        refresh,
      };
    },
  };

</script>


<style lang="scss" scoped>

  .ae-lp-kpis {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .ae-lp-kpi {
    display: flex;
    gap: 14px;
    align-items: center;
    padding: 14px 18px;
    background: var(--ae-surface);
    border: 1px solid var(--ae-line);
    border-radius: var(--ae-radius-lg);
    box-shadow: var(--ae-shadow-card);
  }

  .ae-lp-kpi-badge {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
  }

  .ae-lp-tone-blue {
    color: #1f5f99;
    background: var(--ae-kpi-blue);
  }

  .ae-lp-tone-green {
    color: #1b6e3c;
    background: var(--ae-kpi-green);
  }

  .ae-lp-tone-purple {
    color: #6d2e7f;
    background: var(--ae-kpi-purple);
  }

  .ae-lp-tone-yellow {
    color: var(--ae-orange-deep);
    background: var(--ae-kpi-yellow);
  }

  .ae-lp-kpi-text {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
  }

  .ae-lp-kpi-value {
    font-size: 28px;
    font-weight: 800;
    color: var(--ae-navy);
  }

  .ae-lp-kpi-label {
    font-size: 15px;
    color: var(--ae-text-muted);
  }

  .ae-lp-progress {
    display: inline-flex;
    gap: 10px;
    align-items: center;
  }

  .ae-lp-bar {
    display: block;
    width: 110px;
    height: 10px;
    overflow: hidden;
    background: var(--ae-surface-muted);
    border-radius: 999px;
  }

  .ae-lp-bar-fill {
    display: block;
    height: 100%;
    background: var(--ae-orange);
    border-radius: 999px;
  }

  .ae-lp-bar-done {
    background: #2e8b57;
  }

  .ae-lp-pill {
    display: inline-block;
    padding: 4px 12px;
    font-size: 14px;
    font-weight: 700;
    border-radius: 999px;
  }

  .ae-lp-pill-ok {
    color: #1b6e3c;
    background: var(--ae-kpi-green);
  }

  .ae-lp-certificate {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    font-weight: 700;
    color: var(--ae-orange-ink);
  }

  @media (max-width: 1100px) {
    .ae-lp-kpis {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

</style>
