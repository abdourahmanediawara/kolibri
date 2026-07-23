# AE Apprendre — Formations / sessions / présences

Package: `action_education_training`

Modèles locaux (pas de duplication Kolibri contenus/progression) :

- `Training`
- `TrainingSession`
- `Enrollment`
- `Attendance` (unicité session+apprenant)
- `Certificate`

API (ValuesViewset) sous le namespace plugin :

- `/api/training/`
- `/api/session/`
- `/api/enrollment/`
- `/api/attendance/`
- `/api/certificate/`

## Enable

```bash
cd /home/owner/kolibri
source .venv/bin/activate
export KOLIBRI_HOME="$HOME/.kolibri-action-education-dev"
export KOLIBRI_RUN_MODE="dev"

python -m pip install -e ./action_education_training
kolibri plugin enable action_education_training
kolibri manage migrate
```

## Tests

```bash
pytest action_education_training/test/ -q
```
