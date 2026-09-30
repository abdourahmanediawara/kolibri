/**
 * @jest-environment jsdom
 */

import { nextTick } from 'vue';
import { render, screen, fireEvent, waitFor } from '@testing-library/vue';
import { portalStrings } from '../strings';
import AeCourseCreateWizard from '../views/admin/AeCourseCreateWizard.vue';

jest.mock('kolibri/urls');
jest.mock('kolibri/composables/useUser', () => {
  const { computed } = require('vue');
  return {
    __esModule: true,
    default: () => ({
      isUserLoggedIn: computed(() => true),
      isLearner: computed(() => false),
      isCoach: computed(() => false),
      isAdmin: computed(() => true),
      isSuperuser: computed(() => false),
      isFacilityAdmin: computed(() => true),
      canManageContent: computed(() => true),
      userKind: computed(() => 'admin'),
      currentUserId: computed(() => 'admin-1'),
      userFacilityId: computed(() => 'facility-1'),
    }),
  };
});

// The people of the facility: one trainer, one learner.
const mockFacilityUsers = [
  { id: 'coach-1', full_name: 'Awa Camara', username: 'awa', roles: [{ kind: 'coach' }] },
  { id: 'learner-1', full_name: 'Binta Diallo', username: 'binta', roles: [] },
];
jest.mock('kolibri-common/apiResources/FacilityUserResource', () => ({
  __esModule: true,
  default: { fetchCollection: () => Promise.resolve(mockFacilityUsers) },
}));

const mockCreateTraining = jest.fn();
const mockUploadResource = jest.fn();
jest.mock('../composables/useTrainingApi', () => {
  const actual = jest.requireActual('../composables/useTrainingApi');
  return {
    ...actual,
    useTrainingApi: () => ({
      createTraining: (...args) => mockCreateTraining(...args),
      uploadResource: (...args) => mockUploadResource(...args),
    }),
  };
});

const mockCreateSnackbar = jest.fn();
jest.mock('kolibri/composables/useSnackbar', () => ({
  __esModule: true,
  default: () => ({ createSnackbar: (...args) => mockCreateSnackbar(...args) }),
}));

const {
  continueAction$,
  courseTitleLabel$,
  courseDescriptionLabel$,
  courseTitleRequired$,
  presentCourseTitle$,
  browseFilesAction$,
  fileTypeRejected$,
  fileReady$,
  continueWithoutSupports$,
  noSupportsAdded$,
  createCourseAction$,
  courseCreated$,
  courseFilesFailed$,
  courseTrainerLabel$,
  trainerRequired$,
} = portalStrings;

const [TRAINER, LEARNER] = mockFacilityUsers;

const COURSE = {
  title: 'Comprendre le rôle de la commune',
  description: 'Les missions de la commune.',
};
const TRAINING = { id: 'tr-9', title: COURSE.title };
const GUIDE = new File(['%PDF'], 'Guide de la commune.pdf', { type: 'application/pdf' });
const PROGRAM = new File(['MZ'], 'programme.exe');

async function renderOpenWizard() {
  const result = render(AeCourseCreateWizard, { props: { open: false } });
  await result.updateProps({ open: true });
  return result;
}

async function fillInformations({ trainer = TRAINER } = {}) {
  await fireEvent.update(screen.getByRole('textbox', { name: courseTitleLabel$() }), COURSE.title);
  await fireEvent.update(screen.getByLabelText(courseDescriptionLabel$()), COURSE.description);
  if (trainer) {
    await screen.findByRole('option', { name: trainer.full_name });
    await fireEvent.update(
      screen.getByRole('combobox', { name: courseTrainerLabel$() }),
      trainer.id,
    );
  }
  await fireEvent.click(screen.getByRole('button', { name: continueAction$() }));
}

// What the browser does when files are picked.
async function chooseFiles(files) {
  const input = screen.getByLabelText(browseFilesAction$());
  Object.defineProperty(input, 'files', { value: files, configurable: true });
  input.dispatchEvent(new Event('change'));
  await nextTick();
}

describe('AeCourseCreateWizard', () => {
  beforeEach(() => {
    mockCreateTraining.mockReset();
    mockUploadResource.mockReset();
    mockCreateSnackbar.mockReset();
    mockCreateTraining.mockResolvedValue(TRAINING);
    mockUploadResource.mockResolvedValue({ id: 'res-1' });
  });

  it('asks for a title before going to the next step', async () => {
    await renderOpenWizard();
    await fireEvent.click(screen.getByRole('button', { name: continueAction$() }));

    expect(screen.getByText(courseTitleRequired$())).toBeInTheDocument();
    expect(screen.getByText(presentCourseTitle$())).toBeInTheDocument();
  });

  it('only offers the trainers of the facility', async () => {
    await renderOpenWizard();

    expect(await screen.findByRole('option', { name: TRAINER.full_name })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: LEARNER.full_name })).not.toBeInTheDocument();
  });

  it('asks for the trainer of the course', async () => {
    await renderOpenWizard();
    await fillInformations({ trainer: null });

    expect(screen.getByText(trainerRequired$())).toBeInTheDocument();
    expect(mockCreateTraining).not.toHaveBeenCalled();
  });

  it('creates the course, then uploads its files', async () => {
    const { emitted } = await renderOpenWizard();
    await fillInformations();
    await chooseFiles([GUIDE]);
    expect(screen.getByText(fileReady$())).toBeInTheDocument();
    await fireEvent.click(screen.getByRole('button', { name: continueAction$() }));
    await fireEvent.click(screen.getByRole('button', { name: createCourseAction$() }));

    await waitFor(() => expect(emitted().created).toBeTruthy());
    expect(mockCreateTraining).toHaveBeenCalledWith(
      expect.objectContaining({ ...COURSE, responsible: TRAINER.id, status: 'published' }),
    );
    expect(mockUploadResource).toHaveBeenCalledWith({
      trainingId: TRAINING.id,
      title: '',
      file: GUIDE,
    });
    expect(emitted().created[0]).toEqual([TRAINING]);
    expect(mockCreateSnackbar).toHaveBeenCalledWith(courseCreated$({ name: TRAINING.title }));
  });

  it('refuses files that courses cannot hold', async () => {
    await renderOpenWizard();
    await fillInformations();
    await chooseFiles([PROGRAM]);

    expect(screen.getByText(fileTypeRejected$({ name: PROGRAM.name }))).toBeInTheDocument();
    expect(screen.queryByText(fileReady$())).not.toBeInTheDocument();
  });

  it('creates a course without files', async () => {
    await renderOpenWizard();
    await fillInformations();
    await fireEvent.click(screen.getByRole('button', { name: continueWithoutSupports$() }));

    expect(screen.getByText(noSupportsAdded$())).toBeInTheDocument();
    await fireEvent.click(screen.getByRole('button', { name: createCourseAction$() }));
    await waitFor(() => expect(mockCreateTraining).toHaveBeenCalled());
    expect(mockUploadResource).not.toHaveBeenCalled();
  });

  it('says which files could not be uploaded', async () => {
    mockUploadResource.mockRejectedValue({ response: { status: 400 } });
    const { emitted } = await renderOpenWizard();
    await fillInformations();
    await chooseFiles([GUIDE]);
    await fireEvent.click(screen.getByRole('button', { name: continueAction$() }));
    await fireEvent.click(screen.getByRole('button', { name: createCourseAction$() }));

    await waitFor(() => expect(emitted().created).toBeTruthy());
    expect(mockCreateSnackbar).toHaveBeenCalledWith(courseFilesFailed$({ count: 1 }));
  });
});
