<template>
  <div
    class="ae-page"
    :style="{ color: $themeTokens.text }"
  >
    <p
      v-if="!canManageSessions"
      role="alert"
    >
      {{ trainerStaffOnly$() }}
    </p>

    <template v-else>
      <KCircularLoader
        v-if="loading"
        :delay="false"
      />

      <template v-else>
        <header class="header">
          <h1 class="title">
            {{ sessionHeading }}
          </h1>
          <p :style="{ color: $themeTokens.annotation }">
            {{ sessionMeta }}
          </p>
        </header>

        <section
          class="enroll-card"
          :style="{
            backgroundColor: $themeTokens.surface,
            borderColor: $themeTokens.fineLine,
          }"
        >
          <h2 class="section-title">
            {{ enrollTitle$() }}
          </h2>
          <KTextbox
            v-model="learnerUsername"
            :label="learnerUsernameLabel$()"
            :floatingLabel="false"
            autocomplete="off"
          />
          <KButton
            :text="enrollAction$()"
            :primary="true"
            :disabled="enrolling"
            @click="enrollLearner"
          />
          <p
            v-if="enrollMessage"
            role="status"
          >
            {{ enrollMessage }}
          </p>
        </section>

        <p
          v-if="!rows.length"
          :style="{ color: $themeTokens.annotation }"
        >
          {{ attendanceEmpty$() }}
        </p>

        <ul
          v-else
          class="rows"
        >
          <li
            v-for="row in rows"
            :key="row.learnerId"
            class="row"
            :style="{
              backgroundColor: $themeTokens.surface,
              borderColor: $themeTokens.fineLine,
            }"
          >
            <div class="learner">
              <p class="learner-name">
                {{ row.name }}
              </p>
              <p :style="{ color: $themeTokens.annotation }">
                {{ row.statusLabel }}
              </p>
            </div>
            <div class="actions">
              <KButton
                v-for="status in statusOptions"
                :key="status.value"
                :text="status.label"
                :primary="row.status === status.value"
                appearance="flat-button"
                :disabled="savingId === row.learnerId"
                @click="setStatus(row, status.value)"
              />
            </div>
          </li>
        </ul>
      </template>
    </template>

    <p class="back">
      <router-link
        to="/ae/coach/sessions"
        :style="{ color: $themeTokens.primary }"
      >
        {{ backToSessions$() }}
      </router-link>
    </p>
  </div>
</template>

