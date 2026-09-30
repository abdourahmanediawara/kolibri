import client from 'kolibri/client';
import { UserKinds } from 'kolibri/constants';
import ClassroomResource from 'kolibri-common/apiResources/ClassroomResource';
import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
import {
  resolveTrainingUrl,
  withTimeout,
} from './useTrainingApi';

/**
 * Classroom / learner helpers for the AE coach space.
 * List via Kolibri auth resources; create via AE coach endpoints
 * (Kolibri auth POST is admin-only and returns 403 for coaches).
 */
export function useClassroomApi() {
  function fetchClassrooms(facilityId) {
    return withTimeout(
      ClassroomResource.fetchCollection({
        getParams: { parent: facilityId },
        force: true,
      }),
    ).then(list => list || []);
  }

  function createClassroom({ name }) {
    return withTimeout(
      client({
        url: resolveTrainingUrl('aecoach_classroom'),
        method: 'POST',
        data: { name },
      }),
    ).then(r => r.data);
  }

  function fetchUsersInCollection(collectionId) {
    return withTimeout(
      FacilityUserResource.fetchCollection({
        getParams: { member_of: collectionId },
        force: true,
      }),
    ).then(list => list || []);
  }

  function fetchFacilityUsers(facilityId) {
    return withTimeout(
      FacilityUserResource.fetchCollection({
        getParams: { member_of: facilityId },
        force: true,
      }),
    ).then(list => list || []);
  }

  function createLearner({ username, fullName, password, classroomId }) {
    return withTimeout(
      client({
        url: resolveTrainingUrl('aecoach_learner'),
        method: 'POST',
        data: {
          username,
          full_name: fullName,
          password,
          classroom_id: classroomId,
        },
      }),
    ).then(r => r.data);
  }

  /** { valid, available } for a new account's username (staff only). */
  function checkUsername(username) {
    return withTimeout(
      client({
        url: resolveTrainingUrl('aeusername_available'),
        params: { username },
      }),
    ).then(r => r.data);
  }

  function isStaffUser(user) {
    return Boolean(
      (user.roles || []).find(
        role =>
          role.kind === UserKinds.COACH ||
          role.kind === UserKinds.ASSIGNABLE_COACH ||
          role.kind === UserKinds.ADMIN,
      ),
    );
  }

  return {
    fetchClassrooms,
    createClassroom,
    fetchUsersInCollection,
    fetchFacilityUsers,
    createLearner,
    checkUsername,
    isStaffUser,
  };
}
