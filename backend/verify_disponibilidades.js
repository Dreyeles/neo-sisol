import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const verify = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        console.log('Conectado a la base de datos.');

        const [rows] = await connection.query(`
            SELECT 
                COUNT(*) as total, 
                COUNT(DISTINCT id_medico) as medicos 
            FROM disponibilidad
        `);

        console.log(`Total disponibilidades: ${rows[0].total}`);
        console.log(`Médicos con disponibilidad: ${rows[0].medicos}`);

        const [expected] = await connection.query('SELECT COUNT(*) as count FROM medico WHERE estado = "activo"');
        console.log(`Médicos activos esperados: ${expected[0].count}`);
        console.log(`Disponibilidades esperadas por médico: 10 (5 días x 2 turnos)`);
        console.log(`Total esperado: ${expected[0].count * 10}`);

        if (rows[0].total === expected[0].count * 10) {
            console.log('\n✅ VERIFICACIÓN EXITOSA: Todas las disponibilidades fueron insertadas correctamente.');
        } else {
            console.log('\n❌ VERIFICACIÓN FALLIDA: Hay una discrepancia en el número de disponibilidades.');
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
};

verify();
