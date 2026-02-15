SELECT c.id_cita, c.fecha_cita, c.hora_cita, p.nombres, p.apellidos 
FROM cita c 
JOIN paciente p ON c.id_paciente = p.id_paciente 
ORDER BY c.id_cita DESC 
LIMIT 5;
