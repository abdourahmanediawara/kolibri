<template>

  <AeSidePanel
    :open="Boolean(user)"
    :title="editAccount$()"
    :subtitle="editAccountSubtitle$()"
    icon="user"
    titleId="ae-edit-user-title"
    :alert="panelAlert"
    @close="$emit('close')"
  >
    <form
      v-if="user"
      ref="formElement"
      novalidate
      @submit.prevent="save"
    >
      <h3 class="ae-side-panel-section">
        {{ accountInfoSection$() }}
      </h3>
      <div class="ae-side-panel-row">
        <div class="ae-side-panel-field">
          <label for="ae-eu-fullname">{{ fullNameLabel$() }}</label>
          <input
            id="ae-eu-fullname"
            v-model="form.fullName"
            type="text"
            maxlength="120"
            autocomplete="off"
            :aria-invalid="errors.fullName ? 'true' : 'false'"
            aria-describedby="ae-eu-fullname-error"
          >
          <p
            v-if="errors.fullName"
            id="ae-eu-fullname-error"
            class="ae-side-panel-error"
          >
            {{ errors.fullName }}
          </p>
        </div>
        <div class="ae-side-panel-field">
          <label for="ae-eu-username">{{ usernameLabel$() }}</label>
          <input
            id="ae-eu-username"
            v-model.trim="form.username"
            type="text"
            maxlength="30"
            autocomplete="off"
            autocapitalize="none"
            spellcheck="false"
            :aria-invalid="errors.username ? 'true' : 'false'"
            aria-describedby="ae-eu-username-error"
            @blur="onUsernameBlur"
          >
          <p
            v-if="errors.username"
            id="ae-eu-username-error"
            class="ae-side-panel-error"
          >
            {{ errors.username }}
          </p>
          <p
            v-else-if="usernameChanged && usernameStatus === 'available'"
            id="ae-eu-username-error"
            class="ae-side-panel-ok"
          >
            {{ usernameAvailable$() }}
          </p>
        </div>
      </div>

      <div class="ae-side-panel-field">
        <label for="ae-eu-kind">{{ userTypeLabel$() }}</label>
        <span class="ae-side-panel-affix">
          <select
            id="ae-eu-kind"
            v-model="form.kind"
            :disabled="isSelf || user.is_superuser"
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
        <p
          v-if="isSelf || user.is_superuser"
          class="ae-side-panel-hint"
        >
          {{ roleLockedHint$() }}
        </p>
      </div>

      <h3 class="ae-side-panel-section">
        {{ resetPasswordSection$() }}
      </h3>
      <p class="ae-side-panel-hint">
        {{ resetPasswordHint$() }}
      </p>
      <div class="ae-side-panel-row">
        <div class="ae-side-panel-field">
          <label for="ae-eu-password">{{ passwordLabel$() }}</label>
          <input
            id="ae-eu-password"
            v-model="form.password"
            type="password"
            autocomplete="new-password"
            :placeholder="newPasswordPlaceholder$()"
          >
        </div>
        <div class="ae-side-panel-field">
          <label for="ae-eu-confirm">{{ confirmPasswordLabel$() }}</label>
          <input
            id="ae-eu-confirm"
            v-model="form.confirm"
            type="password"
            autocomplete="new-password"
            :aria-invalid="errors.confirm ? 'true' : 'false'"
            aria-describedby="ae-eu-confirm-error"
          >
          <p
            v-if="errors.confirm"
            id="ae-eu-confirm-error"
            class="ae-side-panel-error"
          >
            {{ errors.confirm }}
          </p>
        </div>
      </div>

      <div
        v-if="!isSelf && !user.is_superuser"
        class="ae-edit-user-danger"
      >
        <div>
          <h3>{{ deleteAccountTitle$() }}</h3>
          <p>{{ deleteAccountHint$() }}</p>
        </div>
        <button
          type="button"
          class="ae-edit-user-delete"
          @click="confirmingDelete = true"
        >
          <AeIcon
            name="trash"
            :size="18"
          />
          <span>{{ deleteAccountAction$() }}</span>
        </button>
      </div>

      <button
        type="submit"
        hidden
        tabindex="-1"
        aria-hidden="true"
      ></button>
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

    <KModal
      v-if="confirmingDelete"
      :title="deleteAccountTitle$()"
      :submitText="deleteAction$()"
      :cancelText="cancelAction$()"
      :submitDisabled="saving"
      @submit="remove"
      @cancel="confirmingDelete = false"
    >
      <p>{{ deleteAccountConfirm$({ name: user.full_name || user.username }) }}</p>
    </KModal>
  </AeSidePanel>

</template>


