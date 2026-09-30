<template>

  <transition name="ae-wizard">
    <div
      v-if="open"
      class="ae-wizard-root"
      @keydown.esc="close"
    >
      <div
        class="ae-wizard-backdrop"
        aria-hidden="true"
        @click="close"
      ></div>

      <section
        class="ae-wizard"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ae-wizard-title"
        aria-describedby="ae-wizard-step"
      >
        <header class="ae-wizard-head">
          <span
            class="ae-wizard-head-icon"
            aria-hidden="true"
          >
            <AeIcon
              name="bookOpen"
              :size="30"
            />
          </span>
          <div class="ae-wizard-head-text">
            <h2
              id="ae-wizard-title"
              class="ae-wizard-title"
            >
              {{ coachQuickCreateCourse$() }}
            </h2>
            <p class="ae-wizard-subtitle">
              {{ courseWizardSubtitle$() }}
            </p>
          </div>
          <img
            class="ae-wizard-art"
            :src="artSrc"
            alt=""
          >
          <button
            type="button"
            class="ae-wizard-close"
            :aria-label="closeAction$()"
            @click="close"
          >
            <AeIcon
              name="x"
              :size="24"
            />
          </button>
        </header>

        <ol class="ae-wizard-steps">
          <li
            v-for="(item, index) in steps"
            :key="item.id"
            class="ae-wizard-step"
            :class="{
              'ae-wizard-step-done': index < step,
              'ae-wizard-step-current': index === step,
            }"
            :aria-current="index === step ? 'step' : null"
          >
            <span
              class="ae-wizard-step-dot"
              aria-hidden="true"
            >
              <AeIcon
                v-if="index < step"
                name="check"
                :size="16"
              />
              <template v-else>{{ index + 1 }}</template>
            </span>
            <span class="ae-wizard-step-label">{{ item.label }}</span>
          </li>
        </ol>
        <p
          id="ae-wizard-step"
          class="ae-wizard-visually-hidden"
          aria-live="polite"
        >
          {{ stepOfTotal$({ step: step + 1, total: steps.length, name: steps[step].label }) }}
        </p>

        <div
          ref="body"
          class="ae-wizard-body"
        >
          <!-- Step 1: title and description. -->
          <form
            v-if="step === 0"
            novalidate
            @submit.prevent="next"
          >
            <h3
              ref="stepHeading"
              class="ae-wizard-heading"
              tabindex="-1"
            >
              {{ presentCourseTitle$() }}
            </h3>
            <div class="ae-wizard-field">
              <label for="ae-cw-title">
                {{ courseTitleLabel$() }}
                <span
                  class="ae-wizard-required"
                  aria-hidden="true"
                >*</span>
              </label>
              <input
                id="ae-cw-title"
                ref="titleField"
                v-model="form.title"
                type="text"
                maxlength="200"
                autocomplete="off"
                aria-required="true"
                :aria-invalid="titleError ? 'true' : 'false'"
                aria-describedby="ae-cw-title-error"
              >
              <p
                v-if="titleError"
                id="ae-cw-title-error"
                class="ae-wizard-error"
              >
                {{ titleError }}
              </p>
            </div>
            <div class="ae-wizard-field">
              <label for="ae-cw-trainer">
                {{ courseTrainerLabel$() }}
                <span
                  class="ae-wizard-required"
                  aria-hidden="true"
                >*</span>
              </label>
              <span class="ae-wizard-select">
                <select
                  id="ae-cw-trainer"
                  v-model="form.responsible"
                  aria-required="true"
                  :aria-invalid="trainerError ? 'true' : 'false'"
                  aria-describedby="ae-cw-trainer-error"
                >
                  <option value="">
                    {{ chooseTrainerOption$() }}
                  </option>
                  <option
                    v-for="trainer in trainers"
                    :key="trainer.id"
                    :value="trainer.id"
                  >
                    {{ trainer.name }}
                  </option>
                </select>
                <AeIcon
                  name="chevronDown"
                  :size="18"
                />
              </span>
              <p
                v-if="trainerError"
                id="ae-cw-trainer-error"
                class="ae-wizard-error"
              >
                {{ trainerError }}
              </p>
            </div>
            <div class="ae-wizard-field">
              <label for="ae-cw-description">{{ courseDescriptionLabel$() }}</label>
              <textarea
                id="ae-cw-description"
                v-model="form.description"
                rows="3"
                aria-describedby="ae-cw-description-hint"
              ></textarea>
              <p
                id="ae-cw-description-hint"
                class="ae-wizard-hint"
              >
                {{ courseDescriptionHint$() }}
              </p>
            </div>
            <p class="ae-wizard-tip">
              <AeIcon
                name="lightbulb"
                :size="24"
              />
              <span>{{ courseTitleTip$() }}</span>
            </p>
            <!-- Lets Enter in the title go to the next step. -->
            <button
              type="submit"
              hidden
              tabindex="-1"
              aria-hidden="true"
            ></button>
          </form>

          <!-- Step 2: course files. -->
          <div v-else-if="step === 1">
            <h3
              ref="stepHeading"
              class="ae-wizard-heading"
              tabindex="-1"
            >
              {{ addSupportsTitle$() }}
            </h3>
            <p class="ae-wizard-lead">
              {{ addSupportsSubtitle$() }}
            </p>
            <AeFileDrop
              v-model="files"
              :locked="creating"
            />
            <p class="ae-wizard-later">
              <span>{{ supportsLaterHint$() }}</span>
              <button
                v-if="!files.length"
                type="button"
                class="ae-wizard-link"
                @click="goTo(2)"
              >
                <span>{{ continueWithoutSupports$() }}</span>
                <AeIcon
                  name="chevronRight"
                  :size="18"
                />
              </button>
            </p>
          </div>

          <!-- Step 3: summary. -->
          <div v-else>
            <h3
              ref="stepHeading"
              class="ae-wizard-heading"
              tabindex="-1"
            >
              {{ reviewCourseTitle$() }}
            </h3>
            <p class="ae-wizard-lead">
              {{ reviewCourseSubtitle$() }}
            </p>

            <section
              class="ae-wizard-summary"
              aria-labelledby="ae-cw-summary-info"
            >
              <div class="ae-wizard-summary-head">
                <h4 id="ae-cw-summary-info">
                  {{ courseInfoSection$() }}
                </h4>
                <button
                  v-if="!creating"
                  type="button"
                  class="ae-wizard-edit"
                  :aria-label="editSectionOf$({ name: courseInfoSection$() })"
                  @click="goTo(0)"
                >
                  <AeIcon
                    name="pencil"
                    :size="16"
                  />
                  <span>{{ editAction$() }}</span>
                </button>
              </div>
              <p class="ae-wizard-summary-title">
                {{ cleanTitle }}
              </p>
              <p
                v-if="form.description.trim()"
                class="ae-wizard-summary-text"
              >
                {{ form.description.trim() }}
              </p>
              <p class="ae-wizard-summary-trainer">
                <AeIcon
                  name="user"
                  :size="18"
                />
                <span>{{ courseTrainerLabel$() }} : {{ trainerName }}</span>
              </p>
            </section>

            <section
              class="ae-wizard-summary"
              aria-labelledby="ae-cw-summary-files"
            >
              <div class="ae-wizard-summary-head">
                <h4 id="ae-cw-summary-files">
                  {{ supportsAddedCount$({ count: files.length }) }}
                </h4>
                <button
                  v-if="!creating"
                  type="button"
                  class="ae-wizard-edit"
                  :aria-label="editSectionOf$({ name: stepSupports$() })"
                  @click="goTo(1)"
                >
                  <AeIcon
                    name="pencil"
                    :size="16"
                  />
                  <span>{{ editAction$() }}</span>
                </button>
              </div>
              <ul
                v-if="files.length"
                class="ae-wizard-summary-files"
              >
                <li
                  v-for="item in files"
                  :key="item.id"
                >
                  <AeFileTypeBadge
                    class="ae-wizard-file-badge"
                    :filename="item.file.name"
                  />
                  <span class="ae-wizard-file-name">{{ item.file.name }}</span>
                  <span
                    v-if="item.status !== 'ready'"
                    class="ae-wizard-file-status"
                    :class="`ae-wizard-file-status-${item.status}`"
                  >
                    {{ statusLabel(item.status) }}
                  </span>
                </li>
              </ul>
              <p
                v-else
                class="ae-wizard-summary-text"
              >
                {{ noSupportsAdded$() }}
              </p>
            </section>

            <label class="ae-wizard-check">
              <input
                v-model="form.publish"
                type="checkbox"
                :disabled="creating"
              >
              <span>{{ publishNowLabel$() }}</span>
            </label>
            <p class="ae-wizard-tip">
              <AeIcon
                name="circleCheck"
                :size="24"
              />
              <span>{{ readyToCreateHint$() }}</span>
            </p>
            <p
              v-if="formError"
              class="ae-wizard-form-error"
              role="alert"
            >
              {{ formError }}
            </p>
          </div>
        </div>

        <footer class="ae-wizard-foot">
          <button
            type="button"
            class="ae-wizard-btn-neutral"
            :disabled="creating"
            @click="step === 0 ? close() : goTo(step - 1)"
          >
            {{ step === 0 ? cancelAction$() : backAction$() }}
          </button>
          <button
            v-if="step < steps.length - 1"
            type="button"
            class="ae-wizard-btn-primary"
            @click="next"
          >
            <span>{{ continueAction$() }}</span>
            <AeIcon
              name="arrowRight"
              :size="20"
            />
          </button>
          <button
            v-else
            type="button"
            class="ae-wizard-btn-primary"
            :disabled="creating"
            @click="create"
          >
            <AeIcon
              name="circleCheck"
              :size="22"
            />
            <span>{{ creating ? creatingCourse$() : createCourseAction$() }}</span>
          </button>
        </footer>
      </section>
    </div>
  </transition>

