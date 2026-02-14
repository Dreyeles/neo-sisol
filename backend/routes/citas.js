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

        // Capacidad máxima por turno
        const CAPACIDAD_POR_TURNO = 10;

        // Función auxiliar para contar citas en un turno
        const contarCitas = async (medicoId, fechaCita, turnoCita) => {
            let inicio, fin;
            if (turnoCita === 'manana') {
                inicio = '07:00:00';
                fin = '12:00:00';
            } else if (turnoCita === 'tarde') {
                inicio = '14:00:00';
                fin = '19:00:00';
            } else {
                return null;
            }

            const [result] = await db.query(
                `SELECT COUNT(*) as total 
                 FROM cita 
                 WHERE id_medico = ? 
                 AND fecha_cita = ? 
                 AND hora_cita >= ? 
                 AND hora_cita < ?
                 AND estado NOT IN ('cancelada', 'no_asistio')`,
                [medicoId, fechaCita, inicio, fin]
            );
            return result[0].total;
        };

        // 1. Contar citas del turno solicitado
        const citasTurnoSolicitado = await contarCitas(id_medico, fecha, turno);
        if (citasTurnoSolicitado === null) {
            return res.status(400).json({ status: 'ERROR', message: 'Turno inválido' });
        }

        const cuposRestantes = Math.max(0, CAPACIDAD_POR_TURNO - citasTurnoSolicitado);
        const disponible = cuposRestantes > 0;

        // 2. Si no hay disponibilidad, buscar alternativa en el otro turno
        let sugerencia = null;
        if (!disponible) {
            const otroTurno = turno === 'manana' ? 'tarde' : 'manana';
            const citasOtroTurno = await contarCitas(id_medico, fecha, otroTurno);
            if (citasOtroTurno < CAPACIDAD_POR_TURNO) {
                sugerencia = {
                    turno: otroTurno,
                    mensaje: `El turno ${turno} está lleno, pero aún hay cupos disponibles por la ${otroTurno}.`,
                    cupos: CAPACIDAD_POR_TURNO - citasOtroTurno
                };
            } else {
                sugerencia = {
                    mensaje: 'Lo sentimos, ambos turnos para este día están completos.'
                };
            }
        }

        res.json({
            status: 'OK',
            available: disponible,
            citasAgendadas: citasTurnoSolicitado,
            cuposRestantes,
            capacidad: CAPACIDAD_POR_TURNO,
            sugerencia,
            message: disponible
                ? `Horario disponible (${cuposRestantes} cupos restantes)`
                : (sugerencia?.turno
                    ? sugerencia.mensaje
                    : 'Horario no disponible para este día')
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
