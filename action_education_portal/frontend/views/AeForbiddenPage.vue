<template>

  <div
    class="ae-forbidden"
    :style="themeVars"
  >
    <section
      class="ae-forbidden-card"
      aria-labelledby="ae-forbidden-title"
    >
      <span
        class="ae-forbidden-icon"
        aria-hidden="true"
      >
        <AeIcon
          name="lock"
          :size="40"
        />
      </span>
      <h1
        id="ae-forbidden-title"
        class="ae-forbidden-title"
      >
        {{ forbiddenTitle$() }}
      </h1>
      <p class="ae-forbidden-text">
        {{ accessDenied$() }}
      </p>
      <a
        v-if="!isUserLoggedIn"
        class="ae-forbidden-primary"
        :href="signInHref"
      >
        {{ signInAction$() }}
      </a>
      <router-link
        v-else
        :to="homePath"
        class="ae-forbidden-primary"
      >
        <AeIcon
          name="arrowLeft"
          :size="18"
        />
        <span>{{ backHome$() }}</span>
      </router-link>
    </section>
  </div>

</template>


<script>

  import { computed, getCurrentInstance } from 'vue';
  import { portalStrings } from '../strings';
  import { useAePermissions } from '../composables/useAePermissions';
  import { signInUrl } from '../routeGuards';
  import AeIcon from './AeIcon';

  /** Shown when a page belongs to another space than the one of the account. */
  export default {
    name: 'AeForbiddenPage',
    components: { AeIcon },
    setup() {
      // Brand colors of the AE theme, as in the space layouts.
      const { proxy } = getCurrentInstance();
      const themeVars = computed(() => ({
        '--ae-orange': proxy.$themeBrand.primary.v_500,
        '--ae-navy': proxy.$themeBrand.secondary.v_500,
      }));
      const { forbiddenTitle$, accessDenied$, backHome$, signInAction$ } = portalStrings;
      const { isUserLoggedIn, defaultLandingPath } = useAePermissions();
      const homePath = computed(() => defaultLandingPath.value);
      const signInHref = computed(() => signInUrl());

      return {
        forbiddenTitle$,
        accessDenied$,
        backHome$,
        signInAction$,
        isUserLoggedIn,
        homePath,
        signInHref,
        themeVars,
      };
    },
  };

</script>


<style lang="scss" scoped>

  @import '../styles/tokens';
  @import '../styles/components';

  .ae-forbidden {
    @include ae-tokens;
    @include ae-font;

    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 24px 16px;
    color: var(--ae-text);
    background: var(--ae-page);
  }

  .ae-forbidden-card {
    @include ae-card;

    display: flex;
    flex-direction: column;
    gap: 14px;
    align-items: center;
    width: 520px;
    max-width: 100%;
    padding: 36px 32px;
    text-align: center;
  }

  .ae-forbidden-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 84px;
    height: 84px;
    color: var(--ae-orange);
    background: var(--ae-orange-wash);
    border-radius: 50%;
  }

  .ae-forbidden-title {
    margin: 0;
    font-size: 28px;
    font-weight: 800;
    color: var(--ae-navy);
  }

  .ae-forbidden-text {
    margin: 0;
    font-size: 17px;
    color: var(--ae-text-muted);
  }

  .ae-forbidden-primary {
    @include ae-button-primary;

    margin-top: 8px;
  }

</style>
