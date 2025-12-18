/**
 * =============================================
 * PAINEL ADMINISTRATIVO COM SUPABASE DIRETO
 * AchaduBom - Sistema PWA
 * =============================================
 */

class AdminManager {
    constructor() {
        this.produtos = [];
        this.produtoEditando = null;
        this.modoEdicao = false;
        this.arquivosCSV = []; // Array para múltiplos arquivos CSV
        this.inicializado = false;
        
        // Usar cliente Supabase singleton (evita múltiplas instâncias)
        this.supabase = window.getSupabaseClient?.() || null;
        
        if (!this.supabase) {
            console.error('❌ Supabase não configurado! Verifique config.js');
        }

        // Aguardar autenticação antes de inicializar
        this.aguardarAutenticacao();
    }

    /**
     * Aguarda a autenticação e inicializa o admin
     */
    aguardarAutenticacao() {
        const verificarEInicializar = () => {
            // Verificar se authManager existe e se o container está visível
            const container = document.getElementById('admin-container');
            if (container && container.style.display !== 'none') {
                if (!this.inicializado) {
                    this.init();
                }
                return true;
            }
            return false;
        };

        // Tentar imediatamente
        if (verificarEInicializar()) return;

        // Se não, aguardar e tentar novamente
        const intervalo = setInterval(() => {
            if (verificarEInicializar()) {
                clearInterval(intervalo);
            }
        }, 300);

        // Timeout máximo de 10 segundos
        setTimeout(() => {
            clearInterval(intervalo);
            if (!this.inicializado) {
                console.warn('⚠️ Timeout aguardando autenticação');
            }
        }, 10000);
    }

    /**
     * Inicialização do painel admin
     */
    async init() {
        if (this.inicializado) {
            console.log('⚠️ Admin já inicializado');
            return;
        }

        try {
            console.log('🛠️ Iniciando painel administrativo...');
            this.inicializado = true;
            
            // Configurar event listeners primeiro
            this.configurarEventListeners();
            this.configurarFormulario();
            this.preencherOpcoesLojas();
            
            // Carregar produtos
            await this.carregarProdutos();
            
            // Renderizar lista (isso também atualiza as estatísticas)
            this.renderizarLista();
            
            // Forçar atualização das estatísticas
            this.atualizarEstatisticasDashboard();
            
            console.log('✅ Painel administrativo inicializado com sucesso!');
            this.mostrarNotificacao(`✅ ${this.produtos.length} produtos carregados!`, 'sucesso');
            
        } catch (error) {
            console.error('❌ Erro na inicialização do admin:', error);
            this.inicializado = false;
            this.mostrarNotificacao('Erro ao carregar dados. Verifique a conexão.', 'erro');
            
            // Renderizar lista vazia para mostrar estado de erro
            this.renderizarLista();
        }
    }

    /**
     * Carrega produtos diretamente do Supabase
     */
    async carregarProdutos() {
        try {
            if (!this.supabase) {
                throw new Error('Supabase não inicializado');
            }

            console.log('📦 Carregando produtos do Supabase...');

            // Buscar TODOS os produtos do Supabase (ativos e inativos)
            const { data, error } = await this.supabase
                .from('produtos')
                .select('*')
                .order('criado_em', { ascending: false });

            if (error) {
                console.error('❌ Erro na query:', error);
                throw error;
            }

            this.produtos = data || [];
            console.log(`✅ ${this.produtos.length} produtos carregados do Supabase`);
            
            // Atualizar estatísticas se a função existir
            if (typeof atualizarEstatisticas === 'function') {
                atualizarEstatisticas();
            }

            return this.produtos;

        } catch (error) {
            console.error('❌ Erro ao carregar produtos do Supabase:', error);
            this.produtos = [];
            this.mostrarNotificacao('Erro ao carregar produtos. Verifique a conexão.', 'erro');
            return [];
        }
    }

    /**
     * Salvar produto na API
     */
    async salvarProdutoAPI(produto, metodo = 'POST') {
        try {
            if (!this.supabase) {
                throw new Error('Supabase não inicializado');
            }

            // Verificar autenticação
            if (!window.authManager || !window.authManager.token) {
                throw new Error('Usuário não autenticado');
            }

            if (metodo === 'POST') {
                // Inserir novo produto
                const { data, error } = await this.supabase
                    .from('produtos')
                    .insert(produto)
                    .select()
                    .single();

                if (error) throw error;

                console.log('✅ Produto criado com sucesso!');
                this.mostrarNotificacao('✅ Produto criado com sucesso!', 'sucesso');
                
                // Recarregar produtos
                await this.carregarProdutos();
                this.renderizarLista();

                return data;
            } else if (metodo === 'PUT') {
                // Atualizar produto existente
                const { data, error } = await this.supabase
                    .from('produtos')
                    .update(produto)
                    .eq('codigo', produto.codigo)
                    .select()
                    .single();

                if (error) throw error;

                console.log('✅ Produto atualizado com sucesso!');
                this.mostrarNotificacao('✅ Produto atualizado com sucesso!', 'sucesso');
                
                // Recarregar produtos
                await this.carregarProdutos();
                this.renderizarLista();

                return data;
            }

        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            this.mostrarNotificacao(`❌ Erro: ${error.message}`, 'erro');
            throw error;
        }
    }

