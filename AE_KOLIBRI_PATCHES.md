# AE Apprendre — Patches au code Kolibri original

Toute modification hors plugins Action Éducation doit être listée ici.

## Patch 001 — Splash Learn (webpack publicPath + CSP)

**Date :** 2026-07-23  
**Branche :** `action-education-v1`  
**Symptôme :** `/fr-fr/learn/` reste indéfiniment sur le splash (HTML `flapping-kolibri`). Auth/Device peuvent fonctionner car leurs apps sont souvent servies depuis `/static/`, alors que Learn charge son bundle depuis le webpack-dev-server.

### Cause racine (preuves)

1. `kolibri-build` publiait les assets avec `publicPath = http://localhost:3000/...` alors que le serveur webpack écoute sur `127.0.0.1:3000`.
2. Sous Windows, `localhost` résout souvent vers IPv6 `::1`. Une autre application Node peut occuper `:::3000` et répondre **HTTP 200 avec du HTML**.
3. Le navigateur exécute donc du HTML à la place du JS → `window.kolibriCoreAppGlobal` n’est jamais défini → Vue ne remplace jamais le splash.
4. Après passage à `127.0.0.1` dans le `publicPath`, la **CSP** de `settings.dev` n’autorisait que `localhost:3000`, donc le navigateur bloquait les scripts (`Network.loadingFailed` / `blocked=csp`).

Preuves reproductibles (environnement AE) :

- `Invoke-WebRequest http://localhost:3000/.../learn.app.js` → HTML (`text/html`, ~11 Ko).
- `Invoke-WebRequest http://127.0.0.1:3000/.../learn.app.js` → JS webpack (~5 Mo).
- CDP après correctif : `hasFlapping=false`, `hasCore=true`, URL `#/library`, texte « Apprendre ».

### Fichiers modifiés

| Fichier | Changement |
|---------|------------|
| `packages/kolibri-build/src/cli.js` | Passe `address: options.host` au config webpack (`127.0.0.1` par défaut). |
| `kolibri/deployment/default/webpack_dev_hosts.py` | Helper `webpack_dev_server_hosts()` (localhost + 127.0.0.1). |
| `kolibri/deployment/default/settings/dev.py` | CSP utilise ce helper pour autoriser les deux hôtes. |

### Pourquoi pas un plugin

Les URLs des bundles et la CSP sont générées par le build / settings Django du cœur. Aucun hook de thème ou de plugin frontend ne peut corriger le `publicPath` webpack ni élargir la CSP de façon fiable.

### Tests de régression

- `packages/kolibri-build/src/__tests__/webpack.config.plugin.spec.js` — `publicPath` utilise `address` (127.0.0.1).
- `kolibri/deployment/default/test/test_dev_csp_webpack_hosts.py` — CSP contient `127.0.0.1:3000`.

### Report lors d’une mise à jour Kolibri

1. Vérifier que `createWebpackCompiler` dans `packages/kolibri-build/src/cli.js` passe toujours `address: options.host` (ou équivalent).
2. Vérifier que `kolibri/deployment/default/settings/dev.py` autorise `127.0.0.1:{WEBPACK_DEV_SERVER_PORT}` dans `CSP_*`.
3. Relancer les deux tests ci-dessus.
4. Sur Windows/WSL : ouvrir `http://127.0.0.1:8000/fr-fr/learn/` et confirmer que le splash disparaît.

## Patch 002 — siteTitle sur Auth (onglet + pied de page)

**Date :** 2026-07-23  
**Symptôme :** l’écran Auth affichait encore « Kolibri {version} » et des titres d’onglet « … - Kolibri » malgré le thème AE.

### Cause

`siteTitle` du ThemeHook était utilisé côté serveur (`{% site_title %}`) mais n’était pas exposé dans `themeConfig` / `themeSpec` côté Vue. AuthBase et UserAuthLayout hardcodent « Kolibri ».

### Fichiers

| Fichier | Changement |
|---------|------------|
| `packages/kolibri/styles/internal/themeSpec.js` | Ajoute `siteTitle`. |
| `packages/kolibri/styles/themeConfig.js` | Expose `siteTitle` au client. |
| `kolibri/plugins/user_auth/frontend/views/AuthBase.vue` | Pied de page version utilise `siteTitle` si défini. |
| `kolibri/plugins/user_auth/frontend/views/UserAuthLayout.vue` | Titre d’onglet utilise `siteTitle` / libellé Kolibri. |

### Pourquoi pas un plugin seul

Les chaînes de titre et de version sont dans les vues `user_auth` du cœur ; ThemeHook ne fournit pas de clé pour les remplacer sans ce bridge `siteTitle`.

## Patch 003 — Activer les plugins AE dans settings de test

**Date :** 2026-07-23
**Fichier :** `kolibri/deployment/default/settings/test.py`
**Pourquoi :** pytest utilise un `KOLIBRI_HOME` isolé. Sans `plugins.json` AE avant le chargement de `base`, les modèles de `action_education_training` ne sont pas dans `INSTALLED_APPS`.
**Changement :** avant `from .base import *`, créer `plugins.json` avec les plugins AE installés (s’ils sont importables) + `DEFAULT_PLUGINS`.
**Report :** réappliquer ce préambule après une mise à jour Kolibri.

## Patch 004 — Priorité des redirections RoleBasedRedirectHook (portail AE)

**Statut :** **SUPPRIMÉ** (2026-07-24) — remplacé par une solution plugin.

### Solution actuelle (sans modification du core)

| Fichier | Rôle |
|---------|------|
| `action_education_portal/redirects.py` | Désenregistre `LearnRedirect`, `CoachRedirect`, `FacilityRedirect` |
| `action_education_portal/apps.py` | `AppConfig.ready()` appelle `prefer_portal_role_redirects()` après le chargement de tous les plugins |
| `action_education_portal/kolibri_plugin.py` | URLs de redirection avec hash `#/ae/learn|coach|admin` |

`DeviceRedirect` (SUPERUSER) reste actif pour l’administration technique.

### Ancien correctif core (ne plus appliquer)

Le tri dans `kolibri/core/views.py` `get_url_by_role` a été **retiré**. Ne pas le réintroduire sauf si le désenregistrement des hooks échoue après une mise à jour Kolibri (API `remove_hook_from_registries` cassée).

### Vérification

Après démarrage : login `ae_learner` / `ae_coach` / `ae_admin` → `/fr-fr/portal/#/ae/…` via `/fr-fr/redirectuser/`.
