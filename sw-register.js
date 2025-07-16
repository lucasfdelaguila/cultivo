// Registro del Service Worker para Biocann - Cultivo
class ServiceWorkerManager {
    constructor() {
        this.swRegistration = null;
        this.init();
    }

    async init() {
        if ('serviceWorker' in navigator) {
            try {
                await this.registerServiceWorker();
                this.setupUpdateListener();
            } catch (error) {
                console.error('❌ Error al registrar Service Worker:', error);
            }
        } else {
            console.warn('⚠️ Service Worker no soportado en este navegador');
        }
    }

    async registerServiceWorker() {
        try {
            this.swRegistration = await navigator.serviceWorker.register('/cultivo/sw.js', {
                scope: '/cultivo/'
            });

            console.log('✅ Service Worker registrado exitosamente:', this.swRegistration);

            // Verificar si hay una actualización disponible
            this.swRegistration.addEventListener('updatefound', () => {
                const newWorker = this.swRegistration.installing;
                console.log('🔄 Nueva versión del Service Worker encontrada');

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        this.showUpdateNotification();
                    }
                });
            });

        } catch (error) {
            console.error('❌ Error al registrar Service Worker:', error);
            throw error;
        }
    }

    setupUpdateListener() {
        // Escuchar cambios en el Service Worker
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('🔄 Service Worker actualizado, recargando página...');
            window.location.reload();
        });
    }

    showUpdateNotification() {
        // Crear notificación de actualización
        if (!document.getElementById('update-notification')) {
            const notification = document.createElement('div');
            notification.id = 'update-notification';
            notification.className = 'update-notification';
            notification.innerHTML = `
                <div class="update-content">
                    <span class="update-icon">🔄</span>
                    <span class="update-text">Nueva versión disponible</span>
                    <button class="update-button" onclick="serviceWorkerManager.updateApp()">
                        Actualizar
                    </button>
                </div>
            `;
            document.body.appendChild(notification);

            // Auto-ocultar después de 10 segundos
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 10000);
        }
    }

    updateApp() {
        if (this.swRegistration && this.swRegistration.waiting) {
            // Enviar mensaje al Service Worker para actualizar
            this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
    }

    // Método para verificar el estado del Service Worker
    getStatus() {
        if (!this.swRegistration) {
            return 'No registrado';
        }

        if (this.swRegistration.installing) {
            return 'Instalando';
        }

        if (this.swRegistration.waiting) {
            return 'Esperando';
        }

        if (this.swRegistration.active) {
            return 'Activo';
        }

        return 'Desconocido';
    }

    // Método para obtener la versión del cache
    async getCacheVersion() {
        return new Promise((resolve) => {
            if (navigator.serviceWorker.controller) {
                const messageChannel = new MessageChannel();
                messageChannel.port1.onmessage = (event) => {
                    resolve(event.data.version);
                };
                navigator.serviceWorker.controller.postMessage(
                    { type: 'GET_VERSION' },
                    [messageChannel.port2]
                );
            } else {
                resolve('No disponible');
            }
        });
    }
}

// Inicializar el gestor de Service Worker
let serviceWorkerManager;

document.addEventListener('DOMContentLoaded', () => {
    serviceWorkerManager = new ServiceWorkerManager();
});

// Exportar para uso global
window.serviceWorkerManager = serviceWorkerManager; 