// Configuración de Biocann - Cultivo
const BIOCANN_CONFIG = {
    // URLs de formularios
    forms: {
        registrarEvento: 'https://docs.google.com/forms/d/e/1FAIpQLSfe6hrLISqkk_gERxCubZ3DDlG0mg1zduODl8aewEeqrHB4ow/viewform',
        actividadesDiarias: 'https://docs.google.com/forms/d/e/1FAIpQLSf1_bZ2M4a8T_4k8BSCYAWOlJn5CNTbgtcSLZLH9hCQ9ql5aA/viewform?usp=sharing&ouid=116634953892944823556',
        incidencias: 'https://docs.google.com/forms/d/e/1FAIpQLSfQYX6ovvs_0knd3M0FqxGY4ZqzMRMjAgRo3k82TuvIiru2oA/viewform?usp=dialog',
        inventarioHerramientas: 'https://docs.google.com/spreadsheets/d/1qK1LW1pI1YWcZFC9ti92_nC0DpJzDkc6AszFrzw3ISI/edit?usp=sharing',
        sugerencias: 'https://docs.google.com/forms/d/e/1FAIpQLSdmM13A3_XIP2msI7ab0DIaLOcGnUDbR4-9fPZp9EU0Rnce7Q/viewform?usp=header',
        riego: 'https://docs.google.com/forms/d/e/1FAIpQLScaUhjc037BEUK2pbMhuNiGeyIdsPvGwMfSOVugjqF5VzigZg/viewform?usp=dialog',
        // Agregar más formularios aquí cuando sea necesario
    },
    
    // Configuración de actividades
    actividades: {
        googleSheetUrl: 'https://docs.google.com/spreadsheets/d/1wcHncke8jdChfmcG-RjuOdZdSY0awN5Acg106WlO0Mw/edit?gid=0#gid=0',
        sheetName: 'ACTUAL',
        estados: ['Pendiente', 'En proceso', 'Completada', 'Bloqueada'],
        estadosColores: {
            'Pendiente': '#00d4aa',
            'En proceso': '#ffa500',
            'Completada': '#4caf50',
            'Bloqueada': '#ff6b6b'
        }
    },
    
    // Configuración de GitHub API
    github: {
        token: 'YOUR_GITHUB_TOKEN_HERE', // Reemplazar con token real
        repo: 'lucasfdelaguila/cultivo',
        branch: 'main',
        estadosFile: 'actividades-estados.json'
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