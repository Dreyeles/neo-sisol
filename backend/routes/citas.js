import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Verificar disponibilidad
router.post('/check-availability', async (req, res) => {
    try {
        const { id_medico, fecha, turno } = req.body;

        if (!id_medico || !fecha || !turno) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Faltan datos requeridos'
            });
        }

        // Definir rango de horas según el turno
        let horaInicio, horaFin;
        if (turno === 'manana') {
            horaInicio = '07:00:00';
            horaFin = '12:00:00';
        } else if (turno === 'tarde') {
            horaInicio = '14:00:00';
            horaFin = '19:00:00';
        } else {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Turno inválido'
            });
        }

        // Contar citas existentes para ese médico en ese rango de fecha y hora
        // Nota: Asumimos una capacidad máxima por turno, por ejemplo 10 citas.
        // En un sistema real, esto podría estar configurado por médico.
        const CAPACIDAD_POR_TURNO = 10;

        const [result] = await db.query(
            `SELECT COUNT(*) as total 
             FROM cita 
             WHERE id_medico = ? 
             AND fecha_cita = ? 
             AND hora_cita >= ? 
             AND hora_cita < ?
             AND estado NOT IN ('cancelada', 'no_asistio')`,
            [id_medico, fecha, horaInicio, horaFin]
        );

        const citasAgendadas = result[0].total;
        const disponible = citasAgendadas < CAPACIDAD_POR_TURNO;

        res.json({
            status: 'OK',
            available: disponible,
            citasAgendadas,
            capacidad: CAPACIDAD_POR_TURNO,
            message: disponible ? 'Horario disponible' : 'Horario no disponible'
        });

    } catch (error) {
        console.error('Error al verificar disponibilidad:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al verificar disponibilidad',
            error: error.message
        });
    }
});

export default router;
