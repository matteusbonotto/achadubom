/**
 * =============================================
 * SISTEMA DE CARREGAMENTO E GESTÃO DE PRODUTOS
 * AchaduBom - Sistema PWA
 * =============================================
 */

class ProdutosManager {
    constructor() {
        this.produtos = [];
        this.produtosFiltrados = [];
        this.produtoDestaque = null;
        this.filtroAtual = {
            busca: '',
            loja: 'todas',
            ordenacao: 'az',
            visualizacao: 'grade',
            favoritos: false
        };
        this.favoritos = this.carregarFavoritos();

        this.init();
    }

    /**
     * Inicialização do sistema
     */
    async init() {
        try {
            this.mostrarLoading();
            await this.carregarProdutos();
            this.configurarEventListeners();
            this.renderizarInterface();
            this.aplicarFiltros();
            this.ocultarLoading();
        } catch (error) {
            console.error('Erro na inicialização:', error);
            this.mostrarErro('Erro ao carregar produtos. Tente novamente.');
        }
    }

    /**
     * Carrega produtos do arquivo JSON
     */
    async carregarProdutos() {
        try {
            const response = await fetch('./assets/data/produtos.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const dados = await response.json();
            this.produtos = dados.filter(produto => produto.ativo === true);
            this.produtosFiltrados = [...this.produtos];

            // Seleciona produto destaque (primeiro com categoria "destaque")
            this.produtoDestaque = this.produtos.find(p =>
                p.categorias.includes('destaque')
            ) || this.produtos[0];

            console.log(`✅ ${this.produtos.length} produtos carregados com sucesso`);

        } catch (error) {
            console.error('❌ Erro ao carregar produtos:', error);
            throw error;
        }
    }

    /**
     * Configura todos os event listeners
     */
    configurarEventListeners() {
        // Busca com debounce - múltiplos campos
        const campos = ['campo-busca', 'campo-busca-mobile'];
        campos.forEach(id => {
            const campo = document.getElementById(id);
            if (campo) {
                let timeoutBusca;
                campo.addEventListener('input', (e) => {
                    clearTimeout(timeoutBusca);
                    timeoutBusca = setTimeout(() => {
                        this.filtroAtual.busca = e.target.value.toLowerCase();
                        this.aplicarFiltros();

                        // Sincronizar com outros campos de busca
                        campos.forEach(otherId => {
                            const otherField = document.getElementById(otherId);
                            if (otherField && otherField !== e.target) {
                                otherField.value = e.target.value;
                            }
                        });
                    }, 300);
                });
            }
        });

        // Filtros - múltiplos selects
        const filtrosLoja = ['filtro-loja', 'filtro-loja-mobile'];
        filtrosLoja.forEach(id => {
            const filtro = document.getElementById(id);
            if (filtro) {
                filtro.addEventListener('change', (e) => {
                    this.filtroAtual.loja = e.target.value;
                    this.aplicarFiltros();

                    // Sincronizar com outros selects
                    filtrosLoja.forEach(otherId => {
                        const otherSelect = document.getElementById(otherId);
                        if (otherSelect && otherSelect !== e.target) {
                            otherSelect.value = e.target.value;
                        }
                    });
                });
            }
        });

        const filtrosOrdenacao = ['filtro-ordenacao', 'filtro-ordenacao-mobile'];
        filtrosOrdenacao.forEach(id => {
            const filtro = document.getElementById(id);
            if (filtro) {
                filtro.addEventListener('change', (e) => {
                    this.filtroAtual.ordenacao = e.target.value;
                    this.aplicarFiltros();

                    // Sincronizar com outros selects
                    filtrosOrdenacao.forEach(otherId => {
                        const otherSelect = document.getElementById(otherId);
                        if (otherSelect && otherSelect !== e.target) {
                            otherSelect.value = e.target.value;
                        }
                    });
                });
            }
        });

        // Toggle de visualização
        document.querySelectorAll('.view-toggle button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tipo = e.target.dataset.view;
                this.filtroAtual.visualizacao = tipo;
                this.atualizarVisualizacao();
            });
        });

        // Filtro de favoritos - múltiplos checkboxes
        const filtrosFavoritos = ['filtro-favoritos', 'filtro-favoritos-mobile'];
        filtrosFavoritos.forEach(id => {
            const filtro = document.getElementById(id);
            if (filtro) {
                filtro.addEventListener('change', (e) => {
                    this.filtroAtual.favoritos = e.target.checked;
                    this.aplicarFiltros();

                    // Sincronizar com outros checkboxes
                    filtrosFavoritos.forEach(otherId => {
                        const otherCheck = document.getElementById(otherId);
                        if (otherCheck && otherCheck !== e.target) {
                            otherCheck.checked = e.target.checked;
                        }
                    });
                });
            }
        });

        // Menu mobile
        this.configurarMenuMobile();
    }

    /**
     * Configura o menu mobile
     */
    configurarMenuMobile() {
        const btnMenu = document.getElementById('btn-menu-mobile');
        const menu = document.getElementById('menu-mobile');
        const overlay = document.getElementById('menu-overlay');
        const btnFechar = document.getElementById('btn-fechar-menu');

        if (btnMenu && menu && overlay && btnFechar) {
            const abrirMenu = () => {
                console.log('[MOBILE] Menu aberto');
                menu.classList.add('active');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            };

            const fecharMenu = () => {
                console.log('[MOBILE] Menu fechado');
                menu.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            };

            btnMenu.addEventListener('click', abrirMenu);
            btnFechar.addEventListener('click', fecharMenu);
            overlay.addEventListener('click', fecharMenu);

            // Fechar menu ao clicar em link
            menu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', (e) => {
                    console.log('[MOBILE] Link menu clicado:', link.href);
                    fecharMenu();
                });
            });
        }
    }

    /**
     * Renderiza a interface inicial
     */
    renderizarInterface() {
        this.renderizarHero();
        this.renderizarFiltros();
        this.renderizarProdutos();
    }

    /**
     * Renderiza o banner hero
     */
    renderizarHero() {
        if (!this.produtoDestaque) return;

        const heroContent = document.querySelector('.hero-produto-content');
        if (heroContent) {
            heroContent.innerHTML = `
        <img src="${this.produtoDestaque.imagem[0]}" alt="${this.produtoDestaque.titulo}">
        <h3>${this.produtoDestaque.titulo}</h3>
        <p class="preco">R$ ${this.produtoDestaque.preco.toFixed(2).replace('.', ',')}</p>
        <a href="${this.produtoDestaque.url}" target="_blank" class="btn-custom btn-urgente">
          <i class="bi bi-star-fill"></i> Ver Oferta
        </a>
      `;
        }
    }

    /**
     * Renderiza as opções de filtros
     */
    renderizarFiltros() {
        // Preencher select de lojas - múltiplos selects
        const seletoresLoja = ['filtro-loja', 'filtro-loja-mobile'];
        seletoresLoja.forEach(id => {
            const filtroLoja = document.getElementById(id);
            if (filtroLoja) {
                const lojas = [...new Set(this.produtos.map(p => p.loja))];
                const labelTodas = id.includes('mobile') ? 'Todas' : 'Todas as Lojas';
                filtroLoja.innerHTML = `<option value="todas">${labelTodas}</option>`;
                lojas.forEach(loja => {
                    filtroLoja.innerHTML += `<option value="${loja}">${loja}</option>`;
                });
            }
        });
    }

    /**
     * Aplica todos os filtros ativos
     */
    aplicarFiltros() {
        let produtosFiltrados = [...this.produtos];

        // Filtro por busca
        if (this.filtroAtual.busca) {
            produtosFiltrados = produtosFiltrados.filter(produto =>
                produto.titulo.toLowerCase().includes(this.filtroAtual.busca) ||
                produto.descricao.toLowerCase().includes(this.filtroAtual.busca) ||
                produto.codigo.toLowerCase().includes(this.filtroAtual.busca) ||
                produto.categorias.some(cat => cat.toLowerCase().includes(this.filtroAtual.busca))
            );
        }

        // Filtro por loja
        if (this.filtroAtual.loja !== 'todas') {
            produtosFiltrados = produtosFiltrados.filter(produto =>
                produto.loja === this.filtroAtual.loja
            );
        }

        // Filtro por favoritos
        if (this.filtroAtual.favoritos) {
            produtosFiltrados = produtosFiltrados.filter(produto =>
                this.favoritos.includes(produto.codigo)
            );
        }

        // Ordenação
        this.ordenarProdutos(produtosFiltrados);

        this.produtosFiltrados = produtosFiltrados;
        this.renderizarProdutos();
    }

    /**
     * Ordena produtos conforme critério selecionado
     */
    ordenarProdutos(produtos) {
        switch (this.filtroAtual.ordenacao) {
            case 'preco_asc':
                produtos.sort((a, b) => a.preco - b.preco);
                break;
            case 'preco_desc':
                produtos.sort((a, b) => b.preco - a.preco);
                break;
            case 'az':
                produtos.sort((a, b) => a.titulo.localeCompare(b.titulo));
                break;
            case 'za':
                produtos.sort((a, b) => b.titulo.localeCompare(a.titulo));
                break;
        }
    }

    /**
     * Renderiza a lista de produtos
     */
    renderizarProdutos() {
        const containers = ['produtos-container', 'produtos-container-mobile'];

        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (!container) return;

            if (this.produtosFiltrados.length === 0) {
                container.innerHTML = this.templateNenhumProduto();
                return;
            }

            const isLista = this.filtroAtual.visualizacao === 'lista';
            const isMobile = containerId.includes('mobile');

            if (isMobile) {
                container.className = isLista ? 'produtos-lista-mobile' : 'produtos-grid-mobile';
                container.innerHTML = this.produtosFiltrados
                    .map(produto => this.templateProdutoMobile(produto, isLista))
                    .join('');
            } else {
                container.className = isLista ? 'produtos-lista' : 'produtos-grid';
                container.innerHTML = this.produtosFiltrados
                    .map(produto => this.templateProduto(produto, isLista))
                    .join('');
            }
        });

        // Configurar event listeners dos produtos
        this.configurarEventListenersProdutos();
    }

    /**
     * Template para card de produto desktop
     */
    templateProduto(produto, isLista = false) {
        const isFavorito = this.favoritos.includes(produto.codigo);
        const logoLoja = this.getLogoLoja(produto.loja);

        if (isLista) {
            return `
              <div class="card-produto-lista" data-codigo="${produto.codigo}">
                <div class="produto-imagem">
                  <img src="${produto.imagem[0]}" alt="${produto.titulo}" loading="lazy">
                  <button class="btn-favorito ${isFavorito ? 'favorito' : ''}" 
                          data-codigo="${produto.codigo}" 
                          title="${isFavorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
                    <i class="bi ${isFavorito ? 'bi-heart-fill' : 'bi-heart'}"></i>
                  </button>
                </div>
                <div class="produto-info">
                  <h3>${produto.titulo}</h3>
                  <div class="produto-badges">
                    <div class="loja-badge-lista">
                      <img src="${logoLoja}" alt="${produto.loja}" />
                    </div>
                    <div class="categoria-badge-lista"><i class="bi bi-tag-fill"></i> ${produto.categorias[0]}</div>
                  </div>
                  <span class="produto-codigo">#${produto.codigo}</span>
                </div>
                <a href="${produto.url}" target="_blank" class="btn-quero-lista" rel="noopener">
                  <i class="bi bi-link-45deg"></i> QUERO!
                </a>
              </div>
            `;
        }

        return `
          <div class="card-produto floating" data-codigo="${produto.codigo}">
            <div class="card-header">
              <div class="loja-badge">
                <img src="${logoLoja}" alt="${produto.loja}" />
              </div>
              <div class="categoria-badge">
              <i class="bi bi-tag-fill"></i>
                ${produto.categorias[0]}
              </div>
            </div>
            
            <div class="card-imagem">
              <img src="${produto.imagem[0]}" alt="${produto.titulo}" loading="lazy">
              
              <button class="btn-favorito ${isFavorito ? 'favorito' : ''}" 
                      data-codigo="${produto.codigo}" 
                      title="${isFavorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
                <i class="bi ${isFavorito ? 'bi-heart-fill' : 'bi-heart'}"></i>
              </button>
            </div>
            
            <div class="card-body">
              <h3>${produto.titulo}</h3>
              <p class="card-descricao truncate" data-codigo="${produto.codigo}">
                ${produto.descricao}
              </p>
              <button class="btn-expandir" data-codigo="${produto.codigo}">
                <i class="bi bi-chevron-down"></i> Ver mais
              </button>
            </div>
            
            <div class="card-footer">
              <span class="produto-codigo">#${produto.codigo}</span>
              <a href="${produto.url}" target="_blank" class="btn-quero" rel="noopener">
                <i class="bi bi-link-45deg"></i> QUERO!</i>
              </a>
            </div>
          </div>
        `;
    }

    /**
     * Template para card de produto mobile
     */
    templateProdutoMobile(produto, isLista = false) {
        const isFavorito = this.favoritos.includes(produto.codigo);
        const logoLoja = this.getLogoLoja(produto.loja);

        if (isLista) {
            return `
              <div class="card-produto-mobile-lista" data-codigo="${produto.codigo}">
                <div class="produto-imagem-mobile">
                  <img src="${produto.imagem[0]}" alt="${produto.titulo}" loading="lazy">
                  <button class="btn-favorito-mobile ${isFavorito ? 'favorito' : ''}" 
                          data-codigo="${produto.codigo}" 
                          title="${isFavorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
                    <i class="bi ${isFavorito ? 'bi-heart-fill' : 'bi-heart'}"></i>
                  </button>
                </div>
                <div class="produto-info-mobile">
                  <h3>${produto.titulo}</h3>
                  <div class="produto-badges-mobile">
                    <div class="loja-badge-mobile-lista">
                      <img src="${logoLoja}" alt="${produto.loja}" />
                    </div>
                    <div class="categoria-badge-mobile-lista"><i class="bi bi-tag-fill"></i>${produto.categorias[0]}</div>
                  </div>
                  <span class="produto-codigo-mobile">#${produto.codigo}</span>
                </div>
                <a href="${produto.url}" target="_blank" class="btn-quero-mobile-lista" rel="noopener">
                  QUERO!
                </a>
              </div>
            `;
        }

        return `
          <div class="card-produto-mobile floating" data-codigo="${produto.codigo}">
            <div class="card-header-mobile">
              <div class="loja-badge-mobile">
                <img src="${logoLoja}" alt="${produto.loja}" />
              </div>
              <div class="categoria-badge-mobile">
                <i class="bi bi-tag-fill"></i>${produto.categorias[0]}
              </div>
            </div>
            
            <div class="card-imagem-mobile">
              <img src="${produto.imagem[0]}" alt="${produto.titulo}" loading="lazy">
              
              <button class="btn-favorito-mobile ${isFavorito ? 'favorito' : ''}" 
                      data-codigo="${produto.codigo}" 
                      title="${isFavorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
                <i class="bi ${isFavorito ? 'bi-heart-fill' : 'bi-heart'}"></i>
              </button>
            </div>
            
            <div class="card-body-mobile">
              <h3>${produto.titulo}</h3>
              <div class="card-footer-mobile">
                <span class="produto-codigo-mobile">#${produto.codigo}</span>
                <a href="${produto.url}" target="_blank" class="btn-quero-mobile" rel="noopener">
                  <i class="bi bi-link-45deg"></i> QUERO!
                </a>
              </div>
            </div>
          </div>
        `;
    }

    /**
     * Função para obter logo da loja
     */
    getLogoLoja(nomeLoja) {
        const logos = {
            'Shopee': './assets/images/shopee.png',
            'Mercado Livre': './assets/images/ml.png',
            'Amazon': './assets/images/amazon.jpg',
            'AliExpress': './assets/images/aliexpress.png',
            'TechStore': 'https://via.placeholder.com/40x40/4CAF50/FFFFFF?text=T',
            'PowerShop': 'https://via.placeholder.com/40x40/2196F3/FFFFFF?text=P',
            'AudioPro': 'https://via.placeholder.com/40x40/FF9800/FFFFFF?text=A',
            'GameStore': 'https://via.placeholder.com/40x40/9C27B0/FFFFFF?text=G'
        };

        return logos[nomeLoja] || `https://via.placeholder.com/40x40/666666/FFFFFF?text=${nomeLoja.charAt(0)}`;
    }

    /**
     * Template para quando não há produtos
     */
    templateNenhumProduto() {
        return `
      <div class="no-produtos">
        <i class="bi bi-search"></i>
        <h3>Nenhum produto encontrado</h3>
        <p>Tente ajustar os filtros ou buscar por outros termos.</p>
      </div>
    `;
    }

    /**
     * Configura event listeners específicos dos produtos
     */
    configurarEventListenersProdutos() {
        // Favoritos
        document.querySelectorAll('.btn-favorito, .btn-favorito-mobile').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const codigo = e.currentTarget.dataset.codigo;
                console.log('[MOBILE] Botão favorito clicado:', codigo);
                this.toggleFavorito(codigo);
            });
        });

        // Expandir descrição
        document.querySelectorAll('.btn-expandir').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const codigo = e.currentTarget.dataset.codigo;
                this.toggleDescricao(codigo);
            });
        });

        // Carrossel de imagens
        document.querySelectorAll('.btn-anterior, .btn-proximo').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const codigo = e.currentTarget.dataset.codigo;
                const isProximo = e.currentTarget.classList.contains('btn-proximo');
                this.navegarCarrossel(codigo, isProximo);
            });
        });
    }

    /**
     * Toggle favorito
     */
    toggleFavorito(codigo) {
        const index = this.favoritos.indexOf(codigo);

        // Buscar todos os botões de favorito para esse produto (desktop e mobile)
        const btnsDesktop = document.querySelectorAll(`[data-codigo="${codigo}"].btn-favorito`);
        const btnsMobile = document.querySelectorAll(`[data-codigo="${codigo}"].btn-favorito-mobile`);
        const todosBotoes = [...btnsDesktop, ...btnsMobile];

        if (index === -1) {
            // Adicionar aos favoritos
            this.favoritos.push(codigo);

            todosBotoes.forEach(btn => {
                const icon = btn.querySelector('i');
                btn.classList.add('favorito');
                icon.className = 'bi bi-heart-fill';
                btn.title = 'Remover dos favoritos';

                // Animação de pulso
                btn.classList.add('pulsing');
                setTimeout(() => btn.classList.remove('pulsing'), 600);
            });

        } else {
            // Remover dos favoritos
            this.favoritos.splice(index, 1);

            todosBotoes.forEach(btn => {
                const icon = btn.querySelector('i');
                btn.classList.remove('favorito');
                icon.className = 'bi bi-heart';
                btn.title = 'Adicionar aos favoritos';
            });
        }

        this.salvarFavoritos();

        // Se estiver filtrando por favoritos, re-aplicar filtros
        if (this.filtroAtual.favoritos) {
            this.aplicarFiltros();
        }
    }

    /**
     * Toggle expansão da descrição
     */
    toggleDescricao(codigo) {
        const descricao = document.querySelector(`[data-codigo="${codigo}"].card-descricao`);
        const btn = document.querySelector(`[data-codigo="${codigo}"].btn-expandir`);
        const icon = btn.querySelector('i');

        if (descricao.classList.contains('truncate')) {
            descricao.classList.remove('truncate');
            icon.className = 'bi bi-chevron-up';
            btn.innerHTML = '<i class="bi bi-chevron-up"></i> Ver menos';
        } else {
            descricao.classList.add('truncate');
            icon.className = 'bi bi-chevron-down';
            btn.innerHTML = '<i class="bi bi-chevron-down"></i> Ver mais';
        }
    }

    /**
     * Navegar no carrossel de imagens
     */
    navegarCarrossel(codigo, isProximo) {
        const produto = this.produtos.find(p => p.codigo === codigo);
        if (!produto || produto.imagem.length <= 1) return;

        const img = document.querySelector(`[data-codigo="${codigo}"] .card-imagem img`);
        const currentSrc = img.src;
        const currentIndex = produto.imagem.findIndex(src => currentSrc.includes(src.split('/').pop()));

        let newIndex;
        if (isProximo) {
            newIndex = (currentIndex + 1) % produto.imagem.length;
        } else {
            newIndex = currentIndex === 0 ? produto.imagem.length - 1 : currentIndex - 1;
        }

        // Animação de transição
        img.style.opacity = '0.5';
        setTimeout(() => {
            img.src = produto.imagem[newIndex];
            img.style.opacity = '1';
        }, 150);
    }

    /**
     * Atualiza a visualização (grade/lista)
     */
    atualizarVisualizacao() {
        // Atualizar botões ativos
        document.querySelectorAll('.view-toggle button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === this.filtroAtual.visualizacao) {
                btn.classList.add('active');
            }
        });

        this.renderizarProdutos();
    }

    /**
     * Gerenciamento de favoritos no localStorage
     */
    carregarFavoritos() {
        try {
            return JSON.parse(localStorage.getItem('achadubom_favoritos')) || [];
        } catch {
            return [];
        }
    }

    salvarFavoritos() {
        try {
            localStorage.setItem('achadubom_favoritos', JSON.stringify(this.favoritos));
        } catch (error) {
            console.error('Erro ao salvar favoritos:', error);
        }
    }

    /**
     * Estados de loading e erro
     */
    mostrarLoading() {
        const container = document.getElementById('produtos-container');
        if (container) {
            container.innerHTML = this.templateLoading();
        }
    }

    ocultarLoading() {
        // Loading é removido quando produtos são renderizados
    }

    templateLoading() {
        return Array.from({ length: 6 }, () => `
      <div class="skeleton-card">
        <div class="skeleton-image"></div>
        <div class="skeleton-content">
          <div class="skeleton-line"></div>
          <div class="skeleton-line medium"></div>
          <div class="skeleton-line short"></div>
        </div>
      </div>
    `).join('');
    }

    mostrarErro(mensagem) {
        const container = document.getElementById('produtos-container');
        if (container) {
            container.innerHTML = `
        <div class="no-produtos">
          <i class="bi bi-exclamation-triangle"></i>
          <h3>Ops! Algo deu errado</h3>
          <p>${mensagem}</p>
          <button class="btn-custom btn-confianca" onclick="location.reload()">
            <i class="bi bi-arrow-clockwise"></i> Tentar novamente
          </button>
        </div>
      `;
        }
    }

    /**
     * Métodos públicos para acesso externo
     */
    getProdutos() {
        return this.produtos;
    }

    getFavoritos() {
        return this.favoritos;
    }

    buscarProduto(codigo) {
        return this.produtos.find(p => p.codigo === codigo);
    }
}

