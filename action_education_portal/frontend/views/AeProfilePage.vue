<template>

  <div class="ae-profile">
    <AePageHeader
      :title="myProfile$()"
      :subtitle="profileIntro$()"
    />

    <div class="ae-profile-grid">
      <!-- Identity -->
      <section
        class="ae-profile-card"
        aria-labelledby="ae-profile-info-title"
      >
        <div class="ae-profile-identity">
          <span
            class="ae-profile-avatar"
            aria-hidden="true"
          >{{ initials }}</span>
          <div class="ae-profile-identity-text">
            <h2
              id="ae-profile-info-title"
              class="ae-profile-name"
            >
              {{ full_name || username }}
            </h2>
            <p class="ae-profile-username">
              {{ username }}
            </p>
            <span class="ae-profile-role">{{ roleLabel }}</span>
          </div>
        </div>
        <dl class="ae-profile-facts">
          <div>
            <dt>{{ usernameLabel$() }}</dt>
            <dd>{{ username }}</dd>
          </div>
          <div v-if="facilityName">
            <dt>{{ profileFacilityLabel$() }}</dt>
            <dd>{{ facilityName }}</dd>
          </div>
        </dl>

        <form
          class="ae-profile-form"
          novalidate
          @submit.prevent="saveName"
        >
          <h3 class="ae-profile-form-title">
            {{ profileEditNameTitle$() }}
          </h3>
          <div class="ae-profile-field">
            <label for="ae-profile-name">{{ fullNameLabel$() }}</label>
            <input
              id="ae-profile-name"
              ref="nameField"
              v-model="name"
              type="text"
              maxlength="120"
              autocomplete="name"
              :aria-invalid="nameMessage && nameMessage.kind === 'error' ? 'true' : 'false'"
              aria-describedby="ae-profile-name-message"
            >
          </div>
          <p
            v-if="nameMessage"
            id="ae-profile-name-message"
            class="ae-profile-message"
            :class="`ae-profile-message-${nameMessage.kind}`"
            :role="nameMessage.kind === 'error' ? 'alert' : 'status'"
          >
            <AeIcon
              :name="nameMessage.kind === 'error' ? 'circleAlert' : 'circleCheck'"
              :size="20"
            />
            <span>{{ nameMessage.text }}</span>
          </p>
          <button
            type="submit"
            class="ae-profile-primary"
            :disabled="savingName"
          >
            {{ saveChangesAction$() }}
          </button>
        </form>
      </section>

      <!-- Password -->
      <section
        class="ae-profile-card"
        aria-labelledby="ae-profile-password-title"
      >
        <div class="ae-profile-card-head">
          <span
            class="ae-profile-card-icon"
            aria-hidden="true"
          >
            <AeIcon
              name="lock"
              :size="22"
            />
          </span>
          <div>
            <h2
              id="ae-profile-password-title"
              class="ae-profile-card-title"
            >
              {{ profilePasswordTitle$() }}
            </h2>
            <p class="ae-profile-card-text">
              {{ profilePasswordText$() }}
            </p>
          </div>
        </div>
        <form
          class="ae-profile-form"
          novalidate
          @submit.prevent="savePassword"
        >
          <div class="ae-profile-field">
            <label for="ae-profile-password">{{ passwordLabel$() }}</label>
            <span class="ae-profile-affix">
              <input
                id="ae-profile-password"
                ref="passwordField"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                :placeholder="newPasswordPlaceholder$()"
                :aria-invalid="passwordError ? 'true' : 'false'"
                aria-describedby="ae-profile-password-error"
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
              v-if="passwordError"
              id="ae-profile-password-error"
              class="ae-profile-field-error"
            >
              {{ passwordError }}
            </p>
          </div>
          <div class="ae-profile-field">
            <label for="ae-profile-confirm">{{ confirmPasswordLabel$() }}</label>
            <input
              id="ae-profile-confirm"
              ref="confirmField"
              v-model="confirm"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              :aria-invalid="confirmError ? 'true' : 'false'"
              aria-describedby="ae-profile-confirm-error"
            >
            <p
              v-if="confirmError"
              id="ae-profile-confirm-error"
              class="ae-profile-field-error"
            >
              {{ confirmError }}
            </p>
          </div>
          <p
            v-if="passwordMessage"
            class="ae-profile-message"
            :class="`ae-profile-message-${passwordMessage.kind}`"
            :role="passwordMessage.kind === 'error' ? 'alert' : 'status'"
          >
            <AeIcon
              :name="passwordMessage.kind === 'error' ? 'circleAlert' : 'circleCheck'"
              :size="20"
            />
            <span>{{ passwordMessage.text }}</span>
          </p>
          <button
            type="submit"
            class="ae-profile-primary"
            :disabled="savingPassword"
          >
            {{ profileChangePasswordAction$() }}
          </button>
        </form>
      </section>
    </div>
  </div>

