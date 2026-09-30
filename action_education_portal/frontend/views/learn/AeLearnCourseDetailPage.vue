<template>

  <div class="ae-course">
    <AePageHeader
      :title="training ? training.title : myCourses$()"
      :crumbs="[{ label: myCourses$(), to: { name: 'AeLearnFormations' } }]"
      :countLabel="progress ? learnCoursePercentDone$({ percent: progress.percent }) : ''"
      :subtitle="training && training.description ? training.description : ''"
      :note="trainerNote"
      :action="certificateAction"
    />

    <KCircularLoader
      v-if="isLoading"
      :delay="false"
    />
    <div
      v-else-if="loadError"
      class="ae-course-alert"
      role="alert"
    >
      <p>{{ errorMessage }}</p>
      <button
        type="button"
        class="ae-course-outline"
        @click="refresh"
      >
        {{ retryAction$() }}
      </button>
    </div>
    <p
      v-else-if="!steps.length"
      class="ae-course-card ae-course-empty"
    >
      {{ learnCourseEmpty$() }}
    </p>

    <div
      v-else
      class="ae-course-grid"
    >
      <!-- Path: every step of the course -->
      <nav
        class="ae-course-card ae-course-path"
        :aria-label="learnCoursePathTitle$()"
      >
        <div class="ae-course-path-head">
          <h2 class="ae-course-path-title">
            {{ learnCoursePathTitle$() }}
          </h2>
          <span class="ae-course-path-count">
            {{ learnCourseStepsDone$({ done: doneCount, total: steps.length }) }}
          </span>
        </div>
        <div
          class="ae-course-meter"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="progress ? progress.percent : 0"
          :aria-label="progressOf$({ name: training.title })"
        >
          <span
            class="ae-course-meter-fill"
            :style="{ width: `${progress ? progress.percent : 0}%` }"
          ></span>
        </div>
        <p
          v-if="progress && progress.completed"
          class="ae-course-done"
        >
          <AeIcon
            name="award"
            :size="20"
          />
          <span>{{ learnCourseCompleted$() }}</span>
        </p>

        <ol class="ae-course-steps">
          <li
            v-for="(step, index) in steps"
            :key="step.key"
          >
            <p
              v-if="index === 0 || steps[index - 1].group !== step.group"
              class="ae-course-steps-group"
            >
              {{ step.group === 'supports' ? learnCourseSupportsHeading$() : learnCourseQuizzesHeading$() }}
            </p>
            <button
              type="button"
              class="ae-course-step"
              :class="{ 'ae-course-step-on': step.key === currentKey }"
              :aria-current="step.key === currentKey ? 'step' : null"
              @click="select(step.key)"
            >
              <span
                class="ae-course-step-icon"
                :class="`ae-course-tone-${step.tone}`"
                aria-hidden="true"
              >
                <AeIcon
                  :name="step.icon"
                  :size="20"
                />
              </span>
              <span class="ae-course-step-text">
                <span class="ae-course-step-title">{{ step.title }}</span>
                <span class="ae-course-step-meta">{{ step.meta }}</span>
              </span>
              <span
                class="ae-course-step-state"
                :class="{ 'ae-course-step-state-done': step.done }"
              >
                <AeIcon
                  v-if="step.done"
                  name="check"
                  :size="16"
                  :strokeWidth="3"
                />
                <span class="ae-course-visually-hidden">
                  {{ step.done ? learnCourseStepDone$() : learnCourseStepTodo$() }}
                </span>
              </span>
            </button>
          </li>
        </ol>
      </nav>

      <!-- Stage: the step being studied -->
      <section
        v-if="currentStep"
        class="ae-course-card ae-course-stage"
        aria-labelledby="ae-course-stage-title"
      >
        <header class="ae-course-stage-head">
          <span
            class="ae-course-step-icon ae-course-stage-icon"
            :class="`ae-course-tone-${currentStep.tone}`"
            aria-hidden="true"
          >
            <AeIcon
              :name="currentStep.icon"
              :size="22"
            />
          </span>
          <div class="ae-course-stage-text">
            <h2
              id="ae-course-stage-title"
              ref="stageTitle"
              class="ae-course-stage-title"
              tabindex="-1"
            >
              {{ currentStep.title }}
            </h2>
            <p class="ae-course-stage-meta">
              {{ currentStep.meta }}
            </p>
          </div>
          <a
            v-if="currentStep.type === 'support' && currentStep.external"
            class="ae-course-outline"
            :href="currentStep.resource.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AeIcon
              name="externalLink"
              :size="18"
            />
            <span>{{ currentStep.kind === 'youtube' ? openOnYoutube$() : openLinkAction$() }}</span>
          </a>
          <a
            v-else-if="currentStep.type === 'support'"
            class="ae-course-outline"
            :href="api.resourceDownloadUrl(currentStep.resource.id)"
            download
          >
            <AeIcon
              name="download"
              :size="18"
            />
            <span>{{ downloadResourceAction$() }}</span>
          </a>
        </header>

        <div
          v-if="currentStep.type === 'support'"
          class="ae-course-stage-body"
          :class="`ae-course-stage-${currentStep.kind}`"
        >
          <AeResourceMedia
            :resource="currentStep.resource"
            :src="api.resourceViewUrl(currentStep.resource.id)"
          />
        </div>

        <div
          v-else
          class="ae-course-stage-body ae-course-quiz"
        >
          <span
            class="ae-course-quiz-badge"
            :class="{ 'ae-course-quiz-badge-exam': currentStep.quiz.kind === 'exam' }"
            aria-hidden="true"
          >
            <AeIcon
              :name="currentStep.icon"
              :size="40"
            />
          </span>
          <p
            v-if="currentStep.quiz.description"
            class="ae-course-quiz-text"
          >
            {{ currentStep.quiz.description }}
          </p>
          <ul class="ae-course-quiz-facts">
            <li>{{ learnQuizQuestionsFact$({ count: currentStep.quiz.question_count }) }}</li>
            <li>{{ learnQuizPassFact$({ percent: currentStep.quiz.pass_percent }) }}</li>
            <li v-if="currentStep.quiz.my_best_percent !== null">
              {{ learnQuizBestScore$({ percent: currentStep.quiz.my_best_percent }) }}
            </li>
          </ul>
          <p
            v-if="currentStep.done"
            class="ae-course-quiz-passed"
          >
            <AeIcon
              name="circleCheck"
              :size="22"
            />
            <span>{{ learnCourseQuizPassed$() }}</span>
          </p>
          <p
            v-else-if="currentStep.quiz.kind === 'exam'"
            class="ae-course-quiz-note"
          >
            {{ learnQuizExamNote$() }}
          </p>
          <router-link
            class="ae-course-primary"
            :to="{
              name: 'AeLearnQuiz',
              params: { trainingId: training.id, quizId: currentStep.quiz.id },
            }"
          >
            <AeIcon
              :name="currentStep.quiz.my_attempts ? 'rotateCcw' : 'play'"
              :size="20"
            />
            <span>
              {{ currentStep.quiz.my_attempts ? learnQuizRetry$() : learnCourseStartQuiz$() }}
            </span>
          </router-link>
        </div>

        <footer class="ae-course-stage-foot">
          <button
            type="button"
            class="ae-course-outline"
            :disabled="currentIndex === 0"
            @click="move(-1)"
          >
            <AeIcon
              name="arrowLeft"
              :size="18"
            />
            <span>{{ previousStepAction$() }}</span>
          </button>
          <button
            type="button"
            class="ae-course-outline"
            :disabled="currentIndex === steps.length - 1"
            @click="move(1)"
          >
            <span>{{ nextStepAction$() }}</span>
            <AeIcon
              name="arrowRight"
              :size="18"
            />
          </button>
        </footer>
      </section>
    </div>
  </div>

