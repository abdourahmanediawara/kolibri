import { createTranslator } from 'kolibri/utils/i18n';

// Source messages in French — primary audience is Action Éducation Guinée.
export const portalStrings = createTranslator('ActionEducationPortalStrings', {
  homeNavLabel: {
    message: 'Accueil',
    context: 'Side navigation label for the AE Apprendre learner home.',
  },
  pageTitle: {
    message: 'Accueil',
    context: 'Browser tab / app bar title for the learner portal home.',
  },
  greetingNamed: {
    message: 'Bonjour, {name}',
    context: 'Welcome heading when the learner first name is known.',
  },
  greetingGeneric: {
    message: 'Bonjour',
    context: 'Welcome heading when the learner name is unavailable.',
  },
  tagline: {
    message: 'Que souhaitez-vous apprendre aujourd’hui ?',
    context: 'Short supporting sentence under the greeting.',
  },
  continueTitle: {
    message: 'Continuer ma formation',
    context: 'Primary card heading for resuming learning.',
  },
  continueEmpty: {
    message: 'Commencez votre première formation',
    context: 'Empty state when the learner has no resumable content.',
  },
  exploreTrainings: {
    message: 'Explorer les formations',
    context: 'Button linking to the Learn library.',
  },
  continueAction: {
    message: 'Continuer',
    context: 'Button to resume the last training.',
  },
  shortcutTrainings: {
    message: 'Mes formations',
    context: 'Shortcut card title.',
  },
  shortcutTrainingsDesc: {
    message: 'Classes et contenus assignés',
    context: 'Shortcut card description.',
  },
  shortcutExplore: {
    message: 'Explorer',
    context: 'Shortcut card title.',
  },
  shortcutExploreDesc: {
    message: 'Parcourir la bibliothèque',
    context: 'Shortcut card description.',
  },
  shortcutVideos: {
    message: 'Vidéos',
    context: 'Shortcut card title.',
  },
  shortcutVideosDesc: {
    message: 'Regarder les vidéos locales',
    context: 'Shortcut card description.',
  },
  shortcutQuizzes: {
    message: 'Quiz',
    context: 'Shortcut card title.',
  },
  shortcutQuizzesDesc: {
    message: 'S’exercer et vérifier ses connaissances',
    context: 'Shortcut card description.',
  },
  shortcutProgress: {
    message: 'Ma progression',
    context: 'Shortcut card title.',
  },
  shortcutProgressDesc: {
    message: 'Voir ce que vous avez terminé',
    context: 'Shortcut card description.',
  },
  shortcutHelp: {
    message: 'Aide',
    context: 'Shortcut card title.',
  },
  shortcutHelpDesc: {
    message: 'Guides simples pour démarrer',
    context: 'Shortcut card description.',
  },
  loadingLabel: {
    message: 'Chargement…',
    context: 'Accessible loading status.',
  },
  offlineHint: {
    message: 'Fonctionne sans Internet sur ce réseau local.',
    context: 'Reassurance that the portal is offline-capable.',
  },
  shortcutsLabel: {
    message: 'Raccourcis principaux',
    context: 'Accessible label for the six primary portal shortcut cards.',
  },
  helpPageTitle: {
    message: 'Aide',
    context: 'App bar title for the help page.',
  },
  helpIntro: {
    message: 'Suivez ces étapes courtes. Demandez à votre formateur si vous avez besoin d’aide.',
    context: 'Intro text on the learner help page.',
  },
  helpStepLoginTitle: {
    message: '1. Se connecter',
    context: 'Help step heading.',
  },
  helpStepLoginBody: {
    message:
      'Entrez votre nom d’utilisateur et votre mot de passe, ou choisissez Parcourir sans compte si c’est autorisé.',
    context: 'Help step body.',
  },
  helpStepOpenTitle: {
    message: '2. Ouvrir une formation',
    context: 'Help step heading.',
  },
  helpStepOpenBody: {
    message:
      'Depuis l’accueil, touchez Explorer ou Mes formations, puis choisissez une carte de formation.',
    context: 'Help step body.',
  },
  helpStepVideoTitle: {
    message: '3. Regarder une vidéo',
    context: 'Help step heading.',
  },
  helpStepVideoBody: {
    message:
      'Ouvrez une vidéo depuis la bibliothèque. Elle se lit sur cet appareil — sans Internet.',
    context: 'Help step body.',
  },
  helpStepQuizTitle: {
    message: '4. Faire un quiz',
    context: 'Help step heading.',
  },
  helpStepQuizBody: {
    message:
      'Ouvrez un quiz depuis votre classe ou la bibliothèque, répondez aux questions, puis envoyez.',
    context: 'Help step body.',
  },
  helpStepProgressTitle: {
    message: '5. Voir votre progression',
    context: 'Help step heading.',
  },
  helpStepProgressBody: {
    message: 'Votre progression est enregistrée automatiquement, même sans Internet.',
    context: 'Help step body.',
  },
  helpStepOfflineTitle: {
    message: '6. Que signifie hors ligne ?',
    context: 'Help step heading.',
  },
  helpStepOfflineBody: {
    message:
      'Vous utilisez AE Apprendre sur le Wi‑Fi local. Les contenus et résultats restent sur ce réseau.',
    context: 'Help step body.',
  },
  helpStepTrainerTitle: {
    message: '7. Demander à votre formateur',
    context: 'Help step heading.',
  },
  helpStepTrainerBody: {
    message:
      'Si quelque chose ne fonctionne pas, dites-le à votre formateur. Il peut vous aider sur place.',
    context: 'Help step body.',
  },
  backHome: {
    message: 'Retour à l’accueil',
    context: 'Link from secondary portal pages to the home page.',
  },
  catalogTitle: {
    message: 'Formations',
    context: 'Catalog page title listing available channels.',
  },
  catalogIntro: {
    message: 'Parcourez les formations disponibles sur cet appareil.',
    context: 'Catalog page intro.',
  },
  catalogEmpty: {
    message:
      'Aucune formation n’est encore disponible. Demandez à votre formateur d’importer du contenu.',
    context: 'Catalog empty state.',
  },
  channelMeta: {
    message: '{count} ressources',
    context: 'Secondary line under a channel card.',
  },
  searchLabel: {
    message: 'Rechercher',
    context: 'Search field label on portal list pages.',
  },
  searchAction: {
    message: 'Rechercher',
    context: 'Search button label.',
  },
  videosTitle: {
    message: 'Vidéos',
    context: 'Videos page title.',
  },
  videosIntro: {
    message: 'Vidéos locales à regarder sans Internet.',
    context: 'Videos page intro.',
  },
  videosEmpty: {
    message: 'Aucune vidéo n’est encore disponible sur cet appareil.',
    context: 'Videos empty state.',
  },
  quizzesTitle: {
    message: 'Quiz',
    context: 'Quizzes page title.',
  },
  quizzesIntro: {
    message: 'Quiz d’entraînement disponibles dans la bibliothèque locale.',
    context: 'Quizzes page intro.',
  },
  quizzesEmpty: {
    message: 'Aucun quiz n’est encore disponible sur cet appareil.',
    context: 'Quizzes empty state.',
  },
  progressTitle: {
    message: 'Ma progression',
    context: 'Progress page title.',
  },
  progressIntro: {
    message: 'Formations que vous avez commencées. Ouvrez-en une pour continuer.',
    context: 'Progress page intro.',
  },
  progressEmpty: {
    message: 'Vous n’avez pas encore commencé de formation. Explorez le catalogue pour démarrer.',
    context: 'Progress empty state.',
  },
  progressPercent: {
    message: '{percent} % terminé',
    context: 'Progress percentage label on a content card.',
  },
  notStarted: {
    message: 'Pas commencé',
    context: 'Progress label when the learner has not begun an item.',
  },
  myTrainingsTitle: {
    message: 'Mes formations',
    context: 'Page title for assigned / class content shortcut target.',
  },
  trainerSessionsTitle: {
    message: 'Sessions',
    context: 'Trainer sessions page title.',
  },
  trainerSessionsIntro: {
    message: 'Créez une session de formation et prenez les présences hors ligne.',
    context: 'Trainer sessions page intro.',
  },
  trainerStaffOnly: {
    message: 'Seuls les formateurs et administrateurs peuvent gérer les sessions.',
    context: 'Shown when a learner opens trainer pages.',
  },
  createSessionTitle: {
    message: 'Nouvelle session',
    context: 'Heading for the create-session form.',
  },
  trainingTitleLabel: {
    message: 'Titre de la formation',
    context: 'Label for training title field.',
  },
  locationLabel: {
    message: 'Lieu',
    context: 'Label for session location field.',
  },
  startLabel: {
    message: 'Date et heure de début',
    context: 'Label for session start datetime field.',
  },
  startHint: {
    message: 'Format AAAA-MM-JJTHH:MM (exemple : 2026-07-23T14:00).',
    context: 'Help text for the start datetime field.',
  },
  createSessionAction: {
    message: 'Créer la session',
    context: 'Button to create a training session.',
  },
  sessionsEmpty: {
    message: 'Aucune session n’a encore été planifiée.',
    context: 'Empty state for trainer sessions list.',
  },
  takeAttendanceAction: {
    message: 'Présences',
    context: 'Button opening attendance for a session.',
  },
  saveSuccess: {
    message: 'Enregistré.',
    context: 'Generic success status after saving.',
  },
  saveError: {
    message: 'Enregistrement impossible. Vérifiez les champs et réessayez.',
    context: 'Generic error status after a failed save.',
  },
  attendancePageTitle: {
    message: 'Présences',
    context: 'Attendance page title.',
  },
  enrollTitle: {
    message: 'Ajouter un apprenant',
    context: 'Enrollment form heading on attendance page.',
  },
  learnerUsernameLabel: {
    message: 'Nom d’utilisateur de l’apprenant',
    context: 'Username field for enrolling a learner.',
  },
  enrollAction: {
    message: 'Inscrire',
    context: 'Button to enroll a learner in the session.',
  },
  attendanceEmpty: {
    message: 'Aucun apprenant inscrit. Ajoutez un nom d’utilisateur ci-dessus.',
    context: 'Empty state when a session has no enrollments.',
  },
  backToSessions: {
    message: 'Retour aux sessions',
    context: 'Link from attendance page to sessions list.',
  },
  statusPresent: {
    message: 'Présent',
    context: 'Attendance status button.',
  },
  statusAbsent: {
    message: 'Absent',
    context: 'Attendance status button.',
  },
  statusLate: {
    message: 'En retard',
    context: 'Attendance status button.',
  },
  statusExcused: {
    message: 'Excusé',
    context: 'Attendance status button.',
  },
  statusNone: {
    message: 'Non saisi',
    context: 'Attendance status when none is set.',
  },
  enrollSuccess: {
    message: 'Apprenant inscrit.',
    context: 'Success message after enrollment.',
  },
  enrollError: {
    message: 'Inscription impossible. Vérifiez le nom d’utilisateur.',
    context: 'Error message after failed enrollment.',
  },
  shortcutTrainer: {
    message: 'Formateur',
    context: 'Home shortcut for trainers.',
  },
  shortcutTrainerDesc: {
    message: 'Tableau de bord, sessions et présences',
    context: 'Home shortcut description for trainers.',
  },
  trainerDashTitle: {
    message: 'Tableau de bord formateur',
    context: 'Trainer dashboard page title.',
  },
  trainerDashIntro: {
    message: 'Vue d’ensemble des formations AE, sessions et présences sur cet appareil.',
    context: 'Trainer dashboard intro.',
  },
  openSessionsAction: {
    message: 'Gérer les sessions',
    context: 'Button to open sessions list from dashboard.',
  },
  openCoachAction: {
    message: 'Ouvrir Coach (Kolibri)',
    context: 'Button linking to advanced Kolibri Coach plugin.',
  },
  todaySessionsTitle: {
    message: 'Sessions du jour',
    context: 'Heading for today session list on trainer dashboard.',
  },
  todaySessionsEmpty: {
    message: 'Aucune session prévue aujourd’hui.',
    context: 'Empty state for today sessions on trainer dashboard.',
  },
  dashTrainingsLabel: {
    message: 'Formations',
    context: 'Dashboard summary card label.',
  },
  dashSessionsLabel: {
    message: 'Sessions',
    context: 'Dashboard summary card label.',
  },
  dashEnrollmentsLabel: {
    message: 'Inscriptions',
    context: 'Dashboard summary card label.',
  },
  dashAttendanceLabel: {
    message: 'Présences enregistrées',
    context: 'Dashboard summary card label.',
  },
  adminDashTitle: {
    message: 'Tableau de bord admin',
    context: 'Administrator dashboard page title.',
  },
  adminDashIntro: {
    message: 'Vue d’ensemble de votre plateforme Action Éducation sur ce serveur local.',
    context: 'Admin dashboard intro.',
  },
  adminRecentActivityTitle: {
    message: 'Activité récente',
    context: 'Admin dashboard recent activity section heading.',
  },
  adminRecentActivityEmpty: {
    message: 'Aucune activité récente à afficher pour le moment.',
    context: 'Shown when the admin activity feed has no items.',
  },
  adminQuickActionsTitle: {
    message: 'Actions rapides',
    context: 'Admin dashboard quick actions section heading.',
  },
  adminQuickAddUser: {
    message: 'Ajouter un utilisateur',
    context: 'Admin dashboard quick action button.',
  },
  adminQuickCreateGroup: {
    message: 'Créer un groupe',
    context: 'Admin dashboard quick action button.',
  },
  adminQuickCreateTraining: {
    message: 'Créer une formation',
    context: 'Admin dashboard quick action button.',
  },
  adminQuickConfigureChannel: {
    message: 'Configurer un canal',
    context: 'Admin dashboard quick action button.',
  },
  adminQuickOpenSettings: {
    message: 'Accéder aux paramètres',
    context: 'Admin dashboard quick action button spanning full width.',
  },
  adminStaffOnly: {
    message: 'Seuls les administrateurs peuvent ouvrir cette page.',
    context: 'Shown when a non-admin opens the admin dashboard.',
  },
  adminQuickLinksTitle: {
    message: 'Liens rapides',
    context: 'Heading for admin quick links section.',
  },
  adminAdvancedTitle: {
    message: 'Administration avancée',
    context: 'Heading for links to full Kolibri Facility/Device tools.',
  },
  adminAdvancedBody: {
    message:
      'Utilisez Facility et Device de Kolibri pour les comptes, classes, contenus et sauvegardes.',
    context: 'Explains advanced admin section.',
  },
  openFacilityAction: {
    message: 'Ouvrir Facility',
    context: 'Button to Kolibri Facility plugin.',
  },
  openDeviceAction: {
    message: 'Ouvrir Device',
    context: 'Button to Kolibri Device plugin.',
  },
  dashUsersLabel: {
    message: 'Utilisateurs',
    context: 'Admin dashboard summary card label.',
  },
  dashChannelsLabel: {
    message: 'Canaux',
    context: 'Admin dashboard summary card label.',
  },
  adminLinkUsersTitle: {
    message: 'Utilisateurs',
    context: 'Admin quick link title.',
  },
  adminLinkUsersDesc: {
    message: 'Gérer les comptes et classes',
    context: 'Admin quick link description.',
  },
  adminLinkContentsTitle: {
    message: 'Contenus',
    context: 'Admin quick link title.',
  },
  adminLinkContentsDesc: {
    message: 'Parcourir la bibliothèque locale',
    context: 'Admin quick link description.',
  },
  adminLinkTrainerTitle: {
    message: 'Outils formateur',
    context: 'Admin quick link title.',
  },
  adminLinkTrainerDesc: {
    message: 'Sessions et présences',
    context: 'Admin quick link description.',
  },
  adminLinkDeviceTitle: {
    message: 'Appareil',
    context: 'Admin quick link title.',
  },
  adminLinkDeviceDesc: {
    message: 'Canaux, mises à jour et paramètres',
    context: 'Admin quick link description.',
  },
  shortcutAdmin: {
    message: 'Admin',
    context: 'Home shortcut for administrators.',
  },
  shortcutAdminDesc: {
    message: 'Vue d’ensemble et outils avancés',
    context: 'Home shortcut description for administrators.',
  },
  certificatesTitle: {
    message: 'Certificats',
    context: 'Certificates page title.',
  },
  certificatesIntro: {
    message:
      'Délivrer et imprimer les certificats de formation pour les apprenants sur cet appareil.',
    context: 'Certificates page intro.',
  },
  issueCertificateTitle: {
    message: 'Délivrer un certificat',
    context: 'Heading for certificate issue form.',
  },
  trainingSelectLabel: {
    message: 'Formation',
    context: 'Label for training select when issuing a certificate.',
  },
  trainingSelectPlaceholder: {
    message: 'Choisir une formation',
    context: 'Placeholder option for training select.',
  },
  issueCertificateAction: {
    message: 'Délivrer le certificat',
    context: 'Button to issue a certificate.',
  },
  certificatesEmpty: {
    message: 'Aucun certificat délivré pour l’instant.',
    context: 'Empty state for certificates list.',
  },
  printCertificateAction: {
    message: 'Imprimer',
    context: 'Button to open printable certificate HTML.',
  },
  certificateIssued: {
    message: 'Certificat délivré.',
    context: 'Success message after issuing a certificate.',
  },
  certificateIssueError: {
    message: 'Impossible de délivrer le certificat. Vérifiez le nom d’utilisateur et la formation.',
    context: 'Error message after failed certificate issue.',
  },
  reportsTitle: {
    message: 'Rapports et exports',
    context: 'Reports page title.',
  },
  reportsIntro: {
    message:
      'Télécharger les rapports CSV des présences, inscriptions et certificats (hors ligne).',
    context: 'Reports page intro.',
  },
  exportCertificatesTitle: {
    message: 'Tous les certificats',
    context: 'Heading for certificates CSV export.',
  },
  exportCertificatesDesc: {
    message: 'Exporter tous les certificats délivrés dans cet établissement.',
    context: 'Description for certificates CSV export.',
  },
  exportAttendanceTitle: {
    message: 'Présences par session',
    context: 'Heading for per-session attendance CSV exports.',
  },
  exportEnrollmentsTitle: {
    message: 'Inscriptions par formation',
    context: 'Heading for per-training enrollment CSV exports.',
  },
  downloadCsvAction: {
    message: 'Télécharger CSV',
    context: 'Button to download a CSV export.',
  },
  trainingsEmpty: {
    message: 'Aucune formation pour l’instant.',
    context: 'Empty state when there are no trainings to export.',
  },
  openCertificatesAction: {
    message: 'Certificats',
    context: 'Button opening certificates page from trainer dashboard.',
  },
  openReportsAction: {
    message: 'Rapports',
    context: 'Button opening reports page from trainer dashboard.',
  },
  adminLinkReportsTitle: {
    message: 'Rapports',
    context: 'Admin quick link title for CSV exports.',
  },
  adminLinkReportsDesc: {
    message: 'Exports CSV des présences et certificats',
    context: 'Admin quick link description for reports.',
  },
  adminLinkCertificatesTitle: {
    message: 'Certificats',
    context: 'Admin quick link title for certificates.',
  },
  adminLinkCertificatesDesc: {
    message: 'Délivrer et imprimer les certificats',
    context: 'Admin quick link description for certificates.',
  },
  platformTitle: {
    message: 'Plateforme de formation Action Éducation',
    context: 'Product name shown in app shell and browser chrome.',
  },
  openMenu: {
    message: 'Menu',
    context: 'Mobile button to open AE side navigation.',
  },
  closeMenu: {
    message: 'Fermer le menu',
    context: 'Mobile button to close AE side navigation.',
  },
  navLabel: {
    message: 'Navigation principale',
    context: 'Accessible label for AE side navigation.',
  },
  spacesLabel: {
    message: 'Espaces',
    context: 'Accessible label for learner/coach/admin space switcher.',
  },
  technicalAdmin: {
    message: 'Administration technique',
    context: 'Discrete link to native Kolibri Device for superusers.',
  },
  spaceLearner: {
    message: 'Apprenant',
    context: 'Space switcher label for learner area.',
  },
  spaceCoach: {
    message: 'Formateur',
    context: 'Space switcher label for coach area.',
  },
  spaceAdmin: {
    message: 'Administrateur',
    context: 'Space switcher label for admin area.',
  },
  sessions: {
    message: 'Sessions',
    context: 'Primary navigation label for coach sessions.',
  },
  createSession: {
    message: 'Créer la session',
    context: 'Primary action to submit the create-session form.',
  },
  sessionTitleRequired: {
    message: 'Indiquez un titre de formation.',
    context: 'Validation error when session title is empty.',
  },
  libraryTitle: {
    message: 'Bibliothèque',
    context: 'Library page title.',
  },
  coachDashTitle: {
    message: 'Tableau de bord',
    context: 'Coach dashboard title.',
  },
  learnersTitle: {
    message: 'Apprenants',
    context: 'Coach learners page title.',
  },
  resultsTitle: {
    message: 'Résultats',
    context: 'Coach results page title.',
  },
  resultsIntro: {
    message:
      'Consultez la progression réelle des exercices réalisés par les apprenants. Les scores ne s’affichent que lorsqu’ils existent dans Kolibri.',
    context: 'Coach results page introduction.',
  },
  resultsEmpty: {
    message: 'Aucun résultat n’est encore disponible.',
    context: 'Empty state when no exercise results match filters.',
  },
  resultsPartialError: {
    message:
      'Une partie des données n’a pas pu être chargée. Les résultats affichés peuvent être incomplets.',
    context: 'Shown when certificates or filter lists fail but exercise results loaded.',
  },
  resultsLoadError: {
    message: 'Impossible de charger les résultats pour le moment.',
    context: 'Shown when the learner results API fails.',
  },
  filterLearnerLabel: {
    message: 'Apprenant',
    context: 'Filter label on coach results.',
  },
  filterClassroomLabel: {
    message: 'Classe',
    context: 'Filter label on coach results.',
  },
  filterTrainingLabel: {
    message: 'Formation',
    context: 'Filter label on coach results.',
  },
  filterExerciseLabel: {
    message: 'Exercice',
    context: 'Filter label on coach results.',
  },
  filterAllOption: {
    message: 'Tous',
    context: 'Default filter option meaning no restriction.',
  },
  applyFiltersAction: {
    message: 'Filtrer',
    context: 'Button to apply coach results filters.',
  },
  colLearner: {
    message: 'Apprenant',
    context: 'Results table column.',
  },
  colExercise: {
    message: 'Exercice',
    context: 'Results table column.',
  },
  colParent: {
    message: 'Contenu parent',
    context: 'Results table column for parent topic/title.',
  },
  colStatus: {
    message: 'Statut',
    context: 'Results table column.',
  },
  colScore: {
    message: 'Réponses correctes',
    context: 'Results table column — only when attempt data exists.',
  },
  colTries: {
    message: 'Tentatives',
    context: 'Results table column.',
  },
  colLastActivity: {
    message: 'Dernière activité',
    context: 'Results table column.',
  },
  colMastery: {
    message: 'Niveau de maîtrise',
    context: 'Results table column when MasteryLog provides mastery_level.',
  },
  statusNotStarted: {
    message: 'Non commencé',
    context: 'Exercise result status.',
  },
  statusStarted: {
    message: 'Commencé',
    context: 'Exercise result status.',
  },
  statusCompleted: {
    message: 'Terminé',
    context: 'Exercise result status.',
  },
  scoreUnavailable: {
    message: '—',
    context: 'Shown when no quiz attempt score exists (do not invent one).',
  },
  deviceAdminRequiredHint: {
    message:
      'Cette action nécessite un administrateur technique de l’appareil (permissions Device Kolibri). L’administrateur d’établissement n’y a pas accès automatiquement.',
    context: 'Shown instead of Device CTAs when the user lacks DevicePermissions.',
  },
  facilityAdminSettingsHint: {
    message:
      'Paramètres fonctionnels de l’établissement. Les réglages techniques de l’appareil sont réservés à l’administrateur technique.',
    context: 'Facility admin settings page explanation.',
  },
  contentManageTitle: {
    message: 'Gestion des contenus',
    context: 'Admin content management page title.',
  },
  classesTitle: {
    message: 'Groupes et classes',
    context: 'Admin classes page title.',
  },
  coachesTitle: {
    message: 'Formateurs',
    context: 'Admin coaches page title.',
  },
  syncTitle: {
    message: 'Synchronisation',
    context: 'Admin sync page title.',
  },
  settingsTitle: {
    message: 'Paramètres',
    context: 'Admin settings page title.',
  },
  accessDenied: {
    message: 'Vous n’avez pas l’autorisation d’ouvrir cette page.',
    context: 'Shown when route permission check fails.',
  },
  localOnline: {
    message: 'Connecté au serveur local',
    context: 'Connection status on learner home.',
  },
  offlineAvailable: {
    message: 'Disponible hors connexion',
    context: 'Offline capability status on learner home.',
  },
  completedCount: {
    message: '{count} formation(s) terminée(s)',
    context: 'Count of completed trainings on learner home.',
  },
  globalProgress: {
    message: 'Progression globale : {percent} %',
    context: 'Overall progress label when computable.',
  },
  recentTitle: {
    message: 'Récemment consultées',
    context: 'Heading for recent resources list.',
  },
  startAction: {
    message: 'Commencer',
    context: 'Button to start a training.',
  },
  statusNotStarted: {
    message: 'Non commencée',
    context: 'Training card status.',
  },
  statusInProgress: {
    message: 'En cours',
    context: 'Training card status.',
  },
  statusCompleted: {
    message: 'Terminée',
    context: 'Training card status.',
  },
  emptyFormationsLearner: {
    message: 'Aucun cours n’est encore disponible. Votre formateur ajoutera des supports bientôt.',
    context: 'Empty state for learner courses list.',
  },
  learnerCoursesIntro: {
    message:
      'Ouvrez un cours pour télécharger les supports (PDF, Word, PowerPoint, Excel, vidéo…).',
    context: 'Intro on learner courses list — Omnivox-style materials.',
  },
  openCourseMaterialsAction: {
    message: 'Voir les supports',
    context: 'Link on learner course card to open materials.',
  },
  openCourseDetailsAction: {
    message: 'Ouvrir le cours',
    context: 'CTA on clickable coach course card to open course details and files.',
  },
  learnerCourseMaterialsIntro: {
    message:
      'Téléchargez les fichiers sur votre ordinateur ou téléphone pour les consulter hors ligne.',
    context: 'Intro on learner course detail materials list.',
  },
  selectCourseOption: {
    message: 'Choisir un cours',
    context: 'Placeholder when selecting an existing course for a session.',
  },
  sessionCourseRequired: {
    message: 'Choisissez un cours existant pour cette session.',
    context: 'Validation when creating a session without selecting a course.',
  },
  sessionNeedsCourseHint: {
    message: 'Créez d’abord un cours dans Mes cours, puis revenez planifier la session.',
    context: 'Hint when no courses exist yet on the sessions form.',
  },
  emptyFormationsStaff: {
    message: 'Vous n’avez encore créé aucun cours.',
    context: 'Empty state for staff formations list.',
  },
  addContentAction: {
    message: 'Ajouter du contenu',
    context: 'Primary CTA to open content import flows.',
  },
  signInAction: {
    message: 'Se connecter',
    context: 'Link to auth when portal access is denied for anonymous users.',
  },
  dateLabel: {
    message: 'Date',
    context: 'Session creation date picker label.',
  },
  timeLabel: {
    message: 'Heure',
    context: 'Session creation time picker label.',
  },
  sessionDateRequired: {
    message: 'Indiquez une date et une heure valides.',
    context: 'Validation error for session datetime.',
  },
  openSessionAction: {
    message: 'Ouvrir la session',
    context: 'Link from session list to session detail.',
  },
  sessionStatusScheduled: {
    message: 'Planifiée',
    context: 'Training session status.',
  },
  sessionStatusInProgress: {
    message: 'En cours',
    context: 'Training session status.',
  },
  sessionStatusCompleted: {
    message: 'Terminée',
    context: 'Training session status.',
  },
  sessionStatusCancelled: {
    message: 'Annulée',
    context: 'Training session status.',
  },
  settingsDeviceHint: {
    message:
      'Nom de l’appareil, langue, accès invité et visibilité réseau se règlent dans les paramètres Device, où ils sont réellement enregistrés.',
    context: 'Honest settings page guidance.',
  },
  openDeviceSettingsAction: {
    message: 'Ouvrir les paramètres Device',
    context: 'Button to Device settings page.',
  },
  syncIntro: {
    message:
      'Synchronisez cet appareil avec un autre Kolibri ou un serveur distant lorsque le réseau le permet.',
    context: 'Admin sync page intro.',
  },
  openDeviceSync: {
    message: 'Ouvrir la synchronisation',
    context: 'Button to Device sync UI.',
  },
  syncFacilityTitle: {
    message: 'Données de l’établissement',
    context: 'Sync page card about syncing the facility data.',
  },
  syncFacilityText: {
    message:
      'Envoyez et recevez les comptes, les groupes et la progression des apprenants avec un autre Kolibri du réseau ou avec le Kolibri Data Portal.',
    context: 'Explains what syncing the facility data does.',
  },
  syncFacilityAction: {
    message: 'Synchroniser les données',
    context: 'Button opening the Kolibri facility sync page.',
  },
  lastSyncLabel: {
    message: 'Dernière synchronisation',
    context: 'Label of the date of the last successful facility sync.',
  },
  neverSynced: {
    message: 'Jamais',
    context: 'Shown as last sync date when the facility was never synced.',
  },
  syncDeviceText: {
    message:
      'Importez un autre établissement sur cet appareil ou gérez les synchronisations de tous les établissements.',
    context: 'Sync page card for technical admins about device-wide sync.',
  },
  importAfterSignInHint: {
    message: 'Pour importer des contenus, déconnectez-vous puis reconnectez-vous.',
    context:
      'Content page note for an admin whose content permission is turned on at their next sign-in.',
  },
  settingsIntro: {
    message:
      'Réglages utiles de la plateforme. Les options avancées restent dans l’administration technique.',
    context: 'Admin settings intro.',
  },
  previewLearner: {
    message: 'Prévisualiser l’espace apprenant',
    context: 'Admin/coach link to learner area.',
  },
  modulesLabel: {
    message: '{count} modules',
    context: 'Module count on a formation card.',
  },
  filterAll: {
    message: 'Tous',
    context: 'Filter option for all types.',
  },
  typeVideo: {
    message: 'Vidéos',
    context: 'Content type filter.',
  },
  typeDocument: {
    message: 'Documents',
    context: 'Content type filter.',
  },
  typeAudio: {
    message: 'Audio',
    context: 'Content type filter.',
  },
  typeHtml5: {
    message: 'Interactifs',
    context: 'Content type filter.',
  },
  quizBestScore: {
    message: 'Meilleure note : {score}%',
    context: 'Best quiz score when available.',
  },
  quizLastAttempt: {
    message: 'Dernière tentative',
    context: 'Last attempt label when date unknown.',
  },
  createSessionShortcut: {
    message: 'Créer une session',
    context: 'Coach dashboard shortcut.',
  },
  viewLearnersShortcut: {
    message: 'Consulter les apprenants',
    context: 'Coach dashboard shortcut.',
  },
  learnersEmpty: {
    message: 'Aucun élève n’est encore inscrit dans vos classes.',
    context: 'Empty learners list.',
  },
  forbiddenTitle: {
    message: 'Accès refusé',
    context: 'Forbidden page title.',
  },
  loadError: {
    message: 'Impossible de charger les données. Réessayez dans un moment.',
    context: 'Generic error when an API request fails in the portal.',
  },
  loadTimeout: {
    message: 'Le chargement prend trop de temps. Réessayez.',
    context: 'Shown when a portal API request exceeds the client timeout.',
  },
  retryAction: {
    message: 'Réessayer',
    context: 'Retry button after a load error.',
  },
  libraryOpenInKolibriHint: {
    message:
      'Les ressources s’ouvrent dans l’interface Kolibri (nouvel onglet). Revenez ensuite à la Bibliothèque du portail.',
    context: 'Explains library links leave the AE portal shell.',
  },
  backToCoachLibrary: {
    message: 'Retour à la bibliothèque formateur',
    context: 'Link back to coach library after viewing native Learn content.',
  },
  connectionOffline: {
    message: 'Hors ligne — contenus déjà téléchargés disponibles',
    context: 'Status when the browser reports offline.',
  },
  myCourses: {
    message: 'Mes cours',
    context: 'Learner and coach navigation label for assigned courses.',
  },
  myQuizzes: {
    message: 'Mes quiz',
    context: 'Learner navigation label for quizzes.',
  },
  myProfile: {
    message: 'Mon profil',
    context: 'Learner navigation label for profile page.',
  },
  profileIntro: {
    message: 'Informations de votre compte sur cet appareil.',
    context: 'Learner profile page intro.',
  },
  usernameLabel: {
    message: 'Nom d’utilisateur',
    context: 'Username field label on sign-in and profile.',
  },
  passwordLabel: {
    message: 'Mot de passe',
    context: 'Password field label on sign-in.',
  },
  displayNameLabel: {
    message: 'Nom',
    context: 'Display name label on profile.',
  },
  myClasses: {
    message: 'Mes classes',
    context: 'Coach navigation label for assigned classes.',
  },
  myLearners: {
    message: 'Mes élèves',
    context: 'Coach navigation label for learners.',
  },
  coachClassesIntro: {
    message: 'Classes qui vous sont affectées sur cet établissement.',
    context: 'Coach classes page intro.',
  },
  coachClassesEmpty: {
    message: 'Vous ne gérez encore aucune classe.',
    context: 'Empty state for coach classes list.',
  },
  createClassTitle: {
    message: 'Nouvelle classe',
    context: 'Heading for create classroom form on coach classes page.',
  },
  classNameLabel: {
    message: 'Nom de la classe',
    context: 'Label for classroom name field.',
  },
  createClassAction: {
    message: 'Créer la classe',
    context: 'Submit button to create a classroom.',
  },
  classNameRequired: {
    message: 'Indiquez un nom de classe.',
    context: 'Validation when classroom name is empty.',
  },
  learnerCountLabel: {
    message: '{count} élève(s)',
    context: 'Learner count under a classroom card. {count} is a number.',
  },
  viewClassLearnersAction: {
    message: 'Voir les élèves',
    context: 'Link from a classroom card to the learners page filtered by class.',
  },
  coachLearnersIntro: {
    message: 'Choisissez une classe pour voir les élèves, puis ajoutez-en un si besoin.',
    context: 'Intro on coach learners page.',
  },
  addLearnerTitle: {
    message: 'Ajouter un élève',
    context: 'Heading for create learner form.',
  },
  addLearnerAction: {
    message: 'Ajouter l’élève',
    context: 'Submit button to create and enroll a learner.',
  },
  selectClassOption: {
    message: 'Choisir une classe',
    context: 'Placeholder option when no classroom is selected.',
  },
  selectClassToSeeLearners: {
    message: 'Choisissez une classe pour afficher la liste des élèves.',
    context: 'Hint on learners page before a classroom is selected.',
  },
  cancelAction: {
    message: 'Annuler',
    context: 'Cancel button to close a form without saving.',
  },
  backAction: {
    message: 'Retour',
    context: 'Back navigation button in the portal shell.',
  },
  learnerFieldsRequired: {
    message: 'Classe, nom, identifiant et mot de passe sont requis.',
    context: 'Validation when learner create form is incomplete.',
  },
  usernameTaken: {
    message: 'Ce nom d’utilisateur existe déjà. Choisissez-en un autre.',
    context: 'Error when creating a learner with a duplicate username.',
  },
  coachCoursesIntro: {
    message:
      'Créez un cours, puis déposez les supports (PDF, Word, PowerPoint, Excel, vidéo…). Les apprenants pourront les télécharger.',
    context: 'Intro on coach courses page — Omnivox-style course materials.',
  },
  createCourseTitle: {
    message: 'Nouveau cours',
    context: 'Heading for create training/course form.',
  },
  createCourseAction: {
    message: 'Créer le cours',
    context: 'Submit button to create a training.',
  },
  courseDescriptionLabel: {
    message: 'Description',
    context: 'Optional description field for a course.',
  },
  linkChannelLabel: {
    message: 'Canal / exercices (bibliothèque)',
    context: 'Select label to link a Kolibri channel to a course.',
  },
  linkChannelHint: {
    message: 'Les exercices et ressources du canal seront accessibles depuis ce cours.',
    context: 'Hint under channel select on course create form.',
  },
  noChannelOption: {
    message: 'Aucun canal pour le moment',
    context: 'Option when not linking a channel to the course.',
  },
  linkedChannelLabel: {
    message: 'Canal lié : {title}',
    context: 'Shows linked channel title on a course card. {title} is the channel name.',
  },
  openExercisesAction: {
    message: 'Ouvrir les exercices',
    context: 'Link to open the linked channel in Learn.',
  },
  manageCourseContentAction: {
    message: 'Ajouter du contenu',
    context: 'Link from course card to manage file attachments.',
  },
  courseContentTitle: {
    message: 'Contenu du cours',
    context: 'Heading for course file resources section.',
  },
  courseContentIntro: {
    message:
      'Ajoutez des fichiers pour les apprenants : PDF, Word, PowerPoint, Excel, vidéo, audio, images ou archives ZIP.',
    context: 'Intro explaining allowed file types on course content page.',
  },
  addCourseResourceTitle: {
    message: 'Ajouter un fichier',
    context: 'Heading for upload form on course detail.',
  },
  addCourseResourceAction: {
    message: 'Déposer le fichier',
    context: 'Submit button to upload a course file.',
  },
  resourceTitleLabel: {
    message: 'Titre affiché',
    context: 'Optional display title for an uploaded course file.',
  },
  resourceFileLabel: {
    message: 'Fichier',
    context: 'File input label for course resource upload.',
  },
  resourceFileHint: {
    message:
      'Types acceptés : pdf, doc, docx, odt, ppt, pptx, xls, xlsx, csv, mp4, webm, mp3, wav, jpg, png, zip… (max. 50 Mo)',
    context: 'Hint listing allowed extensions and size limit.',
  },
  resourcesEmpty: {
    message: 'Aucun fichier pour ce cours pour le moment.',
    context: 'Empty state when a course has no uploaded resources.',
  },
  resourceFileRequired: {
    message: 'Choisissez un fichier à déposer.',
    context: 'Validation when upload is submitted without a file.',
  },
  resourceTypeNotAllowed: {
    message: 'Ce type de fichier n’est pas accepté.',
    context: 'Error when uploaded extension is not in the allow-list.',
  },
  resourceTooLarge: {
    message: 'Le fichier dépasse la taille maximale (50 Mo).',
    context: 'Error when uploaded file is larger than the limit.',
  },
  deleteResourceAction: {
    message: 'Supprimer',
    context: 'Button to delete a course file attachment.',
  },
  downloadResourceAction: {
    message: 'Télécharger',
    context: 'Link to download a course file attachment.',
  },
  resourceKindDocument: {
    message: 'Document',
    context: 'Label for document-type course resources.',
  },
  resourceKindVideo: {
    message: 'Vidéo',
    context: 'Label for video-type course resources.',
  },
  resourceKindAudio: {
    message: 'Audio',
    context: 'Label for audio-type course resources.',
  },
  resourceKindImage: {
    message: 'Image',
    context: 'Label for image-type course resources.',
  },
  resourceKindSpreadsheet: {
    message: 'Tableur',
    context: 'Label for spreadsheet-type course resources.',
  },
  resourceKindPresentation: {
    message: 'Présentation',
    context: 'Label for presentation-type course resources.',
  },
  resourceKindArchive: {
    message: 'Archive',
    context: 'Label for archive-type course resources.',
  },
  resourceKindOther: {
    message: 'Fichier',
    context: 'Label for other course resource types.',
  },
  courseTitleRequired: {
    message: 'Indiquez un titre de cours.',
    context: 'Validation when course title is empty.',
  },
  createNewCourseOption: {
    message: 'Créer un nouveau cours avec cette session',
    context: 'Deprecated — sessions no longer create courses. Kept for locale compatibility.',
  },
  monitoringTitle: {
    message: 'Suivi',
    context: 'Admin navigation label for monitoring / reports.',
  },
  signInEyebrow: {
    message: 'Campus Action Éducation Guinée',
    context: 'Small uppercase label above the headline on the AE sign-in page.',
  },
  signInHeroTitle: {
    message: 'Apprendre aujourd’hui, agir demain.',
    context: 'Main headline on the AE sign-in page.',
  },
  signInHeroBody: {
    message: 'Des ressources pour apprendre, progresser et développer vos compétences.',
    context: 'Sentence under the headline on the AE sign-in page.',
  },
  signInFeaturesLabel: {
    message: 'Ce que propose la plateforme',
    context: 'Accessible label for the list of platform features on the AE sign-in page.',
  },
  signInFeatureCourses: {
    message: 'Cours et vidéos',
    context: 'Feature item on the AE sign-in page.',
  },
  signInFeatureQuizzes: {
    message: 'Quiz interactifs',
    context: 'Feature item on the AE sign-in page.',
  },
  signInFeatureProgress: {
    message: 'Suivi des progrès',
    context: 'Feature item on the AE sign-in page.',
  },
  signInCardTitle: {
    message: 'Bienvenue sur AE Apprendre',
    context: 'Title of the sign-in card on the AE sign-in page.',
  },
  signInCardSubtitle: {
    message: 'Connectez-vous pour poursuivre votre apprentissage.',
    context: 'Sentence under the sign-in card title.',
  },
  signInUsernamePlaceholder: {
    message: 'Saisissez votre nom d’utilisateur',
    context: 'Placeholder of the username field on the AE sign-in page.',
  },
  signInPasswordPlaceholder: {
    message: 'Saisissez votre mot de passe',
    context: 'Placeholder of the password field on the AE sign-in page.',
  },
  signInContinue: {
    message: 'Continuer',
    context: 'Button that validates the username before asking for the password.',
  },
  signInCreateAccount: {
    message: 'Créer un compte',
    context: 'Button to the Kolibri sign-up form, shown when the facility allows learner sign-up.',
  },
  signInExploreAsGuest: {
    message: 'Explorer sans compte',
    context: 'Link to browse as a guest, shown when the device allows guest access.',
  },
  signInCardFootnote: {
    message: 'Un espace pour apprendre à votre rythme.',
    context: 'Small sentence at the bottom of the sign-in card.',
  },
  signInChangeUser: {
    message: 'Changer d’utilisateur',
    context: 'Link on the password step to go back and enter another username.',
  },
  signInShowPassword: {
    message: 'Afficher le mot de passe',
    context: 'Accessible label of the button that reveals the password.',
  },
  signInHidePassword: {
    message: 'Masquer le mot de passe',
    context: 'Accessible label of the button that hides the password.',
  },
  signInForgotPassword: {
    message: 'Mot de passe oublié ?',
    context: 'Link text for password recovery hint on AE sign-in.',
  },
  signInForgotPasswordHint: {
    message:
      'Sur ce serveur local, contactez votre administrateur pour réinitialiser votre mot de passe.',
    context: 'Shown when the user clicks forgot password on offline AE.',
  },
  signInUsernameRequired: {
    message: 'Saisissez votre nom d’utilisateur.',
    context: 'Error when the username field is empty.',
  },
  signInPasswordRequired: {
    message: 'Saisissez votre mot de passe.',
    context: 'Error when the password field is empty.',
  },
  signInUsernameNotFound: {
    message: 'Nom d’utilisateur introuvable. Vérifiez l’orthographe ou demandez à votre formateur.',
    context: 'Error when the username does not exist on this device.',
  },
  signInPasswordIncorrect: {
    message: 'Mot de passe incorrect. Réessayez.',
    context: 'Error when the password does not match the username.',
  },
  signInUnexpectedError: {
    message: 'La connexion a échoué. Réessayez dans un instant.',
    context: 'Error when sign-in fails for a reason other than wrong credentials.',
  },
  signInHelp: {
    message: 'Aide',
    context: 'Header button that opens sign-in help on the AE sign-in page.',
  },
  signInHelpTitle: {
    message: 'Besoin d’aide ?',
    context: 'Title of the sign-in help dialog.',
  },
  signInHelpUsername: {
    message:
      'Votre nom d’utilisateur vous est remis par votre formateur ou par l’administrateur de votre centre.',
    context: 'Sign-in help dialog: where the username comes from.',
  },
  signInChangeLanguage: {
    message: 'Changer de langue',
    context: 'Accessible label of the language button in the AE sign-in header.',
  },
  footerOrgName: {
    message: 'Action Éducation Guinée',
    context: 'Organization name in the AE page footers.',
  },
  footerPoweredBy: {
    message: 'Propulsé par Kolibri',
    context: 'Footer credit on AE pages.',
  },
  spaceHeadingLearner: {
    message: 'Espace apprenant',
    context: 'Small uppercase heading at the top of the learner sidebar.',
  },
  spaceHeadingCoach: {
    message: 'Espace formateur',
    context: 'Small uppercase heading at the top of the trainer sidebar.',
  },
  spaceHeadingAdmin: {
    message: 'Espace administration',
    context: 'Small uppercase heading at the top of the admin sidebar.',
  },
  adminSidebarTagline: {
    message: 'Apprendre. Partager. Progresser.',
    context: 'Tagline next to the illustration at the bottom of the admin sidebar.',
  },
  accountMenuLabel: {
    message: 'Menu du compte',
    context: 'Accessible label of the account button in the AE header.',
  },
  signOut: {
    message: 'Se déconnecter',
    context: 'Account menu item that signs the user out.',
  },
  dashboardTitle: {
    message: 'Tableau de bord',
    context: 'Title of the admin dashboard page and its navigation item.',
  },
  adminWelcomeTitle: {
    message: 'Bienvenue dans votre espace admin',
    context: 'Headline of the welcome banner on the admin dashboard.',
  },
  adminWelcomeSubtitle: {
    message: 'Gérez vos équipes, vos formations et les apprentissages.',
    context: 'Sentence under the admin dashboard welcome headline.',
  },
  dashUsersBreakdown: {
    message:
      '{learners, plural, one {# apprenant} other {# apprenants}} · {coaches, plural, one {# formateur} other {# formateurs}}',
    context: 'Detail under the users count on the admin dashboard.',
  },
  activityTypeUser: {
    message: 'Utilisateur',
    context: 'Type label of a user in the admin recent activity list.',
  },
  activityTypeGroup: {
    message: 'Groupe',
    context: 'Type label of a group or class in the admin recent activity list.',
  },
  activityTypeTraining: {
    message: 'Formation',
    context: 'Type label of a training in the admin recent activity list.',
  },
  breadcrumbAdmin: {
    message: 'Administration',
    context: 'First breadcrumb item of the admin pages, links to the dashboard.',
  },
  breadcrumbLabel: {
    message: 'Fil d’Ariane',
    context: 'Accessible label of the breadcrumb navigation.',
  },
  usersAccountsCount: {
    message: '{count, plural, one {# compte} other {# comptes}}',
    context: 'Pill next to the admin users page title.',
  },
  usersSubtitle: {
    message: 'Retrouvez et gérez les comptes de votre plateforme.',
    context: 'Sentence under the admin users page title.',
  },
  usersBannerTitle: {
    message: 'Un espace pour chaque apprenant',
    context: 'Title of the banner on the admin users page.',
  },
  usersBannerSubtitle: {
    message: 'Accompagnez vos équipes et facilitez l’accès aux formations.',
    context: 'Sentence in the banner on the admin users page.',
  },
  usersSearchLabel: {
    message: 'Rechercher un utilisateur',
    context: 'Accessible label of the search field on the admin users page.',
  },
  usersSearchPlaceholder: {
    message: 'Rechercher un nom ou un identifiant…',
    context: 'Placeholder of the search field on the admin users page.',
  },
  sortLabel: {
    message: 'Trier :',
    context: 'Label before the sort selector.',
  },
  sortByName: {
    message: 'Nom',
    context: 'Sort option: by full name.',
  },
  sortByUsername: {
    message: 'Identifiant',
    context: 'Sort option: by username.',
  },
  sortByNewest: {
    message: 'Plus récents',
    context: 'Sort option: newest accounts first.',
  },
  columnFullName: {
    message: 'Nom complet',
    context: 'Users table column header.',
  },
  columnActions: {
    message: 'Actions',
    context: 'Users table column header.',
  },
  viewProfile: {
    message: 'Voir le profil',
    context: 'Button opening a user profile in Kolibri facility management.',
  },
  viewProfileOf: {
    message: 'Voir le profil de {name}',
    context: 'Accessible label of the view profile button for one user.',
  },
  moreActionsFor: {
    message: 'Autres actions pour {name}',
    context: 'Accessible label of the more actions menu button for one user.',
  },
  editAccount: {
    message: 'Modifier le compte',
    context: 'Menu item opening the user edit page in Kolibri facility management.',
  },
  manageAllAccounts: {
    message: 'Gérer tous les comptes',
    context: 'Menu item opening Kolibri facility user management (password reset, deletion, etc.).',
  },
  usersTotal: {
    message: '{count, plural, one {# utilisateur} other {# utilisateurs}}',
    context: 'Count at the bottom of the users table.',
  },
  pageRange: {
    message: '{start}–{end} sur {total}',
    context: 'Pagination summary, e.g. 1–8 sur 20.',
  },
  previousPage: {
    message: 'Page précédente',
    context: 'Pagination button.',
  },
  nextPage: {
    message: 'Page suivante',
    context: 'Pagination button.',
  },
  usersNoMatch: {
    message: 'Aucun utilisateur ne correspond à votre recherche.',
    context: 'Shown when the search matches no user.',
  },
  groupsCount: {
    message: '{count, plural, one {# groupe} other {# groupes}}',
    context: 'Pill next to the admin groups page title, and total under its table.',
  },
  groupsSubtitle: {
    message: 'Organisez vos apprenants en groupes et en classes.',
    context: 'Sentence under the admin groups page title.',
  },
  groupsBannerTitle: {
    message: 'Des groupes pour avancer ensemble',
    context: 'Title of the banner on the admin groups page.',
  },
  groupsBannerSubtitle: {
    message: 'Réunissez vos apprenants et confiez chaque groupe à un formateur.',
    context: 'Sentence in the banner on the admin groups page.',
  },
  groupsSearchLabel: {
    message: 'Rechercher un groupe',
    context: 'Accessible label of the search field on the admin groups page.',
  },
  groupsSearchPlaceholder: {
    message: 'Rechercher un groupe ou un formateur…',
    context: 'Placeholder of the search field on the admin groups page.',
  },
  columnGroupName: {
    message: 'Nom du groupe',
    context: 'Groups table column header.',
  },
  columnLearners: {
    message: 'Apprenants',
    context: 'Table column header: number of learners.',
  },
  sortByLearners: {
    message: 'Nombre d’apprenants',
    context: 'Sort option: most learners first.',
  },
  viewGroup: {
    message: 'Voir le groupe',
    context: 'Button opening a group in Kolibri facility management.',
  },
  viewGroupOf: {
    message: 'Voir le groupe {name}',
    context: 'Accessible label of the view group button for one group.',
  },
  editGroup: {
    message: 'Modifier le groupe',
    context: 'Menu item opening the group page in Kolibri facility management.',
  },
  manageAllGroups: {
    message: 'Gérer tous les groupes',
    context: 'Menu item opening Kolibri facility class management.',
  },
  groupsEmpty: {
    message: 'Aucun groupe pour le moment.',
    context: 'Shown when the facility has no class yet.',
  },
  groupsNoMatch: {
    message: 'Aucun groupe ne correspond à votre recherche.',
    context: 'Shown when the search matches no group.',
  },
  noCoachAssigned: {
    message: 'Aucun formateur',
    context: 'Groups table: the class has no coach.',
  },
  channelsCount: {
    message: '{count, plural, one {# canal} other {# canaux}}',
    context: 'Pill next to the admin content page title, and total under its table.',
  },
  contentSubtitle: {
    message: 'Parcourez les canaux disponibles hors ligne sur ce serveur.',
    context: 'Sentence under the admin content page title.',
  },
  importContentAction: {
    message: 'Importer des contenus',
    context: 'Main button of the admin content page, opens Kolibri content import.',
  },
  contentBannerTitle: {
    message: 'Des contenus disponibles sans Internet',
    context: 'Title of the banner on the admin content page.',
  },
  contentBannerSubtitle: {
    message: 'Importez des canaux depuis Internet, un appareil du réseau ou une clé USB.',
    context: 'Sentence in the banner on the admin content page.',
  },
  channelsSearchLabel: {
    message: 'Rechercher un canal',
    context: 'Accessible label of the search field on the admin content page.',
  },
  channelsSearchPlaceholder: {
    message: 'Rechercher un canal…',
    context: 'Placeholder of the search field on the admin content page.',
  },
  columnChannel: {
    message: 'Canal',
    context: 'Channels table column header.',
  },
  columnLanguage: {
    message: 'Langue',
    context: 'Channels table column header.',
  },
  columnResources: {
    message: 'Ressources',
    context: 'Channels table column header: number of resources.',
  },
  columnSize: {
    message: 'Taille',
    context: 'Channels table column header: size on disk.',
  },
  sortByResources: {
    message: 'Nombre de ressources',
    context: 'Sort option: most resources first.',
  },
  browseChannel: {
    message: 'Parcourir',
    context: 'Button opening a channel in the Kolibri library.',
  },
  browseChannelOf: {
    message: 'Parcourir {name}',
    context: 'Accessible label of the browse button for one channel.',
  },
  manageOnDevice: {
    message: 'Gérer sur l’appareil',
    context: 'Menu item opening the channel in Kolibri device management.',
  },
  channelsEmpty: {
    message: 'Aucun canal n’est encore installé sur ce serveur.',
    context: 'Shown when no channel is available.',
  },
  channelsNoMatch: {
    message: 'Aucun canal ne correspond à votre recherche.',
    context: 'Shown when the search matches no channel.',
  },
  coachesCount: {
    message: '{count, plural, one {# formateur} other {# formateurs}}',
    context: 'Pill next to the admin trainers page title, and total under its table.',
  },
  coachesSubtitle: {
    message: 'Retrouvez l’équipe qui anime les formations.',
    context: 'Sentence under the admin trainers page title.',
  },
  addCoachAction: {
    message: 'Ajouter un formateur',
    context: 'Main button of the admin trainers page, opens the Kolibri new user form.',
  },
  coachesBannerTitle: {
    message: 'Une équipe pour guider chaque groupe',
    context: 'Title of the banner on the admin trainers page.',
  },
  coachesBannerSubtitle: {
    message: 'Voyez qui encadre quels groupes et accompagnez vos formateurs.',
    context: 'Sentence in the banner on the admin trainers page.',
  },
  coachesSearchLabel: {
    message: 'Rechercher un formateur',
    context: 'Accessible label of the search field on the admin trainers page.',
  },
  columnRole: {
    message: 'Rôle',
    context: 'Table column header: role of the account.',
  },
  columnGroups: {
    message: 'Groupes',
    context: 'Table column header: number of groups the trainer coaches.',
  },
  sortByGroups: {
    message: 'Nombre de groupes',
    context: 'Sort option: trainers with most groups first.',
  },
  coachesEmpty: {
    message: 'Aucun formateur pour le moment.',
    context: 'Shown when the facility has no trainer yet.',
  },
  coachesNoMatch: {
    message: 'Aucun formateur ne correspond à votre recherche.',
    context: 'Shown when the search matches no trainer.',
  },
  issueCertificateIntro: {
    message: 'Attribuez un certificat à un apprenant qui a terminé une formation.',
    context: 'Sentence under the issue certificate title on the admin monitoring page.',
  },
  attendanceIntro: {
    message: 'Téléchargez la feuille de présence de chaque session.',
    context: 'Sentence under the attendance title on the admin monitoring page.',
  },
  downloadAttendanceOf: {
    message: 'Télécharger les présences : {name}',
    context: 'Accessible label of the download button for one session.',
  },
  settingsPlatformTitle: {
    message: 'Plateforme',
    context: 'Title of the platform card on the admin settings page.',
  },
  settingsDeviceTitle: {
    message: 'Appareil',
    context: 'Title of the device card on the admin settings page.',
  },
  platformNameLabel: {
    message: 'Nom de la plateforme',
    context: 'Label in the platform card of the admin settings page.',
  },
  organizationLabel: {
    message: 'Organisation',
    context: 'Label in the platform card of the admin settings page.',
  },
  facilitySettingsAction: {
    message: 'Paramètres de l’établissement',
    context: 'Button opening Kolibri facility settings.',
  },
  sessionsCount: {
    message: '{count, plural, one {# session} other {# sessions}}',
    context: 'Total under the attendance list on the admin monitoring page.',
  },
  csvFileLabel: {
    message: 'CSV',
    context: 'Short label of a CSV download button (file format name).',
  },
  createUserTitle: {
    message: 'Créer un utilisateur',
    context: 'Title of the create user side panel.',
  },
  createUserSubtitle: {
    message: 'Ajoutez un compte à votre plateforme.',
    context: 'Sentence under the create user panel title.',
  },
  accountInfoSection: {
    message: 'Informations du compte',
    context: 'Section title in the create user panel.',
  },
  extraInfoSection: {
    message: 'Informations complémentaires',
    context: 'Section title in the create user panel.',
  },
  assignmentSection: {
    message: 'Affectation',
    context: 'Section title in the create user panel (class enrollment).',
  },
  fullNameLabel: {
    message: 'Nom complet',
    context: 'Field label in the create user panel.',
  },
  fullNamePlaceholder: {
    message: 'Prénom et nom',
    context: 'Placeholder of the full name field.',
  },
  usernamePlaceholder: {
    message: 'Choisir un nom d’utilisateur',
    context: 'Placeholder of the username field in the create user panel.',
  },
  newPasswordPlaceholder: {
    message: 'Saisir un mot de passe',
    context: 'Placeholder of the password field in the create user panel.',
  },
  confirmPasswordLabel: {
    message: 'Confirmer le mot de passe',
    context: 'Field label and placeholder in the create user panel.',
  },
  userTypeLabel: {
    message: 'Type d’utilisateur',
    context: 'Field label in the create user panel.',
  },
  identifierLabel: {
    message: 'Identifiant (optionnel)',
    context: 'Field label in the create user panel (Kolibri id_number).',
  },
  identifierPlaceholder: {
    message: 'Saisir un identifiant',
    context: 'Placeholder of the identifier field.',
  },
  birthYearLabel: {
    message: 'Année de naissance',
    context: 'Field label in the create user panel.',
  },
  genderLabel: {
    message: 'Sexe',
    context: 'Field label in the create user panel.',
  },
  notSpecifiedOption: {
    message: 'Non spécifié',
    context: 'Option for birth year or gender when the user prefers not to say.',
  },
  genderFemale: {
    message: 'Féminin',
    context: 'Gender option.',
  },
  genderMale: {
    message: 'Masculin',
    context: 'Gender option.',
  },
  enrollInClassLabel: {
    message: 'Inscrire dans une classe',
    context: 'Field label in the create user panel.',
  },
  selectClassPlaceholder: {
    message: 'Sélectionner une classe',
    context: 'Empty option of the class selector: no enrollment.',
  },
  saveAndAddAnother: {
    message: 'Enregistrer et ajouter un nouveau',
    context: 'Create user panel button: save, then clear the form for another user.',
  },
  saveAndClose: {
    message: 'Enregistrer et fermer',
    context: 'Create user panel button: save, then close the panel.',
  },
  fieldRequired: {
    message: 'Ce champ est obligatoire.',
    context: 'Form error for an empty required field.',
  },
  usernameInvalid: {
    message: 'Utilisez uniquement des lettres, des chiffres et le tiret bas (_).',
    context: 'Form error when the username has spaces or punctuation.',
  },
  passwordMismatch: {
    message: 'Les mots de passe ne correspondent pas.',
    context: 'Form error when password and confirmation differ.',
  },
  createUserError: {
    message: 'Impossible de créer le compte. Réessayez.',
    context: 'Error when the account could not be created.',
  },
  assignmentError: {
    message:
      'Le compte a été créé, mais son rôle ou son inscription dans la classe n’a pas pu être enregistré.',
    context: 'Error when the account exists but its role or class enrollment failed.',
  },
  userCreated: {
    message: 'Compte créé : {name}',
    context: 'Confirmation after creating a user.',
  },
  addCoachTitle: {
    message: 'Ajouter un formateur',
    context: 'Title of the create user panel when opened for a trainer.',
  },
  addCoachSubtitle: {
    message: 'Ajoutez un formateur à votre équipe.',
    context: 'Sentence under the add trainer panel title.',
  },
  assignToClassLabel: {
    message: 'Affecter à une classe',
    context: 'Class selector label in the create user panel for trainers and admins.',
  },
  createGroupTitle: {
    message: 'Créer un groupe',
    context: 'Title of the create group panel.',
  },
  createGroupSubtitle: {
    message: 'Réunissez des apprenants et confiez-les à un formateur.',
    context: 'Sentence under the create group panel title.',
  },
  groupInfoSection: {
    message: 'Informations du groupe',
    context: 'Section title in the create group panel.',
  },
  groupNamePlaceholder: {
    message: 'Par exemple : Classe de citoyenneté 2026',
    context: 'Placeholder of the group name field.',
  },
  groupNameTaken: {
    message: 'Un groupe porte déjà ce nom.',
    context: 'Form error when a class with the same name exists.',
  },
  groupCoachesSection: {
    message: 'Formateurs du groupe',
    context: 'Section title in the create group panel.',
  },
  groupLearnersSection: {
    message: 'Apprenants du groupe',
    context: 'Section title in the create group panel.',
  },
  searchLearnersLabel: {
    message: 'Rechercher un apprenant',
    context: 'Accessible label and placeholder of the learner search in the create group panel.',
  },
  selectedCount: {
    message: '{count, plural, =0 {Aucune sélection} one {# sélectionné} other {# sélectionnés}}',
    context: 'Number of people checked in a list.',
  },
  noCoachesAvailable: {
    message: 'Aucun formateur n’est encore enregistré.',
    context: 'Shown in the create group panel when there is no trainer.',
  },
  noLearnersAvailable: {
    message: 'Aucun apprenant ne correspond.',
    context: 'Shown in the create group panel when no learner matches.',
  },
  saveAndCreateAnother: {
    message: 'Enregistrer et créer un autre',
    context: 'Create group panel button: save, then clear the form for another group.',
  },
  createGroupError: {
    message: 'Impossible de créer le groupe. Réessayez.',
    context: 'Error when the class could not be created.',
  },
  groupMembersError: {
    message: 'Le groupe a été créé, mais ses formateurs ou apprenants n’ont pas pu être ajoutés.',
    context: 'Error when the class exists but coach roles or memberships failed.',
  },
  groupCreated: {
    message: 'Groupe créé : {name}',
    context: 'Confirmation after creating a group.',
  },
  seeAllAction: {
    message: 'Tout voir',
    context: 'Link to the full list from a dashboard panel.',
  },
  previewSpacesLabel: {
    message: 'Prévisualisation',
    context: 'Discrete superuser-only preview section label.',
  },
  previewLearnerSpace: {
    message: 'Prévisualiser l’espace apprenant',
    context: 'Superuser discrete link to learner space.',
  },
  previewCoachSpace: {
    message: 'Prévisualiser l’espace formateur',
    context: 'Superuser discrete link to coach space.',
  },
  previewAdminSpace: {
    message: 'Prévisualiser l’espace administrateur',
    context: 'Superuser discrete link to admin space.',
  },
  // Trainer space (same design as the admin space).
  coachWelcomeTitle: {
    message: 'Bienvenue dans votre espace formateur',
    context: 'Welcome banner title on the trainer dashboard.',
  },
  coachWelcomeSubtitle: {
    message: 'Préparez vos cours, animez vos sessions et suivez vos apprenants.',
    context: 'Welcome banner sentence on the trainer dashboard.',
  },
  upcomingSessionsCount: {
    message: '{count, plural, =0 {Aucune à venir} one {# à venir} other {# à venir}}',
    context: 'Detail under the number of sessions on the trainer dashboard.',
  },
  upcomingSessionsTitle: {
    message: 'Prochaines sessions',
    context: 'Trainer dashboard panel listing the next sessions.',
  },
  recentSessionsTitle: {
    message: 'Sessions récentes',
    context: 'Trainer dashboard panel listing the last sessions when none is upcoming.',
  },
  upcomingSessionsEmpty: {
    message: 'Aucune session prévue pour le moment.',
    context: 'Shown when the trainer has no upcoming session.',
  },
  coachQuickCreateCourse: {
    message: 'Créer un cours',
    context: 'Trainer dashboard quick action.',
  },
  coachQuickResults: {
    message: 'Voir les résultats',
    context: 'Trainer dashboard quick action.',
  },
  coachOpenLibrary: {
    message: 'Parcourir la bibliothèque',
    context: 'Link under the quick actions of the trainer dashboard.',
  },
  classesCount: {
    message: '{count, plural, one {# classe} other {# classes}}',
    context: 'Number of classes.',
  },
  coachClassesBannerTitle: {
    message: 'Vos classes en un coup d’œil',
    context: 'Banner title of the trainer classes page.',
  },
  coachClassesBannerSubtitle: {
    message: 'Retrouvez vos élèves classe par classe et ajoutez-en si besoin.',
    context: 'Banner sentence of the trainer classes page.',
  },
  classesSearchLabel: {
    message: 'Rechercher une classe',
    context: 'Accessible label of the class search field.',
  },
  classesSearchPlaceholder: {
    message: 'Rechercher une classe…',
    context: 'Placeholder of the class search field.',
  },
  coachClassesNoMatch: {
    message: 'Aucune classe ne correspond à votre recherche.',
    context: 'Shown when the class search finds nothing.',
  },
  viewLearnersAction: {
    message: 'Voir les élèves',
    context: 'Button of a class row opening its learners.',
  },
  viewLearnersOf: {
    message: 'Voir les élèves de {name}',
    context: 'Accessible name of the button opening the learners of a class.',
  },
  addLearnerToClassOf: {
    message: 'Ajouter un élève dans {name}',
    context: 'Menu item of a class row.',
  },
  createClassSubtitle: {
    message: 'Donnez un nom à votre nouvelle classe.',
    context: 'Sentence under the new class panel title.',
  },
  classCreated: {
    message: 'Classe créée : {name}',
    context: 'Confirmation after creating a class.',
  },
  learnersCount: {
    message: '{count, plural, one {# élève} other {# élèves}}',
    context: 'Number of learners.',
  },
  coachLearnersBannerTitle: {
    message: 'Vos élèves, classe par classe',
    context: 'Banner title of the trainer learners page.',
  },
  coachLearnersBannerSubtitle: {
    message: 'Choisissez une classe pour voir ses élèves et suivre leurs résultats.',
    context: 'Banner sentence of the trainer learners page.',
  },
  learnersSearchLabel: {
    message: 'Rechercher un élève',
    context: 'Accessible label of the learner search field.',
  },
  learnersNoMatch: {
    message: 'Aucun élève ne correspond à votre recherche.',
    context: 'Shown when the learner search finds nothing.',
  },
  classLearnersEmpty: {
    message: 'Cette classe n’a encore aucun élève.',
    context: 'Shown when the chosen class has no learner.',
  },
  viewResultsOf: {
    message: 'Voir les résultats de {name}',
    context: 'Accessible name of the button opening the results of a learner.',
  },
  addLearnerSubtitle: {
    message: 'Créez le compte d’un élève et inscrivez-le dans une classe.',
    context: 'Sentence under the add learner panel title.',
  },
  learnerCreated: {
    message: 'Élève ajouté : {name}',
    context: 'Confirmation after adding a learner.',
  },
  coursesCount: {
    message: '{count, plural, one {# cours} other {# cours}}',
    context: 'Number of courses.',
  },
  coursesBannerTitle: {
    message: 'Vos cours, disponibles hors ligne',
    context: 'Banner title of the trainer courses page.',
  },
  coursesBannerSubtitle: {
    message: 'Déposez vos supports : les apprenants les téléchargent depuis leur espace.',
    context: 'Banner sentence of the trainer courses page.',
  },
  coursesSearchLabel: {
    message: 'Rechercher un cours',
    context: 'Accessible label of the course search field.',
  },
  coursesSearchPlaceholder: {
    message: 'Rechercher un cours…',
    context: 'Placeholder of the course search field.',
  },
  coursesNoMatch: {
    message: 'Aucun cours ne correspond à votre recherche.',
    context: 'Shown when the course search finds nothing.',
  },
  columnCourse: {
    message: 'Cours',
    context: 'Table column header: course name.',
  },
  columnFiles: {
    message: 'Fichiers',
    context: 'Table column header: number of files of a course.',
  },
  sortByFiles: {
    message: 'Nombre de fichiers',
    context: 'Sort option.',
  },
  openCourseAction: {
    message: 'Ouvrir',
    context: 'Button of a course row opening the course.',
  },
  openCourseOf: {
    message: 'Ouvrir le cours {name}',
    context: 'Accessible name of the button opening a course.',
  },
  createCourseSubtitle: {
    message: 'Donnez un titre à votre cours : vous ajouterez les fichiers ensuite.',
    context: 'Sentence under the new course panel title.',
  },
  filesCount: {
    message: '{count, plural, one {# fichier} other {# fichiers}}',
    context: 'Number of files of a course.',
  },
  filesSearchLabel: {
    message: 'Rechercher un fichier',
    context: 'Accessible label of the file search field.',
  },
  filesSearchPlaceholder: {
    message: 'Rechercher un fichier…',
    context: 'Placeholder of the file search field.',
  },
  filesNoMatch: {
    message: 'Aucun fichier ne correspond à votre recherche.',
    context: 'Shown when the file search finds nothing.',
  },
  columnFile: {
    message: 'Fichier',
    context: 'Table column header: file name.',
  },
  columnAdded: {
    message: 'Ajouté le',
    context: 'Table column header: date a file was added.',
  },
  addResourceSubtitle: {
    message: 'Les apprenants pourront le télécharger depuis le cours.',
    context: 'Sentence under the add file panel title.',
  },
  chooseFileAction: {
    message: 'Choisir un fichier',
    context: 'Button opening the file picker.',
  },
  noFileChosen: {
    message: 'Aucun fichier choisi',
    context: 'Shown next to the file picker before a file is chosen.',
  },
  resourceAdded: {
    message: 'Fichier ajouté : {name}',
    context: 'Confirmation after uploading a file.',
  },
  resourceDeleted: {
    message: 'Fichier supprimé : {name}',
    context: 'Confirmation after deleting a file.',
  },
  downloadResourceOf: {
    message: 'Télécharger {name}',
    context: 'Accessible name of the download button of a file.',
  },
  deleteResourceOf: {
    message: 'Supprimer {name}',
    context: 'Accessible name of the delete button of a file.',
  },
  deleteResourceTitle: {
    message: 'Supprimer le fichier',
    context: 'Title of the confirmation before deleting a course file.',
  },
  deleteResourceConfirm: {
    message: 'Supprimer « {name} » ? Les apprenants ne pourront plus le télécharger.',
    context: 'Confirmation before deleting a course file.',
  },
  sessionsBannerTitle: {
    message: 'Des sessions en présentiel, suivies hors ligne',
    context: 'Banner title of the trainer sessions page.',
  },
  sessionsBannerSubtitle: {
    message: 'Planifiez vos sessions puis prenez les présences, même sans Internet.',
    context: 'Banner sentence of the trainer sessions page.',
  },
  sessionsSearchLabel: {
    message: 'Rechercher une session',
    context: 'Accessible label of the session search field.',
  },
  sessionsSearchPlaceholder: {
    message: 'Rechercher un cours ou un lieu…',
    context: 'Placeholder of the session search field.',
  },
  sessionsNoMatch: {
    message: 'Aucune session ne correspond à votre recherche.',
    context: 'Shown when the session search finds nothing.',
  },
  columnWhen: {
    message: 'Date et heure',
    context: 'Table column header: date and time of a session.',
  },
  sortByDate: {
    message: 'Date',
    context: 'Sort option.',
  },
  sortByCourse: {
    message: 'Cours',
    context: 'Sort option.',
  },
  openSessionOf: {
    message: 'Ouvrir la session {name}',
    context: 'Accessible name of the button opening a session.',
  },
  createSessionSubtitle: {
    message: 'Choisissez le cours, le lieu, la date et l’heure.',
    context: 'Sentence under the new session panel title.',
  },
  sessionCreated: {
    message: 'Session créée.',
    context: 'Confirmation after creating a session.',
  },
  participantsCount: {
    message: '{count, plural, one {# inscrit} other {# inscrits}}',
    context: 'Number of learners enrolled in a session.',
  },
  enrollLearnersTitle: {
    message: 'Inscrire des apprenants',
    context: 'Button and panel title to enroll learners in a session.',
  },
  enrollLearnersSubtitle: {
    message: 'Cochez les apprenants à inscrire à cette session.',
    context: 'Sentence under the enroll learners panel title.',
  },
  allLearnersEnrolled: {
    message: 'Tous les apprenants sont déjà inscrits.',
    context: 'Shown in the enroll panel when nobody is left to enroll.',
  },
  learnersEnrolled: {
    message: '{count, plural, one {# apprenant inscrit} other {# apprenants inscrits}}',
    context: 'Confirmation after enrolling learners.',
  },
  sessionNoParticipants: {
    message: 'Aucun apprenant n’est encore inscrit. Utilisez « Inscrire des apprenants ».',
    context: 'Shown on a session without enrolled learners.',
  },
  columnAttendance: {
    message: 'Présence',
    context: 'Table column header: attendance buttons of a learner.',
  },
  attendanceCsvAction: {
    message: 'Télécharger les présences',
    context: 'Button downloading the attendance sheet of a session.',
  },
  markAttendanceOf: {
    message: 'Présence de {name}',
    context: 'Accessible name of the attendance buttons of a learner.',
  },
  summaryPresent: {
    message: '{count, plural, one {présent} other {présents}}',
    context: 'Attendance summary of a session, after the number.',
  },
  summaryAbsent: {
    message: '{count, plural, one {absent} other {absents}}',
    context: 'Attendance summary of a session, after the number.',
  },
  summaryLate: {
    message: '{count, plural, one {en retard} other {en retard}}',
    context: 'Attendance summary of a session, after the number.',
  },
  summaryExcused: {
    message: '{count, plural, one {excusé} other {excusés}}',
    context: 'Attendance summary of a session, after the number.',
  },
  summaryNotRecorded: {
    message: '{count, plural, one {non saisi} other {non saisis}}',
    context: 'Attendance summary of a session: learners without attendance yet.',
  },
  resultsCount: {
    message: '{count, plural, one {# résultat} other {# résultats}}',
    context: 'Number of result rows.',
  },
  sortByActivity: {
    message: 'Activité récente',
    context: 'Sort option.',
  },
  libraryBannerTitle: {
    message: 'Des ressources prêtes à l’emploi',
    context: 'Banner title of the trainer library page.',
  },
  libraryBannerSubtitle: {
    message: 'Ouvrez un canal pour préparer vos cours ou le montrer en session.',
    context: 'Banner sentence of the trainer library page.',
  },
  // "Créer un cours" in 3 steps.
  courseWizardSubtitle: {
    message: 'Présentez votre cours, puis ajoutez vos supports.',
    context: 'Sentence under the title of the create course window.',
  },
  stepInformations: {
    message: 'Informations',
    context: 'First step of the create course window.',
  },
  stepSupports: {
    message: 'Supports',
    context: 'Second step of the create course window: course files.',
  },
  stepReview: {
    message: 'Vérification',
    context: 'Last step of the create course window.',
  },
  stepOfTotal: {
    message: 'Étape {step} sur {total} : {name}',
    context: 'Accessible description of the current step.',
  },
  presentCourseTitle: {
    message: 'Présentez votre cours',
    context: 'Heading of the first step of the create course window.',
  },
  courseTitleLabel: {
    message: 'Titre du cours',
    context: 'Label of the course title field.',
  },
  courseDescriptionHint: {
    message: 'Expliquez ce que les apprenants vont apprendre.',
    context: 'Hint under the course description field.',
  },
  courseTitleTip: {
    message: 'Un titre clair et une description courte facilitent le choix du cours.',
    context: 'Tip on the first step of the create course window.',
  },
  addSupportsTitle: {
    message: 'Ajoutez vos supports',
    context: 'Heading of the second step of the create course window.',
  },
  addSupportsSubtitle: {
    message: 'Documents, présentations et vidéos.',
    context: 'Sentence under the heading of the second step.',
  },
  dropFilesHere: {
    message: 'Glissez vos fichiers ici',
    context: 'Drop zone of the create course window.',
  },
  dropFilesOr: {
    message: 'ou',
    context: 'Between "drop your files here" and the browse button.',
  },
  browseFilesAction: {
    message: 'Parcourir les fichiers',
    context: 'Button opening the file picker.',
  },
  fileReady: {
    message: 'Prêt',
    context: 'Status of a chosen file waiting for the course creation.',
  },
  removeFileOf: {
    message: 'Retirer {name}',
    context: 'Accessible name of the button removing a chosen file.',
  },
  fileTypeRejected: {
    message: '« {name} » : ce type de fichier n’est pas accepté.',
    context: 'Shown when a dropped file has a type courses cannot hold.',
  },
  supportsLaterHint: {
    message: 'Vous pourrez ajouter d’autres supports plus tard.',
    context: 'Hint at the bottom of the second step.',
  },
  continueWithoutSupports: {
    message: 'Continuer sans support',
    context: 'Link going to the last step without adding files.',
  },
  reviewCourseTitle: {
    message: 'Vérifiez votre cours',
    context: 'Heading of the last step of the create course window.',
  },
  reviewCourseSubtitle: {
    message: 'Voici un récapitulatif avant la création.',
    context: 'Sentence under the heading of the last step.',
  },
  courseInfoSection: {
    message: 'Informations du cours',
    context: 'Summary card title on the last step.',
  },
  supportsAddedCount: {
    message: 'Supports ajoutés · {count, number}',
    context: 'Summary card title on the last step, with the number of files.',
  },
  noSupportsAdded: {
    message: 'Aucun support pour le moment.',
    context: 'Summary when no file was chosen.',
  },
  editAction: {
    message: 'Modifier',
    context: 'Link going back to a step to change it.',
  },
  editSectionOf: {
    message: 'Modifier : {name}',
    context: 'Accessible name of a link going back to a step.',
  },
  readyToCreateHint: {
    message: 'Tout est prêt ? Créez le cours pour l’ajouter à votre espace.',
    context: 'Hint above the create course button.',
  },
  creatingCourse: {
    message: 'Création…',
    context: 'Create course button while the course and its files are saved.',
  },
  fileUploading: {
    message: 'Envoi…',
    context: 'Status of a course file while it uploads.',
  },
  fileUploaded: {
    message: 'Ajouté',
    context: 'Status of a course file once uploaded.',
  },
  fileFailed: {
    message: 'Échec',
    context: 'Status of a course file that could not be uploaded.',
  },
  courseCreated: {
    message: 'Cours créé : {name}',
    context: 'Confirmation after creating a course.',
  },
  courseFilesFailed: {
    message:
      '{count, plural, one {Le cours a été créé, mais # fichier n’a pas pu être ajouté.} other {Le cours a été créé, mais # fichiers n’ont pas pu être ajoutés.}}',
    context: 'Shown when the course exists but some of its files could not be uploaded.',
  },
  coursesTitle: {
    message: 'Cours',
    context: 'Title of the admin courses page and its menu item.',
  },
  adminCoursesSubtitle: {
    message:
      'Créez les cours, confiez chacun à un formateur et suivez la progression des apprenants.',
    context: 'Sentence under the admin courses page title.',
  },
  adminCoursesBannerTitle: {
    message: 'Les cours de votre centre',
    context: 'Banner title of the admin courses page.',
  },
  adminCoursesBannerSubtitle: {
    message: 'Chaque cours a un formateur : il y ajoute ses vidéos, fichiers et quiz.',
    context: 'Banner sentence of the admin courses page.',
  },
  adminCoursesEmpty: {
    message: 'Aucun cours pour le moment. Créez le premier et confiez-le à un formateur.',
    context: 'Empty state of the admin courses page.',
  },
  courseTrainerLabel: {
    message: 'Formateur',
    context: 'Label: the trainer a course is assigned to.',
  },
  chooseTrainerOption: {
    message: 'Choisir un formateur',
    context: 'First option of the trainer list of a course.',
  },
  trainerRequired: {
    message: 'Choisissez le formateur qui animera ce cours.',
    context: 'Error when a course has no trainer.',
  },
  noTrainerAssigned: {
    message: 'Aucun formateur',
    context: 'Shown when a course has no trainer yet.',
  },
  columnContent: {
    message: 'Contenu',
    context: 'Table column header: supports and quizzes of a course.',
  },
  columnProgress: {
    message: 'Progression',
    context: 'Table column header: progress.',
  },
  contentSummary: {
    message:
      '{files, plural, one {# support} other {# supports}} · {quizzes, plural, =0 {aucun quiz} one {# quiz} other {# quiz}}',
    context: 'Supports and quizzes of a course.',
  },
  progressOf: {
    message: 'Progression : {name}',
    context: 'Accessible name of a progress bar.',
  },
  statusPublished: {
    message: 'Publié',
    context: 'Status of a course or quiz visible to learners.',
  },
  statusDraft: {
    message: 'Brouillon',
    context: 'Status of a course or quiz hidden from learners.',
  },
  publishAction: {
    message: 'Publier',
    context: 'Makes a course or quiz visible to learners.',
  },
  unpublishAction: {
    message: 'Masquer',
    context: 'Hides a course or quiz from learners.',
  },
  coursePublished: {
    message: 'Le cours est visible par les apprenants.',
    context: 'Confirmation after publishing a course.',
  },
  courseUnpublished: {
    message: 'Le cours est masqué aux apprenants.',
    context: 'Confirmation after hiding a course.',
  },
  editCourseTitle: {
    message: 'Modifier le cours',
    context: 'Title of the course edit panel and its button.',
  },
  editCourseSubtitle: {
    message: 'Changez le titre, la description, le formateur ou la visibilité du cours.',
    context: 'Sentence under the course edit panel title.',
  },
  courseStatusHint: {
    message: 'Un brouillon n’est visible que par l’équipe du centre.',
    context: 'Hint under the course status field.',
  },
  saveChangesAction: {
    message: 'Enregistrer',
    context: 'Saves changes.',
  },
  courseSaved: {
    message: 'Cours enregistré.',
    context: 'Confirmation after saving a course.',
  },
  publishNowLabel: {
    message: 'Publier tout de suite (visible par les apprenants)',
    context: 'Checkbox of the course wizard.',
  },
  coachNoAssignedCourse: {
    message:
      'Aucun cours ne vous est encore confié. L’administrateur du centre crée les cours et vous les attribue.',
    context: 'Empty state of the trainer courses page.',
  },
  coachQuickMyCourses: {
    message: 'Mes cours',
    context: 'Trainer dashboard shortcut to their courses.',
  },
  courseSectionsLabel: {
    message: 'Sections du cours',
    context: 'Accessible name of the course tabs.',
  },
  tabEvaluations: {
    message: 'Quiz et examens',
    context: 'Course tab with the quizzes and the final exam.',
  },
  columnSupport: {
    message: 'Support',
    context: 'Table column header: course support.',
  },
  columnType: {
    message: 'Type',
    context: 'Table column header: type.',
  },
  columnEvaluation: {
    message: 'Évaluation',
    context: 'Table column header: quiz or exam.',
  },
  columnQuestions: {
    message: 'Questions',
    context: 'Table column header: number of questions.',
  },
  columnPassed: {
    message: 'Réussi par',
    context: 'Table column header: learners who passed a quiz.',
  },
  columnQuizzes: {
    message: 'Quiz réussis',
    context: 'Table column header: quizzes passed by a learner.',
  },
  columnExam: {
    message: 'Examen final',
    context: 'Table column header: final exam result.',
  },
  passedCountLabel: {
    message: '{count, plural, =0 {Personne} one {# apprenant} other {# apprenants}}',
    context: 'Learners who passed a quiz.',
  },
  sortByOrder: {
    message: 'Ordre du cours',
    context: 'Sort option: order of the course.',
  },
  sortByProgress: {
    message: 'Progression',
    context: 'Sort option: progress.',
  },
  sortByRecent: {
    message: 'Activité récente',
    context: 'Sort option: most recent activity first.',
  },
  sortByToDo: {
    message: 'À faire d’abord',
    context: 'Sort option: things to do first.',
  },
  noMatch: {
    message: 'Rien ne correspond à votre recherche.',
    context: 'Shown when a search finds nothing.',
  },
  quizzesCount: {
    message: '{count, plural, one {# évaluation} other {# évaluations}}',
    context: 'Number of quizzes and exams.',
  },
  quizzesSearchLabel: {
    message: 'Rechercher une évaluation',
    context: 'Accessible label of the quiz search field.',
  },
  courseLearnersEmpty: {
    message: 'Aucun apprenant n’a encore commencé ce cours.',
    context: 'Empty state of the course learners tab.',
  },
  enrollCourseSubtitle: {
    message: 'Les apprenants choisis verront ce cours dans leur espace.',
    context: 'Sentence under the enroll learners panel title.',
  },
  supportFilesMode: {
    message: 'Fichiers',
    context: 'Choice: add files to a course.',
  },
  supportLinkMode: {
    message: 'Lien web ou YouTube',
    context: 'Choice: add a web link to a course.',
  },
  sendFilesAction: {
    message: '{count, plural, =0 {Ajouter} one {Ajouter # fichier} other {Ajouter # fichiers}}',
    context: 'Button sending the chosen files.',
  },
  filesAdded: {
    message:
      '{count, plural, one {# fichier ajouté au cours.} other {# fichiers ajoutés au cours.}}',
    context: 'Confirmation after uploading files.',
  },
  addLinkAction: {
    message: 'Ajouter le lien',
    context: 'Button adding a web link to a course.',
  },
  linkUrlLabel: {
    message: 'Adresse du lien',
    context: 'Label of the web address field.',
  },
  linkUrlHint: {
    message: 'Une vidéo YouTube, un site ou un document en ligne (https://…).',
    context: 'Hint under the web address field.',
  },
  linkRequired: {
    message: 'Collez l’adresse du lien.',
    context: 'Error when the link is empty.',
  },
  linkInvalid: {
    message: 'Cette adresse n’est pas valide : elle doit commencer par https:// ou http://.',
    context: 'Error when the link is not a web address.',
  },
  linkAdded: {
    message: 'Lien ajouté au cours.',
    context: 'Confirmation after adding a link.',
  },
  youtubeDetected: {
    message: 'Vidéo YouTube reconnue : elle s’affichera dans le cours.',
    context: 'Shown when the link is a YouTube video.',
  },
  previewAction: {
    message: 'Voir',
    context: 'Button opening a support.',
  },
  previewOf: {
    message: 'Voir le support {name}',
    context: 'Accessible name of the button opening a support.',
  },
  deleteAction: {
    message: 'Supprimer',
    context: 'Deletes an item.',
  },
  deleteSupportTitle: {
    message: 'Supprimer ce support ?',
    context: 'Title of the delete support dialog.',
  },
  deleteSupportConfirm: {
    message: '« {name} » sera retiré du cours pour tous les apprenants.',
    context: 'Sentence of the delete support dialog.',
  },
  deleteQuizTitle: {
    message: 'Supprimer cette évaluation ?',
    context: 'Title of the delete quiz dialog.',
  },
  deleteQuizConfirm: {
    message: '« {name} » et les résultats des apprenants seront supprimés.',
    context: 'Sentence of the delete quiz dialog.',
  },
  quizDeleted: {
    message: 'Évaluation supprimée : {name}',
    context: 'Confirmation after deleting a quiz.',
  },
  quizPublished: {
    message: 'L’évaluation est visible par les apprenants.',
    context: 'Confirmation after publishing a quiz.',
  },
  quizUnpublished: {
    message: 'L’évaluation est masquée aux apprenants.',
    context: 'Confirmation after hiding a quiz.',
  },
  quizNeedsQuestions: {
    message: 'Ajoutez au moins une question avant de publier.',
    context: 'Error when publishing a quiz without questions.',
  },
  newQuizAction: {
    message: 'Nouvelle évaluation',
    context: 'Button creating a quiz or exam.',
  },
  kindVideo: {
    message: 'Vidéo',
    context: 'Type of support.',
  },
  kindAudio: {
    message: 'Audio',
    context: 'Type of support.',
  },
  kindImage: {
    message: 'Image',
    context: 'Type of support.',
  },
  kindPdf: {
    message: 'PDF',
    context: 'Type of support.',
  },
  kindYoutube: {
    message: 'Vidéo YouTube',
    context: 'Type of support.',
  },
  kindLink: {
    message: 'Lien web',
    context: 'Type of support.',
  },
  kindFile: {
    message: 'Fichier',
    context: 'Type of support.',
  },
  openOnYoutube: {
    message: 'Ouvrir sur YouTube',
    context: 'Opens a YouTube video in a new tab.',
  },
  openLinkAction: {
    message: 'Ouvrir le lien',
    context: 'Opens a web link in a new tab.',
  },
  mediaNotSupported: {
    message: 'Votre navigateur ne peut pas lire ce fichier : téléchargez-le.',
    context: 'Shown inside a player the browser cannot use.',
  },
  youtubeNeedsInternet: {
    message: 'Les vidéos YouTube ont besoin d’Internet.',
    context: 'Note under a YouTube player.',
  },
  downloadToOpen: {
    message: 'Téléchargez ce fichier pour l’ouvrir sur votre appareil.',
    context: 'Shown for files the browser cannot show.',
  },
  quizKindQuiz: {
    message: 'Mini-quiz',
    context: 'Kind of evaluation: short quiz.',
  },
  quizKindExam: {
    message: 'Examen final',
    context: 'Kind of evaluation: final exam of a course.',
  },
  quizEditorTitle: {
    message: 'Évaluation',
    context: 'Title of the quiz editor.',
  },
  quizEditorSubtitle: {
    message: 'Écrivez les questions, cochez les bonnes réponses, puis publiez.',
    context: 'Sentence under the quiz editor title.',
  },
  saveQuizAction: {
    message: 'Enregistrer',
    context: 'Saves a quiz.',
  },
  quizSaved: {
    message: 'Évaluation enregistrée.',
    context: 'Confirmation after saving a quiz.',
  },
  quizSettingsTitle: {
    message: 'Réglages',
    context: 'Heading of the quiz settings.',
  },
  quizTitleLabel: {
    message: 'Titre',
    context: 'Label of the quiz title field.',
  },
  quizTitleRequired: {
    message: 'Donnez un titre à l’évaluation.',
    context: 'Error when the quiz has no title.',
  },
  quizInstructionsLabel: {
    message: 'Consignes (facultatif)',
    context: 'Label of the quiz instructions field.',
  },
  passPercentLabel: {
    message: 'Score pour réussir (%)',
    context: 'Label of the pass score field.',
  },
  maxAttemptsLabel: {
    message: 'Tentatives',
    context: 'Label of the attempts field.',
  },
  maxAttemptsHint: {
    message: '0 = illimitées',
    context: 'Hint of the attempts field.',
  },
  showAnswersLabel: {
    message: 'Montrer la correction après l’envoi',
    context: 'Checkbox of the quiz settings.',
  },
  publishQuizLabel: {
    message: 'Publier (visible par les apprenants)',
    context: 'Checkbox of the quiz settings.',
  },
  publishNeedsQuestions: {
    message: 'Ajoutez une question pour pouvoir publier.',
    context: 'Hint when a quiz cannot be published yet.',
  },
  quizSummary: {
    message:
      '{count, plural, one {# question} other {# questions}} · {points, plural, one {# point} other {# points}}',
    context: 'Size of a quiz.',
  },
  questionsTitle: {
    message: '{count, plural, =0 {Questions} one {# question} other {# questions}}',
    context: 'Heading of the question list.',
  },
  noQuestionsYet: {
    message: 'Pas encore de question : ajoutez la première.',
    context: 'Empty state of the question list.',
  },
  questionSingle: {
    message: 'Une réponse',
    context: 'Kind of question: single answer.',
  },
  questionMultiple: {
    message: 'Plusieurs réponses',
    context: 'Kind of question: several answers.',
  },
  questionTrueFalse: {
    message: 'Vrai ou faux',
    context: 'Kind of question: true or false.',
  },
  trueLabel: {
    message: 'Vrai',
    context: 'Answer of a true or false question.',
  },
  falseLabel: {
    message: 'Faux',
    context: 'Answer of a true or false question.',
  },
  questionPromptOf: {
    message: 'Question {number}',
    context: 'Accessible name of a question field.',
  },
  questionPromptPlaceholder: {
    message: 'Écrivez la question…',
    context: 'Placeholder of a question field.',
  },
  questionPromptRequired: {
    message: 'Écrivez la question.',
    context: 'Error when a question is empty.',
  },
  pointsLabel: {
    message: 'Points',
    context: 'Label of the points field.',
  },
  pointsOf: {
    message: 'Points de la question {number}',
    context: 'Accessible name of a points field.',
  },
  answerTextOf: {
    message: 'Réponse {number}',
    context: 'Accessible name of an answer field.',
  },
  answerPlaceholder: {
    message: 'Réponse {number}',
    context: 'Placeholder of an answer field.',
  },
  answerTextRequired: {
    message: 'Écrivez chaque réponse.',
    context: 'Error when an answer is empty.',
  },
  addAnswerAction: {
    message: 'Ajouter une réponse',
    context: 'Adds an answer to a question.',
  },
  removeAnswerOf: {
    message: 'Retirer la réponse {number}',
    context: 'Removes an answer.',
  },
  rightAnswerOf: {
    message: 'Bonne réponse : réponse {number}',
    context: 'Marks an answer as right.',
  },
  rightAnswerHint: {
    message: 'Cochez la bonne réponse.',
    context: 'Hint of a single answer question.',
  },
  rightAnswersHint: {
    message: 'Cochez toutes les bonnes réponses.',
    context: 'Hint of a multiple answer question.',
  },
  oneRightAnswerRequired: {
    message: 'Cochez une bonne réponse.',
    context: 'Error when a question has no right answer.',
  },
  someRightAnswerRequired: {
    message: 'Cochez au moins une bonne réponse.',
    context: 'Error when a multiple question has no right answer.',
  },
  explanationLabel: {
    message: 'Explication (montrée avec la correction)',
    context: 'Label of the explanation field.',
  },
  moveUpOf: {
    message: 'Monter la question {number}',
    context: 'Moves a question up.',
  },
  moveDownOf: {
    message: 'Descendre la question {number}',
    context: 'Moves a question down.',
  },
  removeQuestionOf: {
    message: 'Supprimer la question {number}',
    context: 'Removes a question.',
  },
  learnDashTitle: {
    message: 'Tableau de bord',
    context: 'Title of the learner home.',
  },
  learnWelcomeSubtitle: {
    message: 'Reprenez vos cours là où vous les avez laissés, à votre rythme.',
    context: 'Sentence of the learner welcome banner.',
  },
  learnResumeTitle: {
    message: 'Reprendre mes cours',
    context: 'Heading: courses in progress.',
  },
  learnDiscoverTitle: {
    message: 'Cours à découvrir',
    context: 'Heading: courses not started yet.',
  },
  learnResumeMeta: {
    message: '{percent, number} % terminé',
    context: 'Progress of a course in progress.',
  },
  learnHelpLink: {
    message: 'Besoin d’aide ?',
    context: 'Link to the learner help page.',
  },
  learnSidebarTagline: {
    message: 'Apprenez à votre rythme, même sans Internet.',
    context: 'Sentence in the learner side menu.',
  },
  learnKpiActive: {
    message: 'Cours en cours',
    context: 'Dashboard card: courses in progress.',
  },
  learnKpiStarted: {
    message: 'Cours suivis',
    context: 'Card: courses started.',
  },
  learnKpiCompleted: {
    message: 'Cours terminés',
    context: 'Card: courses completed.',
  },
  learnKpiQuizzesPassed: {
    message: 'Quiz réussis',
    context: 'Card: quizzes passed.',
  },
  learnKpiCertificates: {
    message: 'Certificats',
    context: 'Card: certificates earned.',
  },
  learnCoursesSubtitle: {
    message: 'Vidéos, audios, documents et quiz : suivez chaque cours étape par étape.',
    context: 'Sentence under the learner courses title.',
  },
  learnCoursesFilterLabel: {
    message: 'Filtrer les cours',
    context: 'Accessible name of the course filters.',
  },
  learnFilterAll: {
    message: 'Tous',
    context: 'Filter: all courses.',
  },
  learnFilterNew: {
    message: 'À commencer',
    context: 'Filter: courses not started.',
  },
  learnFilterActive: {
    message: 'En cours',
    context: 'Filter: courses in progress.',
  },
  learnFilterDone: {
    message: 'Terminés',
    context: 'Filter: completed courses.',
  },
  learnCourseStatusNew: {
    message: 'Nouveau',
    context: 'Status of a course not started.',
  },
  learnCourseStatusActive: {
    message: 'En cours',
    context: 'Status of a course in progress.',
  },
  learnCourseStatusDone: {
    message: 'Terminé',
    context: 'Status of a completed course.',
  },
  learnCourseActionStart: {
    message: 'Commencer',
    context: 'Opens a course not started.',
  },
  learnCourseActionContinue: {
    message: 'Continuer',
    context: 'Opens a course in progress.',
  },
  learnCourseActionReview: {
    message: 'Revoir',
    context: 'Opens a completed course.',
  },
  learnCourseActionOf: {
    message: '{action} : {name}',
    context: 'Accessible name of a button: action and course or quiz name.',
  },
  learnCourseCertified: {
    message: 'Certificat obtenu',
    context: 'Badge of a course with a certificate.',
  },
  learnCourseTrainer: {
    message: 'Formateur : {name}',
    context: 'Trainer of a course.',
  },
  learnCoursePercentDone: {
    message: '{percent, number} % terminé',
    context: 'Progress pill of a course.',
  },
  learnCourseMyCertificate: {
    message: 'Mon certificat',
    context: 'Button opening the learner certificate.',
  },
  learnCourseEmpty: {
    message: 'Le formateur n’a pas encore ajouté de supports à ce cours. Revenez bientôt !',
    context: 'Empty state of a learner course.',
  },
  learnCoursePathTitle: {
    message: 'Parcours du cours',
    context: 'Heading of the list of course steps.',
  },
  learnCourseStepsDone: {
    message: '{done, number} / {total, number} étapes',
    context: 'Steps done in a course.',
  },
  learnCourseCompleted: {
    message: 'Bravo, vous avez terminé ce cours !',
    context: 'Shown when a course is completed.',
  },
  learnCourseSupportsHeading: {
    message: 'Supports',
    context: 'Group of course steps: supports.',
  },
  learnCourseQuizzesHeading: {
    message: 'Évaluations',
    context: 'Group of course steps: quizzes and exam.',
  },
  learnCourseStepDone: {
    message: 'terminé',
    context: 'Hidden status of a step done.',
  },
  learnCourseStepTodo: {
    message: 'à faire',
    context: 'Hidden status of a step to do.',
  },
  learnCourseQuizPassed: {
    message: 'Réussi !',
    context: 'Shown when the learner passed a quiz.',
  },
  learnCourseStartQuiz: {
    message: 'Commencer le quiz',
    context: 'Opens a quiz.',
  },
  previousStepAction: {
    message: 'Étape précédente',
    context: 'Goes to the previous course step.',
  },
  nextStepAction: {
    message: 'Étape suivante',
    context: 'Goes to the next course step.',
  },
  backToCourseAction: {
    message: 'Retour au cours',
    context: 'Goes back to the course.',
  },
  learnQuizQuestionsFact: {
    message: '{count, plural, one {# question} other {# questions}}',
    context: 'Number of questions of a quiz.',
  },
  learnQuizPassFact: {
    message: 'Réussite à partir de {percent, number} %',
    context: 'Pass score of a quiz.',
  },
  learnQuizAttemptsUnlimited: {
    message: 'Tentatives illimitées',
    context: 'The quiz can be taken as often as wanted.',
  },
  learnQuizAttemptsLeft: {
    message:
      '{count, plural, =0 {Plus aucune tentative} one {# tentative restante} other {# tentatives restantes}}',
    context: 'Attempts left for a quiz.',
  },
  learnQuizBestScore: {
    message: 'Votre meilleur score : {percent, number} %',
    context: 'Best score of the learner.',
  },
  learnQuizExamNote: {
    message: 'Réussissez cet examen pour obtenir le certificat du cours.',
    context: 'Note of a final exam.',
  },
  learnQuizEmpty: {
    message: 'Ce quiz n’a pas encore de questions.',
    context: 'Shown for a quiz without questions.',
  },
  learnQuizNoAttemptsLeft: {
    message: 'Vous avez utilisé toutes vos tentatives pour ce quiz.',
    context: 'Shown when no attempt is left.',
  },
  learnQuizStart: {
    message: 'Commencer',
    context: 'Starts a quiz.',
  },
  learnQuizQuestionOf: {
    message: 'Question {index, number} sur {total, number}',
    context: 'Position in the quiz.',
  },
  learnQuizAnsweredMeter: {
    message: '{count, number} questions répondues sur {total, number}',
    context: 'Accessible name of the quiz progress bar.',
  },
  learnQuizDotAnswered: {
    message: 'Question {index}, répondue',
    context: 'Accessible name of an answered question button.',
  },
  learnQuizDotEmpty: {
    message: 'Question {index}, sans réponse',
    context: 'Accessible name of an unanswered question button.',
  },
  learnQuizHintSingle: {
    message: 'Choisissez une seule réponse.',
    context: 'Hint of a single answer question.',
  },
  learnQuizHintMultiple: {
    message: 'Plusieurs réponses possibles.',
    context: 'Hint of a multiple answer question.',
  },
  learnQuizHintTrueFalse: {
    message: 'Vrai ou faux ?',
    context: 'Hint of a true or false question.',
  },
  learnQuizPoints: {
    message: '{count, plural, one {# point} other {# points}}',
    context: 'Points of a question.',
  },
  learnQuizPrevious: {
    message: 'Précédente',
    context: 'Goes to the previous question.',
  },
  learnQuizNext: {
    message: 'Suivante',
    context: 'Goes to the next question.',
  },
  learnQuizSubmit: {
    message: 'Envoyer mes réponses',
    context: 'Sends the answers of a quiz.',
  },
  learnQuizUnanswered: {
    message:
      '{count, plural, one {# question est sans réponse.} other {# questions sont sans réponse.}} Envoyer quand même ?',
    context: 'Confirmation before sending an incomplete quiz.',
  },
  learnQuizKeepAnswering: {
    message: 'Continuer à répondre',
    context: 'Goes back to the questions without answer.',
  },
  learnQuizSubmitAnyway: {
    message: 'Oui, envoyer',
    context: 'Sends an incomplete quiz.',
  },
  learnQuizSubmitError: {
    message: 'Vos réponses n’ont pas pu être envoyées. Vérifiez la connexion et réessayez.',
    context: 'Error when a quiz cannot be sent.',
  },
  learnQuizPassedTitle: {
    message: 'Bravo, c’est réussi !',
    context: 'Result title of a passed quiz.',
  },
  learnQuizFailedTitle: {
    message: 'Pas encore… vous pouvez y arriver !',
    context: 'Result title of a failed quiz.',
  },
  learnQuizScoreLine: {
    message: '{score, number} / {max, number} points · {percent, number} %',
    context: 'Score of a quiz.',
  },
  learnQuizPassNeeded: {
    message: 'Il faut {percent, number} % pour réussir.',
    context: 'Pass score reminder after a failed quiz.',
  },
  learnQuizCertificateEarned: {
    message: 'Certificat obtenu ! N° {number}',
    context: 'Shown when a passed exam gives a certificate.',
  },
  learnQuizSeeCertificates: {
    message: 'Voir mes certificats',
    context: 'Link to the learner certificates.',
  },
  learnQuizRetry: {
    message: 'Refaire le quiz',
    context: 'Starts a quiz again.',
  },
  learnQuizCorrectionsTitle: {
    message: 'Correction',
    context: 'Heading of the quiz correction.',
  },
  learnQuizAnswersHidden: {
    message: 'Le formateur a choisi de ne pas montrer les bonnes réponses.',
    context: 'Shown when the correction is hidden.',
  },
  learnQuizCorrect: {
    message: 'Juste',
    context: 'Hidden status of a right answer.',
  },
  learnQuizIncorrect: {
    message: 'À revoir',
    context: 'Hidden status of a wrong answer.',
  },
  learnQuizYourAnswer: {
    message: 'Votre réponse',
    context: 'Label before the learner answer.',
  },
  learnQuizNoAnswer: {
    message: 'pas de réponse',
    context: 'Shown when a question was not answered.',
  },
  learnQuizRightAnswer: {
    message: 'Bonne réponse',
    context: 'Label before the right answer.',
  },
  learnQuizzesCount: {
    message: '{count, plural, one {# évaluation} other {# évaluations}}',
    context: 'Number of quizzes.',
  },
  learnQuizzesSubtitle: {
    message: 'Les mini-quiz et les examens finaux de vos cours.',
    context: 'Sentence under the learner quizzes title.',
  },
  learnQuizzesBannerTitle: {
    message: 'Testez vos connaissances',
    context: 'Banner title of the learner quizzes page.',
  },
  learnQuizzesBannerSubtitle: {
    message: 'Réussissez l’examen final d’un cours pour obtenir votre certificat.',
    context: 'Banner sentence of the learner quizzes page.',
  },
  learnQuizzesSearch: {
    message: 'Rechercher un quiz ou un cours',
    context: 'Label of the quiz search field.',
  },
  learnQuizzesEmpty: {
    message: 'Vos formateurs n’ont pas encore publié de quiz.',
    context: 'Empty state of the learner quizzes page.',
  },
  learnQuizzesNoMatch: {
    message: 'Aucun quiz ne correspond à votre recherche.',
    context: 'Shown when the quiz search finds nothing.',
  },
  columnBestScore: {
    message: 'Meilleur score',
    context: 'Table column header: best score.',
  },
  learnQuizStateTodo: {
    message: 'À faire',
    context: 'Status of a quiz not tried.',
  },
  learnQuizStatePassed: {
    message: 'Réussi',
    context: 'Status of a passed quiz.',
  },
  learnQuizStateRetry: {
    message: 'À retenter',
    context: 'Status of a failed quiz that can be tried again.',
  },
  learnQuizStateClosed: {
    message: 'Terminé',
    context: 'Status of a quiz without attempts left.',
  },
  learnQuizSeeAction: {
    message: 'Voir',
    context: 'Opens a quiz already done.',
  },
  learnProgressSubtitle: {
    message: 'Où vous en êtes dans chaque cours, et vos certificats.',
    context: 'Sentence under the learner progress title.',
  },
  learnProgressEmpty: {
    message: 'Vous n’avez pas encore commencé de cours.',
    context: 'Empty state of the learner progress page.',
  },
  columnSupportsSeen: {
    message: 'Supports vus',
    context: 'Table column header: supports opened.',
  },
  columnQuizzesPassed: {
    message: 'Quiz réussis',
    context: 'Table column header: quizzes passed.',
  },
  columnCertificate: {
    message: 'Certificat',
    context: 'Table column header: certificate.',
  },
  learnExamPassed: {
    message: 'Réussi · {percent, number} %',
    context: 'Final exam passed with its score.',
  },
  learnExamBest: {
    message: 'Meilleur : {percent, number} %',
    context: 'Best score of a final exam not passed yet.',
  },
  learnPrintCertificate: {
    message: 'Imprimer',
    context: 'Opens the printable certificate.',
  },
  learnPrintCertificateOf: {
    message: 'Imprimer le certificat : {name}',
    context: 'Accessible name of the print certificate link.',
  },
  usernameAvailable: {
    message: 'Identifiant disponible.',
    context: 'Shown under the username field when nobody uses it yet.',
  },
  usernameChecking: {
    message: 'Vérification de l’identifiant…',
    context: 'Shown while checking whether a username is free.',
  },
  usernameTakenAlert: {
    message:
      'Le compte n’a pas été créé : l’identifiant « {username} » est déjà utilisé. Choisissez-en un autre, par exemple en ajoutant un chiffre.',
    context: 'Alert when creating an account with a username already used.',
  },
  formHasErrors: {
    message: 'Rien n’a été enregistré : corrigez les champs signalés en rouge.',
    context: 'Alert when a form has fields to correct.',
  },
  userCreatedAddAnother: {
    message: 'Compte créé : {name}. Vous pouvez en ajouter un autre.',
    context: 'Success alert after creating an account, panel kept open.',
  },
  groupCreatedAddAnother: {
    message: 'Groupe créé : {name}. Vous pouvez en créer un autre.',
    context: 'Success alert after creating a group, panel kept open.',
  },
  classNameTaken: {
    message: 'Une classe porte déjà ce nom.',
    context: 'Error under the class name field when the name is already used.',
  },
  classNameTakenAlert: {
    message:
      'La classe n’a pas été créée : une classe porte déjà ce nom. Choisissez un autre nom.',
    context: 'Alert when a class name is already used.',
  },
  groupNameTakenAlert: {
    message:
      'Le groupe n’a pas été créé : un groupe porte déjà ce nom. Choisissez un autre nom.',
    context: 'Alert when a group name is already used.',
  },
  filesFailed: {
    message:
      '{count, plural, one {# fichier n’a pas pu être ajouté} other {# fichiers n’ont pas pu être ajoutés}} : vérifiez le type et la taille (500 Mo au maximum), puis réessayez.',
    context: 'Error after uploading course files.',
  },
  learnersEnrollFailed: {
    message:
      '{count, plural, one {# apprenant n’a pas pu être inscrit} other {# apprenants n’ont pas pu être inscrits}} : réessayez.',
    context: 'Error after enrolling learners in a course.',
  },
  allClassesLink: {
    message: 'Toutes les classes',
    context: 'Link back to the list of classes.',
  },
  classDetailSubtitle: {
    message: 'Gérez les formateurs et les apprenants de cette classe.',
    context: 'Sentence under the class name.',
  },
  classOptions: {
    message: 'Options',
    context: 'Button opening the menu of class actions.',
  },
  copyClass: {
    message: 'Copier la classe',
    context: 'Menu action: duplicate a class.',
  },
  renameClass: {
    message: 'Renommer la classe',
    context: 'Menu action and dialog title: rename a class.',
  },
  deleteClass: {
    message: 'Supprimer la classe',
    context: 'Menu action: delete a class.',
  },
  classCoachesLabel: {
    message: '{count, plural, one {Formateur} other {Formateurs}}',
    context: 'Label under the number of trainers of a class.',
  },
  classLearnersLabel: {
    message: '{count, plural, one {Apprenant} other {Apprenants}}',
    context: 'Label under the number of learners of a class.',
  },
  assignCoachAction: {
    message: 'Affecter un formateur',
    context: 'Button opening the trainer picker.',
  },
  noCoachAssignedTitle: {
    message: 'Aucun formateur affecté',
    context: 'Empty state of the trainers of a class.',
  },
  noCoachAssignedText: {
    message: 'Affectez un formateur pour accompagner cette classe.',
    context: 'Empty state of the trainers of a class.',
  },
  noLearnerEnrolledTitle: {
    message: 'Aucun apprenant inscrit',
    context: 'Empty state of the learners of a class.',
  },
  noLearnerEnrolledText: {
    message: 'Inscrivez des apprenants pour qu’ils rejoignent cette classe.',
    context: 'Empty state of the learners of a class.',
  },
  searchLearnerPlaceholder: {
    message: 'Rechercher un apprenant…',
    context: 'Search field of the learners of a class.',
  },
  roleColumn: {
    message: 'Rôle',
    context: 'Table column header: role.',
  },
  accountRoleColumn: {
    message: 'Rôle du compte',
    context: 'Table column header: role of the account.',
  },
  roleSuperuser: {
    message: 'Super admin',
    context: 'Role of an account.',
  },
  roleAdmin: {
    message: 'Administrateur',
    context: 'Role of an account.',
  },
  roleCoach: {
    message: 'Formateur',
    context: 'Role of an account.',
  },
  roleFacilityCoach: {
    message: 'Formateur de l’établissement',
    context: 'Role of a trainer of the whole facility.',
  },
  roleClassCoach: {
    message: 'Formateur de classe',
    context: 'Role of a trainer who can only coach given classes.',
  },
  roleLearner: {
    message: 'Apprenant',
    context: 'Role of an account.',
  },
  removeFromClass: {
    message: 'Retirer de la classe',
    context: 'Button removing someone from a class.',
  },
  removeFromClassOf: {
    message: 'Retirer {name} de la classe',
    context: 'Accessible name of the button removing someone from a class.',
  },
  removedFromClass: {
    message: '{name} ne fait plus partie de la classe. Son compte est conservé.',
    context: 'Confirmation after removing someone from a class.',
  },
  removeKeepsAccount: {
    message: 'Retirer une personne de la classe ne supprime pas son compte.',
    context: 'Note under the learners of a class.',
  },
  assignCoachesTitle: {
    message: 'Affecter des formateurs',
    context: 'Title of the trainer picker.',
  },
  assignCoachesIntro: {
    message: 'Sélectionnez les personnes à affecter à cette classe.',
    context: 'Sentence of the trainer picker.',
  },
  assignCoachesNote: {
    message: 'Les personnes déjà affectées ne figurent pas dans cette liste.',
    context: 'Note of the trainer picker.',
  },
  assignCoachesConfirm: {
    message:
      '{count, plural, =0 {Affecter} one {Affecter # formateur} other {Affecter # formateurs}}',
    context: 'Confirm button of the trainer picker.',
  },
  coachesAssigned: {
    message:
      '{count, plural, one {# formateur affecté à la classe.} other {# formateurs affectés à la classe.}}',
    context: 'Confirmation after assigning trainers.',
  },
  assignCoachesError: {
    message:
      'Les formateurs n’ont pas été affectés : réessayez. Si cela recommence, vérifiez la connexion.',
    context: 'Error of the trainer picker.',
  },
  enrollLearnersIntro: {
    message: 'Sélectionnez les personnes à inscrire dans cette classe.',
    context: 'Sentence of the learner picker.',
  },
  enrollLearnersNote: {
    message: 'Les personnes déjà inscrites ne figurent pas dans cette liste.',
    context: 'Note of the learner picker.',
  },
  enrollLearnersConfirm: {
    message:
      '{count, plural, =0 {Inscrire} one {Inscrire # apprenant} other {Inscrire # apprenants}}',
    context: 'Confirm button of the learner picker.',
  },
  learnersEnrolledInClass: {
    message:
      '{count, plural, one {# apprenant inscrit dans la classe.} other {# apprenants inscrits dans la classe.}}',
    context: 'Confirmation after enrolling learners in a class.',
  },
  enrollLearnersError: {
    message:
      'Les apprenants n’ont pas été inscrits : réessayez. Si cela recommence, vérifiez la connexion.',
    context: 'Error of the learner picker.',
  },
  searchPeopleLabel: {
    message: 'Rechercher un nom ou un identifiant…',
    context: 'Search field of the people picker.',
  },
  filterByRoleLabel: {
    message: 'Filtrer par rôle',
    context: 'Role filter of the people picker.',
  },
  allRolesOption: {
    message: 'Tous les rôles',
    context: 'Role filter option: every role.',
  },
  selectAllLabel: {
    message: 'Tout sélectionner',
    context: 'Checkbox selecting every person of the page.',
  },
  noPeopleMatch: {
    message: 'Personne ne correspond à votre recherche.',
    context: 'Shown when a people search finds nobody.',
  },
  noPeopleAvailable: {
    message: 'Tout le monde fait déjà partie de cette classe.',
    context: 'Shown when nobody can be added.',
  },
  peopleAvailableCount: {
    message: '{count, plural, one {# personne disponible} other {# personnes disponibles}}',
    context: 'Number of people who can be picked.',
  },
  peopleSelectedCount: {
    message:
      '{count, plural, =0 {aucune sélectionnée} one {# sélectionnée} other {# sélectionnées}}',
    context: 'Number of people picked.',
  },
  copyAction: {
    message: 'Copier',
    context: 'Confirm button of the copy dialog.',
  },
  copyClassText: {
    message: 'Une nouvelle classe est créée ; choisissez ce qu’elle reprend de celle-ci.',
    context: 'Sentence of the copy class dialog.',
  },
  copyClassDefaultName: {
    message: '{name} (copie)',
    context: 'Default name of a copied class.',
  },
  copyCoachesLabel: {
    message:
      '{count, plural, =0 {Copier les formateurs (aucun)} one {Copier le formateur} other {Copier les # formateurs}}',
    context: 'Checkbox of the copy class dialog.',
  },
  copyLearnersLabel: {
    message:
      '{count, plural, =0 {Copier les apprenants (aucun)} one {Copier l’apprenant} other {Copier les # apprenants}}',
    context: 'Checkbox of the copy class dialog.',
  },
  classCopied: {
    message: 'Classe copiée : {name}',
    context: 'Confirmation after copying a class.',
  },
  classRenamed: {
    message: 'Classe renommée : {name}',
    context: 'Confirmation after renaming a class.',
  },
  deleteClassTitle: {
    message: 'Supprimer cette classe ?',
    context: 'Title of the delete class dialog.',
  },
  deleteClassText: {
    message:
      'La classe « {name} » sera supprimée. Les comptes de ses formateurs et de ses apprenants sont conservés.',
    context: 'Sentence of the delete class dialog.',
  },
  classDeleted: {
    message: 'Classe supprimée : {name}',
    context: 'Confirmation after deleting a class.',
  },
  editAccountSubtitle: {
    message: 'Changez le nom, l’identifiant, le rôle ou le mot de passe de ce compte.',
    context: 'Sentence under the edit account panel title.',
  },
  roleLockedHint: {
    message: 'Vous ne pouvez pas changer votre propre rôle, ni celui d’un super admin.',
    context: 'Hint when the role cannot be changed.',
  },
  resetPasswordSection: {
    message: 'Nouveau mot de passe',
    context: 'Section of the edit account panel.',
  },
  resetPasswordHint: {
    message: 'Laissez vide pour garder le mot de passe actuel.',
    context: 'Hint of the new password fields.',
  },
  deleteAccountTitle: {
    message: 'Supprimer ce compte',
    context: 'Title of the delete account area and dialog.',
  },
  deleteAccountHint: {
    message: 'La personne ne pourra plus se connecter. Ses résultats ne sont plus suivis.',
    context: 'Hint of the delete account area.',
  },
  deleteAccountAction: {
    message: 'Supprimer le compte',
    context: 'Button deleting an account.',
  },
  deleteAccountConfirm: {
    message: 'Supprimer le compte de {name} ? Cette personne ne pourra plus se connecter.',
    context: 'Question of the delete account dialog.',
  },
  accountSaved: {
    message: 'Compte enregistré : {name}',
    context: 'Confirmation after saving an account.',
  },
  accountDeleted: {
    message: 'Compte supprimé : {name}',
    context: 'Confirmation after deleting an account.',
  },
  profileFacilityLabel: {
    message: 'Établissement',
    context: 'Label: facility of the account.',
  },
  profileEditNameTitle: {
    message: 'Modifier mon nom',
    context: 'Heading of the name form of the profile.',
  },
  profilePasswordTitle: {
    message: 'Mot de passe',
    context: 'Heading of the password card of the profile.',
  },
  profilePasswordText: {
    message:
      'Choisissez un mot de passe facile à retenir pour vous, difficile à deviner pour les autres.',
    context: 'Sentence of the password card of the profile.',
  },
  profileChangePasswordAction: {
    message: 'Changer mon mot de passe',
    context: 'Button saving a new password.',
  },
  profileNameSaved: {
    message: 'Votre nom a été enregistré.',
    context: 'Confirmation after changing one\'s name.',
  },
  profilePasswordSaved: {
    message: 'Votre mot de passe a été changé. Utilisez-le à la prochaine connexion.',
    context: 'Confirmation after changing one\'s password.',
  },
  profileNotAllowed: {
    message: 'Votre centre ne permet pas cette modification. Demandez à un administrateur.',
    context: 'Error when the facility does not allow a change.',
  },
  libraryCount: {
    message: '{count, plural, one {# élément} other {# éléments}}',
    context: 'Number of items in the library.',
  },
  learnLibrarySubtitle: {
    message: 'Les ressources installées sur cet appareil : vidéos, documents, audios et activités.',
    context: 'Sentence under the library title.',
  },
  libraryFilterLabel: {
    message: 'Type de ressource',
    context: 'Accessible name of the library filters.',
  },
  librarySearchLabel: {
    message: 'Rechercher dans la bibliothèque…',
    context: 'Search field of the library.',
  },
  libraryCollections: {
    message: 'Collections',
    context: 'Library filter: channels.',
  },
  libraryOpenAction: {
    message: 'Ouvrir',
    context: 'Button opening a library item.',
  },
  libraryOpenOf: {
    message: 'Ouvrir {name}',
    context: 'Accessible name of the button opening a library item.',
  },
  signUpCardTitle: {
    message: 'Créer mon compte',
    context: 'Title of the sign-up card.',
  },
  signUpCardSubtitle: {
    message: 'Quelques informations suffisent pour commencer à apprendre.',
    context: 'Sentence of the sign-up card.',
  },
  signUpSubmit: {
    message: 'Créer mon compte',
    context: 'Button creating an account.',
  },
  signUpHaveAccount: {
    message: 'J’ai déjà un compte',
    context: 'Button going back to sign in.',
  },
  signUpClosed: {
    message:
      'Les inscriptions sont fermées sur cet appareil. Demandez un compte à votre formateur.',
    context: 'Error when sign-up is not allowed.',
  },
  learnHelpIntro: {
    message: 'Tout ce qu’il faut pour suivre un cours, de la connexion au certificat.',
    context: 'Sentence under the help title.',
  },
  learnHelpSigninTitle: {
    message: 'Se connecter',
    context: 'Help step title.',
  },
  learnHelpSigninBody: {
    message:
      'Saisissez votre nom d’utilisateur, puis votre mot de passe. Pas de compte ? Demandez-le à votre formateur.',
    context: 'Help step text.',
  },
  learnHelpCoursesTitle: {
    message: 'Ouvrir un cours',
    context: 'Help step title.',
  },
  learnHelpCoursesBody: {
    message: 'Dans « Mes cours », choisissez un cours et touchez Commencer ou Continuer.',
    context: 'Help step text.',
  },
  learnHelpSupportsTitle: {
    message: 'Suivre le parcours',
    context: 'Help step title.',
  },
  learnHelpSupportsBody: {
    message:
      'Le parcours est à gauche : vidéos, audios, documents. Chaque étape ouverte est cochée.',
    context: 'Help step text.',
  },
  learnHelpDownloadTitle: {
    message: 'Garder un support',
    context: 'Help step title.',
  },
  learnHelpDownloadBody: {
    message:
      'Le bouton Télécharger enregistre le support sur votre appareil pour le revoir plus tard.',
    context: 'Help step text.',
  },
  learnHelpQuizTitle: {
    message: 'Faire les mini-quiz',
    context: 'Help step title.',
  },
  learnHelpQuizBody: {
    message:
      'Répondez question par question. Après l’envoi, lisez la correction et retentez si besoin.',
    context: 'Help step text.',
  },
  learnHelpExamTitle: {
    message: 'Passer l’examen final',
    context: 'Help step title.',
  },
  learnHelpExamBody: {
    message:
      'Réussissez l’examen final du cours : vous obtenez votre certificat, à imprimer dans Ma progression.',
    context: 'Help step text.',
  },
  learnHelpProgressTitle: {
    message: 'Voir ma progression',
    context: 'Help step title.',
  },
  learnHelpProgressBody: {
    message: 'Ma progression montre où vous en êtes dans chaque cours et vos certificats.',
    context: 'Help step text.',
  },
  learnHelpOfflineTitle: {
    message: 'Sans Internet',
    context: 'Help step title.',
  },
  learnHelpOfflineBody: {
    message:
      'La plateforme marche sans Internet. Seules les vidéos YouTube ont besoin d’une connexion.',
    context: 'Help step text.',
  },
  learnHelpStuckTitle: {
    message: 'Toujours bloqué ?',
    context: 'Heading of the help contact card.',
  },
  learnHelpStuckText: {
    message: 'Votre formateur peut vous aider : notez ce qui ne marche pas et montrez-lui l’écran.',
    context: 'Sentence of the help contact card.',
  },
  typeExercise: {
    message: 'Exercice',
    context: 'Kind of library resource: exercise.',
  },
  libraryExerciseText: {
    message:
      'Cet exercice interactif s’ouvre dans le lecteur d’exercices de Kolibri, avec votre progression.',
    context: 'Text shown for a library exercise.',
  },
  libraryExerciseAction: {
    message: 'Faire l’exercice',
    context: 'Button opening a library exercise.',
  },
  libraryResourceDone: {
    message: 'Terminé ! Votre progression est enregistrée.',
    context: 'Shown when a library resource is completed.',
  },
  facilityRulesTitle: {
    message: 'Règles pour les apprenants',
    context: 'Heading of the facility rules card.',
  },
  facilityRulesText: {
    message: 'Ce que les apprenants peuvent faire eux-mêmes sur cette plateforme.',
    context: 'Sentence of the facility rules card.',
  },
  facilityRulesSaved: {
    message: 'Règles enregistrées.',
    context: 'Confirmation after saving the facility rules.',
  },
  ruleLearnerCanSignUp: {
    message: 'Inscription libre',
    context: 'Facility rule.',
  },
  ruleLearnerCanSignUpHint: {
    message: 'Les apprenants peuvent créer leur compte depuis la page de connexion.',
    context: 'Facility rule hint.',
  },
  ruleLearnerCanEditName: {
    message: 'Modifier son nom',
    context: 'Facility rule.',
  },
  ruleLearnerCanEditNameHint: {
    message: 'Les apprenants peuvent changer leur nom dans Mon profil.',
    context: 'Facility rule hint.',
  },
  ruleLearnerCanEditUsername: {
    message: 'Modifier son identifiant',
    context: 'Facility rule.',
  },
  ruleLearnerCanEditUsernameHint: {
    message: 'Les apprenants peuvent changer leur nom d’utilisateur.',
    context: 'Facility rule hint.',
  },
  ruleLearnerCanEditPassword: {
    message: 'Modifier son mot de passe',
    context: 'Facility rule.',
  },
  ruleLearnerCanEditPasswordHint: {
    message: 'Les apprenants peuvent changer leur mot de passe dans Mon profil.',
    context: 'Facility rule hint.',
  },
  ruleLearnerCanLoginWithNoPassword: {
    message: 'Connexion sans mot de passe',
    context: 'Facility rule.',
  },
  ruleLearnerCanLoginWithNoPasswordHint: {
    message:
      'Les apprenants se connectent avec leur seul identifiant (utile pour les jeunes enfants).',
    context: 'Facility rule hint.',
  },
  ruleShowDownloadButtonInLearn: {
    message: 'Bouton Télécharger',
    context: 'Facility rule.',
  },
  ruleShowDownloadButtonInLearnHint: {
    message: 'Les apprenants peuvent télécharger les ressources de la bibliothèque.',
    context: 'Facility rule hint.',
  },
});
