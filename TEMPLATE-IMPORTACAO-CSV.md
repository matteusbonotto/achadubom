# 📋 Template de Importação CSV

## 📝 Formato do Arquivo CSV

### 🛒 Formato Padrão Shopee (Recomendado)

O formato padrão da Shopee é aceito diretamente, sem necessidade de conversão:

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| **Item Id** | ID único do produto | `19098135516` |
| **Item Name** | Nome do produto | `"Manta Xale Tranças Geometrica..."` |
| **Price** | Preço (formato brasileiro) | `"139,99"` |
| **Sales** | Quantidade de vendas (número) | `336` |
| **Shop Name** | Nome da loja | `"Tok & Decor"` |
| **Commission Rate** | Taxa de comissão | `10%` |
| **Commission** | Valor da comissão | `"R$14,00"` |
| **Product Link** | Link do produto | `https://shopee.com.br/product/...` |
| **Offer Link** | Link de afiliado | `https://s.shopee.com.br/...` |

**Exemplo:**
```csv
Item Id,Item Name,Price,Sales,Shop Name,Commission Rate,Commission,Product Link,Offer Link
19098135516,"Manta Xale Tranças Geometrica Boho Moderna Peseira Rústica 1,60M x 1,60M","139,99",336,"Tok & Decor",10%,"R$14,00",https://shopee.com.br/product/1161923923/19098135516,https://s.shopee.com.br/6fa72tEjEg
```

### 📦 Formato Genérico (Outras Lojas)

Para outras lojas, use o formato genérico:

#### Campos Obrigatórios

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| **Item Name** | Nome do produto | `"Smartphone Samsung Galaxy A54 128GB"` |
| **Offer Link** | Link de afiliado do produto | `"https://shope.ee/example12345"` |

#### Campos Opcionais

| Campo | Alternativas Aceitas | Descrição | Exemplo |
|-------|----------------------|-----------|---------|
| **Price** | `Original Price`, `Sale Price` | Preço do produto | `1299.90` ou `"R$ 1.299,90"` |
| **Sales** | - | Quantidade de vendas | `"10mil+ vendas"` ou `"500 vendas"` |
| **Category** / **Categoria** | `Categories`, `Categorias` | Categoria(s) do produto (separadas por vírgula) | `Eletrônicos` ou `Eletrônicos,Smartphones` |
| **Imagem** / **Image** | `Image URL`, `Imagem URL`, `Images`, `Imagens` | URL(s) da(s) imagem(ns) (separadas por vírgula) | `https://exemplo.com/img1.jpg` ou `https://exemplo.com/img1.jpg,https://exemplo.com/img2.jpg` |
| **Descrição** / **Description** | `Descricao` | Descrição personalizada do produto | `"Produto incrível com..."` |
| **Ativo** / **Active** | `Status` | Se o produto está ativo (true/false, sim/não, 1/0) | `true`, `sim`, `1`, `ativo` |
| **Favorito** / **Favorite** | `Favourite` | Se o produto é favorito (true/false, sim/não, 1/0) | `true`, `sim`, `1`, `favorito` |
| **Store** | - | Nome da loja | `Amazon`, `Mercado Livre` |
| **Product ID** | `Item ID` | ID único do produto | `PROD001` |

## 📄 Exemplos de Arquivo CSV

### Exemplo 1: Formato Shopee (Padrão)
```csv
Item Id,Item Name,Price,Sales,Shop Name,Commission Rate,Commission,Product Link,Offer Link
19098135516,"Manta Xale Tranças Geometrica Boho Moderna Peseira Rústica 1,60M x 1,60M","139,99",336,"Tok & Decor",10%,"R$14,00",https://shopee.com.br/product/1161923923/19098135516,https://s.shopee.com.br/6fa72tEjEg
```

### Exemplo 2: Formato Genérico (Outras Lojas)
```csv
Item Name,Offer Link,Price,Sales,Category,Store,Product ID,Imagem,Descrição,Ativo,Favorito
"Smartphone Samsung Galaxy A54 128GB","https://shope.ee/example12345",1299.90,"10mil+ vendas",Eletrônicos,Amazon,PROD001,https://exemplo.com/smartphone.jpg,"Smartphone com 128GB de armazenamento",true,false
"Kit de Maquiagem Completo 15 Peças","https://shope.ee/example67890",89.99,"5mil+ vendas","Beleza,Maquiagem",Mercado Livre,PROD002,https://exemplo.com/kit1.jpg;https://exemplo.com/kit2.jpg,"Kit completo com 15 peças",true,true
```

## 🔍 Como Funciona

### 1. **Código do Produto**

**Para Shopee (formato padrão):**
- Usa `Item Id` do CSV
- Formato: `SHOPEE-{ItemId}`
- Exemplo: `Item Id` = `19098135516` → Código = `SHOPEE-19098135516`

**Para outras lojas:**
- Se `Product ID` ou `Item ID` estiver presente, será usado
- Caso contrário, será gerado automaticamente usando os últimos 10 caracteres do `Offer Link`
- Exemplo: Se `Offer Link` = `https://shope.ee/abc123xyz`, o código será `abc123xyz`

### 2. **Preço**

