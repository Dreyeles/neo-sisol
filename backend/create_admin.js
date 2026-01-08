
import db from './config/database.js';

async function createAdmin() {
    try {
        // Verificar si ya existe
        const [existing] = await db.query('SELECT * FROM usuarios WHERE email = ?', ['admin@sisol.com']);
        if (existing.length > 0) {
            console.log('El usuario admin@sisol.com ya existe.');
            process.exit(0);
        }

        // Iniciar transacción
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Insertar usuario
            const [userResult] = await connection.query(
                'INSERT INTO usuarios (email, password, tipo_usuario, estado) VALUES (?, ?, ?, ?)',
                ['admin@sisol.com', 'admin123', 'administrativo', 'activo']
            );

            const id_usuario = userResult.insertId;

            // 2. Insertar personal administrativo
            await connection.query(
                `INSERT INTO personal_administrativo (
                    id_usuario, dni, nombres, apellidos, fecha_nacimiento, genero,
                    telefono, celular, direccion, id_departamento, cargo, nivel_acceso,
                    estado, fecha_contratacion
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
                [
                    id_usuario, '00000001', 'Administrador', 'Principal', '1990-01-01', 'otro',
                    '01-2345678', '987654321', 'Sede Central', 6, 'Super Admin', 'total', 'activo'
                ]
            );

            await connection.commit();
            console.log('✅ Usuario administrador creado exitosamente.');
            console.log('📧 Email: admin@sisol.com');
            console.log('🔑 Password: admin123');

            connection.release();
            process.exit(0);
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('❌ Error al crear administrador:', error.message);
        process.exit(1);
    }
}

createAdmin();
