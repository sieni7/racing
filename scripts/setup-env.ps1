# 🔧 Script de configuration des variables d'environnement
# Racing Club de Bingerville — exécuter :  pwsh scripts/setup-env.ps1

$ErrorActionPreference = "Stop"

# ── 1. Met à jour .env.local ──────────────────────────────────
Write-Host "📝 Mise à jour de .env.local..." -ForegroundColor Cyan

$envContent = @'
VITE_SUBAPASE_URL=https://yhvtargtyssnjoauyjlx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlodnRhcmd0eXNzbmpvYXV5amx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzMTcxMzEsImV4cCI6MjA5OTg5MzEzMX0.aSei-V-4ZkQaPXcUpZ1MdTpRhQY5Em_TWRQfJxaTkC4
VITE_SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlodnRhcmd0eXNzbmpvYXV5amx4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDMxNzEzMSwiZXhwIjoyMDk5ODkzMTMxfQ.mPPSOf4-Tu7sWBBaX3q5BgovhkI6OKcgN1zFmIeGBpU
VITE_VAPID_PUBLIC_KEY=BBXJrZjYbfvEfT67Vrd3nVmGPeGsAw8l9CD3WimYgMdK7P-PDtVOWOAbrIliTv9FNXn1YPuUUwbFOw1fZOleJ6s
VAPID_PRIVATE_KEY=p8cKt_WuV5QT6wQpf_W2enfNIuWF-olRl3QA_s2oxR8
ADMIN_EMAIL=admin2@racing-bingerville.ci
ADMIN_PASSWORD=Admin2026!
RESEND_API_KEY=
CONTACT_EMAIL=contact@racingclub.ci
'@

Set-Content -Path ".env.local" -Value $envContent -NoNewline
Write-Host "   ✅ .env.local mis à jour" -ForegroundColor Green

# ── 2. Vérifie Netlify CLI ────────────────────────────────────
Write-Host "`n🔍 Vérification de Netlify CLI..." -ForegroundColor Cyan

$netlify = Get-Command netlify -ErrorAction SilentlyContinue
if (-not $netlify) {
    Write-Host "   ⏳ Installation de Netlify CLI (npm i -g netlify-cli)..." -ForegroundColor Yellow
    npm install -g netlify-cli
    if ($LASTEXITCODE -ne 0) { throw "Échec de l'installation netlify-cli" }
    Write-Host "   ✅ Netlify CLI installé" -ForegroundColor Green
} else {
    Write-Host "   ✅ Netlify CLI déjà installé : $($netlify.Source)" -ForegroundColor Green
}

# ── 3. Vérifie l'authentification Netlify ─────────────────────
Write-Host "`n🔐 Vérification de l'authentification Netlify..." -ForegroundColor Cyan
$whoami = netlify status 2>&1
if ($whoami -match "Not logged in") {
    Write-Host "   ⚠️  Tu n'es pas connecté. Lance 'netlify login' dans un terminal." -ForegroundColor Yellow
    Write-Host "   Puis relance ce script." -ForegroundColor Yellow
    exit 1
}
Write-Host "   ✅ Connecté à Netlify" -ForegroundColor Green

# ── 4. Lie le projet Netlify (si pas déjà fait) ───────────────
Write-Host "`n🔗 Vérification du lien Netlify..." -ForegroundColor Cyan
$siteInfo = netlify status 2>&1
if ($siteInfo -match "No site found") {
    Write-Host "   ⏳ Liaison du projet..." -ForegroundColor Yellow
    netlify init --manual
    if ($LASTEXITCODE -ne 0) { throw "Échec de netlify init" }
} else {
    Write-Host "   ✅ Projet déjà lié à Netlify" -ForegroundColor Green
}

# ── 5. Configure les variables d'environnement Netlify ────────
Write-Host "`n⚙️  Configuration des variables d'environnement Netlify..." -ForegroundColor Cyan

$envVars = @(
    @{ key = "VITE_SUPABASE_URL"; value = "https://yhvtargtyssnjoauyjlx.supabase.co" },
    @{ key = "VITE_SUPABASE_ANON_KEY"; value = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlodnRhcmd0eXNzbmpvYXV5amx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzMTcxMzEsImV4cCI6MjA5OTg5MzEzMX0.aSei-V-4ZkQaPXcUpZ1MdTpRhQY5Em_TWRQfJxaTkC4" },
    @{ key = "VITE_SUPABASE_SERVICE_KEY"; value = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlodnRhcmd0eXNzbmpvYXV5amx4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDMxNzEzMSwiZXhwIjoyMDk5ODkzMTMxfQ.mPPSOf4-Tu7sWBBaX3q5BgovhkI6OKcgN1zFmIeGBpU" },
    @{ key = "VITE_VAPID_PUBLIC_KEY"; value = "BBXJrZjYbfvEfT67Vrd3nVmGPeGsAw8l9CD3WimYgMdK7P-PDtVOWOAbrIliTv9FNXn1YPuUUwbFOw1fZOleJ6s" },
    @{ key = "VAPID_PRIVATE_KEY"; value = "p8cKt_WuV5QT6wQpf_W2enfNIuWF-olRl3QA_s2oxR8" },
    @{ key = "ADMIN_EMAIL"; value = "admin2@racing-bingerville.ci" },
    @{ key = "ADMIN_PASSWORD"; value = "Admin2026!" },
    @{ key = "CONTACT_EMAIL"; value = "contact@racingclub.ci" },
    @{ key = "RESEND_API_KEY"; value = "" }
)

foreach ($var in $envVars) {
    if ($var.key -eq "RESEND_API_KEY" -and [string]::IsNullOrEmpty($var.value)) {
        Write-Host "   ⏭️  RESEND_API_KEY laissé vide — à remplir après inscription sur https://resend.com" -ForegroundColor Yellow
        netlify env:set RESEND_API_KEY "" 2>$null
        continue
    }
    Write-Host "   → $($var.key) ..." -NoNewline
    netlify env:set $var.key $var.value --json 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) { Write-Host " ✅" -ForegroundColor Green }
    else { Write-Host " ❌" -ForegroundColor Red }
}

Write-Host "`n📋 Récapitulatif Netlify :" -ForegroundColor Cyan
netlify env:list

# ── 6. Instructions finales ──────────────────────────────────
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host "🎯 Configuration terminée !" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host ""
Write-Host "📧 Pour activer les emails :" -ForegroundColor Yellow
Write-Host "   1. Va sur https://resend.com" -ForegroundColor White
Write-Host "   2. Crée un compte (gratuit, 100 emails/jour)" -ForegroundColor White
Write-Host "   3. Génère une API Key (Domains → Add Domain → racingclub.ci)" -ForegroundColor White
Write-Host "   4. Configure le DNS (DKIM/SPF)" -ForegroundColor White
Write-Host "   5. Définit la variable :" -ForegroundColor White
Write-Host "      netlify env:set RESEND_API_KEY re_xxxxxxxx" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Alternative rapide (sans DNS) :" -ForegroundColor Yellow
Write-Host "   - Va dans Domains → ajoute racingclub.ci" -ForegroundColor White
Write-Host "   - Resend fournit les enregistrements DNS à ajouter chez ton hébergeur" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Déploiement :" -ForegroundColor Yellow
Write-Host "   git push" -ForegroundColor Cyan
Write-Host "   ou" -ForegroundColor White
Write-Host "   netlify deploy --prod" -ForegroundColor Cyan
