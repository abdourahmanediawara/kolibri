<template>

  <div class="ae-play">
    <AePageHeader
      :title="quiz ? quiz.title : quizzesTitle$()"
      :crumbs="crumbs"
      :countLabel="quiz ? kindLabel : ''"
    />

    <KCircularLoader
      v-if="loading"
      :delay="false"
    />
    <div
      v-else-if="loadFailed"
      class="ae-play-alert"
      role="alert"
    >
      <p>{{ loadError$() }}</p>
      <button
        type="button"
        class="ae-play-outline"
        @click="load"
      >
        {{ retryAction$() }}
      </button>
    </div>

    <!-- Before starting -->
    <section
      v-else-if="step === 'intro'"
      class="ae-play-card ae-play-intro"
      aria-labelledby="ae-play-intro-title"
    >
      <span
        class="ae-play-intro-badge"
        :class="{ 'ae-play-intro-badge-exam': isExam }"
        aria-hidden="true"
      >
        <AeIcon
          :name="isExam ? 'award' : 'listChecks'"
          :size="40"
        />
      </span>
      <h2
        id="ae-play-intro-title"
        class="ae-play-intro-title"
      >
        {{ quiz.title }}
      </h2>
      <p
        v-if="quiz.description"
        class="ae-play-intro-text"
      >
        {{ quiz.description }}
      </p>
      <ul class="ae-play-facts">
        <li>
          <AeIcon
            name="circleHelp"
            :size="20"
          />
          <span>{{ learnQuizQuestionsFact$({ count: questions.length }) }}</span>
        </li>
        <li>
          <AeIcon
            name="circleCheck"
            :size="20"
          />
          <span>{{ learnQuizPassFact$({ percent: quiz.pass_percent }) }}</span>
        </li>
        <li>
          <AeIcon
            name="rotateCcw"
            :size="20"
          />
          <span>{{ attemptsLabel }}</span>
        </li>
        <li v-if="quiz.my_best_percent !== null && quiz.my_best_percent !== undefined">
          <AeIcon
            name="chartColumns"
            :size="20"
          />
          <span>{{ learnQuizBestScore$({ percent: quiz.my_best_percent }) }}</span>
        </li>
      </ul>
      <p
        v-if="isExam"
        class="ae-play-intro-note"
      >
        <AeIcon
          name="award"
          :size="20"
        />
        <span>{{ learnQuizExamNote$() }}</span>
      </p>
      <p
        v-if="!questions.length"
        class="ae-play-intro-warning"
      >
        {{ learnQuizEmpty$() }}
      </p>
      <p
        v-else-if="noAttemptsLeft"
        class="ae-play-intro-warning"
      >
        {{ learnQuizNoAttemptsLeft$() }}
      </p>
      <div class="ae-play-intro-actions">
        <router-link
          :to="courseRoute"
          class="ae-play-outline"
        >
          {{ backToCourseAction$() }}
        </router-link>
        <button
          v-if="questions.length && !noAttemptsLeft"
          ref="startButton"
          type="button"
          class="ae-play-primary"
          @click="start"
        >
          <AeIcon
            name="play"
            :size="20"
          />
          <span>{{ learnQuizStart$() }}</span>
        </button>
      </div>
    </section>

    <!-- Answering -->
    <section
      v-else-if="step === 'playing'"
      class="ae-play-card ae-play-board"
      :aria-label="quiz.title"
    >
      <div class="ae-play-top">
        <p
          class="ae-play-counter"
          aria-live="polite"
        >
          {{ learnQuizQuestionOf$({ index: current + 1, total: questions.length }) }}
        </p>
        <div
          class="ae-play-meter"
          role="progressbar"
          aria-valuemin="0"
          :aria-valuemax="questions.length"
          :aria-valuenow="answeredCount"
          :aria-label="learnQuizAnsweredMeter$({
            count: answeredCount,
            total: questions.length,
          })"
        >
          <span
            class="ae-play-meter-fill"
            :style="{ width: `${(answeredCount * 100) / questions.length}%` }"
          ></span>
        </div>
        <ol class="ae-play-dots">
          <li
            v-for="(question, index) in questions"
            :key="question.id"
          >
            <button
              type="button"
              class="ae-play-dot"
              :class="{
                'ae-play-dot-on': index === current,
                'ae-play-dot-done': isAnswered(question),
              }"
              :aria-current="index === current ? 'step' : null"
              :aria-label="
                isAnswered(question)
                  ? learnQuizDotAnswered$({ index: index + 1 })
                  : learnQuizDotEmpty$({ index: index + 1 })
              "
              @click="goTo(index)"
            >
              {{ index + 1 }}
            </button>
          </li>
        </ol>
      </div>

      <fieldset
        :key="currentQuestion.id"
        class="ae-play-question"
      >
        <legend
          ref="prompt"
          class="ae-play-prompt"
          tabindex="-1"
        >
          {{ currentQuestion.prompt }}
        </legend>
        <p class="ae-play-hint">
          {{ hintFor(currentQuestion) }}
          <span v-if="currentQuestion.points > 1">
            · {{ learnQuizPoints$({ count: currentQuestion.points }) }}
          </span>
        </p>
        <ul class="ae-play-choices">
          <li
            v-for="(choice, index) in currentQuestion.choices"
            :key="choice.id"
          >
            <label
              class="ae-play-choice"
              :class="{ 'ae-play-choice-on': isChosen(currentQuestion, choice) }"
            >
              <input
                :type="currentQuestion.kind === 'multiple' ? 'checkbox' : 'radio'"
                :name="`ae-play-${currentQuestion.id}`"
                :value="choice.id"
                :checked="isChosen(currentQuestion, choice)"
                class="ae-play-choice-input"
                @change="choose(currentQuestion, choice, $event.target.checked)"
              >
              <span
                class="ae-play-choice-letter"
                aria-hidden="true"
              >{{ letters[index] }}</span>
              <span class="ae-play-choice-text">{{ choice.text }}</span>
              <AeIcon
                v-if="isChosen(currentQuestion, choice)"
                name="check"
                class="ae-play-choice-check"
                :size="22"
              />
            </label>
          </li>
        </ul>
      </fieldset>

      <div
        v-if="confirming"
        class="ae-play-confirm"
        role="alertdialog"
        aria-labelledby="ae-play-confirm-text"
      >
        <p id="ae-play-confirm-text">
          {{ learnQuizUnanswered$({ count: questions.length - answeredCount }) }}
        </p>
        <div class="ae-play-confirm-actions">
          <button
            ref="keepAnswering"
            type="button"
            class="ae-play-outline"
            @click="goToFirstUnanswered"
          >
            {{ learnQuizKeepAnswering$() }}
          </button>
          <button
            type="button"
            class="ae-play-primary"
            :disabled="submitting"
            @click="submit"
          >
            {{ learnQuizSubmitAnyway$() }}
          </button>
        </div>
      </div>
      <p
        v-if="submitError"
        class="ae-play-error"
        role="alert"
      >
        {{ submitError }}
      </p>

      <div class="ae-play-nav">
        <button
          type="button"
          class="ae-play-outline"
          :disabled="current === 0"
          @click="goTo(current - 1)"
        >
          <AeIcon
            name="arrowLeft"
            :size="20"
          />
          <span>{{ learnQuizPrevious$() }}</span>
        </button>
        <button
          v-if="current < questions.length - 1"
          type="button"
          class="ae-play-primary"
          @click="goTo(current + 1)"
        >
          <span>{{ learnQuizNext$() }}</span>
          <AeIcon
            name="arrowRight"
            :size="20"
          />
        </button>
        <button
          v-else
          type="button"
          class="ae-play-primary"
          :disabled="submitting"
          @click="askSubmit"
        >
          <AeIcon
            name="check"
            :size="20"
          />
          <span>{{ learnQuizSubmit$() }}</span>
        </button>
      </div>
    </section>

    <!-- Result -->
    <div
      v-else-if="step === 'result'"
      class="ae-play-result"
    >
      <section
        class="ae-play-card ae-play-score"
        aria-labelledby="ae-play-score-title"
      >
        <svg
          class="ae-play-ring"
          viewBox="0 0 120 120"
          width="140"
          height="140"
          aria-hidden="true"
        >
          <circle
            class="ae-play-ring-track"
            cx="60"
            cy="60"
            r="52"
          />
          <circle
            class="ae-play-ring-value"
            :class="{ 'ae-play-ring-passed': result.passed }"
            cx="60"
            cy="60"
            r="52"
            :stroke-dasharray="`${(result.percent * RING) / 100} ${RING}`"
          />
          <text
            x="60"
            y="68"
            text-anchor="middle"
            class="ae-play-ring-label"
          >{{ result.percent }} %</text>
        </svg>
        <h2
          id="ae-play-score-title"
          ref="scoreTitle"
          class="ae-play-score-title"
          tabindex="-1"
        >
          {{ result.passed ? learnQuizPassedTitle$() : learnQuizFailedTitle$() }}
        </h2>
        <p class="ae-play-score-line">
          {{ learnQuizScoreLine$({
            score: result.score,
            max: result.max_score,
            percent: result.percent,
          }) }}
        </p>
        <p
          v-if="!result.passed"
          class="ae-play-score-note"
        >
          {{ learnQuizPassNeeded$({ percent: quiz.pass_percent }) }}
        </p>
        <p
          v-if="result.attempts_left !== null && result.attempts_left !== undefined"
          class="ae-play-score-note"
        >
          {{ learnQuizAttemptsLeft$({ count: result.attempts_left }) }}
        </p>
        <div
          v-if="result.certificate_number"
          class="ae-play-certificate"
        >
          <AeIcon
            name="award"
            :size="28"
          />
          <span>{{ learnQuizCertificateEarned$({ number: result.certificate_number }) }}</span>
          <router-link :to="{ name: 'AeLearnProgress' }">
            {{ learnQuizSeeCertificates$() }}
          </router-link>
        </div>
        <div class="ae-play-intro-actions">
          <router-link
            :to="courseRoute"
            class="ae-play-outline"
          >
            {{ backToCourseAction$() }}
          </router-link>
          <button
            v-if="result.attempts_left !== 0"
            type="button"
            class="ae-play-primary"
            @click="restart"
          >
            <AeIcon
              name="rotateCcw"
              :size="20"
            />
            <span>{{ learnQuizRetry$() }}</span>
          </button>
        </div>
      </section>

      <section
        class="ae-play-card ae-play-review"
        aria-labelledby="ae-play-review-title"
      >
        <h2
          id="ae-play-review-title"
          class="ae-play-review-title"
        >
          {{ learnQuizCorrectionsTitle$() }}
        </h2>
        <p
          v-if="!answersShown"
          class="ae-play-score-note"
        >
          {{ learnQuizAnswersHidden$() }}
        </p>
        <ol class="ae-play-review-list">
          <li
            v-for="(item, index) in review"
            :key="item.id"
            class="ae-play-review-item"
          >
            <span
              class="ae-play-review-mark"
              :class="item.correct ? 'ae-play-review-ok' : 'ae-play-review-ko'"
            >
              <AeIcon
                :name="item.correct ? 'circleCheck' : 'circleX'"
                :size="22"
              />
              <span class="ae-play-visually-hidden">
                {{ item.correct ? learnQuizCorrect$() : learnQuizIncorrect$() }}
              </span>
            </span>
            <div class="ae-play-review-body">
              <p class="ae-play-review-prompt">
                {{ index + 1 }}. {{ item.prompt }}
              </p>
              <p class="ae-play-review-line">
                <strong>{{ learnQuizYourAnswer$() }} :</strong>
                {{ item.mine || learnQuizNoAnswer$() }}
              </p>
              <p
                v-if="answersShown && !item.correct"
                class="ae-play-review-line"
              >
                <strong>{{ learnQuizRightAnswer$() }} :</strong>
                {{ item.right }}
              </p>
              <p
                v-if="answersShown && item.explanation"
                class="ae-play-review-explanation"
              >
                <AeIcon
                  name="lightbulb"
                  :size="18"
                />
                <span>{{ item.explanation }}</span>
              </p>
            </div>
          </li>
        </ol>
      </section>
    </div>
  </div>

