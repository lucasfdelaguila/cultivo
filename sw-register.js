// Registro del Service Worker
if ('serviceWorker' in navigator) {
    console.log('🔧 Registrando Service Worker...');
    
    // Función para registrar el service worker
    async function registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });
            
            console.log('✅ Service Worker registrado:', registration);
            
            // Manejar actualizaciones
            registration.addEventListener('updatefound', () => {
                console.log('🔄 Nueva versión del Service Worker encontrada');
                const newWorker = registration.installing;
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            // Hay una nueva versión disponible
                            console.log('📱 Nueva versión disponible, solicitando actualización...');
                            showUpdateNotification();
                        }
                    }
                });
            });
            
            // Manejar mensajes del service worker
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data.type === 'UPDATE_AVAILABLE') {
                    console.log('📱 Actualización disponible');
                    showUpdateNotification();
                }
                
                if (event.data.type === 'FORCE_RELOAD') {
                    console.log('🔄 Recarga forzada solicitada');
                    window.location.reload();
                }
            });
            
            // Verificar actualizaciones periódicamente
            setInterval(() => {
                registration.update();
            }, 60000); // Cada minuto
            
            return registration;
            
        } catch (error) {
            console.error('❌ Error al registrar Service Worker:', error);
        }
    }
    
    // Función para mostrar notificación de actualización
    function showUpdateNotification() {
        // Verificar si ya existe una notificación
        if (document.querySelector('.update-notification')) {
            return;
        }
        
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.style.display = 'block';
        notification.innerHTML = `
            <div class="update-content">
                <span class="update-icon">🔄</span>
                <span class="update-text">Nueva versión disponible</span>
                <button class="update-button" onclick="forceUpdate()">Actualizar</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-ocultar después de 30 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 30000);
    }
    
    // Función para forzar actualización
    window.forceUpdate = async function() {
        try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration && registration.waiting) {
                // Enviar mensaje al service worker para forzar actualización
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                
                // Recargar la página después de un breve delay
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                // Si no hay service worker esperando, recargar directamente
                window.location.reload();
            }
        } catch (error) {
            console.error('Error al forzar actualización:', error);
            // Fallback: recargar directamente
            window.location.reload();
        }
    };
    
    // Función para limpiar cache manualmente
    window.clearAppCache = async function() {
        try {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
            console.log('🗑️ Cache limpiado');
            
            // Recargar la página
            window.location.reload();
        } catch (error) {
            console.error('Error al limpiar cache:', error);
        }
    };
    
    // Registrar el service worker cuando la página esté lista
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', registerServiceWorker);
    } else {
        registerServiceWorker();
    }
    
    // También registrar cuando la página se vuelve visible (para detectar actualizaciones)
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            // La página se volvió visible, verificar actualizaciones
            navigator.serviceWorker.getRegistration().then(registration => {
                if (registration) {
                    registration.update();
                }
            });
        }
    });
    
} else {
    console.log('❌ Service Worker no soportado');
} 