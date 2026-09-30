<template>

  <AeListPage
    :title="coursesTitle$()"
    :countLabel="coursesCount$({ count: filteredRows.length })"
    :subtitle="adminCoursesSubtitle$()"
    :action="{ label: coachQuickCreateCourse$(), onClick: openWizard }"
    :bannerTitle="adminCoursesBannerTitle$()"
    :bannerSubtitle="adminCoursesBannerSubtitle$()"
    bannerIcon="lesson"
    :bannerArt="bannerArt"
    :loading="isLoading"
    :errorText="errorMessage"
    :items="filteredRows"
    :searchFields="['title', 'trainer']"
    :searchLabel="coursesSearchLabel$()"
    :searchPlaceholder="coursesSearchPlaceholder$()"
    :sortOptions="sortOptions"
    :emptyText="adminCoursesEmpty$()"
    :noMatchText="coursesNoMatch$()"
    :totalLabel="count => coursesCount$({ count })"
    @retry="refresh"
  >
    <template #filters>
      <label class="ae-list-filter">
        <span>{{ courseTrainerLabel$() }} :</span>
        <select v-model="trainerFilter">
          <option value="">{{ filterAllOption$() }}</option>
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
      </label>
    </template>

    <template #head>
      <th
        scope="col"
        class="ae-list-cell-grow"
      >
        {{ columnCourse$() }}
      </th>
      <th scope="col">
        {{ courseTrainerLabel$() }}
      </th>
      <th
        scope="col"
        class="ae-list-cell-secondary"
      >
        {{ columnContent$() }}
      </th>
      <th scope="col">
        {{ learnersTitle$() }}
      </th>
      <th
        scope="col"
        class="ae-list-cell-secondary"
      >
        {{ columnProgress$() }}
      </th>
      <th scope="col">
        {{ colStatus$() }}
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
            :name="item.title"
            :toneKey="item.id"
            icon="lesson"
          />
          <span class="ae-admin-course-text">
            <span class="ae-list-cell-name">{{ item.title }}</span>
            <span
              v-if="item.description"
              class="ae-admin-course-sub"
            >{{ item.description }}</span>
          </span>
        </span>
      </td>
      <td class="ae-list-cell-nowrap">
        <span
          v-if="item.trainer"
          class="ae-admin-course-trainer"
          :title="item.trainer"
        >{{ item.trainer }}</span>
        <span
          v-else
          class="ae-admin-course-unassigned"
        >{{ noTrainerAssigned$() }}</span>
      </td>
      <td class="ae-list-cell-nowrap ae-list-cell-secondary">
        {{ contentSummary$({ files: item.supports, quizzes: item.quizzes }) }}
      </td>
      <td class="ae-list-cell-nowrap">
        {{ item.learners }}
      </td>
      <td class="ae-list-cell-nowrap ae-list-cell-secondary">
        <span class="ae-admin-course-progress">
          <span
            class="ae-admin-course-bar"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="item.average"
            :aria-label="progressOf$({ name: item.title })"
          >
            <span
              class="ae-admin-course-bar-fill"
              :style="{ width: `${item.average}%` }"
            ></span>
          </span>
          <span>{{ item.average }} %</span>
        </span>
      </td>
      <td class="ae-list-cell-nowrap">
        <span
          class="ae-admin-course-pill"
          :class="item.published ? 'ae-admin-course-pill-on' : 'ae-admin-course-pill-off'"
        >{{ item.published ? statusPublished$() : statusDraft$() }}</span>
      </td>
      <td class="ae-list-cell-shrink">
        <AeRowActions
          :primaryLabel="openCourseAction$()"
          :primaryAriaLabel="openCourseOf$({ name: item.title })"
          :primaryHref="item.href"
          :moreLabel="moreActionsFor$({ name: item.title })"
          :menuItems="[
            { label: editCourseTitle$(), onClick: () => (editing = item.training) },
            {
              label: item.published ? unpublishAction$() : publishAction$(),
              onClick: () => togglePublished(item),
            },
          ]"
          :openUp="openUp"
        />
      </td>
    </template>

    <template #extra>
      <AeCourseCreateWizard
        :open="wizardOpen"
        @close="wizardOpen = false"
        @created="openCreatedCourse"
      />
      <AeCourseEditPanel
        :training="editing"
        @close="editing = null"
        @saved="onSaved"
      />
    </template>
  </AeListPage>

