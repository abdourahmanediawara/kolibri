<template>

  <section
    class="ae-rules"
    aria-labelledby="ae-rules-title"
  >
    <div class="ae-rules-head">
      <span
        class="ae-rules-badge"
        aria-hidden="true"
      >
        <AeIcon
          name="users"
          :size="24"
        />
      </span>
      <div>
        <h2
          id="ae-rules-title"
          class="ae-rules-title"
        >
          {{ facilityRulesTitle$() }}
        </h2>
        <p class="ae-rules-text">
          {{ facilityRulesText$() }}
        </p>
      </div>
    </div>

    <KCircularLoader
      v-if="loading"
      :delay="false"
    />
    <p
      v-else-if="loadFailed"
      class="ae-rules-message ae-rules-message-error"
      role="alert"
    >
      {{ loadError$() }}
    </p>
    <form
      v-else
      class="ae-rules-form"
      novalidate
      @submit.prevent="save"
    >
      <ul class="ae-rules-list">
        <li
          v-for="rule in rules"
          :key="rule.key"
        >
          <label class="ae-rules-rule">
            <input
              v-model="values[rule.key]"
              type="checkbox"
            >
            <span>
              <strong>{{ rule.label }}</strong>
              <span class="ae-rules-hint">{{ rule.hint }}</span>
            </span>
          </label>
        </li>
      </ul>
      <p
        v-if="message"
        class="ae-rules-message"
        :class="`ae-rules-message-${message.kind}`"
        :role="message.kind === 'error' ? 'alert' : 'status'"
      >
        <AeIcon
          :name="message.kind === 'error' ? 'circleAlert' : 'circleCheck'"
          :size="20"
        />
        <span>{{ message.text }}</span>
      </p>
      <button
        type="submit"
        class="ae-rules-primary"
        :disabled="saving"
      >
        {{ saveChangesAction$() }}
      </button>
    </form>
  </section>

</template>


<script>

  import { onMounted, reactive, ref } from 'vue';
  import FacilityDatasetResource from 'kolibri-common/apiResources/FacilityDatasetResource';
  import FacilityResource from 'kolibri-common/apiResources/FacilityResource';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';
  import AeIcon from '../AeIcon';

  const RULE_KEYS = [
    'learner_can_sign_up',
    'learner_can_edit_name',
    'learner_can_edit_username',
    'learner_can_edit_password',
    'learner_can_login_with_no_password',
    'show_download_button_in_learn',
  ];

  /** What learners of the centre may do by themselves (Kolibri facility settings). */
  export default {
    name: 'AeFacilityRulesCard',
    components: { AeIcon },
    setup() {
      const {
        facilityRulesTitle$,
        facilityRulesText$,
        facilityRulesSaved$,
        saveChangesAction$,
        saveError$,
        loadError$,
      } = portalStrings;
      const { userFacilityId } = useAePermissions();

      const rules = RULE_KEYS.map(key => {
        const name = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
        const suffix = name.charAt(0).toUpperCase() + name.slice(1);
        return {
          key,
          label: portalStrings[`rule${suffix}$`](),
          hint: portalStrings[`rule${suffix}Hint$`](),
        };
      });

      const values = reactive(Object.fromEntries(RULE_KEYS.map(key => [key, false])));
      const datasetId = ref('');
      const loading = ref(true);
      const loadFailed = ref(false);
      const saving = ref(false);
      const message = ref(null);

      async function load() {
        loading.value = true;
        loadFailed.value = false;
        try {
          const facility = await FacilityResource.fetchModel({ id: userFacilityId.value });
          datasetId.value = facility.dataset;
          const dataset = await FacilityDatasetResource.fetchModel({
            id: datasetId.value,
            force: true,
          });
          RULE_KEYS.forEach(key => {
            values[key] = Boolean(dataset[key]);
          });
        } catch (e) {
          loadFailed.value = true;
        } finally {
          loading.value = false;
        }
      }

      async function save() {
        saving.value = true;
        message.value = null;
        try {
          await FacilityDatasetResource.saveModel({
            id: datasetId.value,
            data: { ...values },
            exists: true,
          });
          message.value = { kind: 'success', text: facilityRulesSaved$() };
        } catch (e) {
          message.value = { kind: 'error', text: saveError$() };
        } finally {
          saving.value = false;
        }
      }

      onMounted(load);

      return {
        facilityRulesTitle$,
        facilityRulesText$,
        saveChangesAction$,
        loadError$,
        rules,
        values,
        loading,
        loadFailed,
        saving,
        message,
        save,
      };
    },
  };

</script>


<style lang="scss" scoped>

  @import '../../styles/components';

  .ae-rules {
    @include ae-card;

    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .ae-rules-head {
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }

  .ae-rules-badge {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    color: var(--ae-orange);
    background: var(--ae-orange-wash);
    border-radius: 50%;
  }

  .ae-rules-title {
    margin: 0;
    font-size: 20px;
    font-weight: 800;
    color: var(--ae-navy);
  }

  .ae-rules-text {
    margin: 4px 0 0;
    color: var(--ae-text-muted);
  }

  .ae-rules-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .ae-rules-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 8px 16px;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .ae-rules-rule {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 10px 12px;
    cursor: pointer;
    background: var(--ae-surface-muted);
    border-radius: var(--ae-radius-md);

    input {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      margin-top: 2px;
      accent-color: var(--ae-orange);
    }

    strong {
      display: block;
      color: var(--ae-navy);
    }
  }

  .ae-rules-hint {
    font-size: 14px;
    color: var(--ae-text-muted);
  }

  .ae-rules-message {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 10px 14px;
    margin: 0;
    font-weight: 700;
    border-radius: var(--ae-radius-md);
  }

  .ae-rules-message-error {
    color: var(--ae-danger);
    background: var(--ae-danger-soft);
    border: 1.5px solid var(--ae-danger);
  }

  .ae-rules-message-success {
    color: #1b6e3c;
    background: var(--ae-kpi-green);
    border: 1.5px solid #2e8b57;
  }

  .ae-rules-primary {
    @include ae-button-primary;

    align-self: flex-start;
    min-height: 44px;
    font-size: 17px;
  }

</style>
