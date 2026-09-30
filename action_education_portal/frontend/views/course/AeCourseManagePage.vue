<template>

  <AeListPage
    :key="tab"
    :title="training ? training.title : courseContentTitle$()"
    :crumbs="[{ label: listLabel, to: listRoute }]"
    :countLabel="training ? statusLabel(training.status) : ''"
    :subtitle="training && training.description ? training.description : ''"
    :note="trainerNote"
    :action="canManage ? tabAction : null"
    :loading="loading"
    :errorText="errorMessage"
    :items="rows"
    :searchFields="currentTab.searchFields"
    :searchLabel="currentTab.searchLabel"
    :searchPlaceholder="currentTab.searchLabel"
    :sortOptions="currentTab.sortOptions"
    :emptyText="currentTab.emptyText"
    :noMatchText="noMatch$()"
    :totalLabel="currentTab.totalLabel"
    @retry="refresh"
  >
    <template
      v-if="isAdminSpace && training"
      #actions
    >
      <button
        type="button"
        class="ae-course-secondary"
        @click="editing = training"
      >
        <AeIcon
          name="pencil"
          :size="18"
        />
        <span>{{ editCourseTitle$() }}</span>
      </button>
    </template>

    <template #banner>
      <div
        class="ae-course-tabs"
        role="tablist"
        :aria-label="courseSectionsLabel$()"
        @keydown.right.prevent="moveTab(1)"
        @keydown.left.prevent="moveTab(-1)"
      >
        <button
          v-for="item in tabs"
          :id="`ae-course-tab-${item.id}`"
          :key="item.id"
          type="button"
          role="tab"
          class="ae-course-tab"
          :class="{ 'ae-course-tab-on': tab === item.id }"
          :aria-selected="tab === item.id ? 'true' : 'false'"
          :tabindex="tab === item.id ? 0 : -1"
          @click="selectTab(item.id)"
        >
          <AeIcon
            :name="item.icon"
            :size="20"
          />
          <span>{{ item.label }}</span>
          <span class="ae-course-tab-count">{{ item.count }}</span>
        </button>
      </div>
    </template>

    <!-- Supports -->
    <template #head>
      <template v-if="tab === 'supports'">
        <th
          scope="col"
          class="ae-list-cell-grow"
        >
          {{ columnSupport$() }}
        </th>
        <th scope="col">
          {{ columnType$() }}
        </th>
        <th
          scope="col"
          class="ae-list-cell-secondary"
        >
          {{ columnSize$() }}
        </th>
        <th
          scope="col"
          class="ae-list-cell-secondary"
        >
          {{ columnAdded$() }}
        </th>
        <th
          scope="col"
          class="ae-list-cell-shrink"
        >
          {{ columnActions$() }}
        </th>
      </template>
      <template v-else-if="tab === 'quizzes'">
        <th
          scope="col"
          class="ae-list-cell-grow"
        >
          {{ columnEvaluation$() }}
        </th>
        <th scope="col">
          {{ columnType$() }}
        </th>
        <th scope="col">
          {{ columnQuestions$() }}
        </th>
        <th scope="col">
          {{ colStatus$() }}
        </th>
        <th
          scope="col"
          class="ae-list-cell-secondary"
        >
          {{ columnPassed$() }}
        </th>
        <th
          scope="col"
          class="ae-list-cell-shrink"
        >
          {{ columnActions$() }}
        </th>
      </template>
      <template v-else>
        <th
          scope="col"
          class="ae-list-cell-grow"
        >
          {{ colLearner$() }}
        </th>
        <th scope="col">
          {{ columnProgress$() }}
        </th>
        <th
          scope="col"
          class="ae-list-cell-secondary"
        >
          {{ stepSupports$() }}
        </th>
        <th
          scope="col"
          class="ae-list-cell-secondary"
        >
          {{ columnQuizzes$() }}
        </th>
        <th scope="col">
          {{ columnExam$() }}
        </th>
        <th
          scope="col"
          class="ae-list-cell-secondary"
        >
          {{ colLastActivity$() }}
        </th>
      </template>
    </template>

    <template #row="{ item, openUp }">
      <template v-if="tab === 'supports'">
        <td class="ae-list-cell-grow">
          <span class="ae-list-cell-main">
            <span
              class="ae-course-kind-icon"
              :class="`ae-course-kind-${item.kind}`"
              aria-hidden="true"
            >
              <AeIcon
                :name="item.icon"
                :size="20"
              />
            </span>
            <span class="ae-course-text">
              <span class="ae-list-cell-name">{{ item.title }}</span>
              <span class="ae-course-sub">{{ item.subtitle }}</span>
            </span>
          </span>
        </td>
        <td class="ae-list-cell-nowrap">
          {{ item.kindLabel }}
        </td>
        <td class="ae-list-cell-nowrap ae-list-cell-secondary">
          {{ item.sizeLabel }}
        </td>
        <td class="ae-list-cell-nowrap ae-list-cell-secondary">
          {{ item.addedLabel }}
        </td>
        <td class="ae-list-cell-shrink">
          <AeRowActions
            :primaryLabel="previewAction$()"
            :primaryAriaLabel="previewOf$({ name: item.title })"
            :moreLabel="moreActionsFor$({ name: item.title })"
            :menuItems="supportMenu(item)"
            :openUp="openUp"
            @primary="viewing = item.resource"
          />
        </td>
      </template>

      <template v-else-if="tab === 'quizzes'">
        <td class="ae-list-cell-grow">
          <span class="ae-list-cell-main">
            <span
              class="ae-course-kind-icon"
              :class="item.isExam ? 'ae-course-kind-exam' : 'ae-course-kind-quiz'"
              aria-hidden="true"
            >
              <AeIcon
                :name="item.isExam ? 'award' : 'listChecks'"
                :size="20"
              />
            </span>
            <span class="ae-list-cell-name">{{ item.title }}</span>
          </span>
        </td>
        <td class="ae-list-cell-nowrap">
          <span
            class="ae-course-pill"
            :class="item.isExam ? 'ae-course-pill-exam' : 'ae-course-pill-quiz'"
          >{{ item.kindLabel }}</span>
        </td>
        <td class="ae-list-cell-nowrap">
          {{ item.questions }}
        </td>
        <td class="ae-list-cell-nowrap">
          <span
            class="ae-course-pill"
            :class="item.published ? 'ae-course-pill-on' : 'ae-course-pill-off'"
          >{{ item.statusLabel }}</span>
        </td>
        <td class="ae-list-cell-nowrap ae-list-cell-secondary">
          {{ item.passedLabel }}
        </td>
        <td class="ae-list-cell-shrink">
          <AeRowActions
            :primaryLabel="canManage ? editAction$() : previewAction$()"
            :primaryAriaLabel="editSectionOf$({ name: item.title })"
            :primaryHref="item.href"
            :moreLabel="moreActionsFor$({ name: item.title })"
            :menuItems="quizMenu(item)"
            :openUp="openUp"
          />
        </td>
      </template>

      <template v-else>
        <td class="ae-list-cell-grow">
          <span class="ae-list-cell-main">
            <AeAvatar
              :name="item.name"
              :toneKey="item.username"
            />
            <span class="ae-course-text">
              <span class="ae-list-cell-name">{{ item.name }}</span>
              <span class="ae-course-sub">{{ item.username }}</span>
            </span>
          </span>
        </td>
        <td class="ae-list-cell-nowrap">
          <span class="ae-course-progress">
            <span
              class="ae-course-bar"
              role="progressbar"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-valuenow="item.percent"
              :aria-label="progressOf$({ name: item.name })"
            >
              <span
                class="ae-course-bar-fill"
                :class="{ 'ae-course-bar-done': item.completed }"
                :style="{ width: `${item.percent}%` }"
              ></span>
            </span>
            <span class="ae-course-percent">{{ item.percent }} %</span>
          </span>
        </td>
        <td class="ae-list-cell-nowrap ae-list-cell-secondary">
          {{ item.resourcesLabel }}
        </td>
        <td class="ae-list-cell-nowrap ae-list-cell-secondary">
          {{ item.quizzesLabel }}
        </td>
        <td class="ae-list-cell-nowrap">
          <span
            class="ae-course-exam"
            :class="{ 'ae-course-exam-passed': item.examPassed }"
          >
            <AeIcon
              v-if="item.certified"
              name="award"
              :size="18"
            />
            {{ item.examLabel }}
          </span>
        </td>
        <td class="ae-list-cell-nowrap ae-list-cell-secondary">
          {{ item.lastActivityLabel }}
        </td>
      </template>
    </template>

    <template #extra>
      <AeResourceViewer
        :resource="viewing"
        :src="viewing ? api.resourceViewUrl(viewing.id) : ''"
        :downloadHref="viewing ? api.resourceDownloadUrl(viewing.id) : ''"
        @close="viewing = null"
      />

      <!-- Add supports: files or a web link. -->
      <AeSidePanel
        :open="addPanelOpen"
        :title="addSupportsTitle$()"
        :subtitle="addSupportsSubtitle$()"
        icon="upload"
        titleId="ae-add-supports-title"
        :alert="addAlert"
        @close="closeAddPanel"
      >
        <div
          class="ae-course-switch"
          role="radiogroup"
          :aria-label="addSupportsTitle$()"
        >
          <button
            type="button"
            role="radio"
            :aria-checked="addMode === 'files' ? 'true' : 'false'"
            :class="{ 'ae-course-switch-on': addMode === 'files' }"
            :disabled="uploading"
            @click="addMode = 'files'"
          >
            <AeIcon
              name="upload"
              :size="18"
            />
            <span>{{ supportFilesMode$() }}</span>
          </button>
          <button
            type="button"
            role="radio"
            :aria-checked="addMode === 'link' ? 'true' : 'false'"
            :class="{ 'ae-course-switch-on': addMode === 'link' }"
            :disabled="uploading"
            @click="addMode = 'link'"
          >
            <AeIcon
              name="link"
              :size="18"
            />
            <span>{{ supportLinkMode$() }}</span>
          </button>
        </div>

        <AeFileDrop
          v-if="addMode === 'files'"
          v-model="files"
          :locked="uploading"
        />
        <form
          v-else
          novalidate
          @submit.prevent="addLink"
        >
          <div class="ae-side-panel-field">
            <label for="ae-link-url">{{ linkUrlLabel$() }}</label>
            <input
              id="ae-link-url"
              v-model.trim="link.url"
              type="url"
              inputmode="url"
              autocomplete="off"
              placeholder="https://www.youtube.com/watch?v=…"
              :aria-invalid="linkError ? 'true' : 'false'"
              aria-describedby="ae-link-url-hint"
            >
            <p
              id="ae-link-url-hint"
              :class="linkError ? 'ae-side-panel-error' : 'ae-course-hint'"
            >
              {{ linkError || (linkIsYoutube ? youtubeDetected$() : linkUrlHint$()) }}
            </p>
          </div>
          <div class="ae-side-panel-field">
            <label for="ae-link-title">{{ resourceTitleLabel$() }}</label>
            <input
              id="ae-link-title"
              v-model="link.title"
              type="text"
              maxlength="200"
              autocomplete="off"
            >
          </div>
        </form>

        <template #footer>
          <div class="ae-side-panel-foot-row">
            <button
              type="button"
              class="ae-side-panel-btn-neutral"
              :disabled="uploading"
              @click="closeAddPanel"
            >
              {{ cancelAction$() }}
            </button>
            <button
              v-if="addMode === 'files'"
              type="button"
              class="ae-side-panel-btn-primary"
              :disabled="uploading || !readyFiles.length"
              @click="uploadFiles"
            >
              {{ uploading ? fileUploading$() : sendFilesAction$({ count: readyFiles.length }) }}
            </button>
            <button
              v-else
              type="button"
              class="ae-side-panel-btn-primary"
              :disabled="uploading"
              @click="addLink"
            >
              {{ addLinkAction$() }}
            </button>
          </div>
        </template>
      </AeSidePanel>

      <!-- Enroll learners. -->
      <AeSidePanel
        :open="enrollPanelOpen"
        :title="enrollLearnersTitle$()"
        :subtitle="enrollCourseSubtitle$()"
        icon="userPlus"
        titleId="ae-enroll-course-title"
        :alert="enrollAlert"
        @close="enrollPanelOpen = false"
      >
        <div class="ae-course-enroll">
          <h3
            id="ae-enroll-course-learners"
            class="ae-side-panel-section"
          >
            <span
              class="ae-side-panel-section-icon"
              aria-hidden="true"
            >
              <KIcon
                icon="people"
                color="var(--ae-orange)"
              />
            </span>
            <span>{{ learnersTitle$() }}</span>
          </h3>
          <AePersonPicker
            v-model="selectedLearners"
            :people="enrollable"
            searchable
            :searchLabel="searchLearnersLabel$()"
            labelledby="ae-enroll-course-learners"
            :emptyText="enrollable.length ? noLearnersAvailable$() : allLearnersEnrolled$()"
          />
        </div>
        <template #footer>
          <div class="ae-side-panel-foot-row">
            <button
              type="button"
              class="ae-side-panel-btn-neutral"
              @click="enrollPanelOpen = false"
            >
              {{ cancelAction$() }}
            </button>
            <button
              type="button"
              class="ae-side-panel-btn-primary"
              :disabled="enrolling || !selectedLearners.length"
              @click="enrollLearners"
            >
              {{ enrollAction$() }}
            </button>
          </div>
        </template>
      </AeSidePanel>

      <AeCourseEditPanel
        v-if="isAdminSpace"
        :training="editing"
        @close="editing = null"
        @saved="onCourseSaved"
      />

      <KModal
        v-if="pendingDelete"
        :title="pendingDelete.title"
        :submitText="deleteAction$()"
        :cancelText="cancelAction$()"
        :submitDisabled="deleting"
        @submit="confirmDelete"
        @cancel="pendingDelete = null"
      >
        <p>{{ pendingDelete.message }}</p>
      </KModal>
    </template>
  </AeListPage>

