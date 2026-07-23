# AE Apprendre — Sauvegarde et restauration

## Que sauvegarder ?

Le dossier **`KOLIBRI_HOME`** contient :

- `db.sqlite3` — utilisateurs, progression, formations AE
- `content/` — fichiers médias importés
- `options.ini`, `plugins.json`
- bases annexes (`job_storage.sqlite3`, etc.)

Sans ce dossier, on perd comptes, présences et certificats.

## Sauvegarde rapide (script)

```bash
export KOLIBRI_HOME="$HOME/.kolibri-action-education"
# Arrêter le serveur avant une sauvegarde « froide » si possible
kolibri stop   # optionnel mais recommandé

python scripts/ae_backup.py --dest ~/Backups/ae-apprendre
```

Le script crée une archive `ae-backup-AAAAMMJJ-HHMMSS.tar.gz` contenant une copie de `KOLIBRI_HOME`.

## Sauvegarde manuelle (clé USB)

1. Arrêter Kolibri.
2. Copier tout le dossier `$KOLIBRI_HOME` vers la clé USB.
3. Nommer clairement : `ae-apprendre-2026-07-23`.
4. Vérifier que `db.sqlite3` et `content/` sont présents sur la clé.

## Restauration

1. Arrêter Kolibri sur la machine cible.
2. Remplacer (ou créer) le dossier `KOLIBRI_HOME` par la copie sauvegardée.
3. Vérifier `plugins.json` (portal **avant** learn) :

```bash
export KOLIBRI_HOME="$HOME/.kolibri-action-education"
python scripts/ae_offline_checks.py --fix-plugin-order
```

4. Redémarrer : `kolibri start --port 8000`
5. Se connecter et contrôler : utilisateurs, un contenu, une session de formation.

## Vérification après restauration

- [ ] Connexion admin OK
- [ ] Catalogue / portal affiche les canaux
- [ ] Formations / présences / certificats présents
- [ ] Tablette Wi‑Fi : `http://IP:8000` OK

## Bonnes pratiques

- Sauvegarder **avant** chaque mise à jour logicielle.
- Garder au moins **2 copies** (disque + clé USB).
- Ne jamais mélanger `KOLIBRI_HOME` du port 8080 avec celui d’AE Apprendre.
