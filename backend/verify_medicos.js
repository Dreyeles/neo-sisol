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

        console.log('Connected to database.');

        const [rows] = await connection.query('SELECT COUNT(*) as count FROM medico');
        console.log(`Total doctors: ${rows[0].count}`);

        const [specialties] = await connection.query('SELECT COUNT(*) as count FROM especialidades WHERE estado = "activo"');
        console.log(`Total active specialties: ${specialties[0].count}`);

        console.log(`Expected doctors: ${specialties[0].count * 2}`);

        if (rows[0].count >= specialties[0].count * 2) {
            console.log('VERIFICATION SUCCESS: Doctors inserted correctly.');
        } else {
            console.log('VERIFICATION FAILED: Doctor count mismatch.');
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
};

verify();
