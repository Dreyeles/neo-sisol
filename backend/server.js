import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './config/database.js';

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
app.use(express.static(distPath));

// Manejar cualquier otra ruta con el index.html del frontend (para SPA)
app.get('*', (req, res, next) => {
    // Si la ruta empieza con /api, dejar que pase al manejador de 404 de la API
    if (req.path.startsWith('/api')) {
        return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
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
