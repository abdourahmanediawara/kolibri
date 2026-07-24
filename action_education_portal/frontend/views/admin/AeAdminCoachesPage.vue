<template>
  <div
    class="ae-page"
    :style="{ color: $themeTokens.text }"
  >
    <h1 class="title">
      {{ coachesTitle$() }}
    </h1>

    <KCircularLoader
      v-if="loading"
      :delay="false"
    />

    <p
      v-else-if="!coaches.length"
      :style="{ color: $themeTokens.annotation }"
    >
      {{ learnersEmpty$() }}
    </p>

    <ul
      v-else
      class="list"
    >
      <li
        v-for="coach in coaches"
        :key="coach.id"
        class="row"
        :style="{
          backgroundColor: $themeTokens.surface,
          borderColor: $themeTokens.fineLine,
        }"
      >
        <p class="name">
          {{ coach.full_name || coach.username }}
        </p>
        <p :style="{ color: $themeTokens.annotation }">
          {{ coach.username }}
        </p>
      </li>
    </ul>
  </div>
</template>

<script>
  import { onMounted, ref } from 'vue';
  import { UserKinds } from 'kolibri/constants';
  import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';

  export default {
    name: 'AeAdminCoachesPage',
    setup() {
      const { coachesTitle$, learnersEmpty$ } = portalStrings;
      const { userFacilityId } = useAePermissions();
      const loading = ref(true);
      const coaches = ref([]);

      function isCoachUser(user) {
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
        FacilityUserResource.fetchCollection({
          getParams: { member_of: userFacilityId.value },
        })
          .then(users => {
            coaches.value = (users || []).filter(isCoachUser);
          })
          .finally(() => {
            loading.value = false;
          });
      });

      return {
        coachesTitle$,
        learnersEmpty$,
        loading,
        coaches,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .ae-page {
    max-width: 880px;
    margin: 0 auto;
  }

  .title {
    margin: 0 0 16px;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .list {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .row {
    margin-bottom: 12px;
    padding: 16px;
    border: 1px solid;
    border-radius: 8px;
  }

  .name {
    margin: 0 0 4px;
    font-weight: 600;
  }
</style>
