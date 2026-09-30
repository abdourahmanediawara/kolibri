<template>

  <div class="ae-res">
    <AePageHeader
      :title="node ? node.title : libraryTitle$()"
      :crumbs="crumbs"
      :back="{ label: libraryTitle$(), to: { name: libraryRoute } }"
      :countLabel="kindLabel"
      :subtitle="node && node.description ? node.description : ''"
    />

    <KCircularLoader
      v-if="loading"
      :delay="false"
    />
    <div
      v-else-if="loadFailed"
      class="ae-res-alert"
      role="alert"
    >
      <p>{{ loadError$() }}</p>
      <button
        type="button"
        class="ae-res-outline"
        @click="load"
      >
        {{ retryAction$() }}
      </button>
    </div>

    <!-- A folder: its resources as cards -->
    <template v-else-if="node && !node.is_leaf">
      <p
        v-if="!children.length"
        class="ae-res-empty"
      >
        {{ catalogEmpty$() }}
      </p>
      <div
        v-else
        class="ae-res-area"
      >
        <ul class="ae-res-grid">
          <li
            v-for="child in children"
            :key="child.id"
          >
            <router-link
              class="ae-res-card"
              :to="{ name: resourceRoute, params: { nodeId: child.id } }"
            >
              <span
                class="ae-res-thumb"
                :class="`ae-res-tone-${child.tone}`"
              >
                <img
                  v-if="child.thumbnail"
                  :src="child.thumbnail"
                  alt=""
                >
                <AeIcon
                  v-else
                  :name="child.icon"
                  :size="36"
                />
              </span>
              <span class="ae-res-card-text">
                <span class="ae-res-card-kind">{{ child.kindLabel }}</span>
                <span class="ae-res-card-title">{{ child.title }}</span>
              </span>
              <AeIcon
                name="chevronRight"
                class="ae-res-card-chevron"
                :size="20"
              />
            </router-link>
          </li>
        </ul>
      </div>
    </template>

    <!-- An exercise: Kolibri's exercise player -->
    <section
      v-else-if="node && node.assessmentmetadata"
      class="ae-res-card-panel ae-res-exercise"
    >
      <AeIcon
        name="listChecks"
        :size="44"
      />
      <p>{{ libraryExerciseText$() }}</p>
      <a
        class="ae-res-primary"
        :href="kolibriHref"
      >
        <span>{{ libraryExerciseAction$() }}</span>
        <AeIcon
          name="arrowRight"
          :size="18"
        />
      </a>
    </section>

    <!-- A resource: played in the page, progress saved as in Kolibri -->
    <section
      v-else-if="node"
      class="ae-res-card-panel ae-res-player"
      :aria-label="node.title"
    >
      <p
        v-if="finished"
        class="ae-res-done"
        role="status"
      >
        <AeIcon
          name="circleCheck"
          :size="20"
        />
        <span>{{ libraryResourceDone$() }}</span>
      </p>
      <div class="ae-res-viewer">
        <ContentViewer
          v-if="sessionReady"
          :lang="node.lang"
          :files="node.files"
          :options="node.options"
          :duration="node.duration"
          :extraFields="extra_fields"
          :progress="progress"
          :userId="currentUserId"
          :userFullName="full_name"
          :timeSpent="time_spent"
          @startTracking="startTrackingProgress"
          @stopTracking="stopTrackingProgress"
          @updateProgress="value => track({ progress: value })"
          @addProgress="value => track({ progressDelta: value })"
          @updateContentState="value => track({ contentState: value })"
          @error="errored = true"
          @finished="finished = true"
        />
        <KCircularLoader
          v-else
          :delay="false"
        />
      </div>
    </section>
  </div>

</template>


