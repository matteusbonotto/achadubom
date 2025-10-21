# Script para iniciar servidor com cache desabilitado
Write-Host "🚀 Iniciando servidor de desenvolvimento..." -ForegroundColor Cyan
Write-Host "📦 Versão atualizada com múltiplas badges de categorias" -ForegroundColor Green
Write-Host ""

# Parar servidor Python existente (se houver)
Get-Process python -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*http.server*" } | Stop-Process -Force -ErrorAction SilentlyContinue

# Limpar cache do navegador (instruções)
Write-Host "💡 IMPORTANTE: Limpe o cache do navegador!" -ForegroundColor Yellow
Write-Host "   - Chrome: Ctrl+Shift+Del > Limpar cache" -ForegroundColor Gray
Write-Host "   - Ou abra em modo anônimo: Ctrl+Shift+N" -ForegroundColor Gray
Write-Host ""

# Adicionar timestamp aos arquivos JS e CSS para forçar atualização
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
Write-Host "🔄 Cache-busting timestamp: $timestamp" -ForegroundColor Magenta

# Iniciar servidor Python
Write-Host "🌐 Servidor rodando em: http://localhost:8000" -ForegroundColor Green
Write-Host "📱 URL com cache-bust: http://localhost:8000?v=$timestamp" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione Ctrl+C para parar o servidor" -ForegroundColor Yellow
Write-Host ""

# Abrir navegador automaticamente com cache-busting
Start-Sleep -Seconds 1
Start-Process "http://localhost:8000?v=$timestamp"

# Iniciar servidor
python -m http.server 8000
