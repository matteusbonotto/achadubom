# Script de Deploy Automatico para Firebase Hosting
# Autor: GitHub Copilot
# Data: 20/08/2025

Write-Host "Iniciando processo de deploy automatico..." -ForegroundColor Green

# Verificar se a pasta public existe
if (!(Test-Path "public")) {
    Write-Host "Criando pasta public..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "public" -Force
}

Write-Host "Copiando arquivos para a pasta public..." -ForegroundColor Cyan

# Copiar arquivos HTML
Write-Host "  Copiando index.html..." -ForegroundColor Gray
Copy-Item -Path "index.html" -Destination "public\" -Force

Write-Host "  Copiando admin.html..." -ForegroundColor Gray
Copy-Item -Path "admin.html" -Destination "public\" -Force

# Copiar arquivos de configuracao
Write-Host "  Copiando manifest.json..." -ForegroundColor Gray
Copy-Item -Path "manifest.json" -Destination "public\" -Force

Write-Host "  Copiando service-worker.js..." -ForegroundColor Gray
Copy-Item -Path "service-worker.js" -Destination "public\" -Force

# Copiar pasta assets completa
Write-Host "  Copiando pasta assets (CSS, JS, imagens, dados)..." -ForegroundColor Gray
Copy-Item -Path "assets" -Destination "public\" -Recurse -Force

# Verificar se Firebase CLI esta disponivel
if (!(Get-Command "firebase" -ErrorAction SilentlyContinue)) {
    Write-Host "Firebase CLI nao encontrado! Instale com: npm install -g firebase-tools" -ForegroundColor Red
    exit 1
}

Write-Host "Fazendo deploy para Firebase Hosting..." -ForegroundColor Yellow
firebase deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Deploy realizado com sucesso!" -ForegroundColor Green
    Write-Host "Seu site esta disponivel em: https://achadubom-web.web.app" -ForegroundColor Cyan
    Write-Host "Console Firebase: https://console.firebase.google.com/project/achadubom-web/overview" -ForegroundColor Cyan
} else {
    Write-Host "Erro durante o deploy. Verifique as mensagens acima." -ForegroundColor Red
}

Write-Host ""
Write-Host "Processo finalizado!" -ForegroundColor Green