<script>

  import { computed, onMounted, ref, watch } from 'vue';
  import { useRoute } from 'vue-router/composables';
  import { ContentNodeKinds } from 'kolibri/constants';
  import useUser from 'kolibri/composables/useUser';
  import ContentNodeResource from 'kolibri-common/apiResources/ContentNodeResource';
  // Kolibri Learn's tracking: the same content sessions and progress as in Learn.
  import useProgressTracking from '../../../../kolibri/plugins/learn/frontend/composables/useProgressTracking';
  import { portalStrings } from '../../strings';
  import { useLearnContent } from '../../composables/useLearnContent';
  import AeIcon from '../AeIcon';
  import AePageHeader from '../AePageHeader';

  /**
   * One library item inside the AE space: a folder shows its resources as cards,
   * a resource plays in the page with Kolibri's viewer.
   */
  export default {
    name: 'AeLearnResourcePage',
    components: { AeIcon, AePageHeader },
    setup() {
      const {
        libraryTitle$,
        loadError$,
        retryAction$,
        catalogEmpty$,
        libraryExerciseText$,
        libraryExerciseAction$,
        libraryResourceDone$,
        libraryCollections$,
        typeVideo$,
        typeDocument$,
        typeAudio$,
        typeHtml5$,
        typeExercise$,
        kindFile$,
      } = portalStrings;
      const KINDS = {
        [ContentNodeKinds.TOPIC]: { label: libraryCollections$, icon: 'bookOpen', tone: 'orange' },
        [ContentNodeKinds.VIDEO]: { label: typeVideo$, icon: 'squarePlay', tone: 'red' },
        [ContentNodeKinds.DOCUMENT]: { label: typeDocument$, icon: 'fileText', tone: 'blue' },
        [ContentNodeKinds.AUDIO]: { label: typeAudio$, icon: 'headphones', tone: 'purple' },
        [ContentNodeKinds.HTML5]: { label: typeHtml5$, icon: 'globe', tone: 'mint' },
        [ContentNodeKinds.EXERCISE]: { label: typeExercise$, icon: 'listChecks', tone: 'yellow' },
      };
      function kindOf(kind) {
        return KINDS[kind] || { label: kindFile$, icon: 'fileText', tone: 'blue' };
      }

      const route = useRoute();
      const { currentUserId, full_name } = useUser();
      const { exerciseHref } = useLearnContent();
      // Each space has its own library pages (see the route meta).
      const libraryRoute = computed(() => route.meta.libraryRoute || 'AeLearnLibrary');
      const resourceRoute = computed(() => route.meta.resourceRoute || 'AeLearnResource');
      const {
        progress,
        time_spent,
        extra_fields,
        initContentSession,
        updateContentSession,
        startTrackingProgress,
        stopTrackingProgress,
      } = useProgressTracking();

      const node = ref(null);
      const children = ref([]);
      const loading = ref(true);
      const loadFailed = ref(false);
      const sessionReady = ref(false);
      const errored = ref(false);
      const finished = ref(false);

      const kindLabel = computed(() => (node.value ? kindOf(node.value.kind).label() : ''));
      const kolibriHref = computed(() => (node.value ? exerciseHref(node.value.id) : ''));

      // Folders above this one, below the library.
      const crumbs = computed(() =>
        ((node.value && node.value.ancestors) || []).map(ancestor => ({
          label: ancestor.title,
          to: { name: resourceRoute.value, params: { nodeId: ancestor.id } },
        })),
      );

      function track(data) {
        if (!errored.value) {
          updateContentSession(data);
        }
      }

      async function load() {
        loading.value = true;
        loadFailed.value = false;
        sessionReady.value = false;
        errored.value = false;
        finished.value = false;
        try {
          const found = await ContentNodeResource.fetchModel({
            id: route.params.nodeId,
            force: true,
          });
          node.value = found;
          if (!found.is_leaf) {
            const list = await ContentNodeResource.fetchCollection({
              getParams: { parent: found.id },
            });
            const items = Array.isArray(list) ? list : (list && list.results) || [];
            children.value = items.map(child => ({
              id: child.id,
              title: child.title,
              thumbnail: child.thumbnail || '',
              kindLabel: kindOf(child.kind).label(),
              icon: kindOf(child.kind).icon,
              tone: kindOf(child.kind).tone,
            }));
          }
        } catch (e) {
          loadFailed.value = true;
          return;
        } finally {
          loading.value = false;
        }
        if (node.value.is_leaf && !node.value.assessmentmetadata) {
          try {
            await initContentSession({ node: node.value });
          } catch (e) {
            // The resource still plays; only its progress is not saved.
            errored.value = true;
          }
          finished.value = progress.value >= 1;
          sessionReady.value = true;
        }
      }

      watch(
        () => route.params.nodeId,
        () => {
          stopTrackingProgress();
          load();
        },
      );
      onMounted(load);

      return {
        libraryTitle$,
        loadError$,
        retryAction$,
        catalogEmpty$,
        libraryExerciseText$,
        libraryExerciseAction$,
        libraryResourceDone$,
        node,
        children,
        loading,
        loadFailed,
        sessionReady,
        errored,
        finished,
        kindLabel,
        kolibriHref,
        libraryRoute,
        resourceRoute,
        crumbs,
        progress,
        time_spent,
        extra_fields,
        currentUserId,
        full_name,
        startTrackingProgress,
        stopTrackingProgress,
        track,
        load,
      };
    },
  };

