# AE Apprendre — Theme plugin

Package: `action_education_theme`

## What it provides

- Product name: **AE Apprendre**
- Organization: Action Éducation
- Primary `#F15A24` (orange), navy `#29217E` for text
- Logo (PNG wordmark)
- Sign-in, app bar, and side nav branding

## Enable (dev)

```powershell
. .\scripts\ae_env_windows.ps1  # see AE_DEVELOPMENT.md

python -m pip install -e ./action_education_theme
kolibri plugin disable kolibri.plugins.default_theme
kolibri plugin enable action_education_theme
```

Only one ThemeHook may be active at a time.

## Tests

```bash
pytest action_education_theme/test/ -q
```

## Known asset follow-ups

- Prefer a dedicated SVG / transparent logo and real 192×192 / 512×512 PWA icons when available from Action Éducation.
- Do not invent a replacement logo; keep the official PNG until then.
- A proper `favicon.ico` entry can be added to `logos[]` when a file is provided.
