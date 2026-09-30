<template>

  <button
    v-if="showBack"
    type="button"
    class="ae-back"
    @click="goBack"
  >
    <AeIcon
      name="arrowLeft"
      :size="18"
    />
    <span>{{ backAction$() }}</span>
  </button>

</template>


<script>

  import { portalStrings } from '../strings';
  import { useAeHistory } from '../composables/useAeHistory';
  import AeIcon from './AeIcon';

  export default {
    name: 'AeBackLink',
    components: { AeIcon },
    setup(props) {
      const { backAction$ } = portalStrings;
      const { showBack, goBack } = useAeHistory(props.fallbackTo);
      return {
        backAction$,
        showBack,
        goBack,
      };
    },
    props: {
      fallbackTo: {
        type: String,
        default: '/',
      },
    },
  };

</script>


<style lang="scss" scoped>

  // Lives inside AeSpaceLayout, which defines the --ae-* tokens.
  .ae-back {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    align-self: flex-start;
    min-height: 36px;
    padding: 0 8px;
    margin: 0 0 8px -8px;
    font: inherit;
    font-size: 15px;
    font-weight: 700;
    color: var(--ae-orange-ink);
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: var(--ae-radius-sm);

    &:hover {
      background: var(--ae-surface-muted);
    }

    &:focus-visible {
      outline: none;
      box-shadow: var(--ae-focus-ring);
    }
  }

</style>
