# =============================================
# BUILD AND DEPLOY - AchaduBom
# =============================================

Write-Host "Iniciando build do projeto AchaduBom..." -ForegroundColor Cyan
Write-Host ""

# Limpar pasta public
Write-Host "Limpando pasta public..." -ForegroundColor Yellow
if (Test-Path "public") {
    Remove-Item -Path "public\*" -Recurse -Force -ErrorAction SilentlyContinue
} else {
    New-Item -ItemType Directory -Path "public" -Force | Out-Null
}

Write-Host "Pasta public limpa" -ForegroundColor Green
Write-Host ""

# Copiar arquivos HTML
Write-Host "Copiando arquivos HTML..." -ForegroundColor Yellow
Copy-Item -Path "index.html" -Destination "public\" -Force
Copy-Item -Path "admin.html" -Destination "public\" -Force
Write-Host "Arquivos HTML copiados" -ForegroundColor Green

# Copiar arquivos raiz importantes
Write-Host "Copiando arquivos raiz..." -ForegroundColor Yellow
Copy-Item -Path "manifest.json" -Destination "public\" -Force
Copy-Item -Path "service-worker.js" -Destination "public\" -Force
Write-Host "Arquivos raiz copiados" -ForegroundColor Green

# Copiar pasta assets completa
Write-Host "Copiando pasta assets..." -ForegroundColor Yellow
if (Test-Path "assets") {
    Copy-Item -Path "assets" -Destination "public\assets" -Recurse -Force
    Write-Host "Pasta assets copiada" -ForegroundColor Green
} else {
    Write-Host "Pasta assets nao encontrada" -ForegroundColor Red
}

Write-Host ""
Write-Host "Build concluido com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Iniciando deploy para Firebase..." -ForegroundColor Cyan
Write-Host ""

firebase deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Deploy concluido com sucesso!" -ForegroundColor Green
    Write-Host "Seu site esta disponivel em producao!" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "Erro ao fazer deploy" -ForegroundColor Red
}

Write-Host ""
Write-Host "Processo finalizado!" -ForegroundColor Cyan
