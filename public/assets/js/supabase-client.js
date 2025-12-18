/**
 * =============================================
 * CLIENTE SUPABASE SINGLETON
 * Evita múltiplas instâncias
 * =============================================
 */

let supabaseClient = null;

function getSupabaseClient() {
    if (!supabaseClient) {
        const config = window.AchaduBomConfig?.supabase || {};
        if (!config.url || !config.anonKey) {
            console.error('❌ Supabase não configurado! Verifique config.js');
            return null;
        }
        
        supabaseClient = window.supabase?.createClient(config.url, config.anonKey);
        console.log('✅ Cliente Supabase inicializado');
    }
    
    return supabaseClient;
}

// Disponibilizar globalmente
window.getSupabaseClient = getSupabaseClient;

