// Service Worker para Biocann - Cultivo
const CACHE_NAME = 'biocann-cultivo-v1.0.1'; // Incrementar versión para forzar actualización
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/config.js',
    '/manifest.json',
    '/actividades-estados.json'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log('🔧 Instalando Service Worker v1.0.1...');
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
    console.log('🚀 Activando Service Worker v1.0.1...');
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

    // Para archivos críticos, usar Network First para asegurar actualizaciones
    if (isCriticalFile(request.url)) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(request, responseClone);
                                console.log('📦 Actualizando cache para:', request.url);
                            });
                    }
                    return response;
                })
                .catch(() => {
                    console.log('📦 Fallback a cache para:', request.url);
                    return caches.match(request);
                })
        );
    }
    // Para recursos estáticos, usar Cache First pero con verificación periódica
    else if (isStaticResource(request.url)) {
        event.respondWith(
            caches.match(request)
                .then((response) => {
                    if (response) {
                        // Verificar si hay una versión más nueva en background
                        fetch(request, { cache: 'no-cache' })
                            .then((newResponse) => {
                                if (newResponse && newResponse.status === 200) {
                                    const responseClone = newResponse.clone();
                                    caches.open(CACHE_NAME)
                                        .then((cache) => {
                                            cache.put(request, responseClone);
                                            console.log('🔄 Actualización en background para:', request.url);
                                        });
                                }
                            })
                            .catch(() => {
                                // Ignorar errores de verificación en background
                            });
                        
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

// Función para identificar archivos críticos que siempre deben actualizarse
function isCriticalFile(url) {
    return url.includes('app.js') || 
           url.includes('config.js') || 
           url.includes('actividades-estados.json');
}

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

    if (event.data && event.data.type === 'FORCE_UPDATE') {
        this.forceUpdate();
    }
});

// Función para verificar actualizaciones
async function checkForUpdates() {
    try {
        const response = await fetch('/index.html', { cache: 'no-cache' });
        const newContent = await response.text();
        
        // Comparar con el contenido actual
        const currentContent = await caches.match('/index.html');
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

// Función para forzar actualización
async function forceUpdate() {
    try {
        // Limpiar cache actual
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
        );
        
        // Recargar todos los clientes
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({ type: 'FORCE_RELOAD' });
        });
        
        console.log('🔄 Actualización forzada completada');
    } catch (error) {
        console.error('Error forcing update:', error);
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