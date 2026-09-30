# AE Apprendre — Tests hors ligne & Wi‑Fi local

**Phase 9** — vérifier que la plateforme fonctionne sans Internet et sur un réseau local.

## Prérequis

```powershell
. .\scripts\ae_env_windows.ps1  # voir AE_DEVELOPMENT.md
```

- Instance isolée uniquement (ne jamais toucher le port **8080**).
- Contenu importé localement recommandé (au moins 1 canal).
- Ouvrir toujours `http://127.0.0.1:…` (pas `localhost`) sous Windows/WSL — Patch 001.

## Contrôles automatiques

```bash
# Corrige l’ordre des plugins si besoin (portal avant learn)
python scripts/ae_offline_checks.py --fix-plugin-order

# Checks hors ligne (sans serveur)
python scripts/ae_offline_checks.py

# Smoke HTTP si le serveur tourne
python scripts/ae_offline_checks.py --base-url http://127.0.0.1:8000

pytest action_education_theme/test/test_offline_assets.py \
       action_education_portal/test/test_offline_sources.py -q
```

## Accès Wi‑Fi (téléphones / tablettes)

Kolibri écoute par défaut sur `LISTEN_ADDRESS = 0.0.0.0` (`options.ini` → section `[Deployment]`).

1. Sur la machine serveur, noter l’IP LAN (ex. `192.168.1.20`).
2. Démarrer AE Apprendre sur le port **8000**.
3. Depuis un téléphone sur le **même Wi‑Fi** : `http://192.168.1.20:8000/fr-fr/user/`
4. Si la connexion échoue : firewall Windows/WSL, ou `LISTEN_ADDRESS` forcé à `127.0.0.1` (à remettre à `0.0.0.0`).

En mode `pnpm run devserver`, le webpack hot-reload écoute en local ; pour un atelier terrain préférer un build de production (`kolibri start` / assets compilés) — voir `AE_DEPLOYMENT.md` (Phase 11).

### Atelier depuis un PC Windows

En mode dev, les pages chargent leur JavaScript depuis `127.0.0.1:3001` : les autres appareils obtiennent une page blanche. Pour partager la plateforme :

1. Arrêter le serveur de dev, puis compiler une fois : `pnpm run build` (après `. .\scripts\ae_env_windows.ps1`).
2. Lancer : `powershell -ExecutionPolicy Bypass -File scripts\ae_lan_windows.ps1` (mode production, affiche les adresses à donner).
3. Pare-feu, dans un PowerShell administrateur (réseau Wi-Fi classé *Privé*) :
   `New-NetFirewallRule -DisplayName "AE Apprendre (port 8000)" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow -Profile Private`
4. Tester depuis un téléphone sur le même Wi-Fi : `http://<IP du PC>:8000`.

Revenir au développement : `scripts\ae_devserver_windows.ps1`.

## Checklist manuelle

### Hors ligne strict

- [ ] Couper Internet (Wi‑Fi data / Ethernet) sur le serveur
- [ ] Connexion utilisateur OK
- [ ] `/fr-fr/portal/` affiche l’accueil AE
- [ ] Lecture d’un contenu local (vidéo / PDF / quiz)
- [ ] Création session + présence (formateur)
- [ ] Export CSV certificats / présences téléchargeable
- [ ] Aucune erreur console liée à un CDN / police distante
- [ ] Redémarrer le serveur : utilisateurs, progression et formations AE toujours présents

### Réseau local

- [ ] Téléphone/tablette ouvre l’URL LAN
- [ ] Connexion + lecture contenus OK depuis le client
- [ ] Formateur marque les présences depuis un second appareil

### Non-régression Kolibri

- [ ] Auth (`/user/`)
- [ ] Learn (`/learn/`)
- [ ] Coach (`/coach/`)
- [ ] Facility (`/facility/`)
- [ ] Device (`/device/`)

## Ordre des plugins (critique)

Dans `$KOLIBRI_HOME/plugins.json`, `action_education_portal` doit apparaître **avant** `kolibri.plugins.learn` dans `INSTALLED_PLUGINS`, sinon la redirection LEARNER part vers Learn au lieu du portal.

`kolibri.plugins.default_theme` doit rester dans `DISABLED_PLUGINS` tant que `action_education_theme` est actif.
