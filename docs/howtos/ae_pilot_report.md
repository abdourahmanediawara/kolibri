# Rapport de version pilote — Action Éducation

**Date :** 2026-07-24  
**Branche :** `action-education-v1`  
**Commit de référence :** `fa5c6f095b67403b7eb4c3f9d6413aaede876c54`  
**Commit docs/tests pilote :** *(à renseigner après commit de préparation)*  
**Verdict technique (automatisé) :** **prête pour pilote** sous réserve de la checklist manuelle  

## 1. Périmètre livré

- Portail AE (`/fr-fr/portal/`) avec espaces apprenant / formateur / administrateur
- Redirections post-login via hooks plugin (sans patch core 004)
- Résultats d’exercices formateur branchés sur `ContentSummaryLog` / `MasteryLog` / `AttemptLog`
- Séparation admin établissement vs admin technique Device
- Documentation déploiement, hors connexion, DevicePermissions, checklist pilote

## 2. Fichiers principaux

| Zone | Chemins |
|------|---------|
| Portail | `action_education_portal/` (`kolibri_plugin.py`, `redirects.py`, `apps.py`, `frontend/`, `static/`) |
| Formations / résultats | `action_education_training/results.py`, `api_urls.py` |
| Thème | `action_education_theme/` |
| Docs | `AE_README.md`, `AE_DEPLOYMENT.md`, `AE_KOLIBRI_PATCHES.md`, `docs/howtos/ae_*.md` |
| Scripts | `scripts/ae_offline_checks.py`, `scripts/ae_backup.py` |

## 3. Tests exécutés (préparation pilote)

| Suite | Commande | Résultat |
|-------|----------|----------|
| Pytest portail | `pytest action_education_portal/test/ -q` | **16 passed, 5 skipped** |
| Pytest training | `pytest action_education_training/test/ -q` | **18 passed** |
| Jest permissions/nav | `pnpm test-jest …useAePermissions.spec.js …useAeNav.spec.js` | **8 passed** |
| Build prod portail | `pnpm exec kolibri-build prod --plugins action_education_portal --transpile` | **OK** (~13 s) |

Contrôles live (instance `…-dev`, port 8000) :

- Redirections 3 rôles → `/fr-fr/portal/#/ae/{learn,coach,admin}`
- Accès direct `/fr-fr/learn/` sans boucle (hops=0)
- Pages natives coach/facility/device joignables
- `DeviceRedirect` conservé (hook device toujours enregistré)

Notes :

- `test_e2e_roles.py` **skipped** sauf `AE_E2E=1` (CSV `/tmp` non versionné ; DB pytest isolée).
- `test_redirects.py` couvre désinscription Learn/Coach/Facility, maintien Device, hash `#/ae/…`.

## 4. Patch 004

- **Absent** de `kolibri/core/views.py` (`get_url_by_role` upstream).
- Remplacé par `prefer_portal_role_redirects()` au démarrage du plugin portail.
- Documenté dans `AE_KOLIBRI_PATCHES.md` comme **SUPPRIMÉ**.

## 5. Limites non bloquantes connues

1. Validation manuelle WAN coupé / LAN actif encore à signer (`docs/howtos/ae_offline_wan_lan_test.md`).
2. `ae_admin` n’a pas DevicePermissions : normal ; admin technique via superuser / compte dédié (`docs/howtos/ae_device_permissions.md`).
3. Score quiz affiché seulement s’il existe des `AttemptLog` (pas inventé depuis `progress=1`).
4. `GET /api/device/freespace/` reste accessible à tout utilisateur authentifié (comportement Kolibri) — UI AE ne s’y fie pas pour l’ACL.
5. Port **8080** : ne pas utiliser pour cette instance AE.

## 6. Procédure de retour arrière

```bash
cd /chemin/vers/kolibri
# Sauvegarder KOLIBRI_HOME d’abord (AE_BACKUP_RESTORE.md)

git checkout action-education-v1
git reset --hard 5c719f7d57   # commit précédent fa5c6f095b ; adapter si d’autres commits suivent

export KOLIBRI_HOME="$HOME/.kolibri-action-education-dev"
# restaurer archive si besoin
kolibri start --port 8000
```

Ne jamais `reset --hard` sans sauvegarde préalable de `KOLIBRI_HOME`.

## 7. Commandes post-validation manuelle (ne pas exécuter avant checklist)

```bash
# Après docs/howtos/ae_pilot_checklist.md entièrement cochée :
git tag -a ae-pilot-2026-07-24 fa5c6f095b -m "Action Éducation — version pilote"
# Si un commit de docs pilote a suivi fa5c6f095b, tagger ce HEAD à la place.

git push -u origin action-education-v1
git push origin ae-pilot-2026-07-24
```
