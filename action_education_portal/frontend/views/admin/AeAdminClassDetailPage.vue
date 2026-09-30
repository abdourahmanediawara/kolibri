<template>

  <div class="ae-class">
    <AePageHeader
      :title="classroom ? classroom.name : classesTitle$()"
      :crumbs="[{ label: classesTitle$(), to: { name: 'AeAdminClasses' } }]"
      :back="{ label: allClassesLink$(), to: { name: 'AeAdminClasses' } }"
      icon="users"
      :subtitle="classDetailSubtitle$()"
    >
      <template
        v-if="classroom"
        #actions
      >
        <div class="ae-class-options">
          <button
            ref="optionsButton"
            type="button"
            class="ae-class-options-btn"
            aria-haspopup="menu"
            :aria-expanded="optionsOpen ? 'true' : 'false'"
            @click="optionsOpen = !optionsOpen"
          >
            <span>{{ classOptions$() }}</span>
            <AeIcon
              name="chevronDown"
              :size="18"
            />
          </button>
          <ul
            v-if="optionsOpen"
            class="ae-class-menu"
            role="menu"
            @keydown.esc="closeOptions"
          >
            <li role="none">
              <button
                type="button"
                role="menuitem"
                @click="openCopy"
              >
                <AeIcon
                  name="copy"
                  :size="18"
                />
                <span>{{ copyClass$() }}</span>
              </button>
            </li>
            <li role="none">
              <button
                type="button"
                role="menuitem"
                @click="openRename"
              >
                <AeIcon
                  name="pencil"
                  :size="18"
                />
                <span>{{ renameClass$() }}</span>
              </button>
            </li>
            <li
              role="none"
              class="ae-class-menu-danger"
            >
              <button
                type="button"
                role="menuitem"
                @click="openDelete"
              >
                <AeIcon
                  name="trash"
                  :size="18"
                />
                <span>{{ deleteClass$() }}</span>
              </button>
            </li>
          </ul>
        </div>
      </template>
    </AePageHeader>

    <KCircularLoader
      v-if="loading"
      :delay="false"
    />
    <div
      v-else-if="loadFailed"
      class="ae-class-alert"
      role="alert"
    >
      <p>{{ loadError$() }}</p>
      <button
        type="button"
        class="ae-class-outline"
        @click="load"
      >
        {{ retryAction$() }}
      </button>
    </div>

    <template v-else-if="classroom">
      <!-- Summary -->
      <section class="ae-class-summary">
        <div class="ae-class-kpi">
          <span
            class="ae-class-kpi-icon ae-class-tone-orange"
            aria-hidden="true"
          >
            <AeIcon
              name="graduationCap"
              :size="24"
            />
          </span>
          <span class="ae-class-kpi-text">
            <strong>{{ coaches.length }}</strong>
            <span>{{ classCoachesLabel$({ count: coaches.length }) }}</span>
          </span>
        </div>
        <div class="ae-class-kpi">
          <span
            class="ae-class-kpi-icon ae-class-tone-blue"
            aria-hidden="true"
          >
            <AeIcon
              name="users"
              :size="24"
            />
          </span>
          <span class="ae-class-kpi-text">
            <strong>{{ learners.length }}</strong>
            <span>{{ classLearnersLabel$({ count: learners.length }) }}</span>
          </span>
        </div>
        <img
          class="ae-class-summary-art"
          :src="artSrc"
          alt=""
        >
      </section>

      <!-- Trainers -->
      <section
        class="ae-class-card"
        aria-labelledby="ae-class-coaches-title"
      >
        <header class="ae-class-card-head">
          <span
            class="ae-class-card-icon ae-class-tone-orange"
            aria-hidden="true"
          >
            <AeIcon
              name="graduationCap"
              :size="20"
            />
          </span>
          <h2
            id="ae-class-coaches-title"
            class="ae-class-card-title"
          >
            {{ coachesTitle$() }}
          </h2>
          <span class="ae-class-count">{{ coaches.length }}</span>
          <button
            v-if="coaches.length"
            type="button"
            class="ae-class-outline ae-class-card-action"
            @click="coachPickerOpen = true"
          >
            <AeIcon
              name="plus"
              :size="18"
            />
            <span>{{ assignCoachAction$() }}</span>
          </button>
        </header>

        <div
          v-if="!coaches.length"
          class="ae-class-empty"
        >
          <AeIcon
            name="graduationCap"
            :size="36"
          />
          <p class="ae-class-empty-title">
            {{ noCoachAssignedTitle$() }}
          </p>
          <p>{{ noCoachAssignedText$() }}</p>
          <button
            type="button"
            class="ae-class-primary"
            @click="coachPickerOpen = true"
          >
            <AeIcon
              name="plus"
              :size="18"
            />
            <span>{{ assignCoachAction$() }}</span>
          </button>
        </div>
        <div
          v-else
          class="ae-class-table-wrap ae-class-coaches"
        >
          <table class="ae-class-table">
            <thead>
              <tr>
                <th scope="col">
                  {{ fullNameLabel$() }}
                </th>
                <th scope="col">
                  {{ usernameLabel$() }}
                </th>
                <th scope="col">
                  {{ roleColumn$() }}
                </th>
                <th
                  scope="col"
                  class="ae-class-actions-cell"
                >
                  {{ columnActions$() }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="coach in coaches"
                :key="coach.roleId"
              >
                <td>
                  <span class="ae-class-person">
                    <AeAvatar
                      :name="coach.name"
                      :toneKey="coach.id"
                    />
                    <span>{{ coach.name }}</span>
                  </span>
                </td>
                <td class="ae-class-muted">
                  {{ coach.username }}
                </td>
                <td>
                  <span class="ae-class-role">{{ coach.coachRoleLabel }}</span>
                </td>
                <td class="ae-class-actions-cell">
                  <button
                    type="button"
                    class="ae-class-remove"
                    :disabled="busy"
                    :aria-label="removeFromClassOf$({ name: coach.name })"
                    @click="removeCoach(coach)"
                  >
                    <AeIcon
                      name="userMinus"
                      :size="18"
                    />
                    <span>{{ removeFromClass$() }}</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Learners -->
      <section
        class="ae-class-card ae-class-learners-card"
        aria-labelledby="ae-class-learners-title"
      >
        <header class="ae-class-card-head">
          <span
            class="ae-class-card-icon ae-class-tone-blue"
            aria-hidden="true"
          >
            <AeIcon
              name="users"
              :size="20"
            />
          </span>
          <h2
            id="ae-class-learners-title"
            class="ae-class-card-title"
          >
            {{ learnersTitle$() }}
          </h2>
          <span class="ae-class-count">{{ learners.length }}</span>
          <button
            type="button"
            class="ae-class-primary ae-class-card-action"
            @click="learnerPickerOpen = true"
          >
            <AeIcon
              name="plus"
              :size="18"
            />
            <span>{{ enrollLearnersTitle$() }}</span>
          </button>
        </header>

        <div
          v-if="!learners.length"
          class="ae-class-empty"
        >
          <AeIcon
            name="users"
            :size="36"
          />
          <p class="ae-class-empty-title">
            {{ noLearnerEnrolledTitle$() }}
          </p>
          <p>{{ noLearnerEnrolledText$() }}</p>
        </div>
        <template v-else>
          <label class="ae-class-search">
            <AeIcon
              name="search"
              class="ae-class-search-icon"
              :size="20"
            />
            <span class="ae-class-visually-hidden">{{ searchLearnerPlaceholder$() }}</span>
            <input
              v-model="learnerQuery"
              type="search"
              autocomplete="off"
              :placeholder="searchLearnerPlaceholder$()"
            >
          </label>
          <div class="ae-class-table-wrap ae-class-learners">
            <table
              v-if="shownLearners.length"
              class="ae-class-table"
            >
              <thead>
                <tr>
                  <th scope="col">
                    {{ fullNameLabel$() }}
                  </th>
                  <th scope="col">
                    {{ usernameLabel$() }}
                  </th>
                  <th
                    scope="col"
                    class="ae-class-actions-cell"
                  >
                    {{ columnActions$() }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="learner in shownLearners"
                  :key="learner.membershipId"
                >
                  <td>
                    <span class="ae-class-person">
                      <AeAvatar
                        :name="learner.name"
                        :toneKey="learner.id"
                      />
                      <span>{{ learner.name }}</span>
                      <span
                        v-if="learner.roleLabel"
                        class="ae-class-tag"
                      >{{ learner.roleLabel }}</span>
                    </span>
                  </td>
                  <td class="ae-class-muted">
                    {{ learner.username }}
                  </td>
                  <td class="ae-class-actions-cell">
                    <button
                      type="button"
                      class="ae-class-remove"
                      :disabled="busy"
                      :aria-label="removeFromClassOf$({ name: learner.name })"
                      @click="removeLearner(learner)"
                    >
                      <AeIcon
                        name="userMinus"
                        :size="18"
                      />
                      <span>{{ removeFromClass$() }}</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <p
              v-else
              class="ae-class-no-match"
            >
              {{ noPeopleMatch$() }}
            </p>
          </div>
        </template>
        <p class="ae-class-note">
          <AeIcon
            name="circleAlert"
            :size="18"
          />
          <span>{{ removeKeepsAccount$() }}</span>
        </p>
      </section>
    </template>

    <AePeoplePickerDialog
      :open="coachPickerOpen"
      :title="assignCoachesTitle$()"
      :subtitle="classroom ? classroom.name : ''"
      :intro="assignCoachesIntro$()"
      icon="userPlus"
      titleId="ae-assign-coaches-title"
      :people="coachCandidates"
      :roleOptions="staffRoleOptions"
      :roleColumnLabel="roleColumn$()"
      :note="assignCoachesNote$()"
      :confirmLabel="count => assignCoachesConfirm$({ count })"
      :busy="busy"
      :alert="pickerAlert"
      @close="closePickers"
      @confirm="assignCoaches"
    />
    <AePeoplePickerDialog
      :open="learnerPickerOpen"
      :title="enrollLearnersTitle$()"
      :subtitle="classroom ? classroom.name : ''"
      :intro="enrollLearnersIntro$()"
      icon="userPlus"
      titleId="ae-enroll-learners-title"
      :people="learnerCandidates"
      :roleOptions="allRoleOptions"
      :roleColumnLabel="accountRoleColumn$()"
      :note="enrollLearnersNote$()"
      :confirmLabel="count => enrollLearnersConfirm$({ count })"
      :busy="busy"
      :alert="pickerAlert"
      @close="closePickers"
      @confirm="enrollLearners"
    />

    <!-- Rename -->
    <KModal
      v-if="renaming"
      :title="renameClass$()"
      :submitText="saveChangesAction$()"
      :cancelText="cancelAction$()"
      :submitDisabled="busy"
      @submit="rename"
      @cancel="renaming = false"
    >
      <div class="ae-class-field">
        <label for="ae-class-rename">{{ classNameLabel$() }}</label>
        <input
          id="ae-class-rename"
          ref="renameField"
          v-model="newName"
          type="text"
          maxlength="100"
          autocomplete="off"
          :aria-invalid="nameError ? 'true' : 'false'"
          aria-describedby="ae-class-rename-error"
          @keydown.enter.prevent="rename"
        >
        <p
          v-if="nameError"
          id="ae-class-rename-error"
          class="ae-class-field-error"
          role="alert"
        >
          {{ nameError }}
        </p>
      </div>
    </KModal>

    <!-- Copy -->
    <KModal
      v-if="copying"
      :title="copyClass$()"
      :submitText="copyAction$()"
      :cancelText="cancelAction$()"
      :submitDisabled="busy"
      @submit="copy"
      @cancel="copying = false"
    >
      <p class="ae-class-modal-text">
        {{ copyClassText$() }}
      </p>
      <div class="ae-class-field">
        <label for="ae-class-copy">{{ classNameLabel$() }}</label>
        <input
          id="ae-class-copy"
          ref="copyField"
          v-model="newName"
          type="text"
          maxlength="100"
          autocomplete="off"
          :aria-invalid="nameError ? 'true' : 'false'"
          aria-describedby="ae-class-copy-error"
          @keydown.enter.prevent="copy"
        >
        <p
          v-if="nameError"
          id="ae-class-copy-error"
          class="ae-class-field-error"
          role="alert"
        >
          {{ nameError }}
        </p>
      </div>
      <label class="ae-class-check">
        <input
          v-model="copyCoaches"
          type="checkbox"
        >
        <span>{{ copyCoachesLabel$({ count: coaches.length }) }}</span>
      </label>
      <label class="ae-class-check">
        <input
          v-model="copyLearners"
          type="checkbox"
        >
        <span>{{ copyLearnersLabel$({ count: learners.length }) }}</span>
      </label>
    </KModal>

    <!-- Delete -->
    <KModal
      v-if="deleting"
      :title="deleteClassTitle$()"
      :submitText="deleteAction$()"
      :cancelText="cancelAction$()"
      :submitDisabled="busy"
      @submit="remove"
      @cancel="deleting = false"
    >
      <p class="ae-class-modal-text">
        {{ deleteClassText$({ name: classroom ? classroom.name : '' }) }}
      </p>
    </KModal>
  </div>

</template>


<script>

  import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router/composables';
  import urls from 'kolibri/urls';
  import { ERROR_CONSTANTS, UserKinds } from 'kolibri/constants';
  import { coreStrings } from 'kolibri/uiText/commonCoreStrings';
  import { currentLanguage } from 'kolibri/utils/i18n';
  import CatchErrors from 'kolibri/utils/CatchErrors';
  import useSnackbar from 'kolibri/composables/useSnackbar';
  import ClassroomResource from 'kolibri-common/apiResources/ClassroomResource';
  import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
  import MembershipResource from 'kolibri-common/apiResources/MembershipResource';
  import RoleResource from 'kolibri-common/apiResources/RoleResource';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';
  import AeAvatar from '../AeAvatar';
  import AeIcon from '../AeIcon';
  import AePageHeader from '../AePageHeader';
  import AePeoplePickerDialog from '../AePeoplePickerDialog';

  const TEMPLATE_STRINGS = [
    'classesTitle$',
    'allClassesLink$',
    'classDetailSubtitle$',
    'classOptions$',
    'copyClass$',
    'renameClass$',
    'deleteClass$',
    'loadError$',
    'retryAction$',
    'classCoachesLabel$',
    'classLearnersLabel$',
    'coachesTitle$',
    'learnersTitle$',
    'assignCoachAction$',
    'noCoachAssignedTitle$',
    'noCoachAssignedText$',
    'fullNameLabel$',
    'usernameLabel$',
    'roleColumn$',
    'accountRoleColumn$',
    'columnActions$',
    'removeFromClass$',
    'removeFromClassOf$',
    'enrollLearnersTitle$',
    'noLearnerEnrolledTitle$',
    'noLearnerEnrolledText$',
    'searchLearnerPlaceholder$',
    'noPeopleMatch$',
    'removeKeepsAccount$',
    'assignCoachesTitle$',
    'assignCoachesIntro$',
    'assignCoachesNote$',
    'assignCoachesConfirm$',
    'enrollLearnersIntro$',
    'enrollLearnersNote$',
    'enrollLearnersConfirm$',
    'saveChangesAction$',
    'classNameLabel$',
    'copyAction$',
    'copyClassText$',
    'copyCoachesLabel$',
    'copyLearnersLabel$',
    'deleteClassTitle$',
    'deleteClassText$',
    'deleteAction$',
  ];

  // Facility-wide role of an account, the strongest first.
  function accountRole(user, facilityId) {
    if (user.is_superuser) {
      return 'superuser';
    }
    const kinds = (user.roles || [])
      .filter(role => role.collection === facilityId)
      .map(role => role.kind);
    if (kinds.includes(UserKinds.ADMIN)) {
      return 'admin';
    }
    if (kinds.includes(UserKinds.COACH)) {
      return 'coach';
    }
    if ((user.roles || []).some(role => role.kind === UserKinds.ASSIGNABLE_COACH)) {
      return 'classCoach';
    }
    return 'learner';
  }

  function normalize(text) {
    return String(text || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase();
  }

  /**
   * One class for admins: its trainers and learners, who can be added with the
   * people picker or removed (their accounts stay); options to copy, rename or delete it.
   */
  export default {
    name: 'AeAdminClassDetailPage',
    components: { AeAvatar, AeIcon, AePageHeader, AePeoplePickerDialog },
    setup() {
      const {
        roleSuperuser$,
        roleAdmin$,
        roleCoach$,
        roleFacilityCoach$,
        roleClassCoach$,
        roleLearner$,
        coachesAssigned$,
        assignCoachesError$,
        learnersEnrolledInClass$,
        enrollLearnersError$,
        removedFromClass$,
        saveError$,
        classNameRequired$,
        classNameTaken$,
        classRenamed$,
        classCopied$,
        copyClassDefaultName$,
        classDeleted$,
      } = portalStrings;
      const { cancelAction$ } = coreStrings;
      const templateStrings = Object.fromEntries(
        TEMPLATE_STRINGS.map(name => [name, portalStrings[name]]),
      );

      const ROLE_LABELS = {
        superuser: roleSuperuser$,
        admin: roleAdmin$,
        coach: roleCoach$,
        classCoach: roleClassCoach$,
      };

      const route = useRoute();
      const router = useRouter();
      const { createSnackbar } = useSnackbar();
      const { userFacilityId } = useAePermissions();

      const classroom = ref(null);
      const users = ref([]);
      const roles = ref([]);
      const memberships = ref([]);
      const loading = ref(true);
      const loadFailed = ref(false);
      const busy = ref(false);
      const learnerQuery = ref('');
      const coachPickerOpen = ref(false);
      const learnerPickerOpen = ref(false);
      const pickerAlert = ref(null);
      const optionsOpen = ref(false);
      const optionsButton = ref(null);
      const renaming = ref(false);
      const copying = ref(false);
      const deleting = ref(false);
      const newName = ref('');
      const nameError = ref('');
      const copyCoaches = ref(true);
      const copyLearners = ref(true);
      const renameField = ref(null);
      const copyField = ref(null);

      const classId = computed(() => route.params.classId);
      const collator = new Intl.Collator(currentLanguage, { sensitivity: 'base' });

      const people = computed(() =>
        users.value.map(user => {
          const roleKey = accountRole(user, userFacilityId.value);
          return {
            id: user.id,
            name: user.full_name || user.username,
            username: user.username,
            roleKey,
            roleLabel: ROLE_LABELS[roleKey] ? ROLE_LABELS[roleKey]() : '',
          };
        }),
      );
      const peopleById = computed(() => {
        const byId = {};
        people.value.forEach(person => {
          byId[person.id] = person;
        });
        return byId;
      });

      const coaches = computed(() =>
        roles.value
          .filter(role => peopleById.value[role.user])
          .map(role => {
            const person = peopleById.value[role.user];
            return {
              ...person,
              roleId: role.id,
              coachRoleLabel: person.roleKey === 'coach' ? roleFacilityCoach$() : person.roleLabel,
            };
          })
          .sort((a, b) => collator.compare(a.name, b.name)),
      );

      const learners = computed(() =>
        memberships.value
          .filter(membership => peopleById.value[membership.user])
          .map(membership => ({
            ...peopleById.value[membership.user],
            membershipId: membership.id,
          }))
          .sort((a, b) => collator.compare(a.name, b.name)),
      );

      const shownLearners = computed(() => {
        const needle = normalize(learnerQuery.value.trim());
        return learners.value.filter(
          learner => !needle || normalize(`${learner.name} ${learner.username}`).includes(needle),
        );
      });

      // Only staff accounts can coach a class; people already in the list are left out.
      const coachCandidates = computed(() => {
        const taken = new Set(coaches.value.map(coach => coach.id));
        return people.value.filter(
          person => person.roleKey !== 'learner' && !taken.has(person.id),
        );
      });
      const learnerCandidates = computed(() => {
        const taken = new Set(learners.value.map(learner => learner.id));
        return people.value.filter(person => !taken.has(person.id));
      });

      const staffRoleOptions = [
        { value: 'superuser', label: roleSuperuser$() },
        { value: 'admin', label: roleAdmin$() },
        { value: 'coach', label: roleCoach$() },
        { value: 'classCoach', label: roleClassCoach$() },
      ];
      const allRoleOptions = [{ value: 'learner', label: roleLearner$() }, ...staffRoleOptions];

      async function load() {
        loading.value = true;
        loadFailed.value = false;
        try {
          const [room, userList, roleList, membershipList] = await Promise.all([
            ClassroomResource.fetchModel({ id: classId.value, force: true }),
            FacilityUserResource.fetchCollection({
              getParams: { member_of: userFacilityId.value },
              force: true,
            }),
            RoleResource.fetchCollection({
              getParams: { collection: classId.value, kind: UserKinds.COACH },
              force: true,
            }),
            MembershipResource.fetchCollection({
              getParams: { collection: classId.value },
              force: true,
            }),
          ]);
          classroom.value = room;
          users.value = userList || [];
          roles.value = roleList || [];
          memberships.value = membershipList || [];
        } catch (e) {
          loadFailed.value = true;
        } finally {
          loading.value = false;
        }
      }

      async function reloadMembers() {
        const [roleList, membershipList] = await Promise.all([
          RoleResource.fetchCollection({
            getParams: { collection: classId.value, kind: UserKinds.COACH },
            force: true,
          }),
          MembershipResource.fetchCollection({
            getParams: { collection: classId.value },
            force: true,
          }),
        ]);
        roles.value = roleList || [];
        memberships.value = membershipList || [];
      }

      function closePickers() {
        coachPickerOpen.value = false;
        learnerPickerOpen.value = false;
        pickerAlert.value = null;
      }

      async function assignCoaches(ids) {
        busy.value = true;
        pickerAlert.value = null;
        try {
          await RoleResource.saveCollection({
            data: ids.map(user => ({ collection: classId.value, user, kind: UserKinds.COACH })),
          });
          closePickers();
          createSnackbar(coachesAssigned$({ count: ids.length }));
          await reloadMembers();
        } catch (e) {
          pickerAlert.value = { text: assignCoachesError$() };
        } finally {
          busy.value = false;
        }
      }

      async function enrollLearners(ids) {
        busy.value = true;
        pickerAlert.value = null;
        try {
          await MembershipResource.saveCollection({
            data: ids.map(user => ({ collection: classId.value, user })),
          });
          closePickers();
          createSnackbar(learnersEnrolledInClass$({ count: ids.length }));
          await reloadMembers();
        } catch (e) {
          pickerAlert.value = { text: enrollLearnersError$() };
        } finally {
          busy.value = false;
        }
      }

      async function removeFrom(resource, id, name) {
        busy.value = true;
        try {
          await resource.deleteModel({ id });
          createSnackbar(removedFromClass$({ name }));
          await reloadMembers();
        } catch (e) {
          createSnackbar(saveError$());
        } finally {
          busy.value = false;
        }
      }

      function removeCoach(coach) {
        return removeFrom(RoleResource, coach.roleId, coach.name);
      }

      function removeLearner(learner) {
        return removeFrom(MembershipResource, learner.membershipId, learner.name);
      }

      // ---------- Options: copy, rename, delete ----------

      function closeOptions() {
        optionsOpen.value = false;
        nextTick(() => optionsButton.value && optionsButton.value.focus());
      }

      function onDocumentClick(event) {
        if (optionsOpen.value && !event.target.closest('.ae-class-options')) {
          optionsOpen.value = false;
        }
      }

      function openRename() {
        optionsOpen.value = false;
        newName.value = classroom.value.name;
        nameError.value = '';
        renaming.value = true;
        nextTick(() => renameField.value && renameField.value.select());
      }

      function openCopy() {
        optionsOpen.value = false;
        newName.value = copyClassDefaultName$({ name: classroom.value.name });
        nameError.value = '';
        copyCoaches.value = true;
        copyLearners.value = true;
        copying.value = true;
        nextTick(() => copyField.value && copyField.value.select());
      }

      function openDelete() {
        optionsOpen.value = false;
        deleting.value = true;
      }

      function checkName() {
        const name = newName.value.trim();
        nameError.value = name ? '' : classNameRequired$();
        return nameError.value ? '' : name;
      }

      function showSaveError(error) {
        nameError.value = CatchErrors(error, [ERROR_CONSTANTS.UNIQUE])
          ? classNameTaken$()
          : saveError$();
      }

      async function rename() {
        const name = checkName();
        if (!name || busy.value) {
          return;
        }
        busy.value = true;
        try {
          classroom.value = await ClassroomResource.saveModel({
            id: classId.value,
            data: { name },
            exists: true,
          });
          renaming.value = false;
          createSnackbar(classRenamed$({ name }));
        } catch (e) {
          showSaveError(e);
        } finally {
          busy.value = false;
        }
      }

      async function copy() {
        const name = checkName();
        if (!name || busy.value) {
          return;
        }
        busy.value = true;
        let created;
        try {
          created = await ClassroomResource.saveModel({
            data: { name, parent: userFacilityId.value },
          });
        } catch (e) {
          busy.value = false;
          showSaveError(e);
          return;
        }
        try {
          const requests = [];
          if (copyCoaches.value && coaches.value.length) {
            requests.push(
              RoleResource.saveCollection({
                data: coaches.value.map(coach => ({
                  collection: created.id,
                  user: coach.id,
                  kind: UserKinds.COACH,
                })),
              }),
            );
          }
          if (copyLearners.value && learners.value.length) {
            requests.push(
              MembershipResource.saveCollection({
                data: learners.value.map(learner => ({ collection: created.id, user: learner.id })),
              }),
            );
          }
          await Promise.all(requests);
          createSnackbar(classCopied$({ name }));
        } catch (e) {
          // The copy exists; its people can still be added from its page.
          createSnackbar(saveError$());
        } finally {
          busy.value = false;
        }
        copying.value = false;
        router.push({ name: 'AeAdminClassDetail', params: { classId: created.id } });
      }

      async function remove() {
        busy.value = true;
        const name = classroom.value.name;
        try {
          await ClassroomResource.deleteModel({ id: classId.value });
          deleting.value = false;
          createSnackbar(classDeleted$({ name }));
          router.push({ name: 'AeAdminClasses' });
        } catch (e) {
          deleting.value = false;
          createSnackbar(saveError$());
        } finally {
          busy.value = false;
        }
      }

      watch(classId, load);
      onMounted(() => {
        document.addEventListener('click', onDocumentClick);
        load();
      });
      onBeforeUnmount(() => {
        document.removeEventListener('click', onDocumentClick);
      });

      return {
        ...templateStrings,
        cancelAction$,
        artSrc: urls.static('action_education_portal/ae-sidebar-books.png'),
        classroom,
        loading,
        loadFailed,
        busy,
        coaches,
        learners,
        shownLearners,
        learnerQuery,
        coachCandidates,
        learnerCandidates,
        staffRoleOptions,
        allRoleOptions,
        coachPickerOpen,
        learnerPickerOpen,
        pickerAlert,
        optionsOpen,
        optionsButton,
        renaming,
        copying,
        deleting,
        newName,
        nameError,
        copyCoaches,
        copyLearners,
        renameField,
        copyField,
        load,
        closePickers,
        assignCoaches,
        enrollLearners,
        removeCoach,
        removeLearner,
        closeOptions,
        openRename,
        openCopy,
        openDelete,
        rename,
        copy,
        remove,
      };
    },
  };

</script>


<style lang="scss" scoped>

  @import '../../styles/tokens';
  @import '../../styles/components';

  .ae-class-visually-hidden {
    @include ae-visually-hidden;
  }

  .ae-class {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .ae-class-primary {
    @include ae-button-primary;

    min-height: 42px;
    padding: 0 18px;
    font-size: 16px;
  }

  .ae-class-outline {
    @include ae-button-outline;

    min-height: 42px;
  }

  .ae-class-alert {
    @include ae-card;

    color: var(--ae-danger);
  }

  /* ---------- Options ---------- */

  .ae-class-options {
    position: relative;
  }

  .ae-class-options-btn {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    min-height: 42px;
    padding: 0 14px;
    font: inherit;
    font-size: 14px;
    font-weight: 800;
    color: var(--ae-navy);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    cursor: pointer;
    background: var(--ae-surface);
    border: 1px solid var(--ae-line);
    border-radius: var(--ae-radius-sm);
    box-shadow: var(--ae-shadow-card);

    @include ae-focus-ring;
  }

  .ae-class-menu {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    z-index: 10;
    min-width: 220px;
    padding: 6px;
    margin: 0;
    list-style: none;
    background: var(--ae-surface);
    border: 1px solid var(--ae-line);
    border-radius: var(--ae-radius-md);
    box-shadow: var(--ae-shadow-raised);

    button {
      display: flex;
      gap: 10px;
      align-items: center;
      width: 100%;
      padding: 10px 12px;
      font: inherit;
      font-size: 15px;
      color: var(--ae-text);
      text-align: start;
      cursor: pointer;
      background: none;
      border: 0;
      border-radius: var(--ae-radius-sm);

      &:hover {
        background: var(--ae-surface-muted);
      }

      @include ae-focus-ring;
    }
  }

  .ae-class-menu-danger {
    padding-top: 4px;
    margin-top: 4px;
    border-top: 1px solid var(--ae-line);

    button {
      color: var(--ae-danger);
    }
  }

  /* ---------- Summary ---------- */

  .ae-class-summary {
    position: relative;
    display: flex;
    gap: 16px;
    align-items: center;
    min-height: 96px;
    padding: 14px 20px;
    overflow: hidden;
    background: linear-gradient(90deg, #feece1 0%, #fdefe6 60%, #fbede4 100%);
    border-radius: var(--ae-radius-lg);
  }

  .ae-class-kpi {
    display: flex;
    gap: 14px;
    align-items: center;
    min-width: 180px;
    padding: 12px 18px;
    background: var(--ae-surface);
    border-radius: var(--ae-radius-md);
    box-shadow: var(--ae-shadow-card);
  }

  .ae-class-kpi-icon,
  .ae-class-card-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
  }

  .ae-class-card-icon {
    width: 36px;
    height: 36px;
  }

  .ae-class-tone-orange {
    color: var(--ae-orange-deep);
    background: var(--ae-orange-wash);
  }

  .ae-class-tone-blue {
    color: #1f5f99;
    background: var(--ae-kpi-blue);
  }

  .ae-class-kpi-text {
    display: flex;
    flex-direction: column;
    line-height: 1.2;

    strong {
      font-size: 24px;
      font-weight: 800;
      color: var(--ae-navy);
    }

    span {
      font-size: 15px;
      color: var(--ae-text-muted);
    }
  }

  .ae-class-summary-art {
    width: 150px;
    height: 90px;
    margin-inline-start: auto;
    object-fit: contain;
  }

  /* ---------- Cards ---------- */

  .ae-class-card {
    @include ae-card;

    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px 18px;
  }

  .ae-class-card-head {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .ae-class-card-title {
    margin: 0;
    font-size: 20px;
    font-weight: 800;
    color: var(--ae-navy);
  }

  .ae-class-count {
    min-width: 28px;
    padding: 2px 10px;
    font-size: 14px;
    font-weight: 800;
    color: var(--ae-orange-deep);
    text-align: center;
    background: var(--ae-orange-wash);
    border-radius: 999px;
  }

  .ae-class-card-action {
    margin-inline-start: auto;
  }

  .ae-class-empty {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;
    padding: 10px;
    color: var(--ae-orange);
    text-align: center;

    p {
      margin: 0;
      color: var(--ae-text-muted);
    }

    .ae-class-empty-title {
      font-size: 17px;
      font-weight: 800;
      color: var(--ae-navy);
    }

    .ae-class-primary {
      margin-top: 8px;
    }
  }

  .ae-class-search {
    position: relative;

    input {
      @include ae-field;

      height: 42px;
      padding-inline-start: 44px;
    }
  }

  .ae-class-search-icon {
    position: absolute;
    top: 11px;
    inset-inline-start: 14px;
    color: var(--ae-text-subtle);
  }

  .ae-class-table-wrap {
    overflow-y: auto;
    border-radius: var(--ae-radius-sm);
  }

  .ae-class-table {
    width: 100%;
    border-collapse: collapse;

    th {
      position: sticky;
      top: 0;
      z-index: 1;
      padding: 8px 12px;
      font-size: 14px;
      font-weight: 700;
      color: var(--ae-navy);
      text-align: start;
      background: var(--ae-surface-muted);
    }

    td {
      padding: 6px 12px;
      font-size: 15px;
      border-bottom: 1px solid var(--ae-line);
    }
  }

  .ae-class-actions-cell {
    width: 1%;
    white-space: nowrap;
  }

  .ae-class-person {
    display: inline-flex;
    gap: 10px;
    align-items: center;
    font-weight: 600;
  }

  .ae-class-muted {
    color: var(--ae-text-muted);
  }

  .ae-class-role {
    display: inline-block;
    padding: 3px 10px;
    font-size: 13px;
    font-weight: 700;
    color: #ffffff;
    background: #5b5e78;
    border-radius: var(--ae-radius-sm);
  }

  .ae-class-tag {
    padding: 2px 8px;
    font-size: 12px;
    font-weight: 700;
    color: #ffffff;
    background: #5b5e78;
    border-radius: var(--ae-radius-sm);
  }

  .ae-class-remove {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    padding: 6px 8px;
    font: inherit;
    font-size: 15px;
    color: var(--ae-orange-ink);
    cursor: pointer;
    background: none;
    border: 0;
    border-radius: var(--ae-radius-sm);

    &:hover:not(:disabled) {
      background: var(--ae-orange-wash);
    }

    &:disabled {
      cursor: progress;
      opacity: 0.5;
    }

    @include ae-focus-ring;
  }

  .ae-class-no-match {
    padding: 12px;
    margin: 0;
    color: var(--ae-text-muted);
  }

  .ae-class-note {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 8px 12px;
    margin: 0;
    font-size: 14px;
    color: var(--ae-text-muted);
    background: #fff8e6;
    border-radius: var(--ae-radius-sm);

    svg {
      color: #d99a00;
    }
  }

  /* ---------- Modals ---------- */

  .ae-class-modal-text {
    margin: 0 0 12px;
  }

  .ae-class-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;

    label {
      font-weight: 700;
    }

    input {
      @include ae-field;
    }
  }

  .ae-class-field-error {
    margin: 0;
    font-weight: 700;
    color: var(--ae-danger);
  }

  .ae-class-check {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-top: 6px;
    cursor: pointer;

    input {
      width: 18px;
      height: 18px;
      accent-color: var(--ae-orange);
    }
  }

  // Computers: the page never scrolls; the learner list does.
  @media (min-width: 900px) and (min-height: 640px) {
    .ae-class {
      flex: 1 1 auto;
      min-height: 0;
    }

    .ae-class-coaches {
      max-height: 170px;
    }

    .ae-class-learners-card {
      flex: 1 1 auto;
      min-height: 0;
    }

    .ae-class-learners {
      flex: 1 1 0;
      min-height: 0;
    }
  }

  @media (min-width: 900px) and (max-height: 799px) {
    .ae-class {
      gap: 10px;
    }

    .ae-class-summary {
      min-height: 0;
      padding: 8px 16px;
    }

    .ae-class-summary-art {
      height: 64px;
    }

    .ae-class-coaches {
      max-height: 120px;
    }
  }

</style>
