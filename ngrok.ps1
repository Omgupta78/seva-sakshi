# =====================================================================
#  Seva Sakshi — PERMANENT phone URL via ngrok's free STATIC domain.
# =====================================================================
#  Gives a fixed HTTPS URL (e.g. https://your-name.ngrok-free.app) that
#  is the SAME every run, so the camera works on your phone and you never
#  copy a new link. Point it at the running dev server (port 5173).
#
#  Run:  npm run tunnel      (start the app first: npm run dev -- --host)
#
#  One-time setup (see README → "A permanent (fixed) phone URL"):
#    1. Create a free account at https://dashboard.ngrok.com
#    2. Install ngrok:            winget install ngrok.ngrok
#    3. Add your authtoken:       ngrok config add-authtoken <YOUR_TOKEN>
#    4. Claim your free static domain in the ngrok dashboard (Domains),
#       e.g. your-name.ngrok-free.app
#    5. Put it in .env:           NGROK_DOMAIN=your-name.ngrok-free.app
#       (also add VITE_TUNNEL_HOST=your-name.ngrok-free.app so Vite trusts it)
# =====================================================================

$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot

$PORT = 5173

# --- read NGROK_DOMAIN from .env --------------------------------------
$domain = $env:NGROK_DOMAIN
if (-not $domain -and (Test-Path '.env')) {
  $line = Select-String -Path '.env' -Pattern '^\s*NGROK_DOMAIN\s*=\s*(.+)\s*$' -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($line) { $domain = $line.Matches[0].Groups[1].Value.Trim().Trim('"').Trim("'") }
}
if (-not $domain) {
  Write-Host "NGROK_DOMAIN is not set." -ForegroundColor Red
  Write-Host "Add it to .env, e.g.:  NGROK_DOMAIN=your-name.ngrok-free.app" -ForegroundColor Yellow
  Write-Host "(claim a free static domain at https://dashboard.ngrok.com > Domains)" -ForegroundColor Yellow
  exit 1
}

# --- locate ngrok -----------------------------------------------------
$ng = (Get-Command ngrok -ErrorAction SilentlyContinue).Source
if (-not $ng) {
  Write-Host "ngrok is not installed." -ForegroundColor Red
  Write-Host "Install it once with:  winget install ngrok.ngrok" -ForegroundColor Yellow
  Write-Host "Then:  ngrok config add-authtoken <YOUR_TOKEN>" -ForegroundColor Yellow
  exit 1
}

Write-Host "=====================================================================" -ForegroundColor Green
Write-Host " Exposing http://localhost:$PORT at your permanent URL:" -ForegroundColor Green
Write-Host "   https://$domain" -ForegroundColor Cyan
Write-Host " Open THAT url on your phone (same every time)." -ForegroundColor Green
Write-Host " Make sure the app is running:  npm run dev -- --host" -ForegroundColor Yellow
Write-Host " Keep this window open. Ctrl+C stops the tunnel." -ForegroundColor Yellow
Write-Host "=====================================================================" -ForegroundColor Green

& $ng http $PORT --domain=$domain
