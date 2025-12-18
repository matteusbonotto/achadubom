// =============================================
// EDGE FUNCTION - SINCRONIZAÇÃO SHOPEE
// Busca produtos da API GraphQL de afiliados da Shopee
// e salva no Supabase automaticamente
// =============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Obter variáveis de ambiente
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://khahucrzwlqrvwcxogfi.supabase.co'
const SUPABASE_SERVICE_KEY = Deno.env.get('SERVICE_ROLE_KEY') || ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
}

// Função para gerar assinatura SHA256 (autenticação Shopee)
// Tentando múltiplas variações para encontrar a correta
async function generateShopeeSignature(
  appId: string,
  password: string,
  timestamp: number,
  payload?: string
): Promise<string> {
  try {
    // Tentar variação 1: AppID + Timestamp (formato mais comum)
    const message1 = `${appId}${timestamp}`
    
    // Tentar variação 2: AppID + Timestamp + Payload (se fornecido)
    const message2 = payload ? `${appId}${timestamp}${payload}` : null
    
    // Tentar variação 3: Timestamp + AppID (ordem invertida)
    const message3 = `${timestamp}${appId}`
    
    console.log(`🔐 Gerando assinatura:`)
    console.log(`   • AppID: ${appId}`)
    console.log(`   • Timestamp: ${timestamp}`)
    console.log(`   • Password length: ${password.length}`)
    if (payload) {
      console.log(`   • Payload length: ${payload.length}`)
    }
    
    const encoder = new TextEncoder()
    const key = encoder.encode(password)
    
    // Importar crypto para SHA256 HMAC
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    // Se payload foi fornecido, usar variação 2 (com payload)
    // Caso contrário, usar variação 1 (sem payload)
    const message = payload ? message2! : message1
    
    const data = encoder.encode(message)
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, data)
    const hashArray = Array.from(new Uint8Array(signature))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    console.log(`   • Variação: ${payload ? 'AppID+Timestamp+Payload' : 'AppID+Timestamp'}`)
    console.log(`   • Mensagem: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`)
    console.log(`   • Assinatura: ${hashHex.substring(0, 40)}...`)
    
    return hashHex
  } catch (error) {
    console.error('❌ Erro ao gerar assinatura:', error)
    console.error('   Stack:', error.stack)
    throw error
  }
}

