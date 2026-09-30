<template>

  <AeSidePanel
    :open="open"
    :title="createGroupTitle$()"
    :subtitle="createGroupSubtitle$()"
    icon="users"
    titleId="ae-create-group-title"
    @close="close"
  >
    <form
      class="ae-gc-form"
      novalidate
      @submit.prevent="save(true)"
    >
      <h3 class="ae-side-panel-section">
        <span
          class="ae-side-panel-section-icon"
          aria-hidden="true"
        >
          <KIcon
            icon="people"
            color="var(--ae-orange)"
          />
        </span>
        <span>{{ groupInfoSection$() }}</span>
      </h3>

      <div class="ae-side-panel-field">
        <label for="ae-cg-name">{{ columnGroupName$() }}</label>
        <input
          id="ae-cg-name"
          ref="nameField"
          v-model="form.name"
          type="text"
          maxlength="120"
          autocomplete="off"
          :placeholder="groupNamePlaceholder$()"
          :aria-invalid="nameError ? 'true' : 'false'"
          aria-describedby="ae-cg-name-error"
        >
        <p
          v-if="nameError"
          id="ae-cg-name-error"
          class="ae-side-panel-error"
        >
          {{ nameError }}
        </p>
      </div>

      <h3 class="ae-side-panel-section">
        <span
          class="ae-side-panel-section-icon"
          aria-hidden="true"
        >
          <KIcon
            icon="coach"
            color="var(--ae-orange)"
          />
        </span>
        <span id="ae-cg-coaches-title">{{ groupCoachesSection$() }}</span>
      </h3>

      <AePersonPicker
        v-model="form.coachIds"
        :people="staff"
        layout="grid"
        labelledby="ae-cg-coaches-title"
        :emptyText="noCoachesAvailable$()"
        :loading="loadingPeople"
      />

      <h3 class="ae-side-panel-section">
        <span
          class="ae-side-panel-section-icon"
          aria-hidden="true"
        >
          <KIcon
            icon="person"
            color="var(--ae-orange)"
          />
        </span>
        <span id="ae-cg-learners-title">{{ groupLearnersSection$() }}</span>
      </h3>

      <!-- Remounted on reset, which also clears its search. -->
      <AePersonPicker
        :key="pickerKey"
        v-model="form.learnerIds"
        :people="learners"
        searchable
        :searchLabel="searchLearnersLabel$()"
        labelledby="ae-cg-learners-title"
        :emptyText="noLearnersAvailable$()"
        :loading="loadingPeople"
      />

      <p
        v-if="formError"
        class="ae-side-panel-form-error"
        role="alert"
      >
        {{ formError }}
      </p>

      <!-- Lets Enter in the name field submit the form ("save and close"). -->
      <button
        type="submit"
        hidden
        tabindex="-1"
        aria-hidden="true"
      ></button>
    </form>

    <template #footer>
      <button
        type="button"
        class="ae-side-panel-btn-outline"
        :disabled="saving"
        @click="save(false)"
      >
        {{ saveAndCreateAnother$() }}
      </button>
      <div class="ae-side-panel-foot-row">
        <button
          type="button"
          class="ae-side-panel-btn-neutral"
          @click="close"
        >
          {{ cancelAction$() }}
        </button>
        <button
          type="button"
          class="ae-side-panel-btn-primary"
          :disabled="saving"
          @click="save(true)"
        >
          {{ saveAndClose$() }}
        </button>
      </div>
    </template>
  </AeSidePanel>

</template>


