import { computed } from 'vue';
import { useRoute } from 'vue-router/composables';
import { portalStrings } from '../strings';
import { useAePermissions } from './useAePermissions';

/**
 * Role-filtered AE navigation items (single active item by route name / path prefix).
 */
export function useAeNav() {
  const route = useRoute();
  const perms = useAePermissions();

  const learnerItems = computed(() => [
    {
      id: 'learn-home',
      label: portalStrings.$tr('homeNavLabel'),
      icon: 'dashboard',
      to: '/ae/learn',
      name: 'AeLearnHome',
    },
    {
      id: 'learn-formations',
      label: portalStrings.$tr('myTrainingsTitle'),
      icon: 'lesson',
      to: '/ae/learn/formations',
      name: 'AeLearnFormations',
    },
    {
      id: 'learn-library',
      label: portalStrings.$tr('libraryTitle'),
      icon: 'library',
      to: '/ae/learn/library',
      name: 'AeLearnLibrary',
    },
    {
      id: 'learn-quizzes',
      label: portalStrings.$tr('quizzesTitle'),
      icon: 'quiz',
      to: '/ae/learn/quizzes',
      name: 'AeLearnQuizzes',
    },
    {
      id: 'learn-progress',
      label: portalStrings.$tr('progressTitle'),
      icon: 'inProgress',
      to: '/ae/learn/progress',
      name: 'AeLearnProgress',
    },
    {
      id: 'learn-help',
      label: portalStrings.$tr('helpPageTitle'),
      icon: 'help',
      to: '/ae/learn/help',
      name: 'AeLearnHelp',
    },
  ]);

  const coachItems = computed(() => [
    {
      id: 'coach-home',
      label: portalStrings.$tr('coachDashTitle'),
      icon: 'dashboard',
      to: '/ae/coach',
      name: 'AeCoachHome',
    },
    {
      id: 'coach-formations',
      label: portalStrings.$tr('dashTrainingsLabel'),
      icon: 'lesson',
      to: '/ae/coach/formations',
      name: 'AeCoachFormations',
    },
    {
      id: 'coach-learners',
      label: portalStrings.$tr('learnersTitle'),
      icon: 'people',
      to: '/ae/coach/learners',
      name: 'AeCoachLearners',
    },
    {
      id: 'coach-sessions',
      label: portalStrings.$tr('trainerSessionsTitle'),
      icon: 'classes',
      to: '/ae/coach/sessions',
      name: 'AeCoachSessions',
    },
    {
      id: 'coach-results',
      label: portalStrings.$tr('resultsTitle'),
      icon: 'reports',
      to: '/ae/coach/results',
      name: 'AeCoachResults',
    },
    {
      id: 'coach-library',
      label: portalStrings.$tr('libraryTitle'),
      icon: 'library',
      to: '/ae/coach/library',
      name: 'AeCoachLibrary',
    },
  ]);

  const adminItems = computed(() => [
    {
      id: 'admin-home',
      label: portalStrings.$tr('adminDashTitle'),
      icon: 'dashboard',
      to: '/ae/admin',
      name: 'AeAdminHome',
    },
    {
      id: 'admin-content',
      label: portalStrings.$tr('contentManageTitle'),
      icon: 'channel',
      to: '/ae/admin/content',
      name: 'AeAdminContent',
    },
    {
      id: 'admin-users',
      label: portalStrings.$tr('dashUsersLabel'),
      icon: 'people',
      to: '/ae/admin/users',
      name: 'AeAdminUsers',
    },
    {
      id: 'admin-classes',
      label: portalStrings.$tr('classesTitle'),
      icon: 'classes',
      to: '/ae/admin/classes',
      name: 'AeAdminClasses',
    },
    {
      id: 'admin-coaches',
      label: portalStrings.$tr('coachesTitle'),
      icon: 'coach',
      to: '/ae/admin/coaches',
      name: 'AeAdminCoaches',
    },
    {
      id: 'admin-reports',
      label: portalStrings.$tr('reportsTitle'),
      icon: 'reports',
      to: '/ae/admin/reports',
      name: 'AeAdminReports',
    },
    {
      id: 'admin-sync',
      label: portalStrings.$tr('syncTitle'),
      icon: 'device',
      to: '/ae/admin/sync',
      name: 'AeAdminSync',
    },
    {
      id: 'admin-settings',
      label: portalStrings.$tr('settingsTitle'),
      icon: 'settings',
      to: '/ae/admin/settings',
      name: 'AeAdminSettings',
    },
  ]);

  const area = computed(() => {
    const p = route.path || '';
    if (p.startsWith('/ae/admin')) {
      return 'admin';
    }
    if (p.startsWith('/ae/coach')) {
      return 'coach';
    }
    return 'learn';
  });

  const items = computed(() => {
    if (area.value === 'admin' && perms.canViewAdminDashboard.value) {
      return adminItems.value.filter(item => {
        if (item.id === 'admin-content') {
          return perms.canManageContent.value;
        }
        if (item.id === 'admin-sync') {
          return perms.canAccessDeviceAdministration.value;
        }
        return true;
      });
    }
    if (area.value === 'coach' && perms.canViewCoachArea.value) {
      return coachItems.value;
    }
    return learnerItems.value;
  });

  const activeId = computed(() => {
    const name = route.name;
    const path = route.path || '';
    const byName = items.value.find(item => item.name === name);
    if (byName) {
      return byName.id;
    }
    const byPath = [...items.value]
      .sort((a, b) => b.to.length - a.to.length)
      .find(item => path === item.to || path.startsWith(`${item.to}/`));
    return byPath ? byPath.id : items.value[0] && items.value[0].id;
  });

  const switcherLinks = computed(() => {
    const links = [];
    if (perms.canViewLearnerArea.value) {
      links.push({
        id: 'sw-learn',
        label: portalStrings.$tr('spaceLearner'),
        to: '/ae/learn',
        active: area.value === 'learn',
      });
    }
    if (perms.canViewCoachArea.value) {
      links.push({
        id: 'sw-coach',
        label: portalStrings.$tr('spaceCoach'),
        to: '/ae/coach',
        active: area.value === 'coach',
      });
    }
    if (perms.canViewAdminDashboard.value) {
      links.push({
        id: 'sw-admin',
        label: portalStrings.$tr('spaceAdmin'),
        to: '/ae/admin',
        active: area.value === 'admin',
      });
    }
    return links;
  });

  return {
    area,
    items,
    activeId,
    switcherLinks,
    learnerItems,
    coachItems,
    adminItems,
  };
}
