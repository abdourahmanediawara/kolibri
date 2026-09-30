<template>

  <div class="ae-help">
    <AePageHeader
      :title="helpPageTitle$()"
      :subtitle="learnHelpIntro$()"
    />

    <ol class="ae-help-steps">
      <li
        v-for="(step, index) in steps"
        :key="step.id"
        class="ae-help-step"
      >
        <span
          class="ae-help-step-icon"
          :class="`ae-help-tone-${step.tone}`"
          aria-hidden="true"
        >
          <AeIcon
            :name="step.icon"
            :size="24"
          />
        </span>
        <div class="ae-help-step-text">
          <h2 class="ae-help-step-title">
            <span class="ae-help-step-number">{{ index + 1 }}</span>
            {{ step.title }}
          </h2>
          <p>{{ step.body }}</p>
        </div>
      </li>
    </ol>

    <section
      class="ae-help-contact"
      aria-labelledby="ae-help-contact-title"
    >
      <AeIcon
        name="circleHelp"
        :size="32"
      />
      <div>
        <h2
          id="ae-help-contact-title"
          class="ae-help-contact-title"
        >
          {{ learnHelpStuckTitle$() }}
        </h2>
        <p>{{ learnHelpStuckText$() }}</p>
      </div>
      <router-link
        :to="{ name: 'AeLearnFormations' }"
        class="ae-help-primary"
      >
        <span>{{ myCourses$() }}</span>
        <AeIcon
          name="arrowRight"
          :size="18"
        />
      </router-link>
    </section>
  </div>

</template>


<script>

  import { portalStrings } from '../../strings';
  import AeIcon from '../AeIcon';
  import AePageHeader from '../AePageHeader';

  /** Learner help: the steps of a course, from signing in to the certificate. */
  export default {
    name: 'AeLearnHelpPage',
    components: { AeIcon, AePageHeader },
    setup() {
      const {
        helpPageTitle$,
        learnHelpIntro$,
        learnHelpStuckTitle$,
        learnHelpStuckText$,
        myCourses$,
      } = portalStrings;

      const STEPS = [
        ['signin', 'user', 'blue'],
        ['courses', 'bookOpen', 'orange'],
        ['supports', 'squarePlay', 'red'],
        ['download', 'download', 'mint'],
        ['quiz', 'listChecks', 'purple'],
        ['exam', 'award', 'yellow'],
        ['progress', 'chartColumns', 'green'],
        ['offline', 'globe', 'blue'],
      ];
      const steps = STEPS.map(([id, icon, tone]) => {
        const key = id.charAt(0).toUpperCase() + id.slice(1);
        return {
          id,
          icon,
          tone,
          title: portalStrings[`learnHelp${key}Title$`](),
          body: portalStrings[`learnHelp${key}Body$`](),
        };
      });

      return {
        helpPageTitle$,
        learnHelpIntro$,
        learnHelpStuckTitle$,
        learnHelpStuckText$,
        myCourses$,
        steps,
      };
    },
  };

</script>


<style lang="scss" scoped>

  @import '../../styles/components';

  .ae-help {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .ae-help-steps {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 14px;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .ae-help-step {
    @include ae-card;

    display: flex;
    gap: 14px;
    align-items: flex-start;
    padding: 16px 18px;
  }

  .ae-help-step-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
  }

  .ae-help-tone-blue {
    color: #1f5f99;
    background: var(--ae-kpi-blue);
  }

  .ae-help-tone-orange {
    color: var(--ae-orange-deep);
    background: var(--ae-orange-wash);
  }

  .ae-help-tone-red {
    color: #a3263a;
    background: var(--ae-kpi-red);
  }

  .ae-help-tone-mint {
    color: #176b63;
    background: var(--ae-kpi-mint);
  }

  .ae-help-tone-purple {
    color: #6d2e7f;
    background: var(--ae-kpi-purple);
  }

  .ae-help-tone-yellow {
    color: var(--ae-orange-deep);
    background: var(--ae-kpi-yellow);
  }

  .ae-help-tone-green {
    color: #1b6e3c;
    background: var(--ae-kpi-green);
  }

  .ae-help-step-text {
    min-width: 0;

    p {
      margin: 4px 0 0;
      color: var(--ae-text-muted);
    }
  }

  .ae-help-step-title {
    display: flex;
    gap: 8px;
    align-items: center;
    margin: 0;
    font-size: 17px;
    font-weight: 800;
    color: var(--ae-navy);
  }

  .ae-help-step-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    font-size: 13px;
    color: #ffffff;
    background: var(--ae-orange);
    border-radius: 50%;
  }

  .ae-help-contact {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
    padding: 18px 22px;
    color: var(--ae-orange);
    background: linear-gradient(90deg, #feece1 0%, #fdefe6 100%);
    border-radius: var(--ae-radius-lg);

    div {
      flex: 1;
      min-width: 220px;
    }

    p {
      margin: 4px 0 0;
      color: var(--ae-text-muted);
    }
  }

  .ae-help-contact-title {
    margin: 0;
    font-size: 19px;
    font-weight: 800;
    color: var(--ae-navy);
  }

  .ae-help-primary {
    @include ae-button-primary;

    min-height: 44px;
    font-size: 16px;
  }

  @media (min-width: 900px) and (max-height: 799px) {
    .ae-help,
    .ae-help-steps {
      gap: 10px;
    }

    .ae-help-step {
      padding: 12px 14px;
    }
  }

</style>
