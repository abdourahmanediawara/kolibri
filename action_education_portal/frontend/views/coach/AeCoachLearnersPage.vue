<template>

  <AeListPage
    :title="myLearners$()"
    :countLabel="classId ? learnersCount$({ count: rows.length }) : ''"
    :subtitle="coachLearnersIntro$()"
    :action="{ label: addLearnerTitle$(), onClick: openCreatePanel }"
    :bannerTitle="coachLearnersBannerTitle$()"
    :bannerSubtitle="coachLearnersBannerSubtitle$()"
    bannerIcon="people"
    :bannerArt="bannerArt"
    :loading="isLoadingLearners"
    :errorText="errorMessage"
    :items="rows"
    :searchFields="['fullName', 'username']"
    :searchLabel="learnersSearchLabel$()"
    :searchPlaceholder="usersSearchPlaceholder$()"
    :sortOptions="sortOptions"
    :emptyText="emptyText"
    :noMatchText="learnersNoMatch$()"
    :totalLabel="count => learnersCount$({ count })"
    @retry="refresh"
  >
    <template #filters>
      <label class="ae-list-filter">
        <span>{{ filterClassroomLabel$() }} :</span>
        <select
          v-model="classId"
          @change="onClassChange"
        >
          <option
            v-if="!classrooms.length"
            value=""
          >
            {{ selectClassOption$() }}
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
      </label>
    </template>

    <template #head>
      <th scope="col">
        {{ columnFullName$() }}
      </th>
      <th
        scope="col"
        class="ae-list-cell-secondary"
      >
        {{ usernameLabel$() }}
      </th>
      <th
        scope="col"
        class="ae-list-cell-shrink"
      >
        {{ columnActions$() }}
      </th>
    </template>
    <template #row="{ item }">
      <td class="ae-list-cell-grow">
        <span class="ae-list-cell-main">
          <AeAvatar
            :name="item.fullName"
            :toneKey="item.username"
          />
          <span class="ae-list-cell-name">{{ item.fullName }}</span>
        </span>
      </td>
      <td class="ae-list-cell-nowrap ae-list-cell-secondary">
        {{ item.username }}
      </td>
      <td class="ae-list-cell-shrink">
        <AeRowActions
          :primaryLabel="coachQuickResults$()"
          :primaryAriaLabel="viewResultsOf$({ name: item.fullName })"
          :primaryHref="item.resultsHref"
        />
      </td>
    </template>

    <template #extra>
      <AeSidePanel
        :open="createPanelOpen"
        :title="addLearnerTitle$()"
        :subtitle="addLearnerSubtitle$()"
        icon="userPlus"
        titleId="ae-add-learner-title"
        :alert="formError ? { kind: 'error', text: formError } : null"
        @close="closeCreatePanel"
      >
        <form
          ref="formElement"
          novalidate
          @submit.prevent="addLearner"
        >
          <div class="ae-side-panel-field">
            <label for="ae-al-class">{{ filterClassroomLabel$() }}</label>
            <span class="ae-side-panel-affix">
              <select
                id="ae-al-class"
                v-model="form.classId"
                :aria-invalid="errors.classId ? 'true' : 'false'"
                aria-describedby="ae-al-class-error"
              >
                <option value="">
                  {{ selectClassOption$() }}
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
            <p
              v-if="errors.classId"
              id="ae-al-class-error"
              class="ae-side-panel-error"
            >
              {{ errors.classId }}
            </p>
          </div>

          <div class="ae-side-panel-field">
            <label for="ae-al-fullname">{{ fullNameLabel$() }}</label>
            <input
              id="ae-al-fullname"
              v-model="form.fullName"
              type="text"
              maxlength="120"
              autocomplete="off"
              :placeholder="fullNamePlaceholder$()"
              :aria-invalid="errors.fullName ? 'true' : 'false'"
              aria-describedby="ae-al-fullname-error"
            >
            <p
              v-if="errors.fullName"
              id="ae-al-fullname-error"
              class="ae-side-panel-error"
            >
              {{ errors.fullName }}
            </p>
          </div>

          <div class="ae-side-panel-row">
            <div class="ae-side-panel-field">
              <label for="ae-al-username">{{ usernameLabel$() }}</label>
              <input
                id="ae-al-username"
                v-model.trim="form.username"
                type="text"
                maxlength="30"
                autocomplete="off"
                autocapitalize="none"
                spellcheck="false"
                :placeholder="usernamePlaceholder$()"
                :aria-invalid="errors.username ? 'true' : 'false'"
                aria-describedby="ae-al-username-error"
                @blur="onUsernameBlur"
              >
              <p
                v-if="errors.username"
                id="ae-al-username-error"
                class="ae-side-panel-error"
              >
                {{ errors.username }}
              </p>
              <p
                v-else-if="usernameStatus === 'available'"
                id="ae-al-username-error"
                class="ae-side-panel-ok"
              >
                {{ usernameAvailable$() }}
              </p>
              <p
                v-else-if="usernameStatus === 'checking'"
                id="ae-al-username-error"
                class="ae-side-panel-hint"
              >
                {{ usernameChecking$() }}
              </p>
            </div>
            <div class="ae-side-panel-field">
              <label for="ae-al-password">{{ passwordLabel$() }}</label>
              <span class="ae-side-panel-affix">
                <input
                  id="ae-al-password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  :placeholder="newPasswordPlaceholder$()"
                  :aria-invalid="errors.password ? 'true' : 'false'"
                  aria-describedby="ae-al-password-error"
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
                id="ae-al-password-error"
                class="ae-side-panel-error"
              >
                {{ errors.password }}
              </p>
            </div>
          </div>


          <!-- Lets Enter submit the form. -->
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
              @click="closeCreatePanel"
            >
              {{ cancelAction$() }}
            </button>
            <button
              type="button"
              class="ae-side-panel-btn-primary"
              :disabled="isSaving"
              @click="addLearner"
            >
              {{ addLearnerAction$() }}
            </button>
          </div>
        </template>
      </AeSidePanel>
    </template>
  </AeListPage>

