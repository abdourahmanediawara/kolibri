<template>

  <div class="ae-quiz-editor">
    <AePageHeader
      :title="form.title.trim() || (isNew ? newQuizAction$() : quizEditorTitle$())"
      :crumbs="crumbs"
      :subtitle="quizEditorSubtitle$()"
      :action="canManage ? { label: saveQuizAction$(), icon: 'check', onClick: save } : null"
    />

    <KCircularLoader
      v-if="loading"
      :delay="false"
    />
    <p
      v-else-if="loadFailed"
      class="ae-quiz-alert"
      role="alert"
    >
      {{ loadError$() }}
    </p>

    <div
      v-else
      class="ae-quiz-grid"
    >
      <!-- Settings -->
      <section
        class="ae-quiz-card ae-quiz-settings"
        aria-labelledby="ae-quiz-settings-title"
      >
        <h2
          id="ae-quiz-settings-title"
          class="ae-quiz-card-title"
        >
          {{ quizSettingsTitle$() }}
        </h2>

        <div class="ae-quiz-field">
          <label for="ae-qz-title">{{ quizTitleLabel$() }}</label>
          <input
            id="ae-qz-title"
            ref="titleField"
            v-model="form.title"
            type="text"
            maxlength="200"
            autocomplete="off"
            :disabled="!canManage"
            :aria-invalid="titleError ? 'true' : 'false'"
            aria-describedby="ae-qz-title-error"
          >
          <p
            v-if="titleError"
            id="ae-qz-title-error"
            class="ae-quiz-error"
          >
            {{ titleError }}
          </p>
        </div>

        <div
          class="ae-quiz-kinds"
          role="radiogroup"
          :aria-label="columnType$()"
        >
          <button
            v-for="option in kindOptions"
            :key="option.value"
            type="button"
            role="radio"
            :aria-checked="form.kind === option.value ? 'true' : 'false'"
            :class="{ 'ae-quiz-kind-on': form.kind === option.value }"
            :disabled="!canManage"
            @click="setKind(option.value)"
          >
            <AeIcon
              :name="option.icon"
              :size="20"
            />
            <span>{{ option.label }}</span>
          </button>
        </div>

        <div class="ae-quiz-field">
          <label for="ae-qz-description">{{ quizInstructionsLabel$() }}</label>
          <textarea
            id="ae-qz-description"
            v-model="form.description"
            rows="2"
            :disabled="!canManage"
          ></textarea>
        </div>

        <div class="ae-quiz-row">
          <div class="ae-quiz-field">
            <label for="ae-qz-pass">{{ passPercentLabel$() }}</label>
            <input
              id="ae-qz-pass"
              v-model.number="form.pass_percent"
              type="number"
              min="0"
              max="100"
              :disabled="!canManage"
            >
          </div>
          <div class="ae-quiz-field">
            <label for="ae-qz-attempts">{{ maxAttemptsLabel$() }}</label>
            <input
              id="ae-qz-attempts"
              v-model.number="form.max_attempts"
              type="number"
              min="0"
              max="20"
              :disabled="!canManage"
              aria-describedby="ae-qz-attempts-hint"
            >
          </div>
        </div>
        <p
          id="ae-qz-attempts-hint"
          class="ae-quiz-hint"
        >
          {{ maxAttemptsHint$() }}
        </p>

        <label class="ae-quiz-check">
          <input
            v-model="form.show_answers"
            type="checkbox"
            :disabled="!canManage"
          >
          <span>{{ showAnswersLabel$() }}</span>
        </label>
        <label class="ae-quiz-check">
          <input
            v-model="form.published"
            type="checkbox"
            :disabled="!canManage"
          >
          <span>{{ publishQuizLabel$() }}</span>
        </label>

        <p class="ae-quiz-summary">
          <AeIcon
            name="listChecks"
            :size="20"
          />
          <span>{{ quizSummary$({ count: questions.length, points: totalPoints }) }}</span>
        </p>
        <p
          v-if="formError"
          class="ae-quiz-alert"
          role="alert"
        >
          {{ formError }}
        </p>
      </section>

      <!-- Questions -->
      <section
        class="ae-quiz-card ae-quiz-questions"
        aria-labelledby="ae-quiz-questions-title"
      >
        <div class="ae-quiz-questions-head">
          <h2
            id="ae-quiz-questions-title"
            class="ae-quiz-card-title"
          >
            {{ questionsTitle$({ count: questions.length }) }}
          </h2>
          <div
            v-if="canManage"
            class="ae-quiz-add"
          >
            <button
              v-for="option in questionKinds"
              :key="option.value"
              type="button"
              class="ae-quiz-add-btn"
              @click="addQuestion(option.value)"
            >
              <AeIcon
                name="plus"
                :size="18"
              />
              <span>{{ option.label }}</span>
            </button>
          </div>
        </div>

        <ol
          v-if="questions.length"
          ref="questionList"
          class="ae-quiz-list"
        >
          <li
            v-for="(question, index) in questions"
            :id="`ae-qz-question-${question.key}`"
            :key="question.key"
            class="ae-quiz-question"
            :class="{ 'ae-quiz-question-invalid': question.error }"
          >
            <div class="ae-quiz-question-head">
              <span class="ae-quiz-question-number">{{ index + 1 }}</span>
              <span class="ae-quiz-question-kind">{{ kindLabel(question.kind) }}</span>
              <label class="ae-quiz-points">
                <input
                  v-model.number="question.points"
                  type="number"
                  min="1"
                  max="100"
                  :disabled="!canManage"
                  :aria-label="pointsOf$({ number: index + 1 })"
                >
                <span aria-hidden="true">{{ pointsLabel$() }}</span>
              </label>
              <span
                v-if="canManage"
                class="ae-quiz-question-tools"
              >
                <button
                  type="button"
                  :disabled="index === 0"
                  :aria-label="moveUpOf$({ number: index + 1 })"
                  @click="move(index, -1)"
                >
                  <AeIcon
                    name="arrowUp"
                    :size="18"
                  />
                </button>
                <button
                  type="button"
                  :disabled="index === questions.length - 1"
                  :aria-label="moveDownOf$({ number: index + 1 })"
                  @click="move(index, 1)"
                >
                  <AeIcon
                    name="arrowDown"
                    :size="18"
                  />
                </button>
                <button
                  type="button"
                  class="ae-quiz-danger"
                  :aria-label="removeQuestionOf$({ number: index + 1 })"
                  @click="removeQuestion(index)"
                >
                  <AeIcon
                    name="trash"
                    :size="18"
                  />
                </button>
              </span>
            </div>

            <label
              class="ae-quiz-visually-hidden"
              :for="`ae-qz-prompt-${question.key}`"
            >{{ questionPromptOf$({ number: index + 1 }) }}</label>
            <textarea
              :id="`ae-qz-prompt-${question.key}`"
              v-model="question.prompt"
              class="ae-quiz-prompt"
              rows="2"
              :placeholder="questionPromptPlaceholder$()"
              :disabled="!canManage"
            ></textarea>

            <fieldset class="ae-quiz-choices">
              <legend>{{ question.kind === 'multiple' ? rightAnswersHint$() : rightAnswerHint$() }}</legend>
              <div
                v-for="(choice, choiceIndex) in question.choices"
                :key="choice.key"
                class="ae-quiz-choice"
                :class="{ 'ae-quiz-choice-right': choice.is_correct }"
              >
                <input
                  :type="question.kind === 'multiple' ? 'checkbox' : 'radio'"
                  :name="`ae-qz-right-${question.key}`"
                  :checked="choice.is_correct"
                  :disabled="!canManage"
                  :aria-label="rightAnswerOf$({ number: choiceIndex + 1 })"
                  @change="markRight(question, choice, $event.target.checked)"
                >
                <input
                  v-model="choice.text"
                  type="text"
                  class="ae-quiz-choice-text"
                  maxlength="500"
                  :readonly="question.kind === 'true_false'"
                  :disabled="!canManage"
                  :placeholder="answerPlaceholder$({ number: choiceIndex + 1 })"
                  :aria-label="answerTextOf$({ number: choiceIndex + 1 })"
                >
                <button
                  v-if="canManage && question.kind !== 'true_false' && question.choices.length > 2"
                  type="button"
                  class="ae-quiz-choice-remove"
                  :aria-label="removeAnswerOf$({ number: choiceIndex + 1 })"
                  @click="question.choices.splice(choiceIndex, 1)"
                >
                  <AeIcon
                    name="x"
                    :size="18"
                  />
                </button>
              </div>
              <button
                v-if="canManage && question.kind !== 'true_false' && question.choices.length < 10"
                type="button"
                class="ae-quiz-link"
                @click="addChoice(question)"
              >
                <AeIcon
                  name="plus"
                  :size="16"
                />
                <span>{{ addAnswerAction$() }}</span>
              </button>
            </fieldset>

            <label
              class="ae-quiz-explanation"
              :for="`ae-qz-explanation-${question.key}`"
            >{{ explanationLabel$() }}</label>
            <input
              :id="`ae-qz-explanation-${question.key}`"
              v-model="question.explanation"
              type="text"
              class="ae-quiz-explanation-input"
              maxlength="2000"
              :disabled="!canManage"
            >
            <p
              v-if="question.error"
              class="ae-quiz-error"
              role="alert"
            >
              {{ question.error }}
            </p>
          </li>
        </ol>
        <div
          v-else
          class="ae-quiz-empty"
        >
          <AeIcon
            name="listChecks"
            :size="48"
          />
          <p>{{ noQuestionsYet$() }}</p>
        </div>
      </section>
    </div>
  </div>

