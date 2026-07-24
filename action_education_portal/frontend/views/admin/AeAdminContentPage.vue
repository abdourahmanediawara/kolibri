<template>
  <div
    class="ae-page"
    :style="{ color: $themeTokens.text }"
  >
    <h1 class="title">
      {{ contentManageTitle$() }}
    </h1>
    <p
      class="intro"
      :style="{ color: $themeTokens.annotation }"
    >
      {{ contentImportHelp$() }}
    </p>

    <ul
      class="methods"
      :style="{ color: $themeTokens.annotation }"
    >
      <li>{{ importFromInternet$() }}</li>
      <li>{{ importFromNetwork$() }}</li>
      <li>{{ importFromUsb$() }}</li>
    </ul>

    <div class="actions">
      <KButton
        :text="openContentImportAction$()"
        :primary="true"
        :href="deviceContentHref"
      />
    </div>
  </div>
</template>

<script>
  import { computed } from 'vue';
  import urls from 'kolibri/urls';
  import { portalStrings } from '../../strings';

  export default {
    name: 'AeAdminContentPage',
    setup() {
      const {
        contentManageTitle$,
        contentImportHelp$,
        importFromInternet$,
        importFromNetwork$,
        importFromUsb$,
        openContentImportAction$,
      } = portalStrings;

      const deviceContentHref = computed(() => {
        const base = urls['kolibri:kolibri.plugins.device:device_management']();
        return `${base}#/content`;
      });

      return {
        contentManageTitle$,
        contentImportHelp$,
        importFromInternet$,
        importFromNetwork$,
        importFromUsb$,
        openContentImportAction$,
        deviceContentHref,
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
    margin: 0 0 12px;
  }

  .methods {
    margin: 0 0 20px;
    padding-inline-start: 1.25rem;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
</style>
