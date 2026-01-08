import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'sisol_db'
};

async function migrate() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Conectado a la base de datos.');

        // Agregar columnas provincia y distrito si no existen
        const [columns] = await connection.query(`
            SHOW COLUMNS FROM atencion_medica LIKE 'provincia'
        `);

        if (columns.length === 0) {
            await connection.query(`
                ALTER TABLE atencion_medica
                ADD COLUMN provincia VARCHAR(50),
                ADD COLUMN distrito VARCHAR(50)
            `);
            console.log('Columnas provincia y distrito agregadas a atencion_medica.');
        } else {
            console.log('Las columnas ya existen.');
        }

        await connection.end();
    } catch (error) {
        console.error('Error durante la migración:', error);
    }
}

migrate();
