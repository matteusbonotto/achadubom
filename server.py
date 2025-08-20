#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================
SERVIDOR BACKEND ACHADUBOM
Sistema PWA com API REST para CRUD de produtos
=============================================
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
import requests
from urllib.parse import urlparse, quote_plus, unquote
import re
from bs4 import BeautifulSoup
import base64

app = Flask(__name__)
CORS(app)  # Permitir requisições do frontend

# Configurações
PRODUTOS_FILE = 'assets/data/produtos.json'
PORT = 5000

def carregar_produtos():
    """Carrega produtos do arquivo JSON"""
    try:
        if os.path.exists(PRODUTOS_FILE):
            with open(PRODUTOS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    except Exception as e:
        print(f"Erro ao carregar produtos: {e}")
        return []

def salvar_produtos(produtos):
    """Salva produtos no arquivo JSON"""
    try:
        # Criar diretório se não existir
        os.makedirs(os.path.dirname(PRODUTOS_FILE), exist_ok=True)
        
        with open(PRODUTOS_FILE, 'w', encoding='utf-8') as f:
            json.dump(produtos, f, ensure_ascii=False, indent=4)
        return True
    except Exception as e:
        print(f"Erro ao salvar produtos: {e}")
        return False

def extrair_imagem_produto(url, nome_produto=None):
    """Web scraping para extrair imagem do produto - primeiro tenta da URL, depois Google"""
    
    # Primeiro: tentar extrair da URL original
    imagem_url = tentar_extrair_da_url_original(url)
    if imagem_url:
        return imagem_url
    
    # Segundo: se não conseguiu e tem nome do produto, buscar no Google
    if nome_produto:
        print(f"🔄 Tentando buscar no Google Images...")
        imagem_url = buscar_imagem_google(nome_produto)
        if imagem_url:
            return imagem_url
    
    # Terceiro: usar imagem placeholder baseada na categoria
    return obter_imagem_placeholder_por_categoria(nome_produto or 'produto')

def buscar_imagem_produto_especifica(nome_produto):
    """Busca imagem específica do produto - abordagem simples que funciona"""
    try:
        print(f"\n�️ Buscando imagem para: {nome_produto}")
        
        # Tentar Google Images primeiro (funciona melhor)
        imagem_url = buscar_google_images_produtos(nome_produto)
        
        if imagem_url:
            print(f"✅ Imagem encontrada via Google Images")
            return imagem_url
        
        # Se não encontrou, tentar Bing como backup
        try:
            print("🔄 Tentando Bing Images como backup...")
            termo = nome_produto.lower()
            termo = re.sub(r'[^\w\s]', ' ', termo)
            termo = re.sub(r'\s+', ' ', termo).strip()
            palavras = [p for p in termo.split() if len(p) > 2][:4]
            termo_busca = ' '.join(palavras)
            
            url = f"https://www.bing.com/images/search?q={quote_plus(termo_busca)}"
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = requests.get(url, headers=headers, timeout=8)
            if response.status_code == 200:
                padrao = r'"(https://[^"]*\.(?:jpg|jpeg|png|webp)(?:[^"]*)?)"'
                urls = re.findall(padrao, response.text)
                
                for url in urls[:15]:
                    url_limpa = url.replace('\\u003d', '=').replace('\\', '')
                    if (len(url_limpa) > 30 and 
                        not any(termo in url_limpa.lower() for termo in ['bing.com', 'microsoft.com', 'logo.']) and
                        any(ext in url_limpa.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp'])):
                        print(f"✅ Imagem backup encontrada no Bing")
                        return url_limpa
        except:
            pass
        
        print(f"❌ Nenhuma imagem encontrada para: {nome_produto}")
        return None
        
    except Exception as e:
        print(f"❌ Erro na busca: {e}")
        return None

def buscar_em_sites_ecommerce(nome_produto):
    """Buscar produto em sites de e-commerce brasileiros"""
    try:
        # Simplificar nome do produto para busca
        termo_limpo = limpar_nome_produto(nome_produto)
        
        # Sites para buscar (em ordem de prioridade)
        sites_busca = [
            f"https://lista.mercadolivre.com.br/{termo_limpo}",
            f"https://www.americanas.com.br/busca/{termo_limpo}",
            f"https://www.casasbahia.com.br/busca?q={termo_limpo}"
        ]
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        }
        
        for site_url in sites_busca:
            try:
                print(f"🔍 Buscando em: {site_url.split('/')[2]}")
                response = requests.get(site_url, headers=headers, timeout=8)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Seletores específicos para cada site
                selectors = [
                    'img[data-src*="http"]',
                    'img[src*="http"]',
                    '.ui-search-result-image img',
                    '.product-item img',
                    '[data-testid*="product"] img',
                    '.product-card img'
                ]
                
                for selector in selectors:
                    imgs = soup.select(selector)
                    for img in imgs[:3]:  # Apenas primeiras 3 imagens
                        src = img.get('data-src') or img.get('src')
                        if src and validar_imagem_produto(src):
                            print(f"✅ Imagem encontrada em e-commerce: {src}")
                            return src
                            
            except Exception as e:
                print(f"⚠️ Erro no site {site_url.split('/')[2]}: {e}")
                continue
        
        return None
        
    except Exception as e:
        print(f"❌ Erro na busca em e-commerce: {e}")
        return None

def buscar_google_images_produtos(nome_produto):
    """Busca simples no Google Images - igual fazer manualmente"""
    try:
        # Limpar o nome para busca
        termo = nome_produto.lower()
        # Remover números e caracteres especiais desnecessários
        termo = re.sub(r'\d+ml|\d+cm|\d+L|\d+w|\d+v|\d+amp|\d+hz', '', termo)
        termo = re.sub(r'[^\w\s]', ' ', termo)
        termo = re.sub(r'\s+', ' ', termo).strip()
        
        # Pegar só as palavras principais (primeiras 4)
        palavras = [p for p in termo.split() if len(p) > 2][:4]
        termo_busca = ' '.join(palavras)
        
        print(f"🔍 Buscando no Google Images: {termo_busca}")
        
        # URL do Google Images
        url = f"https://www.google.com/search?q={quote_plus(termo_busca)}&source=lnms&tbm=isch"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            # Buscar URLs de imagens no HTML
            # Usar regex mais simples para encontrar imagens
            padrao = r'"(https://[^"]*\.(?:jpg|jpeg|png|webp)(?:[^"]*)?)"'
            urls = re.findall(padrao, response.text)
            
            print(f"📊 Encontradas {len(urls)} URLs no Google")
            
            for url in urls[:20]:  # Testar as primeiras 20
                url_limpa = url.replace('\\u003d', '=').replace('\\', '')
                
                # Filtros básicos - só rejeitar se for claramente inválido
                if (len(url_limpa) > 30 and 
                    not any(termo in url_limpa.lower() for termo in ['google.com', 'gstatic.com', 'logo.', '/logo/', 'icon.']) and
                    any(ext in url_limpa.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp'])):
                    
                    print(f"✅ IMAGEM ENCONTRADA: {url_limpa[:80]}...")
                    return url_limpa
        
        print("❌ Nenhuma imagem encontrada no Google")
        return None
        
    except Exception as e:
        print(f"❌ Erro no Google: {e}")
        return None

def buscar_amazon_produtos(nome_produto):
    """Busca específica na Amazon"""
    try:
        termo = limpar_nome_produto(nome_produto)
        print(f"📦 Buscando na Amazon: {termo}")
        
        url = f"https://www.amazon.com.br/s?k={quote_plus(termo)}&ref=nb_sb_noss"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        }
        
        response = requests.get(url, headers=headers, timeout=8)
        
        if response.status_code == 200:
            # Buscar imagens de produtos da Amazon
            padroes = [
                r'"(https://[^"]*images-amazon[^"]*\.(?:jpg|jpeg|png|webp)[^"]*)"',
                r'"(https://[^"]*ssl-images-amazon[^"]*\.(?:jpg|jpeg|png|webp)[^"]*)"'
            ]
            
            for padrao in padroes:
                urls = re.findall(padrao, response.text)
                for url in urls[:10]:
                    if validar_imagem_produto(url) and 'sprite' not in url.lower():
                        print(f"✅ Produto encontrado na Amazon!")
                        return url
                        
    except Exception as e:
        print(f"❌ Erro na Amazon: {e}")
    
    return None

def buscar_mercadolivre_produtos(produto):
    """Busca específica no MercadoLivre"""
    try:
        termo = limpar_nome_produto(produto)
        print(f"�️ Buscando no MercadoLivre: {termo}")
        
        # URL de busca do MercadoLivre
        url = f"https://lista.mercadolivre.com.br/{quote_plus(termo)}"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }
        
        response = requests.get(url, headers=headers, timeout=8)
        
        if response.status_code == 200:
            # Buscar imagens de produtos específicas (melhor padrão)
            padroes = [
                r'"(https://http2\.mlstatic\.com/D_NQ_NP_[^"]*\.(?:jpg|jpeg|png|webp))"',
                r'"(https://http2\.mlstatic\.com/D_Q_NP_[^"]*\.(?:jpg|jpeg|png|webp))"',
            ]
            
            urls_encontradas = []
            for padrao in padroes:
                urls = re.findall(padrao, response.text)
                urls_encontradas.extend(urls)
            
            print(f"📊 Encontradas {len(urls_encontradas)} URLs no MercadoLivre")
            
            for url in urls_encontradas[:15]:
                if validar_imagem_produto(url):
                    print(f"✅ Produto válido encontrado no MercadoLivre!")
                    return url
                        
    except Exception as e:
        print(f"❌ Erro no MercadoLivre: {e}")
    
    return None

def buscar_api_produtos(nome_produto):
    """Buscar usando APIs de produtos (ex: Amazon API, etc)"""
    try:
        # Implementação futura para APIs específicas
        # Por enquanto, usar como fallback uma busca mais específica
        
        termo_limpo = limpar_nome_produto(nome_produto)
        
        # URLs de APIs públicas que podem ter produtos
        apis_teste = [
            f"https://serpapi.com/search?engine=google_shopping&q={termo_limpo}",
            f"https://api.mercadolibre.com/sites/MLB/search?q={termo_limpo}"
        ]
        
        # Por enquanto retorna None, mas pode ser expandido
        return None
        
    except Exception as e:
        print(f"❌ Erro na busca por API: {e}")
        return None

def limpar_nome_produto(nome_produto):
    """Limpar nome do produto para melhor busca"""
    if not nome_produto:
        return ""
    
    # Remover palavras que atrapalham a busca
    palavras_remover = [
        'kit de', 'conjunto de', 'pack de', 'jogo de',
        'promocao', 'oferta', 'desconto', 'frete gratis',
        'envio imediato', 'lancamento', '2025', '2024',
        'cores', 'tamanhos', 'diversos', 'varias',
        'unidades', 'peças'
    ]
    
    nome_limpo = nome_produto.lower()
    
    for palavra in palavras_remover:
        nome_limpo = nome_limpo.replace(palavra, ' ')
    
    # Limpar espaços extras e pegar palavras importantes
    palavras = nome_limpo.split()
    
    # Filtrar palavras muito curtas ou genéricas
    palavras_filtradas = [p for p in palavras if len(p) > 2 and p not in ['com', 'para', 'sem', 'por', 'ate', 'mais']]
    
    # Pegar no máximo 5 palavras mais relevantes
    nome_final = ' '.join(palavras_filtradas[:5])
    
    return nome_final.strip()

def validar_imagem_produto(url):
    """Validar se a URL é de uma imagem de produto válida"""
    if not url or len(url) < 20:
        return False
    
    # Verificar extensão de imagem
    if not any(ext in url.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']):
        return False
    
    # Lista de padrões inválidos (logos, elementos de UI, etc.) - mais específica
    invalidas = [
        'placeholder', 'loading', 'blank', 'default', 'spinner',
        'logo.', 'icon.', 'avatar.', 'profile.', 'user.', 'brand.',
        'google', 'bing', 'yahoo', 'facebook', 'instagram',
        'frontend-assets', 'navigation', 'ui-navigation', 'header',
        'footer', 'sidebar', 'banner', 'menu', 'button',
        '/logo/', '/icon/', '/brand/', '/header/', '/footer/',
        'logotipo', 'logotype'
    ]
    
    url_lower = url.lower()
    
    # Verificar padrões inválidos de forma mais específica
    for palavra in invalidas:
        if palavra in url_lower:
            return False
    
    # Para MercadoLivre, ser mais específico sobre imagens de produto
    if 'mlstatic.com' in url_lower:
        # Aceitar apenas padrões específicos de produto do ML
        if not any(padrão in url for padrão in ['/D_NQ_NP_', '/D_Q_NP_', '/D_NQ_', '/D_Q_']):
            return False
        # Rejeitar URLs muito curtas (geralmente são elementos de UI)
        if len(url) < 50:
            return False
    
    # Verificar se a URL é acessível (teste rápido)
    try:
        response = requests.head(url, timeout=3)
        return response.status_code == 200
    except:
        return True  # Se não conseguir testar, assume que é válida

def buscar_imagem_google(nome_produto):
    """Nova implementação melhorada de busca"""
    # Primeiro: tentar busca específica de produto
    imagem_url = buscar_imagem_produto_especifica(nome_produto)
    if imagem_url:
        return imagem_url
    
    # Fallback: usar imagem de categoria como antes
    categoria = categorizar_produto(nome_produto)
    return obter_imagem_exemplo_por_categoria(categoria, nome_produto)

def obter_imagem_exemplo_por_categoria(categoria, termo_busca):
    """Obter uma imagem exemplo real baseada na categoria"""
    
    # URLs de imagens reais e genéricas para cada categoria
    imagens_por_categoria = {
        'eletronicos': [
            'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=300&fit=crop',
            'https://images.unsplash.com/photo-1567721913486-6585f069b332?w=300&h=300&fit=crop',
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop'
        ],
        'casa': [
            'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop',
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop',
            'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=300&h=300&fit=crop'
        ],
        'moda': [
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
            'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&h=300&fit=crop',
            'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=300&h=300&fit=crop'
        ],
        'livros': [
            'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=300&fit=crop'
        ],
        'brinquedos': [
            'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=300&fit=crop',
            'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=300&h=300&fit=crop',
            'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=300&h=300&fit=crop'
        ],
        'kits': [
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop',
            'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop',
            'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=300&fit=crop'
        ]
    }
    
    # Selecionar uma imagem aleatória da categoria
    if categoria in imagens_por_categoria:
        import random
        imagem_selecionada = random.choice(imagens_por_categoria[categoria])
        return imagem_selecionada
    
    # Categoria padrão
    return 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=300&fit=crop'

def tentar_extrair_da_url_original(url):
    """Web scraping para extrair imagem do produto com melhor detecção para Shopee"""
    try:
        print(f"🔍 Iniciando extração de imagem para: {url}")
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
        
        # Para URLs do Shopee, tentar usar API ou método alternativo
        if 'shopee.com.br' in url:
            # Extrair ID do produto da URL
            produto_id = url.split('/')[-1] if '/' in url else url
            
            # Tentar várias URLs de imagem padrão do Shopee
            possibles_urls = [
                f"https://cf.shopee.com.br/file/{produto_id}",
                f"https://cf.shopee.com.br/file/{produto_id}_tn",
                f"https://down-br.img.susercontent.com/file/{produto_id}",
                f"https://down-br.img.susercontent.com/file/{produto_id}_tn"
            ]
            
            for possible_url in possibles_urls:
                try:
                    img_response = requests.head(possible_url, timeout=5)
                    if img_response.status_code == 200:
                        print(f"✅ Imagem encontrada via padrão Shopee: {possible_url}")
                        return possible_url
                except:
                    continue
        
        # Método tradicional de scraping
        response = requests.get(url, headers=headers, timeout=15, allow_redirects=True)
        response.raise_for_status()
        print(f"✅ Página carregada com sucesso. Status: {response.status_code}")
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Lista expandida de seletores para diferentes sites
        selectors = [
            # Meta tags (prioridade alta)
            'meta[property="og:image"]',
            'meta[name="twitter:image"]',
            'meta[property="twitter:image"]',
            
            # Seletores específicos do Shopee
            'img[class*="item-image"]',
            'img[class*="product-image"]',
            'img[data-testid*="pdp"]',
            'img[data-testid*="product"]',
            
            # Seletores genéricos de produto
            'img[class*="main"]',
            'img[class*="primary"]',
            'img[class*="hero"]',
            'img[alt*="product"]',
            'img[alt*="item"]',
            
            # Containers de imagem
            '.product-image img',
            '.main-image img',
            '.item-image img',
            '.hero-image img',
            '.primary-image img',
            '.carousel img',
            '.gallery img',
            '.slider img',
            
            # Seletores por atributos
            'img[src*="product"]',
            'img[src*="item"]',
            'img[data-src*="product"]',
            'img[data-src*="item"]'
        ]
        
        for selector in selectors:
            img_elements = soup.select(selector)
            for img_element in img_elements:
                img_url = (img_element.get('content') or 
                          img_element.get('src') or 
                          img_element.get('data-src') or 
                          img_element.get('data-original'))
                
                if img_url:
                    # Resolver URL relativa para absoluta
                    if img_url.startswith('//'):
                        img_url = 'https:' + img_url
                    elif img_url.startswith('/'):
                        base_url = f"{urlparse(url).scheme}://{urlparse(url).netloc}"
                        img_url = base_url + img_url
                    
                    # Validar se é uma imagem válida
                    if (any(ext in img_url.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp', '.gif']) and
                        not any(placeholder in img_url.lower() for placeholder in ['placeholder', 'loading', 'blank', 'default', 'spinner', 'loader']) and
                        len(img_url) > 20 and  # URL mínima válida
                        not img_url.endswith('.svg')):  # Evitar SVGs que são geralmente ícones
                        
                        print(f"✅ Imagem encontrada: {img_url}")
                        return img_url
        
        # Se não encontrou, tentar procurar em scripts JSON
        for script in soup.find_all('script'):
            if script.string and ('image' in script.string or 'photo' in script.string):
                # Procurar URLs de imagem no JavaScript
                import re
                urls = re.findall(r'https?://[^\s"\'<>]+\.(?:jpg|jpeg|png|webp)', script.string)
                for img_url in urls:
                    if (not any(placeholder in img_url.lower() for placeholder in ['placeholder', 'loading', 'blank', 'default']) and
                        len(img_url) > 20):
                        print(f"✅ Imagem encontrada em script: {img_url}")
                        return img_url
        
        print(f"⚠️ Nenhuma imagem adequada encontrada")
        return None
        
    except requests.exceptions.Timeout:
        print(f"⏱️ Timeout na requisição para {url}")
        return None
    except requests.exceptions.RequestException as e:
        print(f"🌐 Erro de conexão para {url}: {e}")
        return None
    except Exception as e:
        print(f"❌ Erro geral no web scraping para {url}: {e}")
        return None

def obter_imagem_placeholder_por_categoria(nome_produto):
    """Gerar imagem de alta qualidade baseada na categoria do produto usando Unsplash"""
    categoria = categorizar_produto(nome_produto)
    return obter_imagem_exemplo_por_categoria(categoria, nome_produto)

def categorizar_produto(nome_produto):
    """Categorizar produto automaticamente baseado no nome"""
    if not nome_produto:
        return 'outros'
    
    nome_lower = nome_produto.lower()
    
    # Eletrônicos
    if any(palavra in nome_lower for palavra in ['câmera', 'camera', 'eletr', 'carregador', 'cabo', 'wireless', 'bluetooth', 'fone', 'headphone', 'mouse', 'teclado', 'celular', 'smartphone']):
        return 'eletronicos'
    
    # Casa e Cozinha
    if any(palavra in nome_lower for palavra in ['casa', 'cozinha', 'panela', 'pote', 'organizador', 'geladeira', 'dispensa', 'armário', 'banheiro', 'toalha', 'limpeza', 'escova']):
        return 'casa'
    
    # Moda e Vestuário
    if any(palavra in nome_lower for palavra in ['roupa', 'feminino', 'masculino', 'calça', 'camisa', 'vestido', 'colete', 'jaqueta', 'short', 'bermuda', 'cueca', 'calcinha', 'moda']):
        return 'moda'
    
    # Beleza e Cuidados
    if any(palavra in nome_lower for palavra in ['beleza', 'cabelo', 'pele', 'maquiagem', 'cosmétic', 'shampoo', 'perfume']):
        return 'beleza'
    
    # Esportes e Fitness
    if any(palavra in nome_lower for palavra in ['esporte', 'academia', 'treino', 'fitness', 'exercício', 'corrida', 'futebol']):
        return 'esportes'
    
    # Livros
    if any(palavra in nome_lower for palavra in ['livro', 'devocional', 'leitura', 'café com deus']):
        return 'livros'
    
    # Brinquedos e Infantil
    if any(palavra in nome_lower for palavra in ['brinquedo', 'criança', 'bebê', 'infantil', 'boneca', 'carrinho', 'bicicleta']):
        return 'brinquedos'
    
    # Kits (produtos em conjunto)
    if any(palavra in nome_lower for palavra in ['kit', 'conjunto', 'jogo', 'pack']):
        return 'kits'
    
    # Produtos em destaque (com muitas vendas)
    if any(palavra in nome_lower for palavra in ['mil+', 'vendas', 'destaque', 'promoção']):
        return 'destaque'
    
    return 'outros'

def categorizar_produto_automaticamente(titulo):
    """Categoriza produto automaticamente baseado no título"""
    titulo_lower = titulo.lower()
    categorias = []
    
    # Mapeamento de palavras-chave para categorias
    categoria_map = {
        'eletrônicos': ['câmera', 'fone', 'carregador', 'cabo', 'wireless', 'bluetooth', 'led', 'elétric', 'bateria', 'usb', 'hdmi', 'tech', 'smart', 'digital'],
        'casa': ['pote', 'panela', 'copo', 'prato', 'cozinha', 'banheiro', 'quarto', 'sala', 'mesa', 'cadeira', 'sofá', 'geladeira', 'forno', 'micro', 'organizador', 'limpeza'],
        'moda': ['calça', 'blusa', 'vestido', 'saia', 'shorts', 'jaqueta', 'casaco', 'sapato', 'tênis', 'roupa', 'feminino', 'masculino'],
        'infantil': ['bebê', 'criança', 'infantil', 'brinquedo', 'fralda', 'mamadeira', 'carrinho', 'berço', 'kids'],
        'fitness': ['academia', 'treino', 'exercício', 'musculação', 'yoga', 'pilates', 'corrida', 'bike', 'bicicleta'],
        'beleza': ['maquiagem', 'perfume', 'cabelo', 'pele', 'cosméticos', 'shampoo', 'condicionador', 'creme'],
        'livros': ['livro', 'revista', 'manual', 'guia', 'estudo', 'apostila', 'caderno'],
        'decoração': ['decoração', 'quadro', 'vaso', 'luminária', 'espelho', 'tapete', 'cortina', 'almofada'],
        'saúde': ['vitamina', 'medicamento', 'suplemento', 'saúde', 'farmácia', 'termômetro', 'nebulizador']
    }
    
    # Verificar cada categoria
    for categoria, palavras in categoria_map.items():
        if any(palavra in titulo_lower for palavra in palavras):
            categorias.append(categoria)
    
    # Categorias especiais baseadas em padrões
    if 'kit' in titulo_lower or 'conjunto' in titulo_lower or 'jogo' in titulo_lower:
        categorias.append('kits')
    
    if any(palavra in titulo_lower for palavra in ['mil+', 'k+', 'vendas']) or 'destaque' in titulo_lower:
        categorias.append('destaque')
    
    if 'promoção' in titulo_lower or 'desconto' in titulo_lower or 'oferta' in titulo_lower:
        categorias.append('promoções')
    
    # Se não encontrou categoria específica, usar 'outros'
    if not categorias:
        categorias.append('outros')
    
    return categorias

def obter_imagem_placeholder(categorias):
    """Retorna uma imagem placeholder baseada na categoria do produto"""
    placeholder_map = {
        'eletrônicos': 'https://via.placeholder.com/300x300/007BFF/FFFFFF?text=📱+Eletrônicos',
        'casa': 'https://via.placeholder.com/300x300/28A745/FFFFFF?text=🏠+Casa',
        'moda': 'https://via.placeholder.com/300x300/DC3545/FFFFFF?text=👗+Moda',
        'infantil': 'https://via.placeholder.com/300x300/FFC107/000000?text=🧸+Infantil',
        'fitness': 'https://via.placeholder.com/300x300/17A2B8/FFFFFF?text=💪+Fitness',
        'beleza': 'https://via.placeholder.com/300x300/E83E8C/FFFFFF?text=💄+Beleza',
        'livros': 'https://via.placeholder.com/300x300/6F42C1/FFFFFF?text=📚+Livros',
        'decoração': 'https://via.placeholder.com/300x300/FD7E14/FFFFFF?text=🎨+Decoração',
        'saúde': 'https://via.placeholder.com/300x300/20C997/FFFFFF?text=🏥+Saúde',
        'kits': 'https://via.placeholder.com/300x300/6C757D/FFFFFF?text=📦+Kit',
        'destaque': 'https://via.placeholder.com/300x300/FFD700/000000?text=⭐+Destaque',
        'promoções': 'https://via.placeholder.com/300x300/FF6B6B/FFFFFF?text=🔥+Promoção',
        'outros': 'https://via.placeholder.com/300x300/6C757D/FFFFFF?text=📋+Produto'
    }
    
    # Usar a primeira categoria encontrada para escolher o placeholder
    for categoria in categorias:
        if categoria in placeholder_map:
            return placeholder_map[categoria]
    
    # Se não encontrou, usar placeholder genérico
    return placeholder_map['outros']

# =============================================
# ROTAS DO SERVIDOR
# =============================================

@app.route('/')
def index():
    """Servir página inicial"""
    return send_from_directory('.', 'index.html')

@app.route('/admin')
def admin():
    """Servir página admin"""
    return send_from_directory('.', 'admin.html')

@app.route('/<path:path>')
def serve_static(path):
    """Servir arquivos estáticos"""
    return send_from_directory('.', path)

# =============================================
# API REST - PRODUTOS
# =============================================

@app.route('/api/produtos', methods=['GET'])
def get_produtos():
    """Listar todos os produtos"""
    produtos = carregar_produtos()
    return jsonify(produtos)

@app.route('/api/produtos', methods=['POST'])
def criar_produto():
    """Criar novo produto"""
    try:
        data = request.get_json()
        produtos = carregar_produtos()
        
        # Verificar se código já existe
        if any(p['codigo'] == data['codigo'] for p in produtos):
            return jsonify({'erro': 'Código já existe'}), 400
        
        # Adicionar novo produto
        produtos.append(data)
        
        if salvar_produtos(produtos):
            return jsonify({'sucesso': True, 'produto': data}), 201
        else:
            return jsonify({'erro': 'Erro ao salvar'}), 500
            
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@app.route('/api/produtos/<codigo>', methods=['PUT'])
def atualizar_produto(codigo):
    """Atualizar produto existente"""
    try:
        data = request.get_json()
        produtos = carregar_produtos()
        
        # Encontrar produto
        for i, produto in enumerate(produtos):
            if produto['codigo'] == codigo:
                produtos[i] = data
                break
        else:
            return jsonify({'erro': 'Produto não encontrado'}), 404
        
        if salvar_produtos(produtos):
            return jsonify({'sucesso': True, 'produto': data})
        else:
            return jsonify({'erro': 'Erro ao salvar'}), 500
            
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@app.route('/api/produtos/<codigo>', methods=['DELETE'])
def deletar_produto(codigo):
    """Deletar produto"""
    try:
        produtos = carregar_produtos()
        
        # Remover produto
        produtos = [p for p in produtos if p['codigo'] != codigo]
        
        if salvar_produtos(produtos):
            return jsonify({'sucesso': True})
        else:
            return jsonify({'erro': 'Erro ao salvar'}), 500
            
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# =============================================
# API - CSV IMPORT COM PROGRESSO
# =============================================

# Variável global para controlar o progresso da importação
progresso_importacao = {
    'ativo': False,
    'total': 0,
    'processados': 0,
    'importados': 0,
    'erros': [],
    'produto_atual': '',
    'status': 'parado'
}

@app.route('/api/import-status', methods=['GET'])
def get_import_status():
    """Retorna o status atual da importação"""
    return jsonify(progresso_importacao)

@app.route('/api/import-csv', methods=['POST'])
def import_csv():
    """Importar produtos via CSV do formato BatchProductLinks com progresso"""
    global progresso_importacao
    
    try:
        data = request.get_json()
        csv_data = data.get('csv_data', [])
        loja_selecionada = data.get('loja_selecionada', 'Shopee')
        
        print(f"📦 Iniciando importação CSV com {len(csv_data)} linhas para loja: {loja_selecionada}")
        
        if not csv_data:
            return jsonify({'erro': 'Dados CSV não fornecidos'}), 400
        
        # Inicializar progresso
        progresso_importacao.update({
            'ativo': True,
            'total': len(csv_data),
            'processados': 0,
            'importados': 0,
            'erros': [],
            'produto_atual': 'Iniciando...',
            'status': 'processando'
        })
        
        produtos = carregar_produtos()
        
        for i, linha in enumerate(csv_data, 1):
            try:
                # Atualizar progresso
                progresso_importacao['processados'] = i
                progresso_importacao['produto_atual'] = linha.get('Item Name', f'Item {i}')[:50] + '...'
                
                # Verificar se tem os campos necessários
                if not linha.get('Item Name') or not linha.get('Offer Link'):
                    erro_msg = f"Linha {i}: Item Name ou Offer Link ausentes"
                    progresso_importacao['erros'].append(erro_msg)
                    continue
                
                # Gerar código: EXATAMENTE os últimos 10 caracteres do Offer Link
                offer_link = linha.get('Offer Link', '').strip()
                if len(offer_link) >= 10:
                    codigo = offer_link[-10:]
                else:
                    erro_msg = f"Linha {i}: Offer Link muito curto: '{offer_link}'"
                    progresso_importacao['erros'].append(erro_msg)
                    continue
                
                # Verificar se código já existe
                if any(p['codigo'] == codigo for p in produtos):
                    print(f"⚠️ Produto {codigo} já existe, pulando...")
                    continue
                
                # Processar preço
                preco_str = str(linha.get('Price', '0')).replace('R$', '').replace('"', '').replace(',', '.').strip()
                try:
                    preco = float(preco_str)
                except (ValueError, AttributeError):
                    preco = 0.0
                
                # Limpar título
                titulo = str(linha.get('Item Name', '')).strip().strip('"')
                
                # Criar descrição
                vendas = linha.get('Sales', '0 vendas')
                shop_original = linha.get('Shop Name', '')
                descricao = f"{titulo}. Vendas: {vendas}. Loja original: {shop_original}."
                
                # URL: usar Offer Link
                url = offer_link
                
                # Categorizar automaticamente
                categoria = categorizar_produto(titulo)
                categorias = [categoria]
                
                # Extrair imagem
                print(f"🔍 Tentando extrair imagem para: {titulo}")
                imagem_url = extrair_imagem_produto(url, titulo)
                
                if imagem_url:
                    imagem = [imagem_url]
                    print(f"✅ Imagem extraída: {imagem_url}")
                else:
                    imagem = ['']
                    print(f"⚠️ Sem imagem para: {titulo}")
                
                # Criar produto
                produto = {
                    'codigo': codigo,
                    'ativo': True,
                    'titulo': titulo,
                    'descricao': descricao,
                    'url': url,
                    'imagem': imagem,
                    'categorias': categorias,
                    'favorito': False,
                    'loja': loja_selecionada,
                    'preco': preco,
                    'vendas': vendas
                }
                
                # Adicionar à lista e salvar imediatamente
                produtos.append(produto)
                salvar_produtos(produtos)
                
                progresso_importacao['importados'] += 1
                print(f"✅ Produto {progresso_importacao['importados']}/{progresso_importacao['total']}: {codigo} - {titulo}")
                
            except Exception as e:
                erro_msg = f"Linha {i}: Erro - {str(e)}"
                progresso_importacao['erros'].append(erro_msg)
                print(f"❌ Erro na linha {i}: {e}")
        
        # Finalizar progresso
        progresso_importacao.update({
            'ativo': False,
            'produto_atual': 'Concluído!',
            'status': 'concluido'
        })
        
        resultado = {
            'sucesso': True,
            'importados': progresso_importacao['importados'],
            'total_linhas': progresso_importacao['total'],
            'erros': progresso_importacao['erros'],
            'detalhes': f'Importados {progresso_importacao["importados"]} produtos para a loja "{loja_selecionada}"'
        }
        print(f"🎉 Importação concluída: {progresso_importacao['importados']} produtos salvos")
        return jsonify(resultado)
        
    except Exception as e:
        progresso_importacao.update({
            'ativo': False,
            'status': 'erro',
            'produto_atual': f'Erro: {str(e)}'
        })
        print(f"❌ Erro no servidor: {str(e)}")
        return jsonify({'erro': f'Erro no servidor: {str(e)}'}), 500


# =============================================
# API - WEB SCRAPING
# =============================================

@app.route('/api/extrair-imagem', methods=['POST'])
def extrair_imagem():
    """Extrair imagem de URL via web scraping"""
    try:
        data = request.get_json()
        url = data.get('url')
        
        if not url:
            return jsonify({'erro': 'URL obrigatória'}), 400
        
        imagem_url = extrair_imagem_produto(url, None)
        
        if imagem_url:
            return jsonify({'sucesso': True, 'imagem': imagem_url})
        else:
            return jsonify({'erro': 'Imagem não encontrada'}), 404
            
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# =============================================
# INICIALIZAÇÃO DO SERVIDOR
# =============================================

if __name__ == '__main__':
    print("🚀 Iniciando servidor AchaduBom...")
    print(f"📁 Arquivo de produtos: {PRODUTOS_FILE}")
    print(f"🌐 Servidor rodando em: http://localhost:{PORT}")
    print("🔧 Admin em: http://localhost:5000/admin")
    print("📊 API em: http://localhost:5000/api/produtos")
    print("\n✅ Pressione Ctrl+C para parar o servidor")
    
    app.run(host='0.0.0.0', port=PORT, debug=True)