</template>


<script>

  import { computed, nextTick, onMounted, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router/composables';
  import { portalStrings } from '../../strings';
  import { useTrainingApi } from '../../composables/useTrainingApi';
  import { useAsyncPageLoad } from '../../composables/useAsyncPageLoad';
  import { useAePermissions } from '../../composables/useAePermissions';
  import { formatCourseSize } from '../../composables/courseSize';
  import { previewIcon, previewKind } from '../../composables/resourceMedia';
  import AeIcon from '../AeIcon';
  import AePageHeader from '../AePageHeader';
  import AeResourceMedia from '../AeResourceMedia';

  const TEMPLATE_STRINGS = [
    'myCourses$',
    'learnCoursePercentDone$',
    'retryAction$',
    'learnCourseEmpty$',
    'learnCoursePathTitle$',
    'learnCourseStepsDone$',
    'progressOf$',
    'learnCourseCompleted$',
    'learnCourseSupportsHeading$',
    'learnCourseQuizzesHeading$',
    'learnCourseStepDone$',
    'learnCourseStepTodo$',
    'openOnYoutube$',
    'openLinkAction$',
    'downloadResourceAction$',
    'learnQuizQuestionsFact$',
    'learnQuizPassFact$',
    'learnQuizBestScore$',
    'learnCourseQuizPassed$',
    'learnQuizExamNote$',
    'learnQuizRetry$',
    'learnCourseStartQuiz$',
    'previousStepAction$',
    'nextStepAction$',
  ];

  const EXTERNAL_KINDS = ['youtube', 'link'];
  const KIND_TONES = {
    video: 'red',
    youtube: 'red',
    audio: 'purple',
    image: 'green',
    pdf: 'blue',
    link: 'mint',
    download: 'yellow',
  };

  /**
   * A course for learners, like a course player: the path of every step on one
   * side (supports, mini quizzes, final exam) and the step being studied on the other.
   * Opening a support counts it as seen; quizzes open the quiz player.
   */
  export default {
    name: 'AeLearnCourseDetailPage',
    components: { AeIcon, AePageHeader, AeResourceMedia },
    setup() {
      const {
        learnCourseTrainer$,
        learnCourseMyCertificate$,
        quizKindQuiz$,
        quizKindExam$,
        learnQuizQuestionsFact$,
        kindVideo$,
        kindAudio$,
        kindImage$,
        kindPdf$,
        kindYoutube$,
        kindLink$,
        kindFile$,
        loadError$,
        loadTimeout$,
      } = portalStrings;
      const templateStrings = Object.fromEntries(
        TEMPLATE_STRINGS.map(name => [name, portalStrings[name]]),
      );
      const KIND_LABELS = {
        video: kindVideo$,
        audio: kindAudio$,
        image: kindImage$,
        pdf: kindPdf$,
        youtube: kindYoutube$,
        link: kindLink$,
        download: kindFile$,
      };

      const route = useRoute();
      const router = useRouter();
      const api = useTrainingApi();
      const { isStaff } = useAePermissions();
      const { isLoading, loadError, runLoad } = useAsyncPageLoad('isLoadingLearnerCourse');

      const training = ref(null);
      const resources = ref([]);
      const quizzes = ref([]);
      const progress = ref(null);
      const certificate = ref(null);
      const stageTitle = ref(null);

      const errorMessage = computed(() => {
        if (!loadError.value) {
          return '';
        }
        return loadError.value.code === 'AE_REQUEST_TIMEOUT' ? loadTimeout$() : loadError$();
      });

      const trainerNote = computed(() =>
        training.value && training.value.responsible_name
          ? learnCourseTrainer$({ name: training.value.responsible_name })
          : '',
      );

      const certificateAction = computed(() =>
        certificate.value
          ? {
            label: learnCourseMyCertificate$(),
            icon: 'award',
            href: api.certificatePrintUrl(certificate.value.id),
          }
          : null,
      );

      // Supports first, then the mini quizzes, then the final exam.
      const steps = computed(() => {
        const supports = [...resources.value]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(resource => {
            const kind = previewKind(resource);
            const size = resource.size_bytes ? formatCourseSize(resource.size_bytes) : '';
            return {
              key: `r-${resource.id}`,
              group: 'supports',
              type: 'support',
              kind,
              external: EXTERNAL_KINDS.includes(kind),
              title: resource.title,
              meta: [KIND_LABELS[kind](), size].filter(Boolean).join(' · '),
              icon: previewIcon(kind),
              tone: KIND_TONES[kind],
              done: Boolean(resource.viewed),
              resource,
            };
          });
        const evaluations = [...quizzes.value]
          .sort((a, b) => (a.kind === 'exam') - (b.kind === 'exam') || a.sort_order - b.sort_order)
          .map(quiz => ({
            key: `q-${quiz.id}`,
            group: 'quizzes',
            type: 'quiz',
            title: quiz.title,
            meta: [
              quiz.kind === 'exam' ? quizKindExam$() : quizKindQuiz$(),
              learnQuizQuestionsFact$({ count: quiz.question_count }),
            ].join(' · '),
            icon: quiz.kind === 'exam' ? 'award' : 'listChecks',
            tone: quiz.kind === 'exam' ? 'yellow' : 'blue',
            done: Boolean(quiz.my_passed),
            quiz,
          }));
        return [...supports, ...evaluations];
      });

      const doneCount = computed(() => steps.value.filter(step => step.done).length);

      // The step in the address (?etape=), else the one chosen when the course opened.
      const openingKey = ref('');
      const currentKey = computed(() => {
        const wanted = route.query.etape;
        return wanted && steps.value.some(step => step.key === wanted) ? wanted : openingKey.value;
      });
      const currentIndex = computed(() =>
        steps.value.findIndex(step => step.key === currentKey.value),
      );
      const currentStep = computed(() => steps.value[currentIndex.value] || null);

      function select(key) {
        if (key !== route.query.etape) {
          router.replace({ query: { ...route.query, etape: key } });
        }
        nextTick(() => stageTitle.value && stageTitle.value.focus());
      }

      function move(offset) {
        const step = steps.value[currentIndex.value + offset];
        if (step) {
          select(step.key);
        }
      }

      async function loadProgress() {
        const [mine, certificates] = await Promise.all([
          api.fetchMyProgress().catch(() => []),
          api.fetchCertificates().catch(() => []),
        ]);
        const trainingId = route.params.trainingId;
        progress.value = (mine || []).find(row => row.training === trainingId) || null;
        certificate.value = (certificates || []).find(row => row.training === trainingId) || null;
      }

      // Opening a support counts it as seen (staff previewing the space leave no trace).
      async function markSeen(step) {
        if (!step || step.type !== 'support' || step.done || isStaff.value) {
          return;
        }
        try {
          await api.markResourceViewed(step.resource.id);
          step.resource.viewed = true;
          await loadProgress();
        } catch (e) {
          // Progress is best effort: the support stays open.
        }
      }

      watch(currentKey, () => markSeen(currentStep.value));

      async function refresh() {
        const trainingId = route.params.trainingId;
        try {
          await runLoad(async () => {
            const [course, list, quizList] = await Promise.all([
              api.fetchTraining(trainingId),
              api.fetchResources({ training: trainingId }),
              api.fetchQuizzes({ training: trainingId }).catch(() => []),
            ]);
            training.value = course;
            resources.value = list || [];
            quizzes.value = (quizList || []).filter(quiz => quiz.status === 'published');
            await loadProgress();
          });
          // Back in a course: straight to the first step not done yet.
          const next = steps.value.find(step => !step.done) || steps.value[0];
          openingKey.value = next ? next.key : '';
          // Opening a course makes the learner one of its learners.
          if (!isStaff.value) {
            api.startTraining(trainingId).catch(() => null);
          }
        } catch (e) {
          training.value = null;
          resources.value = [];
          quizzes.value = [];
        }
      }

      onMounted(refresh);

      return {
        ...templateStrings,
        api,
        isLoading,
        loadError,
        errorMessage,
        training,
        progress,
        trainerNote,
        certificateAction,
        steps,
        doneCount,
        currentKey,
        currentIndex,
        currentStep,
        stageTitle,
        select,
        move,
        refresh,
      };
    },
  };

</script>


<style lang="scss" scoped>

  @import '../../styles/tokens';
  @import '../../styles/components';

  .ae-course-visually-hidden {
    @include ae-visually-hidden;
  }

  .ae-course {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .ae-course-card {
    @include ae-card;

    padding: 16px 18px;
  }

  .ae-course-primary {
    @include ae-button-primary;

    min-height: 46px;
    font-size: 17px;
  }

  .ae-course-outline {
    @include ae-button-outline;

    flex-shrink: 0;
    min-height: 40px;
    font-size: 15px;

    &:disabled {
      cursor: default;
      opacity: 0.45;
    }
  }

  .ae-course-alert {
    @include ae-card;

    color: var(--ae-danger);
  }

  .ae-course-empty {
    margin: 0;
    font-size: 17px;
    color: var(--ae-text-muted);
  }

  .ae-course-grid {
    display: grid;
    grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
    gap: 18px;
    align-items: start;
  }

  /* ---------- Path ---------- */

  .ae-course-path {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .ae-course-path-head {
    display: flex;
    gap: 10px;
    align-items: baseline;
    justify-content: space-between;
  }

  .ae-course-path-title {
    margin: 0;
    font-size: 19px;
    font-weight: 800;
    color: var(--ae-navy);
  }

  .ae-course-path-count {
    font-size: 14px;
    font-weight: 700;
    color: var(--ae-text-muted);
  }

  .ae-course-meter {
    height: 10px;
    overflow: hidden;
    background: var(--ae-surface-muted);
    border-radius: 999px;
  }

  .ae-course-meter-fill {
    display: block;
    height: 100%;
    background: var(--ae-orange);
    border-radius: 999px;
  }

  .ae-course-done {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 8px 12px;
    margin: 0;
    font-weight: 800;
    color: #1b6e3c;
    background: var(--ae-kpi-green);
    border-radius: var(--ae-radius-sm);
  }

  .ae-course-steps {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .ae-course-steps-group {
    margin: 8px 0 4px;
    font-size: 13px;
    font-weight: 800;
    color: var(--ae-text-subtle);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .ae-course-step {
    display: flex;
    gap: 12px;
    align-items: center;
    width: 100%;
    padding: 8px 10px;
    font: inherit;
    color: var(--ae-text);
    text-align: start;
    cursor: pointer;
    background: transparent;
    border: 1.5px solid transparent;
    border-radius: var(--ae-radius-md);

    &:hover {
      background: var(--ae-surface-muted);
    }

    @include ae-focus-ring;
  }

  .ae-course-step-on {
    background: var(--ae-orange-wash);
    border-color: var(--ae-orange);

    &:hover {
      background: var(--ae-orange-wash);
    }
  }

  .ae-course-step-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 50%;
  }

  .ae-course-tone-red {
    color: #a3263a;
    background: var(--ae-kpi-red);
  }

  .ae-course-tone-purple {
    color: #6d2e7f;
    background: var(--ae-kpi-purple);
  }

  .ae-course-tone-green {
    color: #1b6e3c;
    background: var(--ae-kpi-green);
  }

  .ae-course-tone-blue {
    color: #1f5f99;
    background: var(--ae-kpi-blue);
  }

  .ae-course-tone-mint {
    color: #176b63;
    background: var(--ae-kpi-mint);
  }

  .ae-course-tone-yellow {
    color: var(--ae-orange-deep);
    background: var(--ae-kpi-yellow);
  }

  .ae-course-step-text {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    line-height: 1.3;
  }

  .ae-course-step-title {
    overflow: hidden;
    font-weight: 700;
    color: var(--ae-navy);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ae-course-step-meta {
    font-size: 13px;
    color: var(--ae-text-subtle);
  }

  .ae-course-step-state {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: 2px solid var(--ae-field-line);
    border-radius: 50%;
  }

  .ae-course-step-state-done {
    color: #ffffff;
    background: #2e8b57;
    border-color: #2e8b57;
  }

  /* ---------- Stage ---------- */

  .ae-course-stage {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
  }

  .ae-course-stage-head {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .ae-course-stage-icon {
    width: 44px;
    height: 44px;
  }

  .ae-course-stage-text {
    flex: 1;
    min-width: 0;
  }

  .ae-course-stage-title {
    margin: 0;
    overflow: hidden;
    font-size: 21px;
    font-weight: 800;
    color: var(--ae-navy);
    text-overflow: ellipsis;
    white-space: nowrap;
    outline: none;
  }

  .ae-course-stage-meta {
    margin: 0;
    font-size: 14px;
    color: var(--ae-text-muted);
  }

  .ae-course-stage-body {
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: 12px;
    background: var(--ae-surface-muted);
    border-radius: var(--ae-radius-md);
  }

  // Off computers, players and documents get a comfortable fixed height.
  .ae-course-stage-video,
  .ae-course-stage-image,
  .ae-course-stage-pdf,
  .ae-course-stage-youtube {
    height: 62vh;
  }

  .ae-course-quiz {
    gap: 12px;
    align-items: center;
    justify-content: center;
    padding: 24px;
    text-align: center;
  }

  .ae-course-quiz-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    color: #1f5f99;
    background: var(--ae-kpi-blue);
    border-radius: 50%;
  }

  .ae-course-quiz-badge-exam {
    color: var(--ae-orange-deep);
    background: var(--ae-kpi-yellow);
  }

  .ae-course-quiz-text {
    max-width: 40em;
    margin: 0;
    font-size: 17px;
    color: var(--ae-text-muted);
  }

  .ae-course-quiz-facts {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
    padding: 0;
    margin: 0;
    list-style: none;

    li {
      padding: 6px 12px;
      font-size: 15px;
      font-weight: 700;
      background: var(--ae-surface);
      border-radius: 999px;
    }
  }

  .ae-course-quiz-passed {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    margin: 0;
    font-weight: 800;
    color: #1b6e3c;
  }

  .ae-course-quiz-note {
    margin: 0;
    font-weight: 700;
    color: var(--ae-orange-deep);
  }

  .ae-course-stage-foot {
    display: flex;
    gap: 12px;
    justify-content: space-between;
  }

  // Computers: the page never scrolls; the path does, the stage fills the rest.
  @media (min-width: 900px) and (min-height: 640px) {
    .ae-course {
      flex: 1 1 auto;
      min-height: 0;
    }

    .ae-course-grid {
      flex: 1 1 auto;
      align-items: stretch;
      min-height: 0;
    }

    .ae-course-path {
      min-height: 0;
    }

    .ae-course-steps {
      flex: 1 1 0;
      min-height: 0;
      overflow-y: auto;
    }

    .ae-course-stage-body {
      flex: 1 1 0;
      height: auto;
    }
  }

  @media (min-width: 900px) and (max-height: 799px) {
    .ae-course,
    .ae-course-grid {
      gap: 12px;
    }

    .ae-course-card {
      padding: 12px 14px;
    }

    .ae-course-stage {
      gap: 8px;
    }

    .ae-course-quiz {
      padding: 12px;
    }

    .ae-course-quiz-badge {
      width: 60px;
      height: 60px;
    }
  }

  @media (max-width: 1279px) {
    .ae-course-grid {
      grid-template-columns: minmax(250px, 300px) minmax(0, 1fr);
      gap: 14px;
    }
  }

  @media (max-width: 899px) {
    .ae-course-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }

</style>
