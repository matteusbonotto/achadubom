// =============================================
// EDGE FUNCTION - EXTRAÇÃO DE IMAGEM DE PRODUTO
// Extrai a imagem principal de um produto a partir da URL
// =============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
}

interface ExtractImageRequest {
  url: string
  produtoNome?: string
}

/**
 * Extrair imagem de produto Shopee usando scraping direto da página
 */
async function extrairImagemShopee(url: string): Promise<string | null> {
  try {
    console.log(`🛒 Tentando extrair imagem Shopee de: ${url}`)
    
    // Resolver short link primeiro
    let finalUrl = url
    if (url.includes('s.shopee.com.br')) {
      console.log('🔗 Detectado short link Shopee, resolvendo...')
      try {
        const response = await fetch(url, { 
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
          }
        })
        finalUrl = response.url || url
        console.log(`✅ URL resolvida: ${finalUrl}`)
      } catch (e) {
        console.warn('⚠️ Erro ao resolver short link:', e)
      }
    }
    
    // Fazer scraping direto da página do produto
    try {
      console.log('🌐 Fazendo scraping da página do produto...')
      const response = await fetch(finalUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      })
      
      if (!response.ok) {
        console.warn(`⚠️ Resposta não OK: ${response.status}`)
        return null
      }
      
      const html = await response.text()
      console.log(`📄 HTML recebido (${html.length} chars)`)
      
      // Buscar imagem principal do produto - múltiplos padrões
      const imagePatterns = [
        // Meta tags (prioridade alta)
        /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i,
        /<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i,
        // JSON-LD (estruturado)
        /"image":\s*["']([^"']+)["']/i,
        // Imagens do produto (Shopee específico)
        /"image":\s*\["([^"]+)"\]/i,
        /"imageUrl":\s*["']([^"']+)["']/i,
        // Imagens em atributos data
        /data-src=["']([^"']*shopee[^"']*\.(jpg|jpeg|png|webp)[^"']*)["']/i,
        /data-src=["']([^"']*s\.shopee[^"']*\.(jpg|jpeg|png|webp)[^"']*)["']/i,
        // Imagens diretas
        /<img[^>]+src=["']([^"']*shopee[^"']*\.(jpg|jpeg|png|webp)[^"']*)["']/i,
        /<img[^>]+src=["']([^"']*s\.shopee[^"']*\.(jpg|jpeg|png|webp)[^"']*)["']/i,
        // Qualquer imagem grande (último recurso)
        /<img[^>]+src=["']([^"']*\.(jpg|jpeg|png|webp)[^"']*)["'][^>]*>/i,
      ]
      
      for (const pattern of imagePatterns) {
        const match = html.match(pattern)
        if (match && match[1]) {
          let imgUrl = match[1]
          
          // Limpar URL
          imgUrl = imgUrl.replace(/\\u002F/g, '/').replace(/\\\//g, '/')
          
          // Converter URL relativa em absoluta
          if (imgUrl.startsWith('//')) {
            imgUrl = 'https:' + imgUrl
          } else if (imgUrl.startsWith('/')) {
            const urlObj = new URL(finalUrl)
            imgUrl = urlObj.origin + imgUrl
          }
          
          // Validar se é uma URL de imagem válida
          if (imgUrl.match(/\.(jpg|jpeg|png|webp|gif)/i) && 
              !imgUrl.includes('logo') && 
              !imgUrl.includes('icon') &&
              imgUrl.length > 20) {
            console.log(`✅ Imagem encontrada via scraping: ${imgUrl.substring(0, 100)}...`)
            
            // Verificar se a imagem existe
            try {
              const imgCheck = await fetch(imgUrl, { method: 'HEAD' })
              if (imgCheck.ok) {
                return imgUrl
              }
            } catch {
              // Mesmo se não conseguir verificar, retornar a URL encontrada
              return imgUrl
            }
          }
        }
      }
      
      console.warn('⚠️ Nenhuma imagem encontrada no HTML')
    } catch (e) {
      console.error('❌ Erro ao fazer scraping:', e)
    }
    
  } catch (error) {
    console.error('❌ Erro ao extrair imagem Shopee:', error)
  }
  
  return null
}

/**
 * Extrair imagem usando meta tags (og:image, twitter:image) - método genérico
 */
async function extrairImagemMetaTags(url: string): Promise<string | null> {
  try {
    console.log('🔍 Tentando extrair via meta tags...')
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
      }
    })
    
    if (!response.ok) {
      console.warn(`⚠️ Resposta não OK: ${response.status}`)
      return null
    }
    
    const html = await response.text()
    
    // Buscar og:image (prioridade)
    const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)
    if (ogImageMatch && ogImageMatch[1]) {
      let imgUrl = ogImageMatch[1]
      // Limpar e validar
      imgUrl = imgUrl.replace(/\\u002F/g, '/').replace(/\\\//g, '/')
      if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl
      console.log(`✅ Imagem encontrada via og:image: ${imgUrl}`)
      return imgUrl
    }
    
    // Buscar twitter:image
    const twitterImageMatch = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i)
    if (twitterImageMatch && twitterImageMatch[1]) {
      let imgUrl = twitterImageMatch[1]
      imgUrl = imgUrl.replace(/\\u002F/g, '/').replace(/\\\//g, '/')
      if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl
      console.log(`✅ Imagem encontrada via twitter:image: ${imgUrl}`)
      return imgUrl
    }
    
    // Buscar meta property twitter:image
    const twitterImagePropMatch = html.match(/<meta\s+property=["']twitter:image["']\s+content=["']([^"']+)["']/i)
    if (twitterImagePropMatch && twitterImagePropMatch[1]) {
      let imgUrl = twitterImagePropMatch[1]
      imgUrl = imgUrl.replace(/\\u002F/g, '/').replace(/\\\//g, '/')
      if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl
      console.log(`✅ Imagem encontrada via twitter:image (property): ${imgUrl}`)
      return imgUrl
    }
    
    console.warn('⚠️ Nenhuma meta tag de imagem encontrada')
  } catch (error) {
    console.error('❌ Erro ao extrair meta tags:', error)
  }
  
  return null
}

/**
 * Extrair imagem usando seletores comuns de produtos
 */
async function extrairImagemScraping(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
      }
    })
    
    if (!response.ok) {
      return null
    }
    
    const html = await response.text()
    
    // Seletores comuns para imagens de produto
    const patterns = [
      /<img[^>]+class=["'][^"']*product[^"']*image[^"']*["'][^>]+src=["']([^"']+)["']/i,
      /<img[^>]+class=["'][^"']*main[^"']*image[^"']*["'][^>]+src=["']([^"']+)["']/i,
      /<img[^>]+data-src=["']([^"']+product[^"']+)["']/i,
      /<img[^>]+src=["']([^"']+product[^"']+)["']/i,
    ]
    
    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match && match[1]) {
        let imgUrl = match[1]
        
        // Converter URL relativa em absoluta
        if (imgUrl.startsWith('//')) {
          imgUrl = 'https:' + imgUrl
        } else if (imgUrl.startsWith('/')) {
          const urlObj = new URL(url)
          imgUrl = urlObj.origin + imgUrl
        }
        
        // Validar se é uma URL de imagem válida
        if (imgUrl.match(/\.(jpg|jpeg|png|webp|gif)/i)) {
          return imgUrl
        }
      }
    }
    
  } catch (error) {
    console.error('Erro ao fazer scraping:', error)
  }
  
  return null
}

/**
 * Função principal para extrair imagem
 */
async function extrairImagem(url: string, produtoNome?: string): Promise<string | null> {
  console.log(`🔍 Extraindo imagem de: ${url}`)
  
  // 1. Tentar meta tags primeiro (mais rápido e confiável)
  if (!url.includes('shopee.com.br') && !url.includes('s.shopee.com.br')) {
    const imagemMeta = await extrairImagemMetaTags(url)
    if (imagemMeta) {
      console.log(`✅ Imagem de meta tag encontrada: ${imagemMeta}`)
      return imagemMeta
    }
  }
  
  // 2. Tentar Shopee com scraping completo
  if (url.includes('shopee.com.br') || url.includes('s.shopee.com.br')) {
    const imagemShopee = await extrairImagemShopee(url)
    if (imagemShopee) {
      console.log(`✅ Imagem Shopee encontrada: ${imagemShopee}`)
      return imagemShopee
    }
  }
  
  // 3. Tentar meta tags para outras lojas
  const imagemMeta = await extrairImagemMetaTags(url)
  if (imagemMeta) {
    console.log(`✅ Imagem de meta tag encontrada: ${imagemMeta}`)
    return imagemMeta
  }
  
  // 4. Tentar scraping HTML genérico (último recurso)
  const imagemScraping = await extrairImagemScraping(url)
  if (imagemScraping) {
    console.log(`✅ Imagem via scraping encontrada: ${imagemScraping}`)
    return imagemScraping
  }
  
  console.log(`❌ Nenhuma imagem encontrada para: ${url}`)
  return null
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('📥 Requisição recebida para extrair imagem')
    console.log(`📋 Método: ${req.method}`)
    console.log(`📋 Headers:`, Object.fromEntries(req.headers.entries()))
    
    // Verificar se tem body
    const contentType = req.headers.get('content-type')
    console.log(`📋 Content-Type: ${contentType}`)
    
    if (!contentType || !contentType.includes('application/json')) {
      console.error('❌ Content-Type inválido ou ausente')
      return new Response(
        JSON.stringify({ 
          sucesso: false,
          erro: 'Content-Type deve ser application/json' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Ler body como texto primeiro para debug
    const bodyText = await req.text()
    console.log(`📋 Body recebido (${bodyText.length} chars):`, bodyText.substring(0, 200))
    
    if (!bodyText || bodyText.trim().length === 0) {
      console.error('❌ Body vazio')
      return new Response(
        JSON.stringify({ 
          sucesso: false,
          erro: 'Body da requisição está vazio' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    let body: ExtractImageRequest
    try {
      body = JSON.parse(bodyText)
    } catch (e) {
      console.error('❌ Erro ao parsear JSON:', e)
      console.error('❌ Body que falhou:', bodyText)
      return new Response(
        JSON.stringify({ 
          sucesso: false,
          erro: `JSON inválido: ${e.message}` 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { url, produtoNome } = body

    console.log(`📋 URL recebida: ${url}`)
    console.log(`📋 Nome do produto: ${produtoNome || 'não fornecido'}`)

    if (!url || url === 'undefined' || url === 'null' || url.trim() === '') {
      console.error('❌ URL não fornecida ou inválida')
      return new Response(
        JSON.stringify({ 
          sucesso: false,
          erro: 'URL é obrigatória e deve ser uma string válida' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('🔄 Iniciando extração de imagem...')
    const imagemUrl = await extrairImagem(url, produtoNome)

    if (imagemUrl) {
      console.log(`✅ Imagem extraída com sucesso: ${imagemUrl}`)
      return new Response(
        JSON.stringify({ 
          sucesso: true,
          imagem: imagemUrl 
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    } else {
      console.log(`⚠️ Nenhuma imagem encontrada para: ${url}`)
      return new Response(
        JSON.stringify({ 
          sucesso: false,
          imagem: null,
          mensagem: 'Nenhuma imagem encontrada'
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

  } catch (error) {
    console.error('❌ Erro na Edge Function:', error)
    console.error('Stack:', error.stack)
    return new Response(
      JSON.stringify({ 
        sucesso: false,
        erro: error.message || 'Erro ao extrair imagem',
        stack: error.stack
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

