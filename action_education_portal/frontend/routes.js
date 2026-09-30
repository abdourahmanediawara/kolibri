import AeLearnerLayout from './views/layouts/AeLearnerLayout';
import AeCoachLayout from './views/layouts/AeCoachLayout';
import AeAdminLayout from './views/layouts/AeAdminLayout';
import AeSignInPage from './views/AeSignInPage';
import AeForbiddenPage from './views/AeForbiddenPage';
import AeLearnHomePage from './views/learn/AeLearnHomePage';
import AeLearnFormationsPage from './views/learn/AeLearnFormationsPage';
import AeLearnCourseDetailPage from './views/learn/AeLearnCourseDetailPage';
import AeLearnLibraryPage from './views/learn/AeLearnLibraryPage';
import AeLearnQuizzesPage from './views/learn/AeLearnQuizzesPage';
import AeLearnProgressPage from './views/learn/AeLearnProgressPage';
import AeLearnHelpPage from './views/learn/AeLearnHelpPage';
import AeLearnQuizPage from './views/learn/AeLearnQuizPage';
import AeLearnProfilePage from './views/learn/AeLearnProfilePage';
import AeCoachHomePage from './views/coach/AeCoachHomePage';
import AeCoachFormationsPage from './views/coach/AeCoachFormationsPage';
import AeCourseManagePage from './views/course/AeCourseManagePage';
import AeQuizEditorPage from './views/course/AeQuizEditorPage';
import AeCoachLearnersPage from './views/coach/AeCoachLearnersPage';
import AeCoachClassesPage from './views/coach/AeCoachClassesPage';
import AeCoachSessionsPage from './views/coach/AeCoachSessionsPage';
import AeCoachSessionDetailPage from './views/coach/AeCoachSessionDetailPage';
import AeCoachResultsPage from './views/coach/AeCoachResultsPage';
import AeCoachLibraryPage from './views/coach/AeCoachLibraryPage';
import AeAdminHomePage from './views/admin/AeAdminHomePage';
import AeAdminContentPage from './views/admin/AeAdminContentPage';
import AeAdminUsersPage from './views/admin/AeAdminUsersPage';
import AeAdminClassesPage from './views/admin/AeAdminClassesPage';
import AeAdminCoachesPage from './views/admin/AeAdminCoachesPage';
import AeAdminReportsPage from './views/admin/AeAdminReportsPage';
import AeAdminSyncPage from './views/admin/AeAdminSyncPage';
import AeAdminSettingsPage from './views/admin/AeAdminSettingsPage';
import AeAdminCoursesPage from './views/admin/AeAdminCoursesPage';
import { redirectRoot, requirePerm, requireAnonymousOrRedirect } from './routeGuards';

