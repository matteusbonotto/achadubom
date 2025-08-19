/**
 * =============================================
 * ARQUIVO DE CONFIGURAÇÃO DO ACHADUBOM
 * =============================================
 */

window.AchaduBomConfig = {
    // Configurações do Painel Administrativo
    admin: {
        enabled: true,
        requireAuth: true,
        allowedUsers: [],
    },

    // Configurações gerais do site
    site: {
        showBetaFeatures: false,
        enableAnalytics: true,
        maintenanceMode: false,
        autoRefreshInterval: 10 // minutos para limpeza automática do cache
    },

    // Configurações de debug/desenvolvimento
    debug: {
        showConsoleMessages: false,
        enableErrorReporting: true
    },

    // Versão da configuração (para controle)
    version: "1.0.0",
    lastModified: "2025-08-18"
};
