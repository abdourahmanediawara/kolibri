import { registerNavItem } from 'kolibri/composables/useNav';
import urls from 'kolibri/urls';
import { portalStrings } from '../strings';

registerNavItem({
  get url() {
    return urls['kolibri:action_education_portal:portal']();
  },
  get label() {
    return portalStrings.$tr('homeNavLabel');
  },
  icon: 'dashboard',
  bottomBar: true,
  get routes() {
    return [
      {
        label: portalStrings.$tr('homeNavLabel'),
        icon: 'dashboard',
        route: '/',
        name: 'PortalHome',
      },
      {
        label: portalStrings.$tr('catalogTitle'),
        icon: 'library',
        route: '/catalog',
        name: 'PortalCatalog',
      },
      {
        label: portalStrings.$tr('videosTitle'),
        icon: 'video',
        route: '/videos',
        name: 'PortalVideos',
      },
      {
        label: portalStrings.$tr('quizzesTitle'),
        icon: 'quiz',
        route: '/quizzes',
        name: 'PortalQuizzes',
      },
      {
        label: portalStrings.$tr('progressTitle'),
        icon: 'inProgress',
        route: '/progress',
        name: 'PortalProgress',
      },
      {
        label: portalStrings.$tr('helpPageTitle'),
        icon: 'help',
        route: '/help',
        name: 'PortalHelp',
      },
    ];
  },
});
