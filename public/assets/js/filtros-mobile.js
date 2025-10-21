/**
 * Sistema de Filtros Mobile com Drawer
 * Gerencia o drawer de filtros, badges ativos e sincronização com filtros desktop
 */

class FiltrosMobile {
    constructor() {
        this.drawer = document.getElementById('drawer-filtros');
        this.overlay = document.getElementById('drawer-filtros-overlay');
        this.btnInline = document.getElementById('btn-filtros-inline');
        this.btnFecharDrawer = document.getElementById('btn-fechar-drawer');
        this.btnAplicar = document.getElementById('btn-aplicar-filtros');
        this.btnLimpar = document.getElementById('btn-limpar-filtros');
        this.btnVerTodos = document.getElementById('btn-ver-todos-filtros');
        this.barraAtivos = document.getElementById('filtros-ativos-bar');
        this.containerAtivos = document.getElementById('filtros-ativos-container');
        this.badgeCountInline = document.getElementById('badge-filtros-count-inline');

        // Elementos de filtro do drawer
        this.drawerLoja = document.getElementById('drawer-filtro-loja');
        this.drawerOrdenacao = document.getElementById('drawer-filtro-ordenacao');
        this.btnFavoritos = document.getElementById('drawer-filtro-favoritos');
        this.btnCategorias = document.getElementById('drawer-filtro-categorias');
        this.drawerCategoriasLista = document.getElementById('drawer-categorias-lista');

        // Elementos de filtro desktop (para sincronização)
        this.desktopLoja = document.getElementById('filtro-loja');
        this.desktopOrdenacao = document.getElementById('filtro-ordenacao');
        this.desktopFavoritos = document.getElementById('filtro-favoritos');
        this.desktopCategorias = document.getElementById('filtro-categorias');

        // Estado dos filtros
        this.filtrosAtivos = {
            loja: 'todas',
            ordenacao: 'az',
            favoritos: false,
            categorias: false,
            categoriasEspecificas: [] // Array de categorias específicas selecionadas
        };

        // Mapa de categorias disponíveis com contagem
        this.categoriasDisponiveis = new Map();

        this.init();
    }

    init() {
        this.bindEvents();
        this.sincronizarComDesktop();
        this.popularSelectLojas();
        this.carregarCategoriasLista();
    }

