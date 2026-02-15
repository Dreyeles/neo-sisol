import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const seed = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
            multipleStatements: true
        });

        console.log('✅ Conectado a la base de datos.');

        const sqlFile = path.resolve(__dirname, '../database/seed_disponibilidades_febrero.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');

        console.log(`Ejecutando script: ${sqlFile}`);

        const [result] = await connection.query(sql);
        console.log('✅ Script ejecutado exitosamente.');

        // El último elemento del resultado suele ser el resultado de la última consulta (SELECT de verificación)
        if (Array.isArray(result)) {
            const lastResult = result[result.length - 1];
            if (Array.isArray(lastResult) && lastResult.length > 0) {
                console.log('Resumen de inserción:', lastResult[0]);
            }
        }

        await connection.end();
    } catch (error) {
        console.error('❌ Error durante el seed:', error.message);
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('Tip: Verifica las credenciales en backend/.env');
        }
    }
};

seed();
