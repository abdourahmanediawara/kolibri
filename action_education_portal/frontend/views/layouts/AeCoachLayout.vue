<template>

  <AeSpaceLayout
    :spaceLabel="spaceHeadingCoach$()"
    :items="items"
    :activeId="activeId"
    :previewLinks="previewLinks"
    :promoText="adminSidebarTagline$()"
    :showBackLink="false"
  />

</template>


<script>

  import { computed, provide } from 'vue';
  import { portalStrings } from '../../strings';
  import { useAeCoachNav } from '../../composables/useAeNav';
  import { useAePermissions } from '../../composables/useAePermissions';
  import AeSpaceLayout from './AeSpaceLayout';

  export default {
    name: 'AeCoachLayout',
    components: { AeSpaceLayout },
    setup() {
      const { spaceHeadingCoach$, previewLearnerSpace$, previewAdminSpace$, adminSidebarTagline$ } =
        portalStrings;
      // Start of every page breadcrumb (see AePageHeader).
      provide('aeSpaceRoot', { label: spaceHeadingCoach$(), to: { name: 'AeCoachHome' } });
      const { items, activeId } = useAeCoachNav();
      const { isSuperuser } = useAePermissions();
      const previewLinks = computed(() => {
        if (!isSuperuser.value) {
          return [];
        }
        return [
          { id: 'prev-learn', label: previewLearnerSpace$(), to: '/apprenant' },
          { id: 'prev-admin', label: previewAdminSpace$(), to: '/administrateur' },
        ];
      });
      return {
        spaceHeadingCoach$,
        adminSidebarTagline$,
        items,
        activeId,
        previewLinks,
      };
    },
  };

</script>
