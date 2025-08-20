/**
 * =============================================
 * PAINEL ADMINISTRATIVO COM API PYTHON
 * AchaduBom - Sistema PWA
 * =============================================
 */

class AdminManager {
    constructor() {
        this.produtos = [];
        this.produtoEditando = null;
        this.modoEdicao = false;
        this.apiUrl = 'http://localhost:5000/api'; // URL da API Python

        this.init();
    }

    /**
     * Inicialização do painel admin
     */
    async init() {
        try {
            console.log('🛠️ Iniciando painel administrativo...');
            await this.carregarProdutos();
            this.configurarEventListeners();
            this.renderizarLista();
            this.configurarFormulario();
            this.preencherOpcoesLojas(); // Adicionar opções de lojas
        } catch (error) {
            console.error('Erro na inicialização do admin:', error);
            this.mostrarNotificacao('Erro ao carregar dados. Verifique se o servidor Python está rodando.', 'erro');
        }
    }

    /**
     * Carrega produtos da API Python
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
                    this.mostrarNotificacao('⚠️ Usando dados locais. Inicie o servidor Python para funcionalidade completa.', 'aviso');
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
     * Salvar produto na API
     */
    async salvarProdutoAPI(produto, metodo = 'POST') {
        try {
            let url = `${this.apiUrl}/produtos`;
            if (metodo === 'PUT') {
                url += `/${produto.codigo}`;
            }

            const response = await fetch(url, {
                method: metodo,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(produto)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.erro || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(`✅ Produto ${metodo === 'POST' ? 'criado' : 'atualizado'} com sucesso!`);
            this.mostrarNotificacao(`✅ Produto ${metodo === 'POST' ? 'criado' : 'atualizado'} com sucesso!`, 'sucesso');

            // Recarregar produtos
            await this.carregarProdutos();
            this.renderizarLista();

            return data;

        } catch (error) {
            console.error('Erro ao salvar produto na API:', error);
            this.mostrarNotificacao(`❌ Erro: ${error.message}`, 'erro');
            throw error;
        }
    }

    /**
     * Excluir produto da API
     */
    async excluirProdutoAPI(codigo) {
        try {
            const response = await fetch(`${this.apiUrl}/produtos/${codigo}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.erro || `HTTP error! status: ${response.status}`);
            }

            console.log(`✅ Produto ${codigo} excluído com sucesso!`);
            this.mostrarNotificacao('✅ Produto excluído com sucesso!', 'sucesso');

            // Recarregar produtos
            await this.carregarProdutos();
            this.renderizarLista();

            return true;

        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            this.mostrarNotificacao(`❌ Erro: ${error.message}`, 'erro');
            throw error;
        }
    }

    /**
     * Web scraping de imagem
     */
    async extrairImagemProduto(url) {
        try {
            const response = await fetch(`${this.apiUrl}/extrair-imagem`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: url })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.erro || 'Erro ao extrair imagem');
            }

            const data = await response.json();
            console.log('✅ Imagem extraída com sucesso:', data.imagem);

            return data.imagem;

        } catch (error) {
            console.error('Erro no web scraping:', error);
            this.mostrarNotificacao(`⚠️ Não foi possível extrair imagem: ${error.message}`, 'aviso');
            return null;
        }
    }

    /**
     * Configurar event listeners
     */
    configurarEventListeners() {
        // Botão novo produto
        document.getElementById('btn-novo-produto')?.addEventListener('click', () => {
            this.novoProduto();
        });

        // Formulário de produto
        document.getElementById('form-produto')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.salvarProduto();
        });

        // Busca
        document.getElementById('busca-admin')?.addEventListener('input', (e) => {
            this.filtrarProdutos(e.target.value);
        });

        // Botão de extrair imagem
        document.getElementById('btn-extrair-imagem')?.addEventListener('click', async () => {
            await this.extrairImagemDoURL();
        });

        // Botão importar CSV
        document.getElementById('btn-importar-csv')?.addEventListener('click', () => {
            const modal = new bootstrap.Modal(document.getElementById('modalImportarCSV'));
            modal.show();
        });

        // Arquivo CSV
        document.getElementById('arquivo-csv')?.addEventListener('change', (e) => {
            this.handleArquivoCSV(e);
        });

        // Processar CSV
        document.getElementById('btn-processar-csv')?.addEventListener('click', async () => {
            await this.processarCSV();
        });
    }

    /**
     * Preencher opções de lojas
     */
    preencherOpcoesLojas() {
        const select = document.getElementById('loja');
        if (!select) return;

        const lojas = [
            'Shopee',
            'Mercado Livre',
            'Amazon',
            'AliExpress',
            'Casas Bahia',
            'Magazine Luiza',
            'Americanas',
            'Submarino',
            'Extra',
            'Carrefour'
        ];

        select.innerHTML = '<option value="">Selecione uma loja</option>';

        lojas.forEach(loja => {
            const option = document.createElement('option');
            option.value = loja;
            option.textContent = loja;
            select.appendChild(option);
        });
    }

    /**
     * Handle arquivo CSV
     */
    handleArquivoCSV(event) {
        const file = event.target.files[0];
        const btnProcessar = document.getElementById('btn-processar-csv');

        if (file && file.type === 'text/csv') {
            btnProcessar.disabled = false;
            this.arquivoCSV = file;
        } else {
            btnProcessar.disabled = true;
            this.arquivoCSV = null;
            this.mostrarNotificacao('⚠️ Selecione um arquivo CSV válido', 'aviso');
        }
    }

    /**
     * Processar CSV
     */
    async processarCSV() {
        if (!this.arquivoCSV) {
            this.mostrarNotificacao('⚠️ Selecione um arquivo CSV primeiro', 'aviso');
            return;
        }

        try {
            const text = await this.arquivoCSV.text();
            const csvData = this.parseCSV(text);

            if (csvData.length === 0) {
                this.mostrarNotificacao('❌ Arquivo CSV não contém dados válidos', 'erro');
                return;
            }

            // Obter loja selecionada
            const lojaSelecionada = document.querySelector('input[name="loja"]:checked');
            if (!lojaSelecionada) {
                this.mostrarNotificacao('⚠️ Selecione uma loja para importação', 'aviso');
                return;
            }

            // Enviar para API
            const response = await fetch(`${this.apiUrl}/import-csv`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    csv_data: csvData,
                    loja_selecionada: lojaSelecionada.value
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.erro || 'Erro ao importar CSV');
            }

            const result = await response.json();

            this.mostrarNotificacao(
                `✅ ${result.importados} produtos importados com sucesso!`,
                'sucesso'
            );

            if (result.erros && result.erros.length > 0) {
                console.warn('Erros durante importação:', result.erros);
                this.mostrarNotificacao(
                    `⚠️ ${result.erros.length} erros encontrados (veja console)`,
                    'aviso'
                );
            }

            // Recarregar produtos e fechar modal
            await this.carregarProdutos();
            this.renderizarLista();

            const modal = bootstrap.Modal.getInstance(document.getElementById('modalImportarCSV'));
            modal.hide();

        } catch (error) {
            console.error('Erro ao processar CSV:', error);
            this.mostrarNotificacao(`❌ Erro: ${error.message}`, 'erro');
        }
    }

    /**
     * Parser CSV robusto que lida com aspas e vírgulas
     */
    parseCSV(text) {
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
            throw new Error('Arquivo CSV deve ter pelo menos cabeçalho e uma linha de dados');
        }

        // Função para dividir linha CSV respeitando aspas
        const splitCSVLine = (line) => {
            const result = [];
            let current = '';
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
                const char = line[i];

                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    result.push(current.trim().replace(/^"|"$/g, ''));
                    current = '';
                } else {
                    current += char;
                }
            }

            // Adicionar último valor
            result.push(current.trim().replace(/^"|"$/g, ''));
            return result;
        };

        const headers = splitCSVLine(lines[0]);
        const csvData = [];

        // Processar cada linha
        for (let i = 1; i < lines.length; i++) {
            const values = splitCSVLine(lines[i]);
            const row = {};

            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });

            // Validar se tem dados mínimos para CSV BatchProductLinks (formato de afiliados)
            if (row['Item Name'] && row['Offer Link']) {
                csvData.push(row);
            }
        }

        return csvData;
    }

    /**
     * Extrair imagem automaticamente da URL
     */
    async extrairImagemDoURL() {
        const urlInput = document.getElementById('url');
        const imagemInput = document.getElementById('imagem');

        if (!urlInput.value) {
            this.mostrarNotificacao('⚠️ Digite a URL do produto primeiro', 'aviso');
            return;
        }

        this.mostrarNotificacao('🔍 Extraindo imagem...', 'info');

        const imagemUrl = await this.extrairImagemProduto(urlInput.value);

        if (imagemUrl) {
            imagemInput.value = imagemUrl;
            this.mostrarNotificacao('✅ Imagem extraída e adicionada!', 'sucesso');
            this.atualizarPreviewImagens();
        }
    }

    /**
     * Atualizar preview de imagens
     */
    atualizarPreviewImagens() {
        const imagemInput = document.getElementById('imagem');
        const previewContainer = document.getElementById('preview-imagens');

        if (!imagemInput || !previewContainer) return;

        const urls = imagemInput.value.split('\n').filter(url => url.trim());

        if (urls.length === 0) {
            previewContainer.innerHTML = '<p>Nenhuma imagem para visualizar</p>';
            return;
        }

        previewContainer.innerHTML = urls.map((url, index) => `
            <div class="preview-item">
                <img src="${url.trim()}" alt="Preview ${index + 1}" loading="lazy">
                <div class="preview-numero">${index + 1}</div>
            </div>
        `).join('');
    }

    /**
     * Salvar produto
     */
    async salvarProduto() {
        try {
            const dadosFormulario = this.obterDadosFormulario();
            const errosValidacao = this.validarDados(dadosFormulario);

            if (errosValidacao.length > 0) {
                this.mostrarErrosValidacao(errosValidacao);
                return;
            }

            // Determinar se é criação ou edição
            const metodo = this.modoEdicao ? 'PUT' : 'POST';

            await this.salvarProdutoAPI(dadosFormulario, metodo);

            // Fechar modal e limpar formulário
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalProduto'));
            modal.hide();
            this.limparFormulario();

        } catch (error) {
            console.error('Erro ao salvar produto:', error);
        }
    }

    /**
     * Confirmar exclusão
     */
    async confirmarExclusao(codigo) {
        if (confirm(`Tem certeza que deseja excluir o produto ${codigo}?`)) {
            await this.excluirProdutoAPI(codigo);
        }
    }

    // ... (resto das funções do admin original: renderizar, validar, etc.)
    // Por brevidade, incluindo apenas as principais relacionadas à API

    /**
     * Renderizar lista de produtos
     */
    renderizarLista(produtosFiltrados = null) {
        const container = document.getElementById('lista-produtos');
        const produtos = produtosFiltrados || this.produtos;

        if (!container) return;

        if (produtos.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <i class="bi bi-inbox fs-1 text-muted"></i>
                    <p class="text-muted mt-2">Nenhum produto encontrado</p>
                </div>
            `;
            return;
        }

        container.innerHTML = produtos.map(produto => this.templateItemLista(produto)).join('');
        this.configurarEventListenersLista();
    }

    /**
     * Template para item da lista
     */
    templateItemLista(produto) {
        const statusClass = produto.ativo ? 'ativo' : 'inativo';
        const statusIcon = produto.ativo ? 'check-circle-fill' : 'x-circle-fill';
        const statusColor = produto.ativo ? 'success' : 'danger';

        return `
            <div class="item-produto ${statusClass}" data-codigo="${produto.codigo}">
                <div class="item-imagem">
                    <img src="${produto.imagem?.[0] || 'https://via.placeholder.com/60x60/ddd/999?text=Sem+Img'}" 
                         alt="${produto.titulo}" loading="lazy">
                </div>
                <div class="item-info">
                    <div class="item-titulo">${produto.titulo}</div>
                    <div class="item-detalhes">
                        <span class="item-codigo">Código: ${produto.codigo}</span>
                        <span class="item-loja">${produto.loja}</span>
                        <span class="item-preco">R$ ${produto.preco?.toFixed(2)}</span>
                    </div>
                </div>
                <div class="item-status">
                    <i class="bi bi-${statusIcon} text-${statusColor}"></i>
                </div>
                <div class="item-acoes">
                    <button class="btn btn-sm btn-outline-primary" onclick="adminManager.editarProduto('${produto.codigo}')" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info" onclick="adminManager.duplicarProduto('${produto.codigo}')" title="Duplicar">
                        <i class="bi bi-copy"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="adminManager.confirmarExclusao('${produto.codigo}')" title="Excluir">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Sistema de notificações
     */
    mostrarNotificacao(mensagem, tipo = 'info', duracao = 4000) {
        const container = document.getElementById('notificacoes') || this.criarContainerNotificacoes();

        const notificacao = document.createElement('div');
        notificacao.className = `alert alert-${tipo === 'sucesso' ? 'success' : tipo === 'erro' ? 'danger' : tipo === 'aviso' ? 'warning' : 'info'} alert-dismissible fade show`;
        notificacao.innerHTML = `
            ${mensagem}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        container.appendChild(notificacao);

        // Remove automaticamente após a duração
        setTimeout(() => {
            if (notificacao.parentNode) {
                notificacao.remove();
            }
        }, duracao);
    }

    criarContainerNotificacoes() {
        const container = document.createElement('div');
        container.id = 'notificacoes';
        container.className = 'position-fixed top-0 end-0 p-3';
        container.style.zIndex = '1060';
        document.body.appendChild(container);
        return container;
    }

    // Adicionar outras funções necessárias (validação, formulário, etc.)
    obterDadosFormulario() {
        return {
            codigo: document.getElementById('codigo').value,
            ativo: document.getElementById('ativo').checked,
            titulo: document.getElementById('titulo').value,
            descricao: document.getElementById('descricao').value,
            url: document.getElementById('url').value,
            imagem: document.getElementById('imagem').value.split('\n').filter(img => img.trim()),
            categorias: Array.from(document.querySelectorAll('input[name="categorias"]:checked')).map(cb => cb.value),
            favorito: document.getElementById('favorito').checked,
            loja: document.getElementById('loja').value,
            preco: parseFloat(document.getElementById('preco').value) || 0,
            vendas: document.getElementById('vendas').value || '0 vendas'
        };
    }

    validarDados(dados) {
        const erros = [];

        if (!dados.codigo) erros.push('Código é obrigatório');
        if (!dados.titulo) erros.push('Título é obrigatório');
        if (!dados.descricao) erros.push('Descrição é obrigatória');
        if (!dados.url) erros.push('URL é obrigatória');
        if (dados.imagem.length === 0) erros.push('Pelo menos uma imagem é obrigatória');
        if (!dados.loja) erros.push('Loja é obrigatória');
        if (dados.preco <= 0) erros.push('Preço deve ser maior que zero');

        return erros;
    }

    mostrarErrosValidacao(erros) {
        const mensagem = erros.join('<br>');
        this.mostrarNotificacao(`❌ Erros de validação:<br>${mensagem}`, 'erro');
    }

    novoProduto() {
        this.modoEdicao = false;
        this.produtoEditando = null;
        this.limparFormulario();

        const modal = new bootstrap.Modal(document.getElementById('modalProduto'));
        modal.show();
    }

    editarProduto(codigo) {
        const produto = this.produtos.find(p => p.codigo === codigo);
        if (!produto) return;

        this.modoEdicao = true;
        this.produtoEditando = produto;
        this.preencherFormulario(produto);

        const modal = new bootstrap.Modal(document.getElementById('modalProduto'));
        modal.show();
    }

    duplicarProduto(codigo) {
        const produto = this.produtos.find(p => p.codigo === codigo);
        if (!produto) return;

        this.modoEdicao = false;
        this.produtoEditando = null;

        const novoProduto = { ...produto };
        novoProduto.codigo = produto.codigo + '_copy';
        novoProduto.titulo = produto.titulo + ' (Cópia)';

        this.preencherFormulario(novoProduto);

        const modal = new bootstrap.Modal(document.getElementById('modalProduto'));
        modal.show();
    }

    preencherFormulario(produto) {
        document.getElementById('codigo').value = produto.codigo || '';
        document.getElementById('ativo').checked = produto.ativo !== false;
        document.getElementById('titulo').value = produto.titulo || '';
        document.getElementById('descricao').value = produto.descricao || '';
        document.getElementById('url').value = produto.url || '';
        document.getElementById('imagem').value = (produto.imagem || []).join('\n');
        document.getElementById('favorito').checked = produto.favorito || false;
        document.getElementById('loja').value = produto.loja || '';
        document.getElementById('preco').value = produto.preco || '';
        document.getElementById('vendas').value = produto.vendas || '';

        // Categorias
        document.querySelectorAll('input[name="categorias"]').forEach(cb => {
            cb.checked = (produto.categorias || []).includes(cb.value);
        });
    }

    limparFormulario() {
        document.getElementById('form-produto').reset();
        document.querySelectorAll('input[name="categorias"]').forEach(cb => cb.checked = false);
    }

    filtrarProdutos(termo) {
        if (!termo.trim()) {
            this.renderizarLista();
            return;
        }

        const produtosFiltrados = this.produtos.filter(produto =>
            produto.titulo.toLowerCase().includes(termo.toLowerCase()) ||
            produto.codigo.toLowerCase().includes(termo.toLowerCase()) ||
            produto.loja.toLowerCase().includes(termo.toLowerCase())
        );

        this.renderizarLista(produtosFiltrados);
    }

    configurarEventListenersLista() {
        // Event listeners já configurados via onclick nos templates
    }

    configurarFormulario() {
        // Configurações específicas do formulário se necessário
    }
}

// Inicialização
let adminManager;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🛠️ Sistema administrativo carregado com sucesso!');
    adminManager = new AdminManager();
});
