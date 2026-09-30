# Environnement de dev AE Apprendre sous Windows. A charger avec un point :
#   . .\scripts\ae_env_windows.ps1
# Ne touche jamais a l'installation protegee (~/.kolibri, port 8080).

$AeRoot = Split-Path -Parent $PSScriptRoot

$env:KOLIBRI_HOME = Join-Path $env:USERPROFILE ".kolibri-action-education-dev"
$env:KOLIBRI_RUN_MODE = "dev"
# Le port 3000 est souvent pris par d'autres projets.
$env:WEBPACK_DEV_SERVER_PORT = "3001"

# Node du projet (volta dans package.json) : node-sass 9 n'a pas de binaire Windows pour Node 22.
$AeNodeDir = Join-Path $env:LOCALAPPDATA "ae-tools\node-v20.19.3-win-x64"
# Le venv du projet passe avant le kolibri global (celui de l'installation protegee).
$env:PATH = (Join-Path $AeRoot ".venv\Scripts") + ";" + $AeNodeDir + ";" + $env:PATH

Set-Location $AeRoot