</template>


<script>

  import { computed, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router/composables';
  import urls from 'kolibri/urls';
  import { currentLanguage } from 'kolibri/utils/i18n';
  import useSnackbar from 'kolibri/composables/useSnackbar';
  import { portalStrings } from '../../strings';
  import { useTrainingApi } from '../../composables/useTrainingApi';
  import { useAsyncPageLoad } from '../../composables/useAsyncPageLoad';
  import { useFacilityTrainers } from '../../composables/useFacilityTrainers';
  import AeAvatar from '../AeAvatar';
  import AeIcon from '../AeIcon';
  import AeListPage from '../AeListPage';
  import AeRowActions from '../AeRowActions';
  import AeCourseCreateWizard from './AeCourseCreateWizard';
  import AeCourseEditPanel from './AeCourseEditPanel';

  const TEMPLATE_STRINGS = [
    'coursesTitle$',
    'coursesCount$',
    'adminCoursesSubtitle$',
    'coachQuickCreateCourse$',
    'adminCoursesBannerTitle$',
    'adminCoursesBannerSubtitle$',
    'coursesSearchLabel$',
    'coursesSearchPlaceholder$',
    'adminCoursesEmpty$',
    'coursesNoMatch$',
    'courseTrainerLabel$',
    'filterAllOption$',
    'columnCourse$',
    'columnContent$',
    'learnersTitle$',
    'columnProgress$',
    'colStatus$',
    'columnActions$',
    'noTrainerAssigned$',
    'contentSummary$',
    'progressOf$',
    'statusPublished$',
    'statusDraft$',
    'openCourseAction$',
    'openCourseOf$',
    'moreActionsFor$',
    'editCourseTitle$',
    'publishAction$',
    'unpublishAction$',
  ];

  /** Admins create the courses, assign each one to a trainer and follow them. */
  export default {
    name: 'AeAdminCoursesPage',
    components: {
      AeAvatar,
      AeCourseCreateWizard,
      AeCourseEditPanel,
      AeIcon,
      AeListPage,
      AeRowActions,
    },
    setup() {
      const {
        sortByName$,
        sortByNewest$,
        sortByProgress$,
        coursePublished$,
        courseUnpublished$,
        saveError$,
        loadError$,
        loadTimeout$,
      } = portalStrings;
      const templateStrings = Object.fromEntries(
        TEMPLATE_STRINGS.map(name => [name, portalStrings[name]]),
      );

      const route = useRoute();
      const router = useRouter();
      const { createSnackbar } = useSnackbar();
      const api = useTrainingApi();
      const { trainers, loadTrainers, trainerName } = useFacilityTrainers();
      const { isLoading, loadError, runLoad } = useAsyncPageLoad('isLoadingAdminCourses');

      const trainings = ref([]);
      const resources = ref([]);
      const quizzes = ref([]);
      const overview = ref([]);
      const trainerFilter = ref('');
      const wizardOpen = ref(false);
      const editing = ref(null);

      const errorMessage = computed(() => {
        if (!loadError.value) {
          return '';
        }
        return loadError.value.code === 'AE_REQUEST_TIMEOUT' ? loadTimeout$() : loadError$();
      });

      function countBy(list, key) {
        const counts = {};
        list.forEach(item => {
          counts[item[key]] = (counts[item[key]] || 0) + 1;
        });
        return counts;
      }

      const rows = computed(() => {
        const supports = countBy(resources.value, 'training');
        const quizCounts = countBy(quizzes.value, 'training');
        const progress = {};
        overview.value.forEach(entry => {
          progress[entry.training] = entry;
        });
        return trainings.value.map(training => ({
          id: training.id,
          title: training.title,
          description: training.description || '',
          trainerId: training.responsible || '',
          trainer: trainerName(training.responsible),
          supports: supports[training.id] || 0,
          quizzes: quizCounts[training.id] || 0,
          learners: progress[training.id] ? progress[training.id].learners : 0,
          average: progress[training.id] ? progress[training.id].average_percent : 0,
          published: training.status === 'published',
          created: new Date(training.date_created || 0).getTime(),
          href: router.resolve({
            name: 'AeAdminCourseDetail',
            params: { trainingId: training.id },
          }).href,
          training,
        }));
      });

      const filteredRows = computed(() =>
        trainerFilter.value
          ? rows.value.filter(row => row.trainerId === trainerFilter.value)
          : rows.value,
      );

      const collator = new Intl.Collator(currentLanguage, { sensitivity: 'base' });
      const sortOptions = [
        {
          value: 'name',
          label: sortByName$(),
          compare: (a, b) => collator.compare(a.title, b.title),
        },
        { value: 'newest', label: sortByNewest$(), compare: (a, b) => b.created - a.created },
        { value: 'progress', label: sortByProgress$(), compare: (a, b) => b.average - a.average },
      ];

      async function refresh() {
        try {
          await runLoad(async () => {
            const [list, supportList, quizList, progress] = await Promise.all([
              api.fetchTrainings(),
              api.fetchResources().catch(() => []),
              api.fetchQuizzes().catch(() => []),
              api.fetchProgressOverview().catch(() => []),
            ]);
            trainings.value = list || [];
            resources.value = supportList || [];
            quizzes.value = quizList || [];
            overview.value = progress || [];
          });
        } catch (e) {
          trainings.value = [];
        }
      }

      function openWizard() {
        wizardOpen.value = true;
      }

      function openCreatedCourse(training) {
        wizardOpen.value = false;
        router.push({ name: 'AeAdminCourseDetail', params: { trainingId: training.id } });
      }

      async function togglePublished(item) {
        const status = item.published ? 'draft' : 'published';
        try {
          await api.updateTraining(item.id, { status });
          createSnackbar(status === 'published' ? coursePublished$() : courseUnpublished$());
          await refresh();
        } catch (e) {
          createSnackbar(saveError$());
        }
      }

      function onSaved() {
        editing.value = null;
        refresh();
      }

      onMounted(() => {
        loadTrainers();
        refresh();
        if (route.query.creer) {
          openWizard();
          router.replace({ query: {} });
        }
      });

      return {
        ...templateStrings,
        bannerArt: urls.static('action_education_portal/ae-users-banner.jpg'),
        isLoading,
        errorMessage,
        trainers,
        trainerFilter,
        filteredRows,
        sortOptions,
        wizardOpen,
        editing,
        refresh,
        openWizard,
        openCreatedCourse,
        togglePublished,
        onSaved,
      };
    },
  };

</script>


<style lang="scss" scoped>

  .ae-admin-course-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
    line-height: 1.3;
  }

  .ae-admin-course-sub {
    overflow: hidden;
    font-size: 14px;
    color: var(--ae-text-subtle);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ae-admin-course-trainer {
    display: block;
    max-width: 170px;
    overflow: hidden;
    font-weight: 600;
    color: var(--ae-navy);
    text-overflow: ellipsis;
  }

  .ae-admin-course-unassigned {
    font-style: italic;
    color: var(--ae-danger);
  }

  .ae-admin-course-progress {
    display: inline-flex;
    gap: 10px;
    align-items: center;
  }

  .ae-admin-course-bar {
    display: block;
    width: 70px;
    height: 10px;
    overflow: hidden;
    background: var(--ae-surface-muted);
    border-radius: 999px;
  }

  .ae-admin-course-bar-fill {
    display: block;
    height: 100%;
    background: var(--ae-orange);
    border-radius: 999px;
  }

  .ae-admin-course-pill {
    display: inline-block;
    padding: 4px 12px;
    font-size: 14px;
    font-weight: 700;
    border-radius: 999px;
  }

  .ae-admin-course-pill-on {
    color: #1b6e3c;
    background: var(--ae-kpi-green);
  }

  .ae-admin-course-pill-off {
    color: var(--ae-text-muted);
    background: var(--ae-surface-muted);
  }

</style>
