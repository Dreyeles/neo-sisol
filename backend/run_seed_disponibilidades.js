import { exec } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const password = process.env.DB_PASSWORD;
const user = process.env.DB_USER;
const db = process.env.DB_NAME;

const seedFile = path.resolve(__dirname, '../database/seed_disponibilidades.sql');

console.log(`Ejecutando script: ${seedFile}`);
console.log(`Usuario: ${user}, BD: ${db}`);

const env = { ...process.env, MYSQL_PWD: password };
const command = `mysql -u ${user} ${db} < "${seedFile}"`;

exec(command, { env }, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`Stderr: ${stderr}`);
    }
    console.log(`Stdout: ${stdout}`);
    console.log('Script de disponibilidades ejecutado exitosamente.');
});