<script>
  import { computed, onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router/composables';
  import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';
  import { useTrainingApi } from '../../composables/useTrainingApi';

  export default {
    name: 'AeCoachSessionDetailPage',
    setup() {
      const {
        attendancePageTitle$,
        trainerStaffOnly$,
        enrollTitle$,
        learnerUsernameLabel$,
        enrollAction$,
        attendanceEmpty$,
        backToSessions$,
        statusPresent$,
        statusAbsent$,
        statusLate$,
        statusExcused$,
        statusNone$,
        enrollSuccess$,
        enrollError$,
        saveError$,
      } = portalStrings;

      const route = useRoute();
      const { canManageSessions, currentUserId, userFacilityId } = useAePermissions();
      const api = useTrainingApi();

      const loading = ref(true);
      const enrolling = ref(false);
      const savingId = ref('');
      const session = ref(null);
      const training = ref(null);
      const rows = ref([]);
      const learnerUsername = ref('');
      const enrollMessage = ref('');

      const statusOptions = computed(() => [
        { value: 'present', label: statusPresent$() },
        { value: 'absent', label: statusAbsent$() },
        { value: 'late', label: statusLate$() },
        { value: 'excused', label: statusExcused$() },
      ]);

      const sessionHeading = computed(() => {
        if (training.value && training.value.title) {
          return training.value.title;
        }
        return attendancePageTitle$();
      });

      const sessionMeta = computed(() => {
        if (!session.value) {
          return '';
        }
        const parts = [];
        if (session.value.location) {
          parts.push(session.value.location);
        }
        if (session.value.start_datetime) {
          parts.push(String(session.value.start_datetime).slice(0, 19));
        }
        return parts.join(' · ');
      });

      function statusLabel(status) {
        const found = statusOptions.value.find(item => item.value === status);
        return found ? found.label : statusNone$();
      }

      function refresh() {
        const sessionId = route.params.sessionId;
        loading.value = true;
        enrollMessage.value = '';
        return api
          .fetchSession(sessionId)
          .then(sessionData => {
            session.value = sessionData;
            return Promise.all([
              api.fetchTrainings(),
              api.fetchEnrollments(),
              api.fetchAttendances(),
              FacilityUserResource.fetchCollection({
                getParams: { member_of: userFacilityId.value },
              }),
            ]).then(([trainings, enrollments, attendances, users]) => {
              training.value = (trainings || []).find(t => t.id === sessionData.training) || null;
              const userMap = {};
              (users || []).forEach(u => {
                userMap[u.id] = u;
              });
              const sessionEnrollments = (enrollments || []).filter(
                e => e.session === sessionId || e.training === sessionData.training,
              );
              const attendanceByLearner = {};
              (attendances || [])
                .filter(a => a.session === sessionId)
                .forEach(a => {
                  attendanceByLearner[a.learner] = a;
                });
              rows.value = sessionEnrollments.map(enrollment => {
                const user = userMap[enrollment.learner] || {};
                const attendance = attendanceByLearner[enrollment.learner];
                return {
                  learnerId: enrollment.learner,
                  name: user.full_name || user.username || enrollment.learner,
                  attendanceId: attendance ? attendance.id : null,
                  status: attendance ? attendance.status : '',
                  statusLabel: statusLabel(attendance ? attendance.status : ''),
                };
              });
            });
          })
          .finally(() => {
            loading.value = false;
          });
      }

      function enrollLearner() {
        enrollMessage.value = '';
        const username = learnerUsername.value.trim();
        if (!username || !session.value) {
          enrollMessage.value = enrollError$();
          return;
        }
        enrolling.value = true;
        FacilityUserResource.fetchCollection({
          getParams: { member_of: userFacilityId.value },
        })
          .then(users => {
            const learner = (users || []).find(
              u => (u.username || '').toLowerCase() === username.toLowerCase(),
            );
            if (!learner) {
              throw new Error('not found');
            }
            return api.createEnrollment({
              training: session.value.training,
              session: session.value.id,
              learner: learner.id,
              status: 'active',
            });
          })
          .then(() => {
            enrollMessage.value = enrollSuccess$();
            learnerUsername.value = '';
            return refresh();
          })
          .catch(() => {
            enrollMessage.value = enrollError$();
          })
          .finally(() => {
            enrolling.value = false;
          });
      }

      function setStatus(row, status) {
        savingId.value = row.learnerId;
        const payload = {
          session: session.value.id,
          learner: row.learnerId,
          status,
          recorded_by: currentUserId.value,
          comment: '',
        };
        const request = row.attendanceId
          ? api.updateAttendance(row.attendanceId, { status, recorded_by: currentUserId.value })
          : api.createAttendance(payload);
        request
          .then(() => refresh())
          .catch(() => {
            enrollMessage.value = saveError$();
          })
          .finally(() => {
            savingId.value = '';
          });
      }

      onMounted(() => {
        if (canManageSessions.value) {
          refresh();
        } else {
          loading.value = false;
        }
      });

      return {
        trainerStaffOnly$,
        enrollTitle$,
        learnerUsernameLabel$,
        enrollAction$,
        attendanceEmpty$,
        backToSessions$,
        canManageSessions,
        loading,
        enrolling,
        savingId,
        rows,
        learnerUsername,
        enrollMessage,
        statusOptions,
        sessionHeading,
        sessionMeta,
        enrollLearner,
        setStatus,
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
  }

  .enroll-card,
  .row {
    margin-bottom: 12px;
    padding: 16px;
    border: 1px solid;
    border-radius: 8px;
  }

  .section-title,
  .learner-name {
    margin: 0 0 8px;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .rows {
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

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .back {
    margin-top: 24px;
  }
</style>
