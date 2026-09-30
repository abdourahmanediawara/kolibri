<template>
  <AppBarPage title="">
    <div
      class="ae-shell"
      :class="{ 'ae-shell--small': windowIsSmall }"
      :style="{ color: $themeTokens.text }"
    >
      <button
        v-if="windowIsSmall"
        type="button"
        class="ae-menu-toggle"
        :aria-expanded="String(mobileOpen)"
        :aria-controls="'ae-side-nav'"
        :style="{
          backgroundColor: $themeTokens.surface,
          borderColor: $themeTokens.fineLine,
          color: $themeTokens.text,
        }"
        @click="mobileOpen = !mobileOpen"
      >
        {{ mobileOpen ? closeMenu$() : openMenu$() }}
      </button>

      <aside
        id="ae-side-nav"
        class="ae-side"
        :class="{ 'ae-side--open': mobileOpen || !windowIsSmall }"
        :style="{
          backgroundColor: $themeTokens.surface,
          borderColor: $themeTokens.fineLine,
        }"
        :aria-label="navLabel$()"
      >
        <p
          class="ae-brand"
          :style="{ color: $themeTokens.primary }"
        >
          {{ platformTitle$() }}
        </p>

        <nav
          v-if="switcherLinks.length > 1"
          class="ae-switcher"
          :aria-label="spacesLabel$()"
        >
          <router-link
            v-for="link in switcherLinks"
            :key="link.id"
            :to="link.to"
            class="ae-switcher-link"
            :class="{ 'ae-switcher-link--active': link.active }"
            :style="{
              backgroundColor: link.active ? $themeTokens.primary : 'transparent',
              color: link.active ? $themeTokens.textInverted : $themeTokens.text,
              fontWeight: link.active ? '700' : '500',
            }"
          >
            {{ link.label }}
          </router-link>
        </nav>

        <ul class="ae-nav-list">
          <li
            v-for="item in items"
            :key="item.id"
          >
            <router-link
              :to="item.to"
              class="ae-nav-link"
              :class="{ 'ae-nav-link--active': item.id === activeId }"
              :style="{
                borderLeftColor:
                  item.id === activeId ? $themeTokens.primary : 'transparent',
                color: item.id === activeId ? $themeTokens.primary : $themeTokens.text,
              }"
              @click.native="mobileOpen = false"
            >
              <KIcon
                :icon="item.icon"
                class="ae-nav-icon"
                :style="{ fill: item.id === activeId ? $themeTokens.primary : $themeTokens.annotation }"
              />
              <span>{{ item.label }}</span>
            </router-link>
          </li>
        </ul>

        <div
          v-if="canAccessTechnicalAdministration"
          class="ae-tech"
        >
          <a
            class="ae-tech-link"
            :href="deviceHref"
            :style="{ color: $themeTokens.annotation }"
          >
            {{ technicalAdmin$() }}
          </a>
        </div>
      </aside>

      <main class="ae-main">
        <router-view />
      </main>
    </div>
  </AppBarPage>
</template>

<script>
  import { computed, ref } from 'vue';
  import urls from 'kolibri/urls';
  import useKResponsiveWindow from 'kolibri-design-system/lib/composables/useKResponsiveWindow';
  import AppBarPage from 'kolibri/components/pages/AppBarPage';
  import { portalStrings } from '../strings';
  import { useAeNav } from '../composables/useAeNav';
  import { useAePermissions } from '../composables/useAePermissions';

  export default {
    name: 'AeAppShell',
    components: {
      AppBarPage,
    },
    setup() {
      const {
        platformTitle$,
        openMenu$,
        closeMenu$,
        navLabel$,
        spacesLabel$,
        technicalAdmin$,
      } = portalStrings;
      const { windowIsSmall } = useKResponsiveWindow();
      const { items, activeId, switcherLinks } = useAeNav();
      const { canAccessTechnicalAdministration } = useAePermissions();
      const mobileOpen = ref(false);
      const deviceHref = computed(() => urls['kolibri:kolibri.plugins.device:device_management']());

      return {
        platformTitle$,
        openMenu$,
        closeMenu$,
        navLabel$,
        spacesLabel$,
        technicalAdmin$,
        windowIsSmall,
        items,
        activeId,
        switcherLinks,
        canAccessTechnicalAdministration,
        mobileOpen,
        deviceHref,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .ae-shell {
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    min-height: calc(100vh - 64px);
  }

  .ae-menu-toggle {
    width: 100%;
    min-height: 44px;
    margin: 8px;
    padding: 8px 12px;
    font-size: 1rem;
    text-align: start;
    cursor: pointer;
    border: 1px solid;
    border-radius: 8px;
  }

  .ae-side {
    display: none;
    flex: 0 0 240px;
    max-width: 100%;
    padding: 16px 12px 24px;
    border-right: 1px solid;
  }

  .ae-side--open {
    display: block;
    width: 100%;
  }

  .ae-brand {
    margin: 0 8px 16px;
    font-size: 1.05rem;
    font-weight: 700;
  }

  .ae-switcher {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 0 0 16px;
  }

  .ae-switcher-link {
    padding: 6px 10px;
    font-size: 0.85rem;
    text-decoration: none;
    border-radius: 999px;
  }

  .ae-switcher-link--active {
    text-decoration: underline;
  }

  .ae-nav-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .ae-nav-link {
    display: flex;
    gap: 10px;
    align-items: center;
    min-height: 44px;
    padding: 8px 10px;
    margin-bottom: 4px;
    text-decoration: none;
    border-left: 3px solid transparent;
    border-radius: 6px;
  }

  .ae-nav-link--active {
    border-left-width: 3px;
    font-weight: 700;
  }

  .ae-nav-icon {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
  }

  .ae-tech {
    margin-top: 24px;
    padding-top: 12px;
  }

  .ae-tech-link {
    display: inline-block;
    padding: 8px;
    font-size: 0.85rem;
  }

  .ae-main {
    flex: 1 1 280px;
    max-width: 100%;
    padding: 16px 12px 32px;
  }

  .ae-shell--small .ae-menu-toggle {
    display: block;
  }

  .ae-shell:not(.ae-shell--small) .ae-menu-toggle {
    display: none;
  }

  .ae-shell:not(.ae-shell--small) .ae-side {
    display: block;
    width: 240px;
  }

  .ae-shell:not(.ae-shell--small) .ae-main {
    padding: 20px 24px 40px;
  }
</style>
