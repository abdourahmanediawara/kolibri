<template>

  <div
    class="ae-signin"
    :style="themeVars"
  >
    <header class="ae-signin-header">
      <div class="ae-signin-container ae-signin-header-inner">
        <div class="ae-signin-brand">
          <img
            class="ae-signin-brand-logo"
            :src="logoSrc"
            :alt="footerOrgName$()"
          >
          <span
            class="ae-signin-brand-divider"
            aria-hidden="true"
          ></span>
          <span class="ae-signin-brand-name">{{ platformName }}</span>
        </div>

        <div class="ae-signin-header-actions">
          <button
            type="button"
            class="ae-signin-header-btn"
            aria-haspopup="dialog"
            :aria-label="`${signInChangeLanguage$()} (${languageLabel})`"
            @click="showLanguageModal = true"
          >
            <AeIcon
              name="globe"
              :size="22"
            />
            <span class="ae-signin-header-btn-label">{{ languageLabel }}</span>
            <AeIcon
              name="chevronDown"
              class="ae-signin-header-chevron"
              :size="18"
            />
          </button>
          <span
            class="ae-signin-header-sep"
            aria-hidden="true"
          ></span>
          <button
            type="button"
            class="ae-signin-header-btn"
            aria-haspopup="dialog"
            @click="showHelpModal = true"
          >
            <AeIcon
              name="circleHelp"
              :size="22"
            />
            <span class="ae-signin-header-btn-label">{{ signInHelp$() }}</span>
          </button>
        </div>
      </div>
    </header>

    <main class="ae-signin-container ae-signin-main">
      <section
        class="ae-signin-hero"
        aria-labelledby="ae-signin-hero-title"
      >
        <p class="ae-signin-eyebrow">
          {{ signInEyebrow$() }}
        </p>
        <h1
          id="ae-signin-hero-title"
          class="ae-signin-title"
        >
          {{ signInHeroTitle$() }}
        </h1>
        <p class="ae-signin-lead">
          {{ signInHeroBody$() }}
        </p>
      </section>

      <div
        class="ae-signin-art"
        aria-hidden="true"
      >
        <img
          :src="illustrationSrc"
          alt=""
          width="936"
          height="542"
          decoding="async"
        >
      </div>

      <ul
        class="ae-signin-features"
        :aria-label="signInFeaturesLabel$()"
      >
        <li
          v-for="feature in features"
          :key="feature.icon"
          class="ae-signin-feature"
        >
          <span class="ae-signin-feature-icon">
            <AeIcon
              :name="feature.icon"
              :size="26"
            />
          </span>
          <span>{{ feature.label }}</span>
        </li>
      </ul>

      <section
        class="ae-signin-card"
        :class="{
          'ae-signin-card-password': step === 'password',
          'ae-signin-card-signup': step === 'signup',
        }"
        aria-labelledby="ae-signin-card-title"
      >
        <span
          class="ae-signin-card-badge"
          aria-hidden="true"
        >
          <AeIcon
            name="bookOpen"
            :size="42"
            :strokeWidth="1.75"
          />
        </span>
        <h2
          id="ae-signin-card-title"
          class="ae-signin-card-title"
        >
          {{ step === 'signup' ? signUpCardTitle$() : signInCardTitle$() }}
        </h2>
        <p class="ae-signin-card-subtitle">
          {{ step === 'signup' ? signUpCardSubtitle$() : signInCardSubtitle$() }}
        </p>

        <form
          class="ae-signin-form"
          novalidate
          @submit.prevent="submit"
        >
          <transition
            name="ae-signin-step"
            mode="out-in"
            @after-enter="focusCurrentStep"
          >
            <div
              v-if="step === 'username'"
              key="username"
            >
              <label
                for="ae-signin-username"
                class="ae-signin-label"
              >{{ usernameLabel$() }}</label>
              <div
                class="ae-signin-field"
                :class="{ 'ae-signin-field-invalid': usernameError }"
              >
                <AeIcon
                  name="user"
                  class="ae-signin-field-icon"
                  :size="22"
                />
                <input
                  id="ae-signin-username"
                  ref="usernameInput"
                  v-model.trim="username"
                  class="ae-signin-input"
                  type="text"
                  name="username"
                  autocomplete="username"
                  autocapitalize="none"
                  autocorrect="off"
                  spellcheck="false"
                  :placeholder="signInUsernamePlaceholder$()"
                  :aria-invalid="usernameError ? 'true' : 'false'"
                  :aria-describedby="usernameError ? 'ae-signin-username-error' : null"
                  @input="clearErrors"
                >
              </div>
              <p
                v-if="usernameError"
                id="ae-signin-username-error"
                class="ae-signin-field-error"
              >
                <AeIcon
                  name="circleAlert"
                  :size="16"
                />
                <span>{{ usernameError }}</span>
              </p>

              <button
                type="submit"
                class="ae-signin-btn ae-signin-btn-primary"
                :disabled="submitting"
                :aria-busy="submitting ? 'true' : 'false'"
              >
                <span>{{ signInContinue$() }}</span>
                <span
                  v-if="submitting"
                  class="ae-signin-spinner"
                  aria-hidden="true"
                ></span>
                <AeIcon
                  v-else
                  name="arrowRight"
                  class="ae-signin-btn-trailing"
                  :size="22"
                />
              </button>
              <button
                v-if="allowLearnerSignUp"
                type="button"
                class="ae-signin-btn ae-signin-btn-outline"
                @click="startSignUp"
              >
                {{ signInCreateAccount$() }}
              </button>
            </div>

            <div
              v-else-if="step === 'signup'"
              key="signup"
            >
              <div
                v-for="field in signUpFields"
                :key="field.id"
              >
                <label
                  :for="`ae-signup-${field.id}`"
                  class="ae-signin-label"
                >{{ field.label }}</label>
                <div
                  class="ae-signin-field"
                  :class="{ 'ae-signin-field-invalid': signUpErrors[field.id] }"
                >
                  <AeIcon
                    :name="field.icon"
                    class="ae-signin-field-icon"
                    :size="22"
                  />
                  <input
                    :id="`ae-signup-${field.id}`"
                    v-model="signUp[field.id]"
                    class="ae-signin-input"
                    :type="field.secret && !showPassword ? 'password' : 'text'"
                    :autocomplete="field.autocomplete"
                    autocapitalize="none"
                    spellcheck="false"
                    :placeholder="field.placeholder"
                    :aria-invalid="signUpErrors[field.id] ? 'true' : 'false'"
                    :aria-describedby="signUpErrors[field.id] ? `ae-signup-${field.id}-error` : null"
                    @input="signUpErrors[field.id] = ''"
                  >
                  <button
                    v-if="field.id === 'password'"
                    type="button"
                    class="ae-signin-field-action"
                    :aria-label="showPassword ? signInHidePassword$() : signInShowPassword$()"
                    :aria-pressed="showPassword ? 'true' : 'false'"
                    @click="showPassword = !showPassword"
                  >
                    <AeIcon
                      :name="showPassword ? 'eyeOff' : 'eye'"
                      :size="22"
                    />
                  </button>
                </div>
                <p
                  v-if="signUpErrors[field.id]"
                  :id="`ae-signup-${field.id}-error`"
                  class="ae-signin-field-error"
                >
                  <AeIcon
                    name="circleAlert"
                    :size="16"
                  />
                  <span>{{ signUpErrors[field.id] }}</span>
                </p>
              </div>

              <button
                type="submit"
                class="ae-signin-btn ae-signin-btn-primary"
                :disabled="submitting"
                :aria-busy="submitting ? 'true' : 'false'"
              >
                <span>{{ signUpSubmit$() }}</span>
                <span
                  v-if="submitting"
                  class="ae-signin-spinner"
                  aria-hidden="true"
                ></span>
                <AeIcon
                  v-else
                  name="arrowRight"
                  class="ae-signin-btn-trailing"
                  :size="22"
                />
              </button>
              <button
                type="button"
                class="ae-signin-btn ae-signin-btn-outline"
                @click="changeUser"
              >
                {{ signUpHaveAccount$() }}
              </button>
            </div>

            <div
              v-else
              key="password"
            >
              <div class="ae-signin-user">
                <span
                  class="ae-signin-user-avatar"
                  aria-hidden="true"
                >{{ usernameInitial }}</span>
                <span class="ae-signin-user-name">{{ username }}</span>
                <button
                  type="button"
                  class="ae-signin-link"
                  @click="changeUser"
                >
                  {{ signInChangeUser$() }}
                </button>
              </div>

              <label
                for="ae-signin-password"
                class="ae-signin-label"
              >{{ passwordLabel$() }}</label>
              <div
                class="ae-signin-field"
                :class="{ 'ae-signin-field-invalid': passwordError }"
              >
                <AeIcon
                  name="lock"
                  class="ae-signin-field-icon"
                  :size="22"
                />
                <input
                  id="ae-signin-password"
                  ref="passwordInput"
                  v-model="password"
                  class="ae-signin-input"
                  :type="showPassword ? 'text' : 'password'"
                  name="password"
                  autocomplete="current-password"
                  :placeholder="signInPasswordPlaceholder$()"
                  :aria-invalid="passwordError ? 'true' : 'false'"
                  :aria-describedby="passwordError ? 'ae-signin-password-error' : null"
                  @input="clearErrors"
                >
                <button
                  type="button"
                  class="ae-signin-field-action"
                  :aria-label="showPassword ? signInHidePassword$() : signInShowPassword$()"
                  :aria-pressed="showPassword ? 'true' : 'false'"
                  @click="showPassword = !showPassword"
                >
                  <AeIcon
                    :name="showPassword ? 'eyeOff' : 'eye'"
                    :size="22"
                  />
                </button>
              </div>
              <p
                v-if="passwordError"
                id="ae-signin-password-error"
                class="ae-signin-field-error"
              >
                <AeIcon
                  name="circleAlert"
                  :size="16"
                />
                <span>{{ passwordError }}</span>
              </p>

              <div class="ae-signin-forgot">
                <button
                  type="button"
                  class="ae-signin-link"
                  aria-controls="ae-signin-forgot-hint"
                  :aria-expanded="showForgotHint ? 'true' : 'false'"
                  @click="showForgotHint = !showForgotHint"
                >
                  {{ signInForgotPassword$() }}
                </button>
              </div>
              <p
                v-if="showForgotHint"
                id="ae-signin-forgot-hint"
                class="ae-signin-hint"
              >
                {{ signInForgotPasswordHint$() }}
              </p>

              <button
                type="submit"
                class="ae-signin-btn ae-signin-btn-primary"
                :disabled="submitting"
                :aria-busy="submitting ? 'true' : 'false'"
              >
                <span>{{ signInAction$() }}</span>
                <span
                  v-if="submitting"
                  class="ae-signin-spinner"
                  aria-hidden="true"
                ></span>
                <AeIcon
                  v-else
                  name="arrowRight"
                  class="ae-signin-btn-trailing"
                  :size="22"
                />
              </button>
            </div>
          </transition>

          <p
            v-if="formError"
            class="ae-signin-form-error"
            role="alert"
          >
            <AeIcon
              name="circleAlert"
              :size="18"
            />
            <span>{{ formError }}</span>
          </p>
        </form>

        <template v-if="step === 'username' && allowGuestAccess">
          <hr class="ae-signin-divider" >
          <a
            :href="guestUrl"
            class="ae-signin-guest"
          >
            <span>{{ signInExploreAsGuest$() }}</span>
            <AeIcon
              name="arrowRight"
              :size="20"
            />
          </a>
        </template>

        <p class="ae-signin-footnote">
          {{ signInCardFootnote$() }}
        </p>
      </section>
    </main>

    <footer class="ae-signin-footer">
      <div class="ae-signin-container ae-signin-footer-inner">
        <span class="ae-signin-footer-org">{{ footerOrgName$() }}</span>
        <button
          type="button"
          class="ae-signin-footer-link"
          aria-haspopup="dialog"
          @click="showPrivacyModal = true"
        >
          {{ usageAndPrivacyLabel$() }}
        </button>
        <span class="ae-signin-footer-credit">{{ footerPoweredBy$() }}</span>
      </div>
    </footer>

    <LanguageSwitcherModal
      v-if="showLanguageModal"
      @cancel="showLanguageModal = false"
    />
    <PrivacyInfoModal
      v-if="showPrivacyModal"
      @submit="showPrivacyModal = false"
      @cancel="showPrivacyModal = false"
    />
    <KModal
      v-if="showHelpModal"
      :title="signInHelpTitle$()"
      :submitText="closeAction$()"
      @submit="showHelpModal = false"
      @cancel="showHelpModal = false"
    >
      <p>{{ signInHelpUsername$() }}</p>
      <p>{{ signInForgotPasswordHint$() }}</p>
    </KModal>
  </div>

