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
| 2 | Accueil apprenant + navigation | À faire |
| 3 | Catalogue, vidéos, quiz, progression | À faire |
| 4 | Plugin `action_education_training` | À faire |
| 5 | Sessions / inscriptions / présences | À faire |
| 6 | Tableau de bord formateur | À faire |
| 7 | Tableau de bord administrateur | À faire |
| 8 | Certificats, rapports, exports | À faire |
| 9 | Tests hors ligne / Wi-Fi local | À faire |
| 10 | Performance, a11y, sécurité | À faire |
| 11 | Documentation & paquet déploiement | À faire |

## Décisions

- Plugins externes installables (`kolibri.plugins`) plutôt que fork massif du cœur.
- Identité visuelle via `action_education_theme` (existant).
- Portail UX via `action_education_portal` (à créer).
- Formations / présences via `action_education_training` (à créer).
- Toute modification du cœur documentée dans `AE_KOLIBRI_PATCHES.md`.

## Risques

- Conflit Windows `localhost` vs `127.0.0.1` / IPv6 en mode webpack-dev-server (Phase 0).
- Ne pas casser Auth / Device / Coach / sync Kolibri.
- Ne jamais toucher le serveur 8080.
