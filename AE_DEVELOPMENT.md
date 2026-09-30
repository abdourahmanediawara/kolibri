# AE Apprendre — Développement

## Prérequis

- Windows (PowerShell), Python 3.12, Node **20.19.3**, pnpm
- Ne jamais utiliser le port **8080** (installation protégée : `~/.kolibri`, `kolibri` global du PATH)
- Webpack sur le port **3001** (3000 est souvent pris par d'autres projets)

## Environnement obligatoire

Dans chaque terminal PowerShell, depuis la racine du dépôt :

```powershell
. .\scripts\ae_env_windows.ps1
```

Le script définit `KOLIBRI_HOME` (`%USERPROFILE%\.kolibri-action-education-dev`), `KOLIBRI_RUN_MODE=dev`,
`WEBPACK_DEV_SERVER_PORT=3001`, et place le venv du projet puis Node 20 en tête du `PATH`.
Sans lui, `kolibri` pointe vers l'installation protégée.

Sous Linux/WSL, l'équivalent est :

```bash
source .venv/bin/activate
export KOLIBRI_HOME="$HOME/.kolibri-action-education-dev"
export KOLIBRI_RUN_MODE="dev"
export WEBPACK_DEV_SERVER_PORT=3001
```

## Installation (une fois)

```powershell
py -3.12 -m venv .venv
# Node 20.19.3 : décompresser https://nodejs.org/dist/v20.19.3/node-v20.19.3-win-x64.zip
# dans %LOCALAPPDATA%\ae-tools\ (node-sass 9 n'a pas de binaire Windows pour Node 22).
. .\scripts\ae_env_windows.ps1
python -m pip install -r requirements\dev.txt -r requirements\test.txt
python -m pip install -e .
pnpm install
```

## Plugins AE

```powershell
python -m pip install -e ./action_education_theme
python -m pip install -e ./action_education_portal
python -m pip install -e ./action_education_training
kolibri plugin disable kolibri.plugins.default_theme
kolibri plugin enable action_education_theme
kolibri plugin enable action_education_portal
kolibri plugin enable action_education_training
```

Vérifier dans `~/.kolibri-action-education-dev/plugins.json` que `action_education_portal` apparaît **avant** `kolibri.plugins.learn` pour que la redirection LEARNER aille vers le portal.

Migrations training (si le serveur tourne déjà, préférer un redémarrage après migrate) :

```powershell
kolibri manage migrate action_education_training
```

## Serveur de développement

```powershell
.\scripts\ae_devserver_windows.ps1
```

Le script lance Kolibri (port 8000), webpack (port 3001) et la sandbox. Il inclut les plugins de navigation :
sans eux, leurs stats restent « compile » et /portal/ affiche « Webpack Error: Compilation still in progress ».
La première compilation prend quelques minutes.

URL : http://127.0.0.1:8000  
Portal : http://127.0.0.1:8000/fr-fr/portal/  
Learn : http://127.0.0.1:8000/fr-fr/learn/

## Tests

```bash
pytest action_education_theme/test/ -q
pytest action_education_portal/test/ -q
pytest action_education_training/test/ -q
pytest kolibri/deployment/default/test/test_dev_csp_webpack_hosts.py -q
```

## Notes

- Toujours ouvrir `127.0.0.1`, pas `localhost`, sous Windows/WSL (voir Patch 001).
- `action_education_theme` n’est **pas** dans `build_tools/build_plugins.txt`.
- Hors ligne / Wi‑Fi : voir `AE_OFFLINE_WIFI.md` et `python scripts/ae_offline_checks.py`.
- Dans `plugins.json`, `action_education_portal` doit être listé **avant** `kolibri.plugins.learn`.
- Après une mise à jour de version Kolibri (réécriture de `plugins.json`), relancer :
  `python scripts/ae_offline_checks.py --fix-plugin-order`
