<template>

  <AeListPage
    :title="myClasses$()"
    :countLabel="classesCount$({ count: rows.length })"
    :subtitle="coachClassesIntro$()"
    :action="{ label: createClassTitle$(), onClick: openCreatePanel }"
    :bannerTitle="coachClassesBannerTitle$()"
    :bannerSubtitle="coachClassesBannerSubtitle$()"
    bannerIcon="classes"
    :bannerArt="bannerArt"
    :loading="isLoadingClasses"
    :errorText="errorMessage"
    :items="rows"
    :searchFields="['name', 'coachNames']"
    :searchLabel="classesSearchLabel$()"
    :searchPlaceholder="classesSearchPlaceholder$()"
    :sortOptions="sortOptions"
    :emptyText="coachClassesEmpty$()"
    :noMatchText="coachClassesNoMatch$()"
    :totalLabel="count => classesCount$({ count })"
    @retry="refresh"
  >
    <template #head>
      <th
        scope="col"
        class="ae-list-cell-grow"
      >
        {{ classNameLabel$() }}
      </th>
      <th scope="col">
        {{ columnLearners$() }}
      </th>
      <th
        scope="col"
        class="ae-list-cell-secondary"
      >
        {{ coachesTitle$() }}
      </th>
      <th
        scope="col"
        class="ae-list-cell-shrink"
      >
        {{ columnActions$() }}
      </th>
    </template>
    <template #row="{ item, openUp }">
      <td class="ae-list-cell-grow">
        <span class="ae-list-cell-main">
          <AeAvatar
            :name="item.name"
            :toneKey="item.id"
            icon="classes"
          />
          <span class="ae-list-cell-name">{{ item.name }}</span>
        </span>
      </td>
      <td class="ae-list-cell-nowrap">
        {{ learnersCount$({ count: item.learnerCount }) }}
      </td>
      <td class="ae-list-cell-secondary">
        {{ item.coachNames }}
      </td>
      <td class="ae-list-cell-shrink">
        <AeRowActions
          :primaryLabel="viewLearnersAction$()"
          :primaryAriaLabel="viewLearnersOf$({ name: item.name })"
          :primaryHref="item.learnersHref"
          :moreLabel="moreActionsFor$({ name: item.name })"
          :menuItems="[
            { label: addLearnerToClassOf$({ name: item.name }), href: item.addLearnerHref },
          ]"
          :openUp="openUp"
        />
      </td>
    </template>

    <template #extra>
      <AeSidePanel
        :open="createPanelOpen"
        :title="createClassTitle$()"
        :subtitle="createClassSubtitle$()"
        icon="users"
        titleId="ae-create-class-title"
        :alert="formError ? { kind: 'error', text: formError } : null"
        @close="closeCreatePanel"
      >
        <form
          novalidate
          @submit.prevent="createClass"
        >
          <div class="ae-side-panel-field">
            <label for="ae-cc-name">{{ classNameLabel$() }}</label>
            <input
              id="ae-cc-name"
              ref="nameField"
              v-model="form.name"
              type="text"
              maxlength="100"
              autocomplete="off"
              :aria-invalid="fieldError ? 'true' : 'false'"
              aria-describedby="ae-cc-name-error"
            >
            <p
              v-if="fieldError"
              id="ae-cc-name-error"
              class="ae-side-panel-error"
            >
              {{ fieldError }}
            </p>
          </div>
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
              :disabled="isCreating"
              @click="createClass"
            >
              {{ createClassAction$() }}
            </button>
          </div>
        </template>
      </AeSidePanel>
    </template>
  </AeListPage>

</template>


