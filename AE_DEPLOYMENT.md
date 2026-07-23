# AE Apprendre — Déploiement serveur local

## Objectif

Installer et faire tourner **AE Apprendre** sur un ordinateur serveur (Windows / Linux / WSL) accessible aux tablettes et téléphones via le Wi‑Fi local, **sans Internet**.

## Ports

| Usage | Port | Règle |
|-------|------|--------|
| AE Apprendre | **8000** | Port de production / atelier |
| Autre installation Kolibri | **8080** | Ne pas utiliser pour AE en développement |

## Prérequis

- Python 3.11+, Node 20 + pnpm (si rebuild frontend)
- Espace disque pour contenus + base SQLite
- Pare-feu : autoriser le port 8000 en entrée sur le réseau local

## Installation rapide

```bash
cd /chemin/vers/kolibri
source .venv/bin/activate   # ou créer un venv dédié

export KOLIBRI_HOME="$HOME/.kolibri-action-education"
export KOLIBRI_RUN_MODE=""   # vide = production

python -m pip install -e .
python -m pip install -e ./action_education_theme
python -m pip install -e ./action_education_portal
python -m pip install -e ./action_education_training

kolibri plugin disable kolibri.plugins.default_theme
kolibri plugin enable action_education_theme
kolibri plugin enable action_education_portal
kolibri plugin enable action_education_training

# Important : portal avant learn
python scripts/ae_offline_checks.py --kolibri-home "$KOLIBRI_HOME" --fix-plugin-order

kolibri manage migrate
# Provisionner l’appareil au premier démarrage via l’assistant web
```

Build frontend (une fois, hors mode hot) :

```bash
pnpm install
pnpm run build
```

## Configuration réseau (Wi‑Fi)

Éditer `$KOLIBRI_HOME/options.ini` :

```ini
[Deployment]
HTTP_PORT = 8000
LISTEN_ADDRESS = 0.0.0.0
```

Démarrer :

```bash
export KOLIBRI_HOME="$HOME/.kolibri-action-education"
kolibri start --port 8000
```

Sur un téléphone du même Wi‑Fi : `http://IP_DU_SERVEUR:8000/fr-fr/user/`

## Mise à jour

1. Arrêter Kolibri (`kolibri stop`).
2. Sauvegarder (voir `AE_BACKUP_RESTORE.md`).
3. Mettre à jour le code (`git pull` sur `action-education-v1`).
4. `pip install -e` des trois plugins AE + `kolibri manage migrate`.
5. Relire `AE_KOLIBRI_PATCHES.md` (re-appliquer si besoin).
6. `python scripts/ae_offline_checks.py --fix-plugin-order`
7. Redémarrer.

## Vérifications

```bash
python scripts/ae_offline_checks.py --base-url http://127.0.0.1:8000
```

Checklist terrain : `AE_OFFLINE_WIFI.md`.

## Développement

Voir `AE_DEVELOPMENT.md` (`KOLIBRI_RUN_MODE=dev`, `pnpm run devserver`).
