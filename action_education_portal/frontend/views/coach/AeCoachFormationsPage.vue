<template>

  <AeListPage
    :title="myCourses$()"
    :countLabel="coursesCount$({ count: rows.length })"
    :subtitle="coachCoursesIntro$()"
    :bannerTitle="coursesBannerTitle$()"
    :bannerSubtitle="coursesBannerSubtitle$()"
    bannerIcon="lesson"
    :bannerArt="bannerArt"
    :loading="isLoadingCourses"
    :errorText="errorMessage"
    :items="rows"
    :searchFields="['title', 'description']"
    :searchLabel="coursesSearchLabel$()"
    :searchPlaceholder="coursesSearchPlaceholder$()"
    :sortOptions="sortOptions"
    :emptyText="coachNoAssignedCourse$()"
    :noMatchText="coursesNoMatch$()"
    :totalLabel="count => coursesCount$({ count })"
    @retry="refresh"
  >
    <template #head>
      <th
        scope="col"
        class="ae-list-cell-grow"
      >
        {{ columnCourse$() }}
      </th>
      <th scope="col">
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
      <th
        scope="col"
        class="ae-list-cell-secondary"
      >
        {{ columnSize$() }}
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
            :name="item.title"
            :toneKey="item.id"
            icon="lesson"
          />
          <span class="ae-coach-course-text">
            <span class="ae-list-cell-name">{{ item.title }}</span>
            <span
              v-if="item.description"
              class="ae-coach-course-description"
            >{{ item.description }}</span>
          </span>
        </span>
      </td>
      <td class="ae-list-cell-nowrap">
        {{ contentSummary$({ files: item.fileCount, quizzes: item.quizCount }) }}
      </td>
      <td class="ae-list-cell-nowrap">
        {{ item.learners }}
      </td>
      <td class="ae-list-cell-nowrap ae-list-cell-secondary">
        <span class="ae-coach-course-progress">
          <span
            class="ae-coach-course-bar"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="item.average"
            :aria-label="progressOf$({ name: item.title })"
          >
            <span
              class="ae-coach-course-bar-fill"
              :style="{ width: `${item.average}%` }"
            ></span>
          </span>
          <span>{{ item.average }} %</span>
        </span>
      </td>
      <td class="ae-list-cell-nowrap ae-list-cell-secondary">
        {{ item.sizeLabel }}
      </td>
      <td class="ae-list-cell-shrink">
        <AeRowActions
          :primaryLabel="openCourseAction$()"
          :primaryAriaLabel="openCourseOf$({ name: item.title })"
          :primaryHref="item.href"
        />
      </td>
    </template>
  </AeListPage>

</template>