<script>

  import { computed, nextTick, onMounted, reactive, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router/composables';
  import urls from 'kolibri/urls';
  import { currentLanguage } from 'kolibri/utils/i18n';
  import useSnackbar from 'kolibri/composables/useSnackbar';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';
  import { useClassroomApi } from '../../composables/useClassroomApi';
  import { useAsyncPageLoad } from '../../composables/useAsyncPageLoad';
  import AeAvatar from '../AeAvatar';
  import AeListPage from '../AeListPage';
  import AeRowActions from '../AeRowActions';
  import AeSidePanel from '../AeSidePanel';

  export default {
    name: 'AeCoachClassesPage',
    components: { AeAvatar, AeListPage, AeRowActions, AeSidePanel },
    setup() {
      const {
        myClasses$,
        classesCount$,
        coachClassesIntro$,
        coachClassesBannerTitle$,
        coachClassesBannerSubtitle$,
        classesSearchLabel$,
        classesSearchPlaceholder$,
        coachClassesEmpty$,
        coachClassesNoMatch$,
        classNameLabel$,
        columnLearners$,
        coachesTitle$,
        columnActions$,
        learnersCount$,
        viewLearnersAction$,
        viewLearnersOf$,
        moreActionsFor$,
        addLearnerToClassOf$,
        sortByName$,
        sortByLearners$,
        createClassTitle$,
        createClassSubtitle$,
        createClassAction$,
        classNameRequired$,
        classNameTaken$,
        classNameTakenAlert$,
        formHasErrors$,
        classCreated$,
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
        isLoading: isLoadingClasses,
        loadError,
        runLoad,
      } = useAsyncPageLoad('isLoadingClasses');

      const classrooms = ref([]);
      const createPanelOpen = ref(false);
      const isCreating = ref(false);
      const fieldError = ref('');
      const formError = ref('');
      const form = reactive({ name: '' });
      const nameField = ref(null);

      const errorMessage = computed(() => {
        if (!loadError.value) {
          return '';
        }
        if (loadError.value.code === 'AE_REQUEST_TIMEOUT') {
          return loadTimeout$();
        }
        return loadError$();
      });

      function learnersHref(classId, query = {}) {
        return router.resolve({ name: 'AeCoachLearners', query: { classId, ...query } }).href;
      }

      const rows = computed(() =>
        classrooms.value.map(classroom => ({
          id: classroom.id,
          name: classroom.name,
          learnerCount: classroom.learner_count || 0,
          coachNames: (classroom.coaches || [])
            .map(coach => coach.full_name || coach.username)
            .join(', '),
          learnersHref: learnersHref(classroom.id),
          addLearnerHref: learnersHref(classroom.id, { creer: '1' }),
        })),
      );

      const collator = new Intl.Collator(currentLanguage, { sensitivity: 'base' });
      const sortOptions = [
        {
          value: 'name',
          label: sortByName$(),
          compare: (a, b) => collator.compare(a.name, b.name),
        },
        {
          value: 'learners',
          label: sortByLearners$(),
          compare: (a, b) => b.learnerCount - a.learnerCount,
        },
      ];

      async function refresh() {
        try {
          await runLoad(async () => {
            classrooms.value = await api.fetchClassrooms(userFacilityId.value);
          });
        } catch (e) {
          classrooms.value = [];
        }
      }

      function openCreatePanel() {
        form.name = '';
        fieldError.value = '';
        formError.value = '';
        createPanelOpen.value = true;
        nextTick(() => nameField.value && nameField.value.focus());
      }

      function closeCreatePanel() {
        createPanelOpen.value = false;
      }

      async function createClass() {
        fieldError.value = '';
        formError.value = '';
        const name = form.name.trim();
        if (!name) {
          fieldError.value = classNameRequired$();
        } else if (
          classrooms.value.some(classroom => classroom.name.trim().toLowerCase() === name.toLowerCase())
        ) {
          fieldError.value = classNameTaken$();
        }
        if (fieldError.value) {
          formError.value =
            fieldError.value === classNameTaken$() ? classNameTakenAlert$() : formHasErrors$();
          nameField.value.focus();
          return;
        }
        isCreating.value = true;
        try {
          await api.createClassroom({ name });
        } catch (e) {
          const data = e && e.response && e.response.data;
          if (Array.isArray(data) && data[0] && data[0].id === 'UNIQUE') {
            fieldError.value = classNameTaken$();
            formError.value = classNameTakenAlert$();
            nameField.value.focus();
          } else {
            formError.value = saveError$();
          }
          return;
        } finally {
          isCreating.value = false;
        }
        closeCreatePanel();
        createSnackbar(classCreated$({ name }));
        await refresh();
      }

      onMounted(() => {
        refresh();
        if (route.query.creer) {
          openCreatePanel();
          router.replace({ query: {} });
        }
      });

      return {
        myClasses$,
        classesCount$,
        coachClassesIntro$,
        coachClassesBannerTitle$,
        coachClassesBannerSubtitle$,
        classesSearchLabel$,
        classesSearchPlaceholder$,
        coachClassesEmpty$,
        coachClassesNoMatch$,
        classNameLabel$,
        columnLearners$,
        coachesTitle$,
        columnActions$,
        learnersCount$,
        viewLearnersAction$,
        viewLearnersOf$,
        moreActionsFor$,
        addLearnerToClassOf$,
        createClassTitle$,
        createClassSubtitle$,
        createClassAction$,
        cancelAction$,
        bannerArt: urls.static('action_education_portal/ae-users-banner.jpg'),
        isLoadingClasses,
        errorMessage,
        rows,
        sortOptions,
        createPanelOpen,
        isCreating,
        form,
        fieldError,
        formError,
        nameField,
        openCreatePanel,
        closeCreatePanel,
        createClass,
        refresh,
      };
    },
  };

</script>
