import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Ruta de registro de paciente
router.post('/register', async (req, res) => {
    try {
        const {
            // Datos de usuario
            email,
            password,
            // Datos personales
            dni,
            nombres,
            apellidos,
            fecha_nacimiento,
            genero,
            celular,
            telefono,
            direccion,
            distrito,
            provincia,
            departamento,
            contacto_emergencia_nombre,
            contacto_emergencia_telefono,
            contacto_emergencia_relacion
        } = req.body;

        // Validar campos obligatorios
        if (!email || !password || !dni || !nombres || !apellidos || !fecha_nacimiento || !genero) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Faltan campos obligatorios'
            });
        }

        // Verificar si el email ya existe
        const [existingEmail] = await db.query(
            'SELECT id_usuario FROM usuarios WHERE email = ?',
            [email]
        );

        if (existingEmail.length > 0) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'El email ya está registrado'
            });
        }

        // Verificar si el DNI ya existe
        const [existingDNI] = await db.query(
            'SELECT id_paciente FROM paciente WHERE dni = ?',
            [dni]
        );

        if (existingDNI.length > 0) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'El DNI ya está registrado'
            });
        }

        // Iniciar transacción
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Insertar usuario
            const [userResult] = await connection.query(
                'INSERT INTO usuarios (email, password, tipo_usuario, estado) VALUES (?, ?, ?, ?)',
                [email, password, 'paciente', 'activo']
            );

            const id_usuario = userResult.insertId;

            // 2. Insertar paciente
            await connection.query(
                `INSERT INTO paciente (
          id_usuario, dni, nombres, apellidos, fecha_nacimiento, genero,
          telefono, celular, direccion, distrito, provincia, departamento, 
          contacto_emergencia_nombre, contacto_emergencia_telefono, contacto_emergencia_relacion,
          estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    id_usuario, dni, nombres, apellidos, fecha_nacimiento, genero,
                    telefono || null, celular || null, direccion || null,
                    distrito || null, provincia || null, departamento || null,
                    contacto_emergencia_nombre || null, contacto_emergencia_telefono || null, contacto_emergencia_relacion || null,
                    'activo'
                ]
            );

            // Confirmar transacción
            await connection.commit();
            connection.release();

            res.status(201).json({
                status: 'OK',
                message: 'Paciente registrado exitosamente',
                data: {
                    id_usuario,
                    email,
                    nombres,
                    apellidos
                }
            });

        } catch (error) {
            // Revertir transacción en caso de error
            await connection.rollback();
            connection.release();
            throw error;
        }

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al registrar paciente',
            error: error.message
        });
    }
});

// Ruta de login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Email y contraseña son requeridos'
            });
        }

        // Buscar usuario
        const [users] = await db.query(
            'SELECT * FROM usuarios WHERE email = ? AND password = ?',
            [email, password]
        );

        if (users.length === 0) {
            return res.status(401).json({
                status: 'ERROR',
                message: 'Credenciales incorrectas'
            });
        }

        const user = users[0];

        // Obtener datos adicionales según el tipo de usuario
        let userData = null;

        if (user.tipo_usuario === 'paciente') {
            const [paciente] = await db.query(
                'SELECT * FROM paciente WHERE id_usuario = ?',
                [user.id_usuario]
            );
            userData = paciente[0];
        } else if (user.tipo_usuario === 'medico') {
            const [medico] = await db.query(
                'SELECT * FROM medico WHERE id_usuario = ?',
                [user.id_usuario]
            );
            userData = medico[0];
        } else if (user.tipo_usuario === 'administrativo') {
            const [admin] = await db.query(
                'SELECT * FROM personal_administrativo WHERE id_usuario = ?',
                [user.id_usuario]
            );
            userData = admin[0];
        }

        // Actualizar último acceso
        await db.query(
            'UPDATE usuarios SET ultimo_acceso = NOW() WHERE id_usuario = ?',
            [user.id_usuario]
        );

        res.json({
            status: 'OK',
            message: 'Login exitoso',
            data: {
                id_usuario: user.id_usuario,
                email: user.email,
                tipo_usuario: user.tipo_usuario,
                ...userData
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al iniciar sesión',
            error: error.message
        });
    }
});

export default router;
