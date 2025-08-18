/**
 * =============================================
 * SERVICE WORKER - PWA ACHADUBOM
 * Estratégia: Cache First com fallback
 * =============================================
 */

const CACHE_NAME = 'achadubom-v1.0.0';
const STATIC_CACHE_NAME = 'achadubom-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'achadubom-dynamic-v1.0.0';

// Recursos para cache inicial
const STATIC_ASSETS = [
    './',
    './index.html',
    './admin.html',
    './manifest.json',
    './assets/css/globals.css',
    './assets/css/desktop.css',
    './assets/css/mobile.css',
    './assets/js/main.js',
    './assets/js/admin.js',
    './assets/data/produtos.json',
    // CDN assets (fallback para offline)
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap'
];

// Recursos que devem ser sempre atualizados
const NETWORK_FIRST_URLS = [
    './assets/data/produtos.json'
];

// Imagens que podem ser cacheadas dinamicamente
const CACHE_IMAGES = true;
const MAX_DYNAMIC_CACHE_SIZE = 50;

/**
 * =============================================
 * EVENTOS DO SERVICE WORKER
 * =============================================
 */

// Instalação - Cachear recursos estáticos
self.addEventListener('install', event => {
    console.log('🔧 Service Worker: Instalando...');

    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then(cache => {
                console.log('📦 Service Worker: Cacheando recursos estáticos');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('✅ Service Worker: Instalação concluída');
                return self.skipWaiting(); // Ativa imediatamente
            })
            .catch(error => {
                console.error('❌ Service Worker: Erro na instalação:', error);
            })
    );
});

// Ativação - Limpeza de caches antigos
self.addEventListener('activate', event => {
    console.log('🚀 Service Worker: Ativando...');

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE_NAME &&
                            cacheName !== DYNAMIC_CACHE_NAME) {
                            console.log('🗑️ Service Worker: Removendo cache antigo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker: Ativação concluída');
                return self.clients.claim(); // Assume controle de todas as páginas
            })
            .catch(error => {
                console.error('❌ Service Worker: Erro na ativação:', error);
            })
    );
});

// Interceptação de requisições
self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);

    // Ignora requisições não HTTP
    if (!event.request.url.startsWith('http')) {
        return;
    }

    // Estratégia baseada no tipo de recurso
    if (isStaticAsset(event.request)) {
        event.respondWith(cacheFirstStrategy(event.request));
    } else if (isNetworkFirst(event.request)) {
        event.respondWith(networkFirstStrategy(event.request));
    } else if (isImage(event.request) && CACHE_IMAGES) {
        event.respondWith(cacheFirstWithCleanup(event.request));
    } else {
        event.respondWith(networkOnlyStrategy(event.request));
    }
});

// Sincronização em background (quando voltar online)
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('🔄 Service Worker: Sincronização em background');
        event.waitUntil(syncData());
    }
});

// Mensagens do cliente
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'GET_CACHE_SIZE') {
        getCacheSize().then(size => {
            event.ports[0].postMessage({ cacheSize: size });
        });
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        clearDynamicCache().then(() => {
            event.ports[0].postMessage({ success: true });
        });
    }
});

/**
 * =============================================
 * ESTRATÉGIAS DE CACHE
 * =============================================
 */

// Cache First - Para recursos estáticos
async function cacheFirstStrategy(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);

        // Cache a resposta para próximas vezes
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;

    } catch (error) {
        console.error('Service Worker: Erro em cache first:', error);

        // Fallback para página offline se disponível
        if (request.destination === 'document') {
            return caches.match('./offline.html') ||
                new Response('Você está offline. Verifique sua conexão.', {
                    status: 503,
                    statusText: 'Service Unavailable'
                });
        }

        throw error;
    }
}

// Network First - Para dados dinâmicos
async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;

    } catch (error) {
        console.log('Service Worker: Network falhou, tentando cache:', request.url);

        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        throw error;
    }
}

// Cache First com limpeza para imagens
async function cacheFirstWithCleanup(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);

            // Limpar cache se estiver muito cheio
            await cleanupDynamicCache();

            cache.put(request, networkResponse.clone());
        }

        return networkResponse;

    } catch (error) {
        console.error('Service Worker: Erro ao cachear imagem:', error);

        // Retorna imagem placeholder em caso de erro
        return new Response(getPlaceholderImage(), {
            headers: { 'Content-Type': 'image/svg+xml' }
        });
    }
}

