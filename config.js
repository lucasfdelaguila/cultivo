// Configuración de Biocann - Cultivo
const BIOCANN_CONFIG = {
    // URLs de formularios
    forms: {
        registrarEvento: 'https://docs.google.com/forms/d/e/1FAIpQLSfe6hrLISqkk_gERxCubZ3DDlG0mg1zduODl8aewEeqrHB4ow/viewform',
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