// Função para buscar produtos da API Shopee GraphQL
async function buscarProdutosShopee(
  appId: string,
  password: string,
  page: number = 1,
  limit: number = 50
): Promise<{ produtos: any[], hasNextPage: boolean }> {
  const timestamp = Math.floor(Date.now() / 1000)
  const signature = await generateShopeeSignature(appId, password, timestamp)
  
  // URL da API GraphQL Shopee Brasil
  const shopeeUrl = 'https://open-api.affiliate.shopee.com.br/graphql'
  
  // Query GraphQL para buscar produtos (productOfferV2)
  // Tentando múltiplas variações para encontrar a que funciona
  const queries = [
    // Query 1: Mais simples, sem sortType
    {
      name: 'Query Simples (sem sortType)',
      query: `
        query GetProductOffers($page: Int!, $limit: Int!) {
          productOfferV2(
            page: $page
            limit: $limit
          ) {
            nodes {
              itemId
              productName
              imageUrl
              offerLink
              productLink
              priceMin
              priceMax
              commissionRate
              sales
              shopName
            }
            pageInfo {
              page
              limit
              hasNextPage
            }
          }
        }
      `
    },
    // Query 2: Com sortType: 1 (LATEST_DESC)
    {
      name: 'Query com sortType: 1 (LATEST_DESC)',
      query: `
        query GetProductOffers($page: Int!, $limit: Int!) {
          productOfferV2(
            page: $page
            limit: $limit
            sortType: 1
          ) {
            nodes {
              itemId
              productName
              imageUrl
              offerLink
              productLink
              priceMin
              priceMax
              commissionRate
              sales
              shopName
            }
            pageInfo {
              page
              limit
              hasNextPage
            }
          }
        }
      `
    },
    // Query 3: Com sortType: 2 (HIGHEST_COMMISSION_DESC)
    {
      name: 'Query com sortType: 2 (HIGHEST_COMMISSION_DESC)',
      query: `
        query GetProductOffers($page: Int!, $limit: Int!) {
          productOfferV2(
            page: $page
            limit: $limit
            sortType: 2
          ) {
            nodes {
              itemId
              productName
              imageUrl
              offerLink
              productLink
              priceMin
              priceMax
              commissionRate
              sales
              shopName
            }
            pageInfo {
              page
              limit
              hasNextPage
            }
          }
        }
      `
    }
  ]
  
  // Tentar cada query até uma funcionar
  for (const queryConfig of queries) {
    console.log(`\n🔍 Tentando: ${queryConfig.name}`)
    console.log(`📝 Query: ${queryConfig.query.substring(0, 200)}...`)
    
    const graphqlQuery = queryConfig.query
    
    const requestBody = {
      query: graphqlQuery,
      variables: {
        page: page,
        limit: limit
      }
    }
    
    // Gerar assinatura COM o payload (algumas APIs requerem isso)
    const payloadString = JSON.stringify(requestBody)
    const signatureWithPayload = await generateShopeeSignature(appId, password, timestamp, payloadString)
    
    // Tentar também sem payload (formato padrão)
    const signatureWithoutPayload = await generateShopeeSignature(appId, password, timestamp)
    
    // Tentar primeiro com payload, depois sem payload
    const signatures = [
      { name: 'Com Payload', sig: signatureWithPayload },
      { name: 'Sem Payload', sig: signatureWithoutPayload }
    ]
    
    for (const sigConfig of signatures) {
      console.log(`\n🔐 Tentando autenticação: ${sigConfig.name}`)
      
      // Headers de autenticação Shopee (formato SHA256)
      // Formato: SHA256 Credential=AppID, Signature=Signature, Timestamp=Timestamp
      const authHeader = `SHA256 Credential=${appId}, Signature=${sigConfig.sig}, Timestamp=${timestamp}`
      
      console.log(`   • Header: ${authHeader}`)
      console.log(`   • Credential: ${appId}`)
      console.log(`   • Signature: ${sigConfig.sig.substring(0, 40)}...`)
      console.log(`   • Timestamp: ${timestamp}`)
      console.log(`📤 Enviando requisição para: ${shopeeUrl}`)
      console.log(`📦 Body: ${JSON.stringify(requestBody).substring(0, 300)}...`)
    
    try {
      const response = await fetch(shopeeUrl, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
      
      console.log(`📥 Status da resposta: ${response.status} ${response.statusText}`)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Erro na API Shopee (${queryConfig.name}):`, response.status)
        console.error('📄 Resposta:', errorText)
        // Continuar para próxima query se não for 200
        if (response.status !== 200) {
          continue
        }
      }
      
      const result = await response.json()
      
      console.log(`📦 Resposta da API Shopee recebida (${queryConfig.name})`)
      console.log('📄 Resposta completa:', JSON.stringify(result, null, 2))
      
      // Log detalhado para diagnóstico
      console.log('🔍 DIAGNÓSTICO DETALHADO:')
      console.log(`   • Query usada: ${queryConfig.name}`)
      console.log(`   • Tem errors: ${!!result.errors}`)
      console.log(`   • Tem data: ${!!result.data}`)
      if (result.data) {
        console.log(`   • Chaves em data: ${Object.keys(result.data).join(', ')}`)
      }
      
      if (result.errors) {
        const errorCode = result.errors[0]?.extensions?.code
        const errorMsg = result.errors[0]?.message || ''
        
        console.error('❌ Erros GraphQL:', JSON.stringify(result.errors, null, 2))
        
        // Se for erro de assinatura, tentar próxima assinatura
        if (errorCode === 10020 && errorMsg.includes('Invalid Signature')) {
          console.warn(`⚠️ Assinatura inválida (${sigConfig.name}), tentando próxima...`)
          continue // Próxima assinatura
        }
        
        // Outros erros, tentar próxima query
        break // Sair do loop de assinaturas e ir para próxima query
      }
      
      if (!result.data) {
        console.warn(`⚠️ Resposta sem dados (${queryConfig.name}), tentando próxima assinatura...`)
        continue // Próxima assinatura
      }
      
      // Tentar productOfferV2 primeiro
      let data = result.data?.productOfferV2
      
      // Se não encontrar, tentar outras variações
      if (!data) {
        console.warn(`⚠️ productOfferV2 não encontrado (${queryConfig.name}), tentando alternativas...`)
        
        if (result.data?.shopOfferV2) {
          console.log('✅ Encontrado shopOfferV2')
          data = result.data.shopOfferV2
        } else if (result.data?.productOffer) {
          console.log('✅ Encontrado productOffer')
          data = result.data.productOffer
        } else if (result.data?.offers) {
          console.log('✅ Encontrado offers')
          data = result.data.offers
        } else {
          console.warn(`❌ Nenhuma estrutura conhecida encontrada (${queryConfig.name})`)
          console.warn('📄 Estrutura da resposta:', Object.keys(result.data || {}))
          // Continuar para próxima assinatura
          continue
        }
      }
      
      const produtos = data?.nodes || data?.data || []
      const hasNextPage = data?.pageInfo?.hasNextPage || false
      
      console.log(`📊 Produtos encontrados (${queryConfig.name}): ${produtos.length}, hasNextPage: ${hasNextPage}`)
      
      if (produtos.length > 0) {
        console.log(`✅ SUCESSO com ${queryConfig.name}!`)
        console.log('📦 Primeiro produto:', JSON.stringify(produtos[0], null, 2))
        return { produtos, hasNextPage }
      } else {
        console.warn(`⚠️ Array de produtos está vazio (${queryConfig.name})`)
        console.log('📄 Estrutura de data:', JSON.stringify(data, null, 2))
        
        // Diagnóstico adicional
        if (data && typeof data === 'object') {
          console.log('📋 Chaves disponíveis em data:', Object.keys(data))
          if (data.nodes) {
            console.log(`📊 data.nodes existe: ${Array.isArray(data.nodes) ? `array com ${data.nodes.length} itens` : typeof data.nodes}`)
          }
          if (data.pageInfo) {
            console.log('📄 pageInfo:', JSON.stringify(data.pageInfo, null, 2))
          }
          if (data.data) {
            console.log(`📊 data.data existe: ${Array.isArray(data.data) ? `array com ${data.data.length} itens` : typeof data.data}`)
          }
        }
        // Continuar para próxima assinatura
        continue
      }
    } catch (error) {
      console.error(`❌ Erro ao buscar produtos (${queryConfig.name} - ${sigConfig.name}):`, error)
      console.error(`   Stack:`, error.stack)
      // Continuar para próxima assinatura
      continue
    }
    } // Fim do loop de assinaturas
  } // Fim do loop de queries
  
  // Se chegou aqui, nenhuma combinação funcionou
  console.error('❌ Nenhuma combinação de query e assinatura funcionou. Todas as tentativas falharam.')
  return { produtos: [], hasNextPage: false }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Conectar ao Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Buscar credenciais da Shopee na tabela envs
    const { data: envs, error: envError } = await supabase
      .from('envs')
      .select('chave, valor')
      .in('chave', ['SHOPEE_APP_ID', 'SHOPEE_PASSWORD'])

    if (envError || !envs || envs.length < 2) {
      return new Response(
        JSON.stringify({ erro: 'Credenciais da Shopee não configuradas na tabela envs' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const shopeeAppId = (envs.find(e => e.chave === 'SHOPEE_APP_ID')?.valor || '').trim()
    const shopeePassword = (envs.find(e => e.chave === 'SHOPEE_PASSWORD')?.valor || '').trim()

    if (!shopeeAppId || !shopeePassword) {
      console.error('❌ Credenciais incompletas:', { 
        temAppId: !!shopeeAppId, 
        temPassword: !!shopeePassword 
      })
      return new Response(
        JSON.stringify({ 
          erro: 'Credenciais da Shopee incompletas',
          detalhes: {
            temAppId: !!shopeeAppId,
            temPassword: !!shopeePassword
          }
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('🔄 Iniciando sincronização com Shopee...')
    console.log(`📋 AppID: ${shopeeAppId} (${shopeeAppId.length} chars)`)
    console.log(`📋 Password: ${shopeePassword.substring(0, 5)}... (${shopeePassword.length} chars)`)
    
    // Verificar se as credenciais parecem válidas
    if (shopeeAppId.length < 5 || shopeePassword.length < 10) {
      console.warn('⚠️ Credenciais parecem muito curtas. Verifique se estão corretas.')
    }

    // Buscar produtos da Shopee (múltiplas páginas se necessário)
    let todosProdutos: any[] = []
    let page = 1
    let hasNextPage = true
    const limit = 50 // Máximo por página
    const maxPages = 20 // Limitar a 20 páginas (1000 produtos)

    while (hasNextPage && page <= maxPages) {
      try {
        console.log(`\n🔄 Buscando página ${page} de ${maxPages}...`)
        const { produtos, hasNextPage: hasMore } = await buscarProdutosShopee(
          shopeeAppId, 
          shopeePassword, 
          page, 
          limit
        )
        
        console.log(`📊 Resultado da página ${page}:`)
        console.log(`   • Produtos encontrados: ${produtos.length}`)
        console.log(`   • HasNextPage: ${hasMore}`)
        
        if (produtos.length === 0) {
          console.warn(`⚠️ Página ${page} retornou 0 produtos. Parando busca.`)
          hasNextPage = false
          break
        }
        
        todosProdutos = [...todosProdutos, ...produtos]
        console.log(`✅ Página ${page}: ${produtos.length} produtos adicionados. Total acumulado: ${todosProdutos.length}`)
        
        hasNextPage = hasMore
        
        if (hasNextPage) {
          page++
          // Pequeno delay entre requisições para evitar rate limit
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      } catch (error) {
        console.error(`❌ Erro ao buscar página ${page}:`, error)
        console.error(`   Stack:`, error.stack)
        hasNextPage = false
      }
    }

    if (todosProdutos.length === 0) {
      return new Response(
        JSON.stringify({ 
          sucesso: true,
          mensagem: 'Nenhum produto encontrado na API Shopee',
          novos: 0,
          atualizados: 0
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`✅ Total de ${todosProdutos.length} produtos encontrados na Shopee`)

    // Buscar produtos existentes no Supabase (apenas uma vez, não por produto)
    console.log('🔍 Buscando produtos existentes da Shopee no banco...')
    const { data: produtosExistentes, error: errorExistentes } = await supabase
      .from('produtos')
      .select('codigo')
      .eq('loja', 'Shopee')

    if (errorExistentes) {
      console.error('❌ Erro ao buscar produtos existentes:', errorExistentes)
      // Continuar mesmo com erro, assumindo que não há produtos existentes
    }

    const codigosExistentes = new Set(produtosExistentes?.map(p => p.codigo) || [])
    console.log(`📋 ${codigosExistentes.size} produtos da Shopee já existem no banco`)

    // Processar produtos (sem fazer queries individuais - tudo em memória)
    const produtosParaInserir: any[] = []
    const produtosParaAtualizar: any[] = []
    let novos = 0
    let atualizados = 0

    console.log(`🔄 Processando ${todosProdutos.length} produtos...`)
    
    for (const item of todosProdutos) {
      try {
        // Gerar código único baseado no itemId (sem prefixo)
        const codigo = item.itemId.toString()

        // Converter preço
        const precoMin = parseFloat(item.priceMin || '0')
        const precoMax = parseFloat(item.priceMax || '0')
        const preco = precoMax > 0 ? precoMax : (precoMin > 0 ? precoMin : 0)

        // Preparar categorias
        const categorias = ['shopee', 'geral']
        
        // Adicionar destaque se tiver muitas vendas
        if (item.sales && item.sales > 1000) {
          categorias.push('destaque')
        }

        // Preparar produto
        const produto = {
          codigo: codigo,
          ativo: true,
          titulo: item.productName || `Produto ${item.itemId}`,
          descricao: `${item.productName || 'Produto Shopee'}. Vendido por ${item.shopName || 'Shopee'}. ${item.sales || 0} vendas. ${item.ratingStar ? `Avaliação: ${item.ratingStar}` : ''}`,
          url: item.offerLink || item.productLink || '#',
          imagem: JSON.stringify([item.imageUrl].filter(Boolean)),
          categorias: JSON.stringify(categorias),
          favorito: false,
          loja: 'Shopee',
          preco: preco,
          vendas: `${item.sales || 0} vendas`,
          origem: 'shopee_api'
        }

        if (codigosExistentes.has(codigo)) {
          // Marcar para atualização em lote
          produtosParaAtualizar.push(produto)
          atualizados++
        } else {
          // Novo produto
          produtosParaInserir.push(produto)
          novos++
        }
      } catch (error) {
        console.error(`Erro ao processar produto ${item.itemId}:`, error)
      }
    }

    console.log(`📊 Produtos processados: ${novos} novos, ${atualizados} para atualizar`)

    // Inserir novos produtos em lote (com delay para evitar rate limit)
    if (produtosParaInserir.length > 0) {
      console.log(`📥 Inserindo ${produtosParaInserir.length} novos produtos em lotes...`)
      const batchSize = 50
      for (let i = 0; i < produtosParaInserir.length; i += batchSize) {
        const batch = produtosParaInserir.slice(i, i + batchSize)
        const { error } = await supabase
          .from('produtos')
          .insert(batch)

        if (error) {
          console.error(`❌ Erro ao inserir lote ${Math.floor(i / batchSize) + 1}:`, error)
        } else {
          console.log(`✅ Lote ${Math.floor(i / batchSize) + 1} inserido: ${batch.length} produtos`)
        }
        
        // Delay entre lotes para evitar rate limit
        if (i + batchSize < produtosParaInserir.length) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    }

    // Atualizar produtos existentes em lote usando UPSERT (mais eficiente)
    if (produtosParaAtualizar.length > 0) {
      console.log(`🔄 Atualizando ${produtosParaAtualizar.length} produtos existentes em lotes...`)
      const batchSize = 50
      for (let i = 0; i < produtosParaAtualizar.length; i += batchSize) {
        const batch = produtosParaAtualizar.slice(i, i + batchSize)
        // Usar upsert para atualizar baseado no código (onConflict)
        const { error } = await supabase
          .from('produtos')
          .upsert(batch, { onConflict: 'codigo' })

        if (error) {
          console.error(`❌ Erro ao atualizar lote ${Math.floor(i / batchSize) + 1}:`, error)
        } else {
          console.log(`✅ Lote ${Math.floor(i / batchSize) + 1} atualizado: ${batch.length} produtos`)
        }
        
        // Delay entre lotes para evitar rate limit
        if (i + batchSize < produtosParaAtualizar.length) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    }

    console.log(`✅ Sincronização concluída: ${novos} novos, ${atualizados} atualizados`)

    return new Response(
      JSON.stringify({
        sucesso: true,
        novos: novos,
        atualizados: atualizados,
        total_processados: todosProdutos.length,
        total_encontrados: todosProdutos.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na sincronização:', error)
    return new Response(
      JSON.stringify({ 
        erro: error.message || 'Erro desconhecido',
        stack: error.stack 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
