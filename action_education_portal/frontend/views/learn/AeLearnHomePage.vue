<template>
  <div
    class="ae-page"
    :style="{ color: $themeTokens.text }"
  >
    <header class="welcome">
      <h1 class="welcome-title">
        {{ greeting }}
      </h1>
      <p
        class="tagline"
        :style="{ color: $themeTokens.annotation }"
      >
        {{ tagline$() }}
      </p>
      <p
        class="status-line"
        :style="{ color: $themeTokens.annotation }"
      >
        {{ connectionStatus }}
      </p>
    </header>

    <p
      v-if="loadFailed"
      role="alert"
      class="error"
      :style="{ color: $themeTokens.error }"
    >
      {{ loadError$() }}
      <KButton
        :text="retryAction$()"
        appearance="flat-button"
        @click="loadHome"
      />
    </p>

    <section
      v-if="completedLabel || globalProgressLabel"
      class="stats"
      :style="{
        backgroundColor: $themeTokens.surface,
        borderColor: $themeTokens.fineLine,
      }"
    >
      <p v-if="completedLabel">
        {{ completedLabel }}
      </p>
      <p v-if="globalProgressLabel">
        {{ globalProgressLabel }}
      </p>
    </section>

    <section
      class="continue-card"
      :style="{
        backgroundColor: $themeTokens.surface,
        borderColor: $themeTokens.fineLine,
      }"
      aria-labelledby="continue-heading"
    >
      <h2
        id="continue-heading"
        class="section-title"
      >
        {{ continueTitle$() }}
      </h2>

      <KCircularLoader
        v-if="loading"
        :delay="false"
      />

      <template v-else-if="resumeItem">
        <p class="resume-title">
          {{ resumeItem.title }}
        </p>
        <p
          v-if="resumeProgressLabel"
          class="resume-meta"
          :style="{ color: $themeTokens.annotation }"
        >
          {{ resumeProgressLabel }}
        </p>
        <KButton
          :text="continueAction$()"
          :primary="true"
          :href="resumeHref"
        />
      </template>

      <template v-else>
        <p :style="{ color: $themeTokens.annotation }">
          {{ continueEmpty$() }}
        </p>
        <router-link
          :to="{ name: 'AeLearnFormations' }"
          class="explore-link"
          :style="{
            backgroundColor: $themeTokens.primary,
            color: $themeTokens.textInverted,
          }"
        >
          {{ exploreTrainings$() }}
        </router-link>
      </template>
    </section>

    <section
      v-if="recentItems.length"
      class="recent"
      aria-labelledby="recent-heading"
    >
      <h2
        id="recent-heading"
        class="section-title"
      >
        {{ recentTitle$() }}
      </h2>
      <div class="cards">
        <ContentCard
          v-for="item in recentItems"
          :key="item.id"
          :title="item.title"
          :href="item.href"
          :icon="item.icon"
          :thumbnail="item.thumbnail"
          :progressLabel="item.progressLabel"
        />
      </div>
    </section>

    <section
      class="shortcuts"
      :aria-label="shortcutsLabel$()"
    >
      <router-link
        v-for="item in shortcuts"
        :key="item.id"
        :to="item.to"
        class="shortcut"
        :style="{
          backgroundColor: $themeTokens.surface,
          borderColor: $themeTokens.fineLine,
          color: $themeTokens.text,
        }"
      >
        <KIcon
          :icon="item.icon"
          class="shortcut-icon"
          :style="{ fill: $themeTokens.primary }"
        />
        <span class="shortcut-text">
          <span class="shortcut-title">{{ item.title }}</span>
          <span
            class="shortcut-desc"
            :style="{ color: $themeTokens.annotation }"
          >
            {{ item.description }}
          </span>
        </span>
      </router-link>
    </section>
  </div>
</template>

