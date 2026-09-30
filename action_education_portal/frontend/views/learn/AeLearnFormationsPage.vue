<template>

  <div class="ae-courses">
    <AePageHeader
      :title="myCourses$()"
      :countLabel="isLoading ? '' : coursesCount$({ count: cards.length })"
      :subtitle="learnCoursesSubtitle$()"
    />

    <div class="ae-courses-toolbar">
      <div
        class="ae-courses-filters"
        role="group"
        :aria-label="learnCoursesFilterLabel$()"
      >
        <button
          v-for="filter in filters"
          :key="filter.id"
          type="button"
          class="ae-courses-filter"
          :class="{ 'ae-courses-filter-on': activeFilter === filter.id }"
          :aria-pressed="activeFilter === filter.id ? 'true' : 'false'"
          @click="activeFilter = filter.id"
        >
          <span>{{ filter.label }}</span>
          <span class="ae-courses-filter-count">{{ filter.count }}</span>
        </button>
      </div>
      <label class="ae-courses-search">
        <AeIcon
          name="search"
          class="ae-courses-search-icon"
          :size="20"
        />
        <span class="ae-courses-visually-hidden">{{ coursesSearchLabel$() }}</span>
        <input
          v-model="query"
          type="search"
          autocomplete="off"
          :placeholder="coursesSearchPlaceholder$()"
        >
      </label>
    </div>

    <KCircularLoader
      v-if="isLoading"
      :delay="false"
    />
    <div
      v-else-if="loadError"
      class="ae-courses-alert"
      role="alert"
    >
      <p>{{ errorMessage }}</p>
      <button
        type="button"
        class="ae-courses-outline"
        @click="refresh"
      >
        {{ retryAction$() }}
      </button>
    </div>
    <p
      v-else-if="!cards.length"
      class="ae-courses-empty"
    >
      {{ emptyFormationsLearner$() }}
    </p>
    <p
      v-else-if="!shownCards.length"
      class="ae-courses-empty"
    >
      {{ coursesNoMatch$() }}
    </p>

    <template v-else>
      <div
        ref="gridArea"
        class="ae-courses-area"
      >
        <ul class="ae-courses-grid">
          <li
            v-for="card in pageCards"
            :key="card.id"
            class="ae-courses-card"
          >
            <div
              class="ae-courses-card-band"
              :class="`ae-courses-tone-${card.tone}`"
              aria-hidden="true"
            >
              <AeIcon
                name="bookOpen"
                :size="28"
              />
              <span
                v-if="card.certified"
                class="ae-courses-card-award"
              >
                <AeIcon
                  name="award"
                  :size="18"
                />
              </span>
            </div>
            <div class="ae-courses-card-body">
              <p class="ae-courses-card-status">
                <span
                  class="ae-courses-pill"
                  :class="`ae-courses-pill-${card.state}`"
                >{{ card.stateLabel }}</span>
                <span
                  v-if="card.certified"
                  class="ae-courses-pill ae-courses-pill-certified"
                >{{ learnCourseCertified$() }}</span>
              </p>
              <h2 class="ae-courses-card-title">
                {{ card.title }}
              </h2>
              <p
                v-if="card.trainer"
                class="ae-courses-card-trainer"
              >
                {{ learnCourseTrainer$({ name: card.trainer }) }}
              </p>
              <p class="ae-courses-card-contents">
                {{ card.contents }}
              </p>
              <div class="ae-courses-card-progress">
                <span
                  class="ae-courses-meter"
                  role="progressbar"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  :aria-valuenow="card.percent"
                  :aria-label="progressOf$({ name: card.title })"
                >
                  <span
                    class="ae-courses-meter-fill"
                    :style="{ width: `${card.percent}%` }"
                  ></span>
                </span>
                <span class="ae-courses-percent">{{ card.percent }} %</span>
              </div>
              <router-link
                class="ae-courses-open"
                :class="{ 'ae-courses-open-quiet': card.state === 'done' }"
                :to="{ name: 'AeLearnCourseDetail', params: { trainingId: card.id } }"
                :aria-label="learnCourseActionOf$({ action: card.actionLabel, name: card.title })"
              >
                <span>{{ card.actionLabel }}</span>
                <AeIcon
                  name="arrowRight"
                  :size="18"
                />
              </router-link>
            </div>
          </li>
        </ul>
      </div>

      <footer
        v-if="pageCount > 1"
        class="ae-courses-foot"
      >
        <span>{{ pageRange$({ start: pageStart + 1, end: pageEnd, total: shownCards.length }) }}</span>
        <span class="ae-courses-pager">
          <button
            type="button"
            class="ae-courses-page-btn"
            :disabled="page === 1"
            :aria-label="previousPage$()"
            @click="page -= 1"
          >
            <AeIcon
              name="chevronLeft"
              :size="18"
            />
          </button>
          <button
            type="button"
            class="ae-courses-page-btn"
            :disabled="page === pageCount"
            :aria-label="nextPage$()"
            @click="page += 1"
          >
            <AeIcon
              name="chevronRight"
              :size="18"
            />
          </button>
        </span>
      </footer>
    </template>
  </div>

