# Script para apenas copiar arquivos para a pasta public
# Util quando voce quer apenas preparar os arquivos sem fazer deploy

Write-Host "Preparando arquivos para deploy..." -ForegroundColor Green

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

Write-Host ""
Write-Host "Arquivos preparados na pasta public!" -ForegroundColor Green
Write-Host "Para fazer deploy, execute: .\deploy.ps1" -ForegroundColor Yellow
