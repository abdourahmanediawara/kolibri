/**
 * Navigation items per AE space — one menu definition per layout.
 * Paths are the sole source of truth for in-app side navigation.
 */
import { computed } from 'vue';
import { useRoute } from 'vue-router/composables';
import { portalStrings } from '../strings';
import { useAePermissions } from './useAePermissions';

function activeIdFromItems(items, route) {
  const name = route.name;
  const path = route.path || '';
  const byName = items.find(item => item.name === name);
  if (byName) {
    return byName.id;
  }
  const byPath = [...items]
    .sort((a, b) => b.to.length - a.to.length)
    .find(item => path === item.to || path.startsWith(`${item.to}/`));
  return byPath ? byPath.id : items[0] && items[0].id;
}

export function useAeLearnerNav() {
  const route = useRoute();
  const { isUserLoggedIn } = useAePermissions();
  // Visitors browsing without an account only see the library and the help.
  const GUEST_ITEMS = ['learn-library', 'learn-help'];
  const allItems = computed(() => [
    {
      id: 'learn-home',
      label: portalStrings.$tr('homeNavLabel'),
      icon: 'dashboard',
      to: '/apprenant',
      name: 'AeLearnHome',
    },
    {
      id: 'learn-formations',
      label: portalStrings.$tr('myCourses'),
      icon: 'lesson',
      to: '/apprenant/cours',
      name: 'AeLearnFormations',
    },
    {
      id: 'learn-library',
      label: portalStrings.$tr('libraryTitle'),
      icon: 'library',
      to: '/apprenant/bibliotheque',
      name: 'AeLearnLibrary',
    },
    {
      id: 'learn-quizzes',
      label: portalStrings.$tr('myQuizzes'),
      icon: 'quiz',
      to: '/apprenant/quiz',
      name: 'AeLearnQuizzes',
    },
    {
      id: 'learn-progress',
      label: portalStrings.$tr('progressTitle'),
      icon: 'inProgress',
      to: '/apprenant/progression',
      name: 'AeLearnProgress',
    },
    {
      id: 'learn-profile',
      label: portalStrings.$tr('myProfile'),
      icon: 'person',
      to: '/apprenant/profil',
      name: 'AeLearnProfile',
    },
    {
      id: 'learn-help',
      label: portalStrings.$tr('helpPageTitle'),
      icon: 'help',
      to: '/apprenant/aide',
      name: 'AeLearnHelp',
    },
  ]);
  const items = computed(() =>
    isUserLoggedIn.value
      ? allItems.value
      : allItems.value.filter(item => GUEST_ITEMS.includes(item.id)),
  );
  const activeId = computed(() => activeIdFromItems(items.value, route));
  return { items, activeId };
}

export function useAeCoachNav() {
  const route = useRoute();
  const items = computed(() => [
    {
      id: 'coach-home',
      label: portalStrings.$tr('coachDashTitle'),
      icon: 'dashboard',
      to: '/formateur',
      name: 'AeCoachHome',
    },
    {
      id: 'coach-classes',
      label: portalStrings.$tr('myClasses'),
      icon: 'classes',
      to: '/formateur/classes',
      name: 'AeCoachClasses',
    },
    {
      id: 'coach-learners',
      label: portalStrings.$tr('myLearners'),
      icon: 'people',
      to: '/formateur/eleves',
      name: 'AeCoachLearners',
    },
    {
      id: 'coach-formations',
      label: portalStrings.$tr('myCourses'),
      icon: 'lesson',
      to: '/formateur/cours',
      name: 'AeCoachFormations',
    },
    {
      id: 'coach-sessions',
      label: portalStrings.$tr('sessions'),
      icon: 'schedule',
      to: '/formateur/sessions',
      name: 'AeCoachSessions',
    },
    {
      id: 'coach-results',
      label: portalStrings.$tr('resultsTitle'),
      icon: 'reports',
      to: '/formateur/resultats',
      name: 'AeCoachResults',
    },
    {
      id: 'coach-library',
      label: portalStrings.$tr('libraryTitle'),
      icon: 'library',
      to: '/formateur/bibliotheque',
      name: 'AeCoachLibrary',
    },
  ]);
  const activeId = computed(() => activeIdFromItems(items.value, route));
  return { items, activeId };
}

