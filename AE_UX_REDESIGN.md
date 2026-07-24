# AE UX Redesign — Phases 1–7

Point de restauration : tag `ae-pre-ux-redesign-2026-07-24`.

## Livré

1. **Permissions + shell** — `useAePermissions`, `AeAppShell`, onglet actif, redirects post-login
2. **Menus / routes** — `/ae/learn|coach|admin/*`, switcher d’espaces, responsive (`windowIsSmall`)
3. **Apprenant** — home (homehydrate), formations, bibliothèque, quiz, progression, aide
4. **Formateur** — dashboard, sessions + présence, apprenants, résultats, bibliothèque
5. **Admin** — dashboard, contenus → Device, users/classes Facility, sync, rapports
6. **Offline / erreurs** — statut connexion, messages d’échec + réessai sur écrans clés
7. **Tests / docs** — pytest routes/hooks, Jest permissions/nav, `AE_ARCHITECTURE.md`, ce fichier

## Accès

- URL : `/fr-fr/portal/#/ae/learn` (ou landing selon rôle)
- Devserver (plugins nav) :
  ```bash
  export KOLIBRI_HOME="$HOME/.kolibri-action-education-dev"
  export KOLIBRI_RUN_MODE="dev"
  pnpm run devserver core,learn,action_education_portal,user_auth,facility,device,coach,user_profile
  ```

## Legacy

Anciennes pages portal (`HomePage.vue`, `TrainerSessionsPage.vue`, …) non routées ; redirections depuis les anciens hash.
