import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function cleanup() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('--- Iniciando limpieza profunda de base de datos ---');

        await db.query('SET FOREIGN_KEY_CHECKS = 0');

        const tables = ['atencion_medica', 'pago', 'cita', 'historial_medico', 'notificaciones', 'paciente'];

        for (const table of tables) {
            try {
                console.log(`Limpiando tabla ${table}...`);
                await db.query(`TRUNCATE TABLE ${table}`);
            } catch (err) {
                console.warn(`No se pudo limpiar la tabla ${table}: ${err.message}`);
            }
        }

        console.log('Borrando cuentas de usuario tipo paciente...');
        const [result] = await db.query("DELETE FROM usuarios WHERE tipo_usuario = 'paciente'");
        console.log(`Se eliminaron ${result.affectedRows} cuentas de pacientes.`);

        await db.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('--- Limpieza completada ---');
    } catch (error) {
        console.error('Error durante la limpieza:', error);
    } finally {
        await db.end();
    }
}

cleanup();