export function useAeAdminNav() {
  const route = useRoute();
  const perms = useAePermissions();
  const items = computed(() => {
    const list = [
      {
        id: 'admin-home',
        label: portalStrings.$tr('dashboardTitle'),
        icon: 'dashboard',
        to: '/administrateur',
        name: 'AeAdminHome',
      },
      {
        id: 'admin-users',
        label: portalStrings.$tr('dashUsersLabel'),
        icon: 'people',
        to: '/administrateur/utilisateurs',
        name: 'AeAdminUsers',
      },
      {
        id: 'admin-classes',
        label: portalStrings.$tr('classesTitle'),
        icon: 'classes',
        to: '/administrateur/classes',
        name: 'AeAdminClasses',
      },
      {
        id: 'admin-courses',
        label: portalStrings.$tr('coursesTitle'),
        icon: 'lesson',
        to: '/administrateur/cours',
        name: 'AeAdminCourses',
      },
      {
        id: 'admin-coaches',
        label: portalStrings.$tr('coachesTitle'),
        icon: 'coach',
        to: '/administrateur/formateurs',
        name: 'AeAdminCoaches',
      },
      {
        id: 'admin-content',
        label: portalStrings.$tr('contentManageTitle'),
        icon: 'channel',
        to: '/administrateur/contenus',
        name: 'AeAdminContent',
      },
      {
        id: 'admin-reports',
        label: portalStrings.$tr('monitoringTitle'),
        icon: 'reports',
        to: '/administrateur/suivi',
        name: 'AeAdminReports',
      },
    ];
    if (perms.canSyncFacility.value) {
      list.push({
        id: 'admin-sync',
        label: portalStrings.$tr('syncTitle'),
        icon: 'refresh',
        to: '/administrateur/synchronisation',
        name: 'AeAdminSync',
      });
    }
    list.push({
      id: 'admin-settings',
      label: portalStrings.$tr('settingsTitle'),
      icon: 'settings',
      to: '/administrateur/parametres',
      name: 'AeAdminSettings',
    });
    return list;
  });
  const activeId = computed(() => activeIdFromItems(items.value, route));
  return { items, activeId };
}

/**
 * @deprecated Prefer space-specific nav composables. Kept for tests that still import it.
 */
export function useAeNav() {
  const route = useRoute();
  const perms = useAePermissions();
  const learner = useAeLearnerNav();
  const coach = useAeCoachNav();
  const admin = useAeAdminNav();

  const area = computed(() => {
    const p = route.path || '';
    if (p.startsWith('/administrateur') || p.startsWith('/ae/admin')) {
      return 'admin';
    }
    if (p.startsWith('/formateur') || p.startsWith('/ae/coach')) {
      return 'coach';
    }
    return 'learn';
  });

  const items = computed(() => {
    if (area.value === 'admin') {
      return admin.items.value;
    }
    if (area.value === 'coach') {
      return coach.items.value;
    }
    return learner.items.value;
  });

  const activeId = computed(() => {
    if (area.value === 'admin') {
      return admin.activeId.value;
    }
    if (area.value === 'coach') {
      return coach.activeId.value;
    }
    return learner.activeId.value;
  });

  /** Intentionally empty for ordinary users — spaces are separate. */
  const switcherLinks = computed(() => {
    if (!perms.isSuperuser.value) {
      return [];
    }
    return [
      {
        id: 'sw-learn',
        label: portalStrings.$tr('spaceLearner'),
        to: '/apprenant',
        active: area.value === 'learn',
      },
      {
        id: 'sw-coach',
        label: portalStrings.$tr('spaceCoach'),
        to: '/formateur',
        active: area.value === 'coach',
      },
      {
        id: 'sw-admin',
        label: portalStrings.$tr('spaceAdmin'),
        to: '/administrateur',
        active: area.value === 'admin',
      },
    ];
  });

  return {
    area,
    items,
    activeId,
    switcherLinks,
    learnerItems: learner.items,
    coachItems: coach.items,
    adminItems: admin.items,
  };
}
