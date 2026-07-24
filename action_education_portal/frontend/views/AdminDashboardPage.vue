<template>
  <AppBarPage :title="adminDashTitle$()">
    <KPageContainer>
      <div
        class="admin-dash"
        :style="{ color: $themeTokens.text }"
      >
        <p
          v-if="!canManage"
          role="alert"
        >
          {{ adminStaffOnly$() }}
        </p>

        <template v-else>
          <p
            class="intro"
            :style="{ color: $themeTokens.annotation }"
          >
            {{ adminDashIntro$() }}
          </p>

          <KCircularLoader
            v-if="loading"
            :delay="false"
          />

          <div
            v-else
            class="cards"
          >
            <div
              v-for="card in summaryCards"
              :key="card.id"
              class="card"
              :style="{
                backgroundColor: $themeTokens.surface,
                borderColor: $themeTokens.fineLine,
              }"
            >
              <p class="card-value">
                {{ card.value }}
              </p>
              <p class="card-label">
                {{ card.label }}
              </p>
            </div>
          </div>

          <section class="links">
            <h2 class="section-title">
              {{ adminQuickLinksTitle$() }}
            </h2>
            <div class="link-grid">
              <a
                v-for="link in quickLinks"
                :key="link.id"
                class="link-card"
                :href="link.href"
                :style="{
                  backgroundColor: $themeTokens.surface,
                  borderColor: $themeTokens.fineLine,
                  color: $themeTokens.text,
                }"
              >
                <KIcon
                  :icon="link.icon"
                  class="link-icon"
                  :style="{ fill: $themeTokens.primary }"
                />
                <span class="link-title">{{ link.title }}</span>
                <span
                  class="link-desc"
                  :style="{ color: $themeTokens.annotation }"
                >
                  {{ link.description }}
                </span>
              </a>
            </div>
          </section>

          <section
            class="advanced"
            :style="{
              backgroundColor: $themeTokens.surface,
              borderColor: $themeTokens.fineLine,
            }"
          >
            <h2 class="section-title">
              {{ adminAdvancedTitle$() }}
            </h2>
            <p :style="{ color: $themeTokens.annotation }">
              {{ adminAdvancedBody$() }}
            </p>
            <div class="advanced-actions">
              <KButton
                :text="openFacilityAction$()"
                :primary="true"
                :href="facilityHref"
              />
              <KButton
                v-if="canAccessDeviceAdministration"
                :text="openDeviceAction$()"
                appearance="raised-button"
                :href="deviceHref"
              />
            </div>
          </section>
        </template>

        <p class="back">
          <KButton
            :text="backHome$()"
            appearance="basic-link"
            :href="homeHref"
          />
        </p>
      </div>
    </KPageContainer>
  </AppBarPage>
</template>

