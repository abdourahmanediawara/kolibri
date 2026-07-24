# AE Apprendre — Déploiement serveur local

## Objectif

Installer et faire tourner **AE Apprendre** sur un ordinateur serveur (Windows / Linux / WSL) accessible aux tablettes et téléphones via le Wi‑Fi local, **sans Internet**.

## Ports

| Usage | Port | Règle |
|-------|------|--------|
| AE Apprendre | **8000** | Port de production / atelier / pilote |
| Autre installation Kolibri | **8080** | Ne pas utiliser pour AE |

## Prérequis

- Python 3.11+, Node 20 + pnpm (si rebuild frontend)
- Espace disque pour contenus + base SQLite
- Pare-feu : autoriser le port 8000 en entrée sur le réseau local

## Installation rapide

```bash
cd /chemin/vers/kolibri
source .venv/bin/activate   # ou créer un venv dédié

export KOLIBRI_HOME="$HOME/.kolibri-action-education"
# Développement / pilote local souvent :
# export KOLIBRI_HOME="$HOME/.kolibri-action-education-dev"
unset KOLIBRI_RUN_MODE   # production = servir les assets buildés

python -m pip install -e .
python -m pip install -e ./action_education_theme
python -m pip install -e ./action_education_portal
python -m pip install -e ./action_education_training

kolibri plugin disable kolibri.plugins.default_theme
kolibri plugin enable action_education_theme
kolibri plugin enable action_education_portal
kolibri plugin enable action_education_training

# Ordre plugins (outil historique ; les redirections AE ne dépendent plus du seul ordre)
python scripts/ae_offline_checks.py --kolibri-home "$KOLIBRI_HOME" --fix-plugin-order

kolibri manage migrate
# Provisionner l’appareil au premier démarrage via l’assistant web
```

## Build frontend

```bash
pnpm install
# Portail seul (rapide) :
pnpm exec kolibri-build prod --plugins action_education_portal --transpile
# Ou build complet plugins Kolibri + AE :
pnpm exec kolibri-build prod --file ./build_tools/build_plugins.txt --transpile
```

## Configuration réseau (Wi‑Fi)

Éditer `$KOLIBRI_HOME/options.ini` :

```ini
[Deployment]
HTTP_PORT = 8000
LISTEN_ADDRESS = 0.0.0.0
```

## Démarrage

```bash
export KOLIBRI_HOME="$HOME/.kolibri-action-education"   # ou …-dev
unset KOLIBRI_RUN_MODE
kolibri start --port 8000
# ou : kolibri start --foreground --port=8000
```

### URLs

| Contexte | URL |
|----------|-----|
| Serveur local | `http://127.0.0.1:8000/fr-fr/portal/` |
| Client Wi‑Fi | `http://<IP_LAN>:8000/fr-fr/portal/` |
| Auth | `http://127.0.0.1:8000/fr-fr/auth/` |

Utiliser **127.0.0.1** plutôt que `localhost` sous Windows/WSL (voir patch 001 dans `AE_KOLIBRI_PATCHES.md`).

## Rôles et redirections

Après connexion, `/fr-fr/redirectuser/` envoie vers le portail AE :

- apprenant → `/fr-fr/portal/#/ae/learn`
- formateur → `/fr-fr/portal/#/ae/coach`
- admin établissement → `/fr-fr/portal/#/ae/admin`

Mécanisme : désenregistrement des hooks Learn/Coach/Facility au démarrage du plugin portail (`action_education_portal/redirects.py`). **Pas de patch dans `kolibri/core/views.py`.**  
Les URL natives `/fr-fr/learn/`, `/coach/`, `/facility/`, `/device/` restent accessibles directement.

## Importation des contenus

```bash
export KOLIBRI_HOME=…
kolibri manage importchannel network <CHANNEL_ID>
kolibri manage importcontent network <CHANNEL_ID>
# ou nœuds ciblés :
kolibri manage importcontent --node_ids <id1>,<id2> network <CHANNEL_ID>
```

Admin technique (Device) : compte avec DevicePermissions — `docs/howtos/ae_device_permissions.md`.

## Mise à jour

1. Arrêter Kolibri (`kolibri stop`).
2. Sauvegarder (voir `AE_BACKUP_RESTORE.md`).
3. Mettre à jour le code (`git pull` sur `action-education-v1`).
4. `pip install -e` des trois plugins AE + `kolibri manage migrate`.
5. Relire `AE_KOLIBRI_PATCHES.md` (patches 001–003 ; 004 **ne plus appliquer**).
6. Rebuild frontend si besoin + redémarrer.

## Vérifications

```bash
python scripts/ae_offline_checks.py --base-url http://127.0.0.1:8000
pytest action_education_portal/test/ action_education_training/test/ -q
pnpm test-jest action_education_portal/frontend/__tests__/useAePermissions.spec.js \
  action_education_portal/frontend/__tests__/useAeNav.spec.js
```

Checklist terrain hors ligne : `AE_OFFLINE_WIFI.md` + `docs/howtos/ae_offline_wan_lan_test.md`.  
Checklist pilote : `docs/howtos/ae_pilot_checklist.md`.

## Sauvegarde / restauration

`AE_BACKUP_RESTORE.md` — sauvegarder tout `$KOLIBRI_HOME` (DB + `content/` + `plugins.json`).

## Développement

Voir `AE_DEVELOPMENT.md` (`KOLIBRI_RUN_MODE=dev`, `pnpm run devserver`).
