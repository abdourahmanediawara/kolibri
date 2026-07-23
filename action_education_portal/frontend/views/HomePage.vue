<template>
  <AppBarPage :title="pageTitle$()">
    <KPageContainer>
      <div
        class="portal-home"
        :style="{ color: $themeTokens.text }"
      >
        <header class="welcome">
          <h1 class="welcome-title">
            {{ greeting }}
          </h1>
          <p
            class="welcome-tagline"
            :style="{ color: $themeTokens.annotation }"
          >
            {{ tagline$() }}
          </p>
          <p
            class="offline-hint"
            :style="{ color: $themeTokens.annotation }"
          >
            {{ offlineHint$() }}
          </p>
        </header>

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
            <KButton
              :text="exploreTrainings$()"
              :primary="true"
              :href="catalogHref"
            />
          </template>
        </section>

        <section
          class="shortcuts"
          :aria-label="shortcutsLabel$()"
        >
          <a
            v-for="item in shortcuts"
            :key="item.id"
            class="shortcut"
            :href="item.href"
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
          </a>
        </section>
      </div>
    </KPageContainer>
  </AppBarPage>
</template>

<script>
  import { computed, onMounted, ref } from 'vue';
  import client from 'kolibri/client';
  import urls from 'kolibri/urls';
  import useUser from 'kolibri/composables/useUser';
  import AppBarPage from 'kolibri/components/pages/AppBarPage';
  import { portalStrings } from '../strings';

  export default {
    name: 'HomePage',
    components: {
      AppBarPage,
    },
    setup() {
      const {
        pageTitle$,
        greetingNamed$,
        greetingGeneric$,
        tagline$,
        continueTitle$,
        continueEmpty$,
        exploreTrainings$,
        continueAction$,
        shortcutTrainings$,
        shortcutTrainingsDesc$,
        shortcutExplore$,
        shortcutExploreDesc$,
        shortcutVideos$,
        shortcutVideosDesc$,
        shortcutQuizzes$,
        shortcutQuizzesDesc$,
        shortcutProgress$,
        shortcutProgressDesc$,
        shortcutHelp$,
        shortcutHelpDesc$,
        offlineHint$,
        shortcutsLabel$,
        shortcutTrainer$,
        shortcutTrainerDesc$,
      } = portalStrings;

      const { full_name, username, isUserLoggedIn, isCoach, isAdmin, isSuperuser } = useUser();
      const loading = ref(true);
      const resumeItem = ref(null);

      const learnBase = computed(() => urls['kolibri:kolibri.plugins.learn:learn']());
      const libraryHref = computed(() => `${learnBase.value}#/library`);
      const homeHref = computed(() => `${learnBase.value}#/home`);
      const portalBase = computed(() => urls['kolibri:action_education_portal:portal']());
      const catalogHref = computed(() => `${portalBase.value}#/catalog`);
      const videosHref = computed(() => `${portalBase.value}#/videos`);
      const quizzesHref = computed(() => `${portalBase.value}#/quizzes`);
      const progressHref = computed(() => `${portalBase.value}#/progress`);
      const portalHelpHref = computed(() => `${portalBase.value}#/help`);
      const trainerSessionsHref = computed(() => `${portalBase.value}#/trainer/sessions`);

      const isStaff = computed(
        () => isCoach.value || isAdmin.value || isSuperuser.value,
      );

      const greeting = computed(() => {
        const name = (full_name && full_name.value) || (username && username.value);
        if (name) {
          return greetingNamed$({ name });
        }
        return greetingGeneric$();
      });

      const resumeHref = computed(() => {
        if (!resumeItem.value || !resumeItem.value.id) {
          return libraryHref.value;
        }
        return `${learnBase.value}#/topics/c/${resumeItem.value.id}`;
      });

      const resumeProgressLabel = computed(() => {
        const progress = resumeItem.value && resumeItem.value.progress_fraction;
        if (typeof progress !== 'number') {
          return '';
        }
        return `${Math.round(progress * 100)}%`;
      });

      const shortcuts = computed(() => {
        const items = [
          {
            id: 'trainings',
            icon: 'lesson',
            title: shortcutTrainings$(),
            description: shortcutTrainingsDesc$(),
            href: homeHref.value,
          },
          {
            id: 'explore',
            icon: 'library',
            title: shortcutExplore$(),
            description: shortcutExploreDesc$(),
            href: catalogHref.value,
          },
          {
            id: 'videos',
            icon: 'video',
            title: shortcutVideos$(),
            description: shortcutVideosDesc$(),
            href: videosHref.value,
          },
          {
            id: 'quizzes',
            icon: 'quiz',
            title: shortcutQuizzes$(),
            description: shortcutQuizzesDesc$(),
            href: quizzesHref.value,
          },
          {
            id: 'progress',
            icon: 'inProgress',
            title: shortcutProgress$(),
            description: shortcutProgressDesc$(),
            href: progressHref.value,
          },
          {
            id: 'help',
            icon: 'help',
            title: shortcutHelp$(),
            description: shortcutHelpDesc$(),
            href: portalHelpHref.value,
          },
        ];
        if (isStaff.value) {
          items.unshift({
            id: 'trainer',
            icon: 'classes',
            title: shortcutTrainer$(),
            description: shortcutTrainerDesc$(),
            href: trainerSessionsHref.value,
          });
        }
        return items;
      });

      onMounted(() => {
        if (!isUserLoggedIn.value) {
          loading.value = false;
          return;
        }
        client({ url: urls['kolibri:kolibri.plugins.learn:homehydrate']() })
          .then(response => {
            const payload = response.data || {};
            const resources = payload.resumable_resources || {};
            const nodes = resources.results || [];
            const first = Array.isArray(nodes) ? nodes[0] : null;
            if (first) {
              const progressList = payload.resumable_resources_progress || [];
              const progressEntry = progressList.find(
                item =>
                  item.content_id === first.content_id ||
                  item.contentnode_id === first.id ||
                  item.id === first.id,
              );
              resumeItem.value = {
                id: first.id,
                title: first.title,
                progress_fraction:
                  progressEntry && typeof progressEntry.progress_fraction === 'number'
                    ? progressEntry.progress_fraction
                    : null,
              };
            }
          })
          .finally(() => {
            loading.value = false;
          });
      });

      return {
        pageTitle$,
        greeting,
        tagline$,
        offlineHint$,
        continueTitle$,
        continueEmpty$,
        exploreTrainings$,
        continueAction$,
        loading,
        resumeItem,
        resumeHref,
        resumeProgressLabel,
        libraryHref,
        catalogHref,
        shortcuts,
        shortcutsLabel$,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .portal-home {
    max-width: 960px;
    margin: 0 auto;
    padding: 16px 8px 32px;
  }

  .welcome-title {
    margin: 0 0 8px;
    font-size: 1.75rem;
    font-weight: 700;
  }

  .welcome-tagline,
  .offline-hint {
    margin: 0 0 8px;
    font-size: 1rem;
  }

  .continue-card {
    margin: 24px 0;
    padding: 20px;
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

  .shortcuts {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
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
</style>
