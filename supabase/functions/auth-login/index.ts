// =============================================
// EDGE FUNCTION - AUTENTICAÇÃO
// Verifica senha usando bcryptjs (compatível com Deno Edge Functions)
// =============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { encode as encodeBase64 } from "https://deno.land/std@0.168.0/encoding/base64.ts"
// Usar bcryptjs via esm.sh - versão puramente JavaScript que não usa Worker
// bcryptjs é CommonJS, precisa importar o módulo inteiro
import bcryptjs from "https://esm.sh/bcryptjs@2.4.3"

// Obter variáveis de ambiente
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://khahucrzwlqrvwcxogfi.supabase.co'
// A service_role key deve ser configurada como secret na Edge Function
// Nome da secret: SERVICE_ROLE_KEY (sem prefixo SUPABASE_)
const SUPABASE_SERVICE_KEY = Deno.env.get('SERVICE_ROLE_KEY') || ''

if (!SUPABASE_SERVICE_KEY) {
  console.error('⚠️ SERVICE_ROLE_KEY não configurada! Configure nas Secrets da Edge Function.')
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ erro: 'Método não permitido' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    console.log('Requisição recebida')
    const { email, senha } = await req.json()
    console.log('Email recebido:', email)

    if (!email || !senha) {
      return new Response(
        JSON.stringify({ erro: 'Email e senha são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Conectar ao Supabase com service_role para buscar usuário
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Buscar usuário
    console.log('Buscando usuário no banco...')
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .eq('ativo', true)
      .single()

    if (error) {
      console.error('Erro ao buscar usuário:', error)
    }
    
    if (error || !usuario) {
      return new Response(
        JSON.stringify({ erro: 'Credenciais inválidas' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar senha usando bcryptjs (compatível com Deno, não usa Worker)
    let senhaValida = false
    try {
      console.log('Iniciando verificação de senha...')
      // bcryptjs.compare é síncrono e retorna boolean diretamente
      senhaValida = bcryptjs.compareSync(senha, usuario.senha_hash)
      console.log('Verificação de senha concluída:', senhaValida)
    } catch (bcryptError) {
      console.error('Erro ao verificar senha com bcryptjs:', bcryptError)
      console.error('Stack:', bcryptError.stack)
      // Se bcryptjs falhar, retornar erro específico
      return new Response(
        JSON.stringify({ 
          erro: 'Erro interno ao verificar senha',
          detalhes: bcryptError.message || String(bcryptError)
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (!senhaValida) {
      return new Response(
        JSON.stringify({ erro: 'Credenciais inválidas' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Gerar token simples (em produção, use JWT)
    const tokenData = JSON.stringify({
      email: usuario.email,
      timestamp: Date.now()
    })
    // Converter string para Uint8Array e depois para base64
    const encoder = new TextEncoder()
    const tokenBytes = encoder.encode(tokenData)
    const token = encodeBase64(tokenBytes)
    
    return new Response(
      JSON.stringify({
        sucesso: true,
        token: token,
        usuario: {
          email: usuario.email,
          nome: usuario.nome
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ erro: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

