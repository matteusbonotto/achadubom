# Script para servir o site localmente
# Executa um servidor HTTP simples na porta 8000

Write-Host "🌐 Iniciando servidor local..." -ForegroundColor Green
Write-Host "📁 Servindo arquivos do diretório atual" -ForegroundColor Cyan
Write-Host "🔗 Acesse: http://localhost:8000" -ForegroundColor Yellow
Write-Host "⚠️  Pressione Ctrl+C para parar o servidor" -ForegroundColor Gray
Write-Host ""

# Verificar se Python está disponível
if (Get-Command "python" -ErrorAction SilentlyContinue) {
    python -m http.server 8000
} elseif (Get-Command "python3" -ErrorAction SilentlyContinue) {
    python3 -m http.server 8000
} else {
    Write-Host "❌ Python não encontrado! Instale Python para usar este servidor." -ForegroundColor Red
    Write-Host "💡 Alternativa: abra os arquivos HTML diretamente no navegador" -ForegroundColor Yellow
}
