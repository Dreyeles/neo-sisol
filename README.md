# Página de Login con React

Una página de login moderna y responsive construida con React y Vite.

## Características

- ✨ Diseño moderno y atractivo
- 📱 Completamente responsive
- ✅ Validación de formulario en tiempo real
- 🎨 Animaciones suaves
- 🔒 Manejo de estados de carga
- 💫 Gradientes y efectos visuales

## Instalación

1. Instala las dependencias:
```bash
npm install
```

## Uso

Para ejecutar la aplicación en modo desarrollo:
```bash
npm run dev
```

La aplicación se abrirá automáticamente en `http://localhost:3000`

Para construir la aplicación para producción:
```bash
npm run build
```

## Estructura del Proyecto

```
├── src/
│   ├── components/
│   │   ├── Login.jsx       # Componente principal de login
│   │   └── Login.css       # Estilos del componente Login
│   ├── App.jsx             # Componente principal de la aplicación
│   ├── App.css             # Estilos globales
│   └── main.jsx            # Punto de entrada de React
├── index.html              # HTML principal
├── vite.config.js          # Configuración de Vite
└── package.json            # Dependencias y scripts
```

## Personalización

### Conectar con tu API

Para conectar el login con tu backend, edita el archivo `src/components/Login.jsx` y descomenta la sección de la petición fetch. Ajusta la URL según tu servidor:

```javascript
const response = await fetch('http://localhost:9090/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
});
```

## Tecnologías Utilizadas

- React 18
- Vite
- CSS3

