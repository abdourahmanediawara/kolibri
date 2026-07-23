# Audit d’architecture UI — Action Éducation Guinée

**Dépôt :** `/home/owner/kolibri`  
**Branche :** `action-education-v1`  
**Version de base :** Kolibri v0.19.5  
**Date :** 2026-07-23  
**Périmètre :** audit uniquement — aucune modification visuelle ou fonctionnelle

---

## 1. Synthèse

Kolibri expose l’interface apprenant via des **plugins Django + bundles Webpack + SPAs Vue 2**. Le branding (nom, logo, couleurs) est conçu pour être remplacé par un **plugin de thème** unique (`ThemeHook`, `only_one_registered=True`), sans toucher au cœur. La typographie globale (Noto) n’est **pas** configurable via ce hook.

Pour Action Éducation Guinée, la voie recommandée est :

1. Un plugin thème `action_education_theme` qui remplace `kolibri.plugins.default_theme`.
2. Éventuellement un plugin UI léger pour textes/écrans spécifiques, **sans forker** `learn` / `user_auth` / `core`.
3. Éviter toute modification de `kolibri/core/`, des viewsets d’auth/contenu/logger, et des lecteurs de contenu.

---

## 2. Documents d’instructions lus

| Document | Rôle |
|----------|------|
| `AGENTS.md` | Conventions agents, stack, gotchas Vue/API/tests |
| `CLAUDE.md` | Renvoie vers AGENTS + conventions étendues |
| `docs/stack.rst` | Vue d’ensemble serveur/client |
| `docs/backend_architecture/plugins.rst` | Architecture plugins, hooks, enable/disable |
| `docs/frontend_architecture/single_page_apps.rst` | SPA, nav, content viewers |
| `docs/frontend_architecture/core.rst` | Thème dynamique, `$themeTokens`, bootstrapping |
| `docs/frontend_architecture/composables.rst` | État via composables (Vuex déprécié) |
| `docs/frontend_architecture/vuex.rst` | Legacy Vuex |
| `docs/frontend_architecture/HTML5_API.rst` | Thème par canal HTML5 (`themeRenderer`) |
| `docs/howtos/development_with_kds.md` | Lien avec Kolibri Design System |
| `docs/howtos/working_with_urls_and_api_endpoints.md` | URLs Django ↔ JS |
| `docs/code_quality.rst` | Principes qualité |
| Design System externe | https://design-system.learningequality.org/ |

---

## 3. Parcours d’exécution (plugin → écran)

```
ACTIVE_PLUGINS
    │
    ▼
kolibri/plugins/<plugin>/kolibri_plugin.py
    │  KolibriPluginBase (urls, options)
    │  @register_hook → WebpackBundleHook / NavigationHook / ThemeHook / ContentRendererHook
    │
    ▼
Django
    │  INSTALLED_APPS += plugin
    │  URLs: translated_view_urls / untranslated_view_urls / root_view_urls
    │  Template HTML (body quasi vide) + injection des scripts Webpack
    │  plugin_data (ex. kolibriTheme via ThemeHook.get_theme())
    │
    ▼
Frontend bundle (buildConfig.js → entry)
    │
    ├─ SPA : app.js extends KolibriApp (packages/kolibri-app)
    │     → routes.js
    │     → RootVue (ex. LearnIndex.vue, UserAuthIndex.vue)
    │     → pluginModule Vuex (hotUpdate)
    │     → composables
    │     → composants enfants
    │     → Resource (kolibri/apiResource) → API REST
    │
    ├─ Side nav : SideNavEntry.js → registerNavItem(useNav)
    │
    └─ Content viewer : module.js extends ContentViewerModule
          → composant enregistré comme "{preset}_viewer"
          → ContentPage.vue → ContentViewer
```

### Chaîne thème

```
ThemeHook (un seul hook actif)
    → ThemeHook.get_theme()
    → kolibri/core/kolibri_plugin.py : plugin_data["kolibriTheme"]
    → packages/kolibri/styles/internal/initializeTheme.js
        → setBrandColors / setTokenMapping (KDS)
        → themeConfig (observable Vue)
    → $themeTokens / $themePalette / $themeBrand (KThemePlugin)
    → AppBar, SideNav, AuthBase, etc.
```

