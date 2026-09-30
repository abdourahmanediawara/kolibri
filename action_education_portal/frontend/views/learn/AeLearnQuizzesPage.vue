<template>

  <AeListPage
    :title="myQuizzes$()"
    :countLabel="learnQuizzesCount$({ count: shownRows.length })"
    :subtitle="learnQuizzesSubtitle$()"
    :bannerTitle="learnQuizzesBannerTitle$()"
    :bannerSubtitle="learnQuizzesBannerSubtitle$()"
    bannerIcon="quiz"
    :loading="isLoading"
    :errorText="errorMessage"
    :items="shownRows"
    :searchFields="['title', 'course']"
    :searchLabel="learnQuizzesSearch$()"
    :searchPlaceholder="learnQuizzesSearch$()"
    :sortOptions="sortOptions"
    :emptyText="learnQuizzesEmpty$()"
    :noMatchText="learnQuizzesNoMatch$()"
    :totalLabel="count => learnQuizzesCount$({ count })"
    @retry="refresh"
  >
    <template #filters>
      <label class="ae-list-filter">
        <span>{{ columnType$() }} :</span>
        <select v-model="kindFilter">
          <option value="">{{ filterAllOption$() }}</option>
          <option value="quiz">{{ quizKindQuiz$() }}</option>
          <option value="exam">{{ quizKindExam$() }}</option>
        </select>
        <AeIcon
          name="chevronDown"
          :size="18"
        />
      </label>
    </template>

    <template #head>
      <th
        scope="col"
        class="ae-list-cell-grow"
      >
        {{ columnEvaluation$() }}
      </th>
      <th scope="col">
        {{ columnType$() }}
      </th>
      <th
        scope="col"
        class="ae-list-cell-secondary"
      >
        {{ columnQuestions$() }}
      </th>
      <th scope="col">
        {{ columnBestScore$() }}
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
          <span
            class="ae-lq-badge"
            :class="item.kind === 'exam' ? 'ae-lq-badge-exam' : 'ae-lq-badge-quiz'"
            aria-hidden="true"
          >
            <AeIcon
              :name="item.kind === 'exam' ? 'award' : 'listChecks'"
              :size="20"
            />
          </span>
          <span class="ae-lq-text">
            <span class="ae-list-cell-name">{{ item.title }}</span>
            <span class="ae-lq-course">{{ item.course }}</span>
          </span>
        </span>
      </td>
      <td class="ae-list-cell-nowrap">
        {{ item.kindLabel }}
      </td>
      <td class="ae-list-cell-nowrap ae-list-cell-secondary">
        {{ item.questions }}
      </td>
      <td class="ae-list-cell-nowrap">
        {{ item.best === null ? '—' : `${item.best} %` }}
      </td>
      <td class="ae-list-cell-nowrap">
        <span
          class="ae-lq-pill"
          :class="`ae-lq-pill-${item.state}`"
        >{{ item.stateLabel }}</span>
      </td>
      <td class="ae-list-cell-shrink">
        <AeRowActions
          :primaryLabel="item.actionLabel"
          :primaryAriaLabel="learnCourseActionOf$({ action: item.actionLabel, name: item.title })"
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
    'myQuizzes$',
    'learnQuizzesCount$',
    'learnQuizzesSubtitle$',
    'learnQuizzesBannerTitle$',
    'learnQuizzesBannerSubtitle$',
    'learnQuizzesSearch$',
    'learnQuizzesEmpty$',
    'learnQuizzesNoMatch$',
    'columnType$',
    'filterAllOption$',
    'quizKindQuiz$',
    'quizKindExam$',
    'columnEvaluation$',
    'columnQuestions$',
    'columnBestScore$',
    'colStatus$',
    'columnActions$',
    'learnCourseActionOf$',
  ];

  /** Every mini quiz and final exam of the learner's courses, with where they stand. */
  export default {
    name: 'AeLearnQuizzesPage',
    components: { AeIcon, AeListPage, AeRowActions },
    setup() {
      const {
        quizKindQuiz$,
        quizKindExam$,
        learnQuizStateTodo$,
        learnQuizStatePassed$,
        learnQuizStateRetry$,
        learnQuizStateClosed$,
        learnCourseStartQuiz$,
        learnQuizRetry$,
        learnQuizSeeAction$,
        sortByName$,
        sortByCourse$,
        sortByToDo$,
        loadError$,
        loadTimeout$,
      } = portalStrings;
      const templateStrings = Object.fromEntries(
        TEMPLATE_STRINGS.map(name => [name, portalStrings[name]]),
      );

      const router = useRouter();
      const api = useTrainingApi();
      const { isLoading, loadError, runLoad } = useAsyncPageLoad('isLoadingLearnerQuizzes');

      const quizzes = ref([]);
      const trainings = ref([]);
      const kindFilter = ref('');

      const errorMessage = computed(() => {
        if (!loadError.value) {
          return '';
        }
        return loadError.value.code === 'AE_REQUEST_TIMEOUT' ? loadTimeout$() : loadError$();
      });

      function stateOf(quiz) {
        if (quiz.my_passed) {
          return 'passed';
        }
        const left = quiz.max_attempts ? quiz.max_attempts - quiz.my_attempts : null;
        if (left === 0) {
          return 'closed';
        }
        return quiz.my_attempts ? 'retry' : 'todo';
      }

      const STATE_LABELS = {
        todo: learnQuizStateTodo$,
        passed: learnQuizStatePassed$,
        retry: learnQuizStateRetry$,
        closed: learnQuizStateClosed$,
      };
      const ACTION_LABELS = {
        todo: learnCourseStartQuiz$,
        passed: learnQuizSeeAction$,
        retry: learnQuizRetry$,
        closed: learnQuizSeeAction$,
      };
      // What to do first: not started, then to retry, then the rest.
      const STATE_ORDER = { todo: 0, retry: 1, passed: 2, closed: 3 };

      const rows = computed(() => {
        const titles = {};
        trainings.value.forEach(training => {
          titles[training.id] = training.title;
        });
        return quizzes.value
          .filter(quiz => titles[quiz.training] && quiz.question_count)
          .map(quiz => {
            const state = stateOf(quiz);
            return {
              id: quiz.id,
              title: quiz.title,
              course: titles[quiz.training],
              kind: quiz.kind,
              kindLabel: quiz.kind === 'exam' ? quizKindExam$() : quizKindQuiz$(),
              questions: quiz.question_count,
              best: quiz.my_best_percent === undefined ? null : quiz.my_best_percent,
              state,
              stateLabel: STATE_LABELS[state](),
              actionLabel: ACTION_LABELS[state](),
              href: router.resolve({
                name: 'AeLearnQuiz',
                params: { trainingId: quiz.training, quizId: quiz.id },
              }).href,
            };
          });
      });

      const shownRows = computed(() =>
        kindFilter.value ? rows.value.filter(row => row.kind === kindFilter.value) : rows.value,
      );

      const collator = new Intl.Collator(currentLanguage, { sensitivity: 'base' });
      const sortOptions = [
        {
          value: 'todo',
          label: sortByToDo$(),
          compare: (a, b) =>
            STATE_ORDER[a.state] - STATE_ORDER[b.state] || collator.compare(a.course, b.course),
        },
        {
          value: 'course',
          label: sortByCourse$(),
          compare: (a, b) => collator.compare(a.course, b.course) || (a.kind === 'exam') - (b.kind === 'exam'),
        },
        { value: 'name', label: sortByName$(), compare: (a, b) => collator.compare(a.title, b.title) },
      ];

      async function refresh() {
        try {
          await runLoad(async () => {
            const [quizList, list] = await Promise.all([api.fetchQuizzes(), api.fetchTrainings()]);
            quizzes.value = (quizList || []).filter(quiz => quiz.status === 'published');
            trainings.value = (list || []).filter(training => training.status === 'published');
          });
        } catch (e) {
          quizzes.value = [];
        }
      }

      onMounted(refresh);

      return {
        ...templateStrings,
        isLoading,
        errorMessage,
        kindFilter,
        shownRows,
        sortOptions,
        refresh,
      };
    },
  };

</script>


<style lang="scss" scoped>

  .ae-lq-badge {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }

  .ae-lq-badge-quiz {
    color: #1f5f99;
    background: var(--ae-kpi-blue);
  }

  .ae-lq-badge-exam {
    color: var(--ae-orange-deep);
    background: var(--ae-kpi-yellow);
  }

  .ae-lq-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
    line-height: 1.3;
  }

  .ae-lq-course {
    overflow: hidden;
    font-size: 14px;
    color: var(--ae-text-subtle);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ae-lq-pill {
    display: inline-block;
    padding: 4px 12px;
    font-size: 14px;
    font-weight: 700;
    border-radius: 999px;
  }

  .ae-lq-pill-todo {
    color: #1f5f99;
    background: var(--ae-kpi-blue);
  }

  .ae-lq-pill-passed {
    color: #1b6e3c;
    background: var(--ae-kpi-green);
  }

  .ae-lq-pill-retry {
    color: var(--ae-orange-deep);
    background: var(--ae-orange-wash);
  }

  .ae-lq-pill-closed {
    color: var(--ae-text-muted);
    background: var(--ae-surface-muted);
  }

</style>
