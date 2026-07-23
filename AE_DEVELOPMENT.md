# AE Apprendre — Développement

## Prérequis

- WSL Ubuntu, Python 3.11, Node 20, pnpm
- Ne jamais utiliser le port **8080** (installation protégée)

## Environnement obligatoire

```bash
cd /home/owner/kolibri
source .venv/bin/activate
export KOLIBRI_HOME="$HOME/.kolibri-action-education-dev"
export KOLIBRI_RUN_MODE="dev"
```

## Plugins AE

```bash
python -m pip install -e ./action_education_theme
python -m pip install -e ./action_education_portal
kolibri plugin disable kolibri.plugins.default_theme
kolibri plugin enable action_education_theme
kolibri plugin enable action_education_portal
```

Vérifier dans `~/.kolibri-action-education-dev/plugins.json` que `action_education_portal` apparaît **avant** `kolibri.plugins.learn` pour que la redirection LEARNER aille vers le portal.

## Serveur de développement

```bash
pnpm run devserver core,learn,action_education_portal
```

URL : http://127.0.0.1:8000  
Portal : http://127.0.0.1:8000/fr-fr/portal/  
Learn : http://127.0.0.1:8000/fr-fr/learn/

## Tests

```bash
pytest action_education_theme/test/ -q
pytest action_education_portal/test/ -q
pytest kolibri/deployment/default/test/test_dev_csp_webpack_hosts.py -q
```

## Notes

- Toujours ouvrir `127.0.0.1`, pas `localhost`, sous Windows/WSL (voir Patch 001).
- `action_education_theme` n’est **pas** dans `build_tools/build_plugins.txt`.