/**
 * =============================================
 * INICIALIZAÇÃO AUTOMÁTICA
 * =============================================
 */

// Aguarda o DOM estar pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Iniciando AchaduBom...');

    // Instancia o gerenciador global
    window.produtosManager = new ProdutosManager();
});

// Registro do Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('✅ Service Worker registrado:', registration.scope);
            })
            .catch(error => {
                console.log('❌ Falha no registro do Service Worker:', error);
            });
    });
}

/**
 * =============================================
 * UTILITÁRIOS GLOBAIS
 * =============================================
 */

// Função para formatar preço
window.formatarPreco = (preco) => {
    return `R$ ${preco.toFixed(2).replace('.', ',')}`;
};

// Função para debounce
window.debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Função para scroll suave
window.scrollSuave = (elemento) => {
    document.querySelector(elemento)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
};

console.log('📦 Sistema de produtos carregado com sucesso!');

/**
 * =============================================
 * SISTEMA DE ATUALIZAÇÃO DE DADOS E CACHE
 * =============================================
 */

class DataRefreshManager {
    constructor() {
        this.refreshButton = null;
        this.autoRefreshInterval = null;
        this.isRefreshing = false;
        this.lastRefreshTime = localStorage.getItem('lastRefreshTime') || Date.now();

        this.init();
    }

