<template>

  <AeSpaceLayout
    :spaceLabel="spaceHeadingAdmin$()"
    :items="items"
    :activeId="activeId"
    :showDeviceLink="canAccessDeviceAdministration"
    :previewLinks="previewLinks"
    :promoText="adminSidebarTagline$()"
    :showBackLink="false"
  />

</template>


<script>

  import { computed, provide } from 'vue';
  import { portalStrings } from '../../strings';
  import { useAeAdminNav } from '../../composables/useAeNav';
  import { useAePermissions } from '../../composables/useAePermissions';
  import AeSpaceLayout from './AeSpaceLayout';

  export default {
    name: 'AeAdminLayout',
    components: { AeSpaceLayout },
    setup() {
      const {
        spaceHeadingAdmin$,
        previewLearnerSpace$,
        previewCoachSpace$,
        adminSidebarTagline$,
        breadcrumbAdmin$,
      } = portalStrings;
      // Start of every page breadcrumb (see AePageHeader).
      provide('aeSpaceRoot', { label: breadcrumbAdmin$(), to: { name: 'AeAdminHome' } });
      const { items, activeId } = useAeAdminNav();
      const { isSuperuser, canAccessDeviceAdministration } = useAePermissions();
      const previewLinks = computed(() => {
        if (!isSuperuser.value) {
          return [];
        }
        return [
          { id: 'prev-learn', label: previewLearnerSpace$(), to: '/apprenant' },
          { id: 'prev-coach', label: previewCoachSpace$(), to: '/formateur' },
        ];
      });
      return {
        spaceHeadingAdmin$,
        adminSidebarTagline$,
        items,
        activeId,
        canAccessDeviceAdministration,
        previewLinks,
      };
    },
  };

</script>