export default [
  {
    path: '/',
    beforeEnter: redirectRoot,
  },
  {
    path: '/connexion',
    name: 'AeSignIn',
    component: AeSignInPage,
    beforeEnter: requireAnonymousOrRedirect,
  },
  {
    path: '/apprenant',
    component: AeLearnerLayout,
    children: [
      {
        name: 'AeLearnHome',
        path: '',
        component: AeLearnHomePage,
        beforeEnter: requirePerm('canViewLearnerArea'),
      },
      {
        name: 'AeLearnFormations',
        path: 'cours',
        component: AeLearnFormationsPage,
        beforeEnter: requirePerm('canViewLearnerArea'),
      },
      {
        name: 'AeLearnCourseDetail',
        path: 'cours/:trainingId',
        component: AeLearnCourseDetailPage,
        beforeEnter: requirePerm('canViewLearnerArea'),
      },
      {
        name: 'AeLearnQuiz',
        path: 'cours/:trainingId/quiz/:quizId',
        component: AeLearnQuizPage,
        beforeEnter: requirePerm('canViewLearnerArea'),
      },
      {
        name: 'AeLearnLibrary',
        path: 'bibliotheque',
        component: AeLearnLibraryPage,
        beforeEnter: requirePerm('canViewLearnerArea'),
      },
      {
        name: 'AeLearnQuizzes',
        path: 'quiz',
        component: AeLearnQuizzesPage,
        beforeEnter: requirePerm('canViewLearnerArea'),
      },
      {
        name: 'AeLearnProgress',
        path: 'progression',
        component: AeLearnProgressPage,
        beforeEnter: requirePerm('canViewLearnerArea'),
      },
      {
        name: 'AeLearnProfile',
        path: 'profil',
        component: AeLearnProfilePage,
        beforeEnter: requirePerm('canViewLearnerArea'),
      },
      {
        name: 'AeLearnHelp',
        path: 'aide',
        component: AeLearnHelpPage,
        beforeEnter: requirePerm('canViewLearnerArea'),
      },
    ],
  },
  {
    path: '/formateur',
    component: AeCoachLayout,
    children: [
      {
        name: 'AeCoachHome',
        path: '',
        component: AeCoachHomePage,
        beforeEnter: requirePerm('canViewCoachArea'),
      },
      {
        name: 'AeCoachClasses',
        path: 'classes',
        component: AeCoachClassesPage,
        beforeEnter: requirePerm('canViewCoachArea'),
      },
      {
        name: 'AeCoachLearners',
        path: 'eleves',
        component: AeCoachLearnersPage,
        beforeEnter: requirePerm('canViewCoachArea'),
      },
      {
        name: 'AeCoachFormations',
        path: 'cours',
        component: AeCoachFormationsPage,
        beforeEnter: requirePerm('canViewCoachArea'),
      },
      {
        name: 'AeCoachCourseDetail',
        path: 'cours/:trainingId',
        component: AeCourseManagePage,
        beforeEnter: requirePerm('canViewCoachArea'),
      },
      {
        name: 'AeCoachQuizEditor',
        path: 'cours/:trainingId/quiz/:quizId',
        component: AeQuizEditorPage,
        beforeEnter: requirePerm('canViewCoachArea'),
      },
      {
        name: 'AeCoachSessions',
        path: 'sessions',
        component: AeCoachSessionsPage,
        beforeEnter: requirePerm('canManageSessions'),
      },
      {
        name: 'AeCoachSessionDetail',
        path: 'sessions/:sessionId',
        component: AeCoachSessionDetailPage,
        beforeEnter: requirePerm('canManageSessions'),
      },
      {
        name: 'AeCoachResults',
        path: 'resultats',
        component: AeCoachResultsPage,
        beforeEnter: requirePerm('canViewCoachArea'),
      },
      {
        name: 'AeCoachLibrary',
        path: 'bibliotheque',
        component: AeCoachLibraryPage,
        beforeEnter: requirePerm('canViewCoachArea'),
      },
    ],
  },
  {
    path: '/administrateur',
    component: AeAdminLayout,
    children: [
      {
        name: 'AeAdminHome',
        path: '',
        component: AeAdminHomePage,
        beforeEnter: requirePerm('canViewAdminDashboard'),
      },
      {
        name: 'AeAdminUsers',
        path: 'utilisateurs',
        component: AeAdminUsersPage,
        beforeEnter: requirePerm('canManageUsers'),
      },
      {
        name: 'AeAdminClasses',
        path: 'classes',
        component: AeAdminClassesPage,
        beforeEnter: requirePerm('canManageUsers'),
      },
      {
        name: 'AeAdminCoaches',
        path: 'formateurs',
        component: AeAdminCoachesPage,
        beforeEnter: requirePerm('canViewAdminDashboard'),
      },
      {
        name: 'AeAdminCourses',
        path: 'cours',
        component: AeAdminCoursesPage,
        beforeEnter: requirePerm('canViewAdminDashboard'),
      },
      {
        name: 'AeAdminCourseDetail',
        path: 'cours/:trainingId',
        component: AeCourseManagePage,
        beforeEnter: requirePerm('canViewAdminDashboard'),
      },
      {
        name: 'AeAdminQuizEditor',
        path: 'cours/:trainingId/quiz/:quizId',
        component: AeQuizEditorPage,
        beforeEnter: requirePerm('canViewAdminDashboard'),
      },
      {
        name: 'AeAdminContent',
        path: 'contenus',
        component: AeAdminContentPage,
        beforeEnter: requirePerm('canManageContent'),
      },
      {
        name: 'AeAdminReports',
        path: 'suivi',
        component: AeAdminReportsPage,
        beforeEnter: requirePerm('canViewAdminDashboard'),
      },
      {
        name: 'AeAdminSettings',
        path: 'parametres',
        component: AeAdminSettingsPage,
        beforeEnter: requirePerm('canViewAdminDashboard'),
      },
      {
        name: 'AeAdminSync',
        path: 'synchronisation',
        component: AeAdminSyncPage,
        beforeEnter: requirePerm('canSyncFacility'),
      },
    ],
  },
  {
    name: 'AeForbidden',
    path: '/interdit',
    component: AeForbiddenPage,
  },
  // Legacy /ae/* paths → French space URLs
  { path: '/ae', redirect: '/' },
  { path: '/ae/learn', redirect: '/apprenant' },
  { path: '/ae/learn/formations', redirect: '/apprenant/cours' },
  { path: '/ae/learn/library', redirect: '/apprenant/bibliotheque' },
  { path: '/ae/learn/quizzes', redirect: '/apprenant/quiz' },
  { path: '/ae/learn/progress', redirect: '/apprenant/progression' },
  { path: '/ae/learn/help', redirect: '/apprenant/aide' },
  { path: '/ae/coach', redirect: '/formateur' },
  { path: '/ae/coach/formations', redirect: '/formateur/cours' },
  { path: '/ae/coach/learners', redirect: '/formateur/eleves' },
  { path: '/ae/coach/sessions', redirect: '/formateur/sessions' },
  {
    path: '/ae/coach/sessions/:sessionId',
    redirect: to => `/formateur/sessions/${to.params.sessionId}`,
  },
  { path: '/ae/coach/results', redirect: '/formateur/resultats' },
  { path: '/ae/coach/library', redirect: '/formateur/bibliotheque' },
  { path: '/ae/admin', redirect: '/administrateur' },
  { path: '/ae/admin/content', redirect: '/administrateur/contenus' },
  { path: '/ae/admin/users', redirect: '/administrateur/utilisateurs' },
  { path: '/ae/admin/classes', redirect: '/administrateur/classes' },
  { path: '/ae/admin/coaches', redirect: '/administrateur/formateurs' },
  { path: '/ae/admin/reports', redirect: '/administrateur/suivi' },
  { path: '/ae/admin/sync', redirect: '/administrateur/synchronisation' },
  { path: '/ae/admin/settings', redirect: '/administrateur/parametres' },
  { path: '/ae/forbidden', redirect: '/interdit' },
  { path: '/catalog', redirect: '/apprenant/bibliotheque' },
  { path: '/videos', redirect: '/apprenant/bibliotheque' },
  { path: '/quizzes', redirect: '/apprenant/quiz' },
  { path: '/progress', redirect: '/apprenant/progression' },
  { path: '/help', redirect: '/apprenant/aide' },
  { path: '/trainer', redirect: '/formateur' },
  { path: '/trainer/sessions', redirect: '/formateur/sessions' },
  {
    path: '/trainer/sessions/:sessionId',
    redirect: to => `/formateur/sessions/${to.params.sessionId}`,
  },
  { path: '/admin', redirect: '/administrateur' },
  { path: '/certificates', redirect: '/administrateur/suivi' },
  { path: '/reports', redirect: '/administrateur/suivi' },
];
