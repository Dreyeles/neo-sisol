import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Registrar atención médica
router.post('/registrar', async (req, res) => {
    const {
        id_cita,
        id_paciente,
        id_medico,
        // Datos clínicos del paciente
        grupo_sanguineo,
        alergias,
        // Signos vitales
        peso,
        talla,
        presion_arterial,
        temperatura,
        // Datos de la consulta
        motivo_consulta,
        sintomas,
        diagnostico,
        observaciones,
        // Tratamiento
        tratamiento,
        receta_medica,
        proxima_cita,
        examenes_solicitados
    } = req.body;

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // 1. Actualizar datos base del paciente (Alergias, Grupo Sanguíneo)
        if (grupo_sanguineo || alergias) {
            await connection.query(
                `UPDATE paciente 
                 SET grupo_sanguineo = COALESCE(?, grupo_sanguineo),
                     alergias = COALESCE(?, alergias)
                 WHERE id_paciente = ?`,
                [grupo_sanguineo, alergias, id_paciente]
            );
        }

        // 1.5. Registrar/Actualizar Historial Médico Detallado
        // Extraemos campos de antecedentes del body
        const {
            antecedentes_personales,
            antecedentes_familiares,
            enfermedades_cronicas,
            cirugias_previas,
            medicamentos_actuales,
            vacunas
        } = req.body;

        await connection.query(
            `INSERT INTO historial_medico 
            (id_paciente, antecedentes_personales, antecedentes_familiares, enfermedades_cronicas, cirugias_previas, medicamentos_actuales, vacunas)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            antecedentes_personales = VALUES(antecedentes_personales),
            antecedentes_familiares = VALUES(antecedentes_familiares),
            enfermedades_cronicas = VALUES(enfermedades_cronicas),
            cirugias_previas = VALUES(cirugias_previas),
            medicamentos_actuales = VALUES(medicamentos_actuales),
            vacunas = VALUES(vacunas),
            fecha_actualizacion = CURRENT_TIMESTAMP`,
            [
                id_paciente,
                antecedentes_personales || null,
                antecedentes_familiares || null,
                enfermedades_cronicas || null,
                cirugias_previas || null,
                medicamentos_actuales || null,
                vacunas || null
            ]
        );

        // 2. Construir JSON de signos vitales
        const signos_vitales = JSON.stringify({
            peso: peso || null,
            talla: talla || null,
            presion: presion_arterial || null,
            temperatura: temperatura || null
        });

        // 3. Insertar atención médica
        await connection.query(
            `INSERT INTO atencion_medica (
                id_cita, id_paciente, id_medico,
                motivo_consulta, sintomas, signos_vitales,
                diagnostico, tratamiento, receta_medica,
                observaciones, proxima_cita_recomendada,
                examenes_solicitados,
                estado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'finalizada')`,
            [
                id_cita, id_paciente, id_medico,
                motivo_consulta, sintomas, signos_vitales,
                diagnostico, tratamiento, receta_medica,
                observaciones, proxima_cita || null,
                examenes_solicitados || ''
            ]
        );

        // 4. Actualizar estado de la cita a 'completada'
        await connection.query(
            `UPDATE cita SET estado = 'completada' WHERE id_cita = ?`,
            [id_cita]
        );

        await connection.commit();

        res.status(201).json({
            status: 'OK',
            message: 'Atención médica registrada exitosamente'
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error al registrar atención:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al registrar la atención médica',
            error: error.message
        });
    } finally {
        connection.release();
    }
});

// Obtener historial médico de un paciente
router.get('/historial/:id_paciente', async (req, res) => {
    try {
        const { id_paciente } = req.params;
        const [historial] = await db.query(
            `SELECT a.*, 
                    m.nombres as medico_nombre, m.apellidos as medico_apellido,
                    c.fecha_cita
             FROM atencion_medica a
             JOIN medico m ON a.id_medico = m.id_medico
             JOIN cita c ON a.id_cita = c.id_cita
             WHERE a.id_paciente = ?
             ORDER BY a.fecha_atencion DESC`,
            [id_paciente]
        );

        res.json({
            status: 'OK',
            data: historial
        });
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al obtener historial médico'
        });
    }
});

export default router;
