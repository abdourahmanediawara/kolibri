<template>
  <div
    class="ae-page"
    :style="{ color: $themeTokens.text }"
  >
    <h1 class="title">
      {{ settingsTitle$() }}
    </h1>
    <p
      class="intro"
      :style="{ color: $themeTokens.annotation }"
    >
      {{ settingsIntro$() }}
    </p>

    <section
      class="block"
      :style="{
        backgroundColor: $themeTokens.surface,
        borderColor: $themeTokens.fineLine,
      }"
    >
      <p class="setting-row">
        <strong>{{ platformTitle$() }}</strong>
      </p>
      <p :style="{ color: $themeTokens.annotation }">
        Langue du site : fr-fr
      </p>
    </section>

    <p class="tech">
      <a
        :href="deviceHref"
        :style="{ color: $themeTokens.annotation }"
      >
        {{ technicalAdmin$() }}
      </a>
    </p>
  </div>
</template>

<script>
  import { computed } from 'vue';
  import urls from 'kolibri/urls';
  import { portalStrings } from '../../strings';

  export default {
    name: 'AeAdminSettingsPage',
    setup() {
      const {
        settingsTitle$,
        settingsIntro$,
        platformTitle$,
        technicalAdmin$,
      } = portalStrings;

      const deviceHref = computed(
        () => urls['kolibri:kolibri.plugins.device:device_management'](),
      );

      return {
        settingsTitle$,
        settingsIntro$,
        platformTitle$,
        technicalAdmin$,
        deviceHref,
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
  }

  .block {
    margin-bottom: 20px;
    padding: 16px;
    border: 1px solid;
    border-radius: 8px;
  }

  .setting-row {
    margin: 0 0 8px;
  }

  .tech {
    margin: 0;
  }
</style>
