import AeAppShell from './views/AeAppShell';
import AeForbiddenPage from './views/AeForbiddenPage';
import AeLearnHomePage from './views/learn/AeLearnHomePage';
import AeLearnFormationsPage from './views/learn/AeLearnFormationsPage';
import AeLearnLibraryPage from './views/learn/AeLearnLibraryPage';
import AeLearnQuizzesPage from './views/learn/AeLearnQuizzesPage';
import AeLearnProgressPage from './views/learn/AeLearnProgressPage';
import AeLearnHelpPage from './views/learn/AeLearnHelpPage';
import AeCoachHomePage from './views/coach/AeCoachHomePage';
import AeCoachFormationsPage from './views/coach/AeCoachFormationsPage';
import AeCoachLearnersPage from './views/coach/AeCoachLearnersPage';
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
import { redirectRoot, requirePerm } from './routeGuards';

export default [
  {
    path: '/',
    beforeEnter: redirectRoot,
  },
  {
    path: '/ae',
    component: AeAppShell,
    children: [
      {
        path: '',
        beforeEnter: redirectRoot,
      },
      {
        name: 'AeLearnHome',
        path: 'learn',
        component: AeLearnHomePage,
        beforeEnter: requirePerm('canViewLearnerArea'),
      },
      {
        name: 'AeLearnFormations',
        path: 'learn/formations',
        component: AeLearnFormationsPage,
        beforeEnter: requirePerm('canViewLearnerArea'),
      },
      {
        name: 'AeLearnLibrary',
        path: 'learn/library',
        component: AeLearnLibraryPage,
        beforeEnter: requirePerm('canViewLearnerArea'),
      },
      {
        name: 'AeLearnQuizzes',
        path: 'learn/quizzes',
        component: AeLearnQuizzesPage,
        beforeEnter: requirePerm('canViewLearnerArea'),
      },
      {
        name: 'AeLearnProgress',
        path: 'learn/progress',
        component: AeLearnProgressPage,
        beforeEnter: requirePerm('canViewLearnerArea'),
      },
      {
        name: 'AeLearnHelp',
        path: 'learn/help',
        component: AeLearnHelpPage,
        beforeEnter: requirePerm('canViewLearnerArea'),
      },
      {
        name: 'AeCoachHome',
        path: 'coach',
        component: AeCoachHomePage,
        beforeEnter: requirePerm('canViewCoachArea'),
      },
      {
        name: 'AeCoachFormations',
        path: 'coach/formations',
        component: AeCoachFormationsPage,
        beforeEnter: requirePerm('canViewCoachArea'),
      },
      {
        name: 'AeCoachLearners',
        path: 'coach/learners',
        component: AeCoachLearnersPage,
        beforeEnter: requirePerm('canViewCoachArea'),
      },
      {
        name: 'AeCoachSessions',
        path: 'coach/sessions',
        component: AeCoachSessionsPage,
        beforeEnter: requirePerm('canManageSessions'),
      },
      {
        name: 'AeCoachSessionDetail',
        path: 'coach/sessions/:sessionId',
        component: AeCoachSessionDetailPage,
        beforeEnter: requirePerm('canManageSessions'),
      },
      {
        name: 'AeCoachResults',
        path: 'coach/results',
        component: AeCoachResultsPage,
        beforeEnter: requirePerm('canViewCoachArea'),
      },
      {
        name: 'AeCoachLibrary',
        path: 'coach/library',
        component: AeCoachLibraryPage,
        beforeEnter: requirePerm('canViewCoachArea'),
      },
      {
        name: 'AeAdminHome',
        path: 'admin',
        component: AeAdminHomePage,
        beforeEnter: requirePerm('canViewAdminDashboard'),
      },
      {
        name: 'AeAdminContent',
        path: 'admin/content',
        component: AeAdminContentPage,
        beforeEnter: requirePerm('canManageContent'),
      },
      {
        name: 'AeAdminUsers',
        path: 'admin/users',
        component: AeAdminUsersPage,
        beforeEnter: requirePerm('canManageUsers'),
      },
      {
        name: 'AeAdminClasses',
        path: 'admin/classes',
        component: AeAdminClassesPage,
        beforeEnter: requirePerm('canManageUsers'),
      },
      {
        name: 'AeAdminCoaches',
        path: 'admin/coaches',
        component: AeAdminCoachesPage,
        beforeEnter: requirePerm('canViewAdminDashboard'),
      },
      {
        name: 'AeAdminReports',
        path: 'admin/reports',
        component: AeAdminReportsPage,
        beforeEnter: requirePerm('canViewAdminDashboard'),
      },
      {
        name: 'AeAdminSync',
        path: 'admin/sync',
        component: AeAdminSyncPage,
        beforeEnter: requirePerm('canViewAdminDashboard'),
      },
      {
        name: 'AeAdminSettings',
        path: 'admin/settings',
        component: AeAdminSettingsPage,
        beforeEnter: requirePerm('canViewAdminDashboard'),
      },
      {
        name: 'AeForbidden',
        path: 'forbidden',
        component: AeForbiddenPage,
      },
    ],
  },
  { path: '/catalog', redirect: '/ae/learn/library' },
  { path: '/videos', redirect: '/ae/learn/library' },
  { path: '/quizzes', redirect: '/ae/learn/quizzes' },
  { path: '/progress', redirect: '/ae/learn/progress' },
  { path: '/help', redirect: '/ae/learn/help' },
  { path: '/trainer', redirect: '/ae/coach' },
  { path: '/trainer/sessions', redirect: '/ae/coach/sessions' },
  {
    path: '/trainer/sessions/:sessionId',
    redirect: to => `/ae/coach/sessions/${to.params.sessionId}`,
  },
  { path: '/admin', redirect: '/ae/admin' },
  { path: '/certificates', redirect: '/ae/admin/reports' },
  { path: '/reports', redirect: '/ae/admin/reports' },
];
