// Biocann - Cultivo Portal App
class BiocannPortal {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkInstallPrompt();
        this.setupOfflineDetection();
        console.log('🚀 Biocann - Cultivo Portal iniciado');
    }

    setupEventListeners() {
        // Botón de registrar evento
        const registrarEventoBtn = document.getElementById('registrar-evento-btn');
        if (registrarEventoBtn) {
            registrarEventoBtn.addEventListener('click', () => this.showForm());
            registrarEventoBtn.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.showForm();
                }
            });
        }



        // Detectar cambios de conectividad
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // Detectar instalación de PWA
        window.addEventListener('appinstalled', () => this.handleAppInstalled());
    }

    showForm() {
        // URL del formulario de Google desde la configuración
        const googleFormUrl = window.BIOCANN_CONFIG?.forms?.registrarEvento || 'https://forms.google.com/TU_FORMULARIO_AQUI';
        
        // Abrir formulario en nueva pestaña
        window.open(googleFormUrl, '_blank', 'noopener,noreferrer');
        
        // Mostrar mensaje de confirmación
        this.showFormNotification();
        
        console.log('📝 Abriendo formulario de registro de evento en nueva pestaña');
    }

    showFormNotification() {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = 'form-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">📝</span>
                <span class="notification-text">Formulario abierto en nueva pestaña</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }



    addClickEffect(button) {
        button.classList.add('clicked');
        setTimeout(() => {
            button.classList.remove('clicked');
        }, 200);
    }

    openLink(url) {
        // Verificar si es un enlace externo
        if (url.startsWith('http')) {
            // Abrir en nueva pestaña para enlaces externos
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            // Navegación interna
            window.location.href = url;
        }
    }

    checkInstallPrompt() {
        // Detectar si se puede instalar la PWA
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showInstallButton();
        });
    }

    showInstallButton() {
        // Crear botón de instalación si no existe
        if (!document.getElementById('install-button')) {
            const installButton = document.createElement('button');
            installButton.id = 'install-button';
            installButton.className = 'install-button';
            installButton.innerHTML = `
                <span class="button-icon">📱</span>
                <span class="button-text">Instalar App</span>
            `;
            installButton.addEventListener('click', () => this.installApp());
            
            // Insertar en el header
            const header = document.querySelector('.app-header');
            header.appendChild(installButton);
        }
    }

    installApp() {
        // Lógica de instalación de PWA
        if (window.deferredPrompt) {
            window.deferredPrompt.prompt();
            window.deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('✅ Usuario aceptó instalar la app');
                } else {
                    console.log('❌ Usuario rechazó instalar la app');
                }
                window.deferredPrompt = null;
            });
        }
    }

    handleAppInstalled() {
        console.log('🎉 App instalada exitosamente');
        // Ocultar botón de instalación
        const installButton = document.getElementById('install-button');
        if (installButton) {
            installButton.style.display = 'none';
        }
    }

    setupOfflineDetection() {
        // Mostrar estado de conectividad
        if (!navigator.onLine) {
            this.showOfflineMessage();
        }
    }

    handleOnline() {
        console.log('🌐 Conexión restaurada');
        this.hideOfflineMessage();
    }

    handleOffline() {
        console.log('📴 Sin conexión');
        this.showOfflineMessage();
    }

    showOfflineMessage() {
        if (!document.getElementById('offline-message')) {
            const message = document.createElement('div');
            message.id = 'offline-message';
            message.className = 'offline-message';
            message.innerHTML = `
                <span class="offline-icon">📴</span>
                <span>Sin conexión - Algunas funciones pueden no estar disponibles</span>
            `;
            document.body.appendChild(message);
        }
    }

    hideOfflineMessage() {
        const message = document.getElementById('offline-message');
        if (message) {
            message.remove();
        }
    }

    // Método para actualizar enlaces dinámicamente
    updateLinks(linksData) {
        const buttons = document.querySelectorAll('.portal-button');
        buttons.forEach(button => {
            const buttonText = button.querySelector('.button-text').textContent;
            if (linksData[buttonText]) {
                button.dataset.link = linksData[buttonText];
            }
        });
    }

    // Método para agregar nuevos botones dinámicamente
    addButton(section, icon, text, link, isSecondary = false) {
        const sectionElement = document.querySelector(`.portal-section:has(.section-title:contains("${section}"))`);
        if (!sectionElement) return;

        const buttonGrid = sectionElement.querySelector('.button-grid');
        const button = document.createElement('button');
        button.className = `portal-button${isSecondary ? ' secondary' : ''}`;
        button.dataset.link = link;
        button.innerHTML = `
            <span class="button-icon">${icon}</span>
            <span class="button-text">${text}</span>
        `;

        button.addEventListener('click', (e) => this.handleButtonClick(e));
        buttonGrid.appendChild(button);
    }
}

// Inicializar la app cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.biocannPortal = new BiocannPortal();
});

// Exportar para uso global
window.BiocannPortal = BiocannPortal; 