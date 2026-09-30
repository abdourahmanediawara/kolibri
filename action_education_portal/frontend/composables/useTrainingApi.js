import client from 'kolibri/client';
import urls from 'kolibri/urls';

/**
 * Kolibri frontend URL registry uses underscores (Django reverse names with
 * hyphens are rewritten). Never call urls['…-list'] — it returns undefined and
 * `undefined()` throws before any XHR starts, leaving loaders stuck forever.
 */
const NS = 'kolibri:action_education_training';

export const DEFAULT_REQUEST_TIMEOUT_MS = 15000;

/** Hard fallbacks if the frontend URL registry is missing a name at runtime. */
const FALLBACK_URLS = {
  aetraining_list: () => '/action_education_training/api/training/',
  aetraining_detail: id => `/action_education_training/api/training/${id}/`,
  aetraining_start: id => `/action_education_training/api/training/${id}/start/`,
  aesession_list: () => '/action_education_training/api/session/',
  aesession_detail: id => `/action_education_training/api/session/${id}/`,
  aeenrollment_list: () => '/action_education_training/api/enrollment/',
  aeenrollment_detail: id => `/action_education_training/api/enrollment/${id}/`,
  aeattendance_list: () => '/action_education_training/api/attendance/',
  aeattendance_detail: id => `/action_education_training/api/attendance/${id}/`,
  aecertificate_list: () => '/action_education_training/api/certificate/',
  aecertificate_detail: id => `/action_education_training/api/certificate/${id}/`,
  aecertificate_issue: () => '/action_education_training/api/certificate/issue/',
  aecertificate_print: id => `/action_education_training/api/certificate/${id}/print/`,
  aeexport_attendance: sessionId =>
    `/action_education_training/api/export/attendance/${sessionId}/`,
  aeexport_enrollments: trainingId =>
    `/action_education_training/api/export/enrollments/${trainingId}/`,
  aeexport_certificates: () => '/action_education_training/api/export/certificates/',
  aesummary_session: sessionId =>
    `/action_education_training/api/summary/session/${sessionId}/`,
  aelearnerresults: () => '/action_education_training/api/learnerresults/',
  aecoach_classroom: () => '/action_education_training/api/coach/classroom/',
  aecoach_learner: () => '/action_education_training/api/coach/learner/',
  aeusername_available: () => '/action_education_training/api/username-available/',
  aeresource_list: () => '/action_education_training/api/resource/',
  aeresource_detail: id => `/action_education_training/api/resource/${id}/`,
  aeresource_upload: () => '/action_education_training/api/resource/upload/',
  aeresource_download: id => `/action_education_training/api/resource/${id}/download/`,
  aeresource_link: () => '/action_education_training/api/resource/link/',
  aeresource_viewed: id => `/action_education_training/api/resource/${id}/viewed/`,
  aequiz_list: () => '/action_education_training/api/quiz/',
  aequiz_detail: id => `/action_education_training/api/quiz/${id}/`,
  aequiz_submit: id => `/action_education_training/api/quiz/${id}/submit/`,
  aequizattempt_list: () => '/action_education_training/api/quizattempt/',
  aeprogress_course: trainingId =>
    `/action_education_training/api/progress/course/${trainingId}/`,
  aeprogress_overview: () => '/action_education_training/api/progress/overview/',
  aeprogress_me: () => '/action_education_training/api/progress/me/',
};

// Big course videos need far more time than an API call.
const UPLOAD_TIMEOUT_MS = 15 * 60 * 1000;

export function resolveTrainingUrl(name, ...args) {
  const key = `${NS}:${name}`;
  try {
    const resolver = urls[key];
    if (typeof resolver === 'function') {
      return resolver(...args);
    }
  } catch (e) {
    // Fall through to hardcoded paths — never throw synchronously from here
    // when a fallback exists (sync throws break Promise.all without .catch).
  }
  const fallback = FALLBACK_URLS[name];
  if (typeof fallback === 'function') {
    return fallback(...args);
  }
  const err = new Error(
    `URL introuvable: ${key}. Attendu avec underscores (ex. aetraining_list).`,
  );
  err.code = 'AE_URL_MISSING';
  err.urlName = key;
  throw err;
}

/**
 * Always returns a Promise so callers can attach .catch/.finally even when
 * URL resolution fails synchronously.
 */
function safeRequest(buildOptions, timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS) {
  return Promise.resolve()
    .then(() => {
      const options = typeof buildOptions === 'function' ? buildOptions() : buildOptions;
      return withTimeout(client(options), timeoutMs);
    })
    .catch(err => {
      throw err;
    });
}

export function unwrapList(data) {
  if (Array.isArray(data)) {
    return data;
  }
  return (data && data.results) || [];
}