---

## 4. Arborescence des fichiers utiles

Chemins relatifs à la racine du dépôt.

### 4.1 Infrastructure plugins et cœur (ne pas modifier pour la perso UI)

| Chemin | Rôle |
|--------|------|
| `kolibri/plugins/registry.py` | Registre des plugins actifs |
| `kolibri/plugins/hooks.py` | Système de hooks |
| `kolibri/plugins/__init__.py` | `KolibriPluginBase` |
| `kolibri/core/hooks.py` | `NavigationHook`, `RoleBasedRedirectHook`, `FrontEndBaseHeadHook`, … |
| `kolibri/core/theme_hook.py` | `ThemeHook` (un seul enregistré) |
| `kolibri/core/content/hooks.py` | `ContentRendererHook`, `ContentNodeDisplayHook` |
| `kolibri/core/kolibri_plugin.py` | Bootstrap `kolibriTheme` + assets core |
| `kolibri/core/templatetags/core_tags.py` | Favicon (`theme_favicon`), titre (`siteTitle`) |
| `kolibri/core/templates/kolibri/base.html` | Template HTML de base |
| `kolibri/utils/build_config/default_plugins.py` | Liste des plugins par défaut |
| `packages/kolibri-app/src/index.js` | Classe `KolibriApp` (routes, RootVue, Vuex plugin) |
| `packages/kolibri-module/src/index.js` | `KolibriModule` — enregistrement sur le core |
| `packages/kolibri-viewer/src/index.js` | Base des lecteurs de contenu |
| `packages/kolibri/internal/pluginMediator.js` | Chargement async des viewers |

### 4.2 Thème, logo, couleurs, typographie

| Chemin | Rôle |
|--------|------|
| `kolibri/plugins/default_theme/kolibri_plugin.py` | Thème officiel (référence à remplacer) |
| `kolibri/plugins/default_theme/static/assets/default_theme/background.jpg` | Fond page de connexion |
| `kolibri/plugins/default_theme/static/assets/default_theme/kolibri-logo.svg` | Logo SVG |
| `kolibri/plugins/default_theme/static/assets/default_theme/kolibri-logo-192.png` | Icône PWA 192 |
| `kolibri/plugins/default_theme/static/assets/default_theme/kolibri-logo-512.png` | Icône PWA 512 |
| `packages/kolibri/styles/internal/initializeTheme.js` | Init thème côté client |
| `packages/kolibri/styles/internal/themeSpec.js` | Schéma / validation du thème |
| `packages/kolibri/styles/themeConfig.js` | État réactif branding UI |
| `packages/kolibri/styles/internal/main.scss` | Styles globaux + police Noto |
| `packages/kolibri/components/CoreLogo/index.vue` | Logo (custom ou KLogo) |
| `packages/kolibri/utils/internal/setupAndLoadFonts.js` | Chargement progressif des polices |
| `kolibri/core/static/assets/fonts/` | Bundles Noto par locale |
| KDS (`kolibri-design-system`) | `$themeTokens`, palettes, `setBrandColors` |

### 4.3 Connexion et création de compte (`user_auth`)

