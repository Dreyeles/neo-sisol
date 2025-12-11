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

// Obtener pacientes atendidos por un médico
router.get('/:id_medico/pacientes', async (req, res) => {
    try {
        const { id_medico } = req.params;

        const [pacientes] = await db.query(
            `SELECT DISTINCT p.id_paciente, p.nombres, p.apellidos, p.dni, p.genero,
                    MAX(c.fecha_cita) as ultima_cita
             FROM paciente p
             JOIN cita c ON p.id_paciente = c.id_paciente
             WHERE c.id_medico = ? AND c.estado = 'completada'
             GROUP BY p.id_paciente, p.nombres, p.apellidos, p.dni, p.genero
             ORDER BY ultima_cita DESC`,
            [id_medico]
        );

        res.json({
            status: 'OK',
            data: pacientes
        });
    } catch (error) {
        console.error('Error al obtener pacientes del médico:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al obtener pacientes',
            error: error.message
        });
    }
});

export default router;
