<template>
  <div
    class="ae-page"
    :style="{ color: $themeTokens.text }"
  >
    <h1 class="title">
      {{ dashUsersLabel$() }}
    </h1>

    <p class="facility-link">
      <KButton
        :text="openFacilityUsers$()"
        :primary="true"
        :href="facilityHref"
      />
    </p>

    <KCircularLoader
      v-if="loading"
      :delay="false"
    />

    <p
      v-else-if="!users.length"
      :style="{ color: $themeTokens.annotation }"
    >
      {{ learnersEmpty$() }}
    </p>

    <ul
      v-else
      class="list"
    >
      <li
        v-for="user in users"
        :key="user.id"
        class="row"
        :style="{
          backgroundColor: $themeTokens.surface,
          borderColor: $themeTokens.fineLine,
        }"
      >
        <p class="name">
          {{ user.full_name || user.username }}
        </p>
        <p :style="{ color: $themeTokens.annotation }">
          {{ user.username }}
        </p>
      </li>
    </ul>
  </div>
</template>

<script>
  import { computed, onMounted, ref } from 'vue';
  import urls from 'kolibri/urls';
  import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';

  export default {
    name: 'AeAdminUsersPage',
    setup() {
      const { dashUsersLabel$, openFacilityUsers$, learnersEmpty$ } = portalStrings;
      const { userFacilityId } = useAePermissions();
      const loading = ref(true);
      const users = ref([]);

      const facilityHref = computed(
        () => urls['kolibri:kolibri.plugins.facility:facility_management'](),
      );

      onMounted(() => {
        FacilityUserResource.fetchCollection({
          getParams: { member_of: userFacilityId.value },
        })
          .then(result => {
            users.value = result || [];
          })
          .finally(() => {
            loading.value = false;
          });
      });

      return {
        dashUsersLabel$,
        openFacilityUsers$,
        learnersEmpty$,
        loading,
        users,
        facilityHref,
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

  .facility-link {
    margin: 0 0 20px;
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
