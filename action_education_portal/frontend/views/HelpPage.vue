<template>
  <AppBarPage :title="helpPageTitle$()">
    <KPageContainer>
      <div
        class="help-page"
        :style="{ color: $themeTokens.text }"
      >
        <p class="help-intro">
          {{ helpIntro$() }}
        </p>
        <ol class="help-steps">
          <li
            v-for="step in steps"
            :key="step.id"
            class="help-step"
            :style="{
              backgroundColor: $themeTokens.surface,
              borderColor: $themeTokens.fineLine,
            }"
          >
            <KIcon
              :icon="step.icon"
              class="help-icon"
              :style="{ fill: $themeTokens.primary }"
            />
            <div>
              <h2 class="help-step-title">
                {{ step.title }}
              </h2>
              <p
                class="help-step-body"
                :style="{ color: $themeTokens.annotation }"
              >
                {{ step.body }}
              </p>
            </div>
          </li>
        </ol>
        <KButton
          :text="backHome$()"
          appearance="basic-link"
          :href="homeHref"
        />
      </div>
    </KPageContainer>
  </AppBarPage>
</template>

<script>
  import { computed } from 'vue';
  import urls from 'kolibri/urls';
  import AppBarPage from 'kolibri/components/pages/AppBarPage';
  import { portalStrings } from '../strings';

  export default {
    name: 'HelpPage',
    components: {
      AppBarPage,
    },
    setup() {
      const {
        helpPageTitle$,
        helpIntro$,
        helpStepLoginTitle$,
        helpStepLoginBody$,
        helpStepOpenTitle$,
        helpStepOpenBody$,
        helpStepVideoTitle$,
        helpStepVideoBody$,
        helpStepQuizTitle$,
        helpStepQuizBody$,
        helpStepProgressTitle$,
        helpStepProgressBody$,
        helpStepOfflineTitle$,
        helpStepOfflineBody$,
        helpStepTrainerTitle$,
        helpStepTrainerBody$,
        backHome$,
      } = portalStrings;

      const homeHref = computed(() => urls['kolibri:action_education_portal:portal']());

      const steps = computed(() => [
        {
          id: 'login',
          icon: 'person',
          title: helpStepLoginTitle$(),
          body: helpStepLoginBody$(),
        },
        {
          id: 'open',
          icon: 'lesson',
          title: helpStepOpenTitle$(),
          body: helpStepOpenBody$(),
        },
        {
          id: 'video',
          icon: 'video',
          title: helpStepVideoTitle$(),
          body: helpStepVideoBody$(),
        },
        {
          id: 'quiz',
          icon: 'quiz',
          title: helpStepQuizTitle$(),
          body: helpStepQuizBody$(),
        },
        {
          id: 'progress',
          icon: 'inProgress',
          title: helpStepProgressTitle$(),
          body: helpStepProgressBody$(),
        },
        {
          id: 'offline',
          icon: 'wifi',
          title: helpStepOfflineTitle$(),
          body: helpStepOfflineBody$(),
        },
        {
          id: 'trainer',
          icon: 'help',
          title: helpStepTrainerTitle$(),
          body: helpStepTrainerBody$(),
        },
      ]);

      return {
        helpPageTitle$,
        helpIntro$,
        backHome$,
        homeHref,
        steps,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .help-page {
    max-width: 720px;
    margin: 0 auto;
    padding: 16px 8px 32px;
  }

  .help-intro {
    margin: 0 0 16px;
    font-size: 1.05rem;
    line-height: 1.5;
  }

  .help-steps {
    margin: 0 0 24px;
    padding: 0;
    list-style: none;
  }

  .help-step {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    min-height: 44px;
    margin-bottom: 12px;
    padding: 16px;
    border: 1px solid;
    border-radius: 8px;
  }

  .help-icon {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    margin-top: 2px;
  }

  .help-step-title {
    margin: 0 0 4px;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .help-step-body {
    margin: 0;
    font-size: 1rem;
    line-height: 1.45;
  }
</style>
