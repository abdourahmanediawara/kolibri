<template>

  <div
    class="ae-space"
    :class="{ 'ae-space-drawer-open': drawerOpen }"
    :style="themeVars"
    @keydown.esc="closeOverlays"
  >
    <header class="ae-space-header">
      <div class="ae-space-header-start">
        <button
          type="button"
          class="ae-space-icon-btn ae-space-menu-btn"
          aria-controls="ae-side-nav"
          :aria-expanded="drawerOpen ? 'true' : 'false'"
          :aria-label="drawerOpen ? closeMenu$() : openMenu$()"
          @click="drawerOpen = !drawerOpen"
        >
          <AeIcon
            :name="drawerOpen ? 'x' : 'menu'"
            :size="24"
          />
        </button>
        <router-link
          :to="homePath"
          class="ae-space-brand"
        >
          <img
            class="ae-space-brand-logo"
            :src="logoSrc"
            :alt="footerOrgName$()"
          >
          <span
            class="ae-space-brand-divider"
            aria-hidden="true"
          ></span>
          <span class="ae-space-brand-name">
            <span class="ae-space-brand-accent">{{ brandParts.accent }}</span>
            {{ brandParts.rest }}
          </span>
        </router-link>
      </div>

      <div class="ae-space-header-end">
        <button
          type="button"
          class="ae-space-header-btn"
          aria-haspopup="dialog"
          :aria-label="`${signInChangeLanguage$()} (${languageLabel})`"
          @click="showLanguageModal = true"
        >
          <AeIcon
            name="globe"
            :size="22"
          />
          <span class="ae-space-hide-small">{{ languageLabel }}</span>
          <AeIcon
            name="chevronDown"
            class="ae-space-hide-small"
            :size="18"
          />
        </button>
        <span
          class="ae-space-header-sep"
          aria-hidden="true"
        ></span>

        <div
          ref="accountRoot"
          class="ae-space-account"
        >
          <button
            ref="accountButton"
            type="button"
            class="ae-space-account-btn"
            aria-haspopup="menu"
            aria-controls="ae-account-menu"
            :aria-expanded="accountOpen ? 'true' : 'false'"
            :aria-label="`${accountMenuLabel$()} : ${displayName}`"
            @click="accountOpen = !accountOpen"
          >
            <span
              class="ae-space-avatar"
              aria-hidden="true"
            >{{ initials }}</span>
            <span class="ae-space-account-text ae-space-hide-small">
              <span class="ae-space-account-name">{{ displayName }}</span>
              <span class="ae-space-account-role">{{ roleLabel }}</span>
            </span>
            <AeIcon
              name="chevronDown"
              class="ae-space-hide-small"
              :size="18"
            />
          </button>
          <ul
            v-show="accountOpen"
            id="ae-account-menu"
            class="ae-space-account-menu"
            role="menu"
          >
            <li role="none">
              <a
                role="menuitem"
                class="ae-space-account-item"
                :href="profileHref"
              >
                <KIcon
                  icon="person"
                  class="ae-space-account-item-icon"
                  color="var(--ae-text-muted)"
                />
                <span>{{ myProfile$() }}</span>
              </a>
            </li>
            <li
              v-if="showDeviceLink"
              role="none"
            >
              <a
                role="menuitem"
                class="ae-space-account-item"
                :href="deviceHref"
              >
                <KIcon
                  icon="device"
                  class="ae-space-account-item-icon"
                  color="var(--ae-text-muted)"
                />
                <span>{{ technicalAdmin$() }}</span>
              </a>
            </li>
            <li role="none">
              <button
                type="button"
                role="menuitem"
                class="ae-space-account-item"
                @click="logout"
              >
                <KIcon
                  icon="logout"
                  class="ae-space-account-item-icon"
                  color="var(--ae-text-muted)"
                />
                <span>{{ signOut$() }}</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>

    <div class="ae-space-body">
      <div
        v-if="drawerOpen"
        class="ae-space-backdrop"
        aria-hidden="true"
        @click="drawerOpen = false"
      ></div>

      <aside
        id="ae-side-nav"
        class="ae-space-side"
      >
        <p class="ae-space-side-heading">
          {{ spaceLabel }}
        </p>

        <nav :aria-label="navLabel$()">
          <ul class="ae-space-nav">
            <li
              v-for="item in items"
              :key="item.id"
            >
              <router-link
                :to="item.to"
                class="ae-space-nav-link"
                :class="{ 'ae-space-nav-link-active': item.id === activeId }"
                :aria-current="item.id === activeId ? 'page' : null"
                @click.native="drawerOpen = false"
              >
                <KIcon
                  :icon="item.icon"
                  class="ae-space-nav-icon"
                  :color="item.id === activeId ? 'var(--ae-orange)' : 'var(--ae-text-muted)'"
                />
                <span>{{ item.label }}</span>
              </router-link>
            </li>
          </ul>
        </nav>

        <div
          v-if="previewLinks.length"
          class="ae-space-preview"
        >
          <p class="ae-space-preview-label">
            {{ previewSpacesLabel$() }}
          </p>
          <router-link
            v-for="link in previewLinks"
            :key="link.id"
            :to="link.to"
            class="ae-space-preview-link"
            @click.native="drawerOpen = false"
          >
            {{ link.label }}
          </router-link>
        </div>

        <div
          v-if="promoText"
          class="ae-space-promo"
        >
          <img
            class="ae-space-promo-art"
            :src="promoArtSrc"
            alt=""
            width="147"
            height="233"
          >
          <p class="ae-space-promo-text">
            {{ promoText }}
          </p>
        </div>
      </aside>

      <main class="ae-space-main">
        <div class="ae-space-content">
          <AeBackLink
            v-if="showBackLink"
            :fallbackTo="backFallback"
          />
          <router-view />
        </div>
        <footer class="ae-space-footer">
          <span>{{ footerOrgName$() }}</span>
          <span>{{ footerPoweredBy$() }}</span>
        </footer>
      </main>
    </div>

    <LanguageSwitcherModal
      v-if="showLanguageModal"
      @cancel="showLanguageModal = false"
    />

    <!-- Announces snackbar messages (e.g. "Compte créé") to assistive technologies. -->
    <div aria-live="polite">
      <GlobalSnackbar />
    </div>
  </div>

