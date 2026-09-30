# Lance AE Apprendre en mode production, accessible depuis le réseau local (atelier Wi-Fi).
# Prérequis : assets compilés une fois avec `pnpm run build`.
# Les appareils connectés au même Wi-Fi ouvrent http://<IP du PC>:8000
# Ne touche jamais au Kolibri de production (port 8080).

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "ae_env_windows.ps1")

# Mode production : Kolibri sert lui-même les assets compilés,
# au lieu du webpack de dev qui n'écoute que sur 127.0.0.1:3001.
Remove-Item Env:KOLIBRI_RUN_MODE -ErrorAction SilentlyContinue

$addresses = Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } |
  Select-Object -ExpandProperty IPAddress
Write-Host "AE Apprendre sera disponible sur :"
foreach ($ip in $addresses) {
  Write-Host "  http://$($ip):8000"
}

kolibri start --foreground --port=8000