</template>


<script>

  import { computed, onMounted, reactive, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router/composables';
  import { currentLanguage } from 'kolibri/utils/i18n';
  import useSnackbar from 'kolibri/composables/useSnackbar';
  import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';
  import { useTrainingApi } from '../../composables/useTrainingApi';
  import { useClassroomApi } from '../../composables/useClassroomApi';
  import { useAsyncPageLoad } from '../../composables/useAsyncPageLoad';
  import { useFacilityTrainers } from '../../composables/useFacilityTrainers';
  import { formatCourseSize } from '../../composables/courseSize';
  import { previewIcon, previewKind, youtubeId } from '../../composables/resourceMedia';
  import AeAvatar from '../AeAvatar';
  import AeFileDrop from '../AeFileDrop';
  import AeIcon from '../AeIcon';
  import AeListPage from '../AeListPage';
  import AePersonPicker from '../AePersonPicker';
  import AeResourceViewer from '../AeResourceViewer';
  import AeRowActions from '../AeRowActions';
  import AeSidePanel from '../AeSidePanel';
  import AeCourseEditPanel from '../admin/AeCourseEditPanel';

  const TABS = ['supports', 'quizzes', 'learners'];

  // Texts used by the template.
  const TEMPLATE_STRINGS = [
    'addLinkAction$',
    'addSupportsSubtitle$',
    'addSupportsTitle$',
    'allLearnersEnrolled$',
    'cancelAction$',
    'colLastActivity$',
    'colLearner$',
    'colStatus$',
    'columnActions$',
    'columnAdded$',
    'columnEvaluation$',
    'columnExam$',
    'columnPassed$',
    'columnProgress$',
    'columnQuestions$',
    'columnQuizzes$',
    'columnSize$',
    'columnSupport$',
    'columnType$',
    'courseContentTitle$',
    'courseSectionsLabel$',
    'deleteAction$',
    'editAction$',
    'editCourseTitle$',
    'editSectionOf$',
    'enrollAction$',
    'enrollCourseSubtitle$',
    'enrollLearnersTitle$',
    'fileUploading$',
    'learnersTitle$',
    'linkUrlHint$',
    'linkUrlLabel$',
    'moreActionsFor$',
    'noLearnersAvailable$',
    'noMatch$',
    'previewAction$',
    'previewOf$',
    'progressOf$',
    'resourceTitleLabel$',
    'searchLearnersLabel$',
    'sendFilesAction$',
    'stepSupports$',
    'supportFilesMode$',
    'supportLinkMode$',
    'youtubeDetected$',
  ];

  /**
   * One course, for the admins and for its trainer: supports (files, links),
   * evaluations (mini quizzes, final exam) and the progress of its learners.
   */
  export default {
    name: 'AeCourseManagePage',
    components: {
      AeAvatar,
      AeCourseEditPanel,
      AeFileDrop,
      AeIcon,
      AeListPage,
      AePersonPicker,
      AeResourceViewer,
      AeRowActions,
      AeSidePanel,
    },
    setup() {
      const {
        courseContentTitle$,
        coursesTitle$,
        myCourses$,
        statusPublished$,
        statusDraft$,
        courseTrainerLabel$,
        noTrainerAssigned$,
        courseSectionsLabel$,
        stepSupports$,
        tabEvaluations$,
        learnersTitle$,
        addSupportsTitle$,
        newQuizAction$,
        enrollLearnersTitle$,
        filesCount$,
        quizzesCount$,
        participantsCount$,
        filesSearchLabel$,
        quizzesSearchLabel$,
        searchLearnersLabel$,
        resourcesEmpty$,
        quizzesEmpty$,
        courseLearnersEmpty$,
        sortByOrder$,
        sortByName$,
        sortByNewest$,
        sortByProgress$,
        sortByActivity$,
        kindVideo$,
        kindAudio$,
        kindImage$,
        kindPdf$,
        kindYoutube$,
        kindLink$,
        kindFile$,
        quizKindQuiz$,
        quizKindExam$,
        passedCountLabel$,
        downloadResourceAction$,
        openLinkAction$,
        deleteAction$,
        publishAction$,
        unpublishAction$,
        deleteSupportTitle$,
        deleteSupportConfirm$,
        deleteQuizTitle$,
        deleteQuizConfirm$,
        resourceDeleted$,
        quizDeleted$,
        quizPublished$,
        quizUnpublished$,
        quizNeedsQuestions$,
        linkAdded$,
        filesAdded$,
        linkRequired$,
        linkInvalid$,
        learnersEnrolled$,
        saveError$,
        filesFailed$,
        learnersEnrollFailed$,
        loadError$,
        loadTimeout$,
      } = portalStrings;
      const templateStrings = Object.fromEntries(
        TEMPLATE_STRINGS.map(name => [name, portalStrings[name]]),
      );

      const route = useRoute();
      const router = useRouter();
      const { createSnackbar } = useSnackbar();
      const { isAdmin, isSuperuser, currentUserId, userFacilityId } = useAePermissions();
      const api = useTrainingApi();
      const { isStaffUser } = useClassroomApi();
      const { loadTrainers, trainerName } = useFacilityTrainers();
      const { isLoading: loading, loadError, runLoad } = useAsyncPageLoad('isLoadingCourse');

      const isAdminSpace = computed(() => String(route.name || '').startsWith('AeAdmin'));
      const listRoute = computed(() => ({
        name: isAdminSpace.value ? 'AeAdminCourses' : 'AeCoachFormations',
      }));
      const listLabel = computed(() => (isAdminSpace.value ? coursesTitle$() : myCourses$()));
      const editorRoute = quizId => ({
        name: isAdminSpace.value ? 'AeAdminQuizEditor' : 'AeCoachQuizEditor',
        params: { trainingId: route.params.trainingId, quizId },
      });

      const training = ref(null);
      const resources = ref([]);
      const quizzes = ref([]);
      const attempts = ref([]);
      const progress = ref([]);
      const facilityLearners = ref([]);
      const tab = ref(TABS.includes(route.query.onglet) ? route.query.onglet : 'supports');

      const canManage = computed(
        () =>
          Boolean(training.value) &&
          (isAdmin.value ||
            isSuperuser.value ||
            training.value.responsible === currentUserId.value),
      );

      const errorMessage = computed(() => {
        if (!loadError.value) {
          return '';
        }
        return loadError.value.code === 'AE_REQUEST_TIMEOUT' ? loadTimeout$() : loadError$();
      });

      const trainerNote = computed(() => {
        if (!training.value) {
          return '';
        }
        const name = trainerName(training.value.responsible);
        return `${courseTrainerLabel$()} : ${name || noTrainerAssigned$()}`;
      });

      function statusLabel(status) {
        return status === 'published' ? statusPublished$() : statusDraft$();
      }

      const dateFormat = new Intl.DateTimeFormat(currentLanguage, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      const collator = new Intl.Collator(currentLanguage, { sensitivity: 'base' });

      const KIND_LABELS = {
        video: kindVideo$,
        audio: kindAudio$,
        image: kindImage$,
        pdf: kindPdf$,
        youtube: kindYoutube$,
        link: kindLink$,
        download: kindFile$,
      };

      const supportRows = computed(() =>
        resources.value.map(resource => {
          const kind = previewKind(resource);
          const added = resource.date_created ? new Date(resource.date_created) : null;
          return {
            id: resource.id,
            title: resource.title,
            subtitle: resource.url || resource.original_filename,
            kind,
            icon: previewIcon(kind),
            kindLabel: KIND_LABELS[kind](),
            sizeLabel: resource.url ? '—' : formatCourseSize(resource.size_bytes),
            order: resource.sort_order || 0,
            added: added ? added.getTime() : 0,
            addedLabel: added ? dateFormat.format(added) : '',
            resource,
          };
        }),
      );

      const quizRows = computed(() => {
        const passedBy = {};
        attempts.value
          .filter(attempt => attempt.passed)
          .forEach(attempt => {
            passedBy[attempt.quiz] = passedBy[attempt.quiz] || new Set();
            passedBy[attempt.quiz].add(attempt.learner);
          });
        return quizzes.value.map(quiz => {
          const isExam = quiz.kind === 'exam';
          return {
            id: quiz.id,
            title: quiz.title,
            isExam,
            kindLabel: isExam ? quizKindExam$() : quizKindQuiz$(),
            questions: quiz.question_count,
            published: quiz.status === 'published',
            statusLabel: statusLabel(quiz.status),
            passed: passedBy[quiz.id] ? passedBy[quiz.id].size : 0,
            passedLabel: passedCountLabel$({
              count: passedBy[quiz.id] ? passedBy[quiz.id].size : 0,
            }),
            order: quiz.sort_order || 0,
            href: router.resolve(editorRoute(quiz.id)).href,
            quiz,
          };
        });
      });

      const learnerRows = computed(() =>
        progress.value.map(entry => {
          let examLabel = '—';
          if (entry.has_exam && entry.exam_best_percent !== null) {
            examLabel = `${entry.exam_best_percent} %`;
          }
          const last = entry.last_activity ? new Date(entry.last_activity) : null;
          return {
            id: entry.learner,
            name: entry.full_name,
            username: entry.username,
            percent: entry.percent,
            completed: entry.completed,
            resourcesLabel: `${entry.resources_viewed} / ${entry.resources_total}`,
            quizzesLabel: `${entry.quizzes_passed} / ${entry.quizzes_total}`,
            examLabel,
            examPassed: entry.exam_passed,
            certified: entry.certified,
            lastActivity: last ? last.getTime() : 0,
            lastActivityLabel: last ? dateFormat.format(last) : '—',
          };
        }),
      );

      const TAB_CONFIG = {
        supports: {
          rows: supportRows,
          searchFields: ['title', 'subtitle'],
          searchLabel: filesSearchLabel$(),
          emptyText: resourcesEmpty$(),
          totalLabel: count => filesCount$({ count }),
          sortOptions: [
            { value: 'order', label: sortByOrder$(), compare: (a, b) => a.order - b.order },
            {
              value: 'name',
              label: sortByName$(),
              compare: (a, b) => collator.compare(a.title, b.title),
            },
            { value: 'newest', label: sortByNewest$(), compare: (a, b) => b.added - a.added },
          ],
        },
        quizzes: {
          rows: quizRows,
          searchFields: ['title'],
          searchLabel: quizzesSearchLabel$(),
          emptyText: quizzesEmpty$(),
          totalLabel: count => quizzesCount$({ count }),
          sortOptions: [
            { value: 'order', label: sortByOrder$(), compare: (a, b) => a.order - b.order },
            {
              value: 'name',
              label: sortByName$(),
              compare: (a, b) => collator.compare(a.title, b.title),
            },
          ],
        },
        learners: {
          rows: learnerRows,
          searchFields: ['name', 'username'],
          searchLabel: searchLearnersLabel$(),
          emptyText: courseLearnersEmpty$(),
          totalLabel: count => participantsCount$({ count }),
          sortOptions: [
            {
              value: 'name',
              label: sortByName$(),
              compare: (a, b) => collator.compare(a.name, b.name),
            },
            {
              value: 'progress',
              label: sortByProgress$(),
              compare: (a, b) => b.percent - a.percent,
            },
            {
              value: 'activity',
              label: sortByActivity$(),
              compare: (a, b) => b.lastActivity - a.lastActivity,
            },
          ],
        },
      };

      const currentTab = computed(() => TAB_CONFIG[tab.value]);
      const rows = computed(() => currentTab.value.rows.value);

      const tabs = computed(() => [
        { id: 'supports', label: stepSupports$(), icon: 'fileText', count: resources.value.length },
        { id: 'quizzes', label: tabEvaluations$(), icon: 'listChecks', count: quizzes.value.length },
        { id: 'learners', label: learnersTitle$(), icon: 'users', count: progress.value.length },
      ]);

      function selectTab(id) {
        tab.value = id;
        router.replace({ query: { onglet: id } }).catch(() => {});
      }

      // Arrow keys move between tabs (WAI-ARIA tabs pattern).
      function moveTab(step) {
        const index = TABS.indexOf(tab.value);
        const next = TABS[(index + step + TABS.length) % TABS.length];
        selectTab(next);
        document.getElementById(`ae-course-tab-${next}`).focus();
      }

      async function refresh() {
        const trainingId = route.params.trainingId;
        try {
          await runLoad(async () => {
            const [course, supportList, quizList, attemptList] = await Promise.all([
              api.fetchTraining(trainingId),
              api.fetchResources({ training: trainingId }),
              api.fetchQuizzes({ training: trainingId }),
              api.fetchQuizAttempts({ training: trainingId }),
            ]);
            training.value = course;
            resources.value = supportList || [];
            quizzes.value = quizList || [];
            attempts.value = attemptList || [];
            // Only the admins and the trainer of the course follow its learners.
            progress.value = await api.fetchCourseProgress(trainingId).catch(() => []);
          });
        } catch (e) {
          resources.value = [];
        }
      }

      // ---------- Supports ----------

      const viewing = ref(null);
      const addPanelOpen = ref(false);
      const addMode = ref('files');
      const files = ref([]);
      const uploading = ref(false);
      const link = reactive({ url: '', title: '' });
      const linkError = ref('');
      const linkIsYoutube = computed(() => Boolean(youtubeId(link.url)));
      const readyFiles = computed(() => files.value.filter(item => item.status !== 'done'));

      // Outcome of the last action of each panel, shown at the top of the panel.
      const addAlert = ref(null);
      const enrollAlert = ref(null);

      function openAddPanel() {
        addAlert.value = null;
        addMode.value = 'files';
        files.value = [];
        link.url = '';
        link.title = '';
        linkError.value = '';
        addPanelOpen.value = true;
      }

      function closeAddPanel() {
        if (!uploading.value) {
          addPanelOpen.value = false;
        }
      }

      async function uploadFiles() {
        addAlert.value = null;
        uploading.value = true;
        let added = 0;
        // One at a time: course videos can be large.
        for (const item of readyFiles.value) {
          item.status = 'uploading';
          try {
            await api.uploadResource({
              trainingId: route.params.trainingId,
              title: '',
              file: item.file,
            });
            item.status = 'done';
            added += 1;
          } catch (e) {
            item.status = 'failed';
          }
        }
        uploading.value = false;
        const failed = files.value.filter(item => item.status === 'failed').length;
        if (failed) {
          addAlert.value = { kind: 'error', text: filesFailed$({ count: failed }) };
        }
        if (added) {
          createSnackbar(filesAdded$({ count: added }));
          await refresh();
        }
        if (files.value.every(item => item.status === 'done')) {
          addPanelOpen.value = false;
        }
      }

      async function addLink() {
        addAlert.value = null;
        if (!link.url) {
          linkError.value = linkRequired$();
          addAlert.value = { kind: 'error', text: linkRequired$() };
          return;
        }
        if (!/^https?:\/\/\S+\.\S+/.test(link.url)) {
          linkError.value = linkInvalid$();
          addAlert.value = { kind: 'error', text: linkInvalid$() };
          return;
        }
        linkError.value = '';
        uploading.value = true;
        try {
          await api.addLink({
            trainingId: route.params.trainingId,
            title: link.title.trim(),
            url: link.url,
          });
        } catch (e) {
          // 400: the server refused the address; anything else: it could not save it.
          if (e && e.response && e.response.status === 400) {
            linkError.value = linkInvalid$();
            addAlert.value = { kind: 'error', text: linkInvalid$() };
          } else {
            addAlert.value = { kind: 'error', text: saveError$() };
          }
          return;
        } finally {
          uploading.value = false;
        }
        createSnackbar(linkAdded$());
        addPanelOpen.value = false;
        await refresh();
      }

      function supportMenu(item) {
        const menu = [];
        if (item.resource.url) {
          menu.push({ label: openLinkAction$(), href: item.resource.url });
        } else {
          menu.push({
            label: downloadResourceAction$(),
            href: api.resourceDownloadUrl(item.id),
          });
        }
        if (canManage.value) {
          menu.push({
            label: deleteAction$(),
            danger: true,
            onClick: () => askDelete('support', item),
          });
        }
        return menu;
      }

      // ---------- Quizzes ----------

      function quizMenu(item) {
        if (!canManage.value) {
          return [];
        }
        return [
          {
            label: item.published ? unpublishAction$() : publishAction$(),
            onClick: () => togglePublished(item),
          },
          { label: deleteAction$(), danger: true, onClick: () => askDelete('quiz', item) },
        ];
      }

      async function togglePublished(item) {
        const status = item.published ? 'draft' : 'published';
        try {
          await api.updateQuiz(item.id, { status });
          createSnackbar(status === 'published' ? quizPublished$() : quizUnpublished$());
          await refresh();
        } catch (e) {
          createSnackbar(item.questions ? saveError$() : quizNeedsQuestions$());
        }
      }

      // ---------- Deletion ----------

      const pendingDelete = ref(null);
      const deleting = ref(false);

      function askDelete(type, item) {
        pendingDelete.value =
          type === 'support'
            ? {
                type,
                item,
                title: deleteSupportTitle$(),
                message: deleteSupportConfirm$({ name: item.title }),
              }
            : {
                type,
                item,
                title: deleteQuizTitle$(),
                message: deleteQuizConfirm$({ name: item.title }),
              };
      }

      async function confirmDelete() {
        const { type, item } = pendingDelete.value;
        deleting.value = true;
        try {
          if (type === 'support') {
            await api.deleteResource(item.id);
            createSnackbar(resourceDeleted$({ name: item.title }));
          } else {
            await api.deleteQuiz(item.id);
            createSnackbar(quizDeleted$({ name: item.title }));
          }
        } catch (e) {
          createSnackbar(saveError$());
        } finally {
          deleting.value = false;
          pendingDelete.value = null;
        }
        await refresh();
      }

      // ---------- Learners ----------

      const enrollPanelOpen = ref(false);
      const selectedLearners = ref([]);
      const enrolling = ref(false);

      const enrollable = computed(() => {
        const already = new Set(progress.value.map(entry => entry.learner));
        return facilityLearners.value
          .filter(user => !isStaffUser(user) && !already.has(user.id))
          .map(user => ({
            id: user.id,
            fullName: user.full_name || user.username,
            username: user.username,
            meta: user.username,
          }))
          .sort((a, b) => collator.compare(a.fullName, b.fullName));
      });

      async function openEnrollPanel() {
        enrollAlert.value = null;
        selectedLearners.value = [];
        enrollPanelOpen.value = true;
        facilityLearners.value = await FacilityUserResource.fetchCollection({
          getParams: { member_of: userFacilityId.value },
          force: true,
        }).catch(() => []);
      }

      async function enrollLearners() {
        enrolling.value = true;
        const results = await Promise.allSettled(
          selectedLearners.value.map(learner =>
            api.createEnrollment({
              training: route.params.trainingId,
              learner,
              status: 'active',
            }),
          ),
        );
        enrolling.value = false;
        const enrolled = results.filter(result => result.status === 'fulfilled').length;
        const failed = results.length - enrolled;
        if (enrolled) {
          createSnackbar(learnersEnrolled$({ count: enrolled }));
        }
        if (failed) {
          // Keep the panel open with the learners still to enroll.
          selectedLearners.value = selectedLearners.value.filter(
            (learner, index) => results[index].status !== 'fulfilled',
          );
          enrollAlert.value = { kind: 'error', text: learnersEnrollFailed$({ count: failed }) };
        } else {
          enrollPanelOpen.value = false;
        }
        await refresh();
      }

      // ---------- Header action of each tab ----------

      const tabAction = computed(() => {
        if (tab.value === 'supports') {
          return { label: addSupportsTitle$(), icon: 'upload', onClick: openAddPanel };
        }
        if (tab.value === 'quizzes') {
          return { label: newQuizAction$(), to: editorRoute('nouveau') };
        }
        return { label: enrollLearnersTitle$(), icon: 'userPlus', onClick: openEnrollPanel };
      });

      // ---------- Admin: change the course ----------

      const editing = ref(null);

      function onCourseSaved(updated) {
        editing.value = null;
        training.value = { ...training.value, ...updated };
        loadTrainers();
      }

      watch(
        () => route.params.trainingId,
        (id, previous) => {
          if (id && id !== previous) {
            refresh();
          }
        },
      );

      onMounted(() => {
        loadTrainers();
        refresh();
      });

      return {
        ...templateStrings,
        api,
        isAdminSpace,
        listRoute,
        listLabel,
        training,
        canManage,
        loading,
        errorMessage,
        trainerNote,
        statusLabel,
        tab,
        tabs,
        currentTab,
        rows,
        selectTab,
        moveTab,
        tabAction,
        refresh,
        viewing,
        addPanelOpen,
        addMode,
        files,
        uploading,
        readyFiles,
        link,
        linkError,
        addAlert,
        enrollAlert,
        linkIsYoutube,
        closeAddPanel,
        uploadFiles,
        addLink,
        supportMenu,
        quizMenu,
        pendingDelete,
        deleting,
        confirmDelete,
        enrollPanelOpen,
        selectedLearners,
        enrolling,
        enrollable,
        enrollLearners,
        editing,
        onCourseSaved,
      };
    },
  };

</script>


<style lang="scss" scoped>

  @import '../../styles/components';

  .ae-course-secondary {
    @include ae-button-outline;

    min-height: 48px;
    font-size: 17px;
  }

  /* ---------- Tabs ---------- */

  .ae-course-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .ae-course-tab {
    display: inline-flex;
    gap: 10px;
    align-items: center;
    min-height: 48px;
    padding: 0 18px;
    font: inherit;
    font-size: 17px;
    font-weight: 700;
    color: var(--ae-navy);
    cursor: pointer;
    background: var(--ae-surface);
    border: 1.5px solid var(--ae-line);
    border-radius: 999px;

    &:hover {
      border-color: var(--ae-field-line);
    }

    @include ae-focus-ring;
  }

  .ae-course-tab-on,
  .ae-course-tab-on:hover {
    color: var(--ae-orange-ink);
    background: var(--ae-orange-wash);
    border-color: var(--ae-orange);
  }

  .ae-course-tab-count {
    min-width: 28px;
    padding: 2px 8px;
    font-size: 14px;
    text-align: center;
    background: var(--ae-surface-muted);
    border-radius: 999px;
  }

  .ae-course-tab-on .ae-course-tab-count {
    color: #ffffff;
    background: var(--ae-orange);
  }

  /* ---------- Rows ---------- */

  .ae-course-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
    line-height: 1.3;
  }

  .ae-course-sub {
    overflow: hidden;
    font-size: 14px;
    color: var(--ae-text-subtle);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ae-course-kind-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    color: #4a4fc4;
    background: var(--ae-kpi-blue);
    border-radius: 50%;
  }

  .ae-course-kind-video,
  .ae-course-kind-youtube {
    color: #b3261e;
    background: var(--ae-kpi-red);
  }

  .ae-course-kind-audio {
    color: #7b2fb0;
    background: var(--ae-kpi-purple);
  }

  .ae-course-kind-image {
    color: #0f766e;
    background: var(--ae-kpi-mint);
  }

  .ae-course-kind-pdf,
  .ae-course-kind-quiz {
    color: var(--ae-orange-ink);
    background: var(--ae-orange-wash);
  }

  .ae-course-kind-exam {
    color: #8a5a00;
    background: var(--ae-kpi-yellow);
  }

  .ae-course-pill {
    display: inline-block;
    padding: 4px 12px;
    font-size: 14px;
    font-weight: 700;
    border-radius: 999px;
  }

  .ae-course-pill-quiz {
    color: var(--ae-orange-deep);
    background: var(--ae-orange-wash);
  }

  .ae-course-pill-exam {
    color: #8a5a00;
    background: var(--ae-kpi-yellow);
  }

  .ae-course-pill-on {
    color: #1b6e3c;
    background: var(--ae-kpi-green);
  }

  .ae-course-pill-off {
    color: var(--ae-text-muted);
    background: var(--ae-surface-muted);
  }

  .ae-course-progress {
    display: inline-flex;
    gap: 10px;
    align-items: center;
  }

  .ae-course-bar {
    display: block;
    width: 120px;
    height: 10px;
    overflow: hidden;
    background: var(--ae-surface-muted);
    border-radius: 999px;
  }

  .ae-course-bar-fill {
    display: block;
    height: 100%;
    background: var(--ae-orange);
    border-radius: 999px;
  }

  .ae-course-bar-done {
    background: #1b7f45;
  }

  .ae-course-percent {
    min-width: 44px;
    font-weight: 700;
    color: var(--ae-navy);
  }

  .ae-course-exam {
    display: inline-flex;
    gap: 6px;
    align-items: center;
  }

  .ae-course-exam-passed {
    font-weight: 700;
    color: #1b6e3c;
  }

  /* ---------- Panels ---------- */

  .ae-course-switch {
    display: flex;
    gap: 8px;
    padding: 4px;
    margin: 16px 0;
    background: var(--ae-surface-muted);
    border-radius: 999px;

    button {
      display: inline-flex;
      flex: 1;
      gap: 8px;
      align-items: center;
      justify-content: center;
      min-height: 44px;
      font: inherit;
      font-size: 16px;
      font-weight: 700;
      color: var(--ae-text-muted);
      cursor: pointer;
      background: transparent;
      border: 0;
      border-radius: 999px;

      @include ae-focus-ring;
    }
  }

  .ae-course-switch .ae-course-switch-on {
    color: var(--ae-orange-ink);
    background: var(--ae-surface);
    box-shadow: 0 2px 8px -4px rgba(31, 29, 61, 0.35);
  }

  .ae-course-hint {
    margin: 6px 0 0;
    font-size: 14px;
    color: var(--ae-text-subtle);
  }

  .ae-course-enroll {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  @media (min-width: 900px) and (max-height: 799px) {
    .ae-course-tab {
      min-height: 42px;
      font-size: 16px;
    }
  }

  @media (max-width: 1279px) {
    .ae-course-bar {
      width: 80px;
    }
  }

</style>
