<template>

  <div class="ae-sync">
    <AePageHeader
      :title="syncTitle$()"
      :subtitle="syncIntro$()"
    />

    <div class="ae-sync-grid">
      <section
        class="ae-sync-card"
        aria-labelledby="ae-sync-facility"
      >
        <div class="ae-sync-card-head">
          <span
            class="ae-sync-badge"
            aria-hidden="true"
          >
            <KIcon
              icon="refresh"
              color="var(--ae-orange)"
            />
          </span>
          <div>
            <h2
              id="ae-sync-facility"
              class="ae-sync-card-title"
            >
              {{ syncFacilityTitle$() }}
            </h2>
            <p class="ae-sync-card-text">
              {{ syncFacilityText$() }}
            </p>
          </div>
        </div>

        <dl class="ae-sync-facts">
          <div>
            <dt>{{ facilityLabel$() }}</dt>
            <dd>{{ facilityName }}</dd>
          </div>
          <div>
            <dt>{{ lastSyncLabel$() }}</dt>
            <dd>{{ lastSync }}</dd>
          </div>
        </dl>

        <a
          :href="facilitySyncHref"
          class="ae-sync-primary"
        >{{ syncFacilityAction$() }}</a>
      </section>

      <section
        class="ae-sync-card"
        aria-labelledby="ae-sync-device"
      >
        <div class="ae-sync-card-head">
          <span
            class="ae-sync-badge"
            aria-hidden="true"
          >
            <KIcon
              icon="device"
              color="var(--ae-orange)"
            />
          </span>
          <div>
            <h2
              id="ae-sync-device"
              class="ae-sync-card-title"
            >
              {{ settingsDeviceTitle$() }}
            </h2>
            <p class="ae-sync-card-text">
              {{ isSuperuser ? syncDeviceText$() : deviceAdminRequiredHint$() }}
            </p>
          </div>
        </div>

        <a
          v-if="isSuperuser"
          :href="`${deviceHref}#/facilities`"
          class="ae-sync-outline"
        >{{ openDeviceSync$() }}</a>
      </section>
    </div>
  </div>

</template>


<script>

  import { computed, onMounted, ref } from 'vue';
  import urls from 'kolibri/urls';
  import { coreStrings } from 'kolibri/uiText/commonCoreStrings';
  import { currentLanguage } from 'kolibri/utils/i18n';
  import FacilityResource from 'kolibri-common/apiResources/FacilityResource';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';
  import AePageHeader from '../AePageHeader';

  export default {
    name: 'AeAdminSyncPage',
    components: { AePageHeader },
    setup() {
      const {
        syncTitle$,
        syncIntro$,
        syncFacilityTitle$,
        syncFacilityText$,
        syncFacilityAction$,
        lastSyncLabel$,
        neverSynced$,
        settingsDeviceTitle$,
        syncDeviceText$,
        deviceAdminRequiredHint$,
        openDeviceSync$,
      } = portalStrings;
      const { facilityLabel$ } = coreStrings;
      const { isSuperuser, userFacilityId } = useAePermissions();

      const facility = ref(null);
      const dateFormat = new Intl.DateTimeFormat(currentLanguage, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      const facilityName = computed(() => (facility.value ? facility.value.name : ''));
      const lastSync = computed(() => {
        const date = facility.value && facility.value.last_successful_sync;
        return date ? dateFormat.format(new Date(date)) : neverSynced$();
      });

      onMounted(() => {
        FacilityResource.fetchModel({ id: userFacilityId.value, force: true }).then(result => {
          facility.value = result;
        });
      });

      // Kolibri's facility Data page, where facility admins sync their facility.
      const facilityHref = urls['kolibri:kolibri.plugins.facility:facility_management']();

      return {
        syncTitle$,
        syncIntro$,
        syncFacilityTitle$,
        syncFacilityText$,
        syncFacilityAction$,
        lastSyncLabel$,
        settingsDeviceTitle$,
        syncDeviceText$,
        deviceAdminRequiredHint$,
        openDeviceSync$,
        facilityLabel$,
        isSuperuser,
        facilityName,
        lastSync,
        facilitySyncHref: `${facilityHref}#/${userFacilityId.value}/data`,
        deviceHref: urls['kolibri:kolibri.plugins.device:device_management'](),
      };
    },
  };

</script>


<style lang="scss" scoped>

  @import '../../styles/components';

  .ae-sync {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .ae-sync-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
    align-items: start;
  }

  .ae-sync-card {
    @include ae-card;

    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .ae-sync-card-head {
    @include ae-card-head;
  }

  .ae-sync-badge {
    @include ae-card-badge;
  }

  .ae-sync-card-title {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
    line-height: 1.25;
    color: var(--ae-navy);
  }

  .ae-sync-card-text {
    margin: 4px 0 0;
    font-size: 16px;
    color: var(--ae-text-muted);
  }

  .ae-sync-facts {
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

  .ae-sync-primary {
    @include ae-button-primary;

    align-self: flex-start;
  }

  .ae-sync-outline {
    @include ae-button-outline;

    align-self: flex-start;
  }

  @media (min-width: 900px) and (max-height: 799px) {
    .ae-sync,
    .ae-sync-grid {
      gap: 14px;
    }

    .ae-sync-card {
      gap: 14px;
      padding: 16px 18px;
    }

    .ae-sync-card-title {
      font-size: 19px;
    }

    .ae-sync-card-text {
      font-size: 15px;
    }

    .ae-sync-facts div {
      padding: 8px 0;
    }
  }

  @media (max-width: 899px) {
    .ae-sync-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }

</style>
