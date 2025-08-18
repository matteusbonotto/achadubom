/**
 * =============================================
 * PAINEL ADMINISTRATIVO - CRUD DE PRODUTOS
 * AchaduBom - Sistema PWA
 * =============================================
 */

class AdminManager {
    constructor() {
        this.produtos = [];
        this.produtoEditando = null;
        this.modoEdicao = false;

        this.init();
    }

    /**
     * Atualiza botões e título do formulário
     */
    atualizarBotoesFormulario() {
        const btnSalvar = document.getElementById('btn-salvar');
        const btnExcluir = document.getElementById('btn-excluir');
        const modalTitulo = document.getElementById('modal-titulo');

        if (this.modoEdicao) {
            if (btnSalvar) {
                btnSalvar.innerHTML = '<i class="bi bi-check-lg"></i> Atualizar Produto';
            }
            if (btnExcluir) {
                btnExcluir.style.display = 'inline-flex';
            }
            if (modalTitulo) {
                modalTitulo.innerHTML = '<i class="bi bi-pencil"></i> Editar Produto';
            }
        } else {
            if (btnSalvar) {
                btnSalvar.innerHTML = '<i class="bi bi-plus-lg"></i> Adicionar Produto';
            }
            if (btnExcluir) {
                btnExcluir.style.display = 'none';
            }
            if (modalTitulo) {
                modalTitulo.innerHTML = '<i class="bi bi-plus-lg"></i> Novo Produto';
            }
        }
    }

    /**
     * Inicialização do painel admin
     */
    async init() {
        try {
            await this.carregarProdutos();
            this.configurarEventListeners();
            this.renderizarLista();
            this.configurarFormulario();
        } catch (error) {
            console.error('Erro na inicialização do admin:', error);
            this.mostrarNotificacao('Erro ao carregar dados', 'erro');
        }
    }

