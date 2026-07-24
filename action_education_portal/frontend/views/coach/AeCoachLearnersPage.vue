<template>
  <div
    class="ae-page"
    :style="{ color: $themeTokens.text }"
  >
    <h1 class="title">
      {{ learnersTitle$() }}
    </h1>

    <KCircularLoader
      v-if="loading"
      :delay="false"
    />

    <p
      v-else-if="!learners.length"
      :style="{ color: $themeTokens.annotation }"
    >
      {{ learnersEmpty$() }}
    </p>

    <ul
      v-else
      class="list"
    >
      <li
        v-for="learner in learners"
        :key="learner.id"
        class="row"
        :style="{
          backgroundColor: $themeTokens.surface,
          borderColor: $themeTokens.fineLine,
        }"
      >
        <p class="name">
          {{ learner.full_name || learner.username }}
        </p>
        <p :style="{ color: $themeTokens.annotation }">
          {{ learner.username }}
        </p>
      </li>
    </ul>
  </div>
</template>

<script>
  import { onMounted, ref } from 'vue';
  import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';

  export default {
    name: 'AeCoachLearnersPage',
    setup() {
      const { learnersTitle$, learnersEmpty$ } = portalStrings;
      const { userFacilityId } = useAePermissions();
      const loading = ref(true);
      const learners = ref([]);

      onMounted(() => {
        FacilityUserResource.fetchCollection({
          getParams: { member_of: userFacilityId.value },
        })
          .then(users => {
            learners.value = users || [];
          })
          .finally(() => {
            loading.value = false;
          });
      });

      return {
        learnersTitle$,
        learnersEmpty$,
        loading,
        learners,
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
