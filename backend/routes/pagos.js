import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Procesar pago y crear cita
router.post('/procesar', async (req, res) => {
    try {
        const {
            // Datos de la cita
            id_paciente,
            id_medico,
            fecha_cita,
            hora_cita,
            turno,
            motivo_consulta,
            // Datos del pago
            metodo_pago,
            numero_transaccion,
            comprobante_tipo
        } = req.body;

        // Validar campos obligatorios mínimos
        if (!id_paciente || !id_medico || !fecha_cita) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Faltan campos obligatorios (paciente, médico o fecha)',
                details: { id_paciente, id_medico, fecha_cita }
            });
        }

        // Valores por defecto para campos opcionales en desarrollo
        const turnoFinal = turno || 'manana';
        const motivoFinal = motivo_consulta || 'Consulta General';
        const metodoPagoFinal = metodo_pago || 'efectivo';

        // Obtener costo de consulta del médico
        const [medico] = await db.query(
            'SELECT costo_consulta FROM medico WHERE id_medico = ?',
            [id_medico]
        );

        if (medico.length === 0) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Médico no encontrado'
            });
        }

        const costo_consulta = medico[0].costo_consulta || 50.00;

        // --- VALIDACIÓN DE DÍA LABORAL (Domingo) ---
        const [year, month, day] = fecha_cita.split('-').map(Number);
        const fechaObj = new Date(year, month - 1, day);
        const diaSemanaIndex = fechaObj.getDay();

        if (diaSemanaIndex === 0) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'No es posible agendar citas los domingos.'
            });
        }

        // --- VALIDACIÓN DE DISPONIBILIDAD REAL ---
        const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const diaNombre = diasSemana[diaSemanaIndex];

        const [dispCheck] = await db.query(
            `SELECT id_disponibilidad, hora_inicio, hora_fin, intervalo_minutos 
             FROM disponibilidad 
             WHERE id_medico = ? AND dia_semana = ? 
             AND ? BETWEEN fecha_inicio_vigencia AND fecha_fin_vigencia
             AND estado = 'activo'
             AND (
                 (? = 'manana' AND hora_inicio < '14:00:00') OR
                 (? = 'tarde' AND hora_inicio >= '14:00:00')
             )`,
            [id_medico, diaNombre, fecha_cita, turno || 'manana', turno || 'manana']
        );

        if (dispCheck.length === 0) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'El médico no tiene disponibilidad configurada para este día/turno.'
            });
        }

        // --- VALIDACIÓN DE UNICIDAD (Anti-acaparamiento/reventa) ---
        // Definir rangos de hora según el turno para buscar duplicados del paciente
        const inicioTurno = turnoFinal === 'manana' ? '07:00:00' : '14:00:00';
        const finTurno = turnoFinal === 'manana' ? '13:59:59' : '20:00:00';

        const [citasExistentes] = await db.query(
            `SELECT id_cita FROM cita 
             WHERE id_paciente = ? AND fecha_cita = ? 
             AND hora_cita >= ? AND hora_cita <= ?
             AND estado NOT IN ('cancelada', 'no_asistio')`,
            [id_paciente, fecha_cita, inicioTurno, finTurno]
        );

        if (citasExistentes.length > 0) {
            return res.status(409).json({
                status: 'ERROR',
                message: `Ya tienes una cita programada para la ${turnoFinal} de este día. No se permite acaparar múltiples cupos en el mismo horario.`
            });
        }

        // Calcular hora de cita según el turno
        let hora_cita_calculada = hora_cita;
        if (!hora_cita) {
            // Si no se proporciona hora específica, usar la hora de inicio del turno
            hora_cita_calculada = turnoFinal === 'manana' ? '07:00:00' : '14:00:00';
        }

        // --- VALIDACIÓN 1: ANTI-ACAPARAMIENTO (Un usuario no puede tener dos citas activas con el mismo médico en el mismo turno) ---
        const [existingAppointments] = await db.query(
            `SELECT id_cita FROM cita 
             WHERE id_paciente = ? AND id_medico = ? AND fecha_cita = ? 
             AND hora_cita BETWEEN ? AND ?
             AND estado NOT IN ('cancelada', 'no_asistio')`,
            [id_paciente, id_medico, fecha_cita, inicioTurno, finTurno]
        );

        if (existingAppointments.length > 0) {
            return res.status(409).json({
                status: 'ERROR',
                message: `Ya tienes una cita programada con este doctor en el turno ${turnoFinal}. Por favor, asiste a tu cita existente.`
            });
        }

        // --- VALIDACIÓN 2: CONTROL DE AFORO (Capacidad Máxima del Médico) ---
        // 2.1 Obtener configuración de disponibilidad para saber capacidad total
        const [dispConfig] = await db.query(
            `SELECT hora_inicio, hora_fin, intervalo_minutos 
             FROM disponibilidad 
             WHERE id_medico = ? AND dia_semana = ? 
             AND ? BETWEEN fecha_inicio_vigencia AND fecha_fin_vigencia
             AND estado = 'activo'
             AND (
                 (? = 'manana' AND hora_inicio < '14:00:00') OR
                 (? = 'tarde' AND hora_inicio >= '14:00:00')
             )`,
            [id_medico, diaNombre, fecha_cita, turnoFinal, turnoFinal]
        );

        if (dispConfig.length > 0) {
            const config = dispConfig[0];
            const [h1, m1] = config.hora_inicio.split(':').map(Number);
            const [h2, m2] = config.hora_fin.split(':').map(Number);
            const minutosTotales = (h2 * 60 + m2) - (h1 * 60 + m1);
            const capacidadMaxima = Math.floor(minutosTotales / (config.intervalo_minutos || 30));

            // 2.2 Contar citas ocupadas en este turno
            const [citasOcupadas] = await db.query(
                `SELECT COUNT(*) as total FROM cita 
                 WHERE id_medico = ? AND fecha_cita = ? 
                 AND hora_cita BETWEEN ? AND ?
                 AND estado NOT IN ('cancelada', 'no_asistio')`,
                [id_medico, fecha_cita, config.hora_inicio, config.hora_fin]
            );

            if (citasOcupadas[0].total >= capacidadMaxima) {
                return res.status(409).json({
                    status: 'ERROR',
                    message: `Lo sentimos, el doctor ha alcanzado su capacidad máxima (${capacidadMaxima} pacientes) para el turno ${turnoFinal}. Intente en otro horario o fecha.`
                });
            }
        }

        // Iniciar transacción
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Crear la cita
            const [citaResult] = await connection.query(
                `INSERT INTO cita (
                    id_paciente, id_medico, fecha_cita, hora_cita, 
                    motivo_consulta, tipo_cita, estado
                ) VALUES (?, ?, ?, ?, ?, 'primera_vez', 'programada')`,
                [id_paciente, id_medico, fecha_cita, hora_cita_calculada, motivoFinal]
            );

            const id_cita = citaResult.insertId;

            // 2. Crear el registro de pago
            await connection.query(
                `INSERT INTO pago (
                    id_cita, id_paciente, monto, descuento, monto_total,
                    metodo_pago, numero_transaccion, estado_pago, 
                    fecha_pago, comprobante_tipo
                ) VALUES (?, ?, ?, 0.00, ?, ?, ?, 'pagado', NOW(), ?)`,
                [
                    id_cita,
                    id_paciente,
                    costo_consulta,
                    costo_consulta,
                    metodoPagoFinal,
                    numero_transaccion || `TXN-${Date.now()}`,
                    comprobante_tipo || 'boleta'
                ]
            );

            // Confirmar transacción
            await connection.commit();
            connection.release();

            res.status(201).json({
                status: 'OK',
                message: 'Cita agendada y pago procesado exitosamente',
                data: {
                    id_cita,
                    fecha_cita,
                    hora_cita: hora_cita_calculada,
                    monto_pagado: costo_consulta
                }
            });

        } catch (error) {
            // Revertir transacción en caso de error
            await connection.rollback();
            connection.release();
            throw error;
        }

    } catch (error) {
        console.error('Error al procesar pago:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al procesar el pago',
            error: error.message
        });
    }
});