</script>


<style lang="scss" scoped>

  @import '../../styles/components';

  .ae-res {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .ae-res-outline {
    @include ae-button-outline;
  }

  .ae-res-primary {
    @include ae-button-primary;

    min-height: 46px;
    font-size: 17px;
  }

  .ae-res-alert {
    @include ae-card;

    color: var(--ae-danger);
  }

  .ae-res-empty {
    @include ae-card;

    margin: 0;
    color: var(--ae-text-muted);
  }

  .ae-res-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 12px;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .ae-res-card {
    display: flex;
    gap: 14px;
    align-items: center;
    padding: 10px 14px 10px 10px;
    color: var(--ae-text);
    text-decoration: none;
    background: var(--ae-surface);
    border: 1px solid var(--ae-line);
    border-radius: var(--ae-radius-md);
    box-shadow: var(--ae-shadow-card);

    &:hover {
      border-color: var(--ae-orange);
    }

    @include ae-focus-ring;
  }

  .ae-res-thumb {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 54px;
    overflow: hidden;
    border-radius: var(--ae-radius-sm);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .ae-res-tone-orange {
    color: var(--ae-orange-deep);
    background: var(--ae-orange-wash);
  }

  .ae-res-tone-red {
    color: #a3263a;
    background: var(--ae-kpi-red);
  }

  .ae-res-tone-blue {
    color: #1f5f99;
    background: var(--ae-kpi-blue);
  }

  .ae-res-tone-purple {
    color: #6d2e7f;
    background: var(--ae-kpi-purple);
  }

  .ae-res-tone-mint {
    color: #176b63;
    background: var(--ae-kpi-mint);
  }

  .ae-res-tone-yellow {
    color: var(--ae-orange-deep);
    background: var(--ae-kpi-yellow);
  }

  .ae-res-card-text {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
  }

  .ae-res-card-kind {
    font-size: 12px;
    font-weight: 800;
    color: var(--ae-text-subtle);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .ae-res-card-title {
    overflow: hidden;
    font-weight: 700;
    color: var(--ae-navy);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ae-res-card-chevron {
    flex-shrink: 0;
    color: var(--ae-text-subtle);
  }

  .ae-res-card-panel {
    @include ae-card;

    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px;
  }

  .ae-res-exercise {
    align-items: center;
    padding: 32px;
    color: var(--ae-orange);
    text-align: center;

    p {
      max-width: 36em;
      margin: 0;
      font-size: 17px;
      color: var(--ae-text-muted);
    }
  }

  .ae-res-done {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 8px 12px;
    margin: 0;
    font-weight: 800;
    color: #1b6e3c;
    background: var(--ae-kpi-green);
    border-radius: var(--ae-radius-sm);
  }

  .ae-res-viewer {
    position: relative;
    min-height: 60vh;
    overflow: hidden;
    border-radius: var(--ae-radius-md);
  }

  // Computers: the page never scrolls; the viewer and the folder list fill the room left.
  @media (min-width: 900px) and (min-height: 640px) {
    .ae-res {
      flex: 1 1 auto;
      min-height: 0;
    }

    .ae-res-area {
      flex: 1 1 0;
      min-height: 0;
      padding: 2px;
      overflow-y: auto;
    }

    .ae-res-player {
      flex: 1 1 auto;
      min-height: 0;
    }

    .ae-res-viewer {
      flex: 1 1 0;
      min-height: 0;

      /deep/ > * {
        height: 100%;
      }
    }
  }

</style>
