<template>
  <div
    class="ae-page"
    :style="{ color: $themeTokens.text }"
  >
    <h1 class="title">
      {{ classesTitle$() }}
    </h1>

    <p class="facility-link">
      <KButton
        :text="openFacilityClasses$()"
        :primary="true"
        :href="facilityHref"
      />
    </p>

    <KCircularLoader
      v-if="loading"
      :delay="false"
    />

    <p
      v-else-if="!classrooms.length"
      :style="{ color: $themeTokens.annotation }"
    >
      {{ learnersEmpty$() }}
    </p>

    <ul
      v-else
      class="list"
    >
      <li
        v-for="classroom in classrooms"
        :key="classroom.id"
        class="row"
        :style="{
          backgroundColor: $themeTokens.surface,
          borderColor: $themeTokens.fineLine,
        }"
      >
        <p class="name">
          {{ classroom.name }}
        </p>
      </li>
    </ul>
  </div>
</template>

<script>
  import { computed, onMounted, ref } from 'vue';
  import urls from 'kolibri/urls';
  import ClassroomResource from 'kolibri-common/apiResources/ClassroomResource';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';

  export default {
    name: 'AeAdminClassesPage',
    setup() {
      const { classesTitle$, openFacilityClasses$, learnersEmpty$ } = portalStrings;
      const { userFacilityId } = useAePermissions();
      const loading = ref(true);
      const classrooms = ref([]);

      const facilityHref = computed(
        () => urls['kolibri:kolibri.plugins.facility:facility_management'](),
      );

      onMounted(() => {
        ClassroomResource.fetchCollection({
          getParams: { facility: userFacilityId.value },
        })
          .then(result => {
            classrooms.value = result || [];
          })
          .catch(() => {
            classrooms.value = [];
          })
          .finally(() => {
            loading.value = false;
          });
      });

      return {
        classesTitle$,
        openFacilityClasses$,
        learnersEmpty$,
        loading,
        classrooms,
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
    margin: 0;
    font-weight: 600;
  }
</style>
