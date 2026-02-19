import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Verificar disponibilidad de todo el día (ambos turnos)
router.post('/check-full-day-availability', async (req, res) => {
    try {
        const { id_medico, fecha } = req.body;
        if (!id_medico || !fecha) {
            return res.status(400).json({ status: 'ERROR', message: 'Faltan datos' });
        }

        const [year, month, day] = fecha.split('-').map(Number);
        const fechaObj = new Date(year, month - 1, day);
        const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const diaSemanaIndex = fechaObj.getDay();
        const diaNombre = diasSemana[diaSemanaIndex];

        if (diaSemanaIndex === 0) {
            return res.json({
                status: 'OK',
                availability: {
                    manana: { disponible: false, cupos: 0, total: 0, message: 'Los domingos no hay atención' },
                    tarde: { disponible: false, cupos: 0, total: 0, message: 'Los domingos no hay atención' }
                }
            });
        }

        // Obtener disponibilidades para ese día
        const [disps] = await db.query(
            `SELECT hora_inicio, hora_fin, intervalo_minutos 
             FROM disponibilidad 
             WHERE id_medico = ? AND dia_semana = ? 
             AND ? BETWEEN fecha_inicio_vigencia AND fecha_fin_vigencia 
             AND estado = 'activo'`,
            [id_medico, diaNombre, fecha]
        );

        const result = {
            manana: { disponible: false, cupos: 0, total: 0 },
            tarde: { disponible: false, cupos: 0, total: 0 }
        };

        for (const disp of disps) {
            const turno = disp.hora_inicio < '14:00:00' ? 'manana' : 'tarde';

            // Calcular capacidad
            const [h1, m1] = disp.hora_inicio.split(':').map(Number);
            const [h2, m2] = disp.hora_fin.split(':').map(Number);
            const capacidad = Math.floor(((h2 * 60 + m2) - (h1 * 60 + m1)) / (disp.intervalo_minutos || 30));

            // Contar citas
            const [citas] = await db.query(
                `SELECT COUNT(*) as total FROM cita 
                 WHERE id_medico = ? AND fecha_cita = ? 
                 AND hora_cita >= ? AND hora_cita < ? 
                 AND estado NOT IN ('cancelada', 'no_asistio')`,
                [id_medico, fecha, disp.hora_inicio, disp.hora_fin]
            );

            const ocupados = citas[0].total;
            result[turno] = {
                disponible: ocupados < capacidad,
                cupos: Math.max(0, capacidad - ocupados),
                total: capacidad
            };
        }

        res.json({ status: 'OK', availability: result });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ status: 'ERROR', message: error.message });
    }
});

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

        // 1. Obtener la disponibilidad configurada para el médico y fecha
        const [year, month, day] = fecha.split('-').map(Number);
        const fechaObj = new Date(year, month - 1, day);
        const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const diaSemanaIndex = fechaObj.getDay();
        const diaNombre = diasSemana[diaSemanaIndex];

        if (diaSemanaIndex === 0) {
            return res.json({
                status: 'OK',
                available: false,
                message: 'No hay atención los días domingo.',
                sugerencia: { mensaje: 'Por favor selecciona un día de lunes a sábado.' }
            });
        }

        const [dispRows] = await db.query(
            `SELECT id_disponibilidad, hora_inicio, hora_fin, intervalo_minutos 
             FROM disponibilidad 
             WHERE id_medico = ? 
             AND dia_semana = ? 
             AND ? BETWEEN fecha_inicio_vigencia AND fecha_fin_vigencia
             AND estado = 'activo'
             AND (
                 (? = 'manana' AND hora_inicio < '14:00:00') OR
                 (? = 'tarde' AND hora_inicio >= '14:00:00')
             )`,
            [id_medico, diaNombre, fecha, turno, turno]
        );

        if (dispRows.length === 0) {
            return res.json({
                status: 'OK',
                available: false,
                message: 'El médico no tiene disponibilidad programada para este día/turno.',
                sugerencia: { mensaje: 'Intenta seleccionar otro día o turno.' }
            });
        }

        const disp = dispRows[0];

        // Calcular capacidad basada en el intervalo (por ejemplo: si son 6 horas con intervalos de 30 min = 12 cupos)
        const [h1, m1] = disp.hora_inicio.split(':').map(Number);
        const [h2, m2] = disp.hora_fin.split(':').map(Number);
        const diffMinutos = (h2 * 60 + m2) - (h1 * 60 + m1);
        const CAPACIDAD_REAL = Math.floor(diffMinutos / (disp.intervalo_minutos || 30));

        // Función auxiliar para contar citas en un turno real
        const contarCitasReal = async (medicoId, fechaCita, horaInicio, horaFin) => {
            const [result] = await db.query(
                `SELECT COUNT(*) as total 
                 FROM cita 
                 WHERE id_medico = ? 
                 AND fecha_cita = ? 
                 AND hora_cita >= ? 
                 AND hora_cita < ?
                 AND estado NOT IN ('cancelada', 'no_asistio')`,
                [medicoId, fechaCita, horaInicio, horaFin]
            );
            return result[0].total;
        };

        // 2. Contar citas del turno solicitado
        const citasTurnoSolicitado = await contarCitasReal(id_medico, fecha, disp.hora_inicio, disp.hora_fin);
        const cuposRestantes = Math.max(0, CAPACIDAD_REAL - citasTurnoSolicitado);
        const disponible = cuposRestantes > 0;

        // 3. Si no hay disponibilidad, buscar alternativa en el otro turno del mismo día
        let sugerencia = null;
        if (!disponible) {
            const otroTurno = turno === 'manana' ? 'tarde' : 'manana';
            const [otroDispRows] = await db.query(
                `SELECT id_disponibilidad, hora_inicio, hora_fin, intervalo_minutos 
                 FROM disponibilidad 
                 WHERE id_medico = ? AND dia_semana = ? AND ? BETWEEN fecha_inicio_vigencia AND fecha_fin_vigencia AND estado = 'activo'
                 AND ((? = 'manana' AND hora_inicio < '14:00:00') OR (? = 'tarde' AND hora_inicio >= '14:00:00'))`,
                [id_medico, diaNombre, fecha, otroTurno, otroTurno]
            );

            if (otroDispRows.length > 0) {
                const oDisp = otroDispRows[0];
                const [oh1, om1] = oDisp.hora_inicio.split(':').map(Number);
                const [oh2, om2] = oDisp.hora_fin.split(':').map(Number);
                const oDiffMinutos = (oh2 * 60 + om2) - (oh1 * 60 + om1);
                const oCAPACIDAD = Math.floor(oDiffMinutos / (oDisp.intervalo_minutos || 30));

                const citasOtroTurno = await contarCitasReal(id_medico, fecha, oDisp.hora_inicio, oDisp.hora_fin);
                if (citasOtroTurno < oCAPACIDAD) {
                    sugerencia = {
                        turno: otroTurno,
                        mensaje: `El turno ${turno} está lleno, pero aún hay cupos disponibles por la ${otroTurno}.`,
                        cupos: oCAPACIDAD - citasOtroTurno
                    };
                }
            }

            if (!sugerencia) {
                sugerencia = { mensaje: 'Lo sentimos, no hay cupos disponibles para este doctor hoy.' };
            }
        }

        res.json({
            status: 'OK',
            available: disponible,
            citasAgendadas: citasTurnoSolicitado,
            cuposRestantes,
            capacidad: CAPACIDAD_REAL,
            sugerencia,
            message: disponible
                ? `Horario disponible (${cuposRestantes} cupos restantes)`
                : (sugerencia?.turno ? sugerencia.mensaje : 'Horario no disponible para este día')
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
                    am.receta_medica, am.tratamiento, am.observaciones,
                    am.proxima_cita_recomendada
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

// Actualizar estado de la cita
router.put('/:id_cita/estado', async (req, res) => {
    try {
        const { id_cita } = req.params;
        const { estado } = req.body;

        if (!['programada', 'confirmada', 'en_curso', 'completada', 'pospuesta', 'no_asistio', 'cancelada'].includes(estado)) {
            return res.status(400).json({ status: 'ERROR', message: 'Estado no válido' });
        }

        await db.query(
            'UPDATE cita SET estado = ?, fecha_actualizacion = NOW() WHERE id_cita = ?',
            [estado, id_cita]
        );

        res.json({ status: 'OK', message: 'Estado actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar estado:', error);
        res.status(500).json({ status: 'ERROR', message: 'Error al actualizar estado' });
    }
});

export default router;
