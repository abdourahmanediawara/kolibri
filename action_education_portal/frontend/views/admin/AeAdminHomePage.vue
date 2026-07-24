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
  import { UserKinds } from 'kolibri/constants';
  import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
  import ClassroomResource from 'kolibri-common/apiResources/ClassroomResource';
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
        dashLearnersLabel$,
        dashChannelsLabel$,
        dashTrainingsLabel$,
        dashSessionsLabel$,
        coachesTitle$,
        classesTitle$,
        adminLinkContentsTitle$,
        adminLinkUsersTitle$,
        syncTitle$,
      } = portalStrings;

      const { userFacilityId } = useAePermissions();
      const api = useTrainingApi();
      const loading = ref(true);
      const counts = ref({
        users: null,
        learners: null,
        coaches: null,
        classes: null,
        channels: null,
        trainings: null,
        sessions: null,
      });

      const summaryCards = computed(() =>
        [
          { id: 'users', value: counts.value.users, label: dashUsersLabel$() },
          { id: 'learners', value: counts.value.learners, label: dashLearnersLabel$() },
          { id: 'coaches', value: counts.value.coaches, label: coachesTitle$() },
          { id: 'classes', value: counts.value.classes, label: classesTitle$() },
          { id: 'channels', value: counts.value.channels, label: dashChannelsLabel$() },
          { id: 'trainings', value: counts.value.trainings, label: dashTrainingsLabel$() },
          { id: 'sessions', value: counts.value.sessions, label: dashSessionsLabel$() },
        ].filter(card => typeof card.value === 'number' && card.value > 0),
      );

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

      function isStaffUser(user) {
        return Boolean(
          (user.roles || []).find(
            role =>
              role.kind === UserKinds.COACH ||
              role.kind === UserKinds.ASSIGNABLE_COACH ||
              role.kind === UserKinds.ADMIN,
          ),
        );
      }

      onMounted(() => {
        Promise.allSettled([
          FacilityUserResource.fetchCollection({
            getParams: { member_of: userFacilityId.value },
          }),
          ClassroomResource.fetchCollection({
            getParams: { facility: userFacilityId.value },
          }),
          ChannelResource.fetchCollection({ getParams: { available: true } }),
          api.fetchTrainings(),
          api.fetchSessions(),
        ]).then(results => {
          const users =
            results[0].status === 'fulfilled' ? results[0].value || [] : null;
          const classrooms =
            results[1].status === 'fulfilled' ? results[1].value || [] : null;
          const channelsRaw =
            results[2].status === 'fulfilled' ? results[2].value : null;
          const trainings =
            results[3].status === 'fulfilled' ? results[3].value || [] : null;
          const sessions =
            results[4].status === 'fulfilled' ? results[4].value || [] : null;

          let channelList = null;
          if (channelsRaw != null) {
            channelList = Array.isArray(channelsRaw)
              ? channelsRaw
              : (channelsRaw && channelsRaw.results) || [];
          }

          const staff = users ? users.filter(isStaffUser) : null;
          const learners = users ? users.filter(user => !isStaffUser(user)) : null;

          counts.value = {
            users: users ? users.length : null,
            learners: learners ? learners.length : null,
            coaches: staff ? staff.length : null,
            classes: classrooms ? classrooms.length : null,
            channels: channelList ? channelList.length : null,
            trainings: trainings ? trainings.length : null,
            sessions: sessions ? sessions.length : null,
          };
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
