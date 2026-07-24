<template>
  <div
    class="ae-page"
    :style="{ color: $themeTokens.text }"
  >
    <h1 class="title">
      {{ helpPageTitle$() }}
    </h1>
    <p class="intro">
      {{ helpIntro$() }}
    </p>
    <ol class="steps">
      <li
        v-for="step in steps"
        :key="step.id"
        class="step"
        :style="{
          backgroundColor: $themeTokens.surface,
          borderColor: $themeTokens.fineLine,
        }"
      >
        <KIcon
          :icon="step.icon"
          class="step-icon"
          :style="{ fill: $themeTokens.primary }"
        />
        <div>
          <h2 class="step-title">
            {{ step.title }}
          </h2>
          <p
            class="step-body"
            :style="{ color: $themeTokens.annotation }"
          >
            {{ step.body }}
          </p>
        </div>
      </li>
    </ol>
    <router-link
      to="/ae/learn"
      class="back-link"
      :style="{ color: $themeTokens.primary }"
    >
      {{ backHome$() }}
    </router-link>
  </div>
</template>

<script>
  import { computed } from 'vue';
  import { portalStrings } from '../../strings';

  export default {
    name: 'AeLearnHelpPage',
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
        steps,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .ae-page {
    max-width: 720px;
    margin: 0 auto;
  }

  .title {
    margin: 0 0 8px;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .intro {
    margin: 0 0 16px;
    font-size: 1.05rem;
    line-height: 1.5;
  }

  .steps {
    margin: 0 0 24px;
    padding: 0;
    list-style: none;
  }

  .step {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    min-height: 44px;
    margin-bottom: 12px;
    padding: 16px;
    border: 1px solid;
    border-radius: 8px;
  }

  .step-icon {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    margin-top: 2px;
  }

  .step-title {
    margin: 0 0 4px;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .step-body {
    margin: 0;
    font-size: 1rem;
    line-height: 1.45;
  }

  .back-link {
    display: inline-block;
    min-height: 44px;
    padding: 8px 0;
    font-weight: 600;
    text-decoration: none;
  }
</style>