</template>


<script>

  import { computed, onMounted, ref } from 'vue';
  import useUser from 'kolibri/composables/useUser';
  import FacilityResource from 'kolibri-common/apiResources/FacilityResource';
  import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
  import { portalStrings } from '../strings';
  import AeIcon from './AeIcon';
  import AePageHeader from './AePageHeader';

  const TEMPLATE_STRINGS = [
    'myProfile$',
    'profileIntro$',
    'usernameLabel$',
    'profileFacilityLabel$',
    'profileEditNameTitle$',
    'fullNameLabel$',
    'saveChangesAction$',
    'profilePasswordTitle$',
    'profilePasswordText$',
    'passwordLabel$',
    'newPasswordPlaceholder$',
    'signInShowPassword$',
    'signInHidePassword$',
    'confirmPasswordLabel$',
    'profileChangePasswordAction$',
  ];

  /**
   * "Mon profil" of every space: who I am, change my name and my password,
   * with a clear message after each save.
   */
  export default {
    name: 'AeProfilePage',
    components: { AeIcon, AePageHeader },
    setup() {
      const {
        fieldRequired$,
        passwordMismatch$,
        profileNameSaved$,
        profilePasswordSaved$,
        profileNotAllowed$,
        saveError$,
        spaceLearner$,
        spaceCoach$,
        spaceAdmin$,
      } = portalStrings;
      const templateStrings = Object.fromEntries(
        TEMPLATE_STRINGS.map(key => [key, portalStrings[key]]),
      );

      const {
        session,
        full_name,
        username,
        currentUserId,
        userFacilityId,
        isAdmin,
        isCoach,
        setSession,
      } = useUser();

      const name = ref(full_name.value || '');
      const nameMessage = ref(null);
      const savingName = ref(false);
      const nameField = ref(null);

      const password = ref('');
      const confirm = ref('');
      const showPassword = ref(false);
      const passwordError = ref('');
      const confirmError = ref('');
      const passwordMessage = ref(null);
      const savingPassword = ref(false);
      const passwordField = ref(null);
      const confirmField = ref(null);

      const facilityName = ref('');

      const initials = computed(() =>
        String(full_name.value || username.value || '?')
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map(part => part[0].toUpperCase())
          .join(''),
      );

      const roleLabel = computed(() => {
        if (isAdmin.value) {
          return spaceAdmin$();
        }
        return isCoach.value ? spaceCoach$() : spaceLearner$();
      });

      // 403: the facility does not let this account change it.
      function errorText(error) {
        const status = error && error.response && error.response.status;
        return status === 403 ? profileNotAllowed$() : saveError$();
      }

      async function saveName() {
        const value = name.value.trim();
        if (!value) {
          nameMessage.value = { kind: 'error', text: fieldRequired$() };
          nameField.value.focus();
          return;
        }
        savingName.value = true;
        nameMessage.value = null;
        try {
          await FacilityUserResource.saveModel({
            id: currentUserId.value,
            data: { full_name: value },
            exists: true,
          });
          setSession({ session: { ...session.value, full_name: value } });
          nameMessage.value = { kind: 'success', text: profileNameSaved$() };
        } catch (e) {
          nameMessage.value = { kind: 'error', text: errorText(e) };
        } finally {
          savingName.value = false;
        }
      }

      async function savePassword() {
        passwordMessage.value = null;
        passwordError.value = password.value ? '' : fieldRequired$();
        if (!confirm.value) {
          confirmError.value = fieldRequired$();
        } else {
          confirmError.value = confirm.value === password.value ? '' : passwordMismatch$();
        }
        if (passwordError.value || confirmError.value) {
          (passwordError.value ? passwordField : confirmField).value.focus();
          return;
        }
        savingPassword.value = true;
        try {
          await FacilityUserResource.saveModel({
            id: currentUserId.value,
            data: { password: password.value },
            exists: true,
          });
          password.value = '';
          confirm.value = '';
          passwordMessage.value = { kind: 'success', text: profilePasswordSaved$() };
        } catch (e) {
          passwordMessage.value = { kind: 'error', text: errorText(e) };
        } finally {
          savingPassword.value = false;
        }
      }

      onMounted(() => {
        FacilityResource.fetchModel({ id: userFacilityId.value })
          .then(facility => {
            facilityName.value = (facility && facility.name) || '';
          })
          .catch(() => {
            facilityName.value = '';
          });
      });

      return {
        ...templateStrings,
        full_name,
        username,
        initials,
        roleLabel,
        facilityName,
        name,
        nameMessage,
        savingName,
        nameField,
        password,
        confirm,
        showPassword,
        passwordError,
        confirmError,
        passwordMessage,
        savingPassword,
        passwordField,
        confirmField,
        saveName,
        savePassword,
      };
    },
  };

