import db from './config/database.js';

async function deleteRecentAppointment() {
    try {
        // 1. Encontrar la última cita
        const [citas] = await db.query(
            `SELECT c.id_cita, c.fecha_cita, c.hora_cita, p.nombres, p.apellidos 
             FROM cita c 
             JOIN paciente p ON c.id_paciente = p.id_paciente 
             ORDER BY c.id_cita DESC 
             LIMIT 1`
        );

        if (citas.length === 0) {
            console.log('No se encontraron citas.');
            process.exit(0);
        }

        const cita = citas[0];
        console.log(`Cita encontrada: ID ${cita.id_cita}, Fecha ${cita.fecha_cita}, Hora ${cita.hora_cita}, Paciente: ${cita.nombres} ${cita.apellidos}`);

        // 2. Borrar pagos asociados
        await db.query('DELETE FROM pago WHERE id_cita = ?', [cita.id_cita]);
        console.log(`Pagos asociados a la cita ${cita.id_cita} eliminados.`);

        // 3. Borrar la cita
        await db.query('DELETE FROM cita WHERE id_cita = ?', [cita.id_cita]);
        console.log(`Cita ${cita.id_cita} eliminada exitosamente.`);

        process.exit(0);
    } catch (error) {
        console.error('Error al borrar la cita:', error);
        process.exit(1);
    }
}

deleteRecentAppointment();
