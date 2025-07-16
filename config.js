// Configuración de Biocann - Cultivo
const BIOCANN_CONFIG = {
    // URLs de formularios
    forms: {
        registrarEvento: 'https://forms.google.com/TU_FORMULARIO_AQUI', // Reemplazar con tu URL real
        // Agregar más formularios aquí cuando sea necesario
    },
    
    // Configuración de la app
    app: {
        name: 'Biocann - Cultivo',
        version: '1.0.0',
        theme: 'dark'
    },
    
    // Configuración de PWA
    pwa: {
        cacheName: 'biocann-cultivo-v1.0.0',
        offlineMessage: 'Sin conexión - Algunas funciones pueden no estar disponibles'
    }
};

// Exportar para uso global
window.BIOCANN_CONFIG = BIOCANN_CONFIG; 