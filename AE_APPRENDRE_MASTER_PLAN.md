# AE Apprendre — Master Plan

**Produit :** AE Apprendre (Action Éducation Guinée)  
**Base :** Kolibri v0.19.5 — branche `action-education-v1`  
**Dev :** `KOLIBRI_HOME=$HOME/.kolibri-action-education-dev` — port **8000** uniquement  
**Protégé :** installation port **8080** (ne jamais toucher)

## Progression

| Phase | Objectif | Statut |
|------|----------|--------|
| 0 | Corriger splash Learn | Validé (2026-07-23) |
| 1 | Finaliser thème AE | Validé (2026-07-23) |
| 2 | Accueil apprenant + navigation | Validé (2026-07-23) |
| 3 | Catalogue, vidéos, quiz, progression | Validé (2026-07-23) |
| 4 | Plugin `action_education_training` | Validé (2026-07-23) |
| 5 | Sessions / inscriptions / présences | Validé (2026-07-23) |
| 6 | Tableau de bord formateur | Validé (2026-07-23) |
| 7 | Tableau de bord administrateur | Validé (2026-07-23) |
| 8 | Certificats, rapports, exports | Validé (2026-07-23) |
| 9 | Tests hors ligne / Wi-Fi local | Validé (2026-07-23) |
| 10 | Performance, a11y, sécurité | Validé (2026-07-23) |
| 11 | Documentation & paquet déploiement | Validé (2026-07-23) |

## Décisions

- Plugins externes installables (`kolibri.plugins`) plutôt que fork massif du cœur.
- Identité visuelle via `action_education_theme` (existant, hors `build_plugins.txt`).
- Portail UX via `action_education_portal` (Phase 2) — package pnpm workspace + `buildConfig.js`.
- Formations / présences via `action_education_training`.
- Toute modification du cœur documentée dans `AE_KOLIBRI_PATCHES.md`.
- Redirection LEARNER : premier `RoleBasedRedirectHook` gagnant — garder `action_education_portal` avant `kolibri.plugins.learn` dans `plugins.json`.
- Documentation utilisateur en français : `AE_USER_GUIDE_*.md` ; index `AE_README.md`.

## Critères d’acceptation (section 28)

- [x] AE Apprendre démarre sans erreur (port 8000, `KOLIBRI_HOME` isolé)
- [x] Splash Learn corrigé (Patch 001)
- [x] Logo / couleurs AE (thème)
- [x] Accueil apprenant portal
- [x] Catalogue, vidéos, quiz, progression
- [x] Sessions / présences formateur
- [x] Tableaux de bord formateur et admin
- [x] Certificats + exports CSV hors ligne
- [x] Contrôles hors ligne / Wi‑Fi (`scripts/ae_offline_checks.py`)
- [x] Documentation maintenance + guides FR
- [ ] Push GitHub à jour (à faire si credentials disponibles)
- [x] Port 8080 non touché

Index docs : `AE_README.md`.

## Risques

- Conflit Windows `localhost` vs `127.0.0.1` / IPv6 en mode webpack-dev-server (Phase 0).
- Ne pas casser Auth / Device / Coach / sync Kolibri.
- Ne jamais toucher le serveur 8080.
- Messages portal en français source ; catalogues Crowdin multi-langues restent optionnels.
