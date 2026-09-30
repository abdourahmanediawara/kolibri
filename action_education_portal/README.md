# AE Apprendre — Learner portal

Package: `action_education_portal`

Provides a simplified learner home at `/fr-fr/portal/` with:

- greeting;
- continue / start training card (uses Learn `homehydrate`);
- six shortcuts into Learn (library, home, help);
- side navigation entry « Home » / Accueil (via i18n).

## Enable

```powershell
. .\scripts\ae_env_windows.ps1  # see AE_DEVELOPMENT.md

python -m pip install -e ./action_education_portal
kolibri plugin enable action_education_portal
```

Ensure `action_education_portal` is listed in `build_tools/build_plugins.txt` and in `pnpm-workspace.yaml`, then:

```bash
pnpm install
pnpm run devserver core,learn,action_education_portal
```

URL: http://127.0.0.1:8000/fr-fr/portal/

Do **not** list `action_education_theme` in `build_plugins.txt` (no frontend assets).

Smoke check (optional):

```bash
python action_education_portal/scripts/smoke_portal.py
```

## Tests

```bash
pytest action_education_portal/test/ -q
```
