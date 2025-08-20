#!/usr/bin/env python
# -*- coding: utf-8 -*-

import requests
import re
from urllib.parse import quote_plus, unquote
import time

def buscar_google_images_simples(nome_produto):
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
                    
                    print(f"✅ IMAGEM ENCONTRADA: {url_limpa}")
                    return url_limpa
        
        print("❌ Nenhuma imagem encontrada")
        return None
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        return None

def buscar_bing_images_simples(nome_produto):
    """Busca alternativa no Bing"""
    try:
        # Limpar o nome
        termo = nome_produto.lower()
        termo = re.sub(r'\d+ml|\d+cm|\d+L|\d+w|\d+v', '', termo)
        termo = re.sub(r'[^\w\s]', ' ', termo)
        termo = re.sub(r'\s+', ' ', termo).strip()
        
        palavras = [p for p in termo.split() if len(p) > 2][:4]
        termo_busca = ' '.join(palavras)
        
        print(f"🔍 Buscando no Bing Images: {termo_busca}")
        
        url = f"https://www.bing.com/images/search?q={quote_plus(termo_busca)}"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=8)
        
        if response.status_code == 200:
            # Buscar padrão específico do Bing
            padrao = r'"murl":"([^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"'
            urls = re.findall(padrao, response.text)
            
            print(f"📊 Encontradas {len(urls)} URLs no Bing")
            
            for url in urls[:10]:
                url_limpa = url.replace('\\u002f', '/').replace('\\', '')
                
                if (len(url_limpa) > 30 and
                    not any(termo in url_limpa.lower() for termo in ['bing.com', 'logo.', '/logo/'])):
                    
                    print(f"✅ IMAGEM ENCONTRADA: {url_limpa}")
                    return url_limpa
        
        return None
        
    except Exception as e:
        print(f"❌ Erro no Bing: {e}")
        return None

def buscar_imagem_produto_SIMPLES(nome_produto):
    """Versão SUPER SIMPLES - igual busca manual"""
    
    print(f"\n🔍 BUSCANDO IMAGEM PARA: {nome_produto}")
    print("=" * 60)
    
    # Tentar Google primeiro
    imagem = buscar_google_images_simples(nome_produto)
    if imagem:
        return imagem
    
    # Se falhar, tentar Bing
    imagem = buscar_bing_images_simples(nome_produto)
    if imagem:
        return imagem
    
    print("❌ NENHUMA IMAGEM ENCONTRADA")
    return None

# TESTE SIMPLES
if __name__ == "__main__":
    print("🧪 TESTANDO BUSCA SUPER SIMPLES DE IMAGENS")
    print("=" * 70)
    
    produtos = [
        "Jogo de 6 Taças de Vidro Diamond Transparente",
        "Panela de Pressão Elétrica Elgin",
        "Kit 5 Bermudas Shorts Masculino",
        "Câmera IP Sem Fio"
    ]
    
    for produto in produtos:
        imagem = buscar_imagem_produto_SIMPLES(produto)
        if imagem:
            print(f"🖼️ RESULTADO: {imagem}")
        else:
            print("🚫 SEM RESULTADO")
        
        print("\n" + "-" * 60 + "\n")
        time.sleep(2)
    
    print("✅ TESTE FINALIZADO")
