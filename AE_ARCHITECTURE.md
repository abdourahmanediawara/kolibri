# AE Apprendre — Architecture

## Plugins externes

| Plugin | Rôle |
|--------|------|
| `action_education_theme` | Branding (logo, couleurs, `siteTitle`) |
| `action_education_portal` | Interface produit `/portal/#/ae/...` |
| `action_education_training` | API formations / sessions / certificats |

Kolibri (auth, contenus, progression, sync) reste le moteur. Pas d’accès DB depuis le frontend.

## Flux post-login

1. Auth Kolibri.
2. Redirections `RoleBasedRedirectHook` du portal (plugin **avant** learn / coach / facility dans `plugins.json`) :
   - LEARNER → portal
   - COACH / ASSIGNABLE_COACH → portal
   - ADMIN → portal
   - SUPERUSER → Device (natif) ; portal accessible manuellement
3. Landing hash selon le rôle : `/ae/admin`, `/ae/coach` ou `/ae/learn`.

## Espaces UI (`action_education_portal`)

| Espace | Routes | Public |
|--------|--------|--------|
| Apprenant | `/ae/learn/*` | Continuer, formations, bibliothèque, quiz, progression, aide |
| Formateur | `/ae/coach/*` | Tableau de bord, sessions, apprenants, résultats |
| Admin | `/ae/admin/*` | Utilisateurs, contenus (Device), sync, rapports |
| Technique | lien Device | Superuser / gestion contenus |

Shell : `AeAppShell.vue` + `useAePermissions` + `useAeNav`.

Les anciennes routes (`/catalog`, `/trainer`, …) redirigent vers `/ae/...`.

## Couches frontend

- Permissions : `composables/useAePermissions.js`
- Navigation : `composables/useAeNav.js`
- Contenu Learn : `composables/useLearnContent.js`
- Formations AE : `composables/useTrainingApi.js`
- Connexion : `composables/useAeConnection.js`

## Ordre plugins

`action_education_portal` **avant** `kolibri.plugins.learn` (et avant coach/facility pour les redirects associés).

Après upgrade Kolibri : `python scripts/ae_offline_checks.py --fix-plugin-order`

## Restauration UX

Tag Git : `ae-pre-ux-redesign-2026-07-24`