</script>


<style lang="scss" scoped>

  @import '../styles/components';

  .ae-profile {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .ae-profile-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
    align-items: start;
  }

  .ae-profile-card {
    @include ae-card;

    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .ae-profile-identity {
    display: flex;
    gap: 18px;
    align-items: center;
  }

  .ae-profile-avatar {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 76px;
    height: 76px;
    font-size: 28px;
    font-weight: 800;
    color: #ffffff;
    background: var(--ae-orange);
    border-radius: 50%;
  }

  .ae-profile-name {
    margin: 0;
    font-size: 24px;
    font-weight: 800;
    color: var(--ae-navy);
  }

  .ae-profile-username {
    margin: 2px 0 6px;
    color: var(--ae-text-muted);
  }

  .ae-profile-role {
    display: inline-block;
    padding: 3px 12px;
    font-size: 14px;
    font-weight: 700;
    color: var(--ae-orange-deep);
    background: var(--ae-orange-wash);
    border-radius: 999px;
  }

  .ae-profile-facts {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    padding: 12px 16px;
    margin: 0;
    background: var(--ae-surface-muted);
    border-radius: var(--ae-radius-md);

    dt {
      font-size: 13px;
      font-weight: 700;
      color: var(--ae-text-subtle);
    }

    dd {
      margin: 2px 0 0;
      font-weight: 600;
    }
  }

  .ae-profile-card-head {
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }

  .ae-profile-card-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;
    color: var(--ae-orange);
    background: var(--ae-orange-wash);
    border-radius: 50%;
  }

  .ae-profile-card-title {
    margin: 0;
    font-size: 20px;
    font-weight: 800;
    color: var(--ae-navy);
  }

  .ae-profile-card-text {
    margin: 4px 0 0;
    color: var(--ae-text-muted);
  }

  .ae-profile-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .ae-profile-form-title {
    margin: 0;
    font-size: 17px;
    font-weight: 800;
    color: var(--ae-navy);
  }

  .ae-profile-field {
    display: flex;
    flex-direction: column;
    gap: 6px;

    label {
      font-weight: 700;
      color: var(--ae-navy);
    }

    input {
      @include ae-field;
    }
  }

  .ae-profile-affix {
    position: relative;
    display: block;

    input {
      padding-inline-end: 52px;
    }

    button {
      position: absolute;
      top: 50%;
      inset-inline-end: 6px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      color: var(--ae-text-muted);
      cursor: pointer;
      background: transparent;
      border: 0;
      border-radius: var(--ae-radius-sm);
      transform: translateY(-50%);

      @include ae-focus-ring;
    }
  }

  .ae-profile-field-error {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--ae-danger);

    &::before {
      margin-inline-end: 6px;
      content: '✕';
    }
  }

  .ae-profile-message {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 10px 14px;
    margin: 0;
    font-weight: 700;
    border-radius: var(--ae-radius-md);
  }

  .ae-profile-message-error {
    color: var(--ae-danger);
    background: var(--ae-danger-soft);
    border: 1.5px solid var(--ae-danger);
  }

  .ae-profile-message-success {
    color: #1b6e3c;
    background: var(--ae-kpi-green);
    border: 1.5px solid #2e8b57;
  }

  .ae-profile-primary {
    @include ae-button-primary;

    align-self: flex-start;
    min-height: 46px;
    font-size: 17px;
  }

  @media (max-width: 1023px) {
    .ae-profile-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }

</style>
