# =====================================================================
#  Seva Sakshi — turn THIS laptop into the public server.
# =====================================================================
#  Run:  npm run share      (or right-click > Run with PowerShell)
#
#  While this window stays open, the app is reachable at the public URL
#  printed below. Close this window, press Ctrl+C, or turn the laptop
#  off, and the site goes down for EVERYONE — this laptop is the server.
#
#  One-time prerequisite (installs the tunnel tool):
#      winget install Cloudflare.cloudflared
# =====================================================================

$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot

$PORT = 4173

# --- locate cloudflared ------------------------------------------------
$cf = (Get-Command cloudflared -ErrorAction SilentlyContinue).Source
if (-not $cf) { $cf = "C:\Program Files (x86)\cloudflared\cloudflared.exe" }
if (-not (Test-Path $cf)) {
  Write-Host "cloudflared is not installed." -ForegroundColor Red
  Write-Host "Install it once with:  winget install Cloudflare.cloudflared" -ForegroundColor Yellow
  exit 1
}

function Stop-Preview {
  Get-NetTCPConnection -LocalPort $PORT -State Listen -ErrorAction SilentlyContinue |
    Select-Object -Expand OwningProcess -Unique |
    ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
}

try {
  Write-Host "Building the latest version..." -ForegroundColor Cyan
  npm run build | Out-Host

  Stop-Preview  # clear any old server still holding the port
  Write-Host "Starting local server on http://localhost:$PORT ..." -ForegroundColor Cyan
  Start-Process 'npm.cmd' -ArgumentList 'run','preview','--','--port',"$PORT" -WindowStyle Hidden

  # wait until the local server answers
  for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Milliseconds 500
    try { if ((Invoke-WebRequest "http://localhost:$PORT/" -UseBasicParsing -TimeoutSec 2).StatusCode -eq 200) { break } } catch {}
  }

  Write-Host ""
  Write-Host "=====================================================================" -ForegroundColor Green
  Write-Host " Opening the public tunnel. Your shareable URL appears below" -ForegroundColor Green
  Write-Host " (look for the https://...trycloudflare.com line)." -ForegroundColor Green
  Write-Host " KEEP THIS WINDOW OPEN. Closing it / shutting down = site down for all." -ForegroundColor Yellow
  Write-Host "=====================================================================" -ForegroundColor Green
  Write-Host ""

  & $cf tunnel --url "http://localhost:$PORT"
}
finally {
  Write-Host ""
  Write-Host "Stopping local server (the site is now offline for everyone)..." -ForegroundColor Cyan
  Stop-Preview
}
