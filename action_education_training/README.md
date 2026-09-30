# AE Apprendre — Formations / sessions / présences

Package: `action_education_training`

Modèles locaux (pas de duplication Kolibri contenus/progression) :

- `Training`
- `TrainingSession`
- `Enrollment`
- `Attendance` (unicité session+apprenant)
- `Certificate`
- `TrainingResource` (fichiers joints style Moodle : PDF, Word, vidéo, audio…)

API (ValuesViewset) sous le namespace plugin :

- `/api/training/`
- `/api/session/`
- `/api/enrollment/`
- `/api/attendance/`
- `/api/certificate/`
- `/api/resource/` (liste / suppression)
- `POST /api/resource/upload/` (multipart)
- `GET /api/resource/<id>/download/`

Rapports / certificats :

- `POST /api/certificate/issue/`
- `GET /api/certificate/<id>/print/`
- `GET /api/export/attendance/<session_id>/`
- `GET /api/export/enrollments/<training_id>/`
- `GET /api/export/certificates/`
- `GET /api/summary/session/<session_id>/`

## Enable

```powershell
. .\scripts\ae_env_windows.ps1  # see AE_DEVELOPMENT.md

python -m pip install -e ./action_education_training
kolibri plugin enable action_education_training
kolibri manage migrate
```

## Tests

```bash
pytest action_education_training/test/ -q
```
