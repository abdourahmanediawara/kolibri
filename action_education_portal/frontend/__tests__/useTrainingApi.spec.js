/**
 * @jest-environment jsdom
 */

const mockClient = jest.fn();

jest.mock('kolibri/client', () => ({
  __esModule: true,
  default: (...args) => mockClient(...args),
}));

const urlFns = {};
jest.mock('kolibri/urls', () => {
  const handler = {
    get(_target, prop) {
      if (prop in urlFns) {
        return urlFns[prop];
      }
      return undefined;
    },
  };
  return {
    __esModule: true,
    default: new Proxy({}, handler),
  };
});

import {
  resolveTrainingUrl,
  useTrainingApi,
  withTimeout,
  normalizeError,
} from '../composables/useTrainingApi';

describe('useTrainingApi URL resolution', () => {
  beforeEach(() => {
    Object.keys(urlFns).forEach(k => delete urlFns[k]);
    mockClient.mockReset();
  });

  it('resolves underscore URL names used by Kolibri frontend registry', () => {
    urlFns['kolibri:action_education_training:aetraining_list'] = () =>
      '/action_education_training/api/training/';
    expect(resolveTrainingUrl('aetraining_list')).toBe(
      '/action_education_training/api/training/',
    );
  });

  it('throws a clear error for hyphen names that are not registered', () => {
    expect(() => resolveTrainingUrl('aetraining-list')).toThrow(/URL introuvable/);
  });

  it('falls back to hardcoded paths when the registry is missing a known name', () => {
    expect(resolveTrainingUrl('aetraining_list')).toBe(
      '/action_education_training/api/training/',
    );
    expect(resolveTrainingUrl('aelearnerresults')).toBe(
      '/action_education_training/api/learnerresults/',
    );
  });

  it('fetchTrainings still works via fallback when registry is empty', async () => {
    mockClient.mockResolvedValue({ data: [{ id: '1', title: 'Cours' }] });
    const api = useTrainingApi();
    const list = await api.fetchTrainings();
    expect(mockClient).toHaveBeenCalledWith({
      url: '/action_education_training/api/training/',
      params: {},
    });
    expect(list).toEqual([{ id: '1', title: 'Cours' }]);
  });

  it('fetchTrainings calls the underscore list URL and unwraps arrays', async () => {
    urlFns['kolibri:action_education_training:aetraining_list'] = () =>
      '/action_education_training/api/training/';
    mockClient.mockResolvedValue({ data: [{ id: '1', title: 'Cours' }] });
    const api = useTrainingApi();
    const list = await api.fetchTrainings();
    expect(mockClient).toHaveBeenCalledWith({
      url: '/action_education_training/api/training/',
      params: {},
    });
    expect(list).toEqual([{ id: '1', title: 'Cours' }]);
  });

  it('fetchTrainings unwraps paginated results', async () => {
    urlFns['kolibri:action_education_training:aetraining_list'] = () =>
      '/action_education_training/api/training/';
    mockClient.mockResolvedValue({ data: { results: [] } });
    const api = useTrainingApi();
    await expect(api.fetchTrainings()).resolves.toEqual([]);
  });

  it('withTimeout rejects after the deadline', async () => {
    jest.useFakeTimers();
    const pending = withTimeout(new Promise(() => {}), 50);
    const assertion = expect(pending).rejects.toMatchObject({ code: 'AE_REQUEST_TIMEOUT' });
    jest.advanceTimersByTime(60);
    await assertion;
    jest.useRealTimers();
  });

  it('normalizeError maps timeout and HTTP status', () => {
    expect(normalizeError({ code: 'AE_REQUEST_TIMEOUT' }).code).toBe('AE_REQUEST_TIMEOUT');
    expect(normalizeError({ response: { status: 403 } }).code).toBe('HTTP_403');
    expect(normalizeError({ response: { status: 500 } }).code).toBe('HTTP_500');
  });
});
