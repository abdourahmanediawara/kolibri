import { createTranslator } from 'kolibri/utils/i18n';

export const portalStrings = createTranslator('ActionEducationPortalStrings', {
  homeNavLabel: {
    message: 'Home',
    context: 'Side navigation label for the AE Apprendre learner home.',
  },
  pageTitle: {
    message: 'Home',
    context: 'Browser tab / app bar title for the learner portal home.',
  },
  greetingNamed: {
    message: 'Hello, {name}',
    context: 'Welcome heading when the learner first name is known.',
  },
  greetingGeneric: {
    message: 'Hello',
    context: 'Welcome heading when the learner name is unavailable.',
  },
  tagline: {
    message: 'What would you like to learn today?',
    context: 'Short supporting sentence under the greeting.',
  },
  continueTitle: {
    message: 'Continue my training',
    context: 'Primary card heading for resuming learning.',
  },
  continueEmpty: {
    message: 'Start your first training',
    context: 'Empty state when the learner has no resumable content.',
  },
  exploreTrainings: {
    message: 'Explore trainings',
    context: 'Button linking to the Learn library.',
  },
  continueAction: {
    message: 'Continue',
    context: 'Button to resume the last training.',
  },
  shortcutTrainings: {
    message: 'My trainings',
    context: 'Shortcut card title.',
  },
  shortcutTrainingsDesc: {
    message: 'Classes and assigned content',
    context: 'Shortcut card description.',
  },
  shortcutExplore: {
    message: 'Explore',
    context: 'Shortcut card title.',
  },
  shortcutExploreDesc: {
    message: 'Browse the library',
    context: 'Shortcut card description.',
  },
  shortcutVideos: {
    message: 'Videos',
    context: 'Shortcut card title.',
  },
  shortcutVideosDesc: {
    message: 'Watch local videos',
    context: 'Shortcut card description.',
  },
  shortcutQuizzes: {
    message: 'Quizzes',
    context: 'Shortcut card title.',
  },
  shortcutQuizzesDesc: {
    message: 'Practice and check your knowledge',
    context: 'Shortcut card description.',
  },
  shortcutProgress: {
    message: 'My progress',
    context: 'Shortcut card title.',
  },
  shortcutProgressDesc: {
    message: 'See what you have completed',
    context: 'Shortcut card description.',
  },
  shortcutHelp: {
    message: 'Help',
    context: 'Shortcut card title.',
  },
  shortcutHelpDesc: {
    message: 'Simple guides to get started',
    context: 'Shortcut card description.',
  },
  loadingLabel: {
    message: 'Loading…',
    context: 'Accessible loading status.',
  },
  offlineHint: {
    message: 'Works without internet on this local network.',
    context: 'Reassurance that the portal is offline-capable.',
  },
  shortcutsLabel: {
    message: 'Main shortcuts',
    context: 'Accessible label for the six primary portal shortcut cards.',
  },
  helpPageTitle: {
    message: 'Help',
    context: 'App bar title for the help page.',
  },
  helpIntro: {
    message: 'Follow these short steps. Ask your trainer if you need more help.',
    context: 'Intro text on the learner help page.',
  },
  helpStepLoginTitle: {
    message: '1. Sign in',
    context: 'Help step heading.',
  },
  helpStepLoginBody: {
    message: 'Enter your username and password, or choose Browse without an account if allowed.',
    context: 'Help step body.',
  },
  helpStepOpenTitle: {
    message: '2. Open a training',
    context: 'Help step heading.',
  },
  helpStepOpenBody: {
    message: 'From Home, tap Explore or My trainings, then choose a training card.',
    context: 'Help step body.',
  },
  helpStepVideoTitle: {
    message: '3. Watch a video',
    context: 'Help step heading.',
  },
  helpStepVideoBody: {
    message: 'Open a video from the library. It plays on this device — no internet needed.',
    context: 'Help step body.',
  },
  helpStepQuizTitle: {
    message: '4. Take a quiz',
    context: 'Help step heading.',
  },
  helpStepQuizBody: {
    message: 'Open a quiz from your class or the library, answer the questions, then submit.',
    context: 'Help step body.',
  },
  helpStepProgressTitle: {
    message: '5. See your progress',
    context: 'Help step heading.',
  },
  helpStepProgressBody: {
    message: 'Your progress is saved automatically, even without internet.',
    context: 'Help step body.',
  },
  helpStepOfflineTitle: {
    message: '6. What does offline mean?',
    context: 'Help step heading.',
  },
  helpStepOfflineBody: {
    message: 'You use AE Apprendre on the local Wi-Fi. Contents and results stay on this network.',
    context: 'Help step body.',
  },
  helpStepTrainerTitle: {
    message: '7. Ask your trainer',
    context: 'Help step heading.',
  },
  helpStepTrainerBody: {
    message: 'If something does not work, tell your trainer. They can help you on site.',
    context: 'Help step body.',
  },
  backHome: {
    message: 'Back to home',
    context: 'Link from secondary portal pages to the home page.',
  },
  catalogTitle: {
    message: 'Trainings',
    context: 'Catalog page title listing available channels.',
  },
  catalogIntro: {
    message: 'Browse trainings available on this device.',
    context: 'Catalog page intro.',
  },
  catalogEmpty: {
    message: 'No trainings are available yet. Ask your trainer to import content.',
    context: 'Catalog empty state.',
  },
  channelMeta: {
    message: '{count} resources',
    context: 'Secondary line under a channel card.',
  },
  searchLabel: {
    message: 'Search',
    context: 'Search field label on portal list pages.',
  },
  searchAction: {
    message: 'Search',
    context: 'Search button label.',
  },
  videosTitle: {
    message: 'Videos',
    context: 'Videos page title.',
  },
  videosIntro: {
    message: 'Local videos you can watch without internet.',
    context: 'Videos page intro.',
  },
  videosEmpty: {
    message: 'No videos are available on this device yet.',
    context: 'Videos empty state.',
  },
  quizzesTitle: {
    message: 'Quizzes',
    context: 'Quizzes page title.',
  },
  quizzesIntro: {
    message: 'Practice quizzes available in the local library.',
    context: 'Quizzes page intro.',
  },
  quizzesEmpty: {
    message: 'No quizzes are available on this device yet.',
    context: 'Quizzes empty state.',
  },
  progressTitle: {
    message: 'My progress',
    context: 'Progress page title.',
  },
  progressIntro: {
    message: 'Trainings you have started. Open one to continue.',
    context: 'Progress page intro.',
  },
  progressEmpty: {
    message: 'You have not started a training yet. Explore the catalog to begin.',
    context: 'Progress empty state.',
  },
  progressPercent: {
    message: '{percent}% complete',
    context: 'Progress percentage label on a content card.',
  },
  notStarted: {
    message: 'Not started',
    context: 'Progress label when the learner has not begun an item.',
  },
  myTrainingsTitle: {
    message: 'My trainings',
    context: 'Page title for assigned / class content shortcut target.',
  },
  trainerSessionsTitle: {
    message: 'Sessions',
    context: 'Trainer sessions page title.',
  },
  trainerSessionsIntro: {
    message: 'Create a training session and take attendance offline.',
    context: 'Trainer sessions page intro.',
  },
  trainerStaffOnly: {
    message: 'Only trainers and administrators can manage sessions.',
    context: 'Shown when a learner opens trainer pages.',
  },
  createSessionTitle: {
    message: 'New session',
    context: 'Heading for the create-session form.',
  },
  trainingTitleLabel: {
    message: 'Training title',
    context: 'Label for training title field.',
  },
  locationLabel: {
    message: 'Location',
    context: 'Label for session location field.',
  },
  startLabel: {
    message: 'Start date and time',
    context: 'Label for session start datetime field.',
  },
  startHint: {
    message: 'Use format YYYY-MM-DDTHH:MM (example: 2026-07-23T14:00).',
    context: 'Help text for the start datetime field.',
  },
  createSessionAction: {
    message: 'Create session',
    context: 'Button to create a training session.',
  },
  sessionsEmpty: {
    message: 'No sessions yet. Create the first one above.',
    context: 'Empty state for trainer sessions list.',
  },
  takeAttendanceAction: {
    message: 'Attendance',
    context: 'Button opening attendance for a session.',
  },
  saveSuccess: {
    message: 'Saved.',
    context: 'Generic success status after saving.',
  },
  saveError: {
    message: 'Could not save. Check the fields and try again.',
    context: 'Generic error status after a failed save.',
  },
  attendancePageTitle: {
    message: 'Attendance',
    context: 'Attendance page title.',
  },
  enrollTitle: {
    message: 'Add a learner',
    context: 'Enrollment form heading on attendance page.',
  },
  learnerUsernameLabel: {
    message: 'Learner username',
    context: 'Username field for enrolling a learner.',
  },
  enrollAction: {
    message: 'Enroll',
    context: 'Button to enroll a learner in the session.',
  },
  attendanceEmpty: {
    message: 'No learners enrolled yet. Add a username above.',
    context: 'Empty state when a session has no enrollments.',
  },
  backToSessions: {
    message: 'Back to sessions',
    context: 'Link from attendance page to sessions list.',
  },
  statusPresent: {
    message: 'Present',
    context: 'Attendance status button.',
  },
  statusAbsent: {
    message: 'Absent',
    context: 'Attendance status button.',
  },
  statusLate: {
    message: 'Late',
    context: 'Attendance status button.',
  },
  statusExcused: {
    message: 'Excused',
    context: 'Attendance status button.',
  },
  statusNone: {
    message: 'Not recorded',
    context: 'Attendance status when none is set.',
  },
  enrollSuccess: {
    message: 'Learner enrolled.',
    context: 'Success message after enrollment.',
  },
  enrollError: {
    message: 'Could not enroll this learner. Check the username.',
    context: 'Error message after failed enrollment.',
  },
  shortcutTrainer: {
    message: 'Trainer',
    context: 'Home shortcut for trainers.',
  },
  shortcutTrainerDesc: {
    message: 'Dashboard, sessions and attendance',
    context: 'Home shortcut description for trainers.',
  },
  trainerDashTitle: {
    message: 'Trainer dashboard',
    context: 'Trainer dashboard page title.',
  },
  trainerDashIntro: {
    message: 'Overview of AE trainings, sessions, and attendance on this device.',
    context: 'Trainer dashboard intro.',
  },
  openSessionsAction: {
    message: 'Manage sessions',
    context: 'Button to open sessions list from dashboard.',
  },
  openCoachAction: {
    message: 'Open Coach (Kolibri)',
    context: 'Button linking to advanced Kolibri Coach plugin.',
  },
  todaySessionsTitle: {
    message: 'Sessions today',
    context: 'Heading for today session list on trainer dashboard.',
  },
  todaySessionsEmpty: {
    message: 'No sessions scheduled for today.',
    context: 'Empty state for today sessions on trainer dashboard.',
  },
  dashTrainingsLabel: {
    message: 'Trainings',
    context: 'Dashboard summary card label.',
  },
  dashSessionsLabel: {
    message: 'Sessions',
    context: 'Dashboard summary card label.',
  },
  dashEnrollmentsLabel: {
    message: 'Enrollments',
    context: 'Dashboard summary card label.',
  },
  dashAttendanceLabel: {
    message: 'Attendance records',
    context: 'Dashboard summary card label.',
  },
  adminDashTitle: {
    message: 'Admin dashboard',
    context: 'Administrator dashboard page title.',
  },
  adminDashIntro: {
    message: 'Simple overview for Action Éducation administrators on this local server.',
    context: 'Admin dashboard intro.',
  },
  adminStaffOnly: {
    message: 'Only administrators can open this page.',
    context: 'Shown when a non-admin opens the admin dashboard.',
  },
  adminQuickLinksTitle: {
    message: 'Quick links',
    context: 'Heading for admin quick links section.',
  },
  adminAdvancedTitle: {
    message: 'Advanced administration',
    context: 'Heading for links to full Kolibri Facility/Device tools.',
  },
  adminAdvancedBody: {
    message: 'Use Kolibri Facility and Device for full user, class, content, and backup tools.',
    context: 'Explains advanced admin section.',
  },
  openFacilityAction: {
    message: 'Open Facility',
    context: 'Button to Kolibri Facility plugin.',
  },
  openDeviceAction: {
    message: 'Open Device',
    context: 'Button to Kolibri Device plugin.',
  },
  dashUsersLabel: {
    message: 'Users',
    context: 'Admin dashboard summary card label.',
  },
  dashChannelsLabel: {
    message: 'Channels',
    context: 'Admin dashboard summary card label.',
  },
  adminLinkUsersTitle: {
    message: 'Users',
    context: 'Admin quick link title.',
  },
  adminLinkUsersDesc: {
    message: 'Manage accounts and classes',
    context: 'Admin quick link description.',
  },
  adminLinkContentsTitle: {
    message: 'Contents',
    context: 'Admin quick link title.',
  },
  adminLinkContentsDesc: {
    message: 'Browse local library',
    context: 'Admin quick link description.',
  },
  adminLinkTrainerTitle: {
    message: 'Trainer tools',
    context: 'Admin quick link title.',
  },
  adminLinkTrainerDesc: {
    message: 'Sessions and attendance',
    context: 'Admin quick link description.',
  },
  adminLinkDeviceTitle: {
    message: 'Device',
    context: 'Admin quick link title.',
  },
  adminLinkDeviceDesc: {
    message: 'Channels, updates, and settings',
    context: 'Admin quick link description.',
  },
  shortcutAdmin: {
    message: 'Admin',
    context: 'Home shortcut for administrators.',
  },
  shortcutAdminDesc: {
    message: 'Overview and advanced tools',
    context: 'Home shortcut description for administrators.',
  },
});