| Chemin | Rôle |
|--------|------|
| `kolibri/plugins/user_auth/kolibri_plugin.py` | Plugin, redirect anonyme, nav login |
| `kolibri/plugins/user_auth/buildConfig.js` | Bundles `app`, `login_side_nav` |
| `kolibri/plugins/user_auth/urls.py` | URL Django SPA auth |
| `kolibri/plugins/user_auth/root_urls.py` | Redirect legacy `/user/` → `/auth/` |
| `kolibri/plugins/user_auth/templates/user_auth/user_auth.html` | Template SPA |
| `kolibri/plugins/user_auth/frontend/app.js` | `UserAuthModule` + `useAuthFlow` |
| `kolibri/plugins/user_auth/frontend/routes.js` | `/signin`, `/create_account`, etc. |
| `kolibri/plugins/user_auth/frontend/views/UserAuthIndex.vue` | Racine Vue |
| `kolibri/plugins/user_auth/frontend/views/UserAuthLayout.vue` | Layout auth |
| `kolibri/plugins/user_auth/frontend/views/AuthBase.vue` | Carte auth (logo/titre/fond via thème) |
| `kolibri/plugins/user_auth/frontend/views/AuthSelect.vue` | Choix connexion / inscription |
| `kolibri/plugins/user_auth/frontend/views/FacilitySelect.vue` | Sélection de facility |
| `kolibri/plugins/user_auth/frontend/views/SignInPage/index.vue` | Connexion username/password |
| `kolibri/plugins/user_auth/frontend/views/SignInPage/PictureSignInPage.vue` | Mot de passe image |
| `kolibri/plugins/user_auth/frontend/views/SignUpPage.vue` | Auto-inscription apprenant |
| `kolibri/plugins/user_auth/frontend/views/LoginSideNavEntry.js` | Entrée nav « Se connecter » |
| `kolibri/plugins/user_auth/frontend/composables/useAuthFlow.js` | Flux facility / méthodes de sign-in |
| `kolibri/plugins/user_auth/frontend/composables/useAuthRouter.js` | Routage auth |
| `kolibri/plugins/user_auth/frontend/apiResource.js` | `SignUpResource` |
| `kolibri/plugins/user_auth/frontend/modules/pluginModule.js` | État Vuex minimal |

**Profil post-connexion :** `kolibri/plugins/user_profile/` (pas la création de compte initiale).

### 4.4 Accueil apprenant et bibliothèque (`learn`)

| Chemin | Rôle |
|--------|------|
| `kolibri/plugins/learn/kolibri_plugin.py` | Plugin Learn, redirects, nav, URLs contenu |
| `kolibri/plugins/learn/buildConfig.js` | Bundles app + side_nav + my_downloads |
| `kolibri/plugins/learn/urls.py` | URLs Django Learn |
| `kolibri/plugins/learn/api_urls.py` | API Learn (classes, lessons, courses) |
| `kolibri/plugins/learn/frontend/app.js` | `LearnModule`, garde invité |
| `kolibri/plugins/learn/frontend/routes/index.js` | Routes home/library/topics/bookmarks |
| `kolibri/plugins/learn/frontend/routes/baseRoutes.js` | Chemins nav (home, library, bookmarks) |
| `kolibri/plugins/learn/frontend/routes/classesRoutes.js` | Classes, leçons, examens, cours |
| `kolibri/plugins/learn/frontend/views/LearnIndex.vue` | Racine Vue Learn |
| `kolibri/plugins/learn/frontend/views/LearnAppBarPage.vue` | Enveloppe AppBarPage / ImmersivePage |
| `kolibri/plugins/learn/frontend/views/HomePage/index.vue` | Accueil connecté |
| `kolibri/plugins/learn/frontend/views/LibraryPage/index.vue` | Bibliothèque / canaux |
| `kolibri/plugins/learn/frontend/views/TopicsPage/index.vue` | Dossiers / topics |
| `kolibri/plugins/learn/frontend/views/TopicsContentPage.vue` | Page ressource |
| `kolibri/plugins/learn/frontend/views/ContentPage.vue` | Dispatch vers viewer / quiz / exercice |
| `kolibri/plugins/learn/frontend/views/LearnSideNavEntry.js` | Nav latérale + barre bas |
| `kolibri/plugins/learn/frontend/apiResources.js` | `LearnerClassroomResource`, `LearnerLessonResource`, `LearnerCourseResource` |
| `kolibri/plugins/learn/frontend/composables/*.js` | Progress, search, bookmarks, etc. |
| `kolibri/plugins/learn/frontend/modules/*` | Vuex legacy (classes, exams, …) |

### 4.5 Navigation principale (shell partagé)

| Chemin | Rôle |
|--------|------|
| `packages/kolibri/components/pages/AppBarPage/index.vue` | Shell : AppBar + SideNav + contenu |
| `packages/kolibri/components/pages/AppBarPage/internal/AppBar.vue` | Barre supérieure (logo thème) |
| `packages/kolibri/components/pages/AppBarPage/internal/SideNav.vue` | Menu latéral (logo, footer brandé) |
| `packages/kolibri/components/pages/AppBarPage/internal/BottomNavigationBar.vue` | Nav bas mobile (Learn) |
| `packages/kolibri/components/pages/ImmersivePage/index.vue` | Layout immersif (lecteur, examen) |
| `packages/kolibri/composables/useNav.js` | `registerNavItem()` |
| `packages/kolibri/components/BottomAppBar.vue` | Barre bas contextuelle (exercices) |

