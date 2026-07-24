import { watch } from 'vue';
import { registerNavItem, navItems } from 'kolibri/composables/useNav';
import urls from 'kolibri/urls';
import { UserKinds } from 'kolibri/constants';
import useUser from 'kolibri/composables/useUser';
import { portalStrings } from '../strings';

const portalUrl = urls['kolibri:action_education_portal:portal']();

const nativePluginUrls = [
  urls['kolibri:kolibri.plugins.learn:learn'](),
  urls['kolibri:kolibri.plugins.coach:coach'](),
  urls['kolibri:kolibri.plugins.facility:facility_management'](),
  urls['kolibri:kolibri.plugins.device:device_management'](),
];

function isNativePluginUrl(url) {
  return nativePluginUrls.some(base => url === base || (url && url.startsWith(base)));
}

const { isSuperuser, canManageContent, isCoach, isAdmin } = useUser();

function portalSubRoutes() {
  const routes = [
    {
      label: portalStrings.$tr('homeNavLabel'),
      icon: 'dashboard',
      route: '/ae/learn',
      name: 'AeLearnHome',
    },
  ];
  if (isCoach.value || isAdmin.value || isSuperuser.value) {
    routes.push({
      label: portalStrings.$tr('spaceCoach'),
      icon: 'coach',
      route: '/ae/coach',
      name: 'AeCoachHome',
    });
  }
  if (isAdmin.value || isSuperuser.value) {
    routes.push({
      label: portalStrings.$tr('spaceAdmin'),
      icon: 'people',
      route: '/ae/admin',
      name: 'AeAdminHome',
    });
  }
  return routes;
}

registerNavItem({
  get url() {
    return portalUrl;
  },
  get label() {
    return portalStrings.$tr('platformTitle');
  },
  icon: 'dashboard',
  bottomBar: true,
  role: UserKinds.LEARNER,
  get routes() {
    return portalSubRoutes();
  },
});

function applyNavFilter() {
  if (isSuperuser.value || canManageContent.value) {
    return;
  }
  const filtered = navItems.value.filter(item => {
    if (item.url === portalUrl) {
      return true;
    }
    return !isNativePluginUrl(item.url);
  });
  if (filtered.length !== navItems.value.length) {
    navItems.value = filtered;
  }
}

watch(navItems, applyNavFilter, { deep: true });
watch([isSuperuser, canManageContent, isCoach, isAdmin], applyNavFilter);
applyNavFilter();
