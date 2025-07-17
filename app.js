// Biocann - Cultivo Portal App
class BiocannPortal {
    constructor() {
        this.currentSection = 'registros';
        this.cultivoPassword = 'biocann2024'; // Contraseña para la sección Cultivo
        this.sessionKey = 'biocann_cultivo_session';
        this.actividadesManager = new ActividadesManager();
        this.init();
    }

    init() {
        this.checkSession();
        this.setupNavigation();
        this.setupEventListeners();
        this.checkInstallPrompt();
        this.setupOfflineDetection();
        this.setupAutoUpdate();
        this.setupAuthentication();
        this.setupSessionMonitoring();
        console.log('🚀 Biocann - Cultivo Portal iniciado');
    }

    checkSession() {
        // Verificar si hay una sesión válida
        const session = this.getSession();
        if (session && this.isSessionValid(session)) {
            this.isAuthenticated = true;
            console.log('✅ Sesión válida encontrada');
        } else {
            this.isAuthenticated = false;
            this.clearSession();
            console.log('❌ No hay sesión válida');
        }
        
        // Actualizar botones de sesión
        this.updateSessionButtons();
    }

    updateSessionButtons() {
        const sessionInfoButton = document.getElementById('session-info-button');
        const logoutButton = document.getElementById('logout-button');
        
        if (this.isAuthenticated) {
            if (sessionInfoButton) sessionInfoButton.style.display = 'flex';
            if (logoutButton) logoutButton.style.display = 'flex';
        } else {
            if (sessionInfoButton) sessionInfoButton.style.display = 'none';
            if (logoutButton) logoutButton.style.display = 'none';
        }
    }

    getSession() {
        try {
            const sessionData = localStorage.getItem(this.sessionKey);
            return sessionData ? JSON.parse(sessionData) : null;
        } catch (error) {
            console.error('Error al leer sesión:', error);
            return null;
        }
    }

    saveSession() {
        try {
            const session = {
                authenticated: true,
                timestamp: new Date().toISOString(),
                expiresAt: this.getEndOfDay().toISOString()
            };
            localStorage.setItem(this.sessionKey, JSON.stringify(session));
            console.log('💾 Sesión guardada hasta el final del día');
        } catch (error) {
            console.error('Error al guardar sesión:', error);
        }
    }

    clearSession() {
        try {
            localStorage.removeItem(this.sessionKey);
            console.log('🗑️ Sesión eliminada');
        } catch (error) {
            console.error('Error al eliminar sesión:', error);
        }
    }

    isSessionValid(session) {
        if (!session || !session.expiresAt) {
            return false;
        }

        const now = new Date();
        const expiresAt = new Date(session.expiresAt);
        
        return now < expiresAt;
    }

    getEndOfDay() {
        const now = new Date();
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        return endOfDay;
    }

    getSessionTimeRemaining() {
        const session = this.getSession();
        if (!session || !this.isSessionValid(session)) {
            return 0;
        }

        const now = new Date();
        const expiresAt = new Date(session.expiresAt);
        return expiresAt.getTime() - now.getTime();
    }

    formatTimeRemaining(milliseconds) {
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    }

