# Lance le serveur de dev AE Apprendre sous Windows.
# Kolibri : http://127.0.0.1:8000  -  webpack : port 3001.

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "ae_env_windows.ps1")

$Plugins = "core,learn,action_education_portal,user_auth,facility,device,coach,user_profile"

pnpm exec concurrently --kill-others `
  "pnpm run watch --watchonly $Plugins --port $env:WEBPACK_DEV_SERVER_PORT" `
  "pnpm run python-devserver" `
  "pnpm run sandbox-dev"