    /**
     * Excluir produto do Supabase
     */
    async excluirProdutoAPI(codigo) {
        try {
            if (!this.supabase) {
                throw new Error('Supabase não inicializado');
            }

            // Verificar autenticação
            if (!window.authManager || !window.authManager.token) {
                throw new Error('Usuário não autenticado');
            }

            // Deletar do Supabase
            const { error } = await this.supabase
                .from('produtos')
                .delete()
                .eq('codigo', codigo);

            if (error) throw error;

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
     * Web scraping de imagem (simplificado - retorna null por enquanto)
     * TODO: Implementar extração de imagem no frontend ou criar Edge Function
     */
    async extrairImagemProduto(url, produtoNome = '') {
        try {
            // Validar URL antes de fazer requisição
            if (!url || url === '#' || url === 'undefined' || url === 'null' || url.trim() === '') {
                console.warn(`⚠️ URL inválida ou vazia: "${url}"`);
                return null;
            }

            // Validar se é uma URL válida
            try {
                new URL(url);
            } catch (e) {
                console.warn(`⚠️ URL inválida (não é uma URL válida): "${url}"`);
                return null;
            }

            console.log(`🔍 Extraindo imagem de: ${url}`);

            // Chamar Edge Function do Supabase
            const supabaseUrl = window.AchaduBomConfig?.supabase?.url || 
                               window.SUPABASE_URL || 
                               'https://khahucrzwlqrvwcxogfi.supabase.co';
            const anonKey = window.AchaduBomConfig?.supabase?.anonKey || 
                           window.SUPABASE_ANON_KEY || 
                           'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoYWh1Y3J6d2xxcnZ3Y3hvZ2ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyODcwNzgsImV4cCI6MjA4MDg2MzA3OH0.U0uodkEOkZk_ilMXHh014mrnevCR1J5Ydu3JwcslT3E';
            
            const edgeFunctionUrl = `${supabaseUrl}/functions/v1/extract-image`;

            // Preparar body
            const bodyData = {
                url: url.trim(),
                produtoNome: produtoNome ? produtoNome.trim() : ''
            };

            console.log('📤 Enviando requisição para Edge Function:', {
                url: edgeFunctionUrl,
                body: bodyData
            });

            const response = await fetch(edgeFunctionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': anonKey,
                    'Authorization': `Bearer ${anonKey}`
                },
                body: JSON.stringify(bodyData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ Erro HTTP ${response.status}:`, errorText);
                throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('📦 Resposta da Edge Function:', data);

            if (data.sucesso && data.imagem) {
                console.log(`✅ Imagem extraída: ${data.imagem}`);
                return data.imagem;
            } else {
                console.warn(`⚠️ Nenhuma imagem encontrada para: ${url}`, data.mensagem || '');
                return null;
            }

        } catch (error) {
            console.error('❌ Erro ao extrair imagem:', error);
            console.error('Stack:', error.stack);
            // Não mostrar notificação de erro para não poluir a interface durante importação em massa
            return null;
        }
    }

    /**
     * Configurar event listeners
     */
    configurarEventListeners() {
        console.log('🔗 Configurando event listeners...');

        // Botão novo produto (header e sidebar)
        document.getElementById('btn-novo-produto')?.addEventListener('click', () => {
            this.novoProduto();
        });

        // Formulário de produto
        const formProduto = document.getElementById('form-produto');
        if (formProduto) {
            formProduto.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.salvarProduto();
            });
        }

        // Busca (ambos os campos)
        document.getElementById('busca-admin')?.addEventListener('input', (e) => {
            this.filtrarProdutos(e.target.value);
        });
        
        document.getElementById('busca-produtos')?.addEventListener('input', (e) => {
            this.filtrarProdutos(e.target.value);
        });

        // Botão de extrair imagem
        document.getElementById('btn-extrair-imagem')?.addEventListener('click', async () => {
            await this.extrairImagemDoURL();
        });

        // Botão importar CSV
        document.getElementById('btn-importar-csv')?.addEventListener('click', () => {
            this.abrirModalImportarCSV();
        });

        // Preencher lojas quando o modal for aberto
        const modalImportarCSV = document.getElementById('modalImportarCSV');
        if (modalImportarCSV) {
            modalImportarCSV.addEventListener('show.bs.modal', () => {
                this.preencherLojasCSV();
            });
            
            // Limpar estado ao fechar
            modalImportarCSV.addEventListener('hidden.bs.modal', () => {
                this.limparModalCSV();
            });
        }

        // Arquivo CSV
        document.getElementById('arquivo-csv')?.addEventListener('change', (e) => {
            this.handleArquivoCSV(e);
        });

        // Processar CSV
        document.getElementById('btn-processar-csv')?.addEventListener('click', async () => {
            await this.processarCSV();
        });

        console.log('✅ Event listeners configurados!');
    }

    /**
     * Abre o modal de importação CSV
     */
    abrirModalImportarCSV() {
        // Preencher lojas antes de abrir
        this.preencherLojasCSV();
        
        const modalEl = document.getElementById('modalImportarCSV');
        if (modalEl) {
            const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.show();
        }
    }

    /**
     * Limpa o estado do modal CSV
     */
    limparModalCSV() {
        this.arquivosCSV = [];
        
        const inputArquivo = document.getElementById('arquivo-csv');
        if (inputArquivo) inputArquivo.value = '';
        
        const arquivosSelecionados = document.getElementById('arquivos-selecionados');
        if (arquivosSelecionados) arquivosSelecionados.style.display = 'none';
        
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.style.display = 'none';
            const bar = progressBar.querySelector('.progress-bar');
            if (bar) {
                bar.style.width = '0%';
                bar.textContent = '0%';
            }
        }
        
        const progressStatus = document.getElementById('progress-status');
        if (progressStatus) progressStatus.style.display = 'none';
        
        const resultado = document.getElementById('resultado-importacao');
        if (resultado) resultado.innerHTML = '';
        
        const btnProcessar = document.getElementById('btn-processar-csv');
        if (btnProcessar) btnProcessar.disabled = true;
    }

    /**
     * Preencher opções de lojas no formulário de produto
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
     * Preencher lojas no modal de importação CSV
     */
    preencherLojasCSV() {
        const csvLojaSelection = document.getElementById('csv-loja-selection');
        if (!csvLojaSelection) {
            console.warn('⚠️ Elemento csv-loja-selection não encontrado');
            return;
        }

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

        // Mapear ícones para cada loja
        const icones = {
            'Shopee': 'bi-bag-fill',
            'Mercado Livre': 'bi-link-45deg',
            'Amazon': 'bi-box-fill',
            'AliExpress': 'bi-globe2',
            'Casas Bahia': 'bi-house-fill',
            'Magazine Luiza': 'bi-shop',
            'Americanas': 'bi-star-fill',
            'Submarino': 'bi-water',
            'Extra': 'bi-plus-circle-fill',
            'Carrefour': 'bi-cart-fill'
        };

        // Criar HTML das lojas dinamicamente com novo design
        let html = '';

        lojas.forEach((loja, index) => {
            const icone = icones[loja] || 'bi-shop';
            const lojaId = loja.toLowerCase().replace(/\s+/g, '-');
            
            html += `
                <label class="loja-option ${index === 0 ? 'selected' : ''}" for="loja-${lojaId}">
                    <input type="radio" name="loja" id="loja-${lojaId}" value="${loja}" ${index === 0 ? 'checked' : ''} style="display: none;">
                    <i class="bi ${icone}"></i>
                    <span>${loja}</span>
                </label>
            `;
        });

        csvLojaSelection.innerHTML = html;

        // Adicionar evento de seleção visual
        csvLojaSelection.querySelectorAll('.loja-option').forEach(option => {
            option.addEventListener('click', () => {
                csvLojaSelection.querySelectorAll('.loja-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                option.querySelector('input').checked = true;
                
                // Desabilitar campo "Outro" quando seleciona uma loja
                const lojaOutroTexto = document.getElementById('loja-outro-texto');
                if (lojaOutroTexto) {
                    lojaOutroTexto.disabled = true;
                }
                const lojaOutroRadio = document.getElementById('loja-outro');
                if (lojaOutroRadio) {
                    lojaOutroRadio.checked = false;
                }
            });
        });

        // Configurar evento para campo "Outro"
        const lojaOutroRadio = document.getElementById('loja-outro');
        const lojaOutroTexto = document.getElementById('loja-outro-texto');
        
        if (lojaOutroRadio && lojaOutroTexto) {
            lojaOutroRadio.addEventListener('change', () => {
                lojaOutroTexto.disabled = !lojaOutroRadio.checked;
                if (lojaOutroRadio.checked) {
                    csvLojaSelection.querySelectorAll('.loja-option').forEach(o => o.classList.remove('selected'));
                    lojaOutroTexto.focus();
                }
            });
        }

        console.log(`✅ ${lojas.length} lojas preenchidas no modal CSV`);
    }

    /**
     * Handle arquivo(s) CSV
     */
    handleArquivoCSV(event) {
        const files = Array.from(event.target.files);
        const btnProcessar = document.getElementById('btn-processar-csv');
        const arquivosSelecionados = document.getElementById('arquivos-selecionados');
        const listaArquivos = document.getElementById('lista-arquivos');

        // Filtrar apenas arquivos CSV
        const csvFiles = files.filter(file => {
            return file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv');
        });

        if (csvFiles.length > 0) {
            btnProcessar.disabled = false;
            this.arquivosCSV = csvFiles; // Array de arquivos
            
            // Mostrar lista de arquivos selecionados
            if (arquivosSelecionados && listaArquivos) {
                listaArquivos.innerHTML = csvFiles.map((file, index) => {
                    const tamanho = (file.size / 1024).toFixed(2);
                    return `
                        <li class="small">
                            <i class="bi bi-file-earmark-spreadsheet text-primary"></i>
                            ${file.name} <span class="text-muted">(${tamanho} KB)</span>
                        </li>
                    `;
                }).join('');
                arquivosSelecionados.style.display = 'block';
            }

            if (csvFiles.length > 1) {
                this.mostrarNotificacao(`✅ ${csvFiles.length} arquivos CSV selecionados. Serão processados em sequência.`, 'info');
            }
        } else {
            btnProcessar.disabled = true;
            this.arquivosCSV = [];
            if (arquivosSelecionados) {
                arquivosSelecionados.style.display = 'none';
            }
            this.mostrarNotificacao('⚠️ Selecione pelo menos um arquivo CSV válido', 'aviso');
        }
    }

    /**
     * Processar um único arquivo CSV
     */
    async processarArquivoCSV(arquivo, lojaValor, indiceArquivo, totalArquivos, onProgress = null) {
        const text = await arquivo.text();
        const csvData = this.parseCSV(text);

        if (csvData.length === 0) {
            return {
                arquivo: arquivo.name,
                sucesso: false,
                produtos: [],
                erros: [`Arquivo ${arquivo.name} não contém dados válidos`]
            };
        }

        // Converter CSV para produtos e salvar no Supabase
        const produtos = [];
        const erros = [];
        let imagensExtraidas = 0;
        let imagensPlaceholder = 0;

        for (let i = 0; i < csvData.length; i++) {
            try {
                // Atualizar progresso
                if (onProgress) {
                    onProgress({
                        arquivoAtual: indiceArquivo + 1,
                        totalArquivos: totalArquivos,
                        produtoAtual: i + 1,
                        totalProdutos: csvData.length,
                        nomeArquivo: arquivo.name,
                        produtosProcessados: produtos.length,
                        imagensExtraidas: imagensExtraidas,
                        status: 'Processando produto...'
                    });
                }

                const row = csvData[i];
                const produto = this.converterCSVParaProduto(row, lojaValor, 'geral', i);
                
                if (produto) {
                    // Extrair imagem automaticamente se não tiver imagem no CSV E se a opção estiver habilitada
                    const extrairImagensAuto = document.getElementById('extrair-imagens-auto')?.checked !== false;
                    
                    if ((!produto.imagem || produto.imagem.length === 0) && extrairImagensAuto) {
                        try {
                            // Atualizar status para extração de imagem
                            if (onProgress) {
                                onProgress({
                                    arquivoAtual: indiceArquivo + 1,
                                    totalArquivos: totalArquivos,
                                    produtoAtual: i + 1,
                                    totalProdutos: csvData.length,
                                    nomeArquivo: arquivo.name,
                                    produtosProcessados: produtos.length,
                                    imagensExtraidas: imagensExtraidas,
                                    status: `🔍 Extraindo imagem do produto ${i + 1}...`
                                });
                            }

                            // Delay maior para não sobrecarregar (scraping pode ser lento)
                            if (i > 0) {
                                await new Promise(resolve => setTimeout(resolve, 1000)); // 1 segundo de delay
                            }
                            
                            // Timeout de 10 segundos para extração de imagem
                            const imagemPromise = this.extrairImagemProduto(produto.url, produto.titulo);
                            const timeoutPromise = new Promise((_, reject) => 
                                setTimeout(() => reject(new Error('Timeout')), 10000)
                            );
                            
                            const imagemUrl = await Promise.race([imagemPromise, timeoutPromise]);
                            
                            if (imagemUrl) {
                                produto.imagem = [imagemUrl];
                                imagensExtraidas++;
                                console.log(`✅ Imagem extraída para produto ${i + 1}/${csvData.length}: ${produto.titulo.substring(0, 50)}...`);
                            } else {
                                // Usar placeholder se não conseguir extrair
                                produto.imagem = ['https://via.placeholder.com/300x300?text=Sem+Imagem'];
                                imagensPlaceholder++;
                                console.log(`⚠️ Imagem não encontrada para produto ${i + 1}/${csvData.length}, usando placeholder`);
                            }
                        } catch (imgError) {
                            console.warn(`⚠️ Erro ao extrair imagem para produto ${i + 1}:`, imgError.message || imgError);
                            produto.imagem = ['https://via.placeholder.com/300x300?text=Sem+Imagem'];
                            imagensPlaceholder++;
                        }
                    } else if (!produto.imagem || produto.imagem.length === 0) {
                        // Se extração automática estiver desabilitada, usar placeholder
                        produto.imagem = ['https://via.placeholder.com/300x300?text=Sem+Imagem'];
                        imagensPlaceholder++;
                    }
                    
                    // Verificar se produto já existe
                    const { data: existente } = await this.supabase
                        .from('produtos')
                        .select('codigo')
                        .eq('codigo', produto.codigo)
                        .single();

                    if (!existente) {
                        // Inserir novo produto
                        const { error } = await this.supabase
                            .from('produtos')
                            .insert(produto);

                        if (error) {
                            erros.push(`Linha ${i + 1}: ${error.message}`);
                        } else {
                            produtos.push(produto);
                        }
                    } else {
                        erros.push(`Linha ${i + 1}: Produto ${produto.codigo} já existe`);
                    }
                }
            } catch (error) {
                erros.push(`Linha ${i + 1}: ${error.message}`);
            }
        }

        return {
            arquivo: arquivo.name,
            sucesso: produtos.length > 0,
            produtos: produtos,
            erros: erros,
            imagensExtraidas: imagensExtraidas,
            imagensPlaceholder: imagensPlaceholder
        };
    }

    /**
     * Processar múltiplos CSVs em sequência
     */
    async processarCSV() {
        if (!this.arquivosCSV || this.arquivosCSV.length === 0) {
            this.mostrarNotificacao('⚠️ Selecione pelo menos um arquivo CSV primeiro', 'aviso');
            return;
        }

        if (!this.supabase) {
            this.mostrarNotificacao('❌ Supabase não inicializado', 'erro');
            return;
        }

        // Obter loja selecionada
        const lojaSelecionada = document.querySelector('input[name="loja"]:checked');
        let lojaValor = '';
        
        if (lojaSelecionada) {
            lojaValor = lojaSelecionada.value;
            
            // Se for "outro", pegar o valor do campo de texto
            if (lojaValor === 'outro') {
                const outroTexto = document.getElementById('loja-outro-texto');
                lojaValor = outroTexto?.value.trim() || 'outros';
                
                if (!lojaValor || lojaValor === 'outros') {
                    this.mostrarNotificacao('⚠️ Digite o nome da loja no campo "Outro"', 'aviso');
                    return;
                }
            }
        } else {
            this.mostrarNotificacao('⚠️ Selecione uma loja para importação', 'aviso');
            return;
        }

        // Desabilitar botão durante processamento
        const btnProcessar = document.getElementById('btn-processar-csv');
        const progressBar = document.getElementById('progress-bar');
        const progressStatus = document.getElementById('progress-status');
        const resultadoDiv = document.getElementById('resultado-importacao');

        btnProcessar.disabled = true;
        if (progressBar) progressBar.style.display = 'block';
        if (progressStatus) progressStatus.style.display = 'block';
        if (resultadoDiv) resultadoDiv.innerHTML = '';

        try {
            const totalArquivos = this.arquivosCSV.length;
            const resultados = [];
            let totalProdutos = 0;
            let totalErros = 0;
            let totalImagensExtraidas = 0;
            let totalImagensPlaceholder = 0;

            // Função de callback para atualizar progresso
            const atualizarProgresso = (info) => {
                // Calcular progresso geral
                // Progresso do arquivo anterior (0 a 100%)
                const progressoArquivoAnterior = ((info.arquivoAtual - 1) / info.totalArquivos) * 100;
                // Progresso dentro do arquivo atual (0 a 100% do arquivo atual)
                const progressoNoArquivo = (info.produtoAtual / info.totalProdutos) * 100;
                // Progresso do arquivo atual no total geral
                const progressoArquivoAtual = (progressoNoArquivo / info.totalArquivos);
                // Progresso total
                const progressoTotal = progressoArquivoAnterior + progressoArquivoAtual;

                // Atualizar barra de progresso
                if (progressBar) {
                    const porcentagem = Math.min(100, Math.max(0, progressoTotal.toFixed(1)));
                    const progressBarElement = progressBar.querySelector('.progress-bar');
                    progressBarElement.style.width = `${porcentagem}%`;
                    progressBarElement.textContent = `${porcentagem}%`;
                }

                // Atualizar status detalhado
                if (progressStatus) {
                    let statusText = `📁 Arquivo ${info.arquivoAtual}/${info.totalArquivos}: ${info.nomeArquivo}<br>`;
                    statusText += `📦 Produto ${info.produtoAtual}/${info.totalProdutos}<br>`;
                    statusText += `✅ Processados: ${info.produtosProcessados} | 🖼️ Imagens extraídas: ${info.imagensExtraidas}<br>`;
                    statusText += `⏳ ${info.status}`;
                    progressStatus.innerHTML = statusText;
                }
            };

            // Processar cada arquivo sequencialmente
            for (let i = 0; i < totalArquivos; i++) {
                const arquivo = this.arquivosCSV[i];
                
                // Processar arquivo com callback de progresso
                const resultado = await this.processarArquivoCSV(arquivo, lojaValor, i, totalArquivos, atualizarProgresso);
                resultados.push(resultado);
                
                totalProdutos += resultado.produtos.length;
                totalErros += resultado.erros.length;
                totalImagensExtraidas += (resultado.imagensExtraidas || 0);
                totalImagensPlaceholder += (resultado.imagensPlaceholder || 0);

                // Log do resultado
                console.log(`📄 Arquivo ${i + 1}/${totalArquivos} (${arquivo.name}): ${resultado.produtos.length} produtos importados, ${resultado.imagensExtraidas || 0} imagens extraídas, ${resultado.erros.length} erros`);
            }

            // Atualizar barra de progresso para 100%
            if (progressBar) {
                progressBar.querySelector('.progress-bar').style.width = '100%';
                progressBar.querySelector('.progress-bar').textContent = '100%';
            }

            // Atualizar barra de progresso para 100%
            if (progressBar) {
                const progressBarElement = progressBar.querySelector('.progress-bar');
                progressBarElement.style.width = '100%';
                progressBarElement.textContent = '100%';
                progressBarElement.classList.remove('progress-bar-animated');
            }

            // Mostrar resultados
            if (resultadoDiv) {
                let html = '<div class="alert alert-success"><h6><i class="bi bi-check-circle"></i> Resultado da Importação</h6>';
                
                html += `<p><strong>📁 Total de arquivos:</strong> ${totalArquivos}</p>`;
                html += `<p><strong>📦 Total de produtos importados:</strong> ${totalProdutos}</p>`;
                html += `<p><strong>🖼️ Imagens extraídas automaticamente:</strong> ${totalImagensExtraidas}</p>`;
                html += `<p><strong>⚠️ Imagens placeholder (não encontradas):</strong> ${totalImagensPlaceholder}</p>`;
                html += `<p><strong>❌ Total de erros:</strong> ${totalErros}</p>`;
                
                html += '<hr><h6>Detalhes por arquivo:</h6><ul class="mb-0">';
                
                resultados.forEach((resultado, index) => {
                    const statusIcon = resultado.sucesso ? '✅' : '❌';
                    const statusClass = resultado.sucesso ? 'text-success' : 'text-danger';
                    html += `
                        <li class="${statusClass}">
                            ${statusIcon} <strong>${resultado.arquivo}</strong>
                            <ul class="small">
                                <li>📦 Produtos importados: ${resultado.produtos.length}</li>
                                <li>🖼️ Imagens extraídas: ${resultado.imagensExtraidas || 0}</li>
                                <li>⚠️ Placeholders: ${resultado.imagensPlaceholder || 0}</li>
                                <li>❌ Erros: ${resultado.erros.length}</li>
                            </ul>
                        </li>
                    `;
                });
                
                html += '</ul></div>';
                resultadoDiv.innerHTML = html;
            }

            // Atualizar status final
            if (progressStatus) {
                progressStatus.innerHTML = `✅ <strong>Importação concluída!</strong> ${totalProdutos} produtos importados, ${totalImagensExtraidas} imagens extraídas.`;
            }

            // Mostrar notificação final
            if (totalProdutos > 0) {
                this.mostrarNotificacao(
                    `✅ Importação concluída! ${totalProdutos} produtos importados, ${totalImagensExtraidas} imagens extraídas automaticamente.`,
                    'sucesso'
                );
            } else {
                this.mostrarNotificacao(
                    `⚠️ Nenhum produto foi importado. Verifique os arquivos CSV.`,
                    'aviso'
                );
            }

            if (totalErros > 0) {
                console.warn('Erros durante importação:', resultados.flatMap(r => r.erros));
            }

            // Recarregar produtos
            await this.carregarProdutos();
            this.renderizarLista();

            // Limpar arquivos selecionados
            this.arquivosCSV = [];
            const inputArquivo = document.getElementById('arquivo-csv');
            if (inputArquivo) {
                inputArquivo.value = '';
            }
            const arquivosSelecionados = document.getElementById('arquivos-selecionados');
            if (arquivosSelecionados) {
                arquivosSelecionados.style.display = 'none';
            }

            // Reabilitar botão (mas manter modal aberto para ver resultados)
            btnProcessar.disabled = false;
            
            // Não fechar modal automaticamente - usuário pode fechar manualmente após ver resultados

        } catch (error) {
            console.error('Erro ao processar CSV:', error);
            
            if (progressStatus) {
                progressStatus.textContent = `❌ Erro: ${error.message}`;
            }
            
            // Verificar se é erro de JSON parsing
            if (error.message.includes('Unexpected token')) {
                this.mostrarNotificacao('❌ Erro: Resposta inválida do servidor. Verifique a conexão com o Supabase.', 'erro');
            } else {
                this.mostrarNotificacao(`❌ Erro: ${error.message}`, 'erro');
            }
            
            // Reabilitar botão
            btnProcessar.disabled = false;
        } finally {
            // Ocultar barra de progresso após 5 segundos (mais tempo para ver o resultado)
            setTimeout(() => {
                if (progressBar) {
                    progressBar.style.display = 'none';
                    // Resetar animação para próxima importação
                    const progressBarElement = progressBar.querySelector('.progress-bar');
                    if (progressBarElement) {
                        progressBarElement.classList.add('progress-bar-animated');
                        progressBarElement.style.width = '0%';
                        progressBarElement.textContent = '0%';
                    }
                }
                // Não ocultar status - deixar visível para o usuário ver o resultado
            }, 5000);
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

            // Validar se tem dados mínimos
            // Formato Shopee: Item Id ou Item Name + Offer Link
            // Formato genérico: Item Name + Offer Link
            const temItemName = row['Item Name'] || row['Product Name'];
            const temOfferLink = row['Offer Link'] || row['Product Link'] || row['URL'];
            const temItemId = row['Item Id'] || row['Item ID'] || row['Product ID'];
            
            if ((temItemName && temOfferLink) || (temItemId && temOfferLink)) {
                csvData.push(row);
            }
        }

        return csvData;
    }

    /**
     * Parse vendas do Mercado Livre (formato: "| +50mil vendidos", "| +1M vendidos", etc.)
     */
    parseVendasMercadoLivre(vendasStr) {
        if (!vendasStr || typeof vendasStr !== 'string') {
            return '0 vendas';
        }

        // Remover espaços e caracteres especiais
        let texto = vendasStr.trim();
        
        // Verificar se é formato do Mercado Livre (começa com "| +")
        if (texto.startsWith('| +') || texto.startsWith('|+')) {
            // Remover "| +" ou "|+"
            texto = texto.replace(/^\|\s*\+\s*/, '');
            
            // Extrair número e unidade (mil, M, etc.)
            const match = texto.match(/^(\d+(?:[.,]\d+)?)\s*(mil|M|milhão|milhões|k|K)?/i);
            
            if (match) {
                const numero = parseFloat(match[1].replace(',', '.'));
                const unidade = (match[2] || '').toLowerCase();
                
                let totalVendas = 0;
                
                if (unidade === 'm' || unidade === 'milhão' || unidade === 'milhões') {
                    totalVendas = numero * 1000000;
                } else if (unidade === 'mil' || unidade === 'k') {
                    totalVendas = numero * 1000;
                } else {
                    totalVendas = numero;
                }
                
                // Formatar para exibição
                if (totalVendas >= 1000000) {
                    const milhoes = (totalVendas / 1000000).toFixed(1);
                    return `${milhoes.replace('.0', '')}M vendidos`;
                } else if (totalVendas >= 1000) {
                    const milhares = (totalVendas / 1000).toFixed(0);
                    return `${milhares}mil vendidos`;
                } else {
                    return `${totalVendas} vendidos`;
                }
            }
        }
        
        // Se não for formato Mercado Livre, tentar extrair número simples
        const numeroMatch = vendasStr.match(/(\d+)/);
        if (numeroMatch) {
            const numero = parseInt(numeroMatch[1]);
            return `${numero} vendas`;
        }
        
        // Se já tem "venda" no texto, usar como está
        if (vendasStr.toLowerCase().includes('venda')) {
            return vendasStr;
        }
        
        return '0 vendas';
    }

    /**
     * Converter linha CSV para objeto produto
     */
    converterCSVParaProduto(csvRow, lojaSelecionada, categoriaPadrao = 'geral', indice = 0) {
        // Detectar formato Shopee padrão: Item Id,Item Name,Price,Sales,Shop Name,Commission Rate,Commission,Product Link,Offer Link
        const isFormatoShopee = csvRow.hasOwnProperty('Item Id') || csvRow.hasOwnProperty('Item ID') || 
                                (csvRow.hasOwnProperty('Item Name') && csvRow.hasOwnProperty('Shop Name'));
        
        let codigo, loja, preco, vendas, titulo, url;
        
        if (isFormatoShopee && lojaSelecionada === 'Shopee') {
            // Formato Shopee padrão
            codigo = csvRow['Item Id'] || csvRow['Item ID'] || csvRow['Product ID'] || '';
            
            // Se não tem Item Id, usar últimos caracteres do Offer Link
            if (!codigo) {
                const offerLink = csvRow['Offer Link'] || '';
                if (offerLink.length >= 10) {
                    codigo = offerLink.slice(-10).replace(/[^a-zA-Z0-9]/g, '');
                } else {
                    codigo = `${Date.now()}-${indice}`;
                }
            } else {
                // Usar código puro (sem prefixo)
                codigo = codigo.toString().trim();
            }
            
            loja = csvRow['Shop Name'] ? csvRow['Shop Name'].trim() : 'Shopee';
            
            // Preço no formato "R$ 139,99" ou "139,99" (vírgula como separador decimal)
            const precoStr = csvRow['Price'] || '0';
            // Remover R$, aspas, espaços, pontos (separadores de milhar) e substituir vírgula por ponto
            let precoLimpo = precoStr.toString()
                .replace(/R\$\s*/gi, '') // Remove R$ e espaços após
                .replace(/["\s]/g, '') // Remove aspas e espaços
                .replace(/\./g, '') // Remove pontos (separadores de milhar)
                .replace(',', '.'); // Substitui vírgula por ponto (separador decimal)
            preco = parseFloat(precoLimpo) || 0;
            
            console.log(`💰 Preço extraído para produto ${indice}:`, {
                'original': precoStr,
                'limpo': precoLimpo,
                'final': preco
            });
            
            // Vendas como número (ex: 336)
            const salesNum = parseInt(csvRow['Sales']) || 0;
            vendas = salesNum > 0 ? `${salesNum} vendas` : '0 vendas';
            
            titulo = csvRow['Item Name'] || `Produto ${codigo}`;
            url = csvRow['Offer Link'] || csvRow['Product Link'] || '#';
            
            // Verificar se tem imagem no CSV (alguns CSVs da Shopee podem ter)
            // Aceitar tanto maiúsculas quanto minúsculas
            const imagemCSV = csvRow['Image'] || csvRow['Imagem'] || csvRow['image'] || csvRow['imagem'] || 
                             csvRow['Image URL'] || csvRow['ImageUrl'] || csvRow['image url'] || csvRow['imageurl'] ||
                             csvRow['Product Image'] || csvRow['Imagem URL'] || csvRow['Images'] || csvRow['Imagens'] || 
                             csvRow['images'] || csvRow['imagens'] || '';
            
            console.log(`🔍 Buscando imagem no CSV para produto ${indice}:`, {
                'Image': csvRow['Image'],
                'Imagem': csvRow['Imagem'],
                'image': csvRow['image'],
                'imagem': csvRow['imagem'],
                'encontrado': imagemCSV
            });
            
            // Extrair imagens (suporta múltiplas)
            let imagens = [];
            if (imagemCSV && imagemCSV.trim() && !imagemCSV.includes('placeholder')) {
                imagens = imagemCSV.split(/[,;\n]/)
                    .map(img => img.trim())
                    .filter(img => img && img.length > 0 && img.startsWith('http'));
                console.log(`✅ ${imagens.length} imagem(ns) encontrada(s) no CSV:`, imagens);
            } else {
                console.log(`⚠️ Nenhuma imagem encontrada no CSV para produto ${indice}`);
            }
            
            // Extrair categorias do CSV (aceitar maiúsculas e minúsculas)
            const categorias = [];
            const categoriaCSV = csvRow['Category'] || csvRow['Categoria'] || csvRow['category'] || csvRow['categoria'] ||
                                csvRow['Categories'] || csvRow['Categorias'] || csvRow['categories'] || csvRow['categorias'] || '';
            if (categoriaCSV && categoriaCSV.trim()) {
                const categoriasArray = categoriaCSV.split(/[,;]/).map(cat => cat.trim().toLowerCase()).filter(cat => cat);
                categorias.push(...categoriasArray);
            }
            categorias.push('shopee');
            if (categoriaPadrao && !categorias.includes(categoriaPadrao)) {
                categorias.push(categoriaPadrao);
            }
            if (categorias.length === 0) {
                categorias.push('geral');
            }
            
            // Verificar se tem muitas vendas para adicionar categoria destaque
            const vendasNum = parseInt(csvRow['Sales']) || 0;
            if (vendasNum > 1000 || vendas.includes('mil+') || vendas.includes('k') || vendas.includes('K')) {
                if (!categorias.includes('destaque')) {
                    categorias.push('destaque');
                }
            }
            
            // Extrair descrição do CSV
            const descricaoCSV = csvRow['Description'] || csvRow['Descrição'] || csvRow['Descricao'] || '';
            const descricao = descricaoCSV && descricaoCSV.trim() 
                ? descricaoCSV.trim() 
                : `${titulo}. Vendido por ${loja}. ${vendas}.`;
            
            // Extrair status ativo e favorito
            const ativoCSV = csvRow['Active'] || csvRow['Ativo'] || csvRow['Status'] || '';
            let ativo = true;
            if (ativoCSV) {
                const ativoStr = ativoCSV.toString().toLowerCase().trim();
                ativo = ativoStr === 'true' || ativoStr === '1' || ativoStr === 'sim' || ativoStr === 's' || ativoStr === 'ativo' || ativoStr === 'yes';
            }
            
            const favoritoCSV = csvRow['Favorite'] || csvRow['Favorito'] || csvRow['Favourite'] || '';
            let favorito = false;
            if (favoritoCSV) {
                const favoritoStr = favoritoCSV.toString().toLowerCase().trim();
                favorito = favoritoStr === 'true' || favoritoStr === '1' || favoritoStr === 'sim' || favoritoStr === 's' || favoritoStr === 'favorito' || favoritoStr === 'yes';
            }
            
            // Retornar produto completo (com ou sem imagem)
            return {
                codigo: codigo,
                ativo: ativo,
                titulo: titulo,
                descricao: descricao,
                url: url,
                imagem: imagens.length > 0 ? imagens : [],
                categorias: categorias,
                favorito: favorito,
                loja: loja,
                preco: preco,
                vendas: vendas
            };
            
        } else {
            // Formato genérico (outras lojas ou formato antigo)
            codigo = csvRow['Product ID'] || csvRow['Item ID'] || csvRow['Item Id'] || `CSV-${Date.now()}-${indice}`;
            
            // Se não tem código, usar últimos caracteres da URL
            if (!codigo || codigo === `CSV-${Date.now()}-${indice}`) {
                const urlTemp = csvRow['Offer Link'] || csvRow['Product Link'] || '';
                if (urlTemp.length >= 10) {
                    codigo = urlTemp.slice(-10).replace(/[^a-zA-Z0-9]/g, '');
                }
            }
            
            // Limpar e normalizar código
            codigo = codigo.toString().trim().replace(/\s+/g, '-').toLowerCase();
            
            // Extrair loja
            loja = lojaSelecionada || csvRow['Store'] || csvRow['Shop Name'] || 'outros';
            
            // Extrair preço (formato genérico)
            const precoStr = csvRow['Price'] || csvRow['Original Price'] || csvRow['Sale Price'] || '0';
            // Remover R$, aspas, espaços, pontos (separadores de milhar) e substituir vírgula por ponto
            let precoLimpo = precoStr.toString()
                .replace(/R\$\s*/gi, '') // Remove R$ e espaços após
                .replace(/["\s]/g, '') // Remove aspas e espaços
                .replace(/\./g, '') // Remove pontos (separadores de milhar)
                .replace(',', '.'); // Substitui vírgula por ponto (separador decimal)
            preco = parseFloat(precoLimpo) || 0;
            
            // Extrair vendas (suporta formato "336 vendas", "336", "| +50mil vendidos", etc.)
            const vendasStr = csvRow['Sales'] || csvRow['Vendas'] || csvRow['sales'] || csvRow['vendas'] || '';
            
            // Verificar se é Mercado Livre para usar parser específico
            if (lojaSelecionada === 'Mercado Livre' || loja.toLowerCase().includes('mercado livre')) {
                vendas = this.parseVendasMercadoLivre(vendasStr);
            } else if (vendasStr) {
                // Tentar extrair número de vendas (formato genérico)
                const vendasMatch = vendasStr.toString().match(/(\d+)/);
                if (vendasMatch) {
                    const numeroVendas = parseInt(vendasMatch[1]);
                    vendas = `${numeroVendas} vendas`;
                } else if (vendasStr.toLowerCase().includes('venda')) {
                    // Se já tem "venda" no texto, usar como está
                    vendas = vendasStr;
                } else {
                    vendas = '0 vendas';
                }
            } else {
                vendas = '0 vendas';
            }
            
            console.log(`📊 Vendas extraídas para produto ${indice} (${loja}):`, {
                'original': vendasStr,
                'processado': vendas
            });
            
            titulo = csvRow['Item Name'] || csvRow['Product Name'] || `Produto ${codigo}`;
            url = csvRow['Offer Link'] || csvRow['Product Link'] || csvRow['URL'] || '#';
        }
        
        // Extrair categorias do CSV (suporta múltiplas categorias separadas por vírgula ou ponto e vírgula)
        const categorias = [];
        
        // Aceitar "Category", "Categoria", "Categories", "Categorias" (maiúsculas e minúsculas)
        const categoriaCSV = csvRow['Category'] || csvRow['Categoria'] || csvRow['category'] || csvRow['categoria'] ||
                            csvRow['Categories'] || csvRow['Categorias'] || csvRow['categories'] || csvRow['categorias'] || '';
        
        if (categoriaCSV && categoriaCSV.trim()) {
            // Separar por vírgula ou ponto e vírgula
            const categoriasArray = categoriaCSV.split(/[,;]/).map(cat => cat.trim().toLowerCase()).filter(cat => cat);
            categorias.push(...categoriasArray);
        }
        
        // Adicionar categoria padrão se não tiver nenhuma
        if (categoriaPadrao && !categorias.includes(categoriaPadrao)) {
            categorias.push(categoriaPadrao);
        }
        if (categorias.length === 0) {
            categorias.push('geral');
        }
        
        // Adicionar categoria shopee se for da Shopee
        if (loja.toLowerCase().includes('shopee') && !categorias.includes('shopee')) {
            categorias.push('shopee');
        }
        
        // Verificar se tem muitas vendas para adicionar categoria destaque
        const vendasNum = parseInt(vendas) || 0;
        if (vendasNum > 1000 || vendas.includes('mil+') || vendas.includes('k') || vendas.includes('K')) {
            if (!categorias.includes('destaque')) {
                categorias.push('destaque');
            }
        }
        
        // Extrair imagens do CSV (suporta múltiplas imagens separadas por vírgula, ponto e vírgula ou quebra de linha)
        let imagens = [];
        // Aceitar tanto maiúsculas quanto minúsculas
        const imagemCSV = csvRow['Image'] || csvRow['Imagem'] || csvRow['image'] || csvRow['imagem'] || 
                         csvRow['Image URL'] || csvRow['ImageUrl'] || csvRow['image url'] || csvRow['imageurl'] ||
                         csvRow['Product Image'] || csvRow['Imagem URL'] || csvRow['Images'] || csvRow['Imagens'] || 
                         csvRow['images'] || csvRow['imagens'] || '';
        
        if (imagemCSV && imagemCSV.trim() && !imagemCSV.includes('placeholder')) {
            // Separar por vírgula, ponto e vírgula ou quebra de linha
            imagens = imagemCSV.split(/[,;\n]/)
                .map(img => img.trim())
                .filter(img => img && img.length > 0 && img.startsWith('http'));
        }
        
        // Extrair descrição do CSV (se disponível)
        const descricaoCSV = csvRow['Description'] || csvRow['Descrição'] || csvRow['Descricao'] || '';
        const descricao = descricaoCSV && descricaoCSV.trim() 
            ? descricaoCSV.trim() 
            : `${titulo}. Vendido por ${loja}. ${vendas}.`;
        
        // Extrair status ativo do CSV (se disponível)
        const ativoCSV = csvRow['Active'] || csvRow['Ativo'] || csvRow['Status'] || '';
        let ativo = true; // Padrão é ativo
        if (ativoCSV) {
            const ativoStr = ativoCSV.toString().toLowerCase().trim();
            ativo = ativoStr === 'true' || ativoStr === '1' || ativoStr === 'sim' || ativoStr === 's' || ativoStr === 'ativo' || ativoStr === 'yes';
        }
        
        // Extrair favorito do CSV (se disponível)
        const favoritoCSV = csvRow['Favorite'] || csvRow['Favorito'] || csvRow['Favourite'] || '';
        let favorito = false; // Padrão é não favorito
        if (favoritoCSV) {
            const favoritoStr = favoritoCSV.toString().toLowerCase().trim();
            favorito = favoritoStr === 'true' || favoritoStr === '1' || favoritoStr === 'sim' || favoritoStr === 's' || favoritoStr === 'favorito' || favoritoStr === 'yes';
        }
        
        // Criar objeto produto
        const produto = {
            codigo: codigo,
            ativo: ativo,
            titulo: titulo,
            descricao: descricao,
            url: url,
            imagem: imagens.length > 0 ? imagens : [], // Usar imagens do CSV se disponíveis, senão array vazio
            categorias: categorias,
            favorito: favorito,
            loja: loja,
            preco: preco,
            vendas: vendas
        };
        
        return produto;
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

        const urls = imagemInput.value
            .split(/[\n,]/)
            .map(url => url.trim())
            .filter(url => url.length > 0 && url.startsWith('http'));

        if (urls.length === 0) {
            previewContainer.innerHTML = '<p class="text-muted text-center mb-0">Nenhuma imagem para visualizar</p>';
            return;
        }

        previewContainer.innerHTML = urls.map((url, index) => `
            <div class="preview-item">
                <img src="${url}" alt="Preview ${index + 1}" loading="lazy" onerror="this.src='https://via.placeholder.com/100x100/f0f4f8/94a3b8?text=Erro'">
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

            // Mostrar loading
            const btnSalvar = document.getElementById('btn-salvar');
            const textoOriginal = btnSalvar?.innerHTML;
            if (btnSalvar) {
                btnSalvar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Salvando...';
                btnSalvar.disabled = true;
            }

            // Determinar se é criação ou edição
            const metodo = this.modoEdicao ? 'PUT' : 'POST';

            await this.salvarProdutoAPI(dadosFormulario, metodo);

            // Fechar modal e limpar formulário
            const modalEl = document.getElementById('modalProduto');
            if (modalEl) {
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
            }
            
            this.limparFormulario();

        } catch (error) {
            console.error('Erro ao salvar produto:', error);
        } finally {
            // Restaurar botão
            const btnSalvar = document.getElementById('btn-salvar');
            if (btnSalvar) {
                btnSalvar.innerHTML = '<i class="bi bi-check-lg"></i> <span>Salvar Produto</span>';
                btnSalvar.disabled = false;
            }
        }
    }

    /**
     * Confirmar exclusão
     */
    async confirmarExclusao(codigo) {
        if (confirm(`Tem certeza que deseja excluir o produto "${codigo}"?\n\nEsta ação não pode ser desfeita.`)) {
            try {
                await this.excluirProdutoAPI(codigo);
                
                // Fechar modal se estiver aberto
                const modalEl = document.getElementById('modalProduto');
                if (modalEl) {
                    const modal = bootstrap.Modal.getInstance(modalEl);
                    if (modal) modal.hide();
                }
                
                this.limparFormulario();
            } catch (error) {
                console.error('Erro ao excluir:', error);
            }
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

        if (!container) {
            console.warn('⚠️ Container lista-produtos não encontrado');
            return;
        }

        console.log(`🎨 Renderizando ${produtos.length} produtos...`);

        if (produtos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-inbox"></i>
                    <h3>Nenhum produto encontrado</h3>
                    <p>Adicione produtos clicando em "Novo Produto" ou importe via CSV.</p>
                </div>
            `;
        } else {
            container.innerHTML = produtos.map(produto => this.templateItemLista(produto)).join('');
            this.configurarEventListenersLista();
        }
        
        // Atualizar estatísticas após renderizar
        this.atualizarEstatisticasDashboard();
    }

    /**
     * Atualiza as estatísticas do dashboard
     */
    atualizarEstatisticasDashboard() {
        try {
            const produtos = this.produtos || [];
            
            // Calcular estatísticas
            const stats = {
                total: produtos.length,
                ativos: produtos.filter(p => p.ativo !== false).length,
                inativos: produtos.filter(p => p.ativo === false).length,
                favoritos: produtos.filter(p => p.favorito === true).length,
                lojas: [...new Set(produtos.map(p => p.loja).filter(l => l && l.trim()))].length
            };
            
            // Atualizar elementos do DOM
            const updateEl = (id, value) => {
                const el = document.getElementById(id);
                if (el) el.textContent = value;
            };
            
            updateEl('total-produtos', stats.total);
            updateEl('produtos-ativos', stats.ativos);
            updateEl('produtos-favoritos', stats.favoritos);
            updateEl('total-lojas', stats.lojas);
            updateEl('nav-produtos-count', stats.total);
            
            console.log('📊 Dashboard atualizado:', stats);
            
            // Também chamar função global se existir
            if (typeof window.atualizarEstatisticas === 'function') {
                window.atualizarEstatisticas();
            }
            
        } catch (error) {
            console.error('Erro ao atualizar estatísticas:', error);
        }
    }

    /**
     * Template para item da lista
     */
    templateItemLista(produto) {
        const statusClass = produto.ativo ? 'active' : 'inactive';
        const statusText = produto.ativo ? 'Ativo' : 'Inativo';
        const statusIcon = produto.ativo ? 'bi-check-circle-fill' : 'bi-x-circle-fill';
        const itemClass = produto.ativo ? '' : 'inactive';

        return `
            <div class="product-item ${itemClass}" data-codigo="${produto.codigo}">
                <div class="product-checkbox">
                    <input type="checkbox" class="checkbox-produto" data-codigo="${produto.codigo}" onchange="adminManager.atualizarSelecao()">
                </div>
                <div class="product-image">
                    <img src="${produto.imagem?.[0] || 'https://via.placeholder.com/64x64/334155/94a3b8?text=Sem+Img'}" 
                         alt="${produto.titulo}" loading="lazy" onerror="this.src='https://via.placeholder.com/64x64/334155/94a3b8?text=Erro'">
                </div>
                <div class="product-info">
                    <div class="product-title">${produto.titulo}</div>
                    <div class="product-meta">
                        <span class="product-code"><i class="bi bi-hash"></i>${produto.codigo}</span>
                        <span><i class="bi bi-shop"></i>${produto.loja || 'N/A'}</span>
                        <span class="product-price"><i class="bi bi-tag"></i>R$ ${produto.preco?.toFixed(2) || '0.00'}</span>
                        ${produto.vendas ? `<span><i class="bi bi-graph-up"></i>${produto.vendas}</span>` : ''}
                    </div>
                </div>
                <div class="product-status">
                    <span class="status-badge ${statusClass}">
                        <i class="bi ${statusIcon}"></i>
                        ${statusText}
                    </span>
                </div>
                <div class="product-actions">
                    <button class="action-btn edit" onclick="adminManager.editarProduto('${produto.codigo}')" title="Editar produto">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="action-btn duplicate" onclick="adminManager.duplicarProduto('${produto.codigo}')" title="Duplicar produto">
                        <i class="bi bi-copy"></i>
                    </button>
                    <button class="action-btn delete" onclick="adminManager.confirmarExclusao('${produto.codigo}')" title="Excluir produto">
                        <i class="bi bi-trash-fill"></i>
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
        container.style.zIndex = '9999';
        container.style.maxWidth = '400px';
        document.body.appendChild(container);
        return container;
    }

    // Adicionar outras funções necessárias (validação, formulário, etc.)
    obterDadosFormulario() {
        const categoriasInput = document.getElementById('categorias')?.value || '';
        const categorias = categoriasInput
            .split(',')
            .map(c => c.trim().toLowerCase())
            .filter(c => c.length > 0);

        const imagemInput = document.getElementById('imagem')?.value || '';
        const imagens = imagemInput
            .split(/[\n,]/)
            .map(img => img.trim())
            .filter(img => img.length > 0 && img.startsWith('http'));

        return {
            codigo: document.getElementById('codigo')?.value?.trim() || '',
            ativo: document.getElementById('ativo')?.checked ?? true,
            titulo: document.getElementById('titulo')?.value?.trim() || '',
            descricao: document.getElementById('descricao')?.value?.trim() || '',
            url: document.getElementById('url')?.value?.trim() || '',
            imagem: imagens,
            categorias: categorias.length > 0 ? categorias : ['geral'],
            favorito: document.getElementById('favorito')?.checked ?? false,
            loja: document.getElementById('loja')?.value || '',
            preco: parseFloat(document.getElementById('preco')?.value) || 0,
            vendas: document.getElementById('vendas')?.value?.trim() || '0 vendas'
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

        // Atualizar UI do modal
        const tituloModal = document.getElementById('modal-titulo');
        const btnSalvar = document.getElementById('btn-salvar');
        const btnExcluir = document.getElementById('btn-excluir');
        
        if (tituloModal) tituloModal.textContent = 'Novo Produto';
        if (btnSalvar) btnSalvar.innerHTML = '<i class="bi bi-check-lg"></i> <span>Salvar Produto</span>';
        if (btnExcluir) btnExcluir.style.display = 'none';

        const modalEl = document.getElementById('modalProduto');
        if (modalEl) {
            const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.show();
        }
    }

    editarProduto(codigo) {
        const produto = this.produtos.find(p => p.codigo === codigo);
        if (!produto) {
            this.mostrarNotificacao('Produto não encontrado', 'erro');
            return;
        }

        this.modoEdicao = true;
        this.produtoEditando = produto;
        
        // Atualizar UI do modal
        const tituloModal = document.getElementById('modal-titulo');
        const btnSalvar = document.getElementById('btn-salvar');
        const btnExcluir = document.getElementById('btn-excluir');
        
        if (tituloModal) tituloModal.textContent = 'Editar Produto';
        if (btnSalvar) btnSalvar.innerHTML = '<i class="bi bi-check-lg"></i> <span>Atualizar Produto</span>';
        if (btnExcluir) btnExcluir.style.display = 'inline-flex';
        
        this.preencherFormulario(produto);

        const modalEl = document.getElementById('modalProduto');
        if (modalEl) {
            const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.show();
        }
    }

    duplicarProduto(codigo) {
        const produto = this.produtos.find(p => p.codigo === codigo);
        if (!produto) {
            this.mostrarNotificacao('Produto não encontrado', 'erro');
            return;
        }

        this.modoEdicao = false;
        this.produtoEditando = null;

        // Criar cópia do produto com novo código
        const novoProduto = { 
            ...produto,
            codigo: `${produto.codigo}_${Date.now().toString().slice(-6)}`,
            titulo: `${produto.titulo} (Cópia)`
        };

        // Atualizar UI do modal
        const tituloModal = document.getElementById('modal-titulo');
        const btnSalvar = document.getElementById('btn-salvar');
        const btnExcluir = document.getElementById('btn-excluir');
        
        if (tituloModal) tituloModal.textContent = 'Duplicar Produto';
        if (btnSalvar) btnSalvar.innerHTML = '<i class="bi bi-check-lg"></i> <span>Criar Cópia</span>';
        if (btnExcluir) btnExcluir.style.display = 'none';

        this.preencherFormulario(novoProduto);

        const modalEl = document.getElementById('modalProduto');
        if (modalEl) {
            const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.show();
        }
        
        this.mostrarNotificacao('Produto duplicado! Altere o código e salve.', 'info');
    }

    preencherFormulario(produto) {
        // Campos básicos
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val ?? '';
        };
        
        const setChecked = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.checked = val ?? false;
        };

        setVal('codigo', produto.codigo);
        setVal('titulo', produto.titulo);
        setVal('descricao', produto.descricao);
        setVal('url', produto.url);
        setVal('loja', produto.loja);
        setVal('preco', produto.preco);
        setVal('vendas', produto.vendas);
        
        // Imagens - juntar com quebra de linha
        const imagens = Array.isArray(produto.imagem) ? produto.imagem.join('\n') : (produto.imagem || '');
        setVal('imagem', imagens);
        
        // Categorias - juntar com vírgula
        const categorias = Array.isArray(produto.categorias) ? produto.categorias.join(', ') : (produto.categorias || '');
        setVal('categorias', categorias);
        
        // Checkboxes
        setChecked('ativo', produto.ativo !== false);
        setChecked('favorito', produto.favorito);

        // Atualizar contador de caracteres
        const descricaoEl = document.getElementById('descricao');
        const contadorEl = document.getElementById('contador-caracteres');
        if (descricaoEl && contadorEl) {
            contadorEl.textContent = `${descricaoEl.value.length} caracteres`;
        }

        // Atualizar preview de imagens
        this.atualizarPreviewImagens();
    }

    limparFormulario() {
        const form = document.getElementById('form-produto');
        if (form) {
            form.reset();
        }
        
        // Resetar estados
        this.modoEdicao = false;
        this.produtoEditando = null;
        
        // Limpar preview de imagens
        const previewContainer = document.getElementById('preview-imagens');
        if (previewContainer) {
            previewContainer.innerHTML = '<p class="text-muted text-center mb-0">Nenhuma imagem para visualizar</p>';
        }
        
        // Resetar contador
        const contador = document.getElementById('contador-caracteres');
        if (contador) {
            contador.textContent = '0 caracteres';
        }
        
        // Garantir checkbox ativo marcado por padrão
        const ativoCheckbox = document.getElementById('ativo');
        if (ativoCheckbox) {
            ativoCheckbox.checked = true;
        }
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
        // Contador de caracteres da descrição
        const descricaoInput = document.getElementById('descricao');
        const contadorCaracteres = document.getElementById('contador-caracteres');
        
        if (descricaoInput && contadorCaracteres) {
            descricaoInput.addEventListener('input', () => {
                const count = descricaoInput.value.length;
                contadorCaracteres.textContent = `${count} caracteres`;
            });
        }

        // Preview de imagens
        const imagemInput = document.getElementById('imagem');
        if (imagemInput) {
            imagemInput.addEventListener('input', () => {
                this.atualizarPreviewImagens();
            });
        }

        // Atualizar título do modal baseado no modo
        const modalProduto = document.getElementById('modalProduto');
        if (modalProduto) {
            modalProduto.addEventListener('show.bs.modal', () => {
                const tituloModal = document.getElementById('modal-titulo');
                const btnSalvar = document.getElementById('btn-salvar');
                const btnExcluir = document.getElementById('btn-excluir');
                
                if (this.modoEdicao) {
                    if (tituloModal) tituloModal.textContent = 'Editar Produto';
                    if (btnSalvar) btnSalvar.innerHTML = '<i class="bi bi-check-lg"></i> <span>Atualizar Produto</span>';
                    if (btnExcluir) btnExcluir.style.display = 'inline-flex';
                } else {
                    if (tituloModal) tituloModal.textContent = 'Novo Produto';
                    if (btnSalvar) btnSalvar.innerHTML = '<i class="bi bi-check-lg"></i> <span>Salvar Produto</span>';
                    if (btnExcluir) btnExcluir.style.display = 'none';
                }
            });
            
            // Limpar formulário ao fechar modal
            modalProduto.addEventListener('hidden.bs.modal', () => {
                if (!this.modoEdicao) {
                    this.limparFormulario();
                }
            });
        }

        // Botão excluir dentro do modal
        const btnExcluir = document.getElementById('btn-excluir');
        if (btnExcluir) {
            btnExcluir.addEventListener('click', () => {
                if (this.produtoEditando) {
                    this.confirmarExclusao(this.produtoEditando.codigo);
                }
            });
        }
    }

    /**
     * =============================================
     * SELEÇÃO EM MASSA DE PRODUTOS
     * =============================================
     */

    /**
     * Atualiza a seleção e mostra/esconde a barra de ações
     */
    atualizarSelecao() {
        const selecionados = this.obterProdutosSelecionados();
        const barraAcoes = document.getElementById('barra-acoes-massa');
        const contador = document.getElementById('contador-selecionados');
        const checkboxTodos = document.getElementById('selecionar-todos');

        if (contador) {
            contador.textContent = `${selecionados.length} produto${selecionados.length !== 1 ? 's' : ''} selecionado${selecionados.length !== 1 ? 's' : ''}`;
        }

        if (barraAcoes) {
            if (selecionados.length > 0) {
                barraAcoes.classList.add('show');
            } else {
                barraAcoes.classList.remove('show');
            }
        }

        // Atualizar checkbox "selecionar todos"
        if (checkboxTodos) {
            const totalCheckboxes = document.querySelectorAll('.checkbox-produto').length;
            checkboxTodos.checked = selecionados.length === totalCheckboxes && totalCheckboxes > 0;
            checkboxTodos.indeterminate = selecionados.length > 0 && selecionados.length < totalCheckboxes;
        }
    }

    /**
     * Seleciona ou deseleciona todos os produtos
     */
    toggleSelecionarTodos() {
        const checkboxTodos = document.getElementById('selecionar-todos');
        const checkboxes = document.querySelectorAll('.checkbox-produto');
        
        if (!checkboxTodos) return;

        checkboxes.forEach(checkbox => {
            checkbox.checked = checkboxTodos.checked;
        });

        this.atualizarSelecao();
    }

    /**
     * Limpa todas as seleções
     */
    limparSelecao() {
        const checkboxes = document.querySelectorAll('.checkbox-produto');
        const checkboxTodos = document.getElementById('selecionar-todos');
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        if (checkboxTodos) {
            checkboxTodos.checked = false;
            checkboxTodos.indeterminate = false;
        }

        this.atualizarSelecao();
    }

    /**
     * Retorna array com códigos dos produtos selecionados
     */
    obterProdutosSelecionados() {
        const checkboxes = document.querySelectorAll('.checkbox-produto:checked');
        return Array.from(checkboxes).map(cb => cb.dataset.codigo);
    }

    /**
     * Abre modal para edição em massa
     */
    abrirModalEdicaoMassa() {
        const selecionados = this.obterProdutosSelecionados();
        
        if (selecionados.length === 0) {
            this.mostrarNotificacao('⚠️ Selecione pelo menos um produto', 'aviso');
            return;
        }

        // Criar modal dinamicamente
        const modalHTML = `
            <div class="modal fade" id="modalEdicaoMassa" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="bi bi-pencil-square"></i>
                                Editar ${selecionados.length} Produto${selecionados.length !== 1 ? 's' : ''} em Massa
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p class="text-muted mb-3">Alterações serão aplicadas a todos os produtos selecionados.</p>
                            
                            <div class="form-group mb-3">
                                <label><i class="bi bi-shop"></i> Loja</label>
                                <select id="edicao-massa-loja" class="form-control">
                                    <option value="">-- Não alterar --</option>
                                    ${this.obterOpcoesLojas().map(loja => `<option value="${loja}">${loja}</option>`).join('')}
                                </select>
                            </div>

                            <div class="form-group mb-3">
                                <label><i class="bi bi-tags"></i> Categorias (separadas por vírgula)</label>
                                <input type="text" id="edicao-massa-categorias" class="form-control" placeholder="Ex: casa, decoração, destaque">
                                <small class="text-muted">Deixe vazio para não alterar. Use vírgula para múltiplas categorias.</small>
                            </div>

                            <div class="form-group mb-3">
                                <label><i class="bi bi-toggle-on"></i> Status</label>
                                <select id="edicao-massa-ativo" class="form-control">
                                    <option value="">-- Não alterar --</option>
                                    <option value="true">Ativo</option>
                                    <option value="false">Inativo</option>
                                </select>
                            </div>

                            <div class="form-group mb-3">
                                <label><i class="bi bi-heart"></i> Favorito</label>
                                <select id="edicao-massa-favorito" class="form-control">
                                    <option value="">-- Não alterar --</option>
                                    <option value="true">Sim</option>
                                    <option value="false">Não</option>
                                </select>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" onclick="adminManager.aplicarEdicaoMassa()">
                                <i class="bi bi-check-lg"></i> Aplicar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remover modal anterior se existir
        const modalAnterior = document.getElementById('modalEdicaoMassa');
        if (modalAnterior) {
            modalAnterior.remove();
        }

        // Adicionar modal ao body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Abrir modal
        const modal = new bootstrap.Modal(document.getElementById('modalEdicaoMassa'));
        modal.show();
    }

    /**
     * Aplica edições em massa
     */
    async aplicarEdicaoMassa() {
        const selecionados = this.obterProdutosSelecionados();
        
        if (selecionados.length === 0) {
            this.mostrarNotificacao('⚠️ Nenhum produto selecionado', 'aviso');
            return;
        }

        const loja = document.getElementById('edicao-massa-loja')?.value;
        const categorias = document.getElementById('edicao-massa-categorias')?.value;
        const ativo = document.getElementById('edicao-massa-ativo')?.value;
        const favorito = document.getElementById('edicao-massa-favorito')?.value;

        // Preparar dados de atualização
        const atualizacoes = {};
        if (loja) atualizacoes.loja = loja;
        if (categorias) {
            atualizacoes.categorias = categorias.split(',').map(c => c.trim().toLowerCase()).filter(c => c);
        }
        if (ativo !== '') atualizacoes.ativo = ativo === 'true';
        if (favorito !== '') atualizacoes.favorito = favorito === 'true';

        if (Object.keys(atualizacoes).length === 0) {
            this.mostrarNotificacao('⚠️ Selecione pelo menos um campo para alterar', 'aviso');
            return;
        }

        // Confirmar ação
        if (!confirm(`Deseja aplicar essas alterações em ${selecionados.length} produto(s)?`)) {
            return;
        }

        this.mostrarNotificacao('⏳ Aplicando alterações...', 'info');

        try {
            let sucesso = 0;
            let erros = 0;

            for (const codigo of selecionados) {
                try {
                    // Buscar produto atual
                    const produto = this.produtos.find(p => p.codigo === codigo);
                    if (!produto) continue;

                    // Preparar dados atualizados
                    const dadosAtualizados = {
                        ...produto,
                        ...atualizacoes
                    };

                    // Atualizar no Supabase
                    const { error } = await this.supabase
                        .from('produtos')
                        .update(dadosAtualizados)
                        .eq('codigo', codigo);

                    if (error) throw error;
                    sucesso++;
                } catch (error) {
                    console.error(`Erro ao atualizar produto ${codigo}:`, error);
                    erros++;
                }
            }

            // Fechar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalEdicaoMassa'));
            if (modal) modal.hide();

            // Limpar seleção
            this.limparSelecao();

            // Recarregar lista
            await this.carregarProdutos();
            this.renderizarLista();

            // Mostrar resultado
            if (erros === 0) {
                this.mostrarNotificacao(`✅ ${sucesso} produto(s) atualizado(s) com sucesso!`, 'sucesso');
            } else {
                this.mostrarNotificacao(`⚠️ ${sucesso} atualizado(s), ${erros} erro(s)`, 'aviso');
            }
        } catch (error) {
            console.error('Erro na edição em massa:', error);
            this.mostrarNotificacao('❌ Erro ao aplicar alterações', 'erro');
        }
    }

    /**
     * Confirma e exclui produtos selecionados
     */
    async confirmarExclusaoMassa() {
        const selecionados = this.obterProdutosSelecionados();
        
        if (selecionados.length === 0) {
            this.mostrarNotificacao('⚠️ Nenhum produto selecionado', 'aviso');
            return;
        }

        if (!confirm(`Tem certeza que deseja excluir ${selecionados.length} produto(s)?\n\nEsta ação não pode ser desfeita!`)) {
            return;
        }

        this.mostrarNotificacao('⏳ Excluindo produtos...', 'info');

        try {
            let sucesso = 0;
            let erros = 0;

            for (const codigo of selecionados) {
                try {
                    const { error } = await this.supabase
                        .from('produtos')
                        .delete()
                        .eq('codigo', codigo);

                    if (error) throw error;
                    sucesso++;
                } catch (error) {
                    console.error(`Erro ao excluir produto ${codigo}:`, error);
                    erros++;
                }
            }

            // Limpar seleção
            this.limparSelecao();

            // Recarregar lista
            await this.carregarProdutos();
            this.renderizarLista();

            // Mostrar resultado
            if (erros === 0) {
                this.mostrarNotificacao(`✅ ${sucesso} produto(s) excluído(s) com sucesso!`, 'sucesso');
            } else {
                this.mostrarNotificacao(`⚠️ ${sucesso} excluído(s), ${erros} erro(s)`, 'aviso');
            }
        } catch (error) {
            console.error('Erro na exclusão em massa:', error);
            this.mostrarNotificacao('❌ Erro ao excluir produtos', 'erro');
        }
    }

    /**
     * Retorna opções de lojas para o select
     */
    obterOpcoesLojas() {
        return [
            'Shopee',
            'Mercado Livre',
            'Amazon',
            'AliExpress',
            'Magazine Luiza',
            'Americanas',
            'Casas Bahia',
            'Submarino',
            'Extra',
            'Ponto Frio',
            'outros'
        ];
    }

    /**
     * Retorna estatísticas dos produtos
     */
    getEstatisticas() {
        const produtos = this.produtos || [];
        return {
            total: produtos.length,
            ativos: produtos.filter(p => p.ativo !== false).length,
            inativos: produtos.filter(p => p.ativo === false).length,
            favoritos: produtos.filter(p => p.favorito === true).length,
            lojas: [...new Set(produtos.map(p => p.loja).filter(l => l && l.trim()))].length
        };
    }
}

// Inicialização
let adminManager;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🛠️ Sistema administrativo carregado com sucesso!');
    adminManager = new AdminManager();
});
