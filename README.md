# 🛍️ AchaduBom - PWA de Achadinhos Imperdíveis

Um Progressive Web App (PWA) moderno e responsivo para exibir produtos e ofertas especiais de marketplaces como Shopee, Mercado Livre, Amazon e outros.

## ✨ Características

### 🎯 **Funcionalidades Principais**
- ✅ **PWA Completo** - Instalável, funciona offline
- ✅ **100% Responsivo** - Mobile-first design
- ✅ **Sistema de Favoritos** - LocalStorage persistente
- ✅ **Busca Inteligente** - Com debounce e filtragem
- ✅ **Carrossel de Imagens** - Múltiplas fotos por produto
- ✅ **Filtros Avançados** - Por loja, preço, categoria
- ✅ **Painel Admin** - CRUD completo de produtos
- ✅ **Animações Modernas** - UX/UI fluido e atrativo

### 🚀 **Tecnologias Utilizadas**
- **Frontend:** HTML5, CSS3, JavaScript ES6+
- **Framework:** Bootstrap 5 + Bootstrap Icons
- **Fontes:** Google Fonts (Poppins + Open Sans)
- **PWA:** Service Worker + Web App Manifest
- **Base de Dados:** JSON local (simulando API)

### 🎨 **Design & UX**
- **Animações:** Efeitos flutuantes, transições suaves, micro-interações
- **Acessibilidade:** Contraste adequado, foco visível, navegação por teclado

## 📁 Estrutura do Projeto

```
achadubom/
├── 📄 index.html              # Página principal
├── 📄 admin.html              # Painel administrativo
├── 📄 manifest.json           # Manifesto PWA
├── 📄 service-worker.js       # Service Worker
├── 📄 README.md               # Este arquivo
│
├── 📁 assets/
│   ├── 📁 data/
│   │   └── produtos.json      # Base de dados dos produtos
│   │
│   ├── 📁 css/
│   │   ├── globals.css        # Variáveis globais e reset
│   │   ├── desktop.css        # Estilos para desktop (≥992px)
│   │   └── mobile.css         # Estilos para mobile (<992px)
│   │
│   └── 📁 js/
│       ├── main.js            # Lógica principal da aplicação
│       └── admin.js           # Lógica do painel administrativo
```

## 🚀 Como Executar

### **Opção 1: Servidor Python (Recomendado)**
```bash
# Navegue até a pasta do projeto
cd achadubom

# Execute o servidor HTTP
python -m http.server 8000

# Acesse: http://localhost:8000
```

### **Opção 2: Live Server (VS Code)**
1. Instale a extensão "Live Server" no VS Code
2. Clique com botão direito em `index.html`
3. Selecione "Open with Live Server"

### **Opção 3: Qualquer Servidor Web**
- Apache, Nginx, IIS, etc.
- Simplesmente coloque os arquivos na pasta web

## 🛠️ Configuração dos Produtos

### **Estrutura do JSON (`assets/data/produtos.json`)**
```json
{
  "codigo": "PRD001",           // Código único do produto
  "ativo": true,                // Se deve aparecer na listagem
  "titulo": "Nome do Produto",  // Título exibido
  "descricao": "Descrição...",  // Descrição completa
  "url": "https://loja.com",    // Link para a página do produto
  "imagem": [                   // Array de URLs das imagens
    "https://exemplo.com/img1.jpg",
    "https://exemplo.com/img2.jpg"
  ],
  "categorias": [               // Array de categorias
    "destaques",                // "destaques" aparece no banner hero
    "eletrônicos"
  ],
  "favorito": false,            // Padrão de favorito (sobrescrito pelo localStorage)
  "loja": "Shopee",             // Nome da loja
  "preco": 89.90                // Preço em reais
}
```

### **Campos Obrigatórios**
- ✅ `codigo` - Único, mínimo 3 caracteres
- ✅ `titulo` - Mínimo 5 caracteres
- ✅ `descricao` - Mínimo 20 caracteres
- ✅ `url` - URL válida
- ✅ `imagem` - Pelo menos 1 URL válida
- ✅ `categorias` - Pelo menos 1 categoria
- ✅ `loja` - Nome da loja
- ✅ `preco` - Valor maior que zero

## 🎮 Como Usar

### **Página Principal**
1. **Busca:** Digite no campo de busca para filtrar produtos
2. **Filtros:** Use os dropdowns para filtrar por loja e ordenação
3. **Favoritos:** Clique no ❤️ para adicionar/remover favoritos
4. **Visualização:** Alterne entre grade e lista
5. **Carrossel:** Navegue pelas imagens com as setas (se houver múltiplas)
6. **Descrição:** Clique em "Ver mais" para expandir a descrição
7. **Comprar:** Clique em "QUERO!" para ir ao produto na loja