</template>


<script>

  import { computed, nextTick, onMounted, reactive, ref } from 'vue';
  import { useRouter } from 'vue-router/composables';
  import useUser from 'kolibri/composables/useUser';
  import useKResponsiveWindow from 'kolibri-design-system/lib/composables/useKResponsiveWindow';
  import LanguageSwitcherModal from 'kolibri/components/language-switcher/LanguageSwitcherModal';
  import PrivacyInfoModal from 'kolibri/components/PrivacyInfoModal';
  import { coreStrings } from 'kolibri/uiText/commonCoreStrings';
  import themeConfig from 'kolibri/styles/themeConfig';
  import { ERROR_CONSTANTS, LoginErrors } from 'kolibri/constants';
  import CatchErrors from 'kolibri/utils/CatchErrors';
  import { validateUsername } from 'kolibri/utils/validators';
  import { availableLanguages, currentLanguage } from 'kolibri/utils/i18n';
  import urls from 'kolibri/urls';
  import plugin_data from 'kolibri-plugin-data';
  import { portalStrings } from '../strings';
  import { useAePermissions } from '../composables/useAePermissions';
  import { SignUpResource } from '../apiResources';
  import AeIcon from './AeIcon';

  const UNEXPECTED_ERROR = 'UNEXPECTED_ERROR';

  export default {
    name: 'AeSignInPage',
    components: {
      AeIcon,
      LanguageSwitcherModal,
      PrivacyInfoModal,
    },
    setup() {
      const router = useRouter();
      const { windowIsSmall } = useKResponsiveWindow();
      const { login, isUserLoggedIn } = useUser();
      const { defaultLandingPath } = useAePermissions();
      const { usageAndPrivacyLabel$, closeAction$ } = coreStrings;
      const {
        signInEyebrow$,
        signInHeroTitle$,
        signInHeroBody$,
        signInFeaturesLabel$,
        signInFeatureCourses$,
        signInFeatureQuizzes$,
        signInFeatureProgress$,
        signInCardTitle$,
        signInCardSubtitle$,
        signInUsernamePlaceholder$,
        signInPasswordPlaceholder$,
        signInContinue$,
        signInCreateAccount$,
        signInExploreAsGuest$,
        signInCardFootnote$,
        signInChangeUser$,
        signInShowPassword$,
        signInHidePassword$,
        signInForgotPassword$,
        signInForgotPasswordHint$,
        signInUsernameRequired$,
        signInPasswordRequired$,
        signInUsernameNotFound$,
        signInPasswordIncorrect$,
        signInUnexpectedError$,
        signInHelp$,
        signInHelpTitle$,
        signInHelpUsername$,
        signInChangeLanguage$,
        footerOrgName$,
        footerPoweredBy$,
        usernameLabel$,
        passwordLabel$,
        signInAction$,
        signUpCardTitle$,
        signUpCardSubtitle$,
        signUpSubmit$,
        signUpHaveAccount$,
        signUpClosed$,
        fullNameLabel$,
        fullNamePlaceholder$,
        confirmPasswordLabel$,
        newPasswordPlaceholder$,
        fieldRequired$,
        usernameInvalid$,
        usernameTaken$,
        passwordMismatch$,
      } = portalStrings;

      // Learner sign-up, in the same card as signing in.
      const signUp = reactive({ fullName: '', username: '', password: '', confirm: '' });
      const signUpErrors = reactive({ fullName: '', username: '', password: '', confirm: '' });
      const signUpFields = [
        { id: 'fullName', label: fullNameLabel$(), icon: 'user', autocomplete: 'name', placeholder: fullNamePlaceholder$() },
        { id: 'username', label: usernameLabel$(), icon: 'user', autocomplete: 'username', placeholder: signInUsernamePlaceholder$() },
        { id: 'password', label: passwordLabel$(), icon: 'lock', autocomplete: 'new-password', placeholder: newPasswordPlaceholder$(), secret: true },
        { id: 'confirm', label: confirmPasswordLabel$(), icon: 'lock', autocomplete: 'new-password', placeholder: '', secret: true },
      ];

      const facilityId = plugin_data.defaultFacilityId || null;
      const allowGuestAccess = Boolean(plugin_data.allowGuestAccess);
      const allowLearnerSignUp = Boolean(plugin_data.allowLearnerSignUp);
      const authUrl = urls['kolibri:kolibri.plugins.user_auth:user_auth']();

      const step = ref('username');
      const username = ref('');
      const password = ref('');
      const showPassword = ref(false);
      const submitting = ref(false);
      const usernameError = ref('');
      const passwordError = ref('');
      const formError = ref('');
      const showForgotHint = ref(false);
      const showLanguageModal = ref(false);
      const showHelpModal = ref(false);
      const showPrivacyModal = ref(false);
      const usernameInput = ref(null);
      const passwordInput = ref(null);

      const features = [
        { icon: 'squarePlay', label: signInFeatureCourses$() },
        { icon: 'listChecks', label: signInFeatureQuizzes$() },
        { icon: 'chartColumns', label: signInFeatureProgress$() },
      ];

      const languageLabel = computed(() => {
        const info = availableLanguages[currentLanguage];
        return (info && info.lang_name) || currentLanguage;
      });

      const usernameInitial = computed(() => username.value.charAt(0).toUpperCase());

      function focusCurrentStep() {
        if (step.value === 'signup') {
          const first = document.getElementById('ae-signup-fullName');
          if (first) {
            first.focus();
          }
          return;
        }
        const input = step.value === 'username' ? usernameInput.value : passwordInput.value;
        if (input) {
          input.focus();
        }
      }

      function clearErrors() {
        usernameError.value = '';
        passwordError.value = '';
        formError.value = '';
      }

      function goToSetPassword() {
        const query = `username=${encodeURIComponent(username.value)}&facility=${facilityId}`;
        window.location.assign(`${authUrl}?ae_auth=1#/set-password?${query}`);
      }

      // Kolibri answers a password-less attempt with PASSWORD_MISSING when the
      // account needs one, which lets the username step validate on its own.
      async function attemptLogin() {
        const payload = { username: username.value, password: password.value };
        if (facilityId) {
          payload.facility = facilityId;
        }
        submitting.value = true;
        let error = UNEXPECTED_ERROR;
        try {
          // login() returns nothing when Kolibri handles the error globally.
          const result = await login(payload);
          if (result) {
            error = result.error;
          }
        } catch (e) {
          error = UNEXPECTED_ERROR;
        }
        if (!error) {
          // Signed in: Kolibri sends each role to its own AE space, keep the button busy.
          return null;
        }
        submitting.value = false;
        return error;
      }

      async function submitUsername() {
        if (!username.value) {
          usernameError.value = signInUsernameRequired$();
          focusCurrentStep();
          return;
        }
        password.value = '';
        const error = await attemptLogin();
        if (!error) {
          return;
        }
        if (error === LoginErrors.PASSWORD_MISSING || error === LoginErrors.INVALID_CREDENTIALS) {
          step.value = 'password';
        } else if (error === LoginErrors.USER_NOT_FOUND) {
          usernameError.value = signInUsernameNotFound$();
          focusCurrentStep();
        } else if (error === LoginErrors.PASSWORD_NOT_SPECIFIED) {
          goToSetPassword();
        } else {
          formError.value = signInUnexpectedError$();
        }
      }

      async function submitPassword() {
        if (!password.value) {
          passwordError.value = signInPasswordRequired$();
          focusCurrentStep();
          return;
        }
        const error = await attemptLogin();
        if (!error) {
          return;
        }
        if (error === LoginErrors.INVALID_CREDENTIALS) {
          password.value = '';
          passwordError.value = signInPasswordIncorrect$();
          focusCurrentStep();
        } else if (error === LoginErrors.USER_NOT_FOUND) {
          step.value = 'username';
          usernameError.value = signInUsernameNotFound$();
        } else if (error === LoginErrors.PASSWORD_NOT_SPECIFIED) {
          goToSetPassword();
        } else {
          formError.value = signInUnexpectedError$();
        }
      }

      function startSignUp() {
        clearErrors();
        Object.keys(signUpErrors).forEach(key => {
          signUpErrors[key] = '';
        });
        showPassword.value = false;
        step.value = 'signup';
      }

      function validateSignUp() {
        signUpErrors.fullName = signUp.fullName.trim() ? '' : fieldRequired$();
        if (!signUp.username.trim()) {
          signUpErrors.username = fieldRequired$();
        } else {
          signUpErrors.username = validateUsername(signUp.username.trim()) ? '' : usernameInvalid$();
        }
        signUpErrors.password = signUp.password ? '' : fieldRequired$();
        if (!signUp.confirm) {
          signUpErrors.confirm = fieldRequired$();
        } else {
          signUpErrors.confirm = signUp.confirm === signUp.password ? '' : passwordMismatch$();
        }
        const invalid = signUpFields.find(field => signUpErrors[field.id]);
        if (invalid) {
          document.getElementById(`ae-signup-${invalid.id}`).focus();
          return false;
        }
        return true;
      }

      async function submitSignUp() {
        if (!validateSignUp()) {
          return;
        }
        submitting.value = true;
        try {
          await SignUpResource.saveModel({
            data: {
              full_name: signUp.fullName.trim(),
              username: signUp.username.trim(),
              password: signUp.password,
              facility: facilityId,
            },
          });
        } catch (error) {
          submitting.value = false;
          const status = error && error.response && error.response.status;
          if (CatchErrors(error, [ERROR_CONSTANTS.USERNAME_ALREADY_EXISTS])) {
            signUpErrors.username = usernameTaken$();
            document.getElementById('ae-signup-username').focus();
          } else if (CatchErrors(error, [ERROR_CONSTANTS.INVALID_USERNAME])) {
            signUpErrors.username = usernameInvalid$();
            document.getElementById('ae-signup-username').focus();
          } else if (status === 403) {
            formError.value = signUpClosed$();
          } else {
            formError.value = signInUnexpectedError$();
          }
          return;
        }
        // Signed up and signed in: reloading sends the new learner to their space.
        window.location.reload();
      }

      function submit() {
        if (submitting.value) {
          return;
        }
        clearErrors();
        if (step.value === 'signup') {
          return submitSignUp();
        }
        return step.value === 'username' ? submitUsername() : submitPassword();
      }

      function changeUser() {
        clearErrors();
        password.value = '';
        showPassword.value = false;
        showForgotHint.value = false;
        step.value = 'username';
      }

      onMounted(() => {
        if (isUserLoggedIn.value) {
          router.replace(defaultLandingPath.value);
          return;
        }
        // Skip autofocus on phones so the keyboard does not hide the page.
        if (!windowIsSmall.value) {
          nextTick(focusCurrentStep);
        }
      });

      return {
        platformName: themeConfig.siteTitle,
        logoSrc: urls.static('action_education_portal/action-education-logo.png'),
        illustrationSrc: urls.static('action_education_portal/ae-signin-illustration.jpg'),
        guestUrl: urls['kolibri:core:guest'](),
        allowGuestAccess,
        allowLearnerSignUp,
        features,
        languageLabel,
        step,
        username,
        password,
        showPassword,
        submitting,
        usernameError,
        passwordError,
        formError,
        showForgotHint,
        showLanguageModal,
        showHelpModal,
        showPrivacyModal,
        usernameInput,
        passwordInput,
        usernameInitial,
        focusCurrentStep,
        clearErrors,
        submit,
        changeUser,
        startSignUp,
        signUp,
        signUpErrors,
        signUpFields,
        signUpCardTitle$,
        signUpCardSubtitle$,
        signUpSubmit$,
        signUpHaveAccount$,
        usageAndPrivacyLabel$,
        closeAction$,
        signInEyebrow$,
        signInHeroTitle$,
        signInHeroBody$,
        signInFeaturesLabel$,
        signInCardTitle$,
        signInCardSubtitle$,
        signInUsernamePlaceholder$,
        signInPasswordPlaceholder$,
        signInContinue$,
        signInCreateAccount$,
        signInExploreAsGuest$,
        signInCardFootnote$,
        signInChangeUser$,
        signInShowPassword$,
        signInHidePassword$,
        signInForgotPassword$,
        signInForgotPasswordHint$,
        signInHelp$,
        signInHelpTitle$,
        signInHelpUsername$,
        signInChangeLanguage$,
        footerOrgName$,
        footerPoweredBy$,
        usernameLabel$,
        passwordLabel$,
        signInAction$,
      };
    },
    computed: {
      // Brand colours come from the AE theme; the rest are fixed design tokens below.
      themeVars() {
        return {
          '--ae-orange': this.$themeBrand.primary.v_500,
          '--ae-orange-soft': this.$themeBrand.primary.v_100,
          '--ae-navy': this.$themeBrand.secondary.v_500,
        };
      },
    },
  };

