# =====================================================================
#  Seva Sakshi — run YOUR OWN video-call signaling server (PeerServer).
# =====================================================================
#  Why: the app works on the free PeerJS public broker, but that shared
#  server is unreliable and can hold "ghost" codes (e.g. INST-001) so a
#  real device can't reclaim its id. Running your own server fixes that
#  completely — restart it and every code is free again.
#
#  Run:  npm run signal:share
#
#  It starts a PeerServer on port 9000 and opens a public HTTPS tunnel so
#  BOTH laptops (even on different networks) can reach it. Copy the printed
#  VITE_PEERJS_* lines into a `.env` file on EACH laptop, then restart the
#  app (npm run dev). Keep this window open — closing it stops the server.
#
#  One-time prerequisite (same tunnel tool as `npm run share`):
#      winget install Cloudflare.cloudflared
# =====================================================================

$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot

$PORT = 9000
$KEY  = 'peerjs'
$PATH_ = '/seva'

# --- locate cloudflared ------------------------------------------------
$cf = (Get-Command cloudflared -ErrorAction SilentlyContinue).Source
if (-not $cf) { $cf = "C:\Program Files (x86)\cloudflared\cloudflared.exe" }
if (-not (Test-Path $cf)) {
  Write-Host "cloudflared is not installed." -ForegroundColor Red
  Write-Host "Install it once with:  winget install Cloudflare.cloudflared" -ForegroundColor Yellow
  exit 1
}

function Stop-Signal {
  Get-NetTCPConnection -LocalPort $PORT -State Listen -ErrorAction SilentlyContinue |
    Select-Object -Expand OwningProcess -Unique |
    ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
}

try {
  Stop-Signal  # clear any old server still holding the port
  Write-Host "Starting your PeerServer on http://localhost:$PORT$PATH_ ..." -ForegroundColor Cyan
  Start-Process 'npx.cmd' -ArgumentList '-y','-p','peer','peerjs','--port',"$PORT",'--key',"$KEY",'--path',"$PATH_" -WindowStyle Hidden

  # wait until the local server answers
  for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Milliseconds 500
    try { if ((Invoke-WebRequest "http://localhost:$PORT$PATH_" -UseBasicParsing -TimeoutSec 2).StatusCode -ge 200) { break } } catch {}
  }

  Write-Host ""
  Write-Host "=====================================================================" -ForegroundColor Green
  Write-Host " Opening a public tunnel to your signaling server." -ForegroundColor Green
  Write-Host " Find the https://<something>.trycloudflare.com line below, then put" -ForegroundColor Green
  Write-Host " these lines in a .env file on BOTH laptops (replace the host):" -ForegroundColor Green
  Write-Host ""
  Write-Host "   VITE_PEERJS_HOST=<something>.trycloudflare.com" -ForegroundColor Yellow
  Write-Host "   VITE_PEERJS_PORT=443" -ForegroundColor Yellow
  Write-Host "   VITE_PEERJS_PATH=$PATH_" -ForegroundColor Yellow
  Write-Host "   VITE_PEERJS_SECURE=true" -ForegroundColor Yellow
  Write-Host "   VITE_PEERJS_KEY=$KEY" -ForegroundColor Yellow
  Write-Host ""
  Write-Host " Then restart each app (npm run dev) and both use YOUR server." -ForegroundColor Green
  Write-Host " KEEP THIS WINDOW OPEN. Closing it stops the signaling server." -ForegroundColor Yellow
  Write-Host "=====================================================================" -ForegroundColor Green
  Write-Host ""

  & $cf tunnel --url "http://localhost:$PORT"
}
finally {
  Write-Host ""
  Write-Host "Stopping the signaling server..." -ForegroundColor Cyan
  Stop-Signal
}
