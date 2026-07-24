# Test hors connexion WAN / LAN — Action Éducation

Procédure manuelle reproductible pour vérifier que la plateforme reste utilisable
lorsque l’accès Internet (WAN) est coupé, tout en conservant le réseau local (LAN)
entre le serveur Kolibri et les appareils clients.

## Préconditions

- Serveur Kolibri démarré sur le port **8000** (`KOLIBRI_HOME` AE).
- Contenu déjà importé (vidéo, document, exercice).
- Compte apprenant existant (ex. `ae_learner`).
- Ordinateur ou téléphone client sur le **même** Wi‑Fi / LAN que le serveur.
- Adresse LAN du serveur récupérée depuis **Device → Informations sur l’appareil**
  (ne pas utiliser `127.0.0.1` depuis un autre appareil).
- URL portail : `http://<ADRESSE_LAN>:8000/fr-fr/portal/`

## Scénario A — Sur le serveur lui-même

1. Ouvrir `http://127.0.0.1:8000/fr-fr/portal/`.
2. Se connecter comme `ae_learner`.
3. Ouvrir une formation / ressource importée.
4. Ouvrir une vidéo ou un document.
5. Effectuer un exercice.
6. Noter la progression affichée.
7. Couper l’accès Internet de l’ordinateur **sans arrêter Kolibri**
   (désactiver la passerelle / WAN, garder le lien local).
8. Actualiser la page.
9. Rouvrir le contenu.
10. Effectuer une nouvelle activité (ou reprendre l’exercice).
11. Se déconnecter puis se reconnecter.
12. Vérifier que la progression est conservée.

## Scénario B — Depuis un autre appareil du réseau local

1. Connecter le téléphone ou ordinateur client au même Wi‑Fi / LAN.
2. Couper l’accès Internet du routeur **ou** utiliser un réseau local sans WAN
   (le LAN entre client et serveur doit rester actif).
3. Ouvrir `http://<ADRESSE_LAN>:8000/fr-fr/portal/`.
4. Se connecter comme apprenant.
5. Ouvrir une vidéo ou un document.
6. Effectuer l’exercice.
7. Vérifier la progression.
8. Actualiser la page.
9. Se reconnecter.
10. Confirmer la persistance de la progression.

## Vérifications techniques

Dans les outils développeur du navigateur (onglet Réseau) :

- aucune requête indispensable vers un CDN ;
- aucune police distante (Google Fonts, etc.) ;
- aucune icône distante ;
- aucune dépendance Google, Cloudflare ou équivalent bloquante ;
- absence de page blanche ;
- temps de chargement acceptable sur LAN ;
- si une fonction exige réellement Internet (ex. import Studio), le message doit être
  compréhensible et ne pas casser le reste du portail.

## Fiche de test (à remplir)

| Champ | Valeur |
|-------|--------|
| Date | |
| Appareil serveur | |
| Appareil client | |
| Adresse LAN | |
| Navigateur | |
| Internet coupé | oui / non |
| Connexion réussie | oui / non |
| Contenu ouvert | oui / non |
| Vidéo lue | oui / non |
| Document ouvert | oui / non |
| Quiz / exercice effectué | oui / non |
| Progression enregistrée | oui / non |
| Reconnexion réussie | oui / non |
| Anomalies observées | |
| Résultat final | réussi / échoué / partiel |

## Notes

- Les assets du portail AE sont servis depuis `/static/` local après un build prod.
- Un contrôle automatisé partiel (absence de CDN dans le HTML) a déjà été effectué ;
  la **coupure WAN réelle** reste une validation manuelle obligatoire avant de déclarer
  la plateforme opérationnelle.