### 4.6 Chaînes, dossiers, contenus

| Chemin | Rôle |
|--------|------|
| `kolibri/plugins/learn/frontend/views/ChannelCard.vue` | Carte canal |
| `kolibri/plugins/learn/frontend/views/ChannelCardGroupGrid.vue` | Grille de canaux |
| `kolibri/plugins/learn/frontend/views/cards/*` | Cartes génériques |
| `kolibri/plugins/learn/frontend/views/HybridLearningContentCard/index.vue` | Carte contenu |
| `kolibri/plugins/learn/frontend/views/TopicsPage/*` | Navigation dossiers |
| `kolibri/plugins/learn/frontend/views/ChannelRenderer/*` | Nav custom HTML5 + thème canal |
| `packages/kolibri-common/apiResources/ChannelResource.js` | API canaux |
| `packages/kolibri-common/apiResources/ContentNodeResource.js` | API nœuds |
| `packages/kolibri-common/apiResources/ContentNodeSearchResource.js` | Recherche |
| `packages/kolibri-common/composables/useChannels.js` | Cache / fetch canaux |
| `packages/kolibri-common/components/SearchFiltersPanel/index.vue` | Filtres recherche |

### 4.7 Lecteurs (vidéo, PDF, quiz, HTML5, …)

| Plugin | Presets | Fichiers clés |
|--------|---------|---------------|
| `media_player` | VIDEO_*, AUDIO | `frontend/views/MediaPlayerIndex.vue` |
| `pdf_viewer` | DOCUMENT | `frontend/views/PdfRendererIndex.vue` |
| `html5_viewer` | HTML5_ZIP, H5P, IMSCP | `frontend/views/Html5AppRendererIndex.vue` |
| `epub_viewer` | EPUB | `frontend/views/EpubRendererIndex.vue` |
| `perseus_viewer` | EXERCISE | `frontend/views/PerseusRendererIndex.vue` |
| `qti_viewer` | QTI_ZIP | `frontend/components/QTIViewer.vue` |
| `slideshow_viewer` | SLIDESHOW | views plugin |
| `bloompub_viewer` | BLOOMPUB | views plugin |
| `safe_html5_viewer` | KPUB_ZIP | variante HTML5 sécurisée |

Orchestration Learn :

| Chemin | Rôle |
|--------|------|
| `packages/kolibri/components/internal/ContentViewer/` | Sélection `{preset}_viewer` |
| `kolibri/plugins/learn/frontend/views/ContentPage.vue` | Dispatch viewer / quiz / assessment |
| `kolibri/plugins/learn/frontend/views/AssessmentWrapper/index.vue` | Exercices (mastery) |
| `kolibri/plugins/learn/frontend/views/QuizRenderer/index.vue` | Quiz pratique |
| `kolibri/plugins/learn/frontend/views/ExamPage/index.vue` | Examen assigné |

### 4.8 API utilisées par les écrans apprenant / auth

| Resource / endpoint | Usage |
|---------------------|--------|
| Session / login (core URLs + `kolibri/client`) | Connexion |
| `SignUpResource` | Création de compte |
| `FacilityResource` / facilities (kolibri-common) | Liste facilities |
| `ChannelResource`, `ContentNodeResource`, `ContentNodeSearchResource` | Bibliothèque |
| `LearnerClassroomResource`, `LearnerLessonResource`, `LearnerCourseResource` | Accueil / devoirs |
| `ContentNodeProgressResource`, logs mastery/attempt | Progression |
| `ExamResource`, `BookmarksResource` | Examens / favoris |

---

## 5. Dépendances entre écrans

