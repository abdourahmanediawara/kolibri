<template>

  <AeSpaceLayout
    :spaceLabel="spaceHeadingLearner$()"
    :items="items"
    :profileTo="{ name: 'AeLearnProfile' }"
    :activeId="activeId"
    :previewLinks="previewLinks"
    :promoText="learnSidebarTagline$()"
    :showBackLink="false"
  />

</template>


<script>

  import { computed, provide } from 'vue';
  import { portalStrings } from '../../strings';
  import { useAeLearnerNav } from '../../composables/useAeNav';
  import { useAePermissions } from '../../composables/useAePermissions';
  import AeSpaceLayout from './AeSpaceLayout';

  export default {
    name: 'AeLearnerLayout',
    components: { AeSpaceLayout },
    setup() {
      const { spaceHeadingLearner$, previewCoachSpace$, previewAdminSpace$, learnSidebarTagline$ } =
        portalStrings;
      // Start of every page breadcrumb (see AePageHeader).
      provide('aeSpaceRoot', { label: spaceHeadingLearner$(), to: { name: 'AeLearnHome' } });
      const { items, activeId } = useAeLearnerNav();
      const { isSuperuser } = useAePermissions();
      const previewLinks = computed(() => {
        if (!isSuperuser.value) {
          return [];
        }
        return [
          { id: 'prev-coach', label: previewCoachSpace$(), to: '/formateur' },
          { id: 'prev-admin', label: previewAdminSpace$(), to: '/administrateur' },
        ];
      });
      return {
        spaceHeadingLearner$,
        learnSidebarTagline$,
        items,
        activeId,
        previewLinks,
      };
    },
  };

</script>
