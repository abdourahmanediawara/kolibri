<template>
  <div
    class="ae-page"
    :style="{ color: $themeTokens.text }"
  >
    <h1 class="title">
      {{ resultsTitle$() }}
    </h1>
    <p
      class="intro"
      :style="{ color: $themeTokens.annotation }"
    >
      {{ resultsIntro$() }}
    </p>

    <section
      class="block"
      :style="{
        backgroundColor: $themeTokens.surface,
        borderColor: $themeTokens.fineLine,
      }"
    >
      <h2 class="section-title">
        {{ exportCertificatesTitle$() }}
      </h2>
      <KButton
        :text="downloadCsvAction$()"
        :primary="true"
        :href="certificatesCsvHref"
      />
    </section>

    <KCircularLoader
      v-if="loading"
      :delay="false"
    />

    <p
      v-else-if="!certificates.length"
      :style="{ color: $themeTokens.annotation }"
    >
      {{ certificatesEmpty$() }}
    </p>

    <ul
      v-else
      class="list"
    >
      <li
        v-for="cert in certificates"
        :key="cert.id"
        class="row"
        :style="{
          backgroundColor: $themeTokens.surface,
          borderColor: $themeTokens.fineLine,
        }"
      >
        <div>
          <p class="row-title">
            {{ cert.number }}
          </p>
          <p :style="{ color: $themeTokens.annotation }">
            {{ cert.meta }}
          </p>
        </div>
        <KButton
          :text="printCertificateAction$()"
          :primary="true"
          :href="cert.printHref"
          target="_blank"
        />
      </li>
    </ul>
  </div>
</template>

<script>
  import { computed, onMounted, ref } from 'vue';
  import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';
  import { useTrainingApi } from '../../composables/useTrainingApi';

  export default {
    name: 'AeCoachResultsPage',
    setup() {
      const {
        resultsTitle$,
        resultsIntro$,
        exportCertificatesTitle$,
        downloadCsvAction$,
        certificatesEmpty$,
        printCertificateAction$,
      } = portalStrings;

      const { userFacilityId } = useAePermissions();
      const api = useTrainingApi();
      const loading = ref(true);
      const certificates = ref([]);

      const certificatesCsvHref = computed(() => api.certificatesExportUrl());

      onMounted(() => {
        Promise.all([
          api.fetchTrainings(),
          api.fetchCertificates(),
          FacilityUserResource.fetchCollection({
            getParams: { member_of: userFacilityId.value },
          }),
        ])
          .then(([trainingList, certList, users]) => {
            const tmap = {};
            (trainingList || []).forEach(t => {
              tmap[t.id] = t;
            });
            const umap = {};
            (users || []).forEach(u => {
              umap[u.id] = u;
            });
            certificates.value = (certList || []).map(c => {
              const learner = umap[c.learner] || {};
              const training = tmap[c.training] || {};
              return {
                id: c.id,
                number: c.certificate_number,
                meta: [
                  learner.full_name || learner.username || c.learner,
                  training.title || c.training,
                ]
                  .filter(Boolean)
                  .join(' · '),
                printHref: api.certificatePrintUrl(c.id),
              };
            });
          })
          .finally(() => {
            loading.value = false;
          });
      });

      return {
        resultsTitle$,
        resultsIntro$,
        exportCertificatesTitle$,
        downloadCsvAction$,
        certificatesEmpty$,
        printCertificateAction$,
        loading,
        certificates,
        certificatesCsvHref,
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
    margin: 0 0 8px;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .intro {
    margin: 0 0 16px;
  }

  .block,
  .row {
    margin-bottom: 16px;
    padding: 16px;
    border: 1px solid;
    border-radius: 8px;
  }

  .section-title,
  .row-title {
    margin: 0 0 8px;
    font-weight: 600;
  }

  .list {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
  }
</style>