<script>

  import { computed, reactive, ref, watch } from 'vue';
  import { ERROR_CONSTANTS, UserKinds } from 'kolibri/constants';
  import { coreStrings } from 'kolibri/uiText/commonCoreStrings';
  import CatchErrors from 'kolibri/utils/CatchErrors';
  import { validateUsername } from 'kolibri/utils/validators';
  import useSnackbar from 'kolibri/composables/useSnackbar';
  import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
  import RoleResource from 'kolibri-common/apiResources/RoleResource';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';
  import { useUsernameCheck } from '../../composables/useUsernameCheck';
  import AeIcon from '../AeIcon';
  import AeSidePanel from '../AeSidePanel';

  // Facility roles an admin can give here, the strongest last.
  const FACILITY_KINDS = [UserKinds.COACH, UserKinds.ADMIN];

  /** Admins change an account: name, username, role, password, or delete it. */
  export default {
    name: 'AeUserEditPanel',
    components: { AeIcon, AeSidePanel },
    setup(props, { emit }) {
      const {
        editAccount$,
        editAccountSubtitle$,
        accountInfoSection$,
        fullNameLabel$,
        usernameLabel$,
        usernameAvailable$,
        userTypeLabel$,
        roleLockedHint$,
        resetPasswordSection$,
        resetPasswordHint$,
        passwordLabel$,
        newPasswordPlaceholder$,
        confirmPasswordLabel$,
        deleteAccountTitle$,
        deleteAccountHint$,
        deleteAccountAction$,
        deleteAccountConfirm$,
        deleteAction$,
        saveChangesAction$,
        spaceLearner$,
        spaceCoach$,
        spaceAdmin$,
        fieldRequired$,
        usernameInvalid$,
        usernameTaken$,
        usernameTakenAlert$,
        passwordMismatch$,
        formHasErrors$,
        accountSaved$,
        accountDeleted$,
        saveError$,
      } = portalStrings;
      const { cancelAction$ } = coreStrings;
      const { createSnackbar } = useSnackbar();
      const { currentUserId, userFacilityId } = useAePermissions();
      const { usernameStatus, checkUsernameAvailable, resetUsernameStatus } = useUsernameCheck();

      const form = reactive({ fullName: '', username: '', kind: '', password: '', confirm: '' });
      const errors = reactive({ fullName: '', username: '', confirm: '' });
      const panelAlert = ref(null);
      const saving = ref(false);
      const confirmingDelete = ref(false);
      const formElement = ref(null);

      const kindOptions = [
        { value: UserKinds.LEARNER, label: spaceLearner$() },
        { value: UserKinds.COACH, label: spaceCoach$() },
        { value: UserKinds.ADMIN, label: spaceAdmin$() },
      ];

      const facilityRoles = computed(() =>
        props.user
          ? (props.user.roles || []).filter(
            role => role.collection === userFacilityId.value && FACILITY_KINDS.includes(role.kind),
          )
          : [],
      );

      function currentKind() {
        const kinds = facilityRoles.value.map(role => role.kind);
        if (kinds.includes(UserKinds.ADMIN)) {
          return UserKinds.ADMIN;
        }
        return kinds.includes(UserKinds.COACH) ? UserKinds.COACH : UserKinds.LEARNER;
      }

      const isSelf = computed(() => Boolean(props.user) && props.user.id === currentUserId.value);
      const usernameChanged = computed(
        () =>
          Boolean(props.user) &&
          form.username.toLowerCase() !== String(props.user.username).toLowerCase(),
      );

      watch(
        () => props.user,
        user => {
          if (!user) {
            return;
          }
          Object.assign(form, {
            fullName: user.full_name || '',
            username: user.username,
            kind: currentKind(),
            password: '',
            confirm: '',
          });
          Object.keys(errors).forEach(key => {
            errors[key] = '';
          });
          panelAlert.value = null;
          confirmingDelete.value = false;
          resetUsernameStatus();
        },
      );

      watch(
        () => form.username,
        () => {
          resetUsernameStatus();
          if (errors.username === usernameTaken$()) {
            errors.username = '';
          }
        },
      );

      function focus(id) {
        const field = formElement.value && formElement.value.querySelector(`#ae-eu-${id}`);
        if (field) {
          field.focus();
        }
      }

      async function onUsernameBlur() {
        if (!usernameChanged.value || !validateUsername(form.username)) {
          return;
        }
        const status = await checkUsernameAvailable(form.username);
        if (status === 'taken') {
          errors.username = usernameTaken$();
        } else if (errors.username === usernameTaken$()) {
          errors.username = '';
        }
      }

      function validate() {
        errors.fullName = form.fullName.trim() ? '' : fieldRequired$();
        if (!form.username) {
          errors.username = fieldRequired$();
        } else if (!validateUsername(form.username)) {
          errors.username = usernameInvalid$();
        } else if (errors.username !== usernameTaken$()) {
          errors.username = '';
        }
        if (form.password || form.confirm) {
          errors.confirm = form.confirm === form.password ? '' : passwordMismatch$();
        } else {
          errors.confirm = '';
        }
        const invalid = ['fullName', 'username', 'confirm'].find(key => errors[key]);
        if (invalid) {
          panelAlert.value = { kind: 'error', text: formHasErrors$() };
          focus({ fullName: 'fullname', username: 'username', confirm: 'confirm' }[invalid]);
          return false;
        }
        return true;
      }

      // One facility role at most: remove the others, then add the chosen one.
      async function saveRole() {
        const wanted = form.kind;
        const toRemove = facilityRoles.value.filter(role => role.kind !== wanted);
        const hasWanted = facilityRoles.value.some(role => role.kind === wanted);
        await Promise.all(toRemove.map(role => RoleResource.deleteModel({ id: role.id })));
        if (wanted !== UserKinds.LEARNER && !hasWanted) {
          await RoleResource.saveModel({
            data: { user: props.user.id, collection: userFacilityId.value, kind: wanted },
          });
        }
      }

      async function save() {
        panelAlert.value = null;
        if (!validate()) {
          return;
        }
        saving.value = true;
        const data = { full_name: form.fullName.trim(), username: form.username };
        if (form.password) {
          data.password = form.password;
        }
        try {
          await FacilityUserResource.saveModel({ id: props.user.id, data, exists: true });
        } catch (error) {
          saving.value = false;
          if (CatchErrors(error, [ERROR_CONSTANTS.USERNAME_ALREADY_EXISTS])) {
            errors.username = usernameTaken$();
            panelAlert.value = {
              kind: 'error',
              text: usernameTakenAlert$({ username: form.username }),
            };
            focus('username');
          } else {
            panelAlert.value = { kind: 'error', text: saveError$() };
          }
          return;
        }
        try {
          if (!isSelf.value && !props.user.is_superuser && form.kind !== currentKind()) {
            await saveRole();
          }
        } catch (error) {
          saving.value = false;
          panelAlert.value = { kind: 'error', text: saveError$() };
          emit('saved');
          return;
        }
        saving.value = false;
        createSnackbar(accountSaved$({ name: data.full_name }));
        emit('saved');
      }

      async function remove() {
        saving.value = true;
        const name = props.user.full_name || props.user.username;
        try {
          await FacilityUserResource.deleteModel({ id: props.user.id });
          confirmingDelete.value = false;
          createSnackbar(accountDeleted$({ name }));
          emit('saved');
        } catch (error) {
          confirmingDelete.value = false;
          panelAlert.value = { kind: 'error', text: saveError$() };
        } finally {
          saving.value = false;
        }
      }

      return {
        editAccount$,
        editAccountSubtitle$,
        accountInfoSection$,
        fullNameLabel$,
        usernameLabel$,
        usernameAvailable$,
        userTypeLabel$,
        roleLockedHint$,
        resetPasswordSection$,
        resetPasswordHint$,
        passwordLabel$,
        newPasswordPlaceholder$,
        confirmPasswordLabel$,
        deleteAccountTitle$,
        deleteAccountHint$,
        deleteAccountAction$,
        deleteAccountConfirm$,
        deleteAction$,
        saveChangesAction$,
        cancelAction$,
        form,
        errors,
        panelAlert,
        saving,
        confirmingDelete,
        formElement,
        kindOptions,
        isSelf,
        usernameChanged,
        usernameStatus,
        onUsernameBlur,
        save,
        remove,
      };
    },
    props: {
      /** The account to change (a FacilityUser with its roles), or null when closed. */
      user: {
        type: Object,
        default: null,
      },
    },
  };

</script>


<style lang="scss" scoped>

  @import '../../styles/components';

  .ae-edit-user-danger {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    margin-top: 18px;
    border: 1.5px solid var(--ae-danger-soft);
    border-radius: var(--ae-radius-md);

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 800;
      color: var(--ae-danger);
    }

    p {
      margin: 2px 0 0;
      font-size: 14px;
      color: var(--ae-text-muted);
    }
  }

  .ae-edit-user-delete {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    min-height: 40px;
    padding: 0 14px;
    font: inherit;
    font-weight: 700;
    color: var(--ae-danger);
    cursor: pointer;
    background: var(--ae-surface);
    border: 1.5px solid var(--ae-danger);
    border-radius: var(--ae-radius-sm);

    &:hover {
      background: var(--ae-danger-soft);
    }

    @include ae-focus-ring;
  }

</style>