    /**
     * Carrega produtos do JSON
     */
    async carregarProdutos() {
        try {
            const response = await fetch('./assets/data/produtos.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const dados = await response.json();
            this.produtos = dados;

            console.log(`✅ ${this.produtos.length} produtos carregados no admin`);

        } catch (error) {
            console.error('❌ Erro ao carregar produtos:', error);
            throw error;
        }
    }

    /**
     * Configura todos os event listeners
     */
    configurarEventListeners() {
        // Formulário
        const form = document.getElementById('form-produto');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.salvarProduto();
            });
        }

        // Botões de ação
        const btnNovo = document.getElementById('btn-novo-produto');
        if (btnNovo) {
            btnNovo.addEventListener('click', () => this.novoProduto());
        }

        const btnCancelar = document.getElementById('btn-cancelar');
        if (btnCancelar) {
            btnCancelar.addEventListener('click', () => this.cancelarEdicao());
        }

        const btnExcluir = document.getElementById('btn-excluir');
        if (btnExcluir) {
            btnExcluir.addEventListener('click', () => this.excluirProduto());
        }

        // Busca na lista
        const campoBusca = document.getElementById('busca-admin');
        if (campoBusca) {
            campoBusca.addEventListener('input', (e) => {
                this.filtrarLista(e.target.value);
            });
        }

        // Preview de imagens
        const campoImagens = document.getElementById('imagem');
        if (campoImagens) {
            campoImagens.addEventListener('input', () => {
                this.atualizarPreviewImagens();
            });
        }
    }

    /**
     * Configura o formulário
     */
    configurarFormulario() {
        // Auto-gerar código
        const btnGerarCodigo = document.getElementById('btn-gerar-codigo');
        if (btnGerarCodigo) {
            btnGerarCodigo.addEventListener('click', () => {
                this.gerarCodigo();
            });
        }

        // Pré-definir opções de loja
        const selectLoja = document.getElementById('loja');
        if (selectLoja) {
            const lojas = ['Shopee', 'Mercado Livre', 'Amazon', 'AliExpress', 'Casas Bahia', 'Magazine Luiza'];
            selectLoja.innerHTML = '<option value="">Selecione uma loja</option>';
            lojas.forEach(loja => {
                selectLoja.innerHTML += `<option value="${loja}">${loja}</option>`;
            });
        }

        // Contador de caracteres na descrição
        const campoDescricao = document.getElementById('descricao');
        if (campoDescricao) {
            campoDescricao.addEventListener('input', (e) => {
                this.atualizarContadorCaracteres(e.target);
            });
        }
    }

    /**
     * Renderiza a lista de produtos
     */
    renderizarLista(produtosFiltrados = null) {
        const lista = document.getElementById('lista-produtos');
        if (!lista) return;

        const produtos = produtosFiltrados || this.produtos;

        if (produtos.length === 0) {
            lista.innerHTML = `
        <div class="lista-vazia">
          <i class="bi bi-inbox"></i>
          <h3>Nenhum produto encontrado</h3>
          <p>Adicione produtos usando o formulário acima.</p>
        </div>
      `;
            return;
        }

        lista.innerHTML = produtos.map(produto => this.templateItemLista(produto)).join('');

        // Configurar event listeners dos itens
        this.configurarEventListenersLista();
    }

    /**
     * Template para item da lista
     */
    templateItemLista(produto) {
        const statusClass = produto.ativo ? 'ativo' : 'inativo';
        const statusTexto = produto.ativo ? 'Ativo' : 'Inativo';
        const favoritoIcon = produto.favorito ? 'bi-heart-fill' : 'bi-heart';
        const logoLoja = this.getLogoLoja(produto.loja);

        return `
      <div class="item-produto ${statusClass}" data-codigo="${produto.codigo}">
        <div class="item-imagem">
          <img src="${produto.imagem[0]}" alt="${produto.titulo}" loading="lazy">
          <div class="item-status">
            <span class="badge ${statusClass}">${statusTexto}</span>
          </div>
        </div>
        
        <div class="item-info">
          <div class="item-header">
            <h3>${produto.titulo}</h3>
            <div class="item-acoes">
              <button class="btn-acao btn-editar" data-codigo="${produto.codigo}" title="Editar">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn-acao btn-duplicar" data-codigo="${produto.codigo}" title="Duplicar">
                <i class="bi bi-copy"></i>
              </button>
              <button class="btn-acao btn-deletar" data-codigo="${produto.codigo}" title="Excluir">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
          
          <div class="item-detalhes">
            <span class="codigo">#${produto.codigo}</span>
            <span class="loja">
              <img src="${logoLoja}" alt="${produto.loja}" class="logo-loja-admin"> ${produto.loja}
            </span>
            <span class="preco">R$ ${produto.preco.toFixed(2).replace('.', ',')}</span>
            <span class="favorito">
              <i class="bi ${favoritoIcon}"></i>
            </span>
          </div>
          
          <div class="item-categorias">
            ${produto.categorias.map(cat => `<span class="categoria-tag">${cat}</span>`).join('')}
          </div>
          
          <p class="item-descricao">${produto.descricao.substring(0, 150)}${produto.descricao.length > 150 ? '...' : ''}</p>
        </div>
      </div>
    `;
    }

    /**
     * Configura event listeners da lista
     */
    configurarEventListenersLista() {
        // Editar
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const codigo = e.currentTarget.dataset.codigo;
                this.editarProduto(codigo);
            });
        });

        // Duplicar
        document.querySelectorAll('.btn-duplicar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const codigo = e.currentTarget.dataset.codigo;
                this.duplicarProduto(codigo);
            });
        });

        // Deletar
        document.querySelectorAll('.btn-deletar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const codigo = e.currentTarget.dataset.codigo;
                this.confirmarExclusao(codigo);
            });
        });
    }

    /**
     * Novo produto
     */
    novoProduto() {
        this.modoEdicao = false;
        this.produtoEditando = null;
        this.limparFormulario();
        this.atualizarBotoesFormulario();
        this.gerarCodigo();

        // Abrir modal
        const modal = new bootstrap.Modal(document.getElementById('modalProduto'));
        modal.show();

        // Atualizar título do modal
        const modalTitulo = document.getElementById('modal-titulo');
        if (modalTitulo) {
            modalTitulo.innerHTML = '<i class="bi bi-plus-lg"></i> Novo Produto';
        }
    }

    /**
     * Editar produto existente
     */
    editarProduto(codigo) {
        const produto = this.produtos.find(p => p.codigo === codigo);
        if (!produto) {
            this.mostrarNotificacao('Produto não encontrado', 'erro');
            return;
        }

        this.modoEdicao = true;
        this.produtoEditando = produto;
        this.preencherFormulario(produto);
        this.atualizarBotoesFormulario();

        // Abrir modal
        const modal = new bootstrap.Modal(document.getElementById('modalProduto'));
        modal.show();

        // Atualizar título do modal
        const modalTitulo = document.getElementById('modal-titulo');
        if (modalTitulo) {
            modalTitulo.innerHTML = '<i class="bi bi-pencil"></i> Editar Produto';
        }
    }

    /**
     * Duplicar produto
     */
    duplicarProduto(codigo) {
        const produto = this.produtos.find(p => p.codigo === codigo);
        if (!produto) {
            this.mostrarNotificacao('Produto não encontrado', 'erro');
            return;
        }

        this.modoEdicao = false;
        this.produtoEditando = null;
        this.preencherFormulario(produto);
        this.gerarCodigo(); // Gera novo código
        this.atualizarBotoesFormulario();

        // Abrir modal
        const modal = new bootstrap.Modal(document.getElementById('modalProduto'));
        modal.show();

        this.mostrarNotificacao('Produto duplicado! Altere o código se necessário.', 'info');
    }

    /**
     * Preenche o formulário com dados do produto
     */
    preencherFormulario(produto) {
        document.getElementById('codigo').value = produto.codigo;
        document.getElementById('ativo').checked = produto.ativo;
        document.getElementById('titulo').value = produto.titulo;
        document.getElementById('descricao').value = produto.descricao;
        document.getElementById('url').value = produto.url;
        document.getElementById('imagem').value = produto.imagem.join(', ');
        document.getElementById('categorias').value = produto.categorias.join(', ');
        document.getElementById('favorito').checked = produto.favorito;
        document.getElementById('loja').value = produto.loja;
        document.getElementById('preco').value = produto.preco;

        this.atualizarPreviewImagens();
        this.atualizarContadorCaracteres(document.getElementById('descricao'));
    }

    /**
     * Limpa o formulário
     */
    limparFormulario() {
        document.getElementById('form-produto').reset();
        document.getElementById('preview-imagens').innerHTML = '';
        document.getElementById('contador-caracteres').textContent = '0 caracteres';
    }

    /**
     * Salva produto (novo ou editado)
     */
    salvarProduto() {
        try {
            const dadosFormulario = this.obterDadosFormulario();

            // Validação
            const errosValidacao = this.validarDados(dadosFormulario);
            if (errosValidacao.length > 0) {
                this.mostrarErrosValidacao(errosValidacao);
                return;
            }

            if (this.modoEdicao) {
                this.atualizarProdutoExistente(dadosFormulario);
            } else {
                this.adicionarNovoProduto(dadosFormulario);
            }

            this.salvarNoJSON();
            this.renderizarLista();
            this.cancelarEdicao();

            const acao = this.modoEdicao ? 'atualizado' : 'adicionado';
            this.mostrarNotificacao(`Produto ${acao} com sucesso!`, 'sucesso');

        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            this.mostrarNotificacao('Erro ao salvar produto', 'erro');
        }
    }

    /**
     * Obtém dados do formulário
     */
    obterDadosFormulario() {
        return {
            codigo: document.getElementById('codigo').value.trim(),
            ativo: document.getElementById('ativo').checked,
            titulo: document.getElementById('titulo').value.trim(),
            descricao: document.getElementById('descricao').value.trim(),
            url: document.getElementById('url').value.trim(),
            imagem: document.getElementById('imagem').value.split(',').map(url => url.trim()).filter(url => url),
            categorias: document.getElementById('categorias').value.split(',').map(cat => cat.trim()).filter(cat => cat),
            favorito: document.getElementById('favorito').checked,
            loja: document.getElementById('loja').value,
            preco: parseFloat(document.getElementById('preco').value) || 0
        };
    }

    /**
     * Valida dados do produto
     */
    validarDados(dados) {
        const erros = [];

        if (!dados.codigo) {
            erros.push('Código é obrigatório');
        } else if (dados.codigo.length < 3) {
            erros.push('Código deve ter pelo menos 3 caracteres');
        } else if (!this.modoEdicao && this.produtos.some(p => p.codigo === dados.codigo)) {
            erros.push('Código já existe');
        }

        if (!dados.titulo) {
            erros.push('Título é obrigatório');
        } else if (dados.titulo.length < 5) {
            erros.push('Título deve ter pelo menos 5 caracteres');
        }

        if (!dados.descricao) {
            erros.push('Descrição é obrigatória');
        } else if (dados.descricao.length < 20) {
            erros.push('Descrição deve ter pelo menos 20 caracteres');
        }

        if (!dados.url) {
            erros.push('URL é obrigatória');
        } else if (!this.validarURL(dados.url)) {
            erros.push('URL deve ser válida');
        }

        if (dados.imagem.length === 0) {
            erros.push('Pelo menos uma imagem é obrigatória');
        } else {
            const urlsInvalidas = dados.imagem.filter(url => !this.validarURL(url));
            if (urlsInvalidas.length > 0) {
                erros.push('Algumas URLs de imagem são inválidas');
            }
        }

        if (dados.categorias.length === 0) {
            erros.push('Pelo menos uma categoria é obrigatória');
        }

        if (!dados.loja) {
            erros.push('Loja é obrigatória');
        }

        if (dados.preco <= 0) {
            erros.push('Preço deve ser maior que zero');
        }

        return erros;
    }

    /**
     * Valida URL
     */
    validarURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Mostra erros de validação
     */
    mostrarErrosValidacao(erros) {
        const mensagem = `
      <strong>Corrija os seguintes erros:</strong>
      <ul>${erros.map(erro => `<li>${erro}</li>`).join('')}</ul>
    `;
        this.mostrarNotificacao(mensagem, 'erro');
    }

    /**
     * Atualiza produto existente
     */
    atualizarProdutoExistente(dados) {
        const index = this.produtos.findIndex(p => p.codigo === this.produtoEditando.codigo);
        if (index !== -1) {
            this.produtos[index] = dados;
        }
    }

    /**
     * Adiciona novo produto
     */
    adicionarNovoProduto(dados) {
        this.produtos.push(dados);
    }

    /**
     * Confirma exclusão de produto
     */
    confirmarExclusao(codigo) {
        const produto = this.produtos.find(p => p.codigo === codigo);
        if (!produto) return;

        if (confirm(`Tem certeza que deseja excluir o produto "${produto.titulo}"?\n\nEsta ação não pode ser desfeita.`)) {
            this.excluirProdutoPorCodigo(codigo);
        }
    }

    /**
     * Exclui produto por código
     */
    excluirProdutoPorCodigo(codigo) {
        const index = this.produtos.findIndex(p => p.codigo === codigo);
        if (index !== -1) {
            this.produtos.splice(index, 1);
            this.salvarNoJSON();
            this.renderizarLista();
            this.mostrarNotificacao('Produto excluído com sucesso!', 'sucesso');

            // Se estava editando este produto, cancelar edição
            if (this.produtoEditando && this.produtoEditando.codigo === codigo) {
                this.cancelarEdicao();
            }
        }
    }

    /**
     * Exclui produto atualmente em edição
     */
    excluirProduto() {
        if (!this.produtoEditando) return;
        this.confirmarExclusao(this.produtoEditando.codigo);
    }

    /**
     * Cancela edição
     */
    cancelarEdicao() {
        this.modoEdicao = false;
        this.produtoEditando = null;
        this.limparFormulario();
        this.atualizarBotoesFormulario();

        // Fechar modal
        const modalElement = document.getElementById('modalProduto');
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
    }

    /**
     * Filtra lista de produtos
     */
    filtrarLista(termo) {
        if (!termo.trim()) {
            this.renderizarLista();
            return;
        }

        const termoLower = termo.toLowerCase();
        const produtosFiltrados = this.produtos.filter(produto =>
            produto.codigo.toLowerCase().includes(termoLower) ||
            produto.titulo.toLowerCase().includes(termoLower) ||
            produto.loja.toLowerCase().includes(termoLower) ||
            produto.categorias.some(cat => cat.toLowerCase().includes(termoLower))
        );

        this.renderizarLista(produtosFiltrados);
    }

    /**
     * Gera código único para produto
     */
    gerarCodigo() {
        const prefixos = ['PRD', 'ITM', 'ACH', 'BOX'];
        const prefixo = prefixos[Math.floor(Math.random() * prefixos.length)];
        const numero = Math.floor(Math.random() * 9000) + 1000;
        const codigo = `${prefixo}${numero}`;

        // Verifica se já existe
        if (this.produtos.some(p => p.codigo === codigo)) {
            return this.gerarCodigo(); // Recursivo até encontrar único
        }

        document.getElementById('codigo').value = codigo;
    }

    /**
     * Atualiza preview das imagens
     */
    atualizarPreviewImagens() {
        const urls = document.getElementById('imagem').value.split(',').map(url => url.trim()).filter(url => url);
        const preview = document.getElementById('preview-imagens');

        if (urls.length === 0) {
            preview.innerHTML = '<p>Nenhuma imagem para visualizar</p>';
            return;
        }

        preview.innerHTML = urls.map((url, index) => `
      <div class="preview-item">
        <img src="${url}" alt="Preview ${index + 1}" loading="lazy" 
             onerror="this.parentElement.innerHTML='<div class=\\'preview-erro\\'>URL inválida</div>'">
        <span class="preview-numero">${index + 1}</span>
      </div>
    `).join('');
    }

    /**
     * Atualiza contador de caracteres
     */
    atualizarContadorCaracteres(textarea) {
        const contador = document.getElementById('contador-caracteres');
        const length = textarea.value.length;
        contador.textContent = `${length} caracteres`;

        if (length < 20) {
            contador.style.color = '#e74c3c';
        } else if (length < 100) {
            contador.style.color = '#f39c12';
        } else {
            contador.style.color = '#2ecc71';
        }
    }

    /**
     * Simula salvamento no JSON (sem backend real)
     */
    salvarNoJSON() {
        try {
            // Em uma aplicação real, isso seria uma requisição para o servidor
            const jsonString = JSON.stringify(this.produtos, null, 2);

            // Para fins de demonstração, vamos apenas logar
            console.log('📝 Dados que seriam salvos no JSON:', jsonString);

            // Em um ambiente real, você faria algo como:
            // await fetch('/api/produtos', { method: 'POST', body: jsonString });

        } catch (error) {
            console.error('Erro ao simular salvamento:', error);
            throw error;
        }
    }

    /**
     * Sistema de notificações
     */
    mostrarNotificacao(mensagem, tipo = 'info') {
        const container = document.getElementById('notificacoes') || this.criarContainerNotificacoes();

        const notificacao = document.createElement('div');
        notificacao.className = `notificacao ${tipo}`;
        notificacao.innerHTML = `
      <div class="notificacao-conteudo">
        <i class="bi ${this.getIconeNotificacao(tipo)}"></i>
        <span>${mensagem}</span>
        <button class="btn-fechar-notificacao" onclick="this.parentElement.parentElement.remove()">
          <i class="bi bi-x"></i>
        </button>
      </div>
    `;

        container.appendChild(notificacao);

        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (notificacao.parentElement) {
                notificacao.remove();
            }
        }, 5000);
    }

    /**
     * Cria container de notificações se não existir
     */
    criarContainerNotificacoes() {
        const container = document.createElement('div');
        container.id = 'notificacoes';
        container.className = 'notificacoes-container';
        document.body.appendChild(container);
        return container;
    }

    /**
     * Retorna ícone para tipo de notificação
     */
    getIconeNotificacao(tipo) {
        const icones = {
            sucesso: 'bi-check-circle',
            erro: 'bi-exclamation-triangle',
            info: 'bi-info-circle',
            alerta: 'bi-exclamation-circle'
        };
        return icones[tipo] || icones.info;
    }

    /**
     * Métodos públicos
     */
    exportarDados() {
        const dados = JSON.stringify(this.produtos, null, 2);
        const blob = new Blob([dados], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'produtos_achadubom.json';
        link.click();

        URL.revokeObjectURL(url);
        this.mostrarNotificacao('Dados exportados com sucesso!', 'sucesso');
    }

    getEstatisticas() {
        return {
            total: this.produtos.length,
            ativos: this.produtos.filter(p => p.ativo).length,
            inativos: this.produtos.filter(p => !p.ativo).length,
            favoritos: this.produtos.filter(p => p.favorito).length,
            lojas: [...new Set(this.produtos.map(p => p.loja))].length,
            categorias: [...new Set(this.produtos.flatMap(p => p.categorias))].length
        };
    }

    /**
     * Obtém o logo da loja
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
}

/**
 * =============================================
 * INICIALIZAÇÃO DO ADMIN
 * =============================================
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('🛠️ Iniciando painel administrativo...');
    window.adminManager = new AdminManager();
});

console.log('⚙️ Sistema administrativo carregado com sucesso!');
