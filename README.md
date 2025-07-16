# 🌱 Biocann - Cultivo

Portal de acceso a módulos y formularios de Biocann Cultivo. Una Progressive Web App (PWA) diseñada para funcionar como punto central de acceso a todos los sistemas y formularios del cultivo.

## 🚀 Características

- **PWA Completa**: Instalable en dispositivos móviles y desktop
- **Tema Blanco y Negro**: Diseño minimalista y profesional
- **Portal de Acceso**: Botones organizados por categorías
- **Funcionalidad Offline**: Service Worker para funcionamiento sin conexión
- **Responsive**: Optimizada para todos los dispositivos
- **Iconos Personalizables**: Generador de iconos incluido

## 📁 Estructura del Proyecto

```
appcultivo/
├── index.html              # Página principal
├── styles.css              # Estilos CSS
├── app.js                  # Lógica principal de la app
├── manifest.json           # Configuración PWA
├── sw.js                   # Service Worker
├── sw-register.js          # Registro del Service Worker
├── icon-generator.html     # Generador de iconos
├── logo.png               # Logo de Biocann (agregar tu imagen)
├── icons/                 # Carpeta para iconos generados
└── README.md              # Este archivo
```

## 🎨 Personalización

### Generar Iconos

1. Abre `icon-generator.html` en tu navegador
2. Arrastra tu logo o haz clic para seleccionarlo
3. Ajusta el color de fondo (por defecto: negro #000000)
4. Ajusta el tamaño del logo (por defecto: 80%)
5. Haz clic en "🚀 Generar Todos los Iconos PWA"
6. Se descargará un archivo ZIP con todos los iconos
7. Extrae los iconos a la carpeta `icons/`

### Configurar Enlaces

Edita el archivo `index.html` para cambiar los enlaces de los botones:

```html
<button class="portal-button" data-link="TU_ENLACE_AQUI">
    <span class="button-icon">📊</span>
    <span class="button-text">Nombre del Módulo</span>
</button>
```

### Agregar Nuevos Botones

Puedes agregar botones dinámicamente usando JavaScript:

```javascript
// Agregar botón a módulos principales
window.biocannPortal.addButton(
    'Módulos Principales', 
    '🔧', 
    'Nuevo Módulo', 
    'https://tu-enlace.com',
    false
);

// Agregar botón a formularios rápidos
window.biocannPortal.addButton(
    'Formularios Rápidos', 
    '📝', 
    'Nuevo Formulario', 
    'https://tu-enlace.com',
    true
);
```

## 🚀 Instalación y Uso

### Desarrollo Local

1. Clona o descarga este proyecto
2. Agrega tu logo como `logo.png` en la raíz
3. Genera los iconos usando `icon-generator.html`
4. Abre `index.html` en tu navegador

### Servidor Local

Para probar la PWA correctamente, necesitas un servidor HTTPS:

```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (npx)
npx serve .

# Con PHP
php -S localhost:8000
```

### Despliegue

1. Sube todos los archivos a tu servidor web
2. Asegúrate de que el servidor tenga HTTPS habilitado
3. La PWA estará disponible para instalar

## 📱 Instalación en Dispositivos

### Android (Chrome)
1. Abre la app en Chrome
2. Toca el menú (⋮) → "Instalar app"
3. Confirma la instalación

### iOS (Safari)
1. Abre la app en Safari
2. Toca el botón compartir (□↑)
3. Selecciona "Añadir a pantalla de inicio"

### Desktop (Chrome/Edge)
1. Abre la app en el navegador
2. Busca el icono de instalación en la barra de direcciones
3. Haz clic en "Instalar"

## 🔧 Configuración Avanzada

### Modificar el Manifest

Edita `manifest.json` para cambiar:
- Nombre de la app
- Colores del tema
- Orientación
- Categorías

### Personalizar el Service Worker

Edita `sw.js` para:
- Cambiar la estrategia de cache
- Agregar más recursos al cache
- Modificar el comportamiento offline

### Agregar Módulos

Para agregar nuevos módulos:

1. Crea la carpeta del módulo
2. Agrega el enlace en `index.html`
3. Actualiza el Service Worker si es necesario

## 🎯 Módulos Incluidos

### Módulos Principales
- 📊 **Inventario**: Gestión de inventario
- 🌱 **Cultivo**: Seguimiento de cultivos
- 🔬 **Laboratorio**: Análisis y resultados
- 📈 **Reportes**: Generación de reportes

### Formularios Rápidos
- ⚡ **Registro Diario**: Entradas diarias
- 📝 **Incidencias**: Reporte de problemas
- 🔧 **Mantenimiento**: Tareas de mantenimiento
- 📋 **Checklist**: Listas de verificación

## 🔒 Seguridad

- Todos los enlaces externos se abren en nuevas pestañas
- No se almacenan datos sensibles localmente
- Service Worker solo cachea recursos estáticos

## 📞 Soporte

Si tienes problemas:

1. Verifica que el servidor tenga HTTPS
2. Revisa la consola del navegador para errores
3. Confirma que todos los archivos estén en su lugar
4. Prueba en diferentes navegadores

## 🎨 Personalización de Colores

El tema actual usa:
- **Fondo**: #000000 (negro)
- **Texto**: #ffffff (blanco)
- **Bordes**: #333333 (gris oscuro)
- **Botones**: Blanco con texto negro

Para cambiar los colores, edita `styles.css`.

---

**¡Con esta configuración tu portal Biocann - Cultivo estará listo para usar!** 🚀 