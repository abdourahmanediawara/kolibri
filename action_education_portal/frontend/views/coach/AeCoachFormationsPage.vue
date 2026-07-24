<template>
  <div
    class="ae-page"
    :style="{ color: $themeTokens.text }"
  >
    <h1 class="title">
      {{ dashTrainingsLabel$() }}
    </h1>

    <KCircularLoader
      v-if="loading"
      :delay="false"
    />

    <p
      v-else-if="!trainings.length"
      :style="{ color: $themeTokens.annotation }"
    >
      {{ emptyFormationsStaff$() }}
    </p>

    <ul
      v-else
      class="list"
    >
      <li
        v-for="training in trainings"
        :key="training.id"
        class="card"
        :style="{
          backgroundColor: $themeTokens.surface,
          borderColor: $themeTokens.fineLine,
        }"
      >
        <p class="card-title">
          {{ training.title }}
        </p>
        <p
          v-if="training.description"
          :style="{ color: $themeTokens.annotation }"
        >
          {{ training.description }}
        </p>
      </li>
    </ul>
  </div>
</template>

<script>
  import { onMounted, ref } from 'vue';
  import { portalStrings } from '../../strings';
  import { useTrainingApi } from '../../composables/useTrainingApi';

  export default {
    name: 'AeCoachFormationsPage',
    setup() {
      const { dashTrainingsLabel$, emptyFormationsStaff$ } = portalStrings;
      const api = useTrainingApi();
      const loading = ref(true);
      const trainings = ref([]);

      onMounted(() => {
        api
          .fetchTrainings()
          .then(list => {
            trainings.value = list || [];
          })
          .finally(() => {
            loading.value = false;
          });
      });

      return {
        dashTrainingsLabel$,
        emptyFormationsStaff$,
        loading,
        trainings,
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

  .card {
    margin-bottom: 12px;
    padding: 16px;
    border: 1px solid;
    border-radius: 8px;
  }

  .card-title {
    margin: 0 0 4px;
    font-size: 1.1rem;
    font-weight: 600;
  }
</style>