// Procesar pago de exámenes y agendar citas automáticas
router.post('/procesar-examenes', async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const {
            id_cita, // ID de la cita original donde se solicitaron los exámenes
            id_paciente,
            examenes, // Array de { id_servicio, costo, nombre_servicio }
            metodo_pago,
            numero_transaccion,
            comprobante_tipo
        } = req.body;

        if (!id_cita || !id_paciente || !examenes || !Array.isArray(examenes)) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Datos incompletos para procesar el pago de exámenes'
            });
        }

        // 1. Obtener id_medico de la cita original
        const [citaOriginal] = await connection.query(
            'SELECT id_medico, fecha_cita FROM cita WHERE id_cita = ?',
            [id_cita]
        );

        if (citaOriginal.length === 0) {
            throw new Error('Cita original no encontrada');
        }

        const id_medico = citaOriginal[0].id_medico;
        const fechaOriginal = new Date(citaOriginal[0].fecha_cita);

        // Calcular fecha para el examen (Mañana)
        const fechaExamen = new Date(fechaOriginal);
        fechaExamen.setDate(fechaExamen.getDate() + 1);
        const fechaExamenStr = fechaExamen.toISOString().split('T')[0];

        // 2. Por cada examen, registrar pago y crear cita
        for (const examen of examenes) {
            // A. Crear la cita para el examen
            // Nota: Se usa una hora por defecto según disponibilidad o simpleza (ej: 08:00 AM)
            const [citaResult] = await connection.query(
                `INSERT INTO cita (
                    id_paciente, id_medico, id_servicio, fecha_cita, hora_cita, 
                    motivo_consulta, tipo_cita, estado
                ) VALUES (?, ?, ?, ?, '08:00:00', ?, 'seguimiento', 'programada')`,
                [id_paciente, id_medico, examen.id_servicio, fechaExamenStr, `Examen: ${examen.servicio || examen.nombre_servicio}`]
            );

            const id_cita_examen = citaResult.insertId;

            // B. Crear registro de pago
            const monto = parseFloat(examen.costo) || 0;
            await connection.query(
                `INSERT INTO pago (
                    id_cita, id_paciente, id_servicio, monto, monto_total,
                    metodo_pago, numero_transaccion, estado_pago, 
                    fecha_pago, comprobante_tipo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pagado', NOW(), ?)`,
                [
                    id_cita_examen,
                    id_paciente,
                    examen.id_servicio,
                    monto,
                    monto,
                    metodo_pago || 'efectivo',
                    numero_transaccion || `EXM-${Date.now()}-${examen.id_servicio}`,
                    comprobante_tipo || 'boleta'
                ]
            );
        }

        await connection.commit();
        res.status(201).json({
            status: 'OK',
            message: 'Exámenes pagados y agendados correctamente para mañana'
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error al procesar pago de exámenes:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al procesar el pago de los exámenes',
            error: error.message
        });
    } finally {
        connection.release();
    }
});

export default router;
