# AE Apprendre — Architecture

## Plugins externes

| Plugin | Rôle |
|--------|------|
| `action_education_theme` | Identité visuelle (logo, couleurs, `siteTitle`) — pas de bundle webpack |
| `action_education_portal` | Accueil apprenant simplifié `/portal/` + aide + entrée de navigation |
| `action_education_training` | (Phase 4+) formations, sessions, présences, certificats |

## Flux apprenant (Phases 2–3)

1. Connexion via `user_auth` (thème AE).
2. Redirection LEARNER → `/…/portal/` si `action_education_portal` est enregistré **avant** `kolibri.plugins.learn` dans `plugins.json`.
3. Accueil portal : carte « Continuer » via Learn `homehydrate` ; raccourcis portal (`#/catalog`, `#/videos`, `#/quizzes`, `#/progress`, `#/help`) et Learn (`#/home` pour classes).
4. Catalogue / vidéos / quiz : `ChannelResource` + `ContentNodeResource` + `ContentNodeProgressResource` (cœur) — aucune duplication de contenus.
5. Ouverture d’un contenu : liens vers Learn `#/topics/c/:id` (lecteurs Kolibri inchangés).

## Build frontend

`build_tools/build_plugins.txt` ne doit lister que les plugins **avec** `buildConfig.js` :

```
kolibri.core
kolibri.plugins.*
action_education_portal
```

Ne pas y mettre `action_education_theme` (pas d’assets frontend) — sinon `webpack_json.py` échoue.

## Données

Aucune duplication de progression, contenus ou comptes. Le portal lit les APIs Learn existantes.
