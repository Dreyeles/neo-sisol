import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Obtener todos los pacientes (para admin)
router.get('/', async (req, res) => {
    try {
        const [pacientes] = await db.query(
            `SELECT p.*, u.email, u.estado as usuario_estado
             FROM paciente p
             JOIN usuarios u ON p.id_usuario = u.id_usuario
             ORDER BY p.apellidos ASC`
        );

        res.json({
            status: 'OK',
            data: pacientes
        });
    } catch (error) {
        console.error('Error al obtener pacientes:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al obtener pacientes',
            error: error.message
        });
    }
});

// Buscar pacientes
router.get('/buscar', async (req, res) => {
    try {
        const { q, fecha } = req.query;
        let params = [];
        let sql = `SELECT DISTINCT p.id_paciente, p.nombres, p.apellidos, p.dni, p.fecha_nacimiento, p.genero, p.telefono
                   FROM paciente p`;

        let whereConditions = [];

        // Si hay fecha, hacemos JOIN con cita
        if (fecha) {
            sql += ` JOIN cita c ON p.id_paciente = c.id_paciente`;
            whereConditions.push(`DATE(c.fecha_cita) = ?`);
            params.push(fecha);
        }

        if (q) {
            whereConditions.push(`(p.nombres LIKE ? OR p.apellidos LIKE ? OR p.dni LIKE ?)`);
            params.push(`%${q}%`, `%${q}%`, `%${q}%`);
        }

        if (whereConditions.length > 0) {
            sql += ` WHERE ` + whereConditions.join(' AND ');
        }

        sql += ` ORDER BY p.apellidos ASC LIMIT 20`;

        const [pacientes] = await db.query(sql, params);

        res.json({
            status: 'OK',
            data: pacientes
        });
    } catch (error) {
        console.error('Error al buscar pacientes:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al buscar pacientes',
            error: error.message
        });
    }
});

// Obtener detalles de un paciente
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [pacientes] = await db.query(
            `SELECT * FROM paciente WHERE id_paciente = ?`,
            [id]
        );

        if (pacientes.length === 0) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Paciente no encontrado'
            });
        }

        res.json({
            status: 'OK',
            data: pacientes[0]
        });
    } catch (error) {
        console.error('Error al obtener paciente:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al obtener paciente'
        });
    }
});

// Obtener perfil médico completo (Datos + Historial Médico)
router.get('/perfil-medico/:id_paciente', async (req, res) => {
    try {
        const { id_paciente } = req.params;

        // Obtener datos básicos
        const [paciente] = await db.query(
            `SELECT * FROM paciente WHERE id_paciente = ?`,
            [id_paciente]
        );

        if (paciente.length === 0) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Paciente no encontrado'
            });
        }

        // Obtener historial médico
        const [historial] = await db.query(
            `SELECT * FROM historial_medico WHERE id_paciente = ?`,
            [id_paciente]
        );

        res.json({
            status: 'OK',
            data: {
                ...paciente[0],
                historial_medico: historial.length > 0 ? historial[0] : null
            }
        });
    } catch (error) {
        console.error('Error al obtener perfil médico:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al obtener perfil médico'
        });
    }
});

export default router;
