import pool from './config/database.js';

async function check() {
    try {
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM especialidades');
        console.log('Specialties count:', rows[0].count);

        if (rows[0].count > 0) {
            const [data] = await pool.query('SELECT * FROM especialidades LIMIT 5');
            console.log('Sample data:', data);
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}
check();
