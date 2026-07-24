<template>
  <div
    class="ae-page"
    :style="{ color: $themeTokens.text }"
  >
    <h1 class="title">
      {{ adminDashTitle$() }}
    </h1>
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
      <router-link
        v-for="link in quickLinks"
        :key="link.id"
        :to="link.to"
        class="link-card"
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
      </router-link>
    </section>

    <p class="preview">
      <router-link
        to="/ae/learn"
        :style="{ color: $themeTokens.primary }"
      >
        {{ previewLearner$() }}
      </router-link>
    </p>
  </div>
</template>

<script>
  import { computed, onMounted, ref } from 'vue';
  import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
  import ChannelResource from 'kolibri-common/apiResources/ChannelResource';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';
  import { useTrainingApi } from '../../composables/useTrainingApi';

  export default {
    name: 'AeAdminHomePage',
    setup() {
      const {
        adminDashTitle$,
        adminDashIntro$,
        previewLearner$,
        dashUsersLabel$,
        dashChannelsLabel$,
        dashTrainingsLabel$,
        dashSessionsLabel$,
        adminLinkContentsTitle$,
        adminLinkUsersTitle$,
        syncTitle$,
      } = portalStrings;

      const { userFacilityId } = useAePermissions();
      const api = useTrainingApi();
      const loading = ref(true);
      const counts = ref({ users: 0, channels: 0, trainings: 0, sessions: 0 });

      const summaryCards = computed(() => [
        { id: 'users', value: counts.value.users, label: dashUsersLabel$() },
        { id: 'channels', value: counts.value.channels, label: dashChannelsLabel$() },
        { id: 'trainings', value: counts.value.trainings, label: dashTrainingsLabel$() },
        { id: 'sessions', value: counts.value.sessions, label: dashSessionsLabel$() },
      ]);

      const quickLinks = computed(() => [
        {
          id: 'content',
          icon: 'channel',
          title: adminLinkContentsTitle$(),
          to: { name: 'AeAdminContent' },
        },
        {
          id: 'users',
          icon: 'people',
          title: adminLinkUsersTitle$(),
          to: { name: 'AeAdminUsers' },
        },
        {
          id: 'sync',
          icon: 'device',
          title: syncTitle$(),
          to: { name: 'AeAdminSync' },
        },
      ]);

      onMounted(() => {
        Promise.all([
          FacilityUserResource.fetchCollection({
            getParams: { member_of: userFacilityId.value },
          }),
          ChannelResource.fetchCollection({ getParams: { available: true } }),
          api.fetchTrainings(),
          api.fetchSessions(),
        ])
          .then(([users, channels, trainings, sessions]) => {
            const channelList = Array.isArray(channels)
              ? channels
              : (channels && channels.results) || [];
            counts.value = {
              users: (users || []).length,
              channels: channelList.length,
              trainings: (trainings || []).length,
              sessions: (sessions || []).length,
            };
          })
          .catch(() => {
            counts.value = { users: 0, channels: 0, trainings: 0, sessions: 0 };
          })
          .finally(() => {
            loading.value = false;
          });
      });

      return {
        adminDashTitle$,
        adminDashIntro$,
        previewLearner$,
        loading,
        summaryCards,
        quickLinks,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .ae-page {
    max-width: 960px;
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

  .cards,
  .links {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
    margin-bottom: 20px;
  }

  .card,
  .link-card {
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
  .link-title {
    margin: 4px 0 0;
    font-weight: 600;
  }

  .link-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 100px;
    text-decoration: none;
  }

  .link-icon {
    width: 28px;
    height: 28px;
  }

  .preview {
    margin: 0;
  }
</style>