</template>


<script>

  import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router/composables';
  import urls from 'kolibri/urls';
  import { currentLanguage } from 'kolibri/utils/i18n';
  import useSnackbar from 'kolibri/composables/useSnackbar';
  import { validateUsername } from 'kolibri/utils/validators';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';
  import { useClassroomApi } from '../../composables/useClassroomApi';
  import { useUsernameCheck } from '../../composables/useUsernameCheck';
  import { useAsyncPageLoad } from '../../composables/useAsyncPageLoad';
  import AeAvatar from '../AeAvatar';
  import AeIcon from '../AeIcon';
  import AeListPage from '../AeListPage';
  import AeRowActions from '../AeRowActions';
  import AeSidePanel from '../AeSidePanel';

  // [error key, input id suffix], in form order.
  const FIELD_IDS = [
    ['classId', 'class'],
    ['fullName', 'fullname'],
    ['username', 'username'],
    ['password', 'password'],
  ];

  export default {
    name: 'AeCoachLearnersPage',
    components: { AeAvatar, AeIcon, AeListPage, AeRowActions, AeSidePanel },
    setup() {
      const {
        myLearners$,
        learnersCount$,
        coachLearnersIntro$,
        coachLearnersBannerTitle$,
        coachLearnersBannerSubtitle$,
        learnersSearchLabel$,
        usersSearchPlaceholder$,
        learnersNoMatch$,
        classLearnersEmpty$,
        selectClassToSeeLearners$,
        coachClassesEmpty$,
        filterClassroomLabel$,
        selectClassOption$,
        columnFullName$,
        usernameLabel$,
        columnActions$,
        coachQuickResults$,
        viewResultsOf$,
        sortByName$,
        sortByUsername$,
        addLearnerTitle$,
        addLearnerSubtitle$,
        addLearnerAction$,
        fullNameLabel$,
        fullNamePlaceholder$,
        usernamePlaceholder$,
        passwordLabel$,
        newPasswordPlaceholder$,
        signInShowPassword$,
        signInHidePassword$,
        fieldRequired$,
        usernameTaken$,
        usernameInvalid$,
        usernameTakenAlert$,
        usernameAvailable$,
        usernameChecking$,
        formHasErrors$,
        learnerCreated$,
        cancelAction$,
        saveError$,
        loadError$,
        loadTimeout$,
      } = portalStrings;

      const route = useRoute();
      const router = useRouter();
      const { createSnackbar } = useSnackbar();
      const { userFacilityId } = useAePermissions();
      const api = useClassroomApi();
      const {
        isLoading: isLoadingLearners,
        loadError,
        runLoad,
      } = useAsyncPageLoad('isLoadingLearners');

      const classrooms = ref([]);
      const learners = ref([]);
      const classId = ref('');
      const createPanelOpen = ref(false);
      const isSaving = ref(false);
      const showPassword = ref(false);
      const formError = ref('');
      const { usernameStatus, checkUsernameAvailable, resetUsernameStatus } = useUsernameCheck();
      const formElement = ref(null);
      const form = reactive({ classId: '', fullName: '', username: '', password: '' });
      const errors = reactive({ classId: '', fullName: '', username: '', password: '' });

      const errorMessage = computed(() => {
        if (!loadError.value) {
          return '';
        }
        if (loadError.value.code === 'AE_REQUEST_TIMEOUT') {
          return loadTimeout$();
        }
        return loadError$();
      });

      const emptyText = computed(() => {
        if (!classrooms.value.length) {
          return coachClassesEmpty$();
        }
        return classId.value ? classLearnersEmpty$() : selectClassToSeeLearners$();
      });

      const rows = computed(() =>
        learners.value.map(user => ({
          id: user.id,
          fullName: user.full_name || user.username,
          username: user.username,
          resultsHref: router.resolve({ name: 'AeCoachResults', query: { learner: user.id } }).href,
        })),
      );

      const collator = new Intl.Collator(currentLanguage, { sensitivity: 'base' });
      const sortOptions = [
        {
          value: 'name',
          label: sortByName$(),
          compare: (a, b) => collator.compare(a.fullName, b.fullName),
        },
        {
          value: 'username',
          label: sortByUsername$(),
          compare: (a, b) => collator.compare(a.username, b.username),
        },
      ];

      async function refresh() {
        try {
          await runLoad(async () => {
            if (!classrooms.value.length) {
              const list = await api.fetchClassrooms(userFacilityId.value);
              classrooms.value = [...list].sort((a, b) => collator.compare(a.name, b.name));
            }
            if (!classId.value && classrooms.value.length) {
              classId.value = classrooms.value[0].id;
            }
            if (!classId.value) {
              learners.value = [];
              return;
            }
            const users = await api.fetchUsersInCollection(classId.value);
            learners.value = (users || []).filter(user => !api.isStaffUser(user));
          });
        } catch (e) {
          learners.value = [];
        }
      }

      function onClassChange() {
        router.replace({ query: { classId: classId.value } }).catch(() => {});
      }

      // The class also comes from links (e.g. "Voir les élèves" on a class).
      watch(
        () => route.query.classId,
        value => {
          if (value && value !== classId.value) {
            classId.value = String(value);
          }
          refresh();
        },
      );

      function resetForm() {
        Object.assign(form, {
          classId: classId.value,
          fullName: '',
          username: '',
          password: '',
        });
        Object.keys(errors).forEach(key => {
          errors[key] = '';
        });
        formError.value = '';
        showPassword.value = false;
      }

      function focusField(suffix) {
        nextTick(() => {
          const field = formElement.value && formElement.value.querySelector(`#ae-al-${suffix}`);
          if (field) {
            field.focus();
          }
        });
      }

      function openCreatePanel() {
        resetForm();
        resetUsernameStatus();
        createPanelOpen.value = true;
        focusField(form.classId ? 'fullname' : 'class');
      }

      function closeCreatePanel() {
        createPanelOpen.value = false;
      }

      function validate() {
        errors.classId = form.classId ? '' : fieldRequired$();
        errors.fullName = form.fullName.trim() ? '' : fieldRequired$();
        if (!form.username) {
          errors.username = fieldRequired$();
        } else {
          errors.username = validateUsername(form.username) ? '' : usernameInvalid$();
        }
        errors.password = form.password ? '' : fieldRequired$();
        const invalid = FIELD_IDS.find(([key]) => errors[key]);
        if (invalid) {
          formError.value = formHasErrors$();
          focusField(invalid[1]);
          return false;
        }
        return true;
      }

      // Checked as soon as the field is left, then again by the server on save.
      async function onUsernameBlur() {
        if (!form.username || !validateUsername(form.username)) {
          return;
        }
        const status = await checkUsernameAvailable(form.username);
        if (status === 'taken') {
          errors.username = usernameTaken$();
        } else if (errors.username === usernameTaken$()) {
          errors.username = '';
        }
      }

      watch(
        () => form.username,
        () => resetUsernameStatus(),
      );

      async function addLearner() {
        formError.value = '';
        if (!validate()) {
          return;
        }
        isSaving.value = true;
        const fullName = form.fullName.trim();
        try {
          await api.createLearner({
            username: form.username,
            fullName,
            password: form.password,
            classroomId: form.classId,
          });
        } catch (e) {
          const data = e && e.response && e.response.data;
          const code = Array.isArray(data) && data[0] && data[0].id;
          if (code === 'USERNAME_ALREADY_EXISTS') {
            errors.username = usernameTaken$();
            formError.value = usernameTakenAlert$({ username: form.username });
            focusField('username');
          } else if (code === 'INVALID_USERNAME') {
            errors.username = usernameInvalid$();
            formError.value = usernameInvalid$();
            focusField('username');
          } else {
            formError.value = saveError$();
          }
          return;
        } finally {
          isSaving.value = false;
        }
        closeCreatePanel();
        createSnackbar(learnerCreated$({ name: fullName }));
        // Show the class the learner joined.
        if (form.classId !== classId.value) {
          classId.value = form.classId;
          onClassChange();
        } else {
          await refresh();
        }
      }

      onMounted(() => {
        if (route.query.classId) {
          classId.value = String(route.query.classId);
        }
        refresh().then(() => {
          if (route.query.creer) {
            openCreatePanel();
            router.replace({ query: { classId: classId.value } }).catch(() => {});
          }
        });
      });

      return {
        myLearners$,
        learnersCount$,
        coachLearnersIntro$,
        coachLearnersBannerTitle$,
        coachLearnersBannerSubtitle$,
        learnersSearchLabel$,
        usersSearchPlaceholder$,
        learnersNoMatch$,
        filterClassroomLabel$,
        selectClassOption$,
        columnFullName$,
        usernameLabel$,
        columnActions$,
        coachQuickResults$,
        viewResultsOf$,
        addLearnerTitle$,
        addLearnerSubtitle$,
        addLearnerAction$,
        fullNameLabel$,
        fullNamePlaceholder$,
        usernamePlaceholder$,
        passwordLabel$,
        newPasswordPlaceholder$,
        signInShowPassword$,
        signInHidePassword$,
        cancelAction$,
        bannerArt: urls.static('action_education_portal/ae-users-banner.jpg'),
        isLoadingLearners,
        errorMessage,
        emptyText,
        classrooms,
        classId,
        rows,
        sortOptions,
        createPanelOpen,
        isSaving,
        showPassword,
        form,
        errors,
        formError,
        usernameStatus,
        onUsernameBlur,
        usernameAvailable$,
        usernameChecking$,
        formElement,
        onClassChange,
        openCreatePanel,
        closeCreatePanel,
        addLearner,
        refresh,
      };
    },
  };

</script>