</template>


<script>

  import { computed, nextTick, reactive, ref, watch } from 'vue';
  import urls from 'kolibri/urls';
  import { coreStrings } from 'kolibri/uiText/commonCoreStrings';
  import useSnackbar from 'kolibri/composables/useSnackbar';
  import { portalStrings } from '../../strings';
  import { useTrainingApi } from '../../composables/useTrainingApi';
  import { useFacilityTrainers } from '../../composables/useFacilityTrainers';
  import AeFileDrop from '../AeFileDrop';
  import AeFileTypeBadge from '../AeFileTypeBadge';
  import AeIcon from '../AeIcon';

  /**
   * "Créer un cours" in three steps: information (with the trainer the course is
   * assigned to), course files, summary. Admins only: the server refuses others.
   * The course is created at the end, then its files are uploaded one by one.
   * Emits `created` with the new course.
   */
  export default {
    name: 'AeCourseCreateWizard',
    components: { AeFileDrop, AeFileTypeBadge, AeIcon },
    setup(props, { emit }) {
      const {
        coachQuickCreateCourse$,
        courseWizardSubtitle$,
        stepInformations$,
        stepSupports$,
        stepReview$,
        stepOfTotal$,
        presentCourseTitle$,
        courseTitleLabel$,
        courseDescriptionLabel$,
        courseDescriptionHint$,
        courseTitleTip$,
        courseTitleRequired$,
        courseTrainerLabel$,
        chooseTrainerOption$,
        trainerRequired$,
        publishNowLabel$,
        addSupportsTitle$,
        addSupportsSubtitle$,
        fileUploading$,
        fileUploaded$,
        fileFailed$,
        supportsLaterHint$,
        continueWithoutSupports$,
        reviewCourseTitle$,
        reviewCourseSubtitle$,
        courseInfoSection$,
        supportsAddedCount$,
        noSupportsAdded$,
        editAction$,
        editSectionOf$,
        readyToCreateHint$,
        continueAction$,
        backAction$,
        cancelAction$,
        createCourseAction$,
        creatingCourse$,
        courseCreated$,
        courseFilesFailed$,
        saveError$,
      } = portalStrings;
      const { closeAction$ } = coreStrings;
      const { createSnackbar } = useSnackbar();
      const { trainers, loadTrainers, trainerName: nameOfTrainer } = useFacilityTrainers();
      const api = useTrainingApi();

      const steps = [
        { id: 'informations', label: stepInformations$() },
        { id: 'supports', label: stepSupports$() },
        { id: 'review', label: stepReview$() },
      ];

      const step = ref(0);
      const form = reactive({ title: '', description: '', responsible: '', publish: true });
      const files = ref([]);
      const titleError = ref('');
      const trainerError = ref('');
      const formError = ref('');
      const creating = ref(false);
      const titleField = ref(null);
      const stepHeading = ref(null);
      let returnFocusTo = null;

      const cleanTitle = computed(() => form.title.trim());

      // The summary only shows files once their upload has started.
      const STATUS_LABELS = {
        uploading: fileUploading$,
        done: fileUploaded$,
        failed: fileFailed$,
      };

      const trainerName = computed(() => nameOfTrainer(form.responsible));

      function statusLabel(status) {
        return STATUS_LABELS[status]();
      }

      function reset() {
        step.value = 0;
        form.title = '';
        form.description = '';
        form.responsible = '';
        form.publish = true;
        trainerError.value = '';
        files.value = [];
        titleError.value = '';
        formError.value = '';
      }

      watch(
        () => props.open,
        isOpen => {
          if (isOpen) {
            returnFocusTo = document.activeElement;
            reset();
            loadTrainers();
            nextTick(() => titleField.value && titleField.value.focus());
          } else if (returnFocusTo && returnFocusTo.focus) {
            returnFocusTo.focus();
          }
        },
      );

      function close() {
        if (!creating.value) {
          emit('close');
        }
      }

      // Screen reader and keyboard users land on the heading of the new step.
      function goTo(index) {
        step.value = index;
        nextTick(() => {
          if (index === 0 && titleField.value) {
            titleField.value.focus();
          } else if (stepHeading.value) {
            stepHeading.value.focus();
          }
        });
      }

      function next() {
        if (step.value === 0) {
          titleError.value = cleanTitle.value ? '' : courseTitleRequired$();
          trainerError.value = form.responsible ? '' : trainerRequired$();
          if (titleError.value) {
            titleField.value.focus();
            return;
          }
          if (trainerError.value) {
            document.getElementById('ae-cw-trainer').focus();
            return;
          }
        }
        goTo(step.value + 1);
      }





      async function create() {
        formError.value = '';
        creating.value = true;
        let training;
        try {
          training = await api.createTraining({
            title: cleanTitle.value,
            description: form.description.trim(),
            status: form.publish ? 'published' : 'draft',
            responsible: form.responsible,
            channel_id: '',
          });
        } catch (e) {
          creating.value = false;
          formError.value = saveError$();
          return;
        }

        // One file at a time: course files can be large videos.
        let failed = 0;
        for (const item of files.value) {
          item.status = 'uploading';
          try {
            await api.uploadResource({ trainingId: training.id, title: '', file: item.file });
            item.status = 'done';
          } catch (e) {
            item.status = 'failed';
            failed += 1;
          }
        }
        creating.value = false;
        createSnackbar(
          failed
            ? courseFilesFailed$({ count: failed })
            : courseCreated$({ name: training.title || cleanTitle.value }),
        );
        emit('created', training);
      }

      return {
        coachQuickCreateCourse$,
        courseWizardSubtitle$,
        stepOfTotal$,
        stepSupports$,
        presentCourseTitle$,
        courseTitleLabel$,
        courseDescriptionLabel$,
        courseDescriptionHint$,
        courseTitleTip$,
        addSupportsTitle$,
        addSupportsSubtitle$,
        supportsLaterHint$,
        continueWithoutSupports$,
        reviewCourseTitle$,
        reviewCourseSubtitle$,
        courseInfoSection$,
        supportsAddedCount$,
        noSupportsAdded$,
        editAction$,
        editSectionOf$,
        readyToCreateHint$,
        continueAction$,
        backAction$,
        cancelAction$,
        createCourseAction$,
        creatingCourse$,
        closeAction$,
        artSrc: urls.static('action_education_portal/ae-sidebar-books.png'),
        steps,
        step,
        form,
        cleanTitle,
        files,
        titleError,
        trainerError,
        trainers,
        trainerName,
        courseTrainerLabel$,
        chooseTrainerOption$,
        publishNowLabel$,
        formError,
        creating,
        titleField,
        stepHeading,
        statusLabel,
        close,
        goTo,
        next,
        create,
      };
    },
    props: {
      open: {
        type: Boolean,
        default: false,
      },
    },
  };

