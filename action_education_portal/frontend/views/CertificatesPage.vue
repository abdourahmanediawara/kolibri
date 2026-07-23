<template>
  <AppBarPage :title="certificatesTitle$()">
    <KPageContainer>
      <div
        class="certs-page"
        :style="{ color: $themeTokens.text }"
      >
        <p
          v-if="!canManage"
          role="alert"
        >
          {{ trainerStaffOnly$() }}
        </p>

        <template v-else>
          <p
            class="intro"
            :style="{ color: $themeTokens.annotation }"
          >
            {{ certificatesIntro$() }}
          </p>

          <section
            class="issue-card"
            :style="{
              backgroundColor: $themeTokens.surface,
              borderColor: $themeTokens.fineLine,
            }"
          >
            <h2 class="section-title">
              {{ issueCertificateTitle$() }}
            </h2>
            <KTextbox
              v-model="form.learnerUsername"
              :label="learnerUsernameLabel$()"
              :floatingLabel="false"
              autocomplete="off"
            />
            <label class="select-label">{{ trainingSelectLabel$() }}</label>
            <select
              v-model="form.trainingId"
              class="select"
            >
              <option value="">
                {{ trainingSelectPlaceholder$() }}
              </option>
              <option
                v-for="training in trainings"
                :key="training.id"
                :value="training.id"
              >
                {{ training.title }}
              </option>
            </select>
            <KButton
              :text="issueCertificateAction$()"
              :primary="true"
              :disabled="issuing"
              @click="issue"
            />
            <p
              v-if="message"
              role="status"
            >
              {{ message }}
            </p>
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
  import { computed, onMounted, reactive, ref } from 'vue';
  import urls from 'kolibri/urls';
  import useUser from 'kolibri/composables/useUser';
  import AppBarPage from 'kolibri/components/pages/AppBarPage';
  import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
  import { portalStrings } from '../strings';
  import { useTrainingApi } from '../composables/useTrainingApi';

  export default {
    name: 'CertificatesPage',
    components: {
      AppBarPage,
    },
    setup() {
      const {
        certificatesTitle$,
        certificatesIntro$,
        trainerStaffOnly$,
        issueCertificateTitle$,
        learnerUsernameLabel$,
        trainingSelectLabel$,
        trainingSelectPlaceholder$,
        issueCertificateAction$,
        certificatesEmpty$,
        printCertificateAction$,
        certificateIssued$,
        certificateIssueError$,
        backHome$,
      } = portalStrings;

      const { isCoach, isAdmin, isSuperuser, userFacilityId } = useUser();
      const api = useTrainingApi();
      const canManage = computed(
        () => isCoach.value || isAdmin.value || isSuperuser.value,
      );
      const loading = ref(true);
      const issuing = ref(false);
      const trainings = ref([]);
      const certificates = ref([]);
      const usersById = ref({});
      const message = ref('');
      const form = reactive({
        learnerUsername: '',
        trainingId: '',
      });

      const homeHref = computed(() => urls['kolibri:action_education_portal:portal']());

      function refresh() {
        loading.value = true;
        return Promise.all([
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
            trainings.value = trainingList || [];
            const umap = {};
            (users || []).forEach(u => {
              umap[u.id] = u;
            });
            usersById.value = umap;
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
      }

      function issue() {
        message.value = '';
        const username = form.learnerUsername.trim();
        if (!username || !form.trainingId) {
          message.value = certificateIssueError$();
          return;
        }
        const learner = Object.values(usersById.value).find(
          u => (u.username || '').toLowerCase() === username.toLowerCase(),
        );
        if (!learner) {
          message.value = certificateIssueError$();
          return;
        }
        issuing.value = true;
        api
          .issueCertificate({
            learner: learner.id,
            training: form.trainingId,
          })
          .then(() => {
            message.value = certificateIssued$();
            form.learnerUsername = '';
            return refresh();
          })
          .catch(() => {
            message.value = certificateIssueError$();
          })
          .finally(() => {
            issuing.value = false;
          });
      }

      onMounted(() => {
        if (canManage.value) {
          refresh();
        } else {
          loading.value = false;
        }
      });

      return {
        certificatesTitle$,
        certificatesIntro$,
        trainerStaffOnly$,
        issueCertificateTitle$,
        learnerUsernameLabel$,
        trainingSelectLabel$,
        trainingSelectPlaceholder$,
        issueCertificateAction$,
        certificatesEmpty$,
        printCertificateAction$,
        backHome$,
        canManage,
        loading,
        issuing,
        trainings,
        certificates,
        form,
        message,
        homeHref,
        issue,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .certs-page {
    max-width: 880px;
    margin: 0 auto;
    padding: 16px 8px 32px;
  }

  .intro {
    margin: 0 0 16px;
  }

  .issue-card,
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

  .select-label {
    display: block;
    margin: 8px 0 4px;
  }

  .select {
    display: block;
    width: 100%;
    max-width: 420px;
    min-height: 44px;
    margin-bottom: 12px;
    padding: 8px;
    font-size: 1rem;
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

  .back {
    margin-top: 24px;
  }
</style>