```
[Anonyme]
  → RoleBasedRedirectHook → /auth/ (user_auth)
      AuthSelect / FacilitySelect
        → SignInPage | PictureSignInPage | SignUpPage
        → session établie
  → /learn/#/library (si landing Learn + guest)

[Apprenant connecté]
  → /learn/#/home (HomePage)
      → classes / leçons / examens / cours (classesRoutes)
      → continuer l’apprentissage → TopicsContentPage
  → /learn/#/library → ChannelCard → TopicsPage (dossiers)
      → TopicsContentPage → ContentPage
          → ContentViewer → media_player | pdf | html5 | epub | …
          → AssessmentWrapper → perseus_viewer
          → QuizRenderer / ExamPage

[Navigation globale]
  AppBarPage ← LearnAppBarPage
    SideNav ← items de tous les NavigationHook
    BottomNavigationBar ← routes Learn (home/library/bookmarks)
```

Le thème influence **tous** ces écrans via `themeConfig` et `$themeTokens`, sans dépendre d’un écran particulier.

---

## 6. Points d’extension disponibles

### 6.1 Personnalisable dans un nouveau plugin Action Éducation (recommandé)

| Besoin | Mécanisme |
|--------|-----------|
| Nom du site (`<title>`, PWA) | `siteTitle` dans `ThemeHook.theme` |
| Logo AppBar / SideNav / Sign-in | `appBar.topLogo`, `sideNav.topLogo`, `signIn.topLogo` |
| Couleurs marque | `brandColors.primary/secondary` (échelles v_100…v_600) |
| Remapping tokens | `tokenMapping` (ex. `appBar` → couleur primary) |
| Fond / titre page connexion | `signIn.background`, `title`, `showTitle`, `scrimOpacity` |
| Masquer logo Kolibri footer | `showKolibriFooterLogo: false` |
| Footer brandé nav | `sideNav.brandedFooter` |
| Favicon / icônes PWA | tableau `logos` |
| CSS/fonts additionnels | `FrontEndBaseHeadHook` (injection `<head>`) |
| Nouvelle SPA / pages métier | Nouveau plugin + `WebpackBundleHook` + `NavigationHook` |
| Options déploiement | `options` / `options.ini` du plugin |

Activation typique :

```bash
kolibri plugin disable kolibri.plugins.default_theme
kolibri plugin enable <module.action_education_theme>
```

### 6.2 Nécessite extension / surcharge (avec prudence)

| Besoin | Approche |
|--------|----------|
| Textes UI non couverts par le thème | i18n Crowdin **ou** chaînes dans un plugin custom — éviter de patcher les `.vue` core |
| Réordonner / masquer items de nav | Nouveau `NavigationHook` + éventuellement désactiver plugins non voulus (`coach`, `facility`, …) |
| Écran d’accueil très différent | Plugin SPA dédié + `RoleBasedRedirectHook` — **ne pas** forker tout `learn` |
| Police globale autre que Noto | `FrontEndBaseHeadHook` + CSS override — risque a11y / i18n (Noto couvre beaucoup de scripts) |
| Thème par canal HTML5 | API `themeRenderer` (limité au chrome du modal canal) |

### 6.3 À ne pas modifier dans le cœur

| Zone | Raison |
|------|--------|
| `kolibri/core/auth/`, logger, sync Morango | Intégrité hors ligne, permissions, sync |
| Viewsets / modèles contenu | Contrat API + import canaux |
| `packages/kolibri/` composants shell (sauf usage via API publique) | Surface API partagée, mises à jour LE |
| Lecteurs (`media_player`, `pdf_viewer`, …) | Formats, tracking progression, accessibilité |
| Logique de `ContentPage` / progress tracking | Risque de casser les journaux |
| Migrations, dépendances, lockfiles | Hors périmètre UI |
| Forcer un second `ThemeHook` | `only_one_registered=True` — conflit au démarrage |

---

## 7. Risques techniques et conflits de mise à jour

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Fork de `learn` / `user_auth` | Conflits majeurs à chaque upgrade 0.19.x → 0.20 | Préférer thème + plugin satellite |
| Patch de fichiers dans `packages/kolibri` | Cassures silencieuses au rebase | Utiliser hooks / themeConfig uniquement |
| Override CSS agressif sur KDS | Régression a11y (contraste, focus) | Respecter tokens ; tester contraste |
| Remplacer Noto sans subset par locale | Affichage cassé pour certaines langues | Conserver Noto ; surcharge partielle seulement |
| Désactiver des plugins essentiels | App inutilisable | Ne désactiver que `default_theme` (+ coach/facility si volontaire) |
| Modifier `default_plugins.py` en dur | Divergence du build officiel | Enable plugin via `kolibri plugin` / packaging AE |
| Deux thèmes enregistrés | Erreur hook | Toujours disable `default_theme` |
| Personnaliser AuthBase / SignIn en copiant le plugin | Maintenance lourde | Thème + `FrontEndBaseHeadHook` d’abord |
| Toucher progress / exam APIs | Données hors ligne incohérentes | Lecture seule côté UI branding |

