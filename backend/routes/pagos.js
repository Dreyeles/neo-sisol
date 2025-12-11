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

        // Calcular hora de cita según el turno
        let hora_cita_calculada = hora_cita;
        if (!hora_cita) {
            // Si no se proporciona hora específica, usar la hora de inicio del turno
            hora_cita_calculada = turnoFinal === 'manana' ? '07:00:00' : '14:00:00';
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

export default router;
