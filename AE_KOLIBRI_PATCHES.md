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