export function normalizeError(err) {
  if (!err) {
    return { code: 'AE_UNKNOWN', status: null, message: 'Unknown error' };
  }
  if (err.code === 'AE_REQUEST_TIMEOUT') {
    return {
      code: 'AE_REQUEST_TIMEOUT',
      status: null,
      message: err.message || 'Timeout',
    };
  }
  if (err.code === 'AE_URL_MISSING') {
    return {
      code: 'AE_URL_MISSING',
      status: null,
      message: err.message,
      urlName: err.urlName,
    };
  }
  // Axios cancel (e.g. Kolibri disconnection interceptor)
  if (err.code === 'ERR_CANCELED' || err.__CANCEL__) {
    return {
      code: 'AE_REQUEST_CANCELLED',
      status: null,
      message: err.message || 'Cancelled',
    };
  }
  const status = err.response && err.response.status;
  return {
    code: status ? `HTTP_${status}` : 'AE_REQUEST_FAILED',
    status: status || null,
    message: err.message || String(err),
    data: err.response && err.response.data,
  };
}

export function withTimeout(promise, ms = DEFAULT_REQUEST_TIMEOUT_MS) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error('AE_REQUEST_TIMEOUT');
      err.code = 'AE_REQUEST_TIMEOUT';
      reject(err);
    }, ms);
  });
  return Promise.race([Promise.resolve(promise), timeout]).finally(() => {
    clearTimeout(timer);
  });
}

