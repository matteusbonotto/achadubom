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
        this.apiUrl = 'http://localhost:5000/api'; // URL da API

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
     * Carrega produtos da API
     */
    async carregarProdutos() {
        try {
            const response = await fetch(`${this.apiUrl}/produtos`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const dados = await response.json();
            this.produtos = dados;

            console.log(`✅ ${this.produtos.length} produtos carregados da API`);

        } catch (error) {
            console.error('❌ Erro ao carregar produtos da API:', error);

            // Fallback para arquivo local
            try {
                const fallbackResponse = await fetch('./assets/data/produtos.json');
                if (fallbackResponse.ok) {
                    const fallbackData = await fallbackResponse.json();
                    this.produtos = fallbackData;
                    console.log(`⚠️ ${this.produtos.length} produtos carregados do arquivo (fallback)`);
                } else {
                    throw error;
                }
            } catch (fallbackError) {
                console.error('Erro no fallback:', fallbackError);
                this.mostrarNotificacao('Erro ao carregar produtos. Verifique se o servidor está rodando.', 'erro');
                throw error;
            }
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
        document.getElementById('vendas').value = produto.vendas || '0 vendas';

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
            preco: parseFloat(document.getElementById('preco').value) || 0,
            vendas: document.getElementById('vendas').value.trim() || '0 vendas'
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
     * Salvar alterações (simulação front-end)
     * Em um sistema real, isso seria uma requisição para API/backend
     */
    salvarNoJSON() {
        try {
            // Gerar o conteúdo JSON formatado exatamente como o arquivo original
            const jsonData = JSON.stringify(this.produtos, null, 4);

            // Copiar JSON para área de transferência automaticamente
            navigator.clipboard.writeText(jsonData).then(() => {
                console.log('📋 JSON COPIADO! Cole no arquivo: assets/data/produtos.json');
                this.mostrarNotificacao('📋 JSON copiado! Abra produtos.json e cole (Ctrl+V)', 'sucesso');

                console.log('🔄 PASSOS: 1) Abra produtos.json 2) Ctrl+A 3) Ctrl+V 4) Ctrl+S 5) F5');
                console.log('📊 Total de produtos:', this.produtos.length);

            }).catch(err => {
                console.log('📝 COPIE ESTE JSON:');
                console.log(jsonData);
                this.mostrarNotificacao('⚠️ Copie o JSON do console', 'aviso');
            });

        } catch (error) {
            console.error('Erro ao processar dados:', error);
            this.mostrarNotificacao('❌ Erro ao processar dados', 'erro');

            // Liberar URL
            URL.revokeObjectURL(url);

            // Logs informativos
            console.log('� ARQUIVO GERADO! Salve em: assets/data/produtos.json');
            console.log('📝 Dados a serem salvos:', JSON.stringify(this.produtos, null, 2));

            // Mostrar notificação com instruções
            this.mostrarNotificacao('💾 Arquivo produtos.json baixado! Substitua o arquivo em assets/data/', 'sucesso');

            // Instruções no console
            console.log('🔄 INSTRUÇÕES:');
            console.log('1. O arquivo produtos.json foi baixado');
            console.log('2. Substitua o arquivo em: assets/data/produtos.json');
            console.log('3. Recarregue a página (F5) para ver as alterações');

            console.log('� [SIMULAÇÃO] Arquivo produtos.json atualizado com sucesso!');
            console.log('📊 Total de produtos:', this.produtos.length);

        } catch (error) {
            console.error('Erro ao salvar:', error);
            this.mostrarNotificacao('❌ Erro ao salvar dados', 'erro');
            throw error;
        }
    }

    /**
     * Sistema de notificações
     */
    mostrarNotificacao(mensagem, tipo = 'info', duracao = 4000) {
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

        // Auto-remover após duração especificada
        setTimeout(() => {
            if (notificacao.parentElement) {
                notificacao.remove();
            }
        }, duracao);
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

    /**
     * Atualiza as estatísticas na interface
     */
    atualizarEstatisticas() {
        const stats = this.getEstatisticas();

        // Atualizar elementos de estatísticas se existirem
        const totalProdutos = document.getElementById('total-produtos');
        const produtosAtivos = document.getElementById('produtos-ativos');
        const produtosInativos = document.getElementById('produtos-inativos');

        if (totalProdutos) {
            totalProdutos.textContent = `${stats.total} produtos`;
        }

        if (produtosAtivos) {
            produtosAtivos.textContent = `${stats.ativos} ativos`;
        }

        if (produtosInativos) {
            produtosInativos.textContent = `${stats.inativos} inativos`;
        }

        console.log('📊 Estatísticas atualizadas:', stats);
    }
}

/**
 * =============================================
 * IMPORTADOR DE CSV
 * =============================================
 */

class CSVImporter {
    constructor(adminManager) {
        this.adminManager = adminManager;
        this.csvData = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Botão para abrir modal de importação
        const btnImportar = document.getElementById('btn-importar-csv');
        if (btnImportar) {
            btnImportar.addEventListener('click', () => {
                const modal = new bootstrap.Modal(document.getElementById('modalImportarCSV'));
                modal.show();
            });
        }

        // Input de arquivo CSV
        const arquivoCSV = document.getElementById('arquivo-csv');
        if (arquivoCSV) {
            arquivoCSV.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        // Botão de processar CSV
        const btnProcessar = document.getElementById('btn-processar-csv');
        if (btnProcessar) {
            btnProcessar.addEventListener('click', () => this.processarCSV());
        }

        // Event listeners para seleção de loja
        this.configurarSelecaoLoja();
    }

    configurarSelecaoLoja() {
        // Radio buttons das lojas
        const radiosLoja = document.querySelectorAll('input[name="loja"]');
        const inputOutro = document.getElementById('loja-outro-texto');
        const radioOutro = document.getElementById('loja-outro');

        radiosLoja.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.value === 'outro') {
                    inputOutro.disabled = false;
                    inputOutro.focus();
                } else {
                    inputOutro.disabled = true;
                    inputOutro.value = '';
                }
                this.validarFormularioImportacao();
            });
        });

        // Input personalizado da loja "outro"
        if (inputOutro) {
            inputOutro.addEventListener('input', () => {
                this.validarFormularioImportacao();
            });
        }
    }

    validarFormularioImportacao() {
        const btnProcessar = document.getElementById('btn-processar-csv');
        const arquivoCSV = document.getElementById('arquivo-csv');
        const lojaRadios = document.querySelectorAll('input[name="loja"]');
        const inputOutro = document.getElementById('loja-outro-texto');

        // Verificar se tem arquivo
        const temArquivo = arquivoCSV && arquivoCSV.files.length > 0;

        // Verificar se tem loja selecionada
        let temLoja = false;
        lojaRadios.forEach(radio => {
            if (radio.checked) {
                if (radio.value === 'outro') {
                    temLoja = inputOutro.value.trim().length > 0;
                } else {
                    temLoja = true;
                }
            }
        });

        // Habilitar/desabilitar botão
        if (btnProcessar) {
            btnProcessar.disabled = !temArquivo || !temLoja;
        }
    }

    getLojaSelecionada() {
        const lojaRadios = document.querySelectorAll('input[name="loja"]');
        const inputOutro = document.getElementById('loja-outro-texto');

        for (let radio of lojaRadios) {
            if (radio.checked) {
                if (radio.value === 'outro') {
                    return inputOutro.value.trim();
                } else {
                    return radio.value;
                }
            }
        }
        return null;
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) {
            this.validarFormularioImportacao();
            return;
        }

        if (!file.name.toLowerCase().endsWith('.csv')) {
            this.showAlert('Erro: Por favor selecione um arquivo CSV válido.', 'danger');
            return;
        }

        this.lerArquivoCSV(file);
        this.validarFormularioImportacao();
    }

    lerArquivoCSV(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csv = e.target.result;
                this.csvData = this.parseCSV(csv);
                this.mostrarPreview();
                this.habilitarBotaoProcessar();
            } catch (error) {
                console.error('Erro ao ler CSV:', error);
                this.showAlert('Erro ao processar arquivo CSV. Verifique o formato.', 'danger');
            }
        };
        reader.readAsText(file);
    }

    parseCSV(csv) {
        const lines = csv.split('\n').filter(line => line.trim());
        const headers = this.splitCSVLine(lines[0]);
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.splitCSVLine(lines[i]);
            if (values.length === headers.length) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header.trim()] = values[index] ? values[index].trim() : '';
                });
                data.push(row);
            }
        }

        return data;
    }

    splitCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);

        return result.map(item => item.replace(/^"|"$/g, ''));
    }

    mostrarPreview() {
        const previewSection = document.getElementById('preview-section');
        const previewTable = document.getElementById('preview-table');

        if (!previewSection || !previewTable || this.csvData.length === 0) return;

        // Limpar tabela
        previewTable.innerHTML = '';

        // Criar cabeçalho
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = Object.keys(this.csvData[0]);

        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            th.className = 'text-nowrap';
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        previewTable.appendChild(thead);

        // Criar corpo com primeiras 5 linhas
        const tbody = document.createElement('tbody');
        const previewData = this.csvData.slice(0, 5);

        previewData.forEach(row => {
            const tr = document.createElement('tr');
            headers.forEach(header => {
                const td = document.createElement('td');
                td.textContent = row[header] || '';
                td.className = 'text-nowrap';
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        previewTable.appendChild(tbody);
        previewSection.style.display = 'block';
    }

    habilitarBotaoProcessar() {
        const btnProcessar = document.getElementById('btn-processar-csv');
        if (btnProcessar) {
            btnProcessar.disabled = false;
        }
    }

    async processarCSV() {
        if (this.csvData.length === 0) {
            this.showAlert('Nenhum dado para processar.', 'warning');
            return;
        }

        // Verificar se tem loja selecionada
        const lojaSelecionada = this.getLojaSelecionada();
        if (!lojaSelecionada) {
            this.showAlert('Por favor, selecione uma loja antes de importar.', 'warning');
            return;
        }

        const progressBar = document.getElementById('progress-bar');
        const progressBarInner = document.querySelector('#progress-bar .progress-bar');
        const progressStatus = document.getElementById('progress-status');
        const resultadoDiv = document.getElementById('resultado-importacao');
        const btnProcessar = document.getElementById('btn-processar-csv');

        try {
            btnProcessar.disabled = true;
            progressBar.style.display = 'block';
            if (progressStatus) {
                progressStatus.style.display = 'block';
                progressStatus.textContent = 'Iniciando importação...';
            }
            resultadoDiv.innerHTML = '';

            // Mostrar status inicial
            if (progressStatus) {
                progressStatus.textContent = 'Iniciando importação...';
            }

            // Fazer chamada para a API
            const response = await fetch(`${this.adminManager.apiUrl}/import-csv`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    csv_data: this.csvData,
                    loja_selecionada: lojaSelecionada
                })
            });

            // Iniciar monitoramento do progresso
            const intervalId = setInterval(async () => {
                try {
                    const statusResponse = await fetch(`${this.adminManager.apiUrl}/import-status`);
                    const status = await statusResponse.json();

                    if (status.ativo) {
                        // Atualizar barra de progresso
                        const progress = (status.processados / status.total) * 100;
                        if (progressBarInner) {
                            progressBarInner.style.width = `${progress}%`;
                            progressBarInner.textContent = `${Math.round(progress)}%`;
                        }

                        // Atualizar status
                        if (progressStatus) {
                            progressStatus.innerHTML = `
                                <div><strong>Processando:</strong> ${status.produto_atual}</div>
                                <div><strong>Progresso:</strong> ${status.processados}/${status.total} produtos</div>
                                <div><strong>Importados:</strong> ${status.importados}</div>
                                ${status.erros.length > 0 ? `<div><strong>Erros:</strong> ${status.erros.length}</div>` : ''}
                            `;
                        }
                    } else {
                        // Importação finalizada
                        clearInterval(intervalId);

                        if (progressBarInner) {
                            progressBarInner.style.width = '100%';
                            progressBarInner.textContent = '100%';
                        }

                        if (progressStatus) {
                            progressStatus.innerHTML = `
                                <div class="text-success"><strong>✅ Importação concluída!</strong></div>
                                <div><strong>Total importados:</strong> ${status.importados}/${status.total}</div>
                            `;
                        }

                        // Mostrar resultado final
                        this.mostrarResultadoFinal(status);

                        // Atualizar lista de produtos
                        await this.adminManager.carregarProdutos();

                        // Esconder barra de progresso após um tempo
                        setTimeout(() => {
                            progressBar.style.display = 'none';
                            if (progressStatus) {
                                progressStatus.style.display = 'none';
                            }
                        }, 5000);

                        // Fechar modal após sucesso
                        setTimeout(() => {
                            const modal = bootstrap.Modal.getInstance(document.getElementById('modalImportarCSV'));
                            modal.hide();
                        }, 3000);
                    }
                } catch (error) {
                    console.error('Erro ao verificar status:', error);
                }
            }, 1000); // Verificar a cada 1 segundo

            // Aguardar resposta da API
            const resultado = await response.json();

            if (!response.ok) {
                throw new Error(resultado.erro || 'Erro na importação');
            }

            // A partir daqui o intervalo vai cuidar da interface

        } catch (error) {
            console.error('Erro geral na importação:', error);
            this.showAlert(`Erro durante a importação: ${error.message}`, 'danger');

            if (progressStatus) {
                progressStatus.innerHTML = `<div class="text-danger">❌ Erro: ${error.message}</div>`;
            }
        } finally {
            btnProcessar.disabled = false;
            // Não esconder a barra imediatamente, deixar o intervalo cuidar disso
        }
    }

    mostrarResultadoFinal(status) {
        const resultadoDiv = document.getElementById('resultado-importacao');
        if (!resultadoDiv) return;

        let html = '';

        if (status.importados > 0) {
            html += `<div class="alert alert-success">
                <i class="bi bi-check-circle"></i>
                <strong>Sucesso!</strong> ${status.importados} produto(s) importado(s) com sucesso.
            </div>`;
        }

        if (status.erros && status.erros.length > 0) {
            html += `<div class="alert alert-warning">
                <i class="bi bi-exclamation-triangle"></i>
                <strong>Atenção!</strong> ${status.erros.length} erro(s) encontrado(s):
                <ul class="mt-2 mb-0">
                    ${status.erros.slice(0, 5).map(erro => `<li>${erro}</li>`).join('')}
                    ${status.erros.length > 5 ? `<li>... e mais ${status.erros.length - 5} erros</li>` : ''}
                </ul>
            </div>`;
        }

        resultadoDiv.innerHTML = html;
    }

    converterCSVParaProduto(csvRow, lojaSelecionada, categoriaPadrao, indice) {
        // Extrair código dos últimos 10 caracteres do Offer Link
        let codigo = 'PROD001';
        if (csvRow['Offer Link']) {
            const offerLink = csvRow['Offer Link'].trim();
            if (offerLink.length >= 10) {
                codigo = offerLink.slice(-10);
            }
        }

        // Extrair preço numérico
        let preco = 0;
        if (csvRow['Price']) {
            const precoStr = csvRow['Price'].replace(/[R$\s]/g, '').replace(',', '.');
            preco = parseFloat(precoStr) || 0;
        }

        // Usar a loja selecionada pelo usuário
        const loja = lojaSelecionada || 'Loja Online';

        // Criar categorias baseadas no que podemos inferir do produto
        const categorias = [];

        // Adicionar categorias baseadas no nome do produto
        const titulo = csvRow['Item Name'] || '';
        if (titulo.toLowerCase().includes('kit')) categorias.push('kits');
        if (titulo.toLowerCase().includes('eletr') || titulo.toLowerCase().includes('câmera') ||
            titulo.toLowerCase().includes('carregador') || titulo.toLowerCase().includes('wireless')) {
            categorias.push('eletrônicos');
        }
        if (titulo.toLowerCase().includes('casa') || titulo.toLowerCase().includes('cozinha') ||
            titulo.toLowerCase().includes('panela') || titulo.toLowerCase().includes('pote')) {
            categorias.push('casa');
        }
        if (titulo.toLowerCase().includes('roupa') || titulo.toLowerCase().includes('feminino') ||
            titulo.toLowerCase().includes('masculino') || titulo.toLowerCase().includes('calça')) {
            categorias.push('moda');
        }

        // Se não encontrou nenhuma categoria específica, usar uma padrão
        if (categorias.length === 0) {
            categorias.push('outros');
        }

        // Verificar se tem muitas vendas para adicionar categoria destaque
        const vendas = csvRow['Sales'] || '';
        if (vendas.includes('mil+') || vendas.includes('k')) {
            categorias.push('destaque');
        }

        // Criar objeto produto
        const produto = {
            codigo: codigo,
            ativo: true,
            titulo: csvRow['Item Name'] || `Produto ${codigo}`,
            descricao: `${csvRow['Item Name'] || 'Produto importado'}. Vendido por ${loja}. ${csvRow['Sales'] || '0'} vendas.`,
            url: csvRow['Offer Link'] || csvRow['Product Link'] || '#',
            imagem: [], // Array vazio como especificado
            categorias: categorias,
            favorito: false,
            loja: loja,
            preco: preco,
            vendas: csvRow['Sales'] || '0 vendas'
        };

        return produto;
    }

    async adicionarProdutosAoSistema(produtos) {
        // Carregar produtos atuais
        await this.adminManager.carregarProdutos();

        // Adicionar novos produtos
        produtos.forEach(produto => {
            this.adminManager.produtos.push(produto);
        });

        // Salvar usando a função correta
        this.adminManager.salvarNoJSON();

        // Atualizar interface
        this.adminManager.renderizarLista();
        this.adminManager.atualizarEstatisticas();

        // Notificação de sucesso simples
        this.adminManager.mostrarNotificacao(
            `✅ ${produtos.length} produto(s) importado(s) e salvos com sucesso!`,
            'sucesso',
            3000
        );
    }

    updateProgressBar(progress) {
        const progressBar = document.querySelector('#progress-bar .progress-bar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
            progressBar.textContent = `${Math.round(progress)}%`;
        }
    }

    mostrarResultado(sucessos, erros) {
        const resultadoDiv = document.getElementById('resultado-importacao');
        if (!resultadoDiv) return;

        let html = '';
        if (sucessos > 0) {
            html += `<div class="alert alert-success">
                <i class="bi bi-check-circle"></i>
                <strong>Sucesso!</strong> ${sucessos} produto(s) importado(s) com sucesso.
            </div>`;
        }

        if (erros > 0) {
            html += `<div class="alert alert-warning">
                <i class="bi bi-exclamation-triangle"></i>
                <strong>Atenção!</strong> ${erros} produto(s) tiveram erro na importação.
            </div>`;
        }

        resultadoDiv.innerHTML = html;
    }

    showAlert(message, type = 'info') {
        const resultadoDiv = document.getElementById('resultado-importacao');
        if (resultadoDiv) {
            resultadoDiv.innerHTML = `
                <div class="alert alert-${type}">
                    <i class="bi bi-${type === 'danger' ? 'exclamation-triangle' : 'info-circle'}"></i>
                    ${message}
                </div>
            `;
        }
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
    window.csvImporter = new CSVImporter(window.adminManager);
});

console.log('⚙️ Sistema administrativo carregado com sucesso!');