</template>


<script>

  import { computed, nextTick, onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router/composables';
  import { portalStrings } from '../../strings';
  import { useTrainingApi } from '../../composables/useTrainingApi';
  import AeIcon from '../AeIcon';
  import AePageHeader from '../AePageHeader';

  const TEMPLATE_STRINGS = [
    'quizzesTitle$',
    'loadError$',
    'retryAction$',
    'learnQuizQuestionsFact$',
    'learnQuizPassFact$',
    'learnQuizBestScore$',
    'learnQuizExamNote$',
    'learnQuizEmpty$',
    'learnQuizNoAttemptsLeft$',
    'backToCourseAction$',
    'learnQuizStart$',
    'learnQuizQuestionOf$',
    'learnQuizAnsweredMeter$',
    'learnQuizDotAnswered$',
    'learnQuizDotEmpty$',
    'learnQuizPoints$',
    'learnQuizUnanswered$',
    'learnQuizKeepAnswering$',
    'learnQuizSubmitAnyway$',
    'learnQuizPrevious$',
    'learnQuizNext$',
    'learnQuizSubmit$',
    'learnQuizPassedTitle$',
    'learnQuizFailedTitle$',
    'learnQuizScoreLine$',
    'learnQuizPassNeeded$',
    'learnQuizAttemptsLeft$',
    'learnQuizCertificateEarned$',
    'learnQuizSeeCertificates$',
    'learnQuizRetry$',
    'learnQuizCorrectionsTitle$',
    'learnQuizAnswersHidden$',
    'learnQuizCorrect$',
    'learnQuizIncorrect$',
    'learnQuizYourAnswer$',
    'learnQuizNoAnswer$',
    'learnQuizRightAnswer$',
  ];

  // Circumference of the score ring (r = 52).
  const RING = 2 * Math.PI * 52;

  /**
   * Learners take a mini quiz or the final exam of a course: one question at a
   * time, then their score, the correction and, for a passed exam, the certificate.
   */
  export default {
    name: 'AeLearnQuizPage',
    components: { AeIcon, AePageHeader },
    setup() {
      const {
        myCourses$,
        quizKindQuiz$,
        quizKindExam$,
        learnQuizHintSingle$,
        learnQuizHintMultiple$,
        learnQuizHintTrueFalse$,
        learnQuizAttemptsUnlimited$,
        learnQuizAttemptsLeft$,
        learnQuizSubmitError$,
        learnQuizNoAttemptsLeft$,
      } = portalStrings;
      const templateStrings = Object.fromEntries(
        TEMPLATE_STRINGS.map(name => [name, portalStrings[name]]),
      );

      const route = useRoute();
      const api = useTrainingApi();

      const quiz = ref(null);
      const training = ref(null);
      const loading = ref(true);
      const loadFailed = ref(false);
      const step = ref('intro');
      const current = ref(0);
      const answers = ref({});
      const confirming = ref(false);
      const submitting = ref(false);
      const submitError = ref('');
      const result = ref(null);
      const prompt = ref(null);
      const scoreTitle = ref(null);
      const keepAnswering = ref(null);
      const startButton = ref(null);

      const trainingId = computed(() => route.params.trainingId);
      const courseRoute = computed(() => ({
        name: 'AeLearnCourseDetail',
        params: { trainingId: trainingId.value },
      }));
      const crumbs = computed(() => [
        { label: myCourses$(), to: { name: 'AeLearnFormations' } },
        { label: training.value ? training.value.title : '', to: courseRoute.value },
      ]);

      const questions = computed(() => (quiz.value ? quiz.value.questions || [] : []));
      const currentQuestion = computed(() => questions.value[current.value] || null);
      const isExam = computed(() => Boolean(quiz.value && quiz.value.kind === 'exam'));
      const kindLabel = computed(() => (isExam.value ? quizKindExam$() : quizKindQuiz$()));

      const attemptsLeft = computed(() => {
        if (!quiz.value || !quiz.value.max_attempts) {
          return null;
        }
        return Math.max(quiz.value.max_attempts - (quiz.value.my_attempts || 0), 0);
      });
      const noAttemptsLeft = computed(() => attemptsLeft.value === 0);
      const attemptsLabel = computed(() =>
        attemptsLeft.value === null
          ? learnQuizAttemptsUnlimited$()
          : learnQuizAttemptsLeft$({ count: attemptsLeft.value }),
      );

      function selected(question) {
        return answers.value[question.id] || [];
      }

      function isAnswered(question) {
        return selected(question).length > 0;
      }

      const answeredCount = computed(() => questions.value.filter(isAnswered).length);

      function isChosen(question, choice) {
        return selected(question).includes(choice.id);
      }

      function choose(question, choice, checked) {
        let next;
        if (question.kind === 'multiple') {
          next = checked
            ? [...selected(question), choice.id]
            : selected(question).filter(id => id !== choice.id);
        } else {
          next = [choice.id];
        }
        answers.value = { ...answers.value, [question.id]: next };
      }

      function hintFor(question) {
        if (question.kind === 'multiple') {
          return learnQuizHintMultiple$();
        }
        return question.kind === 'true_false' ? learnQuizHintTrueFalse$() : learnQuizHintSingle$();
      }

      function focusPrompt() {
        nextTick(() => prompt.value && prompt.value.focus());
      }

      function goTo(index) {
        if (index < 0 || index >= questions.value.length) {
          return;
        }
        confirming.value = false;
        current.value = index;
        focusPrompt();
      }

      function start() {
        answers.value = {};
        current.value = 0;
        result.value = null;
        submitError.value = '';
        confirming.value = false;
        step.value = 'playing';
        focusPrompt();
      }

      function askSubmit() {
        if (answeredCount.value < questions.value.length) {
          confirming.value = true;
          nextTick(() => keepAnswering.value && keepAnswering.value.focus());
          return;
        }
        submit();
      }

      function goToFirstUnanswered() {
        const index = questions.value.findIndex(question => !isAnswered(question));
        goTo(index < 0 ? 0 : index);
      }

      async function submit() {
        submitting.value = true;
        submitError.value = '';
        try {
          result.value = await api.submitQuiz(quiz.value.id, answers.value);
          quiz.value = {
            ...quiz.value,
            my_attempts: (quiz.value.my_attempts || 0) + 1,
            my_best_percent: Math.max(quiz.value.my_best_percent || 0, result.value.percent),
            my_passed: quiz.value.my_passed || result.value.passed,
          };
          confirming.value = false;
          step.value = 'result';
          nextTick(() => scoreTitle.value && scoreTitle.value.focus());
        } catch (error) {
          const code = error && error.response && error.response.data;
          const noneLeft = Array.isArray(code) && code[0] && code[0].id === 'NO_ATTEMPTS_LEFT';
          submitError.value = noneLeft ? learnQuizNoAttemptsLeft$() : learnQuizSubmitError$();
        } finally {
          submitting.value = false;
        }
      }

      function restart() {
        step.value = 'intro';
        nextTick(() => startButton.value && startButton.value.focus());
      }

      const answersShown = computed(() =>
        Boolean(result.value && result.value.results.some(item => 'right_choices' in item)),
      );

      const review = computed(() => {
        if (!result.value) {
          return [];
        }
        const byQuestion = {};
        result.value.results.forEach(item => {
          byQuestion[item.question] = item;
        });
        return questions.value.map(question => {
          const graded = byQuestion[question.id] || {};
          const text = ids =>
            question.choices
              .filter(choice => (ids || []).includes(choice.id))
              .map(choice => choice.text)
              .join(', ');
          return {
            id: question.id,
            prompt: question.prompt,
            correct: Boolean(graded.correct),
            mine: text(graded.selected || selected(question)),
            right: text(graded.right_choices),
            explanation: graded.explanation || '',
          };
        });
      });

      async function load() {
        loading.value = true;
        loadFailed.value = false;
        try {
          const [quizData, course] = await Promise.all([
            api.fetchQuiz(route.params.quizId),
            api.fetchTraining(trainingId.value).catch(() => null),
          ]);
          quiz.value = quizData;
          training.value = course;
        } catch (e) {
          loadFailed.value = true;
        } finally {
          loading.value = false;
        }
      }

      onMounted(load);

      return {
        ...templateStrings,
        RING,
        letters: 'ABCDEFGHIJ'.split(''),
        quiz,
        loading,
        loadFailed,
        step,
        current,
        confirming,
        submitting,
        submitError,
        result,
        prompt,
        scoreTitle,
        keepAnswering,
        startButton,
        courseRoute,
        crumbs,
        questions,
        currentQuestion,
        isExam,
        kindLabel,
        noAttemptsLeft,
        attemptsLabel,
        answeredCount,
        answersShown,
        review,
        isAnswered,
        isChosen,
        choose,
        hintFor,
        goTo,
        start,
        askSubmit,
        goToFirstUnanswered,
        submit,
        restart,
        load,
      };
    },
  };

</script>


<style lang="scss" scoped>

  @import '../../styles/tokens';
  @import '../../styles/components';

  .ae-play-visually-hidden {
    @include ae-visually-hidden;
  }

  .ae-play {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .ae-play-card {
    @include ae-card;
  }

  .ae-play-primary {
    @include ae-button-primary;

    min-height: 46px;
    font-size: 17px;
  }

  .ae-play-outline {
    @include ae-button-outline;
  }

  .ae-play-alert {
    @include ae-card;

    color: var(--ae-danger);
  }

  .ae-play-error {
    margin: 0;
    font-weight: 700;
    color: var(--ae-danger);
  }

  /* ---------- Intro ---------- */

  .ae-play-intro {
    display: flex;
    flex-direction: column;
    gap: 14px;
    align-items: center;
    width: 100%;
    max-width: 720px;
    margin: 0 auto;
    text-align: center;
  }

  .ae-play-intro-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 84px;
    height: 84px;
    color: #1f5f99;
    background: var(--ae-kpi-blue);
    border-radius: 50%;
  }

  .ae-play-intro-badge-exam {
    color: var(--ae-orange-deep);
    background: var(--ae-kpi-yellow);
  }

  .ae-play-intro-title {
    margin: 0;
    font-size: 28px;
    font-weight: 800;
    color: var(--ae-navy);
  }

  .ae-play-intro-text {
    margin: 0;
    font-size: 17px;
    color: var(--ae-text-muted);
  }

  .ae-play-facts {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
    padding: 0;
    margin: 4px 0;
    list-style: none;

    li {
      display: inline-flex;
      gap: 8px;
      align-items: center;
      padding: 8px 14px;
      font-size: 15px;
      font-weight: 700;
      color: var(--ae-text);
      background: var(--ae-surface-muted);
      border-radius: 999px;
    }
  }

  .ae-play-intro-note {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    margin: 0;
    font-weight: 700;
    color: var(--ae-orange-deep);
  }

  .ae-play-intro-warning {
    margin: 0;
    font-weight: 700;
    color: var(--ae-danger);
  }

  .ae-play-intro-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
    margin-top: 6px;
  }

  /* ---------- Board ---------- */

  .ae-play-board {
    display: flex;
    flex-direction: column;
    gap: 14px;
    width: 100%;
    max-width: 960px;
    margin: 0 auto;
  }

  .ae-play-top {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 18px;
    align-items: center;
  }

  .ae-play-counter {
    margin: 0;
    font-size: 16px;
    font-weight: 800;
    color: var(--ae-orange-ink);
  }

  .ae-play-meter {
    flex: 1 1 160px;
    height: 10px;
    overflow: hidden;
    background: var(--ae-surface-muted);
    border-radius: 999px;
  }

  .ae-play-meter-fill {
    display: block;
    height: 100%;
    background: var(--ae-orange);
    border-radius: 999px;
    transition: width 200ms ease;

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  }

  .ae-play-dots {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .ae-play-dot {
    width: 34px;
    height: 34px;
    font: inherit;
    font-size: 14px;
    font-weight: 700;
    color: var(--ae-text-muted);
    cursor: pointer;
    background: var(--ae-surface);
    border: 1.5px solid var(--ae-field-line);
    border-radius: 50%;

    @include ae-focus-ring;
  }

  .ae-play-dot-done {
    color: var(--ae-orange-deep);
    background: var(--ae-orange-wash);
    border-color: var(--ae-orange);
  }

  .ae-play-dot-on {
    color: #ffffff;
    background: var(--ae-navy);
    border-color: var(--ae-navy);
  }

  .ae-play-question {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
    padding: 0;
    margin: 0;
    border: 0;
  }

  .ae-play-prompt {
    padding: 0;
    margin-bottom: 4px;
    font-size: 24px;
    font-weight: 800;
    line-height: 1.3;
    color: var(--ae-navy);
    outline: none;
  }

  .ae-play-hint {
    margin: 0;
    font-size: 15px;
    color: var(--ae-text-subtle);
  }

  .ae-play-choices {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .ae-play-choice {
    position: relative;
    display: flex;
    gap: 14px;
    align-items: center;
    min-height: 60px;
    padding: 10px 16px;
    font-size: 17px;
    color: var(--ae-text);
    cursor: pointer;
    background: var(--ae-surface);
    border: 1.5px solid var(--ae-field-line);
    border-radius: var(--ae-radius-md);
    transition:
      border-color 150ms ease,
      background-color 150ms ease;

    &:hover {
      border-color: var(--ae-orange);
    }

    &:focus-within {
      box-shadow: var(--ae-focus-ring);
    }

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  }

  .ae-play-choice-on {
    background: var(--ae-orange-wash);
    border-color: var(--ae-orange);
  }

  .ae-play-choice-input {
    @include ae-visually-hidden;
  }

  .ae-play-choice-letter {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    font-weight: 800;
    color: var(--ae-navy);
    background: var(--ae-surface-muted);
    border-radius: 50%;
  }

  .ae-play-choice-on .ae-play-choice-letter {
    color: #ffffff;
    background: var(--ae-orange);
  }

  .ae-play-choice-text {
    flex: 1;
    min-width: 0;
  }

  .ae-play-choice-check {
    flex-shrink: 0;
    color: var(--ae-orange-ink);
  }

  .ae-play-confirm {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: var(--ae-kpi-yellow);
    border-radius: var(--ae-radius-md);

    p {
      margin: 0;
      font-weight: 700;
      color: var(--ae-text);
    }
  }

  .ae-play-confirm-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .ae-play-nav {
    display: flex;
    gap: 12px;
    justify-content: space-between;
    padding-top: 12px;
    margin-top: auto;
    border-top: 1px solid var(--ae-line);

    .ae-play-outline:disabled {
      cursor: default;
      opacity: 0.45;
    }
  }

  /* ---------- Result ---------- */

  .ae-play-result {
    display: grid;
    grid-template-columns: minmax(280px, 380px) minmax(0, 1fr);
    gap: 18px;
    align-items: start;
  }

  .ae-play-score {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    text-align: center;
  }

  .ae-play-ring {
    transform: rotate(-90deg);
  }

  .ae-play-ring-track {
    fill: none;
    stroke: var(--ae-surface-muted);
    stroke-width: 12;
  }

  .ae-play-ring-value {
    fill: none;
    stroke: var(--ae-orange);
    stroke-linecap: round;
    stroke-width: 12;
  }

  .ae-play-ring-passed {
    stroke: #2e8b57;
  }

  .ae-play-ring-label {
    font-size: 24px;
    font-weight: 800;
    fill: var(--ae-navy);
    transform: rotate(90deg);
    transform-origin: 60px 60px;
  }

  .ae-play-score-title {
    margin: 0;
    font-size: 24px;
    font-weight: 800;
    color: var(--ae-navy);
    outline: none;
  }

  .ae-play-score-line {
    margin: 0;
    font-size: 17px;
    font-weight: 700;
  }

  .ae-play-score-note {
    margin: 0;
    color: var(--ae-text-muted);
  }

  .ae-play-certificate {
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: center;
    width: 100%;
    padding: 12px;
    font-weight: 800;
    color: var(--ae-orange-deep);
    background: var(--ae-kpi-yellow);
    border-radius: var(--ae-radius-md);

    a {
      color: var(--ae-navy);
    }
  }

  .ae-play-review {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 0;
  }

  .ae-play-review-title {
    margin: 0;
    font-size: 20px;
    font-weight: 800;
    color: var(--ae-navy);
  }

  .ae-play-review-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .ae-play-review-item {
    display: flex;
    gap: 12px;
    padding: 12px 14px;
    background: var(--ae-surface-muted);
    border-radius: var(--ae-radius-md);
  }

  .ae-play-review-mark {
    flex-shrink: 0;
    padding-top: 2px;
  }

  .ae-play-review-ok {
    color: #1b6e3c;
  }

  .ae-play-review-ko {
    color: var(--ae-danger);
  }

  .ae-play-review-body {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .ae-play-review-prompt {
    margin: 0;
    font-weight: 800;
    color: var(--ae-navy);
  }

  .ae-play-review-line {
    margin: 0;
    color: var(--ae-text-muted);
  }

  .ae-play-review-explanation {
    display: flex;
    gap: 6px;
    align-items: flex-start;
    margin: 0;
    font-size: 15px;
    color: var(--ae-text);
  }

  // Computers: the page never scrolls; the choices and the correction do.
  @media (min-width: 900px) and (min-height: 640px) {
    .ae-play {
      flex: 1 1 auto;
      min-height: 0;
    }

    .ae-play-board {
      flex: 1 1 auto;
      min-height: 0;
    }

    .ae-play-question {
      flex: 1 1 0;
      min-height: 0;
      overflow-y: auto;
    }

    .ae-play-result {
      flex: 1 1 auto;
      align-items: stretch;
      min-height: 0;
    }

    .ae-play-score {
      justify-content: center;
    }

    .ae-play-review-list {
      flex: 1 1 0;
      min-height: 0;
      overflow-y: auto;
    }
  }

  @media (min-width: 900px) and (max-height: 799px) {
    .ae-play,
    .ae-play-board {
      gap: 10px;
    }

    .ae-play-card {
      padding: 14px 18px;
    }

    .ae-play-prompt {
      font-size: 21px;
    }

    .ae-play-choice {
      min-height: 50px;
    }

    .ae-play-intro-badge {
      width: 64px;
      height: 64px;
    }

    .ae-play-ring {
      width: 110px;
      height: 110px;
    }
  }

  @media (max-width: 1023px) {
    .ae-play-choices {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (max-width: 899px) {
    .ae-play-result {
      grid-template-columns: minmax(0, 1fr);
    }
  }

</style>
