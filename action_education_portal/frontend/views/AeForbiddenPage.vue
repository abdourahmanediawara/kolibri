<template>
  <div
    class="ae-page"
    :style="{ color: $themeTokens.text }"
  >
    <h1 class="title">
      {{ forbiddenTitle$() }}
    </h1>
    <p :style="{ color: $themeTokens.annotation }">
      {{ accessDenied$() }}
    </p>
    <p v-if="!isUserLoggedIn">
      <a
        class="home-link"
        :href="signInHref"
        :style="{ color: $themeTokens.primary }"
      >
        {{ signInAction$() }}
      </a>
    </p>
    <router-link
      v-else
      :to="homePath"
      class="home-link"
      :style="{ color: $themeTokens.primary }"
    >
      {{ backHome$() }}
    </router-link>
  </div>
</template>

<script>
  import { computed } from 'vue';
  import { portalStrings } from '../strings';
  import { useAePermissions } from '../composables/useAePermissions';
  import { signInUrl } from '../routeGuards';

  export default {
    name: 'AeForbiddenPage',
    setup() {
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
      };
    },
  };
</script>

<style lang="scss" scoped>
  .ae-page {
    max-width: 560px;
    margin: 0 auto;
    padding: 24px 8px;
  }

  .title {
    margin: 0 0 12px;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .home-link {
    display: inline-block;
    min-height: 44px;
    margin-top: 16px;
    padding: 8px 0;
    font-weight: 600;
    text-decoration: none;
  }

  .home-link:focus {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
</style>