### **Painel Admin** (`/admin.html`)
1. **Novo Produto:** Clique em "Novo Produto"
2. **Editar:** Clique no ícone ✏️ na lista
3. **Duplicar:** Clique no ícone 📋 para copiar um produto
4. **Excluir:** Clique no ícone 🗑️ (com confirmação)
5. **Buscar:** Use o campo de busca para encontrar produtos
6. **Validação:** Todos os campos obrigatórios são validados

## 📱 Recursos PWA

### **Instalação**
- **Android:** Banner "Adicionar à tela inicial"
- **iOS:** Menu Safari > "Adicionar à Tela de Início"
- **Desktop:** Ícone de instalação na barra de endereços

### **Funcionalidades Offline**
- ✅ Cache automático de recursos estáticos
- ✅ Cache inteligente de imagens
- ✅ Fallback para páginas offline
- ✅ Sincronização em background

### **Shortcuts do App (após instalação)**
- 🏠 **Ver Produtos** - Vai direto para a seção de produtos
- ❤️ **Favoritos** - Filtra apenas produtos favoritos
- ⚙️ **Admin** - Abre o painel administrativo

## 🎨 Personalização

### **Fontes**
- **Títulos:** Poppins (weights: 400, 500, 700)
- **Corpo:** Open Sans (weights: 400, 500, 600)

### **Breakpoints**
- **Mobile:** < 992px
- **Desktop:** ≥ 992px

## 🔧 Desenvolvimento

### **Estrutura de Classes JavaScript**

#### **`ProdutosManager` (main.js)**
- `carregarProdutos()` - Carrega dados do JSON
- `aplicarFiltros()` - Aplica busca, filtros e ordenação
- `renderizarProdutos()` - Renderiza cards de produtos
- `toggleFavorito()` - Gerencia favoritos no localStorage
- `navegarCarrossel()` - Navega entre imagens

#### **`AdminManager` (admin.js)**
- `salvarProduto()` - Adiciona/edita produtos
- `excluirProduto()` - Remove produtos com confirmação
- `validarDados()` - Valida formulário completo
- `gerarCodigo()` - Gera códigos únicos automaticamente

### **Service Worker**
- **Estratégia:** Cache First para recursos estáticos
- **Network First:** Para dados dinâmicos (produtos.json)
- **Cache dinâmico:** Para imagens (com limpeza automática)
- **Fallbacks:** Páginas offline e imagens placeholder

## 🧪 Testes

### **Checklist de Funcionalidades**
- [ ] Menu funciona em mobile e desktop
- [ ] Produtos carregam do JSON
- [ ] Busca filtra corretamente
- [ ] Filtros aplicam ordenação
- [ ] Favoritos persistem no localStorage
- [ ] Carrossel navega entre imagens
- [ ] Descrições expandem/contraem
- [ ] Links "QUERO!" abrem em nova aba
- [ ] Admin adiciona produtos com validação
- [ ] Admin edita produtos existentes
- [ ] Admin exclui com confirmação
- [ ] PWA instala corretamente
- [ ] Service Worker cacheia recursos
- [ ] Site funciona offline

### **Testar Responsividade**
- **Breakpoints:** 360px, 768px, 992px, 1200px, 1400px
- **Orientações:** Portrait e landscape
- **Browsers:** Chrome, Firefox, Safari, Edge

## 🚀 Deploy

### **GitHub Pages**
1. Fork/clone este repositório
2. Vá em Settings > Pages
3. Selecione branch `main`
4. Site disponível em: `https://seunome.github.io/achadubom`

### **Netlify**
1. Conecte o repositório
2. Build command: (deixe vazio)
3. Publish directory: `/`
4. Deploy automático

### **Vercel**
1. Importe projeto do GitHub
2. Framework preset: Other
3. Deploy instantâneo

## 📈 Melhorias Futuras

### **V2.0 - Backend**
- [ ] API REST para produtos
- [ ] Banco de dados real (PostgreSQL)
- [ ] Sistema de usuários
- [ ] Dashboard de analytics

### **V2.1 - Social**
- [ ] Compartilhamento social
- [ ] Comentários em produtos
- [ ] Sistema de avaliações
- [ ] Wishlist colaborativa

### **V2.2 - E-commerce**
- [ ] Carrinho de compras
- [ ] Comparação de preços
- [ ] Histórico de preços
- [ ] Notificações de promoções

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b minha-feature`
3. Commit: `git commit -m 'Adiciona nova feature'`
4. Push: `git push origin minha-feature`
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🎯 Suporte

- **Bugs:** Abra uma [issue](https://github.com/seu-usuario/achadubom/issues)
- **Documentação:** Este README
- **Contato:** [seu-email@exemplo.com](mailto:seu-email@exemplo.com)

---

**Feito com ❤️ para economizar seu dinheiro!**

> 💡 **Dica:** Para melhores resultados, use imagens de alta qualidade (mín. 400x400px) e descrições detalhadas que destaquem os benefícios dos produtos.
