# 🔐 Sistema de Controle do Painel Administrativo

## Como usar

### ✅ Para HABILITAR o Admin:
1. Abra o arquivo `assets/js/config.js`
2. Encontre a linha: `enabled: false,`
3. Mude para: `enabled: true,`
4. Salve o arquivo
5. Recarregue a página

### ❌ Para DESABILITAR o Admin:
1. Abra o arquivo `assets/js/config.js`
2. Encontre a linha: `enabled: true,`
3. Mude para: `enabled: false,`
4. Salve o arquivo
5. Recarregue a página

## 🔄 Sistema de Atualização de Dados

### 🎯 Funcionalidades:
- **🔴 Botão Manual**: Clique no botão vermelho para atualizar dados instantaneamente
- **⏰ Limpeza Automática**: Cache limpo automaticamente a cada 10 minutos
- **🧹 Limpeza Completa**: Remove cache do navegador, localStorage e sessionStorage
- **📱 Responsivo**: Botões otimizados para mobile e desktop

### 🎛️ Configuração do Auto-Refresh:
```javascript
// No arquivo assets/js/config.js
site: {
    autoRefreshInterval: 10  // ← Mude para o intervalo desejado (em minutos)
}
```

### 🎨 Visual:
- **Botão Vermelho**: 🔄 Atualizar dados (manual)
- **Botão Azul**: 📱 Instalar PWA (quando disponível)
- **Toast Notifications**: Feedback visual de sucesso/erro
- **Animação**: Spinner durante atualização

## 🎯 O que acontece quando DESABILITADO:

- ❌ **Botão Admin SUMIRÁ** do menu desktop
- ❌ **Botão Admin SUMIRÁ** do menu mobile  
- ❌ **Acesso direto a admin.html será BLOQUEADO**
- ❌ **Redirecionamento automático** para página inicial
- ❌ **Alert de segurança** será exibido

## ✨ O que acontece quando HABILITADO:

- ✅ **Botão Admin APARECERÁ** no menu desktop
- ✅ **Botão Admin APARECERÁ** no menu mobile
- ✅ **Acesso total** ao painel administrativo
- ✅ **Funcionalidades completas** disponíveis

## 📁 Arquivos do Sistema:

```
assets/js/config.js          ← Arquivo principal de configuração
assets/js/main.js            ← Sistema de produtos + DataRefreshManager
index.html                   ← JavaScript de controle adicionado
admin.html                   ← Script de proteção adicionado
```

## 🚀 Para Produção:

1. **Publique com admin DESABILITADO**: `enabled: false`
2. **Configure auto-refresh**: `autoRefreshInterval: 10` (minutos)
3. **Quando precisar do admin**: Mude para `enabled: true`
4. **Após usar**: Volte para `enabled: false`

## 🔧 Configurações Extras:

```javascript
admin: {
    enabled: false,           // ← Principal controle
    requireAuth: true,        // Futuro: autenticação
    allowedUsers: [],        // Futuro: usuários permitidos
},

site: {
    autoRefreshInterval: 10,  // ← Intervalo de limpeza automática (minutos)
    showBetaFeatures: false,
    enableAnalytics: true,
    maintenanceMode: false
}
```

## 🐛 Debug:

Para ver mensagens no console:
```javascript
debug: {
    showConsoleMessages: true  // ← Mude para true
}
```

### 📊 Mensagens de Debug:
- `🔄 Auto-refresh configurado para X minutos`
- `🔄 Executando limpeza automática de cache...`
- `✅ Cache limpo automaticamente`
- `🕒 Última atualização: [timestamp]`

---

**💡 Dicas**: 
- Mantenha sempre uma cópia do `config.js` com admin habilitado em local seguro!
- Use o botão de atualizar quando adicionar novos produtos
- O sistema limpa automaticamente o cache para manter dados sempre atualizados
