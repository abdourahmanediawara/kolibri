<template>
  <div
    class="ae-page"
    :style="{ color: $themeTokens.text }"
  >
    <h1 class="title">
      {{ syncTitle$() }}
    </h1>
    <p
      class="intro"
      :style="{ color: $themeTokens.annotation }"
    >
      {{ syncIntro$() }}
    </p>

    <template v-if="canAccessDeviceAdministration">
      <KButton
        :text="openDeviceSync$()"
        :primary="true"
        :href="deviceHref"
      />
    </template>
    <p
      v-else
      :style="{ color: $themeTokens.annotation }"
    >
      {{ deviceAdminRequiredHint$() }}
    </p>
  </div>
</template>

<script>
  import { computed } from 'vue';
  import urls from 'kolibri/urls';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';

  export default {
    name: 'AeAdminSyncPage',
    setup() {
      const { syncTitle$, syncIntro$, openDeviceSync$, deviceAdminRequiredHint$ } =
        portalStrings;
      const { canAccessDeviceAdministration } = useAePermissions();

      const deviceHref = computed(
        () => urls['kolibri:kolibri.plugins.device:device_management'](),
      );

      return {
        syncTitle$,
        syncIntro$,
        openDeviceSync$,
        deviceAdminRequiredHint$,
        canAccessDeviceAdministration,
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
</style>
