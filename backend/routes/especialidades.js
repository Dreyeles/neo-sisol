import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Obtener todas las especialidades activas
router.get('/', async (req, res) => {
    try {
        const [especialidades] = await db.query(
            'SELECT id_especialidad, nombre, descripcion FROM especialidades WHERE estado = ? ORDER BY nombre ASC',
            ['activo']
        );

        res.json({
            status: 'OK',
            data: especialidades
        });
    } catch (error) {
        console.error('Error al obtener especialidades:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al obtener especialidades',
            error: error.message
        });
    }
});

// Obtener una especialidad por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [especialidad] = await db.query(
            'SELECT * FROM especialidades WHERE id_especialidad = ?',
            [id]
        );

        if (especialidad.length === 0) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Especialidad no encontrada'
            });
        }

        res.json({
            status: 'OK',
            data: especialidad[0]
        });
    } catch (error) {
        console.error('Error al obtener especialidad:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al obtener especialidad',
            error: error.message
        });
    }
});

export default router;
