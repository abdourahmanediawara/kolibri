# Checklist manuelle — validation pilote Action Éducation

Date : _______________  
Commit : `fa5c6f095b` (ou HEAD validé)  
Validateur : _______________  
Environnement : serveur / LAN / client _______________

## Préparation

- [ ] `KOLIBRI_HOME=$HOME/.kolibri-action-education-dev` (ou instance pilote dédiée)
- [ ] Serveur démarré sur le port **8000**
- [ ] Contenu réel déjà importé (vidéo + document + exercice)
- [ ] Comptes `ae_learner`, `ae_coach`, `ae_admin` disponibles (mots de passe hors dépôt)
- [ ] Navigateur : hard refresh après rebuild (`Ctrl+Shift+R`)
- [ ] URL : `http://127.0.0.1:8000/fr-fr/portal/` (serveur) ou `http://<IP_LAN>:8000/fr-fr/portal/` (client)

## Connexions et espaces

| # | Contrôle | OK | Notes |
|---|----------|----|-------|
| 1 | Connexion **apprenant** → atterrissage `#/ae/learn` | ☐ | |
| 2 | Connexion **formateur** → atterrissage `#/ae/coach` | ☐ | |
| 3 | Connexion **administrateur** → atterrissage `#/ae/admin` | ☐ | |
| 4 | Apprenant : pas d’onglets Formateur / Administrateur | ☐ | |
| 5 | Admin établissement : pas de lien « Administration technique » sans DevicePermissions | ☐ | |

## Contenu et apprentissage

| # | Contrôle | OK | Notes |
|---|----------|----|-------|
| 6 | Import d’un contenu réel (Device ou CLI) visible dans le portail | ☐ | |
| 7 | Lecture d’une **vidéo** | ☐ | |
| 8 | Ouverture d’un **PDF / document** | ☐ | |
| 9 | Réalisation d’un **exercice** | ☐ | |
| 10 | Progression enregistrée | ☐ | |
| 11 | Déconnexion / reconnexion : progression **conservée** | ☐ | |

## Formateur et permissions

| # | Contrôle | OK | Notes |
|---|----------|----|-------|
| 12 | Formateur ouvre **Résultats** et voit le résultat réel de l’apprenant | ☐ | |
| 13 | Apprenant : accès refusé aux routes / API formateur (ex. création session) | ☐ | |
| 14 | Accès direct `/fr-fr/learn/`, `/fr-fr/coach/`, `/fr-fr/facility/` possible si autorisé (pas de boucle) | ☐ | |
| 15 | Superutilisateur / Device admin : accès Device technique OK | ☐ | |

## Hors connexion

Procédure détaillée : `docs/howtos/ae_offline_wan_lan_test.md`

| # | Contrôle | OK | Notes |
|---|----------|----|-------|
| 16 | WAN coupé, LAN actif : portail utilisable | ☐ | |
| 17 | Contenu + exercice + progression hors WAN | ☐ | |
| 18 | Aucune dépendance CDN bloquante | ☐ | |

## Décision pilote

- [ ] **Prête pour pilote** — tous les points critiques 1–13 et 16–17 OK  
- [ ] **Non prête** — lister les anomalies bloquantes ci-dessous

Anomalies :
```
…
```
