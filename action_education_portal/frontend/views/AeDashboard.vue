<template>

  <div class="ae-dash">
    <header class="ae-dash-head">
      <h1 class="ae-dash-title">
        {{ title }}
      </h1>
      <p class="ae-dash-date">
        {{ todayLabel }}
      </p>
    </header>

    <section
      class="ae-dash-welcome"
      aria-labelledby="ae-dash-welcome-title"
    >
      <div class="ae-dash-welcome-text">
        <h2
          id="ae-dash-welcome-title"
          class="ae-dash-welcome-title"
        >
          {{ welcomeTitle }}
        </h2>
        <p class="ae-dash-welcome-subtitle">
          {{ welcomeSubtitle }}
        </p>
      </div>
      <img
        class="ae-dash-welcome-art"
        :src="bannerSrc"
        alt=""
        width="566"
        height="232"
      >
    </section>

    <!-- E.g. a load error with a retry button. -->
    <slot name="notice"></slot>

    <KCircularLoader
      v-if="loading"
      :delay="false"
    />

    <template v-else>
      <ul
        v-if="cards.length"
        class="ae-dash-kpis"
      >
        <li
          v-for="card in cards"
          :key="card.id"
          class="ae-dash-kpi"
        >
          <span
            class="ae-dash-badge ae-dash-badge-large"
            :class="`ae-dash-tone-${card.tone}`"
            aria-hidden="true"
          >
            <KIcon
              :icon="card.icon"
              color="var(--ae-tone-fg)"
            />
          </span>
          <span class="ae-dash-kpi-text">
            <span class="ae-dash-kpi-value">{{ card.value }}</span>
            <span class="ae-dash-kpi-label">{{ card.label }}</span>
            <span
              v-if="card.detail"
              class="ae-dash-kpi-detail"
            >{{ card.detail }}</span>
          </span>
        </li>
      </ul>

      <div class="ae-dash-panels">
        <section
          class="ae-dash-panel"
          aria-labelledby="ae-dash-activity-title"
        >
          <div class="ae-dash-panel-head">
            <h2
              id="ae-dash-activity-title"
              class="ae-dash-panel-title"
            >
              {{ activityTitle }}
            </h2>
            <router-link
              v-if="activityTo"
              :to="activityTo"
              class="ae-dash-link"
            >
              <span>{{ seeAllAction$() }}</span>
              <AeIcon
                name="arrowRight"
                :size="18"
              />
            </router-link>
          </div>

          <ul
            v-if="activityItems.length"
            class="ae-dash-activity"
          >
            <li
              v-for="item in activityItems"
              :key="item.id"
            >
              <router-link
                :to="item.to"
                class="ae-dash-activity-row"
              >
                <span
                  class="ae-dash-badge"
                  :class="`ae-dash-tone-${item.tone}`"
                  aria-hidden="true"
                >
                  <KIcon
                    :icon="item.icon"
                    color="var(--ae-tone-fg)"
                  />
                </span>
                <span class="ae-dash-activity-text">
                  <span class="ae-dash-activity-name">{{ item.title }}</span>
                  <span class="ae-dash-activity-meta">{{ item.meta }}</span>
                </span>
                <AeIcon
                  name="chevronRight"
                  class="ae-dash-chevron"
                  :size="20"
                />
              </router-link>
            </li>
          </ul>
          <p
            v-else
            class="ae-dash-empty"
          >
            {{ activityEmpty }}
          </p>
        </section>

        <section
          class="ae-dash-panel"
          aria-labelledby="ae-dash-actions-title"
        >
          <h2
            id="ae-dash-actions-title"
            class="ae-dash-panel-title"
          >
            {{ actionsTitle }}
          </h2>
          <div class="ae-dash-actions">
            <router-link
              v-for="action in actions"
              :key="action.id"
              :to="action.to"
              class="ae-dash-action"
            >
              <KIcon
                :icon="action.icon"
                class="ae-dash-action-icon"
                color="var(--ae-orange)"
              />
              <span class="ae-dash-action-label">{{ action.title }}</span>
              <AeIcon
                name="chevronRight"
                class="ae-dash-action-chevron"
                :size="20"
              />
            </router-link>
          </div>
          <router-link
            v-if="footerLink"
            :to="footerLink.to"
            class="ae-dash-link ae-dash-settings"
          >
            <KIcon
              :icon="footerLink.icon"
              class="ae-dash-settings-icon"
              color="var(--ae-orange)"
            />
            <span>{{ footerLink.label }}</span>
            <AeIcon
              name="arrowRight"
              :size="18"
            />
          </router-link>
        </section>
      </div>
    </template>
  </div>