    init() {
        this.setupRefreshButton();
        this.setupAutoRefresh();
        this.updateLastRefreshDisplay();
    }

    setupRefreshButton() {
        // Aguardar o botão ser criado
        setTimeout(() => {
            this.refreshButton = document.getElementById('refresh-data-button');
            if (this.refreshButton) {
                this.refreshButton.addEventListener('click', () => this.manualRefresh());

                // Adicionar tooltip com horário da última atualização
                this.updateTooltip();
            }
        }, 100);
    }

    setupAutoRefresh() {
        const config = window.AchaduBomConfig;
        if (!config || !config.site) return;

        const intervalMinutes = config.site.autoRefreshInterval || 10;
        const intervalMs = intervalMinutes * 60 * 1000; // Converter para millisegundos

        // Limpar intervalo anterior se existir
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }

        // Configurar novo intervalo
        this.autoRefreshInterval = setInterval(() => {
            this.autoRefresh();
        }, intervalMs);

        if (config.debug && config.debug.showConsoleMessages) {
            console.log(`🔄 Auto-refresh configurado para ${intervalMinutes} minutos`);
        }
    }

    async manualRefresh() {
        if (this.isRefreshing) return;

        this.isRefreshing = true;
        this.showRefreshingState();

        try {
            await this.clearAllCaches();
            await this.reloadData();
            this.showSuccessMessage();

            // Atualizar timestamp
            this.lastRefreshTime = Date.now();
            localStorage.setItem('lastRefreshTime', this.lastRefreshTime);
            this.updateTooltip();

            // Recarregar a página se habilitado na configuração
            const config = window.AchaduBomConfig;
            const shouldAutoReload = config?.site?.autoReloadAfterCacheClear !== false;

            if (shouldAutoReload) {
                setTimeout(() => {
                    window.location.reload(true);
                }, 1500);
            }

        } catch (error) {
            console.error('Erro na atualização manual:', error);
            this.showErrorMessage();
        } finally {
            this.isRefreshing = false;
            this.hideRefreshingState();
        }
    }

    async autoRefresh() {
        const config = window.AchaduBomConfig;

        if (config && config.debug && config.debug.showConsoleMessages) {
            console.log('🔄 Executando limpeza automática de cache...');
        }

        try {
            await this.clearAllCaches();

            // Atualizar timestamp
            this.lastRefreshTime = Date.now();
            localStorage.setItem('lastRefreshTime', this.lastRefreshTime);
            this.updateTooltip();

            if (config && config.debug && config.debug.showConsoleMessages) {
                console.log('✅ Cache limpo automaticamente');
            }
        } catch (error) {
            console.error('Erro na limpeza automática:', error);
        }
    }

    async clearAllCaches() {
        // Limpar cache do navegador
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
        }

        // Limpar localStorage relacionado aos produtos
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('produtos') || key.includes('cache') || key.includes('data'))) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));

        // Limpar sessionStorage
        sessionStorage.clear();
    }

    async reloadData() {
        // Forçar reload dos produtos sem cache
        const timestamp = Date.now();
        const response = await fetch(`./assets/data/produtos.json?t=${timestamp}`, {
            cache: 'no-cache',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar novos dados');
        }

        // Reinicializar o sistema de produtos
        if (window.produtosManager) {
            await window.produtosManager.carregarProdutos();
            window.produtosManager.aplicarFiltros();
        }
    }

    showRefreshingState() {
        if (this.refreshButton) {
            this.refreshButton.innerHTML = '<i class="bi bi-arrow-clockwise spin"></i>';
            this.refreshButton.style.pointerEvents = 'none';
            this.refreshButton.style.opacity = '0.5';
            this.refreshButton.style.color = '#999';
        }

        // Adicionar CSS para animação de rotação se não existir
        if (!document.getElementById('refresh-spinner-css')) {
            const style = document.createElement('style');
            style.id = 'refresh-spinner-css';
            style.textContent = `
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    hideRefreshingState() {
        if (this.refreshButton) {
            this.refreshButton.innerHTML = '<i class="bi bi-arrow-clockwise"></i>';
            this.refreshButton.style.pointerEvents = '';
            this.refreshButton.style.opacity = '0.7';
            this.refreshButton.style.color = '#666';
        }
    }

    showSuccessMessage() {
        // Verificar se vai fazer reload automático
        const config = window.AchaduBomConfig;
        const shouldAutoReload = config?.site?.autoReloadAfterCacheClear !== false;

        const message = shouldAutoReload
            ? '✅ Cache limpo! Recarregando página...'
            : '✅ Cache limpo com sucesso!';

        this.showToast(message, 'success');
    }

    showErrorMessage() {
        this.showToast('❌ Erro ao atualizar dados. Tente novamente.', 'error');
    }

    showToast(message, type = 'info') {
        // Remover toast anterior se existir
        const existingToast = document.getElementById('refresh-toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.id = 'refresh-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 10000;
            padding: 8px 16px;
            border-radius: 6px;
            color: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            font-weight: 500;
            font-size: 13px;
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            box-shadow: 0 2px 12px rgba(0,0,0,0.1);
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            backdrop-filter: blur(10px);
            max-width: 250px;
        `;

        document.body.appendChild(toast);

        // Animar entrada
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Remover após 2.5 segundos (mais discreto)
        setTimeout(() => {
            toast.style.transform = 'translateX(-100%)';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 2500);
    }

    updateTooltip() {
        if (this.refreshButton) {
            const lastUpdate = new Date(parseInt(this.lastRefreshTime));
            const timeString = lastUpdate.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            this.refreshButton.title = `Atualizar dados\nÚltima atualização: ${timeString}`;
        }
    }

    updateLastRefreshDisplay() {
        // Pode ser usado para mostrar em algum lugar da interface
        const config = window.AchaduBomConfig;
        if (config && config.debug && config.debug.showConsoleMessages) {
            const lastUpdate = new Date(parseInt(this.lastRefreshTime));
            console.log('🕒 Última atualização:', lastUpdate.toLocaleString('pt-BR'));
        }
    }
}

// Inicializar o sistema de atualização quando a página carregar
window.addEventListener('DOMContentLoaded', () => {
    window.dataRefreshManager = new DataRefreshManager();
});