<script>
  import { computed, onMounted, ref } from 'vue';
  import client from 'kolibri/client';
  import urls from 'kolibri/urls';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';
  import { useAeConnection } from '../../composables/useAeConnection';
  import { useLearnContent } from '../../composables/useLearnContent';
  import ContentCard from '../ContentCard';

  export default {
    name: 'AeLearnHomePage',
    components: {
      ContentCard,
    },
    setup() {
      const {
        greetingNamed$,
        greetingGeneric$,
        tagline$,
        localOnline$,
        offlineAvailable$,
        connectionOffline$,
        continueTitle$,
        continueEmpty$,
        exploreTrainings$,
        continueAction$,
        shortcutTrainings$,
        shortcutTrainingsDesc$,
        shortcutExplore$,
        shortcutExploreDesc$,
        shortcutQuizzes$,
        shortcutQuizzesDesc$,
        shortcutsLabel$,
        recentTitle$,
        completedCount$,
        globalProgress$,
        progressPercent$,
        loadError$,
        retryAction$,
      } = portalStrings;

      const { displayName, isUserLoggedIn } = useAePermissions();
      const { isOnline } = useAeConnection();
      const { contentHref, progressFraction } = useLearnContent();

      const loading = ref(true);
      const loadFailed = ref(false);
      const resumeItem = ref(null);
      const recentItems = ref([]);
      const completedLabel = ref('');
      const globalProgressLabel = ref('');

      const greeting = computed(() => {
        const name = displayName.value;
        return name ? greetingNamed$({ name }) : greetingGeneric$();
      });

      const connectionStatus = computed(() => {
        if (!isOnline.value) {
          return connectionOffline$();
        }
        return `${localOnline$()} · ${offlineAvailable$()}`;
      });

      const resumeHref = computed(() => {
        if (!resumeItem.value || !resumeItem.value.id) {
          return '';
        }
        return contentHref(resumeItem.value.id);
      });

      const resumeProgressLabel = computed(() => {
        const progress = resumeItem.value && resumeItem.value.progress_fraction;
        if (typeof progress !== 'number') {
          return '';
        }
        return progressPercent$({ percent: Math.round(progress * 100) });
      });

      const shortcuts = computed(() => [
        {
          id: 'formations',
          icon: 'lesson',
          title: shortcutTrainings$(),
          description: shortcutTrainingsDesc$(),
          to: { name: 'AeLearnFormations' },
        },
        {
          id: 'library',
          icon: 'library',
          title: shortcutExplore$(),
          description: shortcutExploreDesc$(),
          to: { name: 'AeLearnLibrary' },
        },
        {
          id: 'quizzes',
          icon: 'quiz',
          title: shortcutQuizzes$(),
          description: shortcutQuizzesDesc$(),
          to: { name: 'AeLearnQuizzes' },
        },
      ]);

      function buildProgressMap(progressList) {
        const map = {};
        (progressList || []).forEach(item => {
          if (item && item.content_id != null) {
            map[item.content_id] = item;
          }
        });
        return map;
      }

      function loadHome() {
        if (!isUserLoggedIn.value) {
          loading.value = false;
          return;
        }
        loading.value = true;
        loadFailed.value = false;
        client({ url: urls['kolibri:kolibri.plugins.learn:homehydrate']() })
          .then(response => {
            const payload = response.data || {};
            const resources = payload.resumable_resources || {};
            const nodes = resources.results || [];
            const progressList = payload.resumable_resources_progress || [];
            const progressMap = buildProgressMap(progressList);

            const fractions = [];
            let completed = 0;
            (progressList || []).forEach(entry => {
              const fraction = progressFraction(entry);
              if (typeof fraction === 'number') {
                fractions.push(fraction);
                if (fraction >= 1) {
                  completed += 1;
                }
              }
            });

            completedLabel.value = completed
              ? completedCount$({ count: completed })
              : '';
            if (fractions.length) {
              const avg =
                fractions.reduce((sum, value) => sum + value, 0) / fractions.length;
              globalProgressLabel.value = globalProgress$({
                percent: Math.round(avg * 100),
              });
            } else {
              globalProgressLabel.value = '';
            }

            const list = Array.isArray(nodes) ? nodes : [];
            const first = list[0] || null;
            if (first) {
              const progressEntry = progressList.find(
                item =>
                  item.content_id === first.content_id ||
                  item.contentnode_id === first.id ||
                  item.id === first.id,
              );
              resumeItem.value = {
                id: first.id,
                title: first.title,
                progress_fraction: progressFraction(progressEntry),
              };
            } else {
              resumeItem.value = null;
            }

            recentItems.value = list.slice(0, 3).map(node => {
              const progressEntry = progressMap[node.content_id];
              const fraction = progressFraction(progressEntry);
              return {
                id: node.id,
                title: node.title,
                href: contentHref(node.id),
                icon: 'lesson',
                thumbnail: node.thumbnail || node.thumbnail_url || '',
                progressLabel:
                  typeof fraction === 'number'
                    ? progressPercent$({ percent: Math.round(fraction * 100) })
                    : '',
              };
            });
          })
          .catch(() => {
            loadFailed.value = true;
          })
          .finally(() => {
            loading.value = false;
          });
      }

      onMounted(loadHome);

      return {
        greeting,
        tagline$,
        connectionStatus,
        continueTitle$,
        continueEmpty$,
        exploreTrainings$,
        continueAction$,
        shortcutsLabel$,
        recentTitle$,
        loadError$,
        retryAction$,
        loading,
        loadFailed,
        loadHome,
        resumeItem,
        resumeHref,
        resumeProgressLabel,
        recentItems,
        completedLabel,
        globalProgressLabel,
        shortcuts,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .ae-page {
    max-width: 960px;
    margin: 0 auto;
  }

  .welcome-title {
    margin: 0 0 8px;
    font-size: 1.75rem;
    font-weight: 700;
  }

  .tagline,
  .status-line {
    margin: 0 0 8px;
    font-size: 1rem;
  }

  .error {
    margin: 12px 0;
  }

  .stats,
  .continue-card {
    margin: 20px 0;
    padding: 16px;
    border: 1px solid;
    border-radius: 8px;
  }

  .section-title {
    margin: 0 0 12px;
    font-size: 1.25rem;
  }

  .resume-title {
    margin: 0 0 8px;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .resume-meta {
    margin: 0 0 16px;
  }

  .cards {
    display: grid;
    gap: 12px;
  }

  .shortcuts {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
    margin-top: 24px;
  }

  .shortcut {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 120px;
    padding: 16px;
    text-decoration: none;
    border: 1px solid;
    border-radius: 8px;
  }

  .shortcut:focus {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  .shortcut-icon {
    width: 28px;
    height: 28px;
  }

  .shortcut-title {
    display: block;
    font-size: 1rem;
    font-weight: 600;
  }

  .shortcut-desc {
    display: block;
    margin-top: 4px;
    font-size: 0.875rem;
  }

  .explore-link {
    display: inline-block;
    min-height: 44px;
    padding: 10px 16px;
    font-weight: 600;
    text-decoration: none;
    border-radius: 4px;
  }
</style>