---

## 8. Plan progressif de personnalisation UI

### Phase 0 — Audit (cette étape)
- Documenter l’architecture ✅
- Aucune modification visuelle

### Phase 1 — Identité visuelle minimale (thème seul)
- Créer plugin `action_education_theme` (ou module externe)
- Remplacer `default_theme`
- Livrer : `siteTitle`, logos, `brandColors`, fond sign-in, favicons
- **Ne pas** toucher learn/auth/core

### Phase 2 — Affinage branding
- `tokenMapping`, couleurs AppBar explicites
- Footer side nav Action Éducation
- `showKolibriFooterLogo: false` si requis par la charte
- Vérifier PWA / favicon

### Phase 3 — Textes et i18n
- Traductions FR (et langues locales Guinée si besoin) via processus i18n Kolibri
- Éviter les chaînes en dur dans des `.vue` forkés

### Phase 4 — Ajustements UX ciblés (si besoin métier)
- Plugin UI léger (landing, page d’aide AE) via `NavigationHook`
- Redirections `RoleBasedRedirectHook` uniquement si le parcours AE l’exige
- Toujours composer avec Learn, ne pas le remplacer

### Phase 5 — Hors scope immédiat (à traiter plus tard)
- Contenu pédagogique / canaux
- Rôles coach / facility
- Sync / SoUD
- Packaging déploiement terrain

---

## 9. Première proposition limitée (nom, logo, couleurs, typographie)

### 9.1 Nom
- `siteTitle`: **"Action Éducation Guinée"** (ou libellé validé par le partenaire)
- `signIn.title`: même libellé ou slogan court validé
- `sideNav.title` (optionnel) : nom court pour le tiroir

### 9.2 Logo
Fournir dans le plugin thème (ex. `static/assets/action_education_theme/`) :
- Logo principal SVG (AppBar, SideNav, Sign-in) — fond transparent, lisible sur couleur primary
- Favicon `.ico` 32×32
- Icônes PWA 192×192 et 512×512 PNG (`maskable` si possible)

Configurer :
- `appBar.topLogo`, `sideNav.topLogo`, `signIn.topLogo` (avec `alt` accessible)
- `logos[]` pour favicon + PWA

