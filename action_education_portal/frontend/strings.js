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
    message:
      'Vous n’avez pas encore commencé de formation. Explorez le catalogue pour démarrer.',
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
    message: 'Aucune session pour l’instant. Créez la première ci-dessus.',
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
    message:
      'Vue d’ensemble des formations AE, sessions et présences sur cet appareil.',
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
    message:
      'Vue simple pour les administrateurs Action Éducation sur ce serveur local.',
    context: 'Admin dashboard intro.',
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
    message:
      'Impossible de délivrer le certificat. Vérifiez le nom d’utilisateur et la formation.',
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
    message: 'Votre formateur n’a pas encore ajouté de formation.',
    context: 'Empty state for learner formations.',
  },
  emptyFormationsStaff: {
    message: 'Aucune formation n’est encore disponible.',
    context: 'Empty state for staff formations list.',
  },
  addContentAction: {
    message: 'Ajouter du contenu',
    context: 'Primary CTA to open content import flows.',
  },
  importFromInternet: {
    message: 'Importer depuis Internet',
    context: 'Content import method label.',
  },
  importFromNetwork: {
    message: 'Importer depuis un appareil du réseau',
    context: 'Content import method label.',
  },
  importFromUsb: {
    message: 'Importer depuis une clé USB ou un disque',
    context: 'Content import method label.',
  },
  contentImportHelp: {
    message:
      'Les contenus s’ajoutent via les méthodes d’importation Kolibri (Internet, appareil du réseau, USB ou disque). Aucun téléversement isolé de fichier n’est proposé ici.',
    context: 'Explains MVP content import limits.',
  },
  openContentImportAction: {
    message: 'Ouvrir l’importation de contenus',
    context: 'Single honest CTA to Device content management.',
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
  dashLearnersLabel: {
    message: 'Apprenants',
    context: 'Admin dashboard card for learner count.',
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
  openFacilityUsers: {
    message: 'Gérer les utilisateurs (Facility)',
    context: 'Link to native Facility users.',
  },
  openFacilityClasses: {
    message: 'Gérer les classes (Facility)',
    context: 'Link to native Facility classes.',
  },
  syncIntro: {
    message: 'Synchronisez cet appareil avec un autre Kolibri ou un serveur distant lorsque le réseau le permet.',
    context: 'Admin sync page intro.',
  },
  openDeviceSync: {
    message: 'Ouvrir la synchronisation',
    context: 'Button to Device sync UI.',
  },
  settingsIntro: {
    message: 'Réglages utiles de la plateforme. Les options avancées restent dans l’administration technique.',
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
    message: 'Aucun apprenant trouvé dans cet établissement.',
    context: 'Empty learners list.',
  },
  resultsIntro: {
    message: 'Résultats issus des présences et certificats enregistrés sur cet appareil.',
    context: 'Coach results intro.',
  },
  forbiddenTitle: {
    message: 'Accès refusé',
    context: 'Forbidden page title.',
  },
  loadError: {
    message: 'Impossible de charger les données. Réessayez dans un moment.',
    context: 'Generic error when an API request fails in the portal.',
  },
  retryAction: {
    message: 'Réessayer',
    context: 'Retry button after a load error.',
  },
  connectionOffline: {
    message: 'Hors ligne — contenus déjà téléchargés disponibles',
    context: 'Status when the browser reports offline.',
  },
});
