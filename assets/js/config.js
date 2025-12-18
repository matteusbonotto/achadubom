/**
 * =============================================
 * ARQUIVO DE CONFIGURAÇÃO DO ACHADUBOM
 * =============================================
 */

window.AchaduBomConfig = {
    // Configurações do Painel Administrativo
    admin: {
        enabled: false,
        requireAuth: true,
        allowedUsers: [],
    },

    // Configurações gerais do site
    site: {
        showBetaFeatures: false,
        enableAnalytics: true,
        maintenanceMode: false,
        autoRefreshInterval: 10, // minutos para limpeza automática do cache
        autoReloadAfterCacheClear: true // recarregar página automaticamente após limpar cache
    },

    // Configurações de debug/desenvolvimento
    debug: {
        showConsoleMessages: false,
        enableErrorReporting: true
    },

    // Supabase Configuration (pode ser exposta no frontend)
    supabase: {
        url: 'https://khahucrzwlqrvwcxogfi.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoYWh1Y3J6d2xxcnZ3Y3hvZ2ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyODcwNzgsImV4cCI6MjA4MDg2MzA3OH0.U0uodkEOkZk_ilMXHh014mrnevCR1J5Ydu3JwcslT3E' // Chave anon pode ser exposta
    },

    // Versão da configuração (para controle)
    version: "1.0.0",
    lastModified: "2025-08-18"
};