</template>


<script>

  import { computed, nextTick, onMounted, reactive, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router/composables';
  import useSnackbar from 'kolibri/composables/useSnackbar';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';
  import { useTrainingApi } from '../../composables/useTrainingApi';
  import AeIcon from '../AeIcon';
  import AePageHeader from '../AePageHeader';

  const TEMPLATE_STRINGS = [
    'newQuizAction$',
    'quizEditorTitle$',
    'quizEditorSubtitle$',
    'saveQuizAction$',
    'loadError$',
    'quizSettingsTitle$',
    'quizTitleLabel$',
    'columnType$',
    'quizInstructionsLabel$',
    'passPercentLabel$',
    'maxAttemptsLabel$',
    'maxAttemptsHint$',
    'showAnswersLabel$',
    'publishQuizLabel$',
    'quizSummary$',
    'questionsTitle$',
    'pointsOf$',
    'pointsLabel$',
    'moveUpOf$',
    'moveDownOf$',
    'removeQuestionOf$',
    'questionPromptOf$',
    'questionPromptPlaceholder$',
    'rightAnswersHint$',
    'rightAnswerHint$',
    'rightAnswerOf$',
    'answerPlaceholder$',
    'answerTextOf$',
    'removeAnswerOf$',
    'addAnswerAction$',
    'explanationLabel$',
    'noQuestionsYet$',
  ];

  let keySeed = 0;
  function nextKey() {
    keySeed += 1;
    return `k${keySeed}`;
  }

  /** Writes a mini quiz or a final exam; the server keeps the answer key from learners. */
  export default {
    name: 'AeQuizEditorPage',
    components: { AeIcon, AePageHeader },
    setup() {
      const {
        coursesTitle$,
        myCourses$,
        quizKindQuiz$,
        quizKindExam$,
        questionSingle$,
        questionMultiple$,
        questionTrueFalse$,
        trueLabel$,
        falseLabel$,
        quizTitleRequired$,
        questionPromptRequired$,
        answerTextRequired$,
        oneRightAnswerRequired$,
        someRightAnswerRequired$,
        publishNeedsQuestions$,
        quizSaved$,
        saveError$,
      } = portalStrings;
      const templateStrings = Object.fromEntries(
        TEMPLATE_STRINGS.map(name => [name, portalStrings[name]]),
      );

      const route = useRoute();
      const router = useRouter();
      const { createSnackbar } = useSnackbar();
      const { isAdmin, isSuperuser, currentUserId } = useAePermissions();
      const api = useTrainingApi();

      const isAdminSpace = String(route.name || '').startsWith('AeAdmin');
      const trainingId = route.params.trainingId;
      const isNew = route.params.quizId === 'nouveau';

      const loading = ref(true);
      const loadFailed = ref(false);
      const training = ref(null);
      const saving = ref(false);
      const titleError = ref('');
      const formError = ref('');
      const titleField = ref(null);
      const questionList = ref(null);
      const form = reactive({
        title: '',
        description: '',
        kind: route.query.type === 'exam' ? 'exam' : 'quiz',
        pass_percent: route.query.type === 'exam' ? 60 : 50,
        max_attempts: 0,
        show_answers: true,
        published: false,
      });
      const questions = ref([]);

      const canManage = computed(
        () =>
          Boolean(training.value) &&
          (isAdmin.value ||
            isSuperuser.value ||
            training.value.responsible === currentUserId.value),
      );

      const courseRoute = {
        name: isAdminSpace ? 'AeAdminCourseDetail' : 'AeCoachCourseDetail',
        params: { trainingId },
        query: { onglet: 'quizzes' },
      };

      const crumbs = computed(() => [
        {
          label: isAdminSpace ? coursesTitle$() : myCourses$(),
          to: { name: isAdminSpace ? 'AeAdminCourses' : 'AeCoachFormations' },
        },
        { label: training.value ? training.value.title : '…', to: courseRoute },
      ]);

      const kindOptions = [
        { value: 'quiz', label: quizKindQuiz$(), icon: 'listChecks' },
        { value: 'exam', label: quizKindExam$(), icon: 'award' },
      ];

      const questionKinds = [
        { value: 'single', label: questionSingle$() },
        { value: 'multiple', label: questionMultiple$() },
        { value: 'true_false', label: questionTrueFalse$() },
      ];

      function kindLabel(kind) {
        return questionKinds.find(option => option.value === kind).label;
      }

      const totalPoints = computed(() =>
        questions.value.reduce((sum, question) => sum + (Number(question.points) || 0), 0),
      );

      function setKind(kind) {
        form.kind = kind;
        // An exam usually asks more, and shows its answers less.
        if (kind === 'exam') {
          form.show_answers = false;
        }
      }

      function newChoices(kind) {
        if (kind === 'true_false') {
          return [
            { key: nextKey(), text: trueLabel$(), is_correct: true },
            { key: nextKey(), text: falseLabel$(), is_correct: false },
          ];
        }
        return [
          { key: nextKey(), text: '', is_correct: true },
          { key: nextKey(), text: '', is_correct: false },
          { key: nextKey(), text: '', is_correct: false },
        ];
      }

      function addQuestion(kind) {
        const question = {
          key: nextKey(),
          kind,
          prompt: '',
          points: 1,
          explanation: '',
          choices: newChoices(kind),
          error: '',
        };
        questions.value.push(question);
        nextTick(() => {
          const prompt = document.getElementById(`ae-qz-prompt-${question.key}`);
          if (prompt) {
            prompt.focus();
          }
        });
      }

      function addChoice(question) {
        question.choices.push({ key: nextKey(), text: '', is_correct: false });
      }

      function markRight(question, choice, checked) {
        if (question.kind === 'multiple') {
          choice.is_correct = checked;
          return;
        }
        question.choices.forEach(other => {
          other.is_correct = other === choice;
        });
      }

      function move(index, step) {
        const list = questions.value;
        const [question] = list.splice(index, 1);
        list.splice(index + step, 0, question);
      }

      function removeQuestion(index) {
        questions.value.splice(index, 1);
      }

      function questionError(question) {
        if (!question.prompt.trim()) {
          return questionPromptRequired$();
        }
        if (question.choices.some(choice => !choice.text.trim())) {
          return answerTextRequired$();
        }
        const right = question.choices.filter(choice => choice.is_correct).length;
        if (question.kind === 'multiple') {
          return right >= 1 ? '' : someRightAnswerRequired$();
        }
        return right === 1 ? '' : oneRightAnswerRequired$();
      }

      function validate() {
        titleError.value = form.title.trim() ? '' : quizTitleRequired$();
        formError.value =
          form.published && !questions.value.length ? publishNeedsQuestions$() : '';
        questions.value.forEach(question => {
          question.error = questionError(question);
        });
        if (titleError.value) {
          titleField.value.focus();
          return false;
        }
        const invalid = questions.value.find(question => question.error);
        if (invalid) {
          document
            .getElementById(`ae-qz-question-${invalid.key}`)
            .scrollIntoView({ block: 'center' });
          document.getElementById(`ae-qz-prompt-${invalid.key}`).focus();
          return false;
        }
        return !formError.value;
      }

      function payload() {
        return {
          training: trainingId,
          title: form.title.trim(),
          description: form.description.trim(),
          kind: form.kind,
          status: form.published ? 'published' : 'draft',
          pass_percent: Math.min(100, Math.max(0, Number(form.pass_percent) || 0)),
          max_attempts: Math.max(0, Number(form.max_attempts) || 0),
          show_answers: form.show_answers,
          questions: questions.value.map(question => ({
            prompt: question.prompt.trim(),
            kind: question.kind,
            points: Math.max(1, Number(question.points) || 1),
            explanation: question.explanation.trim(),
            choices: question.choices.map(choice => ({
              text: choice.text.trim(),
              is_correct: choice.is_correct,
            })),
          })),
        };
      }

      async function save() {
        if (saving.value || !validate()) {
          return;
        }
        saving.value = true;
        try {
          if (isNew) {
            await api.createQuiz(payload());
          } else {
            await api.updateQuiz(route.params.quizId, payload());
          }
        } catch (e) {
          formError.value = saveError$();
          return;
        } finally {
          saving.value = false;
        }
        createSnackbar(quizSaved$());
        router.push(courseRoute);
      }

      function fromServer(quiz) {
        Object.assign(form, {
          title: quiz.title,
          description: quiz.description || '',
          kind: quiz.kind,
          pass_percent: quiz.pass_percent,
          max_attempts: quiz.max_attempts,
          show_answers: quiz.show_answers,
          published: quiz.status === 'published',
        });
        questions.value = (quiz.questions || []).map(question => ({
          key: nextKey(),
          kind: question.kind,
          prompt: question.prompt,
          points: question.points,
          explanation: question.explanation || '',
          error: '',
          choices: question.choices.map(choice => ({
            key: nextKey(),
            text: choice.text,
            is_correct: Boolean(choice.is_correct),
          })),
        }));
      }

      onMounted(async () => {
        try {
          const [course, quiz] = await Promise.all([
            api.fetchTraining(trainingId),
            isNew ? Promise.resolve(null) : api.fetchQuiz(route.params.quizId),
          ]);
          training.value = course;
          if (quiz) {
            fromServer(quiz);
          }
        } catch (e) {
          loadFailed.value = true;
        } finally {
          loading.value = false;
        }
        if (isNew) {
          nextTick(() => titleField.value && titleField.value.focus());
        }
      });

      return {
        ...templateStrings,
        isNew,
        loading,
        loadFailed,
        canManage,
        crumbs,
        form,
        questions,
        titleError,
        formError,
        titleField,
        questionList,
        kindOptions,
        questionKinds,
        kindLabel,
        totalPoints,
        setKind,
        addQuestion,
        addChoice,
        markRight,
        move,
        removeQuestion,
        save,
      };
    },
  };

</script>


<style lang="scss" scoped>

  @import '../../styles/tokens';
  @import '../../styles/components';

  .ae-quiz-visually-hidden {
    @include ae-visually-hidden;
  }

  .ae-quiz-editor {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .ae-quiz-grid {
    display: grid;
    grid-template-columns: minmax(300px, 380px) minmax(0, 1fr);
    gap: 20px;
    align-items: start;
  }

  .ae-quiz-card {
    @include ae-card;

    padding: 18px 20px;
  }

  .ae-quiz-card-title {
    margin: 0 0 12px;
    font-size: 20px;
    font-weight: 800;
    color: var(--ae-navy);
  }

  .ae-quiz-field {
    display: flex;
    flex-direction: column;
    margin-bottom: 12px;

    label {
      margin-bottom: 6px;
      font-size: 15px;
      font-weight: 700;
      color: var(--ae-navy);
    }

    input,
    textarea {
      @include ae-field;

      height: 44px;
    }

    textarea {
      height: auto;
      padding-block: 10px;
      resize: vertical;
    }
  }

  .ae-quiz-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 14px;
  }

  .ae-quiz-kinds {
    display: flex;
    gap: 8px;
    padding: 4px;
    margin-bottom: 12px;
    background: var(--ae-surface-muted);
    border-radius: 999px;

    button {
      display: inline-flex;
      flex: 1;
      gap: 8px;
      align-items: center;
      justify-content: center;
      min-height: 42px;
      font: inherit;
      font-size: 15px;
      font-weight: 700;
      color: var(--ae-text-muted);
      cursor: pointer;
      background: transparent;
      border: 0;
      border-radius: 999px;

      @include ae-focus-ring;
    }
  }

  .ae-quiz-kinds .ae-quiz-kind-on {
    color: var(--ae-orange-ink);
    background: var(--ae-surface);
    box-shadow: 0 2px 8px -4px rgba(31, 29, 61, 0.35);
  }

  .ae-quiz-hint {
    margin: -6px 0 10px;
    font-size: 13px;
    color: var(--ae-text-subtle);
  }

  .ae-quiz-check {
    display: flex;
    gap: 10px;
    align-items: center;
    margin: 8px 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--ae-navy);
    cursor: pointer;

    input {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      margin: 0;
      accent-color: var(--ae-orange);
    }
  }

  .ae-quiz-summary {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 10px 12px;
    margin: 12px 0 0;
    font-weight: 700;
    color: var(--ae-orange-ink);
    background: var(--ae-orange-wash);
    border-radius: var(--ae-radius-md);
  }

  .ae-quiz-alert {
    padding: 10px 12px;
    margin: 10px 0 0;
    font-weight: 600;
    color: var(--ae-danger);
    background: var(--ae-danger-soft);
    border-radius: var(--ae-radius-md);
  }

  .ae-quiz-error {
    margin: 6px 0 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--ae-danger);
  }

  /* ---------- Questions ---------- */

  .ae-quiz-questions {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .ae-quiz-questions-head {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 16px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    .ae-quiz-card-title {
      margin: 0;
    }
  }

  .ae-quiz-add {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .ae-quiz-add-btn {
    @include ae-button-outline;

    min-height: 38px;
    padding: 0 12px;
    font-size: 14px;
  }

  .ae-quiz-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 2px;
    margin: 0;
    overflow-y: auto;
    list-style: none;
  }

  .ae-quiz-question {
    padding: 14px 16px;
    border: 1.5px solid var(--ae-line);
    border-radius: var(--ae-radius-md);
  }

  .ae-quiz-question-invalid {
    border-color: var(--ae-danger);
  }

  .ae-quiz-question-head {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 10px;
  }

  .ae-quiz-question-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    font-weight: 800;
    color: #ffffff;
    background: var(--ae-orange);
    border-radius: 50%;
  }

  .ae-quiz-question-kind {
    flex: 1;
    font-size: 14px;
    font-weight: 700;
    color: var(--ae-text-muted);
  }

  .ae-quiz-points {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    font-size: 14px;
    color: var(--ae-text-muted);

    input {
      width: 58px;
      height: 34px;
      padding: 0 8px;
      font: inherit;
      color: var(--ae-text);
      border: 1.5px solid var(--ae-field-line);
      border-radius: var(--ae-radius-sm);

      @include ae-focus-ring;
    }
  }

  .ae-quiz-question-tools {
    display: inline-flex;
    gap: 4px;

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      color: var(--ae-navy);
      cursor: pointer;
      background: transparent;
      border: 0;
      border-radius: var(--ae-radius-sm);

      &:hover:not(:disabled) {
        background: var(--ae-surface-muted);
      }

      &:disabled {
        cursor: default;
        opacity: 0.35;
      }

      @include ae-focus-ring;
    }

    .ae-quiz-danger {
      color: var(--ae-danger);
    }
  }

  .ae-quiz-prompt {
    @include ae-field;

    height: auto;
    padding-block: 10px;
    font-weight: 600;
    resize: vertical;
  }

  .ae-quiz-choices {
    padding: 0;
    margin: 10px 0 0;
    border: 0;

    legend {
      padding: 0;
      margin-bottom: 6px;
      font-size: 13px;
      color: var(--ae-text-subtle);
    }
  }

  .ae-quiz-choice {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 4px 6px;
    margin-bottom: 6px;
    border-radius: var(--ae-radius-sm);

    input[type='radio'],
    input[type='checkbox'] {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      margin: 0;
      accent-color: #1b7f45;
    }
  }

  .ae-quiz-choice-right {
    background: #ecf8f0;
  }

  .ae-quiz-choice-text {
    @include ae-field;

    flex: 1;
    height: 40px;
  }

  .ae-quiz-choice-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    color: var(--ae-text-muted);
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: var(--ae-radius-sm);

    &:hover {
      background: var(--ae-surface-muted);
    }

    @include ae-focus-ring;
  }

  .ae-quiz-link {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding: 4px;
    font: inherit;
    font-size: 14px;
    font-weight: 700;
    color: var(--ae-orange-ink);
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 6px;

    @include ae-focus-ring;
  }

  .ae-quiz-explanation {
    display: block;
    margin: 10px 0 4px;
    font-size: 13px;
    font-weight: 700;
    color: var(--ae-text-muted);
  }

  .ae-quiz-explanation-input {
    @include ae-field;

    height: 38px;
    font-size: 14px;
  }

  .ae-quiz-empty {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
    padding: 40px 16px;
    color: var(--ae-orange);
    text-align: center;

    p {
      max-width: 30em;
      margin: 0;
      color: var(--ae-text-muted);
    }
  }

  // Computers: the page never scrolls; the question list does.
  @media (min-width: 900px) and (min-height: 640px) {
    .ae-quiz-editor {
      flex: 1 1 auto;
      min-height: 0;
    }

    .ae-quiz-grid {
      flex: 1 1 auto;
      align-items: stretch;
      min-height: 0;
    }

    .ae-quiz-settings {
      overflow-y: auto;
    }

    .ae-quiz-list {
      flex: 1 1 0;
      min-height: 0;
    }
  }

  @media (min-width: 900px) and (max-height: 799px) {
    .ae-quiz-editor,
    .ae-quiz-grid {
      gap: 12px;
    }

    .ae-quiz-card {
      padding: 14px 16px;
    }

    .ae-quiz-field {
      margin-bottom: 8px;
    }
  }

  @media (max-width: 1279px) {
    .ae-quiz-grid {
      grid-template-columns: minmax(260px, 300px) minmax(0, 1fr);
      gap: 14px;
    }
  }

  @media (max-width: 899px) {
    .ae-quiz-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }

</style>
