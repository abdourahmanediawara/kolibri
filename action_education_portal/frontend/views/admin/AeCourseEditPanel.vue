<template>

  <AeSidePanel
    :open="Boolean(training)"
    :title="editCourseTitle$()"
    :subtitle="editCourseSubtitle$()"
    icon="bookOpen"
    titleId="ae-edit-course-title"
    :alert="formError ? { kind: 'error', text: formError } : null"
    @close="$emit('close')"
  >
    <form
      v-if="training"
      novalidate
      @submit.prevent="save"
    >
      <div class="ae-side-panel-field">
        <label for="ae-ec-title">{{ courseTitleLabel$() }}</label>
        <input
          id="ae-ec-title"
          ref="titleField"
          v-model="form.title"
          type="text"
          maxlength="200"
          autocomplete="off"
          :aria-invalid="titleError ? 'true' : 'false'"
          aria-describedby="ae-ec-title-error"
        >
        <p
          v-if="titleError"
          id="ae-ec-title-error"
          class="ae-side-panel-error"
        >
          {{ titleError }}
        </p>
      </div>
      <div class="ae-side-panel-field">
        <label for="ae-ec-description">{{ courseDescriptionLabel$() }}</label>
        <textarea
          id="ae-ec-description"
          v-model="form.description"
          class="ae-edit-course-textarea"
          rows="4"
        ></textarea>
      </div>
      <div class="ae-side-panel-row">
        <div class="ae-side-panel-field">
          <label for="ae-ec-trainer">{{ courseTrainerLabel$() }}</label>
          <span class="ae-side-panel-affix">
            <select
              id="ae-ec-trainer"
              v-model="form.responsible"
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
        </div>
        <div class="ae-side-panel-field">
          <label for="ae-ec-status">{{ colStatus$() }}</label>
          <span class="ae-side-panel-affix">
            <select
              id="ae-ec-status"
              v-model="form.status"
            >
              <option value="published">{{ statusPublished$() }}</option>
              <option value="draft">{{ statusDraft$() }}</option>
            </select>
            <AeIcon
              name="chevronDown"
              :size="18"
            />
          </span>
        </div>
      </div>
      <p class="ae-edit-course-hint">
        {{ courseStatusHint$() }}
      </p>
    </form>

    <template #footer>
      <div class="ae-side-panel-foot-row">
        <button
          type="button"
          class="ae-side-panel-btn-neutral"
          @click="$emit('close')"
        >
          {{ cancelAction$() }}
        </button>
        <button
          type="button"
          class="ae-side-panel-btn-primary"
          :disabled="saving"
          @click="save"
        >
          {{ saveChangesAction$() }}
        </button>
      </div>
    </template>
  </AeSidePanel>

</template>


<script>

  import { nextTick, reactive, ref, watch } from 'vue';
  import useSnackbar from 'kolibri/composables/useSnackbar';
  import { portalStrings } from '../../strings';
  import { useTrainingApi } from '../../composables/useTrainingApi';
  import { useFacilityTrainers } from '../../composables/useFacilityTrainers';
  import AeIcon from '../AeIcon';
  import AeSidePanel from '../AeSidePanel';

  /** Admins change a course: title, description, assigned trainer, visibility. */
  export default {
    name: 'AeCourseEditPanel',
    components: { AeIcon, AeSidePanel },
    setup(props, { emit }) {
      const {
        editCourseTitle$,
        editCourseSubtitle$,
        courseTitleLabel$,
        courseDescriptionLabel$,
        courseTrainerLabel$,
        chooseTrainerOption$,
        colStatus$,
        statusPublished$,
        statusDraft$,
        courseStatusHint$,
        courseTitleRequired$,
        saveChangesAction$,
        courseSaved$,
        cancelAction$,
        saveError$,
        formHasErrors$,
      } = portalStrings;
      const { createSnackbar } = useSnackbar();
      const api = useTrainingApi();
      const { trainers, loadTrainers } = useFacilityTrainers();

      const form = reactive({ title: '', description: '', responsible: '', status: 'published' });
      const titleError = ref('');
      const formError = ref('');
      const saving = ref(false);
      const titleField = ref(null);

      watch(
        () => props.training,
        training => {
          if (!training) {
            return;
          }
          Object.assign(form, {
            title: training.title,
            description: training.description || '',
            responsible: training.responsible || '',
            status: training.status === 'draft' ? 'draft' : 'published',
          });
          titleError.value = '';
          formError.value = '';
          loadTrainers();
          nextTick(() => titleField.value && titleField.value.focus());
        },
      );

      async function save() {
        titleError.value = form.title.trim() ? '' : courseTitleRequired$();
        if (titleError.value) {
          formError.value = formHasErrors$();
          titleField.value.focus();
          return;
        }
        formError.value = '';
        saving.value = true;
        try {
          const updated = await api.updateTraining(props.training.id, {
            title: form.title.trim(),
            description: form.description.trim(),
            responsible: form.responsible || null,
            status: form.status,
          });
          createSnackbar(courseSaved$());
          emit('saved', updated);
        } catch (e) {
          formError.value = saveError$();
        } finally {
          saving.value = false;
        }
      }

      return {
        editCourseTitle$,
        editCourseSubtitle$,
        courseTitleLabel$,
        courseDescriptionLabel$,
        courseTrainerLabel$,
        chooseTrainerOption$,
        colStatus$,
        statusPublished$,
        statusDraft$,
        courseStatusHint$,
        saveChangesAction$,
        cancelAction$,
        trainers,
        form,
        titleError,
        formError,
        saving,
        titleField,
        save,
      };
    },
    props: {
      /** The course to change, or null when closed. */
      training: {
        type: Object,
        default: null,
      },
    },
  };

</script>


<style lang="scss" scoped>

  @import '../../styles/components';

  .ae-edit-course-textarea {
    @include ae-field;

    height: auto;
    padding-block: 12px;
    line-height: 1.45;
    resize: vertical;
  }

  .ae-edit-course-hint {
    margin: 0;
    font-size: 14px;
    color: var(--ae-text-subtle);
  }

</style>