<script>
  import { computed, onMounted, ref } from 'vue';
  import urls from 'kolibri/urls';
  import useUser from 'kolibri/composables/useUser';
  import AppBarPage from 'kolibri/components/pages/AppBarPage';
  import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
  import ChannelResource from 'kolibri-common/apiResources/ChannelResource';
  import { portalStrings } from '../strings';
  import { useAePermissions } from '../composables/useAePermissions';
  import { useTrainingApi } from '../composables/useTrainingApi';

  export default {
    name: 'AdminDashboardPage',
    components: {
      AppBarPage,
    },
    setup() {
      const {
        adminDashTitle$,
        adminDashIntro$,
        adminStaffOnly$,
        adminQuickLinksTitle$,
        adminAdvancedTitle$,
        adminAdvancedBody$,
        openFacilityAction$,
        openDeviceAction$,
        backHome$,
        dashUsersLabel$,
        dashChannelsLabel$,
        dashTrainingsLabel$,
        dashSessionsLabel$,
        dashEnrollmentsLabel$,
        dashAttendanceLabel$,
        adminLinkUsersTitle$,
        adminLinkUsersDesc$,
        adminLinkContentsTitle$,
        adminLinkContentsDesc$,
        adminLinkTrainerTitle$,
        adminLinkTrainerDesc$,
        adminLinkDeviceTitle$,
        adminLinkDeviceDesc$,
        adminLinkCertificatesTitle$,
        adminLinkCertificatesDesc$,
        adminLinkReportsTitle$,
        adminLinkReportsDesc$,
      } = portalStrings;

      const { isAdmin, isSuperuser, userFacilityId } = useUser();
      const { canAccessDeviceAdministration } = useAePermissions();
      const api = useTrainingApi();
      const canManage = computed(() => isAdmin.value || isSuperuser.value);
      const loading = ref(true);
      const counts = ref({
        users: 0,
        channels: 0,
        trainings: 0,
        sessions: 0,
        enrollments: 0,
        attendance: 0,
      });

      const homeHref = computed(() => urls['kolibri:action_education_portal:portal']());
      const portalBase = computed(() => urls['kolibri:action_education_portal:portal']());
      const facilityHref = computed(() => urls['kolibri:kolibri.plugins.facility:facility_management']());
      const deviceHref = computed(() => urls['kolibri:kolibri.plugins.device:device_management']());
      const learnHref = computed(() => `${urls['kolibri:kolibri.plugins.learn:learn']()}#/library`);

      const summaryCards = computed(() => [
        { id: 'users', value: counts.value.users, label: dashUsersLabel$() },
        { id: 'channels', value: counts.value.channels, label: dashChannelsLabel$() },
        { id: 'trainings', value: counts.value.trainings, label: dashTrainingsLabel$() },
        { id: 'sessions', value: counts.value.sessions, label: dashSessionsLabel$() },
        { id: 'enrollments', value: counts.value.enrollments, label: dashEnrollmentsLabel$() },
        { id: 'attendance', value: counts.value.attendance, label: dashAttendanceLabel$() },
      ]);

      const quickLinks = computed(() => {
        const links = [
          {
            id: 'users',
            icon: 'people',
            title: adminLinkUsersTitle$(),
            description: adminLinkUsersDesc$(),
            href: facilityHref.value,
          },
          {
            id: 'contents',
            icon: 'library',
            title: adminLinkContentsTitle$(),
            description: adminLinkContentsDesc$(),
            href: learnHref.value,
          },
          {
            id: 'trainer',
            icon: 'classes',
            title: adminLinkTrainerTitle$(),
            description: adminLinkTrainerDesc$(),
            href: `${portalBase.value}#/trainer`,
          },
          {
            id: 'certificates',
            icon: 'star',
            title: adminLinkCertificatesTitle$(),
            description: adminLinkCertificatesDesc$(),
            href: `${portalBase.value}#/certificates`,
          },
          {
            id: 'reports',
            icon: 'reports',
            title: adminLinkReportsTitle$(),
            description: adminLinkReportsDesc$(),
            href: `${portalBase.value}#/reports`,
          },
        ];
        if (canAccessDeviceAdministration.value) {
          links.push({
            id: 'device',
            icon: 'device',
            title: adminLinkDeviceTitle$(),
            description: adminLinkDeviceDesc$(),
            href: deviceHref.value,
          });
        }
        return links;
      });

      onMounted(() => {
        if (!canManage.value) {
          loading.value = false;
          return;
        }
        Promise.all([
          FacilityUserResource.fetchCollection({
            getParams: { member_of: userFacilityId.value },
          }),
          ChannelResource.fetchCollection({ getParams: { available: true } }),
          api.fetchTrainings(),
          api.fetchSessions(),
          api.fetchEnrollments(),
          api.fetchAttendances(),
        ])
          .then(([users, channels, trainings, sessions, enrollments, attendance]) => {
            const channelList = Array.isArray(channels) ? channels : (channels && channels.results) || [];
            counts.value = {
              users: (users || []).length,
              channels: channelList.length,
              trainings: (trainings || []).length,
              sessions: (sessions || []).length,
              enrollments: (enrollments || []).length,
              attendance: (attendance || []).length,
            };
          })
          .finally(() => {
            loading.value = false;
          });
      });

      return {
        adminDashTitle$,
        adminDashIntro$,
        adminStaffOnly$,
        adminQuickLinksTitle$,
        adminAdvancedTitle$,
        adminAdvancedBody$,
        openFacilityAction$,
        openDeviceAction$,
        backHome$,
        canManage,
        canAccessDeviceAdministration,
        loading,
        summaryCards,
        quickLinks,
        homeHref,
        facilityHref,
        deviceHref,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .admin-dash {
    max-width: 960px;
    margin: 0 auto;
    padding: 16px 8px 32px;
  }

  .intro {
    margin: 0 0 16px;
    font-size: 1.05rem;
  }

  .cards,
  .link-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
    margin-bottom: 24px;
  }

  .card,
  .link-card,
  .advanced {
    padding: 16px;
    border: 1px solid;
    border-radius: 8px;
  }

  .card-value {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
  }

  .card-label,
  .section-title,
  .link-title {
    margin: 4px 0 0;
    font-weight: 600;
  }

  .link-card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-height: 120px;
    text-decoration: none;
  }

  .link-icon {
    width: 28px;
    height: 28px;
  }

  .link-desc {
    font-size: 0.9rem;
  }

  .advanced-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 12px;
  }

  .back {
    margin-top: 24px;
  }
</style>
