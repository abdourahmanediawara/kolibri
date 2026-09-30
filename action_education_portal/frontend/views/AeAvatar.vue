<template>

  <span
    class="ae-avatar"
    :class="`ae-avatar-${tone}`"
    aria-hidden="true"
  >
    <KIcon
      v-if="icon"
      :icon="icon"
      color="currentColor"
      class="ae-avatar-icon"
    />
    <template v-else>{{ initials }}</template>
  </span>

</template>


<script>

  // Takira KPI pastels, each with a text colour that keeps 5:1 contrast.
  const TONES = ['purple', 'orange', 'blue', 'green', 'red', 'yellow', 'mint'];

  export default {
    name: 'AeAvatar',
    props: {
      /** Name the initials come from. */
      name: {
        type: String,
        default: '',
      },
      /** Stable key for the colour (username, id…), so a person keeps the same avatar. */
      toneKey: {
        type: String,
        default: '',
      },
      /** Show a KDS icon instead of initials (groups, channels…). */
      icon: {
        type: String,
        default: null,
      },
    },
    computed: {
      initials() {
        const words = this.name.split(/[\s_.-]+/).filter(Boolean);
        if (words.length > 1) {
          return (words[0][0] + words[1][0]).toUpperCase();
        }
        return this.name.slice(0, 2).toUpperCase();
      },
      tone() {
        let hash = 0;
        for (const char of this.toneKey || this.name) {
          hash = (hash + char.charCodeAt(0)) % TONES.length;
        }
        return TONES[hash];
      },
    },
  };

</script>


<style lang="scss" scoped>

  // Lives inside AeSpaceLayout, which defines the --ae-* tokens.
  .ae-avatar {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    font-size: 14px;
    font-weight: 700;
    border-radius: 50%;
  }

  .ae-avatar-icon {
    width: 20px;
    height: 20px;
  }

  .ae-avatar-purple {
    color: #7b2fb0;
    background: var(--ae-kpi-purple);
  }

  .ae-avatar-orange {
    color: #a8380c;
    background: var(--ae-orange-soft);
  }

  .ae-avatar-blue {
    color: #0a5aa6;
    background: var(--ae-kpi-blue);
  }

  .ae-avatar-green {
    color: #166b3a;
    background: var(--ae-kpi-green);
  }

  .ae-avatar-red {
    color: #a3221b;
    background: var(--ae-kpi-red);
  }

  .ae-avatar-yellow {
    color: #7a4f00;
    background: var(--ae-kpi-yellow);
  }

  .ae-avatar-mint {
    color: #0b5e57;
    background: var(--ae-kpi-mint);
  }

</style>