    bindEvents() {
        // Abrir drawer
        this.btnInline?.addEventListener('click', () => this.abrirDrawer());
        this.btnVerTodos?.addEventListener('click', () => this.abrirDrawer());

        // Fechar drawer
        this.btnFecharDrawer?.addEventListener('click', () => this.fecharDrawer());
        this.overlay?.addEventListener('click', () => this.fecharDrawer());

        // Aplicar filtros
        this.btnAplicar?.addEventListener('click', () => this.aplicarFiltros());

        // Limpar filtros
        this.btnLimpar?.addEventListener('click', () => this.limparFiltros());

        // Botões de filtro (Favoritos e Categorias)
        this.btnFavoritos?.addEventListener('click', () => {
            this.filtrosAtivos.favoritos = !this.filtrosAtivos.favoritos;
            this.btnFavoritos.classList.toggle('active', this.filtrosAtivos.favoritos);
        });

        this.btnCategorias?.addEventListener('click', () => {
            this.filtrosAtivos.categorias = !this.filtrosAtivos.categorias;
            this.btnCategorias.classList.toggle('active', this.filtrosAtivos.categorias);
        });

        // Fechar drawer com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.drawer?.classList.contains('active')) {
                this.fecharDrawer();
            }
        });
    }

    abrirDrawer() {
        this.drawer?.classList.add('active');
        this.overlay?.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Carregar filtros atuais no drawer
        this.carregarFiltrosNoDrawer();
    }

    fecharDrawer() {
        this.drawer?.classList.remove('active');
        this.overlay?.classList.remove('active');
        document.body.style.overflow = '';
    }

    carregarFiltrosNoDrawer() {
        if (this.drawerLoja) this.drawerLoja.value = this.filtrosAtivos.loja;
        if (this.drawerOrdenacao) this.drawerOrdenacao.value = this.filtrosAtivos.ordenacao;
        if (this.btnFavoritos) this.btnFavoritos.classList.toggle('active', this.filtrosAtivos.favoritos);
        if (this.btnCategorias) this.btnCategorias.classList.toggle('active', this.filtrosAtivos.categorias);
        
        // Restaurar categorias específicas selecionadas
        if (this.drawerCategoriasLista) {
            this.drawerCategoriasLista.querySelectorAll('.categoria-checkbox-item').forEach(item => {
                const categoria = item.dataset.categoria;
                if (this.filtrosAtivos.categoriasEspecificas.includes(categoria)) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        }
    }

    aplicarFiltros() {
        // Capturar valores do drawer
        this.filtrosAtivos = {
            loja: this.drawerLoja?.value || 'todas',
            ordenacao: this.drawerOrdenacao?.value || 'az',
            favoritos: this.btnFavoritos?.classList.contains('active') || false,
            categorias: this.btnCategorias?.classList.contains('active') || false,
            categoriasEspecificas: [...this.filtrosAtivos.categoriasEspecificas] // Manter as categorias selecionadas
        };

        // Sincronizar com desktop
        this.sincronizarParaDesktop();

        // Atualizar badges de filtros ativos
        this.atualizarBadgesFiltros();

        // Fechar drawer
        this.fecharDrawer();

        // Disparar evento para atualizar produtos
        this.dispararEventoFiltro();
    }

    limparFiltros() {
        // Resetar todos os filtros
        this.filtrosAtivos = {
            loja: 'todas',
            ordenacao: 'az',
            favoritos: false,
            categorias: false,
            categoriasEspecificas: []
        };

        // Remover seleção de todos os itens de categoria
        if (this.drawerCategoriasLista) {
            this.drawerCategoriasLista.querySelectorAll('.categoria-checkbox-item').forEach(item => {
                item.classList.remove('active');
            });
        }

        // Atualizar drawer
        this.carregarFiltrosNoDrawer();

        // Sincronizar com desktop
        this.sincronizarParaDesktop();

        // Limpar badges
        this.atualizarBadgesFiltros();

        // Fechar drawer
        this.fecharDrawer();

        // Disparar evento
        this.dispararEventoFiltro();
    }

    atualizarBadgesFiltros() {
        this.containerAtivos.innerHTML = '';
        let count = 0;

        // Badge de Loja
        if (this.filtrosAtivos.loja !== 'todas') {
            const lojaText = this.drawerLoja?.options[this.drawerLoja.selectedIndex]?.text || this.filtrosAtivos.loja;
            this.adicionarBadge('loja', `🏪 ${lojaText}`, 'loja');
            count++;
        }

        // Badge de Ordenação (só mostrar se não for A-Z padrão)
        if (this.filtrosAtivos.ordenacao !== 'az') {
            const ordenacaoText = this.getTextoOrdenacao(this.filtrosAtivos.ordenacao);
            this.adicionarBadge('ordenacao', `🔄 ${ordenacaoText}`, 'ordenacao');
            count++;
        }

        // Badge de Favoritos
        if (this.filtrosAtivos.favoritos) {
            this.adicionarBadge('favoritos', '❤️ Favoritos', 'favoritos');
            count++;
        }

        // Badge de Categorias (Agrupar)
        if (this.filtrosAtivos.categorias) {
            this.adicionarBadge('categorias', '🏷️ Por Categorias', 'categorias');
            count++;
        }

        // Badges de Categorias Específicas (Navegação Rápida)
        if (this.filtrosAtivos.categoriasEspecificas && this.filtrosAtivos.categoriasEspecificas.length > 0) {
            this.filtrosAtivos.categoriasEspecificas.forEach(categoria => {
                const nomeCategoria = categoria === 'outros' ? 'Outros' :
                    categoria.charAt(0).toUpperCase() + categoria.slice(1);
                this.adicionarBadge(`categoria-${categoria}`, `📂 ${nomeCategoria}`, 'categoria-especifica', categoria);
                count++;
            });
        }

        // Atualizar contador no botão inline
        if (count > 0) {
            this.badgeCountInline.textContent = count;
            this.badgeCountInline.style.display = 'flex';
            this.barraAtivos?.classList.remove('empty');
            
            // Sempre mostrar botão "Ver mais" quando há filtros
            this.btnVerTodos.style.display = 'inline-flex';
        } else {
            this.badgeCountInline.style.display = 'none';
            this.barraAtivos?.classList.add('empty');
            this.btnVerTodos.style.display = 'none';
        }
    }

    adicionarBadge(id, texto, tipo, categoriaValor = null) {
        const badge = document.createElement('div');
        badge.className = 'filtro-badge-ativo';
        badge.dataset.tipo = tipo;
        if (categoriaValor) {
            badge.dataset.categoria = categoriaValor;
        }
        badge.innerHTML = `
            <span>${texto}</span>
            <button class="btn-remover-filtro" aria-label="Remover filtro">
                <i class="bi bi-x"></i>
            </button>
        `;

        badge.querySelector('.btn-remover-filtro').addEventListener('click', (e) => {
            e.stopPropagation();
            this.removerFiltro(tipo, categoriaValor);
        });

        this.containerAtivos.appendChild(badge);
    }

    removerFiltro(tipo, categoriaValor = null) {
        switch (tipo) {
            case 'loja':
                this.filtrosAtivos.loja = 'todas';
                break;
            case 'ordenacao':
                this.filtrosAtivos.ordenacao = 'az';
                break;
            case 'favoritos':
                this.filtrosAtivos.favoritos = false;
                this.btnFavoritos?.classList.remove('active');
                break;
            case 'categorias':
                this.filtrosAtivos.categorias = false;
                this.btnCategorias?.classList.remove('active');
                break;
            case 'categoria-especifica':
                if (categoriaValor) {
                    this.filtrosAtivos.categoriasEspecificas = 
                        this.filtrosAtivos.categoriasEspecificas.filter(c => c !== categoriaValor);
                    
                    // Atualizar item no drawer
                    const item = this.drawerCategoriasLista?.querySelector(`[data-categoria="${categoriaValor}"]`);
                    if (item) {
                        item.classList.remove('active');
                    }
                }
                break;
        }

        // Sincronizar
        this.sincronizarParaDesktop();
        this.atualizarBadgesFiltros();
        this.dispararEventoFiltro();
    }

    getTextoOrdenacao(valor) {
        const textos = {
            'az': 'A-Z',
            'za': 'Z-A',
            'preco_asc': 'Menor Preço',
            'preco_desc': 'Maior Preço'
        };
        return textos[valor] || valor;
    }

    sincronizarComDesktop() {
        // Sincronizar filtros do desktop para mobile
        if (this.desktopLoja) {
            this.filtrosAtivos.loja = this.desktopLoja.value;
        }
        if (this.desktopOrdenacao) {
            this.filtrosAtivos.ordenacao = this.desktopOrdenacao.value;
        }
        if (this.desktopFavoritos) {
            this.filtrosAtivos.favoritos = this.desktopFavoritos.checked;
        }
        if (this.desktopCategorias) {
            this.filtrosAtivos.categorias = this.desktopCategorias.checked;
        }

        this.atualizarBadgesFiltros();
    }

    sincronizarParaDesktop() {
        // Sincronizar filtros mobile para desktop
        if (this.desktopLoja) {
            this.desktopLoja.value = this.filtrosAtivos.loja;
            this.desktopLoja.dispatchEvent(new Event('change'));
        }
        if (this.desktopOrdenacao) {
            this.desktopOrdenacao.value = this.filtrosAtivos.ordenacao;
            this.desktopOrdenacao.dispatchEvent(new Event('change'));
        }
        if (this.desktopFavoritos) {
            this.desktopFavoritos.checked = this.filtrosAtivos.favoritos;
            this.desktopFavoritos.dispatchEvent(new Event('change'));
        }
        if (this.desktopCategorias) {
            this.desktopCategorias.checked = this.filtrosAtivos.categorias;
            this.desktopCategorias.dispatchEvent(new Event('change'));
        }
    }

    popularSelectLojas() {
        // Popular select de lojas no drawer com as mesmas opções do desktop
        if (this.desktopLoja && this.drawerLoja) {
            // Copiar todas as options do desktop para o drawer
            this.drawerLoja.innerHTML = this.desktopLoja.innerHTML;
        }
    }

    carregarCategoriasLista() {
        // Carregar categorias disponíveis da main.js
        if (!this.drawerCategoriasLista) return;

        const carregarCategorias = () => {
            if (window.produtosManager && window.produtosManager.produtos && window.produtosManager.produtos.length > 0) {
                this.atualizarCategoriasDisponiveis();
                this.renderizarCategoriasLista();
            }
        };

        // Tentar carregar imediatamente
        carregarCategorias();

        // Também escutar evento de produtos carregados
        document.addEventListener('produtos-carregados', () => {
            carregarCategorias();
        });

        // Fallback: tentar novamente após 1 segundo
        setTimeout(() => {
            carregarCategorias();
        }, 1000);
    }

    atualizarCategoriasDisponiveis() {
        // Obter todas as categorias únicas dos produtos com contagem
        if (!window.produtosManager || !window.produtosManager.produtos) {
            console.log('⚠️ produtosManager ou produtos não disponíveis');
            return;
        }

        console.log('📊 Atualizando categorias...', window.produtosManager.produtos.length, 'produtos');

        this.categoriasDisponiveis.clear();
        
        window.produtosManager.produtos.forEach(produto => {
            if (produto.categorias && Array.isArray(produto.categorias)) {
                produto.categorias.forEach(cat => {
                    if (cat && cat.toLowerCase() !== 'destaque') {
                        const catLower = cat.toLowerCase();
                        const count = this.categoriasDisponiveis.get(catLower) || 0;
                        this.categoriasDisponiveis.set(catLower, count + 1);
                    }
                });
            }
        });

        console.log('✅ Categorias processadas:', Array.from(this.categoriasDisponiveis.keys()));
    }

    renderizarCategoriasLista() {
        console.log('🔄 Renderizando categorias...', this.categoriasDisponiveis.size, 'categorias encontradas');
        
        if (!this.drawerCategoriasLista || this.categoriasDisponiveis.size === 0) {
            if (this.drawerCategoriasLista) {
                this.drawerCategoriasLista.innerHTML = '<p style="text-align: center; color: #999; padding: 1rem;">Nenhuma categoria disponível</p>';
            }
            return;
        }

        const icones = {
            'eletrônicos': 'bi-phone',
            'casa': 'bi-house',
            'moda': 'bi-bag',
            'beleza': 'bi-heart',
            'esporte': 'bi-trophy',
            'livros': 'bi-book',
            'brinquedos': 'bi-puzzle',
            'outros': 'bi-three-dots',
            'default': 'bi-tag'
        };

        // Ordenar categorias alfabeticamente
        const categoriasOrdenadas = Array.from(this.categoriasDisponiveis.entries())
            .sort((a, b) => a[0].localeCompare(b[0]));

        const html = categoriasOrdenadas.map(([categoria, count]) => {
            const nomeCategoria = categoria === 'outros' ? 'Outros' :
                categoria.charAt(0).toUpperCase() + categoria.slice(1);
            const icone = icones[categoria.toLowerCase()] || icones.default;
            const isActive = this.filtrosAtivos.categoriasEspecificas.includes(categoria);

            return `
                <div class="categoria-checkbox-item ${isActive ? 'active' : ''}" data-categoria="${categoria}">
                    <div class="categoria-checkbox">
                        <i class="bi bi-check-lg"></i>
                    </div>
                    <div class="categoria-checkbox-content">
                        <i class="bi ${icone}"></i>
                        <div class="categoria-checkbox-info">
                            <span class="categoria-checkbox-nome">${nomeCategoria}</span>
                            <span class="categoria-checkbox-count">${count} ${count === 1 ? 'produto' : 'produtos'}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        this.drawerCategoriasLista.innerHTML = html;

        // Adicionar eventos de clique nos itens
        this.drawerCategoriasLista.querySelectorAll('.categoria-checkbox-item').forEach(item => {
            item.addEventListener('click', () => this.toggleCategoriaItem(item));
        });
    }

    toggleCategoriaItem(item) {
        const categoria = item.dataset.categoria;
        const isActive = item.classList.contains('active');

        if (isActive) {
            // Desativar
            item.classList.remove('active');
            this.filtrosAtivos.categoriasEspecificas = 
                this.filtrosAtivos.categoriasEspecificas.filter(c => c !== categoria);
        } else {
            // Ativar
            item.classList.add('active');
            if (!this.filtrosAtivos.categoriasEspecificas.includes(categoria)) {
                this.filtrosAtivos.categoriasEspecificas.push(categoria);
            }
        }
    }

    dispararEventoFiltro() {
        // Disparar evento customizado para que o main.js saiba que os filtros mudaram
        const evento = new CustomEvent('filtros-atualizados', {
            detail: this.filtrosAtivos
        });
        document.dispatchEvent(evento);
    }

    // Método público para obter filtros ativos
    getFiltrosAtivos() {
        return { ...this.filtrosAtivos };
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Só inicializar em mobile (max-width: 991px)
    if (window.innerWidth <= 991) {
        window.filtrosMobile = new FiltrosMobile();
    }

    // Reinicializar se a janela for redimensionada para mobile
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 991 && !window.filtrosMobile) {
            window.filtrosMobile = new FiltrosMobile();
        }
    });
});