</template>


<script>

  import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
  import { currentLanguage } from 'kolibri/utils/i18n';
  import { portalStrings } from '../../strings';
  import { useTrainingApi } from '../../composables/useTrainingApi';
  import { useAsyncPageLoad } from '../../composables/useAsyncPageLoad';
  import AeIcon from '../AeIcon';
  import AePageHeader from '../AePageHeader';

  const TEMPLATE_STRINGS = [
    'myCourses$',
    'coursesCount$',
    'learnCoursesSubtitle$',
    'learnCoursesFilterLabel$',
    'coursesSearchLabel$',
    'coursesSearchPlaceholder$',
    'retryAction$',
    'emptyFormationsLearner$',
    'coursesNoMatch$',
    'learnCourseCertified$',
    'learnCourseTrainer$',
    'progressOf$',
    'learnCourseActionOf$',
    'pageRange$',
    'previousPage$',
    'nextPage$',
  ];

  const TONES = ['orange', 'blue', 'green', 'purple', 'mint', 'yellow'];
  // Same breakpoint as AeSpaceLayout: on computers the page never scrolls.
  const FIT_MEDIA = '(min-width: 900px) and (min-height: 640px)';
  const CARD_MIN_WIDTH = 270;
  const GRID_GAP = 16;

  function normalize(text) {
    return String(text || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase();
  }

  /** The published courses, as cards with the learner's progress and what to do next. */
  export default {
    name: 'AeLearnFormationsPage',
    components: { AeIcon, AePageHeader },
    setup() {
      const {
        learnFilterAll$,
        learnFilterNew$,
        learnFilterActive$,
        learnFilterDone$,
        learnCourseStatusNew$,
        learnCourseStatusActive$,
        learnCourseStatusDone$,
        learnCourseActionStart$,
        learnCourseActionContinue$,
        learnCourseActionReview$,
        contentSummary$,
        quizKindExam$,
        loadError$,
        loadTimeout$,
      } = portalStrings;
      const templateStrings = Object.fromEntries(
        TEMPLATE_STRINGS.map(name => [name, portalStrings[name]]),
      );

      const api = useTrainingApi();
      const { isLoading, loadError, runLoad } = useAsyncPageLoad('isLoadingLearnerCourses');

      const trainings = ref([]);
      const progress = ref([]);
      const query = ref('');
      const activeFilter = ref('all');
      const page = ref(1);
      const pageSize = ref(6);
      const gridArea = ref(null);

      const errorMessage = computed(() => {
        if (!loadError.value) {
          return '';
        }
        return loadError.value.code === 'AE_REQUEST_TIMEOUT' ? loadTimeout$() : loadError$();
      });

      const collator = new Intl.Collator(currentLanguage, { sensitivity: 'base' });

      const cards = computed(() => {
        const byTraining = {};
        progress.value.forEach(row => {
          byTraining[row.training] = row;
        });
        return trainings.value
          .map((training, index) => {
            const row = byTraining[training.id] || {};
            let state = 'new';
            if (row.completed) {
              state = 'done';
            } else if (row.started) {
              state = 'active';
            }
            const contents = [
              contentSummary$({ files: row.resources_total || 0, quizzes: row.quizzes_total || 0 }),
            ];
            if (row.has_exam) {
              contents.push(quizKindExam$());
            }
            return {
              id: training.id,
              title: training.title,
              trainer: training.responsible_name || '',
              contents: contents.join(' · '),
              percent: row.percent || 0,
              certified: Boolean(row.certificate_number),
              state,
              stateLabel: {
                new: learnCourseStatusNew$,
                active: learnCourseStatusActive$,
                done: learnCourseStatusDone$,
              }[state](),
              actionLabel: {
                new: learnCourseActionStart$,
                active: learnCourseActionContinue$,
                done: learnCourseActionReview$,
              }[state](),
              tone: TONES[index % TONES.length],
              lastActivity: row.last_activity ? new Date(row.last_activity).getTime() : 0,
            };
          })
          .sort(
            // Courses in progress first, most recent activity first.
            (a, b) =>
              (b.state === 'active') - (a.state === 'active') ||
              b.lastActivity - a.lastActivity ||
              collator.compare(a.title, b.title),
          );
      });

      const filters = computed(() =>
        [
          { id: 'all', label: learnFilterAll$() },
          { id: 'new', label: learnFilterNew$() },
          { id: 'active', label: learnFilterActive$() },
          { id: 'done', label: learnFilterDone$() },
        ].map(filter => ({
          ...filter,
          count:
            filter.id === 'all'
              ? cards.value.length
              : cards.value.filter(card => card.state === filter.id).length,
        })),
      );

      const shownCards = computed(() => {
        const needle = normalize(query.value.trim());
        return cards.value.filter(
          card =>
            (activeFilter.value === 'all' || card.state === activeFilter.value) &&
            (!needle || normalize(`${card.title} ${card.trainer}`).includes(needle)),
        );
      });

      const pageCount = computed(() =>
        Math.max(1, Math.ceil(shownCards.value.length / pageSize.value)),
      );
      const pageStart = computed(() => (page.value - 1) * pageSize.value);
      const pageEnd = computed(() =>
        Math.min(shownCards.value.length, pageStart.value + pageSize.value),
      );
      const pageCards = computed(() => shownCards.value.slice(pageStart.value, pageEnd.value));

      watch([query, activeFilter], () => {
        page.value = 1;
      });
      watch(pageCount, count => {
        page.value = Math.min(page.value, count);
      });

      // On computers, as many cards as the room left can show without scrolling.
      let fitQuery = null;
      let resizeObserver = null;

      function measure() {
        const area = gridArea.value;
        if (!area || !fitQuery || !fitQuery.matches) {
          pageSize.value = 6;
          return;
        }
        // The tallest card, since each grid row is as tall as its tallest card.
        const heights = [...area.querySelectorAll('.ae-courses-card')].map(
          card => card.offsetHeight,
        );
        const cardHeight = heights.length ? Math.max(...heights) : 300;
        const columns = Math.max(
          1,
          Math.floor((area.clientWidth + GRID_GAP) / (CARD_MIN_WIDTH + GRID_GAP)),
        );
        const rows = Math.max(1, Math.floor((area.clientHeight + GRID_GAP) / (cardHeight + GRID_GAP)));
        pageSize.value = columns * rows;
      }

      watch(
        gridArea,
        (element, previous) => {
          if (resizeObserver) {
            if (previous) {
              resizeObserver.unobserve(previous);
            }
            if (element) {
              resizeObserver.observe(element);
            }
          }
          measure();
        },
        { flush: 'post' },
      );

      async function refresh() {
        try {
          await runLoad(async () => {
            const [list, mine] = await Promise.all([
              api.fetchTrainings(),
              api.fetchMyProgress().catch(() => []),
            ]);
            trainings.value = (list || []).filter(training => training.status === 'published');
            progress.value = mine || [];
          });
        } catch (e) {
          trainings.value = [];
          progress.value = [];
        }
      }

      onMounted(() => {
        fitQuery = window.matchMedia ? window.matchMedia(FIT_MEDIA) : null;
        if (fitQuery) {
          fitQuery.addEventListener('change', measure);
        }
        if (window.ResizeObserver) {
          resizeObserver = new ResizeObserver(measure);
          if (gridArea.value) {
            resizeObserver.observe(gridArea.value);
          }
        }
        refresh();
      });

      onBeforeUnmount(() => {
        if (fitQuery) {
          fitQuery.removeEventListener('change', measure);
        }
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
      });

      return {
        ...templateStrings,
        isLoading,
        loadError,
        errorMessage,
        cards,
        filters,
        activeFilter,
        query,
        shownCards,
        pageCards,
        page,
        pageCount,
        pageStart,
        pageEnd,
        gridArea,
        refresh,
      };
    },
  };

</script>


<style lang="scss" scoped>

  @import '../../styles/tokens';
  @import '../../styles/components';

  .ae-courses-visually-hidden {
    @include ae-visually-hidden;
  }

  .ae-courses {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .ae-courses-outline {
    @include ae-button-outline;
  }

  .ae-courses-alert {
    @include ae-card;

    color: var(--ae-danger);
  }

  .ae-courses-empty {
    @include ae-card;

    margin: 0;
    font-size: 17px;
    color: var(--ae-text-muted);
  }

  /* ---------- Toolbar ---------- */

  .ae-courses-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
  }

  .ae-courses-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 4px;
    background: var(--ae-surface);
    border: 1px solid var(--ae-line);
    border-radius: 999px;
  }

  .ae-courses-filter {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    min-height: 38px;
    padding: 0 14px;
    font: inherit;
    font-size: 15px;
    font-weight: 700;
    color: var(--ae-text-muted);
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 999px;

    @include ae-focus-ring;
  }

  .ae-courses-filter-on {
    color: #ffffff;
    background: var(--ae-navy);
  }

  .ae-courses-filter-count {
    min-width: 24px;
    padding: 1px 7px;
    font-size: 13px;
    color: var(--ae-text);
    background: var(--ae-surface-muted);
    border-radius: 999px;
  }

  .ae-courses-search {
    position: relative;
    flex: 0 1 340px;

    input {
      @include ae-field;

      height: 44px;
      padding-inline-start: 44px;
    }
  }

  .ae-courses-search-icon {
    position: absolute;
    top: 12px;
    inset-inline-start: 14px;
    color: var(--ae-text-subtle);
  }

  /* ---------- Cards ---------- */

  .ae-courses-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
    gap: 16px;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .ae-courses-card {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--ae-surface);
    border: 1px solid var(--ae-line);
    border-radius: var(--ae-radius-lg);
    box-shadow: var(--ae-shadow-card);
  }

  .ae-courses-card-band {
    position: relative;
    display: flex;
    align-items: center;
    height: 44px;
    padding: 0 18px;
  }

  .ae-courses-card-award {
    position: absolute;
    top: 5px;
    inset-inline-end: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    color: var(--ae-orange-deep);
    background: #ffffff;
    border-radius: 50%;
  }

  .ae-courses-tone-orange {
    color: var(--ae-orange-deep);
    background: var(--ae-orange-wash);
  }

  .ae-courses-tone-blue {
    color: #1f5f99;
    background: var(--ae-kpi-blue);
  }

  .ae-courses-tone-green {
    color: #1b6e3c;
    background: var(--ae-kpi-green);
  }

  .ae-courses-tone-purple {
    color: #6d2e7f;
    background: var(--ae-kpi-purple);
  }

  .ae-courses-tone-mint {
    color: #176b63;
    background: var(--ae-kpi-mint);
  }

  .ae-courses-tone-yellow {
    color: var(--ae-orange-deep);
    background: var(--ae-kpi-yellow);
  }

  .ae-courses-card-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 4px;
    padding: 12px 18px 14px;
  }

  .ae-courses-card-status {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 0;
  }

  .ae-courses-pill {
    padding: 2px 10px;
    font-size: 13px;
    font-weight: 800;
    border-radius: 999px;
  }

  .ae-courses-pill-new {
    color: #1f5f99;
    background: var(--ae-kpi-blue);
  }

  .ae-courses-pill-active {
    color: var(--ae-orange-deep);
    background: var(--ae-orange-wash);
  }

  .ae-courses-pill-done {
    color: #1b6e3c;
    background: var(--ae-kpi-green);
  }

  .ae-courses-pill-certified {
    color: var(--ae-orange-deep);
    background: var(--ae-kpi-yellow);
  }

  .ae-courses-card-title {
    display: -webkit-box;
    margin: 0;
    overflow: hidden;
    font-size: 19px;
    font-weight: 800;
    line-height: 1.25;
    color: var(--ae-navy);
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .ae-courses-card-trainer,
  .ae-courses-card-contents {
    margin: 0;
    font-size: 14px;
    color: var(--ae-text-muted);
  }

  .ae-courses-card-progress {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-top: auto;
    padding-top: 4px;
  }

  .ae-courses-meter {
    flex: 1;
    height: 10px;
    overflow: hidden;
    background: var(--ae-surface-muted);
    border-radius: 999px;
  }

  .ae-courses-meter-fill {
    display: block;
    height: 100%;
    background: var(--ae-orange);
    border-radius: 999px;
  }

  .ae-courses-percent {
    font-size: 14px;
    font-weight: 800;
    color: var(--ae-text);
  }

  .ae-courses-open {
    @include ae-button-primary;

    min-height: 40px;
    margin-top: 6px;
    font-size: 16px;
  }

  .ae-courses-open-quiet {
    color: var(--ae-orange-ink);
    background: var(--ae-orange-wash);

    &:hover:not(:disabled) {
      color: #ffffff;
    }
  }

  /* ---------- Pager ---------- */

  .ae-courses-foot {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: flex-end;
    font-size: 15px;
    color: var(--ae-text-muted);
  }

  .ae-courses-pager {
    display: inline-flex;
    gap: 6px;
  }

  .ae-courses-page-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    color: var(--ae-navy);
    cursor: pointer;
    background: var(--ae-surface);
    border: 1px solid var(--ae-line);
    border-radius: var(--ae-radius-sm);

    &:disabled {
      cursor: default;
      opacity: 0.4;
    }

    @include ae-focus-ring;
  }

  // Computers: the page never scrolls; the grid shows what fits, the pager the rest.
  @media (min-width: 900px) and (min-height: 640px) {
    .ae-courses {
      flex: 1 1 auto;
      min-height: 0;
    }

    .ae-courses-area {
      flex: 1 1 0;
      min-height: 0;
      overflow: hidden;
    }
  }

  @media (min-width: 900px) and (max-height: 799px) {
    .ae-courses {
      gap: 12px;
    }

    .ae-courses-card-band {
      height: 44px;
    }

    .ae-courses-card-body {
      gap: 4px;
      padding: 10px 14px 12px;
    }
  }

</style>