    setupNavigation() {
        // Configurar navegación por pestañas
        const navButtons = document.querySelectorAll('.nav-button');
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const section = button.getAttribute('data-section');
                this.switchSection(section);
            });
        });
    }

    switchSection(sectionName) {
        // Verificar si necesita autenticación
        if (sectionName === 'cultivo' && !this.isAuthenticated) {
            this.showAuthModal();
            return;
        }

        // Actualizar botones de navegación
        const navButtons = document.querySelectorAll('.nav-button');
        navButtons.forEach(button => {
            button.classList.remove('active');
            if (button.getAttribute('data-section') === sectionName) {
                button.classList.add('active');
            }
        });

        // Ocultar todas las secciones
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Mostrar la sección seleccionada
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionName;
            
            // Cargar actividades si se selecciona esa sección
            if (sectionName === 'actividades') {
                this.actividadesManager.loadActividades();
            }
        }
    }

    setupAuthentication() {
        const authModal = document.getElementById('auth-modal');
        const closeAuthModal = document.getElementById('close-auth-modal');
        const passwordInput = document.getElementById('password-input');
        const submitPassword = document.getElementById('submit-password');
        const passwordError = document.getElementById('password-error');

        // Cerrar modal
        closeAuthModal.addEventListener('click', () => {
            this.hideAuthModal();
        });

        // Cerrar modal al hacer clic fuera
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) {
                this.hideAuthModal();
            }
        });

        // Enviar contraseña con Enter
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.authenticate();
            }
        });

        // Botón de envío
        submitPassword.addEventListener('click', () => {
            this.authenticate();
        });
    }

    showAuthModal() {
        const authModal = document.getElementById('auth-modal');
        const passwordInput = document.getElementById('password-input');
        const passwordError = document.getElementById('password-error');
        
        authModal.style.display = 'block';
        passwordInput.value = '';
        passwordError.style.display = 'none';
        passwordInput.focus();
    }

    hideAuthModal() {
        const authModal = document.getElementById('auth-modal');
        authModal.style.display = 'none';
    }

    authenticate() {
        const passwordInput = document.getElementById('password-input');
        const passwordError = document.getElementById('password-error');
        const password = passwordInput.value;

        if (password === this.cultivoPassword) {
            this.isAuthenticated = true;
            this.saveSession();
            this.updateSessionButtons();
            this.hideAuthModal();
            this.switchSection('cultivo');
            
            const timeRemaining = this.getSessionTimeRemaining();
            const formattedTime = this.formatTimeRemaining(timeRemaining);
            this.showSuccessNotification(`Acceso autorizado a Cultivo. Sesión válida hasta las 23:59 (${formattedTime} restantes)`);
        } else {
            passwordError.style.display = 'block';
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    showSuccessNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'form-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">✅</span>
                <span class="notification-text">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Método para cerrar sesión manualmente
    logout() {
        this.isAuthenticated = false;
        this.clearSession();
        this.updateSessionButtons();
        this.switchSection('registros');
        this.showSuccessNotification('Sesión cerrada exitosamente');
    }

    // Método para mostrar información de la sesión
    showSessionInfo() {
        if (!this.isAuthenticated) {
            this.showSuccessNotification('No hay sesión activa');
            return;
        }

        const timeRemaining = this.getSessionTimeRemaining();
        const formattedTime = this.formatTimeRemaining(timeRemaining);
        this.showSuccessNotification(`Sesión activa. Tiempo restante: ${formattedTime}`);
    }

    setupSessionMonitoring() {
        // Verificar la sesión cada minuto
        setInterval(() => {
            if (this.isAuthenticated) {
                const session = this.getSession();
                if (!session || !this.isSessionValid(session)) {
                    // La sesión ha expirado
                    this.isAuthenticated = false;
                    this.clearSession();
                    this.updateSessionButtons();
                    
                    // Si está en la sección cultivo, redirigir a registros
                    if (this.currentSection === 'cultivo') {
                        this.switchSection('registros');
                    }
                    
                    this.showSuccessNotification('Sesión expirada. Por favor, inicie sesión nuevamente.');
                }
            }
        }, 60000); // Verificar cada minuto
    }

    setupEventListeners() {
        // Botón de registrar evento (ahora en sección Cultivo)
        const registrarEventoBtn = document.getElementById('registrar-evento-btn');
        if (registrarEventoBtn) {
            registrarEventoBtn.addEventListener('click', () => this.showForm('registrarEvento'));
            registrarEventoBtn.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.showForm('registrarEvento');
                }
            });
        }

        // Botón de actividades diarias
        const actividadesDiariasBtn = document.getElementById('actividades-diarias-btn');
        if (actividadesDiariasBtn) {
            actividadesDiariasBtn.addEventListener('click', () => this.showForm('actividadesDiarias'));
            actividadesDiariasBtn.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.showForm('actividadesDiarias');
                }
            });
        }

        // Botón de incidencias
        const incidenciasBtn = document.getElementById('incidencias-btn');
        if (incidenciasBtn) {
            incidenciasBtn.addEventListener('click', () => this.showForm('incidencias'));
            incidenciasBtn.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.showForm('incidencias');
                }
            });
        }

        // Botón de inventario de herramientas
        const inventarioHerramientasBtn = document.getElementById('inventario-herramientas-btn');
        if (inventarioHerramientasBtn) {
            inventarioHerramientasBtn.addEventListener('click', () => this.showForm('inventarioHerramientas'));
            inventarioHerramientasBtn.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.showForm('inventarioHerramientas');
                }
            });
        }

        // Botón de sugerencias
        const sugerenciasBtn = document.getElementById('sugerencias-btn');
        if (sugerenciasBtn) {
            sugerenciasBtn.addEventListener('click', () => this.showForm('sugerencias'));
            sugerenciasBtn.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.showForm('sugerencias');
                }
            });
        }

        // Botón de información de sesión
        const sessionInfoButton = document.getElementById('session-info-button');
        if (sessionInfoButton) {
            sessionInfoButton.addEventListener('click', () => this.showSessionInfo());
        }

        // Botón de cerrar sesión
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => this.logout());
        }

        // Botón de sincronizar actividades
        const syncActividadesBtn = document.getElementById('sync-actividades-btn');
        if (syncActividadesBtn) {
            syncActividadesBtn.addEventListener('click', () => this.actividadesManager.loadActividades());
        }

        // Detectar cambios de conectividad
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // Detectar instalación de PWA
        window.addEventListener('appinstalled', () => this.handleAppInstalled());
    }

    showForm(formType = 'registrarEvento') {
        // URL del formulario de Google desde la configuración
        const googleFormUrl = window.BIOCANN_CONFIG?.forms?.[formType] || 'https://forms.google.com/TU_FORMULARIO_AQUI';
        
        // Abrir formulario en nueva pestaña
        window.open(googleFormUrl, '_blank', 'noopener,noreferrer');
        
        // Mostrar mensaje de confirmación
        this.showFormNotification(formType);
        
        console.log(`📝 Abriendo formulario ${formType} en nueva pestaña`);
    }

    showFormNotification(formType = 'registrarEvento') {
        // Texto personalizado según el tipo de formulario
        const formNames = {
            'registrarEvento': 'Registro de Evento',
            'actividadesDiarias': 'Actividades Diarias',
            'incidencias': 'Registro de Incidencias',
            'inventarioHerramientas': 'Inventario de Herramientas',
            'sugerencias': 'Sugerencias'
        };
        
        const formName = formNames[formType] || 'Formulario';
        
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = 'form-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">📝</span>
                <span class="notification-text">${formName} abierto en nueva pestaña</span>
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
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            window.deferredPrompt = e;
            this.showInstallButton();
        });
    }

    showInstallButton() {
        // Verificar si la app ya está instalada
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return; // No mostrar si ya está instalada
        }

        // Mostrar el botón de instalación
        const installButton = document.getElementById('install-button');
        if (installButton) {
            installButton.style.display = 'flex';
            installButton.addEventListener('click', () => this.installApp());
        }
    }

    installApp() {
        // Lógica de instalación de PWA
        if (window.deferredPrompt) {
            console.log('🚀 Iniciando instalación de PWA...');
            window.deferredPrompt.prompt();
            window.deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('✅ PWA instalada exitosamente');
                    this.showInstallSuccess();
                } else {
                    console.log('❌ Instalación de PWA cancelada');
                    this.showManualInstallInstructions();
                }
                window.deferredPrompt = null;
            });
        } else {
            console.log('⚠️ No se puede instalar la PWA automáticamente');
            this.showManualInstallInstructions();
        }
    }

    showInstallSuccess() {
        const notification = document.createElement('div');
        notification.className = 'form-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">✅</span>
                <span class="notification-text">¡App instalada exitosamente!</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Ocultar botón de instalación
        const installButton = document.getElementById('install-button');
        if (installButton) {
            installButton.style.display = 'none';
        }
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    showManualInstallInstructions() {
        const notification = document.createElement('div');
        notification.className = 'form-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">📱</span>
                <span class="notification-text">Para instalar: Menú → "Instalar app" o "Añadir a pantalla de inicio"</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 8000);
    }

    handleAppInstalled() {
        console.log('🎉 PWA instalada');
        // Ocultar botón de instalación
        const installButton = document.getElementById('install-button');
        if (installButton) {
            installButton.style.display = 'none';
        }
    }

    setupOfflineDetection() {
        // Verificar estado inicial
        if (!navigator.onLine) {
            this.handleOffline();
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
        let offlineMessage = document.querySelector('.offline-message');
        if (!offlineMessage) {
            offlineMessage = document.createElement('div');
            offlineMessage.className = 'offline-message';
            offlineMessage.innerHTML = `
                <span class="offline-icon">📴</span>
                Sin conexión a internet
            `;
            document.body.appendChild(offlineMessage);
        }
        offlineMessage.style.display = 'flex';
    }

    hideOfflineMessage() {
        const offlineMessage = document.querySelector('.offline-message');
        if (offlineMessage) {
            offlineMessage.style.display = 'none';
        }
    }

    setupAutoUpdate() {
        // Verificar actualizaciones una vez al día a las 9:00 AM
        this.scheduleDailyUpdate();
        
        // Verificar si ya se verificó hoy
        const lastCheck = localStorage.getItem('lastUpdateCheck');
        const today = new Date().toDateString();
        
        if (lastCheck !== today) {
            // Verificar ahora si es la primera vez del día
            this.checkForUpdates();
        }
    }

    scheduleDailyUpdate() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        
        const timeUntilTomorrow = tomorrow.getTime() - now.getTime();
        
        setTimeout(() => {
            this.checkForUpdates();
            // Programar para el siguiente día
            this.scheduleDailyUpdate();
        }, timeUntilTomorrow);
    }

    checkForUpdates() {
        const today = new Date().toDateString();
        localStorage.setItem('lastUpdateCheck', today);
        
        // Verificar si hay una nueva versión disponible
        fetch(window.location.href, { cache: 'no-cache' })
            .then(response => response.text())
            .then(() => {
                // Si llegamos aquí, hay una nueva versión
                this.showUpdateNotification();
            })
            .catch(error => {
                console.log('No se pudo verificar actualizaciones:', error);
            });
    }

    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <span class="update-icon">🔄</span>
                <span class="update-text">Nueva versión disponible</span>
                <button class="update-button" onclick="location.reload()">Actualizar</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        notification.style.display = 'block';
        
        // Auto-ocultar después de 30 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 30000);
    }

    updateLinks(linksData) {
        // Método para actualizar enlaces dinámicamente
        console.log('Actualizando enlaces:', linksData);
    }

    addButton(section, icon, text, link, isSecondary = false) {
        // Método para agregar botones dinámicamente
        console.log('Agregando botón:', { section, icon, text, link, isSecondary });
    }
}

