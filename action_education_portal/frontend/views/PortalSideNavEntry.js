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
    ];
  },
});
