import { ref } from 'vue';
import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
import { useAePermissions } from './useAePermissions';
import { useClassroomApi } from './useClassroomApi';

/** Trainers (and admins) of the facility, the people a course can be assigned to. */
export function useFacilityTrainers() {
  const { userFacilityId } = useAePermissions();
  const { isStaffUser } = useClassroomApi();
  const trainers = ref([]);

  function loadTrainers() {
    return FacilityUserResource.fetchCollection({
      getParams: { member_of: userFacilityId.value },
      force: true,
    })
      .then(users => {
        trainers.value = (users || [])
          .filter(isStaffUser)
          .map(user => ({ id: user.id, name: user.full_name || user.username }))
          .sort((a, b) => a.name.localeCompare(b.name));
      })
      .catch(() => {
        trainers.value = [];
      });
  }

  function trainerName(id) {
    const trainer = trainers.value.find(item => item.id === id);
    return trainer ? trainer.name : '';
  }

  return { trainers, loadTrainers, trainerName };
}