</template>


<script>

  import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
  import urls from 'kolibri/urls';
  import useUser from 'kolibri/composables/useUser';
  import themeConfig from 'kolibri/styles/themeConfig';
  import LanguageSwitcherModal from 'kolibri/components/language-switcher/LanguageSwitcherModal';
  import GlobalSnackbar from 'kolibri/components/GlobalSnackbar';
  import { availableLanguages, currentLanguage } from 'kolibri/utils/i18n';
  import { portalStrings } from '../../strings';
  import { useAePermissions } from '../../composables/useAePermissions';
  import AeBackLink from '../AeBackLink';
  import AeIcon from '../AeIcon';

  export default {
    name: 'AeSpaceLayout',
    components: {
      AeBackLink,
      AeIcon,
      GlobalSnackbar,
      LanguageSwitcherModal,
    },
    setup() {
      const {
        openMenu$,
        closeMenu$,
        navLabel$,
        technicalAdmin$,
        previewSpacesLabel$,
        signInChangeLanguage$,
        accountMenuLabel$,
        myProfile$,
        signOut$,
        footerOrgName$,
        footerPoweredBy$,
        spaceLearner$,
        spaceCoach$,
        spaceAdmin$,
      } = portalStrings;
      const { full_name, username, logout } = useUser();
      const { isAdmin, isCoach, defaultLandingPath } = useAePermissions();

      const drawerOpen = ref(false);
      const accountOpen = ref(false);
      const showLanguageModal = ref(false);
      const accountRoot = ref(null);
      const accountButton = ref(null);

      // "AE Apprendre": first word in brand orange, as in the AE wordmark.
      const brandParts = computed(() => {
        const [accent, ...rest] = (themeConfig.siteTitle || '').split(' ');
        return { accent, rest: rest.join(' ') };
      });

      const languageLabel = computed(() => {
        const info = availableLanguages[currentLanguage];
        return (info && info.lang_name) || currentLanguage;
      });

      const displayName = computed(() => full_name.value || username.value || '');

      const initials = computed(() => {
        const words = displayName.value.split(/[\s_.-]+/).filter(Boolean);
        if (words.length > 1 && full_name.value) {
          return (words[0][0] + words[1][0]).toUpperCase();
        }
        return displayName.value.slice(0, 2).toUpperCase();
      });

      const roleLabel = computed(() => {
        if (isAdmin.value) {
          return spaceAdmin$();
        }
        if (isCoach.value) {
          return spaceCoach$();
        }
        return spaceLearner$();
      });

      function closeOverlays() {
        if (accountOpen.value) {
          accountOpen.value = false;
          accountButton.value.focus();
        }
        drawerOpen.value = false;
      }

      function onDocumentClick(event) {
        if (accountOpen.value && !accountRoot.value.contains(event.target)) {
          accountOpen.value = false;
        }
      }

      onMounted(() => document.addEventListener('click', onDocumentClick));
      onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick));

      return {
        openMenu$,
        closeMenu$,
        navLabel$,
        technicalAdmin$,
        previewSpacesLabel$,
        signInChangeLanguage$,
        accountMenuLabel$,
        myProfile$,
        signOut$,
        footerOrgName$,
        footerPoweredBy$,
        drawerOpen,
        accountOpen,
        showLanguageModal,
        accountRoot,
        accountButton,
        brandParts,
        languageLabel,
        displayName,
        initials,
        roleLabel,
        homePath: defaultLandingPath,
        logout,
        closeOverlays,
        logoSrc: urls.static('action_education_portal/action-education-logo.png'),
        promoArtSrc: urls.static('action_education_portal/ae-sidebar-books.png'),
        profileHref: urls['kolibri:kolibri.plugins.user_profile:user_profile'](),
        deviceHref: urls['kolibri:kolibri.plugins.device:device_management'](),
      };
    },
    props: {
      /** Small uppercase heading at the top of the sidebar. */
      spaceLabel: {
        type: String,
        required: true,
      },
      items: {
        type: Array,
        required: true,
      },
      activeId: {
        type: String,
        default: null,
      },
      showDeviceLink: {
        type: Boolean,
        default: false,
      },
      previewLinks: {
        type: Array,
        default: () => [],
      },
      /** Optional sidebar tagline, shown with the books illustration (admin space). */
      promoText: {
        type: String,
        default: '',
      },
      /** Spaces with breadcrumbs (admin) do without the generic back link. */
      showBackLink: {
        type: Boolean,
        default: true,
      },
      /** Space root path used when there is no previous portal page. */
      backFallback: {
        type: String,
        default: '/',
      },
    },
    computed: {
      // Brand colours come from the AE theme; the rest are shared design tokens.
      themeVars() {
        return {
          '--ae-orange': this.$themeBrand.primary.v_500,
          '--ae-orange-soft': this.$themeBrand.primary.v_100,
          '--ae-navy': this.$themeBrand.secondary.v_500,
        };
      },
    },
  };