export function useTrainingApi() {
  function fetchTrainings(params = {}) {
    return safeRequest(() => ({ url: resolveTrainingUrl('aetraining_list'), params })).then(r =>
      unwrapList(r.data),
    );
  }

  function updateTraining(id, payload) {
    return safeRequest(() => ({
      url: resolveTrainingUrl('aetraining_detail', id),
      method: 'PATCH',
      data: payload,
    })).then(r => r.data);
  }

  /** A learner starts a course: they join its learners. */
  function startTraining(id) {
    return safeRequest(() => ({
      url: resolveTrainingUrl('aetraining_start', id),
      method: 'POST',
    })).then(r => r.data);
  }

  function createTraining(payload) {
    return safeRequest(() => ({
      url: resolveTrainingUrl('aetraining_list'),
      method: 'POST',
      data: payload,
    })).then(r => r.data);
  }

  function fetchTraining(id) {
    return safeRequest(() => ({
      url: resolveTrainingUrl('aetraining_detail', id),
    })).then(r => r.data);
  }

  function fetchResources(params = {}) {
    return safeRequest(() => ({
      url: resolveTrainingUrl('aeresource_list'),
      params,
    })).then(r => unwrapList(r.data));
  }

  function uploadResource({ trainingId, title, file }) {
    // Large media uploads need a longer window than the default API timeout.
    return safeRequest(
      () => ({
        url: resolveTrainingUrl('aeresource_upload'),
        method: 'POST',
        multipart: true,
        data: {
          training: trainingId,
          title: title || '',
          file,
        },
      }),
      UPLOAD_TIMEOUT_MS,
    ).then(r => r.data);
  }

  function addLink({ trainingId, title, url }) {
    return safeRequest(() => ({
      url: resolveTrainingUrl('aeresource_link'),
      method: 'POST',
      data: { training: trainingId, title: title || '', url },
    })).then(r => r.data);
  }

  function markResourceViewed(id) {
    return safeRequest(() => ({
      url: resolveTrainingUrl('aeresource_viewed', id),
      method: 'POST',
    })).then(r => r.data);
  }

  /** Address to show a file in the page (video, audio, image, PDF). */
  function resourceViewUrl(id) {
    return `${resolveTrainingUrl('aeresource_download', id)}?inline=1`;
  }

  function fetchQuizzes(params = {}) {
    return safeRequest(() => ({ url: resolveTrainingUrl('aequiz_list'), params })).then(r =>
      unwrapList(r.data),
    );
  }

  function fetchQuiz(id) {
    return safeRequest(() => ({ url: resolveTrainingUrl('aequiz_detail', id) })).then(
      r => r.data,
    );
  }

  function createQuiz(payload) {
    return safeRequest(() => ({
      url: resolveTrainingUrl('aequiz_list'),
      method: 'POST',
      data: payload,
    })).then(r => r.data);
  }

  function updateQuiz(id, payload) {
    return safeRequest(() => ({
      url: resolveTrainingUrl('aequiz_detail', id),
      method: 'PATCH',
      data: payload,
    })).then(r => r.data);
  }

  function deleteQuiz(id) {
    return safeRequest(() => ({
      url: resolveTrainingUrl('aequiz_detail', id),
      method: 'DELETE',
    }));
  }

  /** answers: { questionId: [choiceId, …] }; the server grades the attempt. */
  function submitQuiz(id, answers) {
    return safeRequest(() => ({
      url: resolveTrainingUrl('aequiz_submit', id),
      method: 'POST',
      data: { answers },
    })).then(r => r.data);
  }

  function fetchQuizAttempts(params = {}) {
    return safeRequest(() => ({
      url: resolveTrainingUrl('aequizattempt_list'),
      params,
    })).then(r => unwrapList(r.data));
  }

  function fetchCourseProgress(trainingId) {
    return safeRequest(() => ({
      url: resolveTrainingUrl('aeprogress_course', trainingId),
    })).then(r => r.data);
  }

  function fetchProgressOverview() {
    return safeRequest(() => ({ url: resolveTrainingUrl('aeprogress_overview') })).then(
      r => r.data,
    );
  }

  function fetchMyProgress() {
    return safeRequest(() => ({ url: resolveTrainingUrl('aeprogress_me') })).then(r => r.data);
  }

  function deleteResource(id) {
    return safeRequest(() => ({
      url: resolveTrainingUrl('aeresource_detail', id),
      method: 'DELETE',
    }));
  }

  function resourceDownloadUrl(id) {
    return resolveTrainingUrl('aeresource_download', id);
  }

  function fetchSessions() {
    return safeRequest(() => ({ url: resolveTrainingUrl('aesession_list') })).then(r =>
      unwrapList(r.data),
    );
  }

  function createSession(payload) {
    return Promise.resolve()
      .then(() => {
        const url = resolveTrainingUrl('aesession_list');
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.info('[AE createSession] request', { url, method: 'POST', data: payload });
        }
        return safeRequest(() => ({
          url,
          method: 'POST',
          data: payload,
        })).then(r => {
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.info('[AE createSession] response', {
              url,
              status: r.status,
              data: r.data,
            });
          }
          return r.data;
        });
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error('[AE createSession] error', normalizeError(err));
        throw err;
      });
  }

  function fetchSession(id) {
    return safeRequest(() => ({ url: resolveTrainingUrl('aesession_detail', id) })).then(
      r => r.data,
    );
  }

  function fetchEnrollments(params = {}) {
    return safeRequest(() => ({
      url: resolveTrainingUrl('aeenrollment_list'),
      params,
    })).then(r => unwrapList(r.data));
  }

  function createEnrollment(payload) {
    return safeRequest(() => ({
      url: resolveTrainingUrl('aeenrollment_list'),
      method: 'POST',
      data: payload,
    })).then(r => r.data);
  }

  function fetchAttendances(params = {}) {
    return safeRequest(() => ({
      url: resolveTrainingUrl('aeattendance_list'),
      params,
    })).then(r => unwrapList(r.data));
  }

  function createAttendance(payload) {
    return safeRequest(() => ({
      url: resolveTrainingUrl('aeattendance_list'),
      method: 'POST',
      data: payload,
    })).then(r => r.data);
  }

  function updateAttendance(id, payload) {
    return safeRequest(() => ({
      url: resolveTrainingUrl('aeattendance_detail', id),
      method: 'PATCH',
      data: payload,
    })).then(r => r.data);
  }

  function fetchCertificates() {
    return safeRequest(() => ({ url: resolveTrainingUrl('aecertificate_list') })).then(r =>
      unwrapList(r.data),
    );
  }

  function issueCertificate(payload) {
    return safeRequest(() => ({
      url: resolveTrainingUrl('aecertificate_issue'),
      method: 'POST',
      data: payload,
    })).then(r => r.data);
  }

  function certificatePrintUrl(id) {
    return resolveTrainingUrl('aecertificate_print', id);
  }

  function attendanceExportUrl(sessionId) {
    return resolveTrainingUrl('aeexport_attendance', sessionId);
  }

  function enrollmentsExportUrl(trainingId) {
    return resolveTrainingUrl('aeexport_enrollments', trainingId);
  }

  function certificatesExportUrl() {
    return resolveTrainingUrl('aeexport_certificates');
  }

  function fetchSessionSummary(sessionId) {
    return safeRequest(() => ({
      url: resolveTrainingUrl('aesummary_session', sessionId),
    })).then(r => r.data);
  }

  function fetchLearnerResults(params = {}) {
    return safeRequest(() => ({
      url: resolveTrainingUrl('aelearnerresults'),
      params,
    })).then(r => r.data);
  }

  return {
    fetchTrainings,
    createTraining,
    updateTraining,
    startTraining,
    fetchTraining,
    fetchResources,
    uploadResource,
    addLink,
    markResourceViewed,
    resourceViewUrl,
    deleteResource,
    resourceDownloadUrl,
    fetchQuizzes,
    fetchQuiz,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    submitQuiz,
    fetchQuizAttempts,
    fetchCourseProgress,
    fetchProgressOverview,
    fetchMyProgress,
    fetchSessions,
    createSession,
    fetchSession,
    fetchEnrollments,
    createEnrollment,
    fetchAttendances,
    createAttendance,
    updateAttendance,
    fetchCertificates,
    issueCertificate,
    certificatePrintUrl,
    attendanceExportUrl,
    enrollmentsExportUrl,
    certificatesExportUrl,
    fetchSessionSummary,
    fetchLearnerResults,
  };
}