### 9.3 Couleurs
Générer des échelles Material (`v_100` … `v_600`) pour **primary** et **secondary** (outil cité dans `ThemeHook` : https://materialpalettes.com/), à partir de la charte Action Éducation.

Exemple de structure (valeurs à remplacer par la charte réelle) :

```python
"brandColors": {
    "primary": {
        "v_100": "#…", "v_200": "#…", "v_300": "#…",
        "v_400": "#…", "v_500": "#…", "v_600": "#…",
    },
    "secondary": {
        "v_100": "#…", "v_200": "#…", "v_300": "#…",
        "v_400": "#…", "v_500": "#…", "v_600": "#…",
    },
},
"tokenMapping": {
    # optionnel : aligner l’AppBar sur la primary
    # "appBar": "brand.primary.v_600",
},
"appBar": {
    "background": "#…",  # contrasté avec textColor
    "textColor": "#FFFFFF",
},
```

Vérifier contraste WCAG sur : texte AppBar, boutons primary, liens, états erreur/succès (tokens sémantiques).

### 9.4 Typographie
- **Phase 1 :** conserver Noto (défaut Kolibri) — aucun changement.
- `signIn.titleStyle` peut ajuster poids/taille du titre de connexion uniquement.
- Police institutionnelle : seulement en Phase 2+ via `FrontEndBaseHeadHook`, après tests multilingues et hors ligne (fichiers WOFF embarqués).

### 9.5 Page de connexion
- `signIn.background` : image locale (pas d’URL externe en production hors ligne)
- `backgroundImgCredit` si requis
- `scrimOpacity` entre 0 et 1 pour lisibilité du formulaire

---

## 10. Plan de tests — fonctionnement hors ligne intact

Objectif : prouver que le branding n’altère ni auth, ni contenu local, ni progression.

### 10.1 Préparation
- Instance dev isolée (`KOLIBRI_HOME` dédié) — déjà le cas du projet
- Contenu importé localement (au moins 1 canal avec vidéo, PDF, exercice/quiz)
- **Aucun** accès réseau requis pour la batterie hors ligne (couper le réseau ou tester sur LAN fermé)
- Activer le plugin thème AE, désactiver `default_theme`, redémarrer Kolibri

### 10.2 Smoke UI branding
- [ ] Titre navigateur / onglet = `siteTitle`
- [ ] Logo AE visible sur Sign-in, AppBar, SideNav
- [ ] Couleurs primary appliquées aux boutons / accents
- [ ] Favicon AE
- [ ] Pas d’erreur console liée à `themeSpec` / images 404

### 10.3 Auth (sans toucher la logique)
- [ ] Connexion username/password OK
- [ ] Création de compte (si autorisée par facility) OK
- [ ] Déconnexion / reconnexion OK
- [ ] Accès invité (si activé) → Library OK

### 10.4 Parcours apprenant hors ligne
- [ ] Home : classes / continuer l’apprentissage s’affichent
- [ ] Library : canaux listés depuis le stockage local
- [ ] Navigation dossiers (TopicsPage) OK
- [ ] Lecture **vidéo** : lecture, pause, `updateProgress`
- [ ] Lecture **PDF** : pages, scroll
- [ ] **Exercice / quiz** : réponse, score, reprise
- [ ] Favoris (bookmarks) si utilisés

### 10.5 Progression et reprise
- [ ] Progress barre / « continuer » après rechargement page
- [ ] Après redémarrage serveur : historique toujours présent (SQLite local)
- [ ] Aucune régression sur ExamPage si examens assignés

### 10.6 Régression technique
- [ ] `pnpm test-jest` ciblé si composants AE ajoutés plus tard
- [ ] Pas de second `ThemeHook` actif
- [ ] Plugins essentiels toujours enabled (`learn`, `user_auth`, viewers, `default_theme` remplacé)
- [ ] Build frontend OK (`pnpm` / webpack) avec assets thème

### 10.7 Hors ligne strict
- [ ] Couper Internet : connexion + lecture contenus locaux OK
- [ ] Aucun appel CDN pour logo/fond/police du thème AE (tout en `static/`)
- [ ] PWA / cache : icônes locales servies

---

## 11. Recommandation architecture plugin Action Éducation

```
kolibri/plugins/action_education_theme/   # ou package Python externe
├── kolibri_plugin.py                    # ThemeHook unique
├── static/assets/action_education_theme/
│   ├── logo.svg
│   ├── signin-background.jpg
│   ├── favicon.ico
│   ├── logo-192.png
│   └── logo-512.png
└── (optionnel plus tard)
    action_education_ui/                 # SPA / nav / pages métier
```

**Règle d’or :** tout ce qui est cosmétique → thème ; tout ce qui est parcours métier → nouveau plugin ; rien dans `kolibri/core` ni fork de `learn`/`user_auth` pour la v1 branding.

---

## 12. Fichiers de référence « modèle à copier »

Pour la Phase 1, s’inspirer uniquement de :

1. `kolibri/plugins/default_theme/kolibri_plugin.py`
2. `kolibri/core/theme_hook.py`
3. `packages/kolibri/styles/internal/themeSpec.js`
4. Consommation : `AuthBase.vue`, `AppBar.vue`, `SideNav.vue`

---

## 13. Conclusion

L’interface apprenant Kolibri est déjà structurée pour une **personnalisation non invasive** via un plugin de thème. Pour Action Éducation Guinée, la première livrable UI doit se limiter à **nom, logos, couleurs (et typographie Noto inchangée)**. Toute refonte d’écrans Learn/Auth peut venir ensuite dans un plugin séparé, en composant avec l’existant.

**Prochaine étape (hors de cet audit) :** créer le plugin thème et valider la checklist §10 — sans modifier le cœur.
