<template>
  <div
    class="ae-page"
    :style="{ color: $themeTokens.text }"
  >
    <h1 class="title">
      {{ myProfile$() }}
    </h1>
    <p :style="{ color: $themeTokens.annotation }">
      {{ profileIntro$() }}
    </p>
    <dl class="profile-list">
      <div class="row">
        <dt>{{ usernameLabel$() }}</dt>
        <dd>{{ username || '—' }}</dd>
      </div>
      <div class="row">
        <dt>{{ displayNameLabel$() }}</dt>
        <dd>{{ displayName || '—' }}</dd>
      </div>
    </dl>
  </div>
</template>

<script>
  import useUser from 'kolibri/composables/useUser';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';

  export default {
    name: 'AeLearnProfilePage',
    setup() {
      const { myProfile$, profileIntro$, usernameLabel$, displayNameLabel$ } = portalStrings;
      const { username } = useUser();
      const { displayName } = useAePermissions();
      return {
        myProfile$,
        profileIntro$,
        usernameLabel$,
        displayNameLabel$,
        username,
        displayName,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .ae-page {
    max-width: 640px;
    margin: 0 auto;
  }

  .title {
    margin: 0 0 8px;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .profile-list {
    margin: 16px 0 0;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
    margin-bottom: 12px;
  }

  dt {
    font-weight: 600;
    min-width: 120px;
  }

  dd {
    margin: 0;
  }
</style>
