import client from 'kolibri/client';
import urls from 'kolibri/urls';

function listUrl(name) {
  return urls[`kolibri:action_education_training:${name}`]();
}

function detailUrl(name, id) {
  return urls[`kolibri:action_education_training:${name}`](id);
}

function unwrap(data) {
  if (Array.isArray(data)) {
    return data;
  }
  return (data && data.results) || [];
}

export function useTrainingApi() {
  function fetchTrainings() {
    return client({ url: listUrl('aetraining-list') }).then(r => unwrap(r.data));
  }

  function createTraining(payload) {
    return client({
      url: listUrl('aetraining-list'),
      method: 'POST',
      data: payload,
    }).then(r => r.data);
  }

  function fetchSessions() {
    return client({ url: listUrl('aesession-list') }).then(r => unwrap(r.data));
  }

  function createSession(payload) {
    return client({
      url: listUrl('aesession-list'),
      method: 'POST',
      data: payload,
    }).then(r => r.data);
  }

  function fetchSession(id) {
    return client({ url: detailUrl('aesession-detail', id) }).then(r => r.data);
  }

  function fetchEnrollments(params = {}) {
    return client({
      url: listUrl('aeenrollment-list'),
      params,
    }).then(r => unwrap(r.data));
  }

  function createEnrollment(payload) {
    return client({
      url: listUrl('aeenrollment-list'),
      method: 'POST',
      data: payload,
    }).then(r => r.data);
  }

  function fetchAttendances(params = {}) {
    return client({
      url: listUrl('aeattendance-list'),
      params,
    }).then(r => unwrap(r.data));
  }

  function createAttendance(payload) {
    return client({
      url: listUrl('aeattendance-list'),
      method: 'POST',
      data: payload,
    }).then(r => r.data);
  }

  function updateAttendance(id, payload) {
    return client({
      url: detailUrl('aeattendance-detail', id),
      method: 'PATCH',
      data: payload,
    }).then(r => r.data);
  }

  return {
    fetchTrainings,
    createTraining,
    fetchSessions,
    createSession,
    fetchSession,
    fetchEnrollments,
    createEnrollment,
    fetchAttendances,
    createAttendance,
    updateAttendance,
  };
}