<script>

  import { computed, onMounted, ref } from 'vue';
  import { useRouter } from 'vue-router/composables';
  import urls from 'kolibri/urls';
  import { currentLanguage } from 'kolibri/utils/i18n';
  import { portalStrings } from '../../strings';
  import { useTrainingApi } from '../../composables/useTrainingApi';
  import { useAsyncPageLoad } from '../../composables/useAsyncPageLoad';
  import { useAePermissions } from '../../composables/useAePermissions';
  import { formatCourseSize, sizesByTraining } from '../../composables/courseSize';
  import AeAvatar from '../AeAvatar';
  import AeListPage from '../AeListPage';
  import AeRowActions from '../AeRowActions';

  /** The courses an admin assigned to this trainer. */
  export default {
    name: 'AeCoachFormationsPage',
    components: { AeAvatar, AeListPage, AeRowActions },
    setup() {
      const {
        myCourses$,
        coursesCount$,
        coachCoursesIntro$,
        coursesBannerTitle$,
        coursesBannerSubtitle$,
        coursesSearchLabel$,
        coursesSearchPlaceholder$,
        coachNoAssignedCourse$,
        coursesNoMatch$,
        columnCourse$,
        columnContent$,
        learnersTitle$,
        columnProgress$,
        columnSize$,
        columnActions$,
        contentSummary$,
        progressOf$,
        openCourseAction$,
        openCourseOf$,
        sortByName$,
        sortByNewest$,
        sortByProgress$,
        loadError$,
        loadTimeout$,
      } = portalStrings;

      const router = useRouter();
      const api = useTrainingApi();
      const { currentUserId } = useAePermissions();
      const {
        isLoading: isLoadingCourses,
        loadError,
        runLoad,
      } = useAsyncPageLoad('isLoadingCourses');

      const trainings = ref([]);
      const resources = ref([]);
      const quizzes = ref([]);
      const overview = ref([]);

      const errorMessage = computed(() => {
        if (!loadError.value) {
          return '';
        }
        if (loadError.value.code === 'AE_REQUEST_TIMEOUT') {
          return loadTimeout$();
        }
        return loadError$();
      });

      const rows = computed(() => {
        const sizes = sizesByTraining(resources.value);
        const fileCounts = {};
        resources.value.forEach(resource => {
          const trainingId = resource.training || resource.training_id;
          fileCounts[trainingId] = (fileCounts[trainingId] || 0) + 1;
        });
        const quizCounts = {};
        quizzes.value.forEach(quiz => {
          quizCounts[quiz.training] = (quizCounts[quiz.training] || 0) + 1;
        });
        const progress = {};
        overview.value.forEach(entry => {
          progress[entry.training] = entry;
        });
        return trainings.value.map(training => ({
          id: training.id,
          title: training.title,
          description: training.description || '',
          fileCount: fileCounts[training.id] || 0,
          quizCount: quizCounts[training.id] || 0,
          learners: progress[training.id] ? progress[training.id].learners : 0,
          average: progress[training.id] ? progress[training.id].average_percent : 0,
          size: sizes[training.id] || 0,
          sizeLabel: formatCourseSize(sizes[training.id] || 0),
          updated: new Date(training.date_updated || training.date_created || 0).getTime(),
          href: router.resolve({
            name: 'AeCoachCourseDetail',
            params: { trainingId: training.id },
          }).href,
        }));
      });

      const collator = new Intl.Collator(currentLanguage, { sensitivity: 'base' });
      const sortOptions = [
        {
          value: 'name',
          label: sortByName$(),
          compare: (a, b) => collator.compare(a.title, b.title),
        },
        { value: 'newest', label: sortByNewest$(), compare: (a, b) => b.updated - a.updated },
        { value: 'progress', label: sortByProgress$(), compare: (a, b) => b.average - a.average },
      ];

      async function refresh() {
        try {
          await runLoad(async () => {
            const [list, files, quizList, progress] = await Promise.all([
              api.fetchTrainings({ responsible: currentUserId.value }),
              api.fetchResources().catch(() => []),
              api.fetchQuizzes().catch(() => []),
              api.fetchProgressOverview().catch(() => []),
            ]);
            trainings.value = list || [];
            resources.value = files || [];
            quizzes.value = quizList || [];
            overview.value = progress || [];
          });
        } catch (e) {
          trainings.value = [];
          resources.value = [];
        }
      }

      onMounted(refresh);

      return {
        myCourses$,
        coursesCount$,
        coachCoursesIntro$,
        coursesBannerTitle$,
        coursesBannerSubtitle$,
        coursesSearchLabel$,
        coursesSearchPlaceholder$,
        coachNoAssignedCourse$,
        coursesNoMatch$,
        columnCourse$,
        columnContent$,
        learnersTitle$,
        columnProgress$,
        columnSize$,
        columnActions$,
        contentSummary$,
        progressOf$,
        openCourseAction$,
        openCourseOf$,
        bannerArt: urls.static('action_education_portal/ae-users-banner.jpg'),
        isLoadingCourses,
        errorMessage,
        rows,
        sortOptions,
        refresh,
      };
    },
  };

</script>


<style lang="scss" scoped>

  .ae-coach-course-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
    line-height: 1.3;
  }

  .ae-coach-course-description {
    overflow: hidden;
    font-size: 14px;
    color: var(--ae-text-subtle);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ae-coach-course-progress {
    display: inline-flex;
    gap: 10px;
    align-items: center;
  }

  .ae-coach-course-bar {
    display: block;
    width: 70px;
    height: 10px;
    overflow: hidden;
    background: var(--ae-surface-muted);
    border-radius: 999px;
  }

  .ae-coach-course-bar-fill {
    display: block;
    height: 100%;
    background: var(--ae-orange);
    border-radius: 999px;
  }

</style>
