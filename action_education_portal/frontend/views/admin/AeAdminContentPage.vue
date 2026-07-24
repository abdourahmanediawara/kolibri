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

    <div class="actions">
      <KButton
        :text="addContentAction$()"
        :primary="true"
        :href="deviceHref"
      />
      <KButton
        :text="importFromInternet$()"
        appearance="raised-button"
        :href="deviceHref"
      />
      <KButton
        :text="importFromNetwork$()"
        appearance="raised-button"
        :href="deviceHref"
      />
      <KButton
        :text="importFromUsb$()"
        appearance="raised-button"
        :href="deviceHref"
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
        addContentAction$,
        importFromInternet$,
        importFromNetwork$,
        importFromUsb$,
      } = portalStrings;

      const deviceHref = computed(
        () => urls['kolibri:kolibri.plugins.device:device_management'](),
      );

      return {
        contentManageTitle$,
        contentImportHelp$,
        addContentAction$,
        importFromInternet$,
        importFromNetwork$,
        importFromUsb$,
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
    margin: 0 0 20px;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
</style>