</script>


<style lang="scss" scoped>

  @import '../../styles/tokens';
  @import '../../styles/components';

  .ae-wizard-visually-hidden {
    @include ae-visually-hidden;
  }

  .ae-wizard-root {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 30;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }

  .ae-wizard-backdrop {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(31, 29, 61, 0.45);
  }

  // Same size at every step, so the window does not jump.
  .ae-wizard {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 600px;
    max-width: 100%;
    height: 790px;
    max-height: 100%;
    overflow: hidden;
    background: var(--ae-surface);
    border-radius: var(--ae-radius-xl);
    box-shadow: 0 24px 60px -20px rgba(31, 29, 61, 0.45);
  }

  /* ---------- Head ---------- */

  .ae-wizard-head {
    position: relative;
    display: flex;
    flex-shrink: 0;
    gap: 18px;
    align-items: center;
    min-height: 118px;
    padding: 20px 28px;
    overflow: hidden;
    background: linear-gradient(90deg, #fdf0e7 0%, #fdf3ec 60%, #fcefe6 100%);
  }

  .ae-wizard-head-icon {
    position: relative;
    z-index: 1;
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    color: var(--ae-orange);
    background: var(--ae-orange-soft);
    border-radius: 50%;
  }

  .ae-wizard-head-text {
    position: relative;
    z-index: 1;
    flex: 1;
    min-width: 0;
    padding-right: 96px;
  }

  .ae-wizard-title {
    margin: 0;
    font-size: 28px;
    font-weight: 800;
    line-height: 1.15;
    color: var(--ae-navy);
  }

  .ae-wizard-subtitle {
    margin: 4px 0 0;
    font-size: 15px;
    color: var(--ae-text-muted);
  }

  .ae-wizard-art {
    position: absolute;
    right: 44px;
    bottom: -6px;
    width: auto;
    height: 118px;
    pointer-events: none;
  }

  .ae-wizard-close {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 2;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    color: var(--ae-navy);
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: var(--ae-radius-sm);

    &:hover {
      background: rgba(255, 255, 255, 0.7);
    }

    @include ae-focus-ring;
  }

  /* ---------- Steps ---------- */

  .ae-wizard-steps {
    display: flex;
    flex-shrink: 0;
    padding: 18px 28px 6px;
    margin: 0;
    list-style: none;
  }

  .ae-wizard-step {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 6px;
    align-items: center;
    font-size: 15px;
    font-weight: 700;
    color: var(--ae-text-muted);

    // Line from this step to the previous one.
    & + &::before {
      position: absolute;
      top: 15px;
      right: calc(50% + 22px);
      left: calc(-50% + 22px);
      height: 2px;
      content: '';
      background: var(--ae-line);
    }
  }

  .ae-wizard-step-dot {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    font-size: 15px;
    font-weight: 800;
    color: var(--ae-text-muted);
    background: var(--ae-surface);
    border: 2px solid var(--ae-field-line);
    border-radius: 50%;
  }

  .ae-wizard-step-done,
  .ae-wizard-step-current {
    color: var(--ae-orange-ink);

    .ae-wizard-step-dot {
      color: #ffffff;
      background: var(--ae-orange);
      border-color: var(--ae-orange);
    }

    &::before {
      background: var(--ae-orange);
    }
  }

  /* ---------- Body ---------- */

  .ae-wizard-body {
    flex: 1 1 auto;
    min-height: 0;
    padding: 12px 28px 16px;
    overflow-y: auto;
  }

  .ae-wizard-heading {
    margin: 8px 0 0;
    font-size: 22px;
    font-weight: 800;
    color: var(--ae-navy);
    outline: none;
  }

  .ae-wizard-lead {
    margin: 2px 0 14px;
    font-size: 16px;
    color: var(--ae-text-muted);
  }

  .ae-wizard-field {
    display: flex;
    flex-direction: column;
    margin-top: 14px;

    label {
      margin-bottom: 8px;
      font-size: 16px;
      font-weight: 700;
      color: var(--ae-navy);
    }

    input,
    textarea {
      @include ae-field;
    }

    textarea {
      height: auto;
      padding-block: 12px;
      line-height: 1.45;
      resize: vertical;
    }

    [aria-invalid='true'] {
      border-color: var(--ae-danger);
    }
  }

  .ae-wizard-select {
    position: relative;
    display: block;

    select {
      @include ae-field;

      padding-right: 44px;
      cursor: pointer;
      appearance: none;
    }

    svg {
      position: absolute;
      top: 50%;
      right: 14px;
      pointer-events: none;
      transform: translateY(-50%);
    }
  }

  .ae-wizard-summary-trainer {
    display: flex;
    gap: 8px;
    align-items: center;
    margin: 8px 0 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--ae-navy);

    svg {
      color: var(--ae-orange);
    }
  }

  .ae-wizard-check {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-top: 12px;
    font-size: 15px;
    font-weight: 600;
    color: var(--ae-navy);
    cursor: pointer;

    input {
      width: 20px;
      height: 20px;
      margin: 0;
      accent-color: var(--ae-orange);
    }
  }

  .ae-wizard-required {
    color: var(--ae-danger);
  }

  .ae-wizard-hint {
    margin: 6px 0 0;
    font-size: 14px;
    color: var(--ae-text-subtle);
  }

  .ae-wizard-error {
    margin: 6px 0 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--ae-danger);
  }

  .ae-wizard-form-error {
    padding: 12px 14px;
    margin: 12px 0 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--ae-danger);
    background: var(--ae-danger-soft);
    border-radius: var(--ae-radius-md);
  }

  .ae-wizard-tip {
    display: flex;
    gap: 14px;
    align-items: center;
    padding: 14px 18px;
    margin: 18px 0 0;
    font-size: 15px;
    color: var(--ae-text);
    background: var(--ae-orange-wash);
    border-radius: var(--ae-radius-md);

    svg {
      flex-shrink: 0;
      color: var(--ae-orange);
    }
  }

  /* ---------- Files ---------- */






  .ae-wizard-summary-files {
    padding: 0;
    margin: 12px 0 0;
    list-style: none;
  }

  .ae-wizard-summary-files li {
    display: flex;
    gap: 14px;
    align-items: center;
    min-height: 48px;
    padding: 6px 12px;

    & + & {
      border-top: 1px solid var(--ae-line);
    }
  }

  .ae-wizard-file-badge {
    flex-shrink: 0;
    width: 24px;
    height: 30px;
  }

  .ae-wizard-file-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    font-size: 15px;
    font-weight: 600;
    color: var(--ae-navy);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ae-wizard-file-status {
    display: inline-flex;
    flex-shrink: 0;
    gap: 6px;
    align-items: center;
    font-size: 14px;
    color: var(--ae-text-muted);

    &::before {
      width: 8px;
      height: 8px;
      content: '';
      background: currentcolor;
      border-radius: 50%;
    }
  }

  .ae-wizard-file-status-ready,
  .ae-wizard-file-status-done {
    color: #1b7f45;
  }

  .ae-wizard-file-status-uploading {
    color: var(--ae-orange-ink);
  }

  .ae-wizard-file-status-failed {
    color: var(--ae-danger);
  }


  .ae-wizard-later {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
    align-items: center;
    justify-content: space-between;
    margin: 14px 0 0;
    font-size: 14px;
    color: var(--ae-text-muted);
  }

  .ae-wizard-link {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding: 4px;
    font: inherit;
    font-size: 15px;
    font-weight: 700;
    color: var(--ae-orange-ink);
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 6px;

    @include ae-focus-ring;
  }

  /* ---------- Summary ---------- */

  .ae-wizard-summary {
    padding: 14px 18px;
    margin-top: 12px;
    border: 1px solid var(--ae-line);
    border-radius: var(--ae-radius-md);

    .ae-wizard-summary-files {
      margin: 4px -12px 0;
    }
  }

  .ae-wizard-summary-head {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;

    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 800;
      color: var(--ae-navy);
    }
  }

  .ae-wizard-edit {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    padding: 4px 6px;
    font: inherit;
    font-size: 15px;
    font-weight: 700;
    color: var(--ae-orange-ink);
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 6px;

    &:hover {
      text-decoration: underline;
    }

    @include ae-focus-ring;
  }

  .ae-wizard-summary-title {
    margin: 10px 0 0;
    font-size: 18px;
    font-weight: 800;
    color: var(--ae-navy);
  }

  .ae-wizard-summary-text {
    margin: 4px 0 0;
    font-size: 15px;
    line-height: 1.45;
    color: var(--ae-text-muted);
  }

  /* ---------- Footer ---------- */

  .ae-wizard-foot {
    display: flex;
    flex-shrink: 0;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    padding: 16px 28px 22px;
    border-top: 1px solid var(--ae-line);
  }

  .ae-wizard-btn-neutral {
    @include ae-button-outline;

    min-width: 130px;
    min-height: 48px;
    font-size: 17px;
    color: var(--ae-navy);
    border-color: var(--ae-field-line);

    &:hover {
      background: var(--ae-surface-muted);
    }

    &:disabled {
      cursor: default;
      opacity: 0.6;
    }
  }

  .ae-wizard-btn-primary {
    @include ae-button-primary;
  }

  /* ---------- Motion ---------- */

  .ae-wizard-enter-active,
  .ae-wizard-leave-active {
    transition: opacity 200ms ease;

    .ae-wizard {
      transition: transform 200ms ease;
    }
  }

  .ae-wizard-enter,
  .ae-wizard-leave-to {
    opacity: 0;

    .ae-wizard {
      transform: translateY(16px) scale(0.98);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ae-wizard-enter-active,
    .ae-wizard-leave-active,
    .ae-wizard-enter-active .ae-wizard,
    .ae-wizard-leave-active .ae-wizard {
      transition: none;
    }
  }

  /* ---------- Shorter and narrower screens ---------- */

  @media (max-height: 799px) {
    .ae-wizard-head {
      min-height: 92px;
      padding-block: 14px;
    }

    .ae-wizard-head-icon {
      width: 52px;
      height: 52px;
    }

    .ae-wizard-title {
      font-size: 24px;
    }

    .ae-wizard-art {
      height: 96px;
    }

    .ae-wizard-steps {
      padding-top: 12px;
    }

    .ae-wizard-field textarea {
      min-height: 84px;
    }

    .ae-wizard-foot {
      padding-block: 12px 16px;
    }

    .ae-wizard-summary-files li {
      min-height: 40px;
    }
  }

  // Laptop screens (1366 × 768 minus the browser bars): everything still fits.
  @media (max-height: 699px) {
    .ae-wizard-head {
      min-height: 72px;
      padding-block: 10px;
    }

    .ae-wizard-head-icon {
      width: 44px;
      height: 44px;
    }

    .ae-wizard-title {
      font-size: 22px;
    }

    .ae-wizard-subtitle {
      font-size: 14px;
    }

    .ae-wizard-art {
      height: 76px;
    }

    .ae-wizard-steps {
      padding-top: 8px;
    }

    .ae-wizard-step {
      gap: 2px;
      font-size: 14px;

      & + &::before {
        top: 12px;
      }
    }

    .ae-wizard-step-dot {
      width: 26px;
      height: 26px;
      font-size: 13px;
    }

    .ae-wizard-body {
      padding-block: 6px 10px;
    }

    .ae-wizard-heading {
      margin-top: 4px;
      font-size: 19px;
    }

    .ae-wizard-lead {
      margin-bottom: 8px;
      font-size: 15px;
    }

    .ae-wizard-field {
      margin-top: 10px;

      label {
        margin-bottom: 4px;
      }

      input {
        height: 42px;
      }

      textarea {
        min-height: 64px;
      }
    }

    // The tips are the first to go.
    .ae-wizard-tip {
      display: none;
    }



    .ae-wizard-summary {
      padding: 10px 14px;
      margin-top: 8px;
    }

    .ae-wizard-summary-title {
      margin-top: 6px;
      font-size: 16px;
    }

    .ae-wizard-summary-files li {
      min-height: 34px;
    }

    .ae-wizard-foot {
      padding-block: 10px 12px;
    }
  }

  @media (max-width: 599px) {
    .ae-wizard-art {
      display: none;
    }

    .ae-wizard-head-text {
      padding-right: 32px;
    }

    .ae-wizard-head,
    .ae-wizard-steps,
    .ae-wizard-body,
    .ae-wizard-foot {
      padding-inline: 18px;
    }
  }

</style>
