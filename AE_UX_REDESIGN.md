# AE UX Redesign — Phases 1–7 + audit correctif

Point de restauration : tag `ae-pre-ux-redesign-2026-07-24`.

## Livré (shell)

1. Permissions + shell `/ae`
2. Menus / routes / responsive
3–5. Espaces apprenant / formateur / admin
6. Offline / erreurs
7. Tests structurels + docs

## Correctifs audit fonctionnel

- Anonyme → Auth (Django + guards SPA)
- Landing post-login selon rôle
- Onglets Formateur/Admin filtrés par rôle (`PortalSideNavEntry`)
- Contenu : un CTA honnête vers Device `#/content`
- Sessions : date + heure FR, validation, statut, ouverture
- Dashboards : cartes masquées si valeur absente / 0 ; `allSettled`
- Apprenants coach : filtre hors staff
- Paramètres : lien Device `#/settings` (persistance native)

## Accès

```bash
export KOLIBRI_HOME="$HOME/.kolibri-action-education-dev"
export KOLIBRI_RUN_MODE="dev"
pnpm run devserver core,learn,action_education_portal,user_auth,facility,device,coach,user_profile
```

URL : `/fr-fr/portal/` (redirige vers Auth si non connecté).
