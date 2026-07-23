import HomePage from './views/HomePage';
import HelpPage from './views/HelpPage';
import CatalogPage from './views/CatalogPage';
import VideosPage from './views/VideosPage';
import QuizzesPage from './views/QuizzesPage';
import ProgressPage from './views/ProgressPage';
import TrainerSessionsPage from './views/TrainerSessionsPage';
import SessionAttendancePage from './views/SessionAttendancePage';
import { portalStrings } from './strings';

export default [
  {
    name: 'PortalHome',
    path: '/',
    component: HomePage,
    meta: {
      title: portalStrings.$tr('pageTitle'),
    },
  },
  {
    name: 'PortalCatalog',
    path: '/catalog',
    component: CatalogPage,
  },
  {
    name: 'PortalVideos',
    path: '/videos',
    component: VideosPage,
  },
  {
    name: 'PortalQuizzes',
    path: '/quizzes',
    component: QuizzesPage,
  },
  {
    name: 'PortalProgress',
    path: '/progress',
    component: ProgressPage,
  },
  {
    name: 'PortalTrainerSessions',
    path: '/trainer/sessions',
    component: TrainerSessionsPage,
  },
  {
    name: 'PortalSessionAttendance',
    path: '/trainer/sessions/:sessionId',
    component: SessionAttendancePage,
  },
  {
    name: 'PortalHelp',
    path: '/help',
    component: HelpPage,
  },
];