<script>

  import { computed, nextTick, reactive, ref, watch } from 'vue';
  import { UserKinds } from 'kolibri/constants';
  import { coreStrings } from 'kolibri/uiText/commonCoreStrings';
  import { currentLanguage } from 'kolibri/utils/i18n';
  import useSnackbar from 'kolibri/composables/useSnackbar';
  import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
  import RoleResource from 'kolibri-common/apiResources/RoleResource';
  import MembershipResource from 'kolibri-common/apiResources/MembershipResource';
  import ClassroomResource from 'kolibri-common/apiResources/ClassroomResource';
  import { portalStrings } from '../../strings';
  import AePersonPicker from '../AePersonPicker';
  import AeSidePanel from '../AeSidePanel';

  const STAFF_KINDS = [UserKinds.COACH, UserKinds.ASSIGNABLE_COACH, UserKinds.ADMIN];

  // Kolibri compares class names ignoring case and repeated spaces.
  function cleanName(name) {
    return name.trim().replace(/\s+/g, ' ');
  }

  function emptyForm() {
    return { name: '', coachIds: [], learnerIds: [] };
  }

  /**
   * Creates a class the way Kolibri facility management does:
   * the classroom, then its coach roles and learner memberships.
   */
  export default {
    name: 'AeGroupCreatePanel',
    components: { AePersonPicker, AeSidePanel },
    setup(props, { emit }) {
      const {
        createGroupTitle$,
        createGroupSubtitle$,
        groupInfoSection$,
        columnGroupName$,
        groupNamePlaceholder$,
        groupCoachesSection$,
        groupLearnersSection$,
        searchLearnersLabel$,
        noCoachesAvailable$,
        noLearnersAvailable$,
        saveAndCreateAnother$,
        saveAndClose$,
        fieldRequired$,
        groupNameTaken$,
        createGroupError$,
        groupMembersError$,
        groupCreated$,
        spaceAdmin$,
        spaceCoach$,
      } = portalStrings;
      const { cancelAction$ } = coreStrings;
      const { createSnackbar } = useSnackbar();

      const form = reactive(emptyForm());
      const pickerKey = ref(0);
      const nameError = ref('');
      const formError = ref('');
      const saving = ref(false);
      const loadingPeople = ref(false);
      const users = ref([]);
      const classrooms = ref([]);
      const nameField = ref(null);

      const collator = new Intl.Collator(currentLanguage, { sensitivity: 'base' });

      const people = computed(() =>
        users.value
          .map(user => {
            const kinds = (user.roles || []).map(role => role.kind);
            return {
              id: user.id,
              fullName: user.full_name || user.username,
              username: user.username,
              isStaff: kinds.some(kind => STAFF_KINDS.includes(kind)),
              role: kinds.includes(UserKinds.ADMIN) ? spaceAdmin$() : spaceCoach$(),
            };
          })
          .sort((a, b) => collator.compare(a.fullName, b.fullName)),
      );

      const staff = computed(() =>
        people.value
          .filter(person => person.isStaff)
          .map(person => ({ ...person, meta: person.role })),
      );

      const learners = computed(() =>
        people.value
          .filter(person => !person.isStaff)
          .map(person => ({ ...person, meta: person.username })),
      );

      function resetForm() {
        Object.assign(form, emptyForm());
        pickerKey.value += 1;
        nameError.value = '';
        formError.value = '';
      }

      function focusName() {
        nextTick(() => nameField.value && nameField.value.focus());
      }

      watch(
        () => props.open,
        isOpen => {
          if (!isOpen) {
            return;
          }
          resetForm();
          focusName();
          loadingPeople.value = true;
          Promise.allSettled([
            FacilityUserResource.fetchCollection({
              getParams: { member_of: props.facilityId },
              force: true,
            }),
            ClassroomResource.fetchCollection({
              getParams: { facility: props.facilityId },
              force: true,
            }),
          ]).then(([usersResult, classroomsResult]) => {
            users.value = usersResult.status === 'fulfilled' ? usersResult.value || [] : [];
            classrooms.value =
              classroomsResult.status === 'fulfilled' ? classroomsResult.value || [] : [];
            loadingPeople.value = false;
          });
        },
      );

      function close() {
        emit('close');
      }

      function validate() {
        const name = cleanName(form.name).toLowerCase();
        if (!name) {
          nameError.value = fieldRequired$();
        } else if (
          classrooms.value.some(classroom => cleanName(classroom.name).toLowerCase() === name)
        ) {
          nameError.value = groupNameTaken$();
        } else {
          nameError.value = '';
        }
        if (nameError.value) {
          nameField.value.focus();
          return false;
        }
        return true;
      }

      function addMembers(classroom) {
        const requests = [];
        if (form.coachIds.length) {
          requests.push(
            RoleResource.saveCollection({
              data: form.coachIds.map(user => ({
                collection: classroom.id,
                user,
                kind: UserKinds.COACH,
              })),
            }),
          );
        }
        if (form.learnerIds.length) {
          requests.push(
            MembershipResource.saveCollection({
              data: form.learnerIds.map(user => ({ collection: classroom.id, user })),
            }),
          );
        }
        return Promise.all(requests);
      }

      async function save(closeAfter) {
        formError.value = '';
        if (!validate()) {
          return;
        }
        saving.value = true;
        let classroom;
        try {
          classroom = await ClassroomResource.saveModel({
            data: { name: cleanName(form.name), parent: props.facilityId },
          });
        } catch (error) {
          saving.value = false;
          formError.value = createGroupError$();
          return;
        }
        // A second try must not create the same group twice.
        classrooms.value = [...classrooms.value, classroom];

        let membersFailed = false;
        try {
          await addMembers(classroom);
        } catch (error) {
          membersFailed = true;
        }

        saving.value = false;
        // The group exists either way; refresh the list once its members are saved.
        emit('created', classroom);
        if (membersFailed) {
          formError.value = groupMembersError$();
          return;
        }
        createSnackbar(groupCreated$({ name: classroom.name }));
        if (closeAfter) {
          close();
        } else {
          resetForm();
          focusName();
        }
      }

      return {
        createGroupTitle$,
        createGroupSubtitle$,
        groupInfoSection$,
        columnGroupName$,
        groupNamePlaceholder$,
        groupCoachesSection$,
        groupLearnersSection$,
        searchLearnersLabel$,
        noCoachesAvailable$,
        noLearnersAvailable$,
        saveAndCreateAnother$,
        saveAndClose$,
        cancelAction$,
        form,
        pickerKey,
        nameError,
        formError,
        saving,
        loadingPeople,
        staff,
        learners,
        nameField,
        close,
        save,
      };
    },
    props: {
      open: {
        type: Boolean,
        default: false,
      },
      facilityId: {
        type: String,
        required: true,
      },
    },
  };

</script>


<style lang="scss" scoped>

  // The learner list takes the height left in the panel and scrolls on its own.
  .ae-gc-form {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

</style>
