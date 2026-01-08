# SISOL - Sistema de Citas Médicas

Este proyecto es un sistema integral de gestión de citas médicas desarrollado con React (Frontend) y Node.js/Express (Backend).

## 🚀 Guía de Instalación para Colaboradores

Para que un compañero pueda probar el proyecto en su propia máquina (Antigravity u otro entorno local), debe seguir estos pasos:

### 1. Requisitos Previos

*   **Node.js** (v18 o superior)
*   **MySQL** (Workbench recomendado para la gestión de la BD)

### 2. Clonar e Instalar

1.  **Clonar el repositorio:**
    ```bash
    git clone <url-del-repositorio>
    cd "neo sisol"
    ```

2.  **Instalar dependencias del Frontend (desde la raíz):**
    ```bash
    npm install
    ```

3.  **Instalar dependencias del Backend:**
    ```bash
    cd backend
    npm install
    cd ..
    ```

### 3. Configuración de la Base de Datos 🗄️

Como la base de datos es local, cada compañero **debe ejecutar los scripts en su propio Workbench**:

1.  **Crear la base de datos:** Ejecuta el archivo `init-database.sql` que está en la raíz del proyecto.
2.  **Crear el esquema:** Ejecuta el archivo `database/schema.sql`.
3.  **Cargar datos iniciales (Seeds):** Ejecuta los scripts en la carpeta `database/` en el siguiente orden:
    - `populate-especialidades.sql`
    - `seed_medicos.sql`
    - `seed_disponibilidades.sql`
    - `create_admin.sql` (para tener acceso de administrador)

### 4. Variables de Entorno

En la carpeta `backend/`, crea un archivo llamado `.env` basándote en el archivo `.env.example`:

1.  Copia `backend/.env.example` y renómbralo a `backend/.env`.
2.  Edita `backend/.env` con tus credenciales locales de MySQL:
    ```env
    DB_PASSWORD=tu_contraseña_de_mysql
    ```

### 5. Ejecutar el Proyecto

Desde la **carpeta raíz**, ejecuta:

```bash
npm start
```

Esto iniciará simultáneamente el frontend (`http://localhost:3000`) y el backend (`http://localhost:5000`).

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React 18, Vite, Lucide React, jspdf.
- **Backend:** Node.js, Express, MySQL2.
- **Herramientas:** Concurrently (para ejecución simultánea).

## 📊 Verificación de Conexión

Una vez iniciado el servidor, puedes probar la conexión a la base de datos en:
`http://localhost:5000/api/test-db`
