# Guide administrateur — AE Apprendre

Ce guide est pour les **responsables** qui gèrent le serveur local Action Éducation.

## Démarrer la plateforme

1. Allumer l’ordinateur serveur.
2. Lancer AE Apprendre (voir `AE_DEPLOYMENT.md`).
3. Noter l’adresse Wi‑Fi : `http://IP:8000` (demander à la personne technique si besoin).
4. Ouvrir cette adresse sur un navigateur pour vérifier l’écran de connexion.

## Première configuration

1. Créer le centre / établissement (assistant Kolibri au premier démarrage).
2. Créer un compte **administrateur**.
3. Créer des comptes **formateurs** (coach) et **apprenants**.
4. Importer les **canaux de contenus** (vidéos, documents, quiz) depuis une clé USB ou un autre Kolibri — Device → Canaux.

## Tableau de bord Admin (portal)

Après connexion admin, aller sur **Admin** depuis l’accueil AE (`#/admin`) :

- Voir le nombre d’utilisateurs, canaux, formations, sessions.
- Accéder rapidement aux outils Formateur, Certificats, Rapports.
- Pour la gestion complète des comptes : bouton **Facility**.
- Pour les canaux et le serveur : bouton **Device**.

## Ordre conseillé pour un atelier

1. Vérifier que le Wi‑Fi local fonctionne (tablettes joignent le serveur).
2. Importer / vérifier les contenus.
3. Créer les comptes apprenants (ou les importer).
4. Demander aux formateurs de créer les **sessions** du jour.
5. En fin de journée : **exporter CSV** (rapports) + **sauvegarde** (`AE_BACKUP_RESTORE.md`).

## En cas de problème

| Problème | À essayer |
|----------|-----------|
| Page blanche / splash infini | Ouvrir `127.0.0.1` (pas `localhost`) ; redémarrer le serveur |
| Tablette n’atteint pas le serveur | Même Wi‑Fi ; `LISTEN_ADDRESS=0.0.0.0` ; pare-feu port 8000 |
| Apprenant arrive sur Learn au lieu du portal | Vérifier l’ordre des plugins (`ae_offline_checks.py --fix-plugin-order`) |
| Perte de données | Restaurer la dernière sauvegarde USB |

Ne jamais modifier l’installation sur le port **8080** si elle est réservée à un autre usage.
