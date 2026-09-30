<template>

  <div class="ae-settings">
    <AePageHeader
      :title="settingsTitle$()"
      :subtitle="settingsIntro$()"
    />

    <div class="ae-settings-grid">
      <section
        class="ae-settings-card"
        aria-labelledby="ae-settings-platform"
      >
        <div class="ae-settings-card-head">
          <span
            class="ae-settings-badge"
            aria-hidden="true"
          >
            <KIcon
              icon="settings"
              color="var(--ae-orange)"
            />
          </span>
          <div>
            <h2
              id="ae-settings-platform"
              class="ae-settings-card-title"
            >
              {{ settingsPlatformTitle$() }}
            </h2>
            <p class="ae-settings-card-text">
              {{ facilityAdminSettingsHint$() }}
            </p>
          </div>
        </div>

        <dl class="ae-settings-facts">
          <div>
            <dt>{{ platformNameLabel$() }}</dt>
            <dd>{{ platformName }}</dd>
          </div>
          <div>
            <dt>{{ organizationLabel$() }}</dt>
            <dd>{{ footerOrgName$() }}</dd>
          </div>
          <div>
            <dt>{{ languageLabel$() }}</dt>
            <dd>{{ languageName }}</dd>
          </div>
        </dl>

        <a
          :href="facilitySettingsHref"
          class="ae-settings-outline"
        >{{ facilitySettingsAction$() }}</a>
      </section>

      <section
        class="ae-settings-card"
        aria-labelledby="ae-settings-device"
      >
        <div class="ae-settings-card-head">
          <span
            class="ae-settings-badge"
            aria-hidden="true"
          >
            <KIcon
              icon="device"
              color="var(--ae-orange)"
            />
          </span>
          <div>
            <h2
              id="ae-settings-device"
              class="ae-settings-card-title"
            >
              {{ settingsDeviceTitle$() }}
            </h2>
            <p class="ae-settings-card-text">
              {{ isSuperuser ? settingsDeviceHint$() : deviceAdminRequiredHint$() }}
            </p>
          </div>
        </div>

        <div
          v-if="isSuperuser"
          class="ae-settings-actions"
        >
          <a
            :href="`${deviceHref}#/settings`"
            class="ae-settings-primary"
          >{{ openDeviceSettingsAction$() }}</a>
          <a
            :href="deviceHref"
            class="ae-settings-link"
          >{{ technicalAdmin$() }}</a>
        </div>
      </section>
    </div>
  </div>

</template>


<script>

  import urls from 'kolibri/urls';
  import themeConfig from 'kolibri/styles/themeConfig';
  import { coreStrings } from 'kolibri/uiText/commonCoreStrings';
  import { availableLanguages, currentLanguage } from 'kolibri/utils/i18n';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';
  import AePageHeader from '../AePageHeader';

  export default {
    name: 'AeAdminSettingsPage',
    components: { AePageHeader },
    setup() {
      const {
        settingsTitle$,
        settingsIntro$,
        settingsPlatformTitle$,
        settingsDeviceTitle$,
        platformNameLabel$,
        organizationLabel$,
        footerOrgName$,
        facilityAdminSettingsHint$,
        facilitySettingsAction$,
        technicalAdmin$,
        settingsDeviceHint$,
        openDeviceSettingsAction$,
        deviceAdminRequiredHint$,
      } = portalStrings;
      const { languageLabel$ } = coreStrings;

      // Device settings are for Kolibri superusers only.
      const { isSuperuser, userFacilityId } = useAePermissions();
      const language = availableLanguages[currentLanguage];
      const facilityHref = urls['kolibri:kolibri.plugins.facility:facility_management']();

      return {
        settingsTitle$,
        settingsIntro$,
        settingsPlatformTitle$,
        settingsDeviceTitle$,
        platformNameLabel$,
        organizationLabel$,
        footerOrgName$,
        facilityAdminSettingsHint$,
        facilitySettingsAction$,
        technicalAdmin$,
        settingsDeviceHint$,
        openDeviceSettingsAction$,
        deviceAdminRequiredHint$,
        languageLabel$,
        isSuperuser,
        platformName: themeConfig.siteTitle,
        languageName: (language && language.lang_name) || currentLanguage,
        facilitySettingsHref: `${facilityHref}#/${userFacilityId.value}/settings`,
        deviceHref: urls['kolibri:kolibri.plugins.device:device_management'](),
      };
    },
  };

</script>


<style lang="scss" scoped>

  @import '../../styles/components';

  .ae-settings {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .ae-settings-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
    align-items: start;
  }

  .ae-settings-card {
    @include ae-card;

    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .ae-settings-card-head {
    @include ae-card-head;
  }

  .ae-settings-badge {
    @include ae-card-badge;
  }

  .ae-settings-card-title {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
    line-height: 1.25;
    color: var(--ae-navy);
  }

  .ae-settings-card-text {
    margin: 4px 0 0;
    font-size: 16px;
    color: var(--ae-text-muted);
  }

  .ae-settings-facts {
    margin: 0;

    div {
      display: flex;
      gap: 16px;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid var(--ae-line);

      &:first-child {
        border-top: 1px solid var(--ae-line);
      }
    }

    dt {
      font-size: 16px;
      color: var(--ae-text-muted);
    }

    dd {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: var(--ae-navy);
      text-align: end;
    }
  }

  .ae-settings-outline {
    @include ae-button-outline;

    align-self: flex-start;
  }

  .ae-settings-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 20px;
    align-items: center;
  }

  .ae-settings-primary {
    @include ae-button-primary;
  }

  .ae-settings-link {
    padding: 4px;
    font-size: 16px;
    font-weight: 700;
    color: var(--ae-orange-ink);
    text-decoration: underline;
    text-underline-offset: 3px;
    border-radius: 6px;

    @include ae-focus-ring;
  }

  @media (min-width: 900px) and (max-height: 799px) {
    .ae-settings,
    .ae-settings-grid {
      gap: 14px;
    }

    .ae-settings-card {
      gap: 14px;
      padding: 16px 18px;
    }

    .ae-settings-card-title {
      font-size: 19px;
    }

    .ae-settings-card-text {
      font-size: 15px;
    }

    .ae-settings-facts div {
      padding: 8px 0;
    }
  }

  @media (max-width: 899px) {
    .ae-settings-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }

</style>
