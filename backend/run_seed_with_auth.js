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

// Adjust path to point to the correct location of seed_medicos.sql
const seedFile = path.resolve(__dirname, '../database/seed_medicos.sql');

console.log(`Executing seed script: ${seedFile}`);
console.log(`User: ${user}, DB: ${db}`);

// Use MYSQL_PWD env var to pass password securely
const env = { ...process.env, MYSQL_PWD: password };

// Use cmd /c to ensure redirection works on Windows
const command = `mysql -u ${user} ${db} < "${seedFile}"`;

exec(command, { env }, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error: ${error.message}`);
        return;
    }
    if (stderr) {
        // MySQL might output warnings to stderr, but it doesn't mean failure
        console.error(`Stderr: ${stderr}`);
    }
    console.log(`Stdout: ${stdout}`);
    console.log('Seed script executed successfully.');
});
