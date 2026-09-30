# AE UX Redesign — Phases 1–7 + audit correctif

Point de restauration : tag `ae-pre-ux-redesign-2026-07-24`.

## Livré (shell)

1. Permissions + shell `/ae`
2. Menus / routes / responsive
3–5. Espaces apprenant / formateur / admin
6. Offline / erreurs
7. Tests structurels + docs

## Correctifs audit fonctionnel

- Anonyme → Auth (Django + guards SPA)
- Landing post-login selon rôle
- Onglets Formateur/Admin filtrés par rôle (`PortalSideNavEntry`)
- Contenu : un CTA honnête vers Device `#/content`
- Sessions : date + heure FR, validation, statut, ouverture
- Dashboards : cartes masquées si valeur absente / 0 ; `allSettled`
- Apprenants coach : filtre hors staff
- Paramètres : lien Device `#/settings` (persistance native)

## Accès

```bash
export KOLIBRI_HOME="$HOME/.kolibri-action-education-dev"
export KOLIBRI_RUN_MODE="dev"
pnpm run devserver core,learn,action_education_portal,user_auth,facility,device,coach,user_profile
```

URL : `/fr-fr/portal/` (redirige vers Auth si non connecté).

### Droits de l’administrateur d’établissement

- **Import de contenus** : `action_education_portal/signals.py` donne la permission Kolibri `can_manage_content` à tout admin d’établissement (à l’ajout du rôle, et à la connexion pour les admins déjà existants ou arrivés par synchronisation) et la retire quand il perd le rôle (sauf superutilisateur). Cette permission vaut pour tout l’appareil : l’admin peut aussi supprimer des canaux.
- **Synchronisation** : Kolibri autorise déjà l’admin d’établissement à synchroniser son établissement (Établissement › Données). La page AE Synchronisation y renvoie pour tous les admins ; la synchronisation de l’appareil (importer un autre établissement) reste au superutilisateur.
- Les paramètres de l’appareil restent réservés au superutilisateur.

## Règles de design (Takira adaptées au web)

Appliquées d’abord à la connexion (`/fr-fr/portal/#/connexion`, `AeSignInPage.vue`), à reprendre sur les autres écrans :

- **Tokens** (variables CSS en tête de `AeSignInPage.vue`) : rayons 10 / 14 / 18 / 24, espacements 4 → 32, une ombre de carte douce, fond de page teinté `#FDF8F3` (jamais blanc pur), texte courant 18 px.
- **Couleurs** : orange et marine viennent du thème (`$themeBrand`). L’orange de marque n’est utilisé en texte qu’à 19 px gras (grand texte, 3,4:1) ; les petits textes orange utilisent `--ae-orange-ink` (4,6:1).
- **Champs** : libellé au-dessus, 60 px de haut, icône à gauche, anneau de focus ; erreur sous le champ avec icône.
- **Boutons** : 60 px, flèche à droite, effet d’appui `scale(0.98)`, état chargement avec spinner.
- **Mouvement** : apparition 350 ms, désactivée avec `prefers-reduced-motion`.
- **Police** : Manrope embarquée (`frontend/assets/fonts`, SIL OFL), repli Noto Sans. **Icônes** : `views/AeIcon.js` (tracés Lucide, ISC).
- Tout est local : aucune ressource distante (hors ligne).

### Cadre et pages admin

- **Cadre commun** (`views/layouts/AeSpaceLayout.vue`) : en-tête blanc (logo, langue, menu du compte avec profil et déconnexion), barre latérale par espace, pied de page. Remplace la barre d’application Kolibri dans le portail.
- **Pas de défilement sur ordinateur** (≥ 900 × 640) : le cadre occupe l’écran ; paliers de hauteur 960 / 800 / 700 px. Seule la zone de contenu peut défiler en dernier recours.
- **Tokens partagés** : `frontend/styles/_tokens.scss` (mixins `ae-tokens`, `ae-font`, `ae-visually-hidden`) et `frontend/styles/fonts.scss` (Manrope, chargé par `app.js`).
- **Composants partagés par les espaces** (dans `views/`) :
  - `AePageHeader.vue` : fil d’Ariane (racine fournie par le layout via `provide('aeSpaceRoot')`, niveaux intermédiaires `crumbs`), titre + compteur, sous-titre, bouton principal (`to`, `href` ou `onClick`) et boutons secondaires (slot `actions`).
  - `AeListPage.vue` : en-tête + bandeau (ou slot `banner`) + carte avec recherche, filtres (slot `filters`, classe `ae-list-filter`), tri, tableau dont la taille de page suit la hauteur disponible, message d’erreur avec « Réessayer ».
  - `AeDashboard.vue` : tableau de bord (date, bandeau d’accueil, cartes chiffrées, panneau d’activité, actions rapides).
  - `AeRowActions.vue` (bouton « Voir… » et menu « … » avec liens ou actions), `AeAvatar.vue` (initiales, pastels Takira), `AePersonPicker.vue` (personnes à cocher, recherche sans accents).
- **Espace administration** : Tableau de bord, Utilisateurs, Groupes et classes, Formateurs, Gestion des contenus, Suivi, Synchronisation, Paramètres.
- **Espace formateur** (même design) : Tableau de bord (prochaines ou dernières sessions, actions rapides), Mes classes, Mes élèves (filtre par classe), Mes cours et le détail d’un cours (fichiers), Sessions et le détail d’une session (résumé et prise des présences en un clic, inscription par cases à cocher, export CSV), Résultats (filtres appliqués aussitôt, lien « Voir les résultats » depuis un élève), Bibliothèque.
- **Panneaux latéraux de création** : `views/AeSidePanel.vue` (en-tête, corps, pied de boutons ; classes d’aide `ae-side-panel-section`, `-row`, `-row-3`, `-field`, `-affix`, `-error`, boutons `-btn-outline` / `-btn-neutral` / `-btn-primary`), paliers de hauteur 960 / 700 px pour tenir sans défilement jusqu’à 1280 × 650.
  - `views/admin/AeUserCreatePanel.vue` : « Créer un utilisateur » (Utilisateurs) et « Ajouter un formateur » (Formateurs, type Formateur présélectionné) — compte, rôle d’établissement, inscription ou affectation à une classe.
  - `views/admin/AeGroupCreatePanel.vue` : « Créer un groupe » (Groupes et classes) — nom unique (casse et espaces ignorés), formateurs cochés (rôle coach de la classe), apprenants cochés avec recherche sans accents (adhésions).
  - Formateur : « Nouvelle classe », « Ajouter un élève », « Ajouter un fichier », « Nouvelle session », « Inscrire des apprenants » (dans les pages `views/coach/`).
- **« Créer un cours » en 3 étapes** (`views/coach/AeCourseCreateWizard.vue`, fenêtre centrée) : Informations (titre obligatoire, description), Supports (glisser-déposer ou « Parcourir les fichiers », types acceptés dans `composables/courseFiles.js`, « Continuer sans support »), Vérification (récapitulatif avec « Modifier »). Le cours est créé à la fin, puis ses fichiers sont envoyés un par un ; en cas d’échec d’un fichier, le cours existe et le message le dit. Taille fixe à chaque étape, sans défilement jusqu’à 1280 × 650.
  - Les tableaux de bord ouvrent directement ces panneaux (`?creer=1`).
- Les autres actions de fond (modifier, réinitialiser un mot de passe, supprimer) restent dans la gestion d’établissement / d’appareil Kolibri : les pages AE y renvoient.
