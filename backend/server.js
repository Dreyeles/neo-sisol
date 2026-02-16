import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './config/database.js';
import fs from 'fs';

// Importar rutas
import authRoutes from './routes/auth.js';
import especialidadesRoutes from './routes/especialidades.js';
import medicoRoutes from './routes/medicos.js';
import citaRoutes from './routes/citas.js';
import pagosRoutes from './routes/pagos.js';
import atencionRoutes from './routes/atencion.js';
import pacienteRoutes from './routes/pacientes.js';
import serviciosRoutes from './routes/servicios.js';
import archivosRoutes from './routes/archivos.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de diagnóstico: Log de peticiones
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'API funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// Ruta de prueba de conexión a BD
app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT COUNT(*) as total FROM especialidades');
        res.json({
            status: 'OK',
            message: 'Conexión a base de datos exitosa',
            especialidades: rows[0].total
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al conectar con la base de datos',
            error: error.message
        });
    }
});

// Configuración de rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/especialidades', especialidadesRoutes);
app.use('/api/medicos', medicoRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/atencion', atencionRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/archivos', archivosRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Servir archivos estáticos del frontend en producción
const distPath = path.join(__dirname, '../dist');
console.log(`🔍 Verificando carpeta dist en: ${distPath}`);

if (fs.existsSync(distPath)) {
    console.log('✅ Carpeta dist encontrada');
    app.use(express.static(distPath));
} else {
    console.warn('⚠️ ADVERTENCIA: Carpeta dist NO encontrada. Asegúrate de ejecutar npm run build');
}

// Manejar cualquier otra ruta con el index.html del frontend (para SPA)
app.get('*', (req, res, next) => {
    // Si la ruta empieza con /api, dejar que pase al manejador de 404 de la API
    if (req.path.startsWith('/api')) {
        return next();
    }

    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Frontend no encontrado. Por favor espera a que termine el build o verifica los logs.');
    }
});

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        status: 'ERROR',
        message: 'Ruta no encontrada'
    });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'ERROR',
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
    console.log(`📊 Health check: /api/health`);
    console.log(`🗄️  Test DB: /api/test-db`);
});