// Clase para manejar las actividades
class ActividadesManager {
    constructor() {
        this.actividades = [];
        this.estados = {};
        this.isLoading = false;
    }

    async loadActividades() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.updateSyncStatus('⏳ Sincronizando...', 'loading');
        
        try {
            // Cargar estados guardados desde GitHub
            await this.loadEstadosFromGitHub();
            
            // Cargar datos de Google Sheets
            await this.loadDataFromGoogleSheets();
            
            // Renderizar actividades
            this.renderActividades();
            
            this.updateSyncStatus('✅ Sincronizado', 'success');
            
            setTimeout(() => {
                this.updateSyncStatus('', '');
            }, 3000);
            
        } catch (error) {
            console.error('Error al cargar actividades:', error);
            this.updateSyncStatus('❌ Error al sincronizar', 'error');
            
            setTimeout(() => {
                this.updateSyncStatus('', '');
            }, 5000);
        } finally {
            this.isLoading = false;
        }
    }

    async loadEstadosFromGitHub() {
        try {
            const config = window.BIOCANN_CONFIG.github;
            const url = `https://api.github.com/repos/${config.repo}/contents/${config.estadosFile}`;
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `token ${config.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const content = JSON.parse(atob(data.content));
                this.estados = content.estados || {};
                console.log('✅ Estados cargados desde GitHub');
            } else {
                console.log('⚠️ No se encontró archivo de estados, creando uno nuevo');
                this.estados = {};
            }
        } catch (error) {
            console.error('Error al cargar estados desde GitHub:', error);
            this.estados = {};
        }
    }

    async loadDataFromGoogleSheets() {
        try {
            const config = window.BIOCANN_CONFIG.actividades;
            const sheetUrl = config.googleSheetUrl;
            
            // Convertir URL de Google Sheets a formato de exportación
            const sheetId = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
            if (!sheetId) {
                throw new Error('No se pudo extraer el ID de la hoja');
            }
            
            const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${config.sheetName}`;
            
            const response = await fetch(exportUrl);
            if (!response.ok) {
                throw new Error('No se pudo cargar la hoja de Google Sheets');
            }
            
            const csvText = await response.text();
            this.parseCSVData(csvText);
            
        } catch (error) {
            console.error('Error al cargar datos de Google Sheets:', error);
            throw error;
        }
    }

    parseCSVData(csvText) {
        // Parsear CSV y convertir a array de actividades
        const lines = csvText.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        
        this.actividades = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
            if (values.length >= 3) {
                const actividad = {
                    id: `actividad_${i}`,
                    tarea: values[0] || '',
                    prioridad: parseInt(values[1]) || 999,
                    estado: values[2] || 'Pendiente'
                };
                
                // Usar estado guardado si existe, sino el de la hoja
                if (this.estados[actividad.id]) {
                    actividad.estado = this.estados[actividad.id];
                }
                
                this.actividades.push(actividad);
            }
        }
        
        // Ordenar por prioridad (1 = más importante)
        this.actividades.sort((a, b) => a.prioridad - b.prioridad);
        
        console.log(`✅ ${this.actividades.length} actividades cargadas`);
    }

    renderActividades() {
        const container = document.getElementById('actividades-container');
        if (!container) return;
        
        if (this.actividades.length === 0) {
            container.innerHTML = `
                <div class="placeholder-message">
                    <span class="placeholder-icon">📋</span>
                    <p>No se encontraron actividades</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.actividades.map(actividad => this.createActividadCard(actividad)).join('');
        
        // Agregar event listeners a los dropdowns
        this.actividades.forEach(actividad => {
            const dropdown = document.getElementById(`estado-${actividad.id}`);
            if (dropdown) {
                dropdown.addEventListener('change', (e) => {
                    this.updateEstado(actividad.id, e.target.value);
                });
            }
        });
    }

    createActividadCard(actividad) {
        const config = window.BIOCANN_CONFIG.actividades;
        const estados = config.estados;
        const isBloqueada = actividad.estado === 'Bloqueada';
        
        return `
            <div class="actividad-card ${isBloqueada ? 'bloqueada' : ''}" data-id="${actividad.id}">
                <div class="prioridad-indicator prioridad-${actividad.prioridad}"></div>
                <div class="actividad-tarea">${actividad.tarea}</div>
                <div class="actividad-estado">
                    <span class="estado-label">Estado:</span>
                    <select id="estado-${actividad.id}" class="estado-dropdown estado-${actividad.estado.toLowerCase().replace(' ', '-')}">
                        ${estados.map(estado => 
                            `<option value="${estado}" ${actividad.estado === estado ? 'selected' : ''}>
                                ${estado}
                            </option>`
                        ).join('')}
                    </select>
                </div>
            </div>
        `;
    }

    async updateEstado(actividadId, nuevoEstado) {
        try {
            // Actualizar estado local
            this.estados[actividadId] = nuevoEstado;
            
            // Actualizar visual
            const card = document.querySelector(`[data-id="${actividadId}"]`);
            if (card) {
                card.className = `actividad-card ${nuevoEstado === 'Bloqueada' ? 'bloqueada' : ''}`;
                
                const dropdown = document.getElementById(`estado-${actividadId}`);
                if (dropdown) {
                    dropdown.className = `estado-dropdown estado-${nuevoEstado.toLowerCase().replace(' ', '-')}`;
                }
            }
            
            // Guardar en GitHub
            await this.saveEstadosToGitHub();
            
            console.log(`✅ Estado actualizado: ${actividadId} -> ${nuevoEstado}`);
            
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            // Revertir cambio visual en caso de error
            this.renderActividades();
        }
    }

    async saveEstadosToGitHub() {
        try {
            const config = window.BIOCANN_CONFIG.github;
            const url = `https://api.github.com/repos/${config.repo}/contents/${config.estadosFile}`;
            
            // Obtener SHA del archivo actual
            const getResponse = await fetch(url, {
                headers: {
                    'Authorization': `token ${config.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            let sha = null;
            if (getResponse.ok) {
                const data = await getResponse.json();
                sha = data.sha;
            }
            
            // Preparar contenido
            const content = {
                lastUpdate: new Date().toISOString(),
                estados: this.estados,
                metadata: {
                    version: "1.0.0",
                    description: "Estados de actividades de Biocann Cultivo",
                    updated: new Date().toISOString()
                }
            };
            
            const contentBase64 = btoa(JSON.stringify(content, null, 2));
            
            // Actualizar archivo
            const updateResponse = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${config.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `Actualizar estados de actividades - ${new Date().toLocaleString()}`,
                    content: contentBase64,
                    sha: sha
                })
            });
            
            if (updateResponse.ok) {
                console.log('✅ Estados guardados en GitHub');
            } else {
                throw new Error('Error al guardar en GitHub');
            }
            
        } catch (error) {
            console.error('Error al guardar estados en GitHub:', error);
            throw error;
        }
    }

    updateSyncStatus(message, type) {
        const statusElement = document.getElementById('sync-status');
        if (!statusElement) return;
        
        const iconElement = statusElement.querySelector('.status-icon');
        const textElement = statusElement.querySelector('.status-text');
        
        if (iconElement && textElement) {
            iconElement.textContent = message.split(' ')[0];
            textElement.textContent = message.split(' ').slice(1).join(' ');
            
            statusElement.className = `sync-status ${type}`;
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.biocannPortal = new BiocannPortal();
}); 