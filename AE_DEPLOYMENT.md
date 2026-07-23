# AE Apprendre — Déploiement (brouillon Phase 9 / 11)

Document de déploiement serveur local. Complété en Phase 11 (sauvegarde, paquet).

## Ports

| Usage | Port | Règle |
|-------|------|--------|
| AE Apprendre (dev / atelier) | **8000** | Utiliser celui-ci |
| Installation protégée | **8080** | Ne jamais toucher en développement |

## Écoute réseau (Wi‑Fi)

Dans `$KOLIBRI_HOME/options.ini` :

```ini
[Deployment]
HTTP_PORT = 8000
LISTEN_ADDRESS = 0.0.0.0
```

- `0.0.0.0` : accessible depuis les appareils du même Wi‑Fi via l’IP LAN du serveur.
- `127.0.0.1` : uniquement la machine locale (pas de tablettes).

URL type : `http://192.168.x.x:8000/fr-fr/user/`

## Démarrage production locale (aperçu)

```bash
export KOLIBRI_HOME="$HOME/.kolibri-action-education"
kolibri start --port 8000
```

Pour le développement frontend, voir `AE_DEVELOPMENT.md`.

## Vérifications hors ligne

Voir `AE_OFFLINE_WIFI.md` et :

```bash
python scripts/ae_offline_checks.py --fix-plugin-order
python scripts/ae_offline_checks.py --base-url http://127.0.0.1:8000
```
