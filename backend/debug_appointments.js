import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function debug() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('--- Resumen de Médicos ---');
        const [medicos] = await db.query(`
            SELECT m.id_medico, m.nombres, m.apellidos, u.id_usuario, u.email, u.password
            FROM medico m
            JOIN usuarios u ON m.id_usuario = u.id_usuario
        `);
        medicos.forEach(m => {
            console.log(`Medico ID: ${m.id_medico}, Nombre: ${m.nombres} ${m.apellidos}, User ID: ${m.id_usuario}, Email: ${m.email}, Pwd: ${m.password}`);
        });

        console.log('\n--- Citas para el día 2026-02-14 ---');
        const [citas] = await db.query(`
            SELECT c.id_cita, c.id_medico, c.id_paciente, c.fecha_cita, c.hora_cita, c.estado,
                   m.nombres as medico_nombre, p.nombres as paciente_nombre
            FROM cita c
            JOIN medico m ON c.id_medico = m.id_medico
            JOIN paciente p ON c.id_paciente = p.id_paciente
            WHERE c.fecha_cita = '2026-02-14'
        `);
        citas.forEach(c => {
            console.log(`Cita ID: ${c.id_cita}, Medico: ${c.medico_nombre} (ID: ${c.id_medico}), Paciente: ${c.paciente_nombre}, Hora: ${c.hora_cita}, Estado: ${c.estado}`);
        });

    } catch (error) {
        console.error('Error durante el debug:', error);
    } finally {
        await db.end();
    }
}

debug();