</script>


<style lang="scss" scoped>

  @import '../styles/tokens';

  .ae-signin {
    @include ae-tokens;
    @include ae-font;

    display: flex;
    flex-direction: column;
    min-height: 100vh;
    font-size: 18px;
    line-height: 1.5;
    color: var(--ae-text);
    background: var(--ae-page);
    -webkit-font-smoothing: antialiased;
  }

  .ae-signin-container {
    width: 100%;
    max-width: 1600px;
    padding-inline: 80px;
    margin-inline: auto;
  }

  /* ---------- Header ---------- */

  .ae-signin-header {
    background: var(--ae-surface);
    box-shadow: 0 1px 0 var(--ae-line);
  }

  .ae-signin-header-inner {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    min-height: 88px;
  }

  .ae-signin-brand {
    display: flex;
    gap: 24px;
    align-items: center;
    min-width: 0;
  }

  // The shared logo PNG has a 3px grey band on top: crop it (275x94 visible).
  .ae-signin-brand-logo {
    display: block;
    width: 152px;
    height: 52px;
    object-fit: cover;
    object-position: bottom;
  }

  .ae-signin-brand-divider {
    width: 1px;
    height: 40px;
    background: var(--ae-line);
  }

  .ae-signin-brand-name {
    overflow: hidden;
    font-size: 24px;
    font-weight: 800;
    color: var(--ae-navy);
    text-overflow: ellipsis;
    letter-spacing: -0.01em;
    white-space: nowrap;
  }

  .ae-signin-header-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .ae-signin-header-sep {
    width: 1px;
    height: 32px;
    margin-inline: 8px;
    background: var(--ae-line);
  }

  .ae-signin-header-btn {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    min-height: 48px;
    padding: 0 12px;
    font: inherit;
    font-size: 17px;
    font-weight: 600;
    color: var(--ae-navy);
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: var(--ae-radius-sm);
    transition: background-color 150ms ease;

    &:hover {
      background: var(--ae-surface-muted);
    }
  }

  /* ---------- Main grid ---------- */

  .ae-signin-main {
    display: grid;
    flex: 1;
    grid-template-areas:
      'hero card'
      'art card'
      'features card';
    grid-template-rows: auto 1fr auto;
    grid-template-columns: minmax(0, 1fr) 560px;
    column-gap: 72px;
    padding-block: 48px 40px;
  }

  .ae-signin-hero {
    grid-area: hero;
  }

  .ae-signin-eyebrow {
    margin: 0 0 16px;
    font-size: 15px;
    font-weight: 800;
    color: var(--ae-orange-ink);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .ae-signin-title {
    max-width: 12.5em;
    margin: 0;
    font-size: 68px;
    font-weight: 800;
    line-height: 1.04;
    color: var(--ae-navy);
    letter-spacing: -0.035em;
  }

  .ae-signin-lead {
    max-width: 28em;
    margin: 20px 0 0;
    font-size: 22px;
    font-weight: 500;
    line-height: 1.45;
    color: var(--ae-text-muted);
  }

  .ae-signin-art {
    grid-area: art;
    align-self: end;
    max-width: 880px;
    margin-top: 8px;
    animation-delay: 120ms;

    img {
      display: block;
      width: 100%;
      height: auto;
      // Melt the illustration edges into the page background.
      mask-image:
        linear-gradient(to right, transparent, #000000 5%, #000000 95%, transparent),
        linear-gradient(to bottom, transparent, #000000 12%, #000000 94%, transparent);
      mask-composite: intersect;
    }
  }

  .ae-signin-features {
    display: grid;
    grid-area: features;
    // Columns follow their content; labels wrap only when space runs out.
    grid-template-columns: repeat(3, auto);
    justify-content: start;
    padding: 0;
    margin: 16px 0 0;
    list-style: none;
    animation-delay: 180ms;
  }

  .ae-signin-feature {
    display: flex;
    gap: 12px;
    align-items: center;
    padding-inline: 0 24px;
    font-size: 18px;
    font-weight: 700;
    line-height: 1.3;
    color: var(--ae-navy);

    &:last-child {
      padding-inline-end: 0;
    }

    & + & {
      padding-inline-start: 24px;
      border-inline-start: 1px solid var(--ae-line);
    }
  }

  .ae-signin-feature-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    color: var(--ae-orange);
    background: var(--ae-orange-soft);
    border-radius: 50%;
  }

  /* ---------- Sign-in card ---------- */

  .ae-signin-card {
    grid-area: card;
    align-self: center;
    width: 100%;
    padding: 48px 44px 36px;
    text-align: center;
    background: var(--ae-surface);
    border: 1px solid var(--ae-line);
    border-radius: var(--ae-radius-xl);
    box-shadow: var(--ae-shadow-raised);
    animation-delay: 60ms;
  }

  .ae-signin-card-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 96px;
    height: 96px;
    margin: 0 auto 24px;
    color: var(--ae-orange);
    background: var(--ae-orange-soft);
    border-radius: 50%;
  }

  .ae-signin-card-title {
    margin: 0;
    font-size: 34px;
    font-weight: 800;
    line-height: 1.15;
    color: var(--ae-navy);
    letter-spacing: -0.02em;
  }

  .ae-signin-card-subtitle {
    max-width: 22em;
    margin: 12px auto 32px;
    font-size: 19px;
    font-weight: 500;
    line-height: 1.45;
    color: var(--ae-text-muted);
  }

  .ae-signin-form {
    text-align: start;
  }

  .ae-signin-label {
    display: block;
    margin-bottom: 10px;
    font-size: 18px;
    font-weight: 700;
    color: var(--ae-navy);
  }

  .ae-signin-field {
    display: flex;
    gap: 12px;
    align-items: center;
    height: 60px;
    padding-inline: 18px 8px;
    background: var(--ae-surface);
    border: 1.5px solid var(--ae-field-line);
    border-radius: var(--ae-radius-md);
    transition:
      border-color 150ms ease,
      box-shadow 150ms ease;

    &:focus-within {
      border-color: var(--ae-orange);
      box-shadow: 0 0 0 4px rgba(241, 90, 36, 0.16);
    }
  }

  .ae-signin-field-invalid,
  .ae-signin-field-invalid:focus-within {
    border-color: var(--ae-danger);
    box-shadow: 0 0 0 4px rgba(179, 38, 30, 0.12);
  }

  .ae-signin-field-icon {
    flex-shrink: 0;
    color: var(--ae-text-subtle);
  }

  .ae-signin-field:focus-within .ae-signin-field-icon {
    color: var(--ae-navy);
  }

  .ae-signin-input {
    flex: 1;
    min-width: 0;
    height: 100%;
    padding: 0;
    font: inherit;
    font-size: 18px;
    font-weight: 500;
    color: var(--ae-text);
    background: transparent;
    border: 0;
    outline: none;

    &::placeholder {
      font-weight: 400;
      color: var(--ae-placeholder);
      opacity: 1;
    }
  }

  .ae-signin-field-action {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    color: var(--ae-text-subtle);
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: var(--ae-radius-sm);

    &:hover {
      color: var(--ae-navy);
      background: var(--ae-surface-muted);
    }
  }

  .ae-signin-field-error {
    display: flex;
    gap: 6px;
    align-items: flex-start;
    margin: 8px 0 0;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.4;
    color: var(--ae-danger);

    svg {
      flex-shrink: 0;
      margin-top: 2px;
    }
  }

  .ae-signin-btn {
    position: relative;
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 60px;
    padding: 0 56px;
    font: inherit;
    // 19px bold counts as large text: brand orange keeps AA contrast (3.4:1).
    font-size: 19px;
    font-weight: 800;
    text-decoration: none;
    cursor: pointer;
    border-radius: var(--ae-radius-md);
    transition:
      background-color 150ms ease,
      transform 150ms ease,
      box-shadow 150ms ease;

    &:active:not(:disabled) {
      transform: scale(0.98);
    }

    &:disabled {
      cursor: progress;
      opacity: 0.6;
    }
  }

  .ae-signin-btn-primary {
    margin-top: 24px;
    color: #ffffff;
    background: var(--ae-orange);
    border: 0;
    box-shadow: 0 8px 20px -10px rgba(241, 90, 36, 0.7);

    &:hover:not(:disabled) {
      background: var(--ae-orange-hover);
    }
  }

  .ae-signin-btn-outline {
    margin-top: 16px;
    color: var(--ae-orange);
    background: var(--ae-surface);
    border: 2px solid var(--ae-orange);

    &:hover {
      background: var(--ae-orange-soft);
    }
  }

  .ae-signin-btn-trailing,
  .ae-signin-spinner {
    position: absolute;
    inset-inline-end: 22px;
  }

  .ae-signin-spinner {
    width: 20px;
    height: 20px;
    border: 2.5px solid rgba(255, 255, 255, 0.45);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: ae-signin-spin 0.8s linear infinite;
  }

  .ae-signin-user {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 10px 12px 10px 10px;
    margin-bottom: 24px;
    background: var(--ae-surface-muted);
    border-radius: var(--ae-radius-md);
  }

  .ae-signin-user-avatar {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    font-weight: 800;
    color: #ffffff;
    background: var(--ae-navy);
    border-radius: 50%;
  }

  .ae-signin-user-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    font-weight: 700;
    color: var(--ae-navy);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ae-signin-link {
    padding: 4px;
    font: inherit;
    font-size: 16px;
    font-weight: 700;
    color: var(--ae-orange-ink);
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 6px;
  }

  .ae-signin-forgot {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }

  .ae-signin-hint {
    padding: 10px 12px;
    margin: 8px 0 0;
    font-size: 15px;
    line-height: 1.45;
    color: var(--ae-text-muted);
    background: var(--ae-surface-muted);
    border-radius: var(--ae-radius-sm);
  }

  .ae-signin-form-error {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    padding: 12px 14px;
    margin: 16px 0 0;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.4;
    color: var(--ae-danger);
    background: var(--ae-danger-soft);
    border-radius: var(--ae-radius-md);

    svg {
      flex-shrink: 0;
      margin-top: 1px;
    }
  }

  .ae-signin-divider {
    height: 1px;
    margin: 32px 0 24px;
    background: var(--ae-line);
    border: 0;
  }

  // Sign-up has four fields: the card drops its badge and footnote to stay in view.
  .ae-signin-card-signup {
    .ae-signin-card-badge,
    .ae-signin-footnote {
      display: none;
    }

    .ae-signin-label {
      margin-top: 6px;
    }
  }

  .ae-signin-guest {
    display: inline-flex;
    gap: 10px;
    align-items: center;
    padding: 6px 8px;
    font-size: 19px;
    font-weight: 700;
    color: var(--ae-navy);
    text-decoration: underline;
    text-decoration-thickness: 1.5px;
    text-underline-offset: 5px;
    border-radius: var(--ae-radius-sm);

    svg {
      transition: transform 150ms ease;
    }

    &:hover svg {
      transform: translateX(3px);
    }
  }

  .ae-signin-footnote {
    margin: 24px 0 0;
    font-size: 16px;
    color: var(--ae-text-subtle);
  }

  /* ---------- Footer ---------- */

  .ae-signin-footer {
    border-top: 1px solid var(--ae-line);
  }

  .ae-signin-footer-inner {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 8px 24px;
    align-items: center;
    min-height: 64px;
    padding-block: 12px;
    font-size: 16px;
  }

  .ae-signin-footer-org {
    font-weight: 600;
    color: var(--ae-navy);
  }

  .ae-signin-footer-link {
    padding: 4px;
    font: inherit;
    color: var(--ae-orange-ink);
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 6px;
  }

  .ae-signin-footer-credit {
    color: var(--ae-text-subtle);
    text-align: end;
  }

  /* ---------- Focus, motion ---------- */

  .ae-signin-header-btn,
  .ae-signin-btn,
  .ae-signin-field-action,
  .ae-signin-link,
  .ae-signin-guest,
  .ae-signin-footer-link {
    &:focus-visible {
      outline: none;
      box-shadow: var(--ae-focus-ring);
    }
  }

  .ae-signin-hero,
  .ae-signin-art,
  .ae-signin-features,
  .ae-signin-card {
    animation: ae-signin-fade-in 0.35s ease-out both;
  }

  .ae-signin-step-enter-active,
  .ae-signin-step-leave-active {
    transition:
      opacity 150ms ease,
      transform 150ms ease;
  }

  .ae-signin-step-enter,
  .ae-signin-step-leave-to {
    opacity: 0;
    transform: translateY(6px);
  }

  @keyframes ae-signin-fade-in {
    from {
      opacity: 0;
      transform: translateY(6px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes ae-signin-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ae-signin-hero,
    .ae-signin-art,
    .ae-signin-features,
    .ae-signin-card,
    .ae-signin-spinner {
      animation: none;
    }

    .ae-signin-step-enter-active,
    .ae-signin-step-leave-active,
    .ae-signin-btn,
    .ae-signin-field,
    .ae-signin-guest svg {
      transition: none;
    }
  }

  /* ---------- Responsive ---------- */

  @media (max-width: 1535px) {
    .ae-signin-container {
      padding-inline: 64px;
    }

    .ae-signin-main {
      grid-template-columns: minmax(0, 1fr) 500px;
      column-gap: 64px;
    }

    .ae-signin-card {
      padding: 40px 36px 32px;
    }

    .ae-signin-card-title {
      font-size: 30px;
    }
  }

  // The headline shrinks with its column so it stays on two lines.
  @media (max-width: 1441px) {
    .ae-signin-title {
      font-size: calc(9.26vw - 65.5px);
    }
  }

  @media (max-width: 1199px) {
    .ae-signin-container {
      padding-inline: 40px;
    }

    .ae-signin-main {
      grid-template-columns: minmax(0, 1fr) 440px;
      column-gap: 48px;
    }

    .ae-signin-title {
      font-size: calc(9.26vw - 54px);
    }

    .ae-signin-card {
      padding: 32px 32px 28px;
    }

    .ae-signin-card-title {
      font-size: 26px;
    }
  }

  // Portrait tablets: one column, the form comes right after the headline.
  @media (max-width: 899px) {
    .ae-signin-container {
      padding-inline: 32px;
    }

    .ae-signin-title {
      font-size: 48px;
    }

    .ae-signin-main {
      grid-template-areas:
        'hero'
        'card'
        'art'
        'features';
      grid-template-rows: none;
      grid-template-columns: minmax(0, 1fr);
      row-gap: 32px;
      max-width: 720px;
    }

    .ae-signin-card {
      align-self: auto;
    }

    .ae-signin-art {
      margin-top: 0;
    }

    .ae-signin-features {
      margin-top: 0;
    }
  }

  // Computers and landscape tablets: the page fits the screen, no scroll.
  // The illustration takes whatever height is left.
  @media (min-width: 900px) and (min-height: 580px) {
    .ae-signin {
      height: 100vh;
    }

    .ae-signin-main {
      flex: 1 1 0;
      grid-template-rows: auto minmax(0, 1fr) auto;
      min-height: 0;
    }

    .ae-signin-art {
      display: flex;
      align-items: flex-end;
      align-self: stretch;
      min-height: 0;

      img {
        width: auto;
        max-width: 100%;
        max-height: 100%;
      }
    }
  }

  // Shorter screens: tighten vertical rhythm step by step.
  @media (min-width: 900px) and (max-height: 959px) {
    .ae-signin-header-inner {
      min-height: 72px;
    }

    .ae-signin-brand-logo {
      width: 129px;
      height: 44px;
    }

    .ae-signin-main {
      padding-block: 28px 24px;
    }

    .ae-signin-eyebrow {
      margin-bottom: 12px;
    }

    .ae-signin-lead {
      margin-top: 14px;
      font-size: 20px;
    }

    .ae-signin-features {
      margin-top: 12px;
    }

    .ae-signin-feature {
      font-size: 17px;
    }

    .ae-signin-feature-icon {
      width: 48px;
      height: 48px;
    }

    .ae-signin-card {
      padding-block: 32px 24px;
    }

    .ae-signin-card-badge {
      width: 76px;
      height: 76px;
      margin-bottom: 16px;

      svg {
        width: 34px;
        height: 34px;
      }
    }

    .ae-signin-card-subtitle {
      margin: 8px auto 24px;
      font-size: 17px;
    }

    .ae-signin-label {
      margin-bottom: 8px;
      font-size: 17px;
    }

    .ae-signin-field,
    .ae-signin-btn {
      height: 56px;
    }

    .ae-signin-btn-primary {
      margin-top: 20px;
    }

    .ae-signin-btn-outline {
      margin-top: 12px;
    }

    .ae-signin-divider {
      margin: 22px 0 16px;
    }

    .ae-signin-footnote {
      margin-top: 14px;
      font-size: 15px;
    }

    .ae-signin-footer-inner {
      min-height: 56px;
      padding-block: 8px;
      font-size: 15px;
    }
  }

  @media (min-width: 900px) and (max-height: 799px) {
    .ae-signin-header-inner {
      min-height: 64px;
    }

    .ae-signin-brand-logo {
      width: 117px;
      height: 40px;
    }

    .ae-signin-main {
      padding-block: 20px 16px;
    }

    .ae-signin-eyebrow {
      margin-bottom: 8px;
      font-size: 14px;
    }

    .ae-signin-lead {
      margin-top: 10px;
      font-size: 18px;
    }

    .ae-signin-features {
      margin-top: 10px;
    }

    .ae-signin-feature {
      font-size: 16px;
    }

    .ae-signin-feature-icon {
      width: 44px;
      height: 44px;
    }

    .ae-signin-card {
      padding-block: 24px 20px;
    }

    .ae-signin-card-badge {
      width: 60px;
      height: 60px;
      margin-bottom: 12px;

      svg {
        width: 28px;
        height: 28px;
      }
    }

    .ae-signin-card-title {
      font-size: 26px;
    }

    .ae-signin-card-subtitle {
      margin: 6px auto 18px;
      font-size: 16px;
    }

    .ae-signin-label {
      margin-bottom: 6px;
      font-size: 16px;
    }

    .ae-signin-field,
    .ae-signin-btn {
      height: 50px;
    }

    .ae-signin-btn-primary {
      margin-top: 16px;
    }

    .ae-signin-btn-outline {
      margin-top: 10px;
    }

    .ae-signin-divider {
      margin: 16px 0 12px;
    }

    .ae-signin-guest {
      font-size: 17px;
    }

    .ae-signin-footnote {
      margin-top: 10px;
      font-size: 14px;
    }

    .ae-signin-footer-inner {
      min-height: 48px;
    }

    // The password step is taller: its badge goes first.
    .ae-signin-card-password .ae-signin-card-badge {
      display: none;
    }

    .ae-signin-user {
      margin-bottom: 16px;
    }
  }

  // Very short screens: drop the decorative badge and footnote.
  @media (min-width: 900px) and (max-height: 679px) {
    .ae-signin-header-inner {
      min-height: 56px;
    }

    .ae-signin-brand-logo {
      width: 105px;
      height: 36px;
    }

    .ae-signin-main {
      padding-block: 16px 12px;
    }

    .ae-signin-card {
      padding-block: 20px 16px;
    }

    .ae-signin-card-badge,
    .ae-signin-footnote {
      display: none;
    }

    .ae-signin-card-title {
      font-size: 24px;
    }

    .ae-signin-card-subtitle {
      margin: 4px auto 14px;
    }

    .ae-signin-field,
    .ae-signin-btn {
      height: 48px;
    }

    .ae-signin-btn-primary {
      margin-top: 14px;
    }

    .ae-signin-btn-outline {
      margin-top: 8px;
    }

    .ae-signin-divider {
      margin: 12px 0 8px;
    }

    .ae-signin-footer-inner {
      min-height: 44px;
      padding-block: 4px;
    }

    .ae-signin-card-password .ae-signin-card-subtitle {
      display: none;
    }

    .ae-signin-card-password .ae-signin-card-title {
      margin-bottom: 14px;
    }

    .ae-signin-user {
      padding-block: 6px;
      margin-bottom: 12px;
    }

    .ae-signin-user-avatar {
      width: 32px;
      height: 32px;
    }

    .ae-signin-forgot {
      margin-top: 4px;
    }
  }

  // Narrow hero column: icon above label so each label stays on one line.
  // Placed after the height steps so their feature sizes do not apply here.
  @media (min-width: 720px) and (max-width: 1199px) {
    .ae-signin-features {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .ae-signin-feature {
      flex-direction: column;
      gap: 8px;
      padding-inline: 8px;
      font-size: 15px;
      text-align: center;

      & + & {
        padding-inline-start: 8px;
      }
    }

    .ae-signin-feature-icon {
      width: 40px;
      height: 40px;
    }
  }

  // Phones.
  @media (max-width: 719px) {
    .ae-signin-container {
      padding-inline: 16px;
    }

    .ae-signin-title {
      font-size: 38px;
    }

    .ae-signin-lead {
      font-size: 18px;
    }

    .ae-signin-card-title {
      font-size: 26px;
    }

    // 16px keeps iOS from zooming into the field.
    .ae-signin-input {
      font-size: 16px;
    }

    .ae-signin-header-inner {
      min-height: 64px;
    }

    .ae-signin-brand {
      gap: 12px;
    }

    .ae-signin-brand-logo {
      width: 105px;
      height: 36px;
    }

    .ae-signin-brand-divider {
      height: 28px;
    }

    .ae-signin-brand-name {
      font-size: 18px;
    }

    .ae-signin-header-actions {
      gap: 0;
    }

    .ae-signin-header-sep {
      display: none;
    }

    .ae-signin-header-btn {
      padding: 0 8px;
      font-size: 16px;
    }

    .ae-signin-header-chevron {
      display: none;
    }

    // Icons only; the labels stay available to screen readers.
    .ae-signin-header-btn-label {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
    }

    .ae-signin-main {
      row-gap: 24px;
      padding-block: 24px 32px;
    }

    .ae-signin-card {
      padding: 28px 20px 24px;
      border-radius: var(--ae-radius-lg);
    }

    .ae-signin-card-badge {
      width: 72px;
      height: 72px;
      margin-bottom: 16px;
    }

    .ae-signin-card-subtitle {
      margin-bottom: 24px;
      font-size: 17px;
    }

    .ae-signin-features {
      grid-template-columns: minmax(0, 1fr);
      row-gap: 12px;
    }

    .ae-signin-feature {
      padding-inline: 0;
      font-size: 17px;

      & + & {
        padding-inline-start: 0;
        border-inline-start: 0;
      }
    }

    .ae-signin-feature-icon {
      width: 48px;
      height: 48px;
    }

    .ae-signin-footer-inner {
      grid-template-columns: 1fr;
      justify-items: center;
      text-align: center;
    }

    .ae-signin-footer-credit {
      text-align: center;
    }
  }

</style>
