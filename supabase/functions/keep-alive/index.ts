// =============================================
// EDGE FUNCTION - KEEP ALIVE
// Mantém o servidor Flask ativo em produção
// =============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const SERVER_URL = 'https://achadubom.com.br'

serve(async (req) => {
  // Permitir apenas requisições POST (para segurança)
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response(
      JSON.stringify({ erro: 'Método não permitido' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const timestamp = new Date().toISOString()
  
  try {
    // Fazer ping no servidor
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(`${SERVER_URL}/api/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Supabase-KeepAlive/1.0'
      }
    })
    
    clearTimeout(timeoutId)
    
    const success = response.ok
    const results = [{
      server: SERVER_URL,
      status: response.status,
      success: success,
      timestamp
    }]
    
    return new Response(
      JSON.stringify({
        sucesso: success,
        timestamp,
        server: SERVER_URL,
        status: response.status
      }, null, 2),
      {
        status: success ? 200 : 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        sucesso: false,
        timestamp,
        erro: error.message
      }, null, 2),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})

