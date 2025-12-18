# Script de Build e Deploy para Firebase Hosting
# Uso: .\build-and-deploy.ps1

Write-Host "Iniciando build e deploy do AchaduBom..." -ForegroundColor Cyan

# Verificar se Firebase CLI esta instalado
Write-Host "`nVerificando Firebase CLI..." -ForegroundColor Yellow
$firebaseCheck = Get-Command firebase -ErrorAction SilentlyContinue
if (-not $firebaseCheck) {
    Write-Host "Firebase CLI nao encontrado!" -ForegroundColor Red
    Write-Host "Instale com: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
} else {
    $firebaseVersion = firebase --version 2>&1
    Write-Host "Firebase CLI encontrado: $firebaseVersion" -ForegroundColor Green
}

# Verificar se esta logado no Firebase
Write-Host "`nVerificando autenticacao Firebase..." -ForegroundColor Yellow
$firebaseLogin = firebase login:list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Nao esta logado no Firebase. Fazendo login..." -ForegroundColor Yellow
    firebase login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erro ao fazer login no Firebase" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Autenticado no Firebase" -ForegroundColor Green
}

# Limpar pasta public completamente
Write-Host "`nLimpando pasta public..." -ForegroundColor Yellow
if (Test-Path "public") {
    Remove-Item -Path "public" -Recurse -Force
    Write-Host "Pasta public removida completamente" -ForegroundColor Green
}
New-Item -ItemType Directory -Path "public" | Out-Null
Write-Host "Pasta public criada" -ForegroundColor Green

# Copiar arquivos da raiz para public
Write-Host "`nCopiando arquivos para public..." -ForegroundColor Yellow

# Copiar arquivos principais
$arquivosPrincipais = @("index.html", "admin.html", "manifest.json", "service-worker.js")
foreach ($arquivo in $arquivosPrincipais) {
    if (Test-Path $arquivo) {
        Copy-Item $arquivo -Destination "public\$arquivo" -Force
        Write-Host "  $arquivo copiado" -ForegroundColor Green
    } else {
        Write-Host "  $arquivo nao encontrado" -ForegroundColor Yellow
    }
}

# Copiar pasta assets completa
if (Test-Path "assets") {
    # Remover assets antigo se existir
    if (Test-Path "public\assets") {
        Remove-Item -Path "public\assets" -Recurse -Force
    }
    Copy-Item "assets" -Destination "public\assets" -Recurse -Force
    Write-Host "  Pasta assets copiada" -ForegroundColor Green
} else {
    Write-Host "  Pasta assets nao encontrada" -ForegroundColor Yellow
}

# Copiar CNAME se existir (para dominio customizado)
if (Test-Path "CNAME") {
    Copy-Item "CNAME" -Destination "public\CNAME" -Force
    Write-Host "  CNAME copiado" -ForegroundColor Green
}

# Verificar se tudo foi copiado corretamente
Write-Host "`nVerificando arquivos copiados..." -ForegroundColor Yellow
$arquivosObrigatorios = @(
    "public\index.html",
    "public\admin.html",
    "public\manifest.json",
    "public\service-worker.js",
    "public\assets\css\globals.css",
    "public\assets\css\desktop.css",
    "public\assets\css\mobile.css",
    "public\assets\js\main.js",
    "public\assets\js\admin-api.js"
)

$todosOk = $true
foreach ($arquivo in $arquivosObrigatorios) {
    if (Test-Path $arquivo) {
        Write-Host "  OK: $arquivo" -ForegroundColor Green
    } else {
        Write-Host "  ERRO: $arquivo nao encontrado!" -ForegroundColor Red
        $todosOk = $false
    }
}

if (-not $todosOk) {
    Write-Host "`nERRO: Alguns arquivos obrigatorios nao foram copiados!" -ForegroundColor Red
    exit 1
}

Write-Host "`nBuild concluido com sucesso!" -ForegroundColor Green

# Perguntar se deseja fazer deploy
Write-Host "`nDeseja fazer deploy no Firebase Hosting? (S/N)" -ForegroundColor Cyan
$resposta = Read-Host

if ($resposta -eq "S" -or $resposta -eq "s" -or $resposta -eq "Y" -or $resposta -eq "y") {
    Write-Host "`nFazendo deploy no Firebase Hosting..." -ForegroundColor Yellow
    
    firebase deploy --only hosting
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nDeploy concluido com sucesso!" -ForegroundColor Green
        Write-Host "Site disponivel em: https://achadubom.com.br" -ForegroundColor Cyan
    } else {
        Write-Host "`nErro durante o deploy" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "`nDeploy cancelado. Arquivos prontos em public/" -ForegroundColor Yellow
    Write-Host "Para fazer deploy manualmente, execute: firebase deploy --only hosting" -ForegroundColor Cyan
}

Write-Host "`nProcesso finalizado!" -ForegroundColor Green
