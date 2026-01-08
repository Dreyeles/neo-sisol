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

// Obtener citas por paciente
router.get('/paciente/:id_paciente', async (req, res) => {
    try {
        const { id_paciente } = req.params;
        const [citas] = await db.query(
            `SELECT c.id_cita, c.fecha_cita, c.hora_cita, c.estado, c.motivo_consulta,
                    m.nombres as medico_nombre, m.apellidos as medico_apellido, 
                    e.nombre as especialidad,
                    am.id_atencion, am.examenes_solicitados, am.diagnostico, 
                    am.receta_medica, am.tratamiento, am.observaciones
             FROM cita c
             JOIN medico m ON c.id_medico = m.id_medico
             JOIN especialidades e ON m.id_especialidad = e.id_especialidad
             LEFT JOIN atencion_medica am ON c.id_cita = am.id_cita
             WHERE c.id_paciente = ?
             ORDER BY c.fecha_cita DESC, c.hora_cita DESC`,
            [id_paciente]
        );

        // Formatear fechas para el frontend
        const citasFormateadas = citas.map(cita => ({
            ...cita,
            fechaFormatted: new Date(cita.fecha_cita).toLocaleDateString('es-ES', {
                day: 'numeric', month: 'long', year: 'numeric'
            })
        }));

        res.json({ status: 'OK', data: citasFormateadas });
    } catch (error) {
        console.error('Error al obtener citas del paciente:', error);
        res.status(500).json({ status: 'ERROR', message: 'Error al obtener citas' });
    }
});

// Obtener citas por médico
router.get('/medico/:id_medico', async (req, res) => {
    try {
        const { id_medico } = req.params;
        const [citas] = await db.query(
            `SELECT c.id_cita, c.fecha_cita, c.hora_cita, c.estado, c.motivo_consulta, c.id_paciente,
                    p.nombres as paciente_nombre, p.apellidos as paciente_apellido, p.dni
             FROM cita c
             JOIN paciente p ON c.id_paciente = p.id_paciente
             WHERE c.id_medico = ?
             ORDER BY c.fecha_cita ASC, c.hora_cita ASC`,
            [id_medico]
        );

        // Formatear fechas
        const citasFormateadas = citas.map(cita => ({
            ...cita,
            fechaFormatted: new Date(cita.fecha_cita).toLocaleDateString('es-ES', {
                day: 'numeric', month: 'long', year: 'numeric'
            })
        }));

        res.json({ status: 'OK', data: citasFormateadas });
    } catch (error) {
        console.error('Error al obtener citas del médico:', error);
        res.status(500).json({ status: 'ERROR', message: 'Error al obtener citas' });
    }
});

export default router;
