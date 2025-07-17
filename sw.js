// Service Worker para Biocann - Cultivo
const CACHE_NAME = 'biocann-cultivo-v1.0.0';
const urlsToCache = [
    '/cultivo/',
    '/cultivo/index.html',
    '/cultivo/styles.css',
    '/cultivo/app.js',
    '/cultivo/config.js',
    '/cultivo/manifest.json',
    '/cultivo/logo.png'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log('🔧 Instalando Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Cache abierto');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('✅ Recursos cacheados exitosamente');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Error al cachear recursos:', error);
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    console.log('🚀 Activando Service Worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Eliminando cache anterior:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker activado');
            return self.clients.claim();
        })
    );
});

// Interceptar peticiones
self.addEventListener('fetch', (event) => {
    const { request } = event;
    
    // Solo manejar peticiones GET
    if (request.method !== 'GET') {
        return;
    }

    // Estrategia: Cache First para recursos estáticos
    if (isStaticResource(request.url)) {
        event.respondWith(
            caches.match(request)
                .then((response) => {
                    if (response) {
                        console.log('📦 Sirviendo desde cache:', request.url);
                        return response;
                    }
                    return fetch(request)
                        .then((response) => {
                            if (response && response.status === 200) {
                                const responseClone = response.clone();
                                caches.open(CACHE_NAME)
                                    .then((cache) => {
                                        cache.put(request, responseClone);
                                    });
                            }
                            return response;
                        });
                })
                .catch(() => {
                    // Fallback para recursos críticos
                    if (request.url.includes('index.html')) {
                        return caches.match('/index.html');
                    }
                })
        );
    } else {
        // Para peticiones de API, usar Network First
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(request, responseClone);
                            });
                    }
                    return response;
                })
                .catch(() => {
                    return caches.match(request);
                })
        );
    }
});

// Función para identificar recursos estáticos
function isStaticResource(url) {
    const staticExtensions = ['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
    return staticExtensions.some(ext => url.includes(ext)) || 
           url.includes('manifest.json') ||
           url.includes('sw.js');
}

// Manejo de mensajes
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }

    if (event.data && event.data.type === 'CHECK_UPDATE') {
        this.checkForUpdates();
    }
});

// Función para verificar actualizaciones
async function checkForUpdates() {
    try {
        const response = await fetch('/cultivo/index.html', { cache: 'no-cache' });
        const newContent = await response.text();
        
        // Comparar con el contenido actual
        const currentContent = await caches.match('/cultivo/index.html');
        if (currentContent) {
            const currentText = await currentContent.text();
            if (newContent !== currentText) {
                // Hay una actualización disponible
                self.clients.matchAll().then(clients => {
                    clients.forEach(client => {
                        client.postMessage({ type: 'UPDATE_AVAILABLE' });
                    });
                });
            }
        }
    } catch (error) {
        console.error('Error checking for updates:', error);
    }
}

// Manejo de errores
self.addEventListener('error', (event) => {
    console.error('❌ Error en Service Worker:', event.error);
});

// Manejo de rechazos de promesas no manejados
self.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promesa rechazada no manejada:', event.reason);
}); 