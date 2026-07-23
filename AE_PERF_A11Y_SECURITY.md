# AE Apprendre — Performance, accessibilité, sécurité (Phase 10)

## Accessibilité

- Pages portal en Composition API + Design System (`KButton`, `KTextbox`, `AppBarPage`).
- Textes via `createTranslator` (i18n).
- Contraste thème AE : `action_education_theme/test/test_contrast.py` (WCAG AA).
- Sections importantes : `aria-labelledby` / `aria-label` ; erreurs `role="alert"` ; succès `role="status"`.
- Cibles tactiles ≥ 44px sur formulaires critiques (sessions, certificats, aide).
- Pas de `@media` CSS : layouts via grille fluide / `minmax` (compatible Android / petits écrans).

## Performance

- Réutilisation des APIs Learn (`homehydrate`, `ContentNodeResource`) — pas de double indexation contenus.
- Liste certificats API **sans** `printable_payload` (HTML servi uniquement via `/print/`).
- Exports CSV générés à la demande (pas de fichiers temporaires persistants).
- Querysets training filtrés par facility ; `select_related` sur exports.

## Sécurité

- Permissions `IsFacilityStaffOrReadOwn` sur toutes les APIs training.
- Exports / émission de certificats : staff only (403 apprenant).
- Impression certificat : staff facility **ou** apprenant propriétaire.
- HTML certificat : champs utilisateur passés par `django.utils.html.escape`.
- Pas d’URLs CDN dans thème / portal / training (voir Phase 9).
- Isolation facility sur tous les querysets.

## Tests

```bash
pytest action_education_theme/test/test_contrast.py \
       action_education_training/test/test_reports.py -q
python scripts/ae_offline_checks.py
```