**Para Shopee (formato padrão):**
- Aceita formato brasileiro: `"139,99"` (vírgula como separador decimal)
- Será convertido automaticamente para `139.99`

**Para outras lojas:**
- Aceita formatos: `1299.90`, `"R$ 1.299,90"`, `"1.299,90"`
- Será convertido automaticamente para número decimal
- Se não fornecido, será `0.00`

### 3. **Categorias**
- Aceita os campos: `Category`, `Categoria`, `Categories`, `Categorias`
- Suporta múltiplas categorias separadas por vírgula (`,`) ou ponto e vírgula (`;`)
- Exemplo: `Eletrônicos,Smartphones` ou `Eletrônicos;Smartphones`
- Categoria padrão `geral` será adicionada automaticamente se nenhuma for fornecida
- Se `Sales` contiver `mil+`, `k` ou `K`, a categoria `destaque` será adicionada automaticamente
- Para produtos Shopee, a categoria `shopee` será adicionada automaticamente

### 4. **Loja**

**Para Shopee (formato padrão):**
- Usa `Shop Name` do CSV
- Exemplo: `"Tok & Decor"` → Loja = `Tok & Decor`

**Para outras lojas:**
- Se `Store` estiver presente, será usada
- Caso contrário, será usada a loja selecionada no modal de importação
- Se nenhuma for fornecida, será `outros`

### 5. **Imagens**
- Aceita os campos: `Image`, `Imagem`, `Image URL`, `Imagem URL`, `Images`, `Imagens`, `Product Image`
- Suporta múltiplas imagens separadas por vírgula (`,`), ponto e vírgula (`;`) ou quebra de linha
- Exemplo: `https://exemplo.com/img1.jpg,https://exemplo.com/img2.jpg`
- Se não fornecida, o sistema tentará extrair automaticamente da URL (se a opção estiver habilitada)
- Se não conseguir extrair, será usado um placeholder

### 6. **Descrição**
- Aceita os campos: `Description`, `Descrição`, `Descricao`
- Se não fornecida, será gerada automaticamente: `"{Item Name}. Vendido por {Store}. {Sales} vendas."`

### 7. **Status do Produto**
- **Ativo**: Aceita `Active`, `Ativo`, `Status`
  - Valores aceitos: `true`, `1`, `sim`, `s`, `ativo`, `yes` (produto ativo)
  - Qualquer outro valor ou ausência = produto inativo
  - Padrão: `true` (ativo)

- **Favorito**: Aceita `Favorite`, `Favorito`, `Favourite`
  - Valores aceitos: `true`, `1`, `sim`, `s`, `favorito`, `yes` (é favorito)
  - Qualquer outro valor ou ausência = não favorito
  - Padrão: `false` (não favorito)

## ✅ Validações

- **Item Name** é obrigatório
- **Offer Link** é obrigatório e deve ter pelo menos 10 caracteres
- Produtos com código duplicado serão ignorados (não serão importados novamente)

## 📤 Como Importar

1. Acesse o painel administrativo
2. Clique em **"Importar CSV"**
3. Selecione a loja (se não estiver no CSV)
4. Escolha o arquivo CSV
5. Clique em **"Importar Produtos"**

## ⚠️ Observações

- O arquivo deve estar em formato **UTF-8**
- Use aspas duplas (`"`) para campos que contenham vírgulas
- O separador padrão é vírgula (`,`)
- A primeira linha deve conter os cabeçalhos (nomes das colunas)

## 📝 Exemplo Completo

### Para Shopee (Formato Padrão)

Salve este conteúdo como `produtos-shopee.csv`:

```csv
Item Id,Item Name,Price,Sales,Shop Name,Commission Rate,Commission,Product Link,Offer Link
19098135516,"Manta Xale Tranças Geometrica Boho Moderna Peseira Rústica 1,60M x 1,60M","139,99",336,"Tok & Decor",10%,"R$14,00",https://shopee.com.br/product/1161923923/19098135516,https://s.shopee.com.br/6fa72tEjEg
```

**💡 Dica:** Você pode baixar este formato diretamente do portal de afiliados Shopee, sem necessidade de conversão!

### Para Outras Lojas (Formato Genérico)

```csv
Item Name,Offer Link,Price,Sales,Category,Store,Imagem,Descrição,Ativo,Favorito
"Smartphone Samsung Galaxy A54 128GB","https://shope.ee/example12345",1299.90,"10mil+ vendas",Eletrônicos,Amazon,https://exemplo.com/smartphone.jpg,"Smartphone com 128GB",true,false
"Kit de Maquiagem Completo 15 Peças","https://shope.ee/example67890",89.99,"5mil+ vendas",Beleza,Mercado Livre,https://exemplo.com/kit.jpg,"Kit completo",true,true
```

### Exemplo com Múltiplas Categorias e Imagens

```csv
Item Name,Offer Link,Price,Sales,Categoria,Store,Imagem,Descrição
"Smartphone Samsung Galaxy A54 128GB","https://shope.ee/example12345",1299.90,"10mil+ vendas","Eletrônicos,Smartphones",Amazon,"https://exemplo.com/img1.jpg,https://exemplo.com/img2.jpg","Produto incrível"
```

