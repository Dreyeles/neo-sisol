import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Obtener todos los médicos (para el panel de admin)
router.get('/', async (req, res) => {
    try {
        const [medicos] = await db.query(
            `SELECT m.*, e.nombre as especialidad_nombre, u.email, u.estado as usuario_estado
             FROM medico m
             JOIN especialidades e ON m.id_especialidad = e.id_especialidad
             JOIN usuarios u ON m.id_usuario = u.id_usuario
             ORDER BY m.fecha_registro DESC`
        );

        res.json({
            status: 'OK',
            data: medicos
        });
    } catch (error) {
        console.error('Error al obtener todos los médicos:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al obtener médicos',
            error: error.message
        });
    }
});

// Registrar nuevo médico
router.post('/', async (req, res) => {
    try {
        const {
            email, password, dni, nombres, apellidos,
            fecha_nacimiento, genero, telefono, celular,
            direccion, id_especialidad, numero_colegiatura,
            titulo_profesional, universidad, anios_experiencia,
            firma_digital, horario_atencion, costo_consulta
        } = req.body;

        // Validar campos obligatorios
        if (!email || !password || !dni || !nombres || !apellidos || !id_especialidad || !numero_colegiatura) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Faltan campos obligatorios'
            });
        }

        // Iniciar transacción
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Crear usuario
            const [userResult] = await connection.query(
                'INSERT INTO usuarios (email, password, tipo_usuario, estado) VALUES (?, ?, ?, ?)',
                [email, password, 'medico', 'activo']
            );

            const id_usuario = userResult.insertId;

            // 2. Crear perfil de médico
            // fecha_contratacion se asigne automáticamente con CURDATE()
            await connection.query(
                `INSERT INTO medico (
                    id_usuario, dni, nombres, apellidos, fecha_nacimiento, genero,
                    telefono, celular, direccion, id_especialidad, numero_colegiatura,
                    titulo_profesional, universidad, anios_experiencia, firma_digital,
                    horario_atencion, costo_consulta, estado, fecha_contratacion
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo', CURDATE())`,
                [
                    id_usuario, dni, nombres, apellidos, fecha_nacimiento, genero,
                    telefono || null, celular || null, direccion || null,
                    id_especialidad, numero_colegiatura,
                    titulo_profesional || null, universidad || null,
                    anios_experiencia || 0, firma_digital || null,
                    horario_atencion, costo_consulta || 0
                ]
            );

            await connection.commit();
            connection.release();

            res.status(201).json({
                status: 'OK',
                message: 'Médico registrado exitosamente'
            });

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }

    } catch (error) {
        console.error('Error en registro de médico:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al registrar médico',
            error: error.message
        });
    }
});

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

// Actualizar perfil de médico
router.put('/:id_medico', async (req, res) => {
    try {
        const { id_medico } = req.params;
        const {
            email, password, dni, nombres, apellidos,
            fecha_nacimiento, genero, telefono, celular,
            direccion, id_especialidad, numero_colegiatura,
            titulo_profesional, universidad, anios_experiencia,
            firma_digital, horario_atencion, costo_consulta,
            estado
        } = req.body;

        // Iniciar transacción
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Obtener id_usuario del médico
            const [medico] = await connection.query('SELECT id_usuario FROM medico WHERE id_medico = ?', [id_medico]);
            if (medico.length === 0) {
                connection.release();
                return res.status(404).json({ status: 'ERROR', message: 'Médico no encontrado' });
            }
            const id_usuario = medico[0].id_usuario;

            // 2. Actualizar usuario (email y password si se provee)
            let userUpdateQuery = 'UPDATE usuarios SET email = ?';
            let userParams = [email];
            if (password) {
                userUpdateQuery += ', password = ?';
                userParams.push(password);
            }
            userUpdateQuery += ' WHERE id_usuario = ?';
            userParams.push(id_usuario);
            await connection.query(userUpdateQuery, userParams);

            // 3. Actualizar perfil de médico
            await connection.query(
                `UPDATE medico SET 
                    dni = ?, nombres = ?, apellidos = ?, fecha_nacimiento = ?, genero = ?,
                    telefono = ?, celular = ?, direccion = ?, id_especialidad = ?, 
                    numero_colegiatura = ?, titulo_profesional = ?, universidad = ?, 
                    anios_experiencia = ?, firma_digital = ?, horario_atencion = ?, 
                    costo_consulta = ?, estado = ?
                WHERE id_medico = ?`,
                [
                    dni, nombres, apellidos, fecha_nacimiento, genero,
                    telefono || null, celular || null, direccion || null,
                    id_especialidad, numero_colegiatura,
                    titulo_profesional || null, universidad || null,
                    anios_experiencia || 0, firma_digital || null,
                    horario_atencion, costo_consulta, estado || 'activo',
                    id_medico
                ]
            );

            await connection.commit();
            connection.release();

            res.json({
                status: 'OK',
                message: 'Perfil de médico actualizado correctamente'
            });

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }

    } catch (error) {
        console.error('Error al actualizar médico:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al actualizar médico',
            error: error.message
        });
    }
});

export default router;
