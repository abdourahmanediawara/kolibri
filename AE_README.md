# AE Apprendre — Index documentation

Plateforme de formation **Action Éducation** sur Kolibri (branche `action-education-v1`).

## Accès rapide (instance de développement / pilote)

| Élément | Valeur |
|---------|--------|
| URL portail | `http://127.0.0.1:8000/fr-fr/portal/` |
| URL LAN | `http://<IP_LAN>:8000/fr-fr/portal/` |
| Port AE | **8000** (ne pas utiliser **8080**) |
| `KOLIBRI_HOME` | `$HOME/.kolibri-action-education-dev` |

### Démarrage

```bash
cd /chemin/vers/kolibri
source .venv/bin/activate
export KOLIBRI_HOME="$HOME/.kolibri-action-education-dev"
unset KOLIBRI_RUN_MODE   # assets prod
kolibri start --foreground --port=8000
```

### Build frontend portail

```bash
source .venv/bin/activate
export KOLIBRI_HOME="$HOME/.kolibri-action-education-dev"
pnpm exec kolibri-build prod --plugins action_education_portal --transpile
# ou build complet : pnpm exec kolibri-build prod --file ./build_tools/build_plugins.txt --transpile
```

Après rebuild : vider le cache navigateur pour `127.0.0.1:8000` (hard refresh).

## Rôles

| Rôle Kolibri | Compte exemple | Atterrissage | Capacité principale |
|--------------|----------------|--------------|---------------------|
| LEARNER | `ae_learner` | `#/ae/learn` | Contenu, exercices, progression |
| FACILITY_COACH | `ae_coach` | `#/ae/coach` | Sessions, apprenants, résultats |
| ADMIN | `ae_admin` | `#/ae/admin` | Établissement (pas Device par défaut) |
| SUPERUSER / DevicePermissions | ex. `adiawara` | Device si applicable | Administration technique |

Ne jamais committer les mots de passe. Voir `docs/howtos/ae_device_permissions.md` pour l’admin technique.

## Importation des contenus

```bash
export KOLIBRI_HOME="$HOME/.kolibri-action-education-dev"
kolibri manage importchannel network <CHANNEL_ID>
kolibri manage importcontent --node_ids <id1>,<id2> network <CHANNEL_ID>
# ou import complet : kolibri manage importcontent network <CHANNEL_ID>
```

Aussi possible via l’UI Device (compte avec `can_manage_content`).

## Test hors connexion

- Procédure complète : `docs/howtos/ae_offline_wan_lan_test.md`
- Checklist Wi‑Fi : `AE_OFFLINE_WIFI.md`
- Contrôles auto : `python scripts/ae_offline_checks.py [--base-url http://127.0.0.1:8000]`

## Sauvegarde et restauration

Voir `AE_BACKUP_RESTORE.md` :

```bash
export KOLIBRI_HOME="$HOME/.kolibri-action-education-dev"
python scripts/ae_backup.py --dest ~/Backups/ae-apprendre
```

## Limites connues (non bloquantes)

1. Checklist manuelle WAN/LAN à signer avant go-live terrain.
2. Admin établissement ≠ admin Device (permissions explicites requises).
3. Scores d’exercice affichés seulement s’il existe des tentatives Kolibri (`AttemptLog`).
4. Patch core 004 **supprimé** — redirections gérées par le plugin portail (`AE_KOLIBRI_PATCHES.md`).

## Documents

| Document | Contenu |
|----------|---------|
| `AE_DEPLOYMENT.md` | Installation serveur / Wi‑Fi |
| `AE_DEVELOPMENT.md` | Environnement de développement |
| `AE_ARCHITECTURE.md` | Plugins, flux, API |
| `AE_KOLIBRI_PATCHES.md` | Modifications du cœur Kolibri |
| `AE_BACKUP_RESTORE.md` | Sauvegarde / restauration |
| `AE_OFFLINE_WIFI.md` | Checklist hors ligne |
| `docs/howtos/ae_pilot_checklist.md` | Validation manuelle pilote |
| `docs/howtos/ae_pilot_report.md` | Rapport de version pilote |
| `docs/howtos/ae_offline_wan_lan_test.md` | Scénarios WAN/LAN |
| `docs/howtos/ae_device_permissions.md` | Accorder DevicePermissions |
| `AE_USER_GUIDE_*.md` | Guides FR admin / formateur / apprenant |

## Scripts

```bash
python scripts/ae_offline_checks.py [--fix-plugin-order] [--base-url URL]
python scripts/ae_backup.py --dest ~/Backups/ae-apprendre
```

## Pilote

1. Exécuter `docs/howtos/ae_pilot_checklist.md`.
2. Lire `docs/howtos/ae_pilot_report.md`.
3. Après validation manuelle uniquement : créer le tag Git et pousser (commandes dans le rapport — **ne pas automatiser**).