// Network Only - Para requisições que não devem ser cacheadas
async function networkOnlyStrategy(request) {
    return fetch(request);
}

/**
 * =============================================
 * FUNÇÕES AUXILIARES
 * =============================================
 */

// Verifica se é recurso estático
function isStaticAsset(request) {
    const url = new URL(request.url);
    return STATIC_ASSETS.some(asset => url.pathname.includes(asset.replace('./', ''))) ||
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.js') ||
        url.pathname.endsWith('.html') ||
        url.pathname.endsWith('.json');
}

// Verifica se deve usar Network First
function isNetworkFirst(request) {
    const url = new URL(request.url);
    return NETWORK_FIRST_URLS.some(asset => url.pathname.includes(asset.replace('./', '')));
}

// Verifica se é imagem
function isImage(request) {
    return request.destination === 'image' ||
        request.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
}

// Limpeza do cache dinâmico
async function cleanupDynamicCache() {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const keys = await cache.keys();

    if (keys.length >= MAX_DYNAMIC_CACHE_SIZE) {
        // Remove os mais antigos (FIFO)
        const keysToDelete = keys.slice(0, keys.length - MAX_DYNAMIC_CACHE_SIZE + 1);
        await Promise.all(keysToDelete.map(key => cache.delete(key)));
        console.log(`🧹 Service Worker: Limpou ${keysToDelete.length} itens do cache dinâmico`);
    }
}

// Obter tamanho total do cache
async function getCacheSize() {
    const cacheNames = await caches.keys();
    let totalSize = 0;

    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        totalSize += keys.length;
    }

    return totalSize;
}

// Limpar cache dinâmico completamente
async function clearDynamicCache() {
    return caches.delete(DYNAMIC_CACHE_NAME);
}

// Sincronização de dados
async function syncData() {
    try {
        // Aqui você pode implementar lógica para sincronizar dados
        // quando a conexão for restaurada
        console.log('🔄 Service Worker: Sincronizando dados...');

        // Exemplo: re-carregar produtos
        const response = await fetch('./assets/data/produtos.json');
        if (response.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put('./assets/data/produtos.json', response.clone());
        }

        // Notificar clientes sobre sincronização
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_COMPLETE',
                message: 'Dados sincronizados com sucesso!'
            });
        });

    } catch (error) {
        console.error('Service Worker: Erro na sincronização:', error);
    }
}

// Imagem placeholder SVG
function getPlaceholderImage() {
    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#f8f9fa"/>
      <text x="200" y="150" text-anchor="middle" fill="#6c757d" font-family="Arial, sans-serif" font-size="16">
        Imagem não disponível
      </text>
      <circle cx="200" cy="120" r="30" fill="none" stroke="#6c757d" stroke-width="2"/>
      <circle cx="200" cy="120" r="5" fill="#6c757d"/>
      <polygon points="185,140 200,125 215,140" fill="#6c757d"/>
    </svg>
  `;
}

/**
 * =============================================
 * NOTIFICAÇÕES PUSH (Futuro)
 * =============================================
 */

// Listener para notificações push
self.addEventListener('push', event => {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.body,
        icon: './icon-192x192.png',
        badge: './badge-72x72.png',
        tag: 'achadubom-notification',
        renotify: true,
        actions: [
            {
                action: 'open',
                title: 'Ver Oferta',
                icon: './action-icon.png'
            },
            {
                action: 'close',
                title: 'Fechar'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Clique em notificação
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'open') {
        event.waitUntil(
            self.clients.openWindow('/')
        );
    }
});

console.log('🛠️ Service Worker: Script carregado e configurado');
console.log(`📦 Cache: ${CACHE_NAME}`);
console.log(`🗂️ Recursos estáticos: ${STATIC_ASSETS.length} itens`);
console.log(`🖼️ Cache de imagens: ${CACHE_IMAGES ? 'Ativado' : 'Desativado'}`);
console.log(`🧹 Limite cache dinâmico: ${MAX_DYNAMIC_CACHE_SIZE} itens`);