</template>


<script>

  import { computed } from 'vue';
  import { currentLanguage } from 'kolibri/utils/i18n';
  import { portalStrings } from '../strings';
  import AeIcon from './AeIcon';

  /**
   * Space dashboard: title and date, welcome banner, KPI cards, a recent-activity
   * panel and quick actions. On computers it fills the screen without scrolling.
   */
  export default {
    name: 'AeDashboard',
    components: { AeIcon },
    setup() {
      const { seeAllAction$ } = portalStrings;

      const todayLabel = computed(() => {
        const label = new Intl.DateTimeFormat(currentLanguage, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(new Date());
        return label.charAt(0).toUpperCase() + label.slice(1);
      });

      return { seeAllAction$, todayLabel };
    },
    props: {
      title: {
        type: String,
        required: true,
      },
      welcomeTitle: {
        type: String,
        required: true,
      },
      welcomeSubtitle: {
        type: String,
        default: '',
      },
      bannerSrc: {
        type: String,
        required: true,
      },
      loading: {
        type: Boolean,
        default: false,
      },
      /** [{ id, value, label, detail?, icon (KIcon), tone }] */
      cards: {
        type: Array,
        default: () => [],
      },
      activityTitle: {
        type: String,
        required: true,
      },
      /** Route of the "see all" link of the activity panel; none hides it. */
      activityTo: {
        type: Object,
        default: null,
      },
      /** [{ id, title, meta, icon (KIcon), tone, to }] */
      activityItems: {
        type: Array,
        default: () => [],
      },
      activityEmpty: {
        type: String,
        default: '',
      },
      actionsTitle: {
        type: String,
        required: true,
      },
      /** [{ id, icon (KIcon), title, to }] */
      actions: {
        type: Array,
        default: () => [],
      },
      /** Link under the quick actions: { to, icon (KIcon), label }. */
      footerLink: {
        type: Object,
        default: null,
      },
    },
  };

</script>


<style lang="scss" scoped>

  .ae-dash {
    display: flex;
    flex-direction: column;
    gap: 22px;
  }

  .ae-dash-head {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 24px;
    align-items: baseline;
    justify-content: space-between;
  }

  .ae-dash-title {
    margin: 0;
    font-size: 32px;
    font-weight: 800;
    line-height: 1.1;
    color: var(--ae-navy);
    letter-spacing: -0.02em;
  }

  .ae-dash-date {
    margin: 0;
    font-size: 16px;
    color: var(--ae-text-muted);
  }

  /* ---------- Welcome banner ---------- */

  .ae-dash-welcome {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 180px;
    padding: 24px 48px;
    background: linear-gradient(90deg, #feece1 0%, #fdefe6 55%, #fbede4 100%);
    border-radius: var(--ae-radius-lg);
  }

  .ae-dash-welcome-text {
    position: relative;
    z-index: 1;
    max-width: 52%;
  }

  .ae-dash-welcome-title {
    max-width: 11em;
    margin: 0;
    font-size: 38px;
    font-weight: 800;
    line-height: 1.05;
    color: var(--ae-navy);
    letter-spacing: -0.02em;
  }

  .ae-dash-welcome-subtitle {
    margin: 10px 0 0;
    font-size: 19px;
    color: var(--ae-text-muted);

    &::after {
      display: block;
      width: 70px;
      height: 4px;
      margin-top: 14px;
      content: '';
      background: var(--ae-orange);
      border-radius: 2px;
    }
  }

  // The artwork is taller than the banner: the head rises above its top edge.
  .ae-dash-welcome-art {
    position: absolute;
    right: 0;
    bottom: 0;
    width: auto;
    max-width: 58%;
    height: 126.8%;
    pointer-events: none;
    object-fit: cover;
    object-position: right bottom;
    mask-image: linear-gradient(to right, transparent, #000000 18%);
  }

  /* ---------- Badges (icon circles) ---------- */

  .ae-dash-badge {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;

    svg {
      width: 22px;
      height: 22px;
    }
  }

  .ae-dash-badge-large {
    width: 76px;
    height: 76px;

    svg {
      width: 34px;
      height: 34px;
    }
  }

  .ae-dash-tone-orange {
    --ae-tone-fg: var(--ae-orange);

    background: var(--ae-orange-soft);
  }

  .ae-dash-tone-purple {
    --ae-tone-fg: #7b2fb0;

    background: var(--ae-kpi-purple);
  }

  .ae-dash-tone-blue {
    --ae-tone-fg: #0b6bc4;

    background: var(--ae-kpi-blue);
  }

  .ae-dash-tone-indigo {
    --ae-tone-fg: #4a4fc4;

    background: var(--ae-kpi-blue);
  }

  .ae-dash-tone-green {
    --ae-tone-fg: #1b7f45;

    background: var(--ae-kpi-green);
  }

  .ae-dash-tone-yellow {
    --ae-tone-fg: #8a5a00;

    background: var(--ae-kpi-yellow);
  }

  .ae-dash-tone-mint {
    --ae-tone-fg: #0f766e;

    background: var(--ae-kpi-mint);
  }

  /* ---------- KPI cards ---------- */

  .ae-dash-kpis {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .ae-dash-kpi {
    display: flex;
    gap: 22px;
    align-items: center;
    min-height: 104px;
    padding: 12px 22px;
    background: var(--ae-surface);
    border: 1px solid var(--ae-line);
    border-radius: var(--ae-radius-lg);
    box-shadow: var(--ae-shadow-card);
  }

  .ae-dash-kpi-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .ae-dash-kpi-value {
    font-size: 32px;
    font-weight: 800;
    line-height: 1.1;
    color: var(--ae-navy);
  }

  .ae-dash-kpi-label {
    font-size: 18px;
    font-weight: 600;
    color: var(--ae-navy);
  }

  .ae-dash-kpi-detail {
    font-size: 15px;
    color: var(--ae-text-subtle);
  }

  /* ---------- Panels ---------- */

  .ae-dash-panels {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
    gap: 20px;
    align-items: start;
  }

  .ae-dash-panel {
    padding: 18px 22px 8px;
    background: var(--ae-surface);
    border: 1px solid var(--ae-line);
    border-radius: var(--ae-radius-lg);
    box-shadow: var(--ae-shadow-card);
  }

  .ae-dash-panel-head {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
  }

  .ae-dash-panel-title {
    margin: 0;
    font-size: 24px;
    font-weight: 800;
    line-height: 1.3;
    color: var(--ae-navy);
  }

  .ae-dash-link {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    padding: 4px 6px;
    font-size: 16px;
    font-weight: 700;
    color: var(--ae-orange-ink);
    text-decoration: none;
    border-radius: var(--ae-radius-sm);

    &:hover {
      text-decoration: underline;
      text-underline-offset: 3px;
    }
  }

  .ae-dash-activity {
    padding: 0;
    margin: 8px 0 0;
    list-style: none;

    li + li {
      border-top: 1px solid var(--ae-line);
    }
  }

  .ae-dash-activity-row {
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 9px 8px;
    color: inherit;
    text-decoration: none;
    border-radius: var(--ae-radius-sm);

    &:hover {
      background: var(--ae-surface-muted);
    }
  }

  .ae-dash-activity-text {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    line-height: 1.3;
  }

  .ae-dash-activity-name {
    overflow: hidden;
    font-size: 17px;
    font-weight: 700;
    color: var(--ae-navy);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ae-dash-activity-meta {
    font-size: 15px;
    color: var(--ae-text-subtle);
  }

  .ae-dash-chevron {
    flex-shrink: 0;
    color: var(--ae-text-subtle);
  }

  .ae-dash-empty {
    margin: 16px 0 0;
    color: var(--ae-text-muted);
  }

  .ae-dash-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    margin-top: 14px;
  }

  .ae-dash-action {
    display: flex;
    gap: 16px;
    align-items: center;
    min-height: 72px;
    padding: 12px 18px;
    text-decoration: none;
    background: var(--ae-orange-wash);
    border-radius: var(--ae-radius-md);
    transition:
      background-color 150ms ease,
      transform 150ms ease;

    &:hover {
      background: var(--ae-orange-soft);
    }

    &:active {
      transform: scale(0.98);
    }
  }

  .ae-dash-action-icon {
    flex-shrink: 0;
    width: 30px;
    height: 30px;
  }

  .ae-dash-action-label {
    flex: 1;
    font-size: 17px;
    font-weight: 700;
    line-height: 1.3;
    color: var(--ae-navy);
  }

  .ae-dash-action-chevron {
    flex-shrink: 0;
    color: var(--ae-orange);
  }

  .ae-dash-settings {
    width: 100%;
    padding: 14px 6px 4px;
    margin-top: 14px;
    font-size: 18px;
    border-top: 1px solid var(--ae-line);
    border-radius: 0;
  }

  .ae-dash-settings-icon {
    width: 24px;
    height: 24px;
  }

  .ae-dash-link,
  .ae-dash-activity-row,
  .ae-dash-action {
    &:focus-visible {
      outline: none;
      box-shadow: var(--ae-focus-ring);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ae-dash-action {
      transition: none;
    }
  }

  /* ---------- Responsive ---------- */

  // Computers: the dashboard fills the content area, panels take the rest.
  @media (min-width: 900px) and (min-height: 640px) {
    .ae-dash {
      flex: 1 1 auto;
      gap: 16px;
      min-height: 0;
    }

    .ae-dash-kpis {
      gap: 16px;
    }

    .ae-dash-panels {
      flex: 1 1 auto;
      align-items: stretch;
      min-height: 0;
    }

    .ae-dash-panel {
      padding-bottom: 10px;
      overflow: hidden;
    }

    .ae-dash-activity-row {
      padding-block: 6px;
    }
  }

  // Narrower computers: same grid, more compact cards.
  @media (min-width: 900px) and (max-width: 1279px) {
    .ae-dash-kpis {
      gap: 14px;
    }

    .ae-dash-kpi {
      gap: 14px;
      padding: 14px 16px;
    }

    .ae-dash-badge-large {
      width: 56px;
      height: 56px;

      svg {
        width: 26px;
        height: 26px;
      }
    }

    .ae-dash-kpi-value {
      font-size: 28px;
    }

    .ae-dash-kpi-label {
      font-size: 16px;
    }

    .ae-dash-kpi-detail {
      font-size: 13px;
    }

    .ae-dash-panels {
      grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
      gap: 14px;
    }

    .ae-dash-actions {
      gap: 10px;
    }

    .ae-dash-action {
      gap: 10px;
      min-height: 64px;
      padding: 10px 12px;
    }

    .ae-dash-action-icon {
      width: 24px;
      height: 24px;
    }

    .ae-dash-action-label {
      font-size: 15px;
    }

    // Narrow tiles: the label needs the room more than the chevron.
    .ae-dash-action-chevron {
      display: none;
    }

    .ae-dash-activity-name {
      font-size: 16px;
    }

    .ae-dash-activity-meta {
      font-size: 14px;
    }
  }

  // Shorter screens: tighten step by step, show fewer activity rows.
  @media (min-width: 900px) and (max-height: 959px) {
    .ae-dash {
      gap: 14px;
    }

    .ae-dash-title {
      font-size: 30px;
    }

    .ae-dash-welcome {
      min-height: 150px;
      padding: 26px 40px;
    }

    .ae-dash-welcome-title {
      font-size: 32px;
    }

    .ae-dash-welcome-subtitle {
      margin-top: 10px;
      font-size: 17px;

      &::after {
        margin-top: 12px;
      }
    }

    .ae-dash-kpis {
      gap: 14px;
    }

    .ae-dash-kpi {
      min-height: 94px;
      padding-block: 12px;
    }

    .ae-dash-badge-large {
      width: 64px;
      height: 64px;

      svg {
        width: 30px;
        height: 30px;
      }
    }

    .ae-dash-kpi-value {
      font-size: 30px;
    }

    .ae-dash-panel {
      padding-top: 18px;
    }

    .ae-dash-panel-title {
      font-size: 22px;
    }

    .ae-dash-activity li:nth-child(n + 5) {
      display: none;
    }

    .ae-dash-action {
      min-height: 70px;
    }

    .ae-dash-settings {
      padding-top: 14px;
      margin-top: 14px;
    }
  }

  @media (min-width: 900px) and (max-height: 799px) {
    .ae-dash {
      gap: 12px;
    }

    .ae-dash-title {
      font-size: 26px;
    }

    .ae-dash-date {
      font-size: 14px;
    }

    .ae-dash-welcome {
      min-height: 116px;
      padding: 18px 32px;
    }

    .ae-dash-welcome-title {
      font-size: 26px;
    }

    .ae-dash-welcome-subtitle {
      margin-top: 6px;
      font-size: 15px;

      &::after {
        display: none;
      }
    }

    .ae-dash-kpis {
      gap: 12px;
    }

    .ae-dash-kpi {
      gap: 14px;
      min-height: 82px;
      padding: 10px 16px;
    }

    .ae-dash-badge-large {
      width: 52px;
      height: 52px;

      svg {
        width: 24px;
        height: 24px;
      }
    }

    .ae-dash-kpi-value {
      font-size: 26px;
    }

    .ae-dash-kpi-label {
      font-size: 15px;
    }

    .ae-dash-kpi-detail {
      font-size: 13px;
    }

    .ae-dash-panels {
      gap: 12px;
    }

    .ae-dash-panel {
      padding: 14px 16px 8px;
    }

    .ae-dash-panel-title {
      font-size: 20px;
    }

    .ae-dash-activity {
      margin-top: 6px;
    }

    .ae-dash-activity li:nth-child(n + 4) {
      display: none;
    }

    .ae-dash-activity .ae-dash-badge {
      width: 38px;
      height: 38px;

      svg {
        width: 20px;
        height: 20px;
      }
    }

    .ae-dash-actions {
      gap: 10px;
      margin-top: 10px;
    }

    .ae-dash-action {
      min-height: 56px;
      padding: 8px 12px;
    }

    .ae-dash-action-label {
      font-size: 15px;
    }

    .ae-dash-settings {
      padding-top: 10px;
      margin-top: 10px;
      font-size: 16px;
    }
  }

  // Very short screens: one-line banner, compact cards, two activity rows.
  @media (min-width: 900px) and (max-height: 699px) {
    .ae-dash {
      gap: 10px;
    }

    .ae-dash-title {
      font-size: 24px;
    }

    .ae-dash-welcome {
      min-height: 80px;
      padding: 14px 32px;
    }

    .ae-dash-welcome-title {
      max-width: none;
      font-size: 22px;
    }

    .ae-dash-welcome-subtitle {
      margin-top: 4px;
      font-size: 14px;
    }

    .ae-dash-kpis {
      gap: 10px;
    }

    .ae-dash-kpi {
      gap: 12px;
      min-height: 70px;
      padding: 8px 14px;
    }

    .ae-dash-badge-large {
      width: 44px;
      height: 44px;

      svg {
        width: 22px;
        height: 22px;
      }
    }

    .ae-dash-kpi-value {
      font-size: 22px;
    }

    .ae-dash-kpi-label {
      font-size: 14px;
    }

    .ae-dash-kpi-detail {
      font-size: 12px;
    }

    .ae-dash-panels {
      gap: 10px;
    }

    .ae-dash-activity li:nth-child(n + 3) {
      display: none;
    }

    .ae-dash-actions {
      gap: 8px;
      margin-top: 8px;
    }

    .ae-dash-action {
      min-height: 48px;
      padding: 6px 12px;
    }

    .ae-dash-action-icon {
      width: 22px;
      height: 22px;
    }

    .ae-dash-settings {
      padding-top: 8px;
      margin-top: 8px;
    }
  }

  // Tablets and phones keep a natural, scrollable layout.
  @media (max-width: 899px) {
    .ae-dash-kpis {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .ae-dash-panels {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (max-width: 719px) {
    .ae-dash-title {
      font-size: 28px;
    }

    .ae-dash-welcome {
      min-height: 0;
      padding: 24px 20px;
    }

    .ae-dash-welcome-text {
      max-width: none;
    }

    .ae-dash-welcome-title {
      font-size: 26px;
    }

    .ae-dash-welcome-subtitle {
      font-size: 17px;
    }

    .ae-dash-welcome-art {
      display: none;
    }

    .ae-dash-kpis,
    .ae-dash-actions {
      grid-template-columns: minmax(0, 1fr);
    }

    .ae-dash-kpi {
      min-height: 0;
    }

    .ae-dash-badge-large {
      width: 60px;
      height: 60px;

      svg {
        width: 28px;
        height: 28px;
      }
    }
  }

</style>
