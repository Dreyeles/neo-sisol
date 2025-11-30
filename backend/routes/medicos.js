import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Obtener médicos por especialidad
router.get('/por-especialidad/:id_especialidad', async (req, res) => {
    try {
        const { id_especialidad } = req.params;

        const [medicos] = await db.query(
            `SELECT m.id_medico, m.nombres, m.apellidos, m.horario_atencion 
             FROM medico m 
             WHERE m.id_especialidad = ? AND m.estado = 'activo'`,
            [id_especialidad]
        );

        res.json({
            status: 'OK',
            data: medicos
        });
    } catch (error) {
        console.error('Error al obtener médicos:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al obtener médicos',
            error: error.message
        });
    }
});

export default router;
