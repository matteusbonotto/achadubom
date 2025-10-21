/**
 * Sistema de Filtros Desktop com Drawer Lateral
 * Gerencia toggle buttons e drawer de categorias no desktop
 */

class FiltrosDesktop {
    constructor() {
        // Elementos do drawer
        this.drawer = document.getElementById('drawer-categorias-desktop');
        this.overlay = document.getElementById('drawer-categorias-overlay-desktop');
        this.btnAbrir = document.getElementById('btn-ver-categorias-desktop');
        this.btnFechar = document.getElementById('btn-fechar-drawer-categorias-desktop');
        this.btnAplicar = document.getElementById('btn-aplicar-categorias-desktop');
        this.btnLimpar = document.getElementById('btn-limpar-categorias-desktop');
        this.listaContainer = document.getElementById('drawer-categorias-lista-desktop');

        // Botões toggle
        this.btnFavoritos = document.getElementById('filtro-favoritos-desktop');
        this.btnCategorias = document.getElementById('filtro-categorias-desktop');

        // Checkboxes originais (para compatibilidade)
        this.checkboxFavoritos = document.getElementById('filtro-favoritos');
        this.checkboxCategorias = document.getElementById('filtro-categorias');

        // Estado dos filtros
        this.filtrosAtivos = {
            favoritos: false,
            categorias: false,
            categoriasEspecificas: []
        };

        // Mapa de categorias disponíveis
        this.categoriasDisponiveis = new Map();

        this.init();
    }

    init() {
        this.bindEvents();
        this.carregarCategorias();

        // Listener para quando produtos forem carregados
        document.addEventListener('produtos-carregados', () => {
            console.log('🖥️ [Desktop] Produtos carregados, atualizando categorias...');
            this.carregarCategorias();
        });
    }

    bindEvents() {
        // Abrir/Fechar drawer
        this.btnAbrir?.addEventListener('click', () => this.abrirDrawer());
        this.btnFechar?.addEventListener('click', () => this.fecharDrawer());
        this.overlay?.addEventListener('click', () => this.fecharDrawer());

        // Aplicar/Limpar
        this.btnAplicar?.addEventListener('click', () => this.aplicarFiltros());
        this.btnLimpar?.addEventListener('click', () => this.limparCategorias());

        // Toggle Favoritos
        this.btnFavoritos?.addEventListener('click', () => {
            this.filtrosAtivos.favoritos = !this.filtrosAtivos.favoritos;
            this.btnFavoritos.classList.toggle('active', this.filtrosAtivos.favoritos);
            
            // Sincronizar com checkbox original
            if (this.checkboxFavoritos) {
                this.checkboxFavoritos.checked = this.filtrosAtivos.favoritos;
                this.checkboxFavoritos.dispatchEvent(new Event('change'));
            }
        });

        // Toggle Categorias
        this.btnCategorias?.addEventListener('click', () => {
            this.filtrosAtivos.categorias = !this.filtrosAtivos.categorias;
            this.btnCategorias.classList.toggle('active', this.filtrosAtivos.categorias);
            
            // Sincronizar com checkbox original
            if (this.checkboxCategorias) {
                this.checkboxCategorias.checked = this.filtrosAtivos.categorias;
                this.checkboxCategorias.dispatchEvent(new Event('change'));
            }
        });

        // ESC para fechar
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
        console.log('🖥️ [Desktop] Drawer aberto');
    }

    fecharDrawer() {
        this.drawer?.classList.remove('active');
        this.overlay?.classList.remove('active');
        document.body.style.overflow = '';
        console.log('🖥️ [Desktop] Drawer fechado');
    }

    carregarCategorias() {
        if (!window.produtosManager || !window.produtosManager.produtos) {
            console.log('🖥️ [Desktop] Aguardando produtos...');
            return;
        }

        this.atualizarCategoriasDisponiveis();
        this.renderizarCategorias();
    }

    atualizarCategoriasDisponiveis() {
        this.categoriasDisponiveis.clear();

        window.produtosManager.produtos.forEach(produto => {
            produto.categorias.forEach(categoria => {
                const categoriaLower = categoria.toLowerCase();
                const count = this.categoriasDisponiveis.get(categoriaLower) || 0;
                this.categoriasDisponiveis.set(categoriaLower, count + 1);
            });
        });

        console.log('🖥️ [Desktop] Categorias disponíveis:', this.categoriasDisponiveis);
    }

    renderizarCategorias() {
        if (!this.listaContainer || this.categoriasDisponiveis.size === 0) {
            if (this.listaContainer) {
                this.listaContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">Nenhuma categoria disponível</p>';
            }
            return;
        }

        const icones = {
            'eletrônicos': 'bi-phone',
            'eletronicos': 'bi-phone',
            'casa': 'bi-house',
            'moda': 'bi-bag',
            'beleza': 'bi-heart',
            'esporte': 'bi-trophy',
            'livros': 'bi-book',
            'brinquedos': 'bi-puzzle',
            'outros': 'bi-three-dots',
            'default': 'bi-tag'
        };

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

        this.listaContainer.innerHTML = html;

        // Eventos de clique
        this.listaContainer.querySelectorAll('.categoria-checkbox-item').forEach(item => {
            item.addEventListener('click', () => this.toggleCategoria(item));
        });

        console.log('🖥️ [Desktop] Categorias renderizadas:', categoriasOrdenadas.length);
    }

    toggleCategoria(item) {
        const categoria = item.dataset.categoria;
        const isActive = item.classList.contains('active');

        if (isActive) {
            item.classList.remove('active');
            this.filtrosAtivos.categoriasEspecificas = 
                this.filtrosAtivos.categoriasEspecificas.filter(c => c !== categoria);
        } else {
            item.classList.add('active');
            if (!this.filtrosAtivos.categoriasEspecificas.includes(categoria)) {
                this.filtrosAtivos.categoriasEspecificas.push(categoria);
            }
        }

        console.log('🖥️ [Desktop] Categorias selecionadas:', this.filtrosAtivos.categoriasEspecificas);
    }

    aplicarFiltros() {
        console.log('🖥️ [Desktop] Aplicando filtros:', this.filtrosAtivos);

        // Atualizar filtroAtual do produtosManager
        if (window.produtosManager) {
            window.produtosManager.filtroAtual.categoriasEspecificas = [...this.filtrosAtivos.categoriasEspecificas];
            window.produtosManager.aplicarFiltros();
        }

        this.fecharDrawer();
    }

    limparCategorias() {
        this.filtrosAtivos.categoriasEspecificas = [];

        // Remover seleção visual
        this.listaContainer?.querySelectorAll('.categoria-checkbox-item').forEach(item => {
            item.classList.remove('active');
        });

        console.log('🖥️ [Desktop] Categorias limpas');
    }

    // Método público para sincronizar estado
    sincronizarEstado(favoritos, categorias) {
        this.filtrosAtivos.favoritos = favoritos;
        this.filtrosAtivos.categorias = categorias;
        
        this.btnFavoritos?.classList.toggle('active', favoritos);
        this.btnCategorias?.classList.toggle('active', categorias);
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Só inicializar em desktop (min-width: 992px)
    if (window.innerWidth > 991) {
        window.filtrosDesktop = new FiltrosDesktop();
        console.log('🖥️ [Desktop] Sistema de filtros desktop inicializado');
    }
});
