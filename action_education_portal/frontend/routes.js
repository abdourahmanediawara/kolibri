import HomePage from './views/HomePage';
import HelpPage from './views/HelpPage';
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
    name: 'PortalHelp',
    path: '/help',
    component: HelpPage,
  },
];
