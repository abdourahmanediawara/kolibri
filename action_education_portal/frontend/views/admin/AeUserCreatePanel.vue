<template>

  <AeSidePanel
    :open="open"
    :title="isStaffPanel ? addCoachTitle$() : createUserTitle$()"
    :subtitle="isStaffPanel ? addCoachSubtitle$() : createUserSubtitle$()"
    icon="userPlus"
    titleId="ae-create-user-title"
    @close="close"
  >
    <form
      ref="formElement"
      novalidate
      @submit.prevent="save(true)"
    >
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
        <span>{{ accountInfoSection$() }}</span>
      </h3>

      <div class="ae-side-panel-row">
        <div class="ae-side-panel-field">
          <label for="ae-cu-fullname">{{ fullNameLabel$() }}</label>
          <input
            id="ae-cu-fullname"
            ref="firstField"
            v-model="form.fullName"
            type="text"
            maxlength="120"
            autocomplete="off"
            :placeholder="fullNamePlaceholder$()"
            :aria-invalid="errors.fullName ? 'true' : 'false'"
            aria-describedby="ae-cu-fullname-error"
          >
          <p
            v-if="errors.fullName"
            id="ae-cu-fullname-error"
            class="ae-side-panel-error"
          >
            {{ errors.fullName }}
          </p>
        </div>
        <div class="ae-side-panel-field">
          <label for="ae-cu-username">{{ usernameLabel$() }}</label>
          <input
            id="ae-cu-username"
            v-model.trim="form.username"
            type="text"
            maxlength="30"
            autocomplete="off"
            autocapitalize="none"
            spellcheck="false"
            :placeholder="usernamePlaceholder$()"
            :aria-invalid="errors.username ? 'true' : 'false'"
            aria-describedby="ae-cu-username-error"
          >
          <p
            v-if="errors.username"
            id="ae-cu-username-error"
            class="ae-side-panel-error"
          >
            {{ errors.username }}
          </p>
        </div>
      </div>

      <div class="ae-side-panel-row">
        <div class="ae-side-panel-field">
          <label for="ae-cu-password">{{ passwordLabel$() }}</label>
          <span class="ae-side-panel-affix">
            <input
              id="ae-cu-password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              :placeholder="newPasswordPlaceholder$()"
              :aria-invalid="errors.password ? 'true' : 'false'"
              aria-describedby="ae-cu-password-error"
            >
            <button
              type="button"
              :aria-label="showPassword ? signInHidePassword$() : signInShowPassword$()"
              :aria-pressed="showPassword ? 'true' : 'false'"
              @click="showPassword = !showPassword"
            >
              <AeIcon
                :name="showPassword ? 'eyeOff' : 'eye'"
                :size="20"
              />
            </button>
          </span>
          <p
            v-if="errors.password"
            id="ae-cu-password-error"
            class="ae-side-panel-error"
          >
            {{ errors.password }}
          </p>
        </div>
        <div class="ae-side-panel-field">
          <label for="ae-cu-confirm">{{ confirmPasswordLabel$() }}</label>
          <span class="ae-side-panel-affix">
            <input
              id="ae-cu-confirm"
              v-model="form.confirm"
              :type="showConfirm ? 'text' : 'password'"
              autocomplete="new-password"
              :placeholder="confirmPasswordLabel$()"
              :aria-invalid="errors.confirm ? 'true' : 'false'"
              aria-describedby="ae-cu-confirm-error"
            >
            <button
              type="button"
              :aria-label="showConfirm ? signInHidePassword$() : signInShowPassword$()"
              :aria-pressed="showConfirm ? 'true' : 'false'"
              @click="showConfirm = !showConfirm"
            >
              <AeIcon
                :name="showConfirm ? 'eyeOff' : 'eye'"
                :size="20"
              />
            </button>
          </span>
          <p
            v-if="errors.confirm"
            id="ae-cu-confirm-error"
            class="ae-side-panel-error"
          >
            {{ errors.confirm }}
          </p>
        </div>
      </div>

      <h3 class="ae-side-panel-section">
        <span
          class="ae-side-panel-section-icon"
          aria-hidden="true"
        >
          <KIcon
            icon="lesson"
            color="var(--ae-orange)"
          />
        </span>
        <span>{{ extraInfoSection$() }}</span>
      </h3>

      <div class="ae-side-panel-row ae-side-panel-row-3">
        <div class="ae-side-panel-field">
          <label for="ae-cu-identifier">{{ identifierLabel$() }}</label>
          <input
            id="ae-cu-identifier"
            v-model.trim="form.idNumber"
            type="text"
            maxlength="64"
            autocomplete="off"
            :placeholder="identifierPlaceholder$()"
          >
        </div>
        <div class="ae-side-panel-field">
          <label for="ae-cu-birth">{{ birthYearLabel$() }}</label>
          <span class="ae-side-panel-affix">
            <select
              id="ae-cu-birth"
              v-model="form.birthYear"
            >
              <option :value="NOT_SPECIFIED">
                {{ notSpecifiedOption$() }}
              </option>
              <option
                v-for="year in birthYears"
                :key="year"
                :value="String(year)"
              >
                {{ year }}
              </option>
            </select>
            <AeIcon
              name="chevronDown"
              :size="18"
            />
          </span>
        </div>
        <div class="ae-side-panel-field">
          <label for="ae-cu-gender">{{ genderLabel$() }}</label>
          <span class="ae-side-panel-affix">
            <select
              id="ae-cu-gender"
              v-model="form.gender"
            >
              <option :value="NOT_SPECIFIED">
                {{ notSpecifiedOption$() }}
              </option>
              <option :value="FEMALE">
                {{ genderFemale$() }}
              </option>
              <option :value="MALE">
                {{ genderMale$() }}
              </option>
            </select>
            <AeIcon
              name="chevronDown"
              :size="18"
            />
          </span>
        </div>
      </div>

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
        <span>{{ assignmentSection$() }}</span>
      </h3>

      <div class="ae-side-panel-row">
        <div class="ae-side-panel-field">
          <label for="ae-cu-kind">{{ userTypeLabel$() }}</label>
          <span class="ae-side-panel-affix">
            <select
              id="ae-cu-kind"
              v-model="form.kind"
            >
              <option
                v-for="option in kindOptions"
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
          </span>
        </div>
        <div class="ae-side-panel-field">
          <label for="ae-cu-class">
            {{ form.kind === LEARNER ? enrollInClassLabel$() : assignToClassLabel$() }}
          </label>
          <span class="ae-side-panel-affix">
            <select
              id="ae-cu-class"
              v-model="form.classId"
            >
              <option value="">
                {{ selectClassPlaceholder$() }}
              </option>
              <option
                v-for="classroom in classrooms"
                :key="classroom.id"
                :value="classroom.id"
              >
                {{ classroom.name }}
              </option>
            </select>
            <AeIcon
              name="chevronDown"
              :size="18"
            />
          </span>
        </div>
      </div>

      <p
        v-if="formError"
        class="ae-side-panel-form-error"
        role="alert"
      >
        {{ formError }}
      </p>

      <!-- Lets Enter submit the form ("save and close"). -->
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
        {{ saveAndAddAnother$() }}
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
  import {
    DemographicConstants,
    ERROR_CONSTANTS,
    FacilityUserGender,
    UserKinds,
  } from 'kolibri/constants';
  import { coreStrings } from 'kolibri/uiText/commonCoreStrings';
  import CatchErrors from 'kolibri/utils/CatchErrors';
  import { validateUsername } from 'kolibri/utils/validators';
  import useSnackbar from 'kolibri/composables/useSnackbar';
  import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
  import RoleResource from 'kolibri-common/apiResources/RoleResource';
  import MembershipResource from 'kolibri-common/apiResources/MembershipResource';
  import ClassroomResource from 'kolibri-common/apiResources/ClassroomResource';
  import { portalStrings } from '../../strings';
  import AeIcon from '../AeIcon';
  import AeSidePanel from '../AeSidePanel';

  const FIRST_BIRTH_YEAR = 1900;
  // [error key, input id suffix], in form order.
  const FIELD_IDS = [
    ['fullName', 'fullname'],
    ['username', 'username'],
    ['password', 'password'],
    ['confirm', 'confirm'],
  ];

  function emptyForm(kind) {
    return {
      fullName: '',
      username: '',
      password: '',
      confirm: '',
      kind,
      idNumber: '',
      birthYear: DemographicConstants.NOT_SPECIFIED,
      gender: DemographicConstants.NOT_SPECIFIED,
      classId: '',
    };
  }

  /**
   * Creates a facility user the way Kolibri facility management does:
   * the account, then its facility role, then an optional class enrollment.
   */
  export default {
    name: 'AeUserCreatePanel',
    components: { AeIcon, AeSidePanel },
    setup(props, { emit }) {
      const {
        createUserTitle$,
        createUserSubtitle$,
        addCoachTitle$,
        addCoachSubtitle$,
        accountInfoSection$,
        extraInfoSection$,
        assignmentSection$,
        fullNameLabel$,
        fullNamePlaceholder$,
        usernameLabel$,
        usernamePlaceholder$,
        passwordLabel$,
        newPasswordPlaceholder$,
        confirmPasswordLabel$,
        userTypeLabel$,
        identifierLabel$,
        identifierPlaceholder$,
        birthYearLabel$,
        genderLabel$,
        notSpecifiedOption$,
        genderFemale$,
        genderMale$,
        enrollInClassLabel$,
        assignToClassLabel$,
        selectClassPlaceholder$,
        saveAndAddAnother$,
        saveAndClose$,
        fieldRequired$,
        usernameInvalid$,
        usernameTaken$,
        passwordMismatch$,
        createUserError$,
        assignmentError$,
        userCreated$,
        signInShowPassword$,
        signInHidePassword$,
        spaceLearner$,
        spaceCoach$,
        spaceAdmin$,
      } = portalStrings;
      const { cancelAction$ } = coreStrings;
      const { createSnackbar } = useSnackbar();

      const form = reactive(emptyForm(props.defaultKind));
      const errors = reactive({ fullName: '', username: '', password: '', confirm: '' });
      const formError = ref('');
      const saving = ref(false);
      const showPassword = ref(false);
      const showConfirm = ref(false);
      const classrooms = ref([]);
      const firstField = ref(null);
      const formElement = ref(null);

      const isStaffPanel = computed(() => props.defaultKind !== UserKinds.LEARNER);

      const kindOptions = [
        { value: UserKinds.LEARNER, label: spaceLearner$() },
        { value: UserKinds.COACH, label: spaceCoach$() },
        { value: UserKinds.ADMIN, label: spaceAdmin$() },
      ];

      const thisYear = new Date().getFullYear();
      const birthYears = Array.from(
        { length: thisYear - FIRST_BIRTH_YEAR + 1 },
        (_, index) => thisYear - index,
      );

      function resetForm() {
        Object.assign(form, emptyForm(props.defaultKind));
        Object.keys(errors).forEach(key => {
          errors[key] = '';
        });
        formError.value = '';
        showPassword.value = false;
        showConfirm.value = false;
      }

      function focusFirstField() {
        nextTick(() => firstField.value && firstField.value.focus());
      }

      watch(
        () => props.open,
        isOpen => {
          if (!isOpen) {
            return;
          }
          resetForm();
          focusFirstField();
          ClassroomResource.fetchCollection({ getParams: { facility: props.facilityId } })
            .then(result => {
              classrooms.value = result || [];
            })
            .catch(() => {
              classrooms.value = [];
            });
        },
      );

      function close() {
        emit('close');
      }

      function validate() {
        errors.fullName = form.fullName.trim() ? '' : fieldRequired$();
        if (!form.username) {
          errors.username = fieldRequired$();
        } else {
          errors.username = validateUsername(form.username) ? '' : usernameInvalid$();
        }
        errors.password = form.password ? '' : fieldRequired$();
        if (!form.confirm) {
          errors.confirm = fieldRequired$();
        } else {
          errors.confirm = form.confirm === form.password ? '' : passwordMismatch$();
        }
        const invalid = FIELD_IDS.find(([key]) => errors[key]);
        if (invalid) {
          formElement.value.querySelector(`#ae-cu-${invalid[1]}`).focus();
          return false;
        }
        return true;
      }

      // Class enrollment: learners join the class, staff coach it.
      function assignToClass(user) {
        if (!form.classId) {
          return Promise.resolve();
        }
        if (form.kind === UserKinds.LEARNER) {
          return MembershipResource.saveModel({
            data: { collection: form.classId, user: user.id },
          });
        }
        return RoleResource.saveModel({
          data: { collection: form.classId, user: user.id, kind: UserKinds.COACH },
        });
      }

      async function save(closeAfter) {
        formError.value = '';
        if (!validate()) {
          return;
        }
        saving.value = true;
        let user;
        try {
          user = await FacilityUserResource.saveModel({
            data: {
              facility: props.facilityId,
              username: form.username,
              full_name: form.fullName.trim(),
              password: form.password,
              id_number: form.idNumber,
              gender: form.gender,
              birth_year: form.birthYear,
            },
          });
        } catch (error) {
          saving.value = false;
          const caught = CatchErrors(error, [
            ERROR_CONSTANTS.USERNAME_ALREADY_EXISTS,
            ERROR_CONSTANTS.INVALID_USERNAME,
          ]);
          if (caught && caught.includes(ERROR_CONSTANTS.USERNAME_ALREADY_EXISTS)) {
            errors.username = usernameTaken$();
          } else if (caught) {
            errors.username = usernameInvalid$();
          } else {
            formError.value = createUserError$();
          }
          return;
        }

        let assignmentFailed = false;
        try {
          if (form.kind !== UserKinds.LEARNER) {
            await RoleResource.saveModel({
              data: { user: user.id, collection: props.facilityId, kind: form.kind },
            });
          }
          await assignToClass(user);
        } catch (error) {
          assignmentFailed = true;
        }

        saving.value = false;
        // The account exists either way; refresh the list once its roles are saved.
        emit('created', user);
        if (assignmentFailed) {
          formError.value = assignmentError$();
          return;
        }
        createSnackbar(userCreated$({ name: user.full_name || user.username }));
        if (closeAfter) {
          close();
        } else {
          resetForm();
          focusFirstField();
        }
      }

      return {
        createUserTitle$,
        createUserSubtitle$,
        addCoachTitle$,
        addCoachSubtitle$,
        accountInfoSection$,
        extraInfoSection$,
        assignmentSection$,
        fullNameLabel$,
        fullNamePlaceholder$,
        usernameLabel$,
        usernamePlaceholder$,
        passwordLabel$,
        newPasswordPlaceholder$,
        confirmPasswordLabel$,
        userTypeLabel$,
        identifierLabel$,
        identifierPlaceholder$,
        birthYearLabel$,
        genderLabel$,
        notSpecifiedOption$,
        genderFemale$,
        genderMale$,
        enrollInClassLabel$,
        assignToClassLabel$,
        selectClassPlaceholder$,
        saveAndAddAnother$,
        saveAndClose$,
        signInShowPassword$,
        signInHidePassword$,
        cancelAction$,
        NOT_SPECIFIED: DemographicConstants.NOT_SPECIFIED,
        FEMALE: FacilityUserGender.FEMALE,
        MALE: FacilityUserGender.MALE,
        LEARNER: UserKinds.LEARNER,
        isStaffPanel,
        kindOptions,
        birthYears,
        form,
        errors,
        formError,
        saving,
        showPassword,
        showConfirm,
        classrooms,
        firstField,
        formElement,
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
      /** Preselected user type (UserKinds value); a staff type turns this into "add a trainer". */
      defaultKind: {
        type: String,
        default: UserKinds.LEARNER,
      },
    },
  };

</script>