</script>


<style lang="scss" scoped>

  @import '../../styles/tokens';

  $header-height: 80px;

  .ae-space {
    @include ae-tokens;
    @include ae-font;

    min-height: 100vh;
    font-size: 16px;
    line-height: 1.5;
    color: var(--ae-text);
    background: var(--ae-page);
    -webkit-font-smoothing: antialiased;
  }

  /* ---------- Header ---------- */

  .ae-space-header {
    position: sticky;
    top: 0;
    z-index: 20;
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    height: $header-height;
    padding-inline: 32px 28px;
    background: var(--ae-surface);
    box-shadow: 0 1px 0 var(--ae-line);
  }

  .ae-space-header-start,
  .ae-space-header-end {
    display: flex;
    align-items: center;
    min-width: 0;
  }

  .ae-space-header-end {
    gap: 8px;
  }

  .ae-space-icon-btn.ae-space-menu-btn {
    display: none;
    margin-inline-end: 8px;
  }

  .ae-space-brand {
    display: flex;
    gap: 24px;
    align-items: center;
    min-width: 0;
    text-decoration: none;
    border-radius: var(--ae-radius-sm);
  }

  // The shared logo PNG has a 3px grey band on top: crop it (275x94 visible).
  .ae-space-brand-logo {
    display: block;
    width: 152px;
    height: 52px;
    object-fit: cover;
    object-position: bottom;
  }

  .ae-space-brand-divider {
    width: 1px;
    height: 40px;
    background: var(--ae-line);
  }

  .ae-space-brand-name {
    overflow: hidden;
    font-size: 28px;
    font-weight: 800;
    color: var(--ae-navy);
    text-overflow: ellipsis;
    letter-spacing: -0.01em;
    white-space: nowrap;
  }

  .ae-space-brand-accent {
    color: var(--ae-orange);
  }

  .ae-space-header-btn,
  .ae-space-icon-btn,
  .ae-space-account-btn {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    min-height: 48px;
    padding: 0 12px;
    font: inherit;
    font-size: 16px;
    font-weight: 600;
    color: var(--ae-navy);
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: var(--ae-radius-sm);
    transition: background-color 150ms ease;

    &:hover {
      background: var(--ae-surface-muted);
    }
  }

  .ae-space-icon-btn {
    justify-content: center;
    width: 48px;
    padding: 0;
  }

  .ae-space-header-sep {
    width: 1px;
    height: 40px;
    margin-inline: 8px;
    background: var(--ae-line);
  }

  .ae-space-account {
    position: relative;
  }

  .ae-space-account-btn {
    gap: 12px;
    padding: 4px 8px;
    text-align: start;
  }

  .ae-space-avatar {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    font-size: 17px;
    font-weight: 700;
    color: #ffffff;
    background: var(--ae-orange);
    border-radius: 50%;
  }

  .ae-space-account-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
    line-height: 1.3;
  }

  .ae-space-account-name {
    max-width: 180px;
    overflow: hidden;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ae-space-account-role {
    font-size: 14px;
    font-weight: 500;
    color: var(--ae-text-subtle);
  }

  .ae-space-account-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: 240px;
    padding: 8px;
    margin: 0;
    list-style: none;
    background: var(--ae-surface);
    border: 1px solid var(--ae-line);
    border-radius: var(--ae-radius-md);
    box-shadow: var(--ae-shadow-raised);
  }

  .ae-space-account-item {
    display: flex;
    gap: 12px;
    align-items: center;
    width: 100%;
    min-height: 44px;
    padding: 0 12px;
    font: inherit;
    font-weight: 600;
    color: var(--ae-navy);
    text-align: start;
    text-decoration: none;
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: var(--ae-radius-sm);

    &:hover {
      background: var(--ae-surface-muted);
    }
  }

  .ae-space-account-item-icon {
    width: 20px;
    height: 20px;
  }

  /* ---------- Body: sidebar + main ---------- */

  .ae-space-body {
    display: grid;
    grid-template-columns: 300px minmax(0, 1fr);
    min-height: calc(100vh - #{$header-height});
  }

  .ae-space-side {
    position: sticky;
    top: $header-height;
    display: flex;
    flex-direction: column;
    height: calc(100vh - #{$header-height});
    padding: 32px 16px 24px;
    overflow-y: auto;
    background: var(--ae-surface);
    border-right: 1px solid var(--ae-line);
  }

  .ae-space-side-heading {
    margin: 0 16px 20px;
    font-size: 14px;
    font-weight: 600;
    color: var(--ae-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .ae-space-nav {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .ae-space-nav-link {
    display: flex;
    gap: 18px;
    align-items: center;
    min-height: 56px;
    padding: 0 16px;
    font-size: 18px;
    font-weight: 500;
    color: var(--ae-navy);
    text-decoration: none;
    border-radius: var(--ae-radius-md);
    transition: background-color 150ms ease;

    &:hover {
      background: var(--ae-surface-muted);
    }
  }

  .ae-space-nav-icon {
    flex-shrink: 0;
    width: 26px;
    height: 26px;
  }

  .ae-space-nav-link-active,
  .ae-space-nav-link-active:hover {
    font-weight: 700;
    // Orange text dark enough on the tinted background (AA); the icon keeps the brand orange.
    color: var(--ae-orange-deep);
    background: var(--ae-orange-wash);
  }

  .ae-space-preview {
    padding-top: 16px;
    margin-top: 24px;
    border-top: 1px solid var(--ae-line);
  }

  .ae-space-preview-label {
    margin: 0 16px 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--ae-text-subtle);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .ae-space-preview-link {
    display: block;
    padding: 6px 16px;
    font-size: 15px;
    color: var(--ae-text-muted);
    text-decoration: none;
    border-radius: var(--ae-radius-sm);

    &:hover {
      color: var(--ae-navy);
    }
  }

  .ae-space-promo {
    display: flex;
    gap: 6px;
    align-items: center;
    padding-top: 24px;
    margin-top: auto;
  }

  .ae-space-promo-art {
    flex-shrink: 0;
    width: 140px;
    height: auto;
  }

  .ae-space-promo-text {
    max-width: 7em;
    margin: 0;
    font-size: 20px;
    font-weight: 500;
    line-height: 1.3;
    color: var(--ae-navy);

    &::after {
      display: block;
      width: 48px;
      height: 3px;
      margin-top: 14px;
      content: '';
      background: var(--ae-orange);
      border-radius: 2px;
    }
  }

  .ae-space-main {
    display: flex;
    flex-direction: column;
    min-width: 0;
    padding: 28px 36px 12px;
  }

  .ae-space-content {
    flex: 1;
    width: 100%;
    max-width: 1360px;
  }

  .ae-space-footer {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 24px;
    justify-content: space-between;
    max-width: 1360px;
    padding-top: 24px;
    font-size: 15px;
    color: var(--ae-text-muted);
  }

  .ae-space-backdrop {
    display: none;
  }

  /* ---------- Focus, motion ---------- */

  .ae-space-brand,
  .ae-space-header-btn,
  .ae-space-icon-btn,
  .ae-space-account-btn,
  .ae-space-account-item,
  .ae-space-nav-link,
  .ae-space-preview-link {
    &:focus-visible {
      outline: none;
      box-shadow: var(--ae-focus-ring);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ae-space-header-btn,
    .ae-space-icon-btn,
    .ae-space-account-btn,
    .ae-space-nav-link,
    .ae-space-side {
      transition: none;
    }
  }

  /* ---------- Responsive ---------- */

  @media (max-width: 1199px) {
    .ae-space-body {
      grid-template-columns: 236px minmax(0, 1fr);
    }

    .ae-space-side {
      padding-inline: 12px;
    }

    .ae-space-nav-link {
      gap: 14px;
      padding: 0 14px;
      font-size: 16px;
    }

    .ae-space-nav-icon {
      width: 22px;
      height: 22px;
    }

    .ae-space-promo-art {
      width: 110px;
    }

    .ae-space-promo-text {
      font-size: 17px;
    }

    .ae-space-header {
      padding-inline: 24px 20px;
    }

    .ae-space-brand-name {
      font-size: 24px;
    }

    .ae-space-main {
      padding-inline: 28px;
    }
  }

  // Computers: the shell fills the screen, pages fit inside without page scroll.
  // Only the content area may scroll, as a last resort on unusual screens.
  @media (min-width: 900px) and (min-height: 640px) {
    .ae-space {
      display: flex;
      flex-direction: column;
      height: 100vh;
      min-height: 0;
      overflow: hidden;
    }

    .ae-space-header {
      position: relative;
      flex: 0 0 auto;
    }

    .ae-space-body {
      flex: 1 1 0;
      grid-template-rows: minmax(0, 1fr);
      min-height: 0;
    }

    .ae-space-side {
      position: static;
      height: auto;
      min-height: 0;
    }

    .ae-space-main {
      min-height: 0;
      padding-block: 20px 8px;
      overflow-y: auto;
    }

    .ae-space-content {
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .ae-space-footer {
      padding-top: 8px;
    }
  }

  @media (min-width: 900px) and (max-height: 959px) {
    .ae-space-header {
      height: 72px;
    }

    .ae-space-brand-logo {
      width: 129px;
      height: 44px;
    }

    .ae-space-brand-name {
      font-size: 24px;
    }

    .ae-space-avatar {
      width: 42px;
      height: 42px;
      font-size: 15px;
    }

    .ae-space-side {
      padding-block: 24px 16px;
    }

    .ae-space-side-heading {
      margin-bottom: 14px;
    }

    .ae-space-nav {
      gap: 4px;
    }

    .ae-space-nav-link {
      min-height: 48px;
    }

    .ae-space-promo-art {
      width: 100px;
    }

    .ae-space-promo-text {
      font-size: 17px;
    }

    .ae-space-main {
      padding-top: 20px;
    }
  }

  @media (min-width: 900px) and (max-height: 799px) {
    .ae-space-header {
      height: 64px;
    }

    .ae-space-brand-logo {
      width: 117px;
      height: 40px;
    }

    .ae-space-brand-divider,
    .ae-space-header-sep {
      height: 32px;
    }

    .ae-space-brand-name {
      font-size: 22px;
    }

    .ae-space-avatar {
      width: 38px;
      height: 38px;
      font-size: 14px;
    }

    .ae-space-account-role {
      font-size: 13px;
    }

    .ae-space-side {
      padding-block: 18px 12px;
    }

    .ae-space-side-heading {
      margin-bottom: 10px;
      font-size: 13px;
    }

    .ae-space-nav {
      gap: 2px;
    }

    .ae-space-nav-link {
      min-height: 44px;
      font-size: 16px;
    }

    .ae-space-promo-art {
      width: 80px;
    }

    .ae-space-promo-text {
      font-size: 15px;

      &::after {
        margin-top: 10px;
      }
    }

    .ae-space-main {
      padding-top: 16px;
    }

    .ae-space-footer {
      padding-top: 8px;
      font-size: 14px;
    }
  }

  // Tablets and phones: the sidebar becomes a drawer.
  @media (max-width: 899px) {
    .ae-space-icon-btn.ae-space-menu-btn {
      display: inline-flex;
    }

    .ae-space-body {
      grid-template-columns: minmax(0, 1fr);
    }

    .ae-space-side {
      position: fixed;
      top: $header-height;
      bottom: 0;
      left: 0;
      z-index: 15;
      width: 300px;
      max-width: 85vw;
      height: auto;
      box-shadow: var(--ae-shadow-raised);
      transition: transform 200ms ease;
      transform: translateX(-105%);
    }

    .ae-space-drawer-open .ae-space-side {
      transform: translateX(0);
    }

    .ae-space-backdrop {
      position: fixed;
      top: $header-height;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 14;
      display: block;
      background: rgba(31, 29, 61, 0.35);
    }

    .ae-space-main {
      padding: 20px 20px 12px;
    }
  }

  @media (max-width: 719px) {
    .ae-space-header {
      padding-inline: 8px 12px;
    }

    .ae-space-brand {
      gap: 12px;
    }

    .ae-space-brand-logo {
      width: 105px;
      height: 36px;
    }

    .ae-space-brand-divider {
      height: 28px;
    }

    .ae-space-brand-name {
      font-size: 18px;
    }

    .ae-space-header-sep {
      display: none;
    }

    // Icons only; names stay available through aria-label.
    .ae-space-hide-small {
      display: none;
    }

    .ae-space-avatar {
      width: 40px;
      height: 40px;
      font-size: 15px;
    }

    .ae-space-main {
      padding: 16px 16px 12px;
    }
  }

</style>
