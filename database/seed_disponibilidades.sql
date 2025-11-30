-- Script para insertar disponibilidades de médicos
-- Turnos: Mañana (7:00 AM - 1:00 PM) y Tarde (2:00 PM - 7:00 PM)
-- Días: Lunes a Viernes
USE sisol_db;

DROP PROCEDURE IF EXISTS SeedDisponibilidades;

DELIMITER //

CREATE PROCEDURE SeedDisponibilidades()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_id_medico INT;
    DECLARE v_fecha_inicio DATE;
    DECLARE v_fecha_fin DATE;
    
    -- Cursor para recorrer todos los médicos activos
    DECLARE cur CURSOR FOR SELECT id_medico FROM medico WHERE estado = 'activo';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    -- Calcular fechas: próxima semana (lunes a viernes)
    -- Fecha de inicio: próximo lunes
    SET v_fecha_inicio = DATE_ADD(CURDATE(), INTERVAL (7 - WEEKDAY(CURDATE())) DAY);
    -- Fecha de fin: dentro de 3 meses (para tener disponibilidad a futuro)
    SET v_fecha_fin = DATE_ADD(v_fecha_inicio, INTERVAL 3 MONTH);

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO v_id_medico;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- Insertar disponibilidad para cada día de la semana (Lunes a Viernes)
        -- TURNO MAÑANA: 7:00 AM - 1:00 PM
        INSERT INTO disponibilidad (id_medico, dia_semana, hora_inicio, hora_fin, intervalo_minutos, fecha_inicio_vigencia, fecha_fin_vigencia, estado)
        VALUES 
            (v_id_medico, 'lunes', '07:00:00', '13:00:00', 30, v_fecha_inicio, v_fecha_fin, 'activo'),
            (v_id_medico, 'martes', '07:00:00', '13:00:00', 30, v_fecha_inicio, v_fecha_fin, 'activo'),
            (v_id_medico, 'miercoles', '07:00:00', '13:00:00', 30, v_fecha_inicio, v_fecha_fin, 'activo'),
            (v_id_medico, 'jueves', '07:00:00', '13:00:00', 30, v_fecha_inicio, v_fecha_fin, 'activo'),
            (v_id_medico, 'viernes', '07:00:00', '13:00:00', 30, v_fecha_inicio, v_fecha_fin, 'activo');

        -- TURNO TARDE: 2:00 PM - 7:00 PM
        INSERT INTO disponibilidad (id_medico, dia_semana, hora_inicio, hora_fin, intervalo_minutos, fecha_inicio_vigencia, fecha_fin_vigencia, estado)
        VALUES 
            (v_id_medico, 'lunes', '14:00:00', '19:00:00', 30, v_fecha_inicio, v_fecha_fin, 'activo'),
            (v_id_medico, 'martes', '14:00:00', '19:00:00', 30, v_fecha_inicio, v_fecha_fin, 'activo'),
            (v_id_medico, 'miercoles', '14:00:00', '19:00:00', 30, v_fecha_inicio, v_fecha_fin, 'activo'),
            (v_id_medico, 'jueves', '14:00:00', '19:00:00', 30, v_fecha_inicio, v_fecha_fin, 'activo'),
            (v_id_medico, 'viernes', '14:00:00', '19:00:00', 30, v_fecha_inicio, v_fecha_fin, 'activo');
        
    END LOOP;

    CLOSE cur;
END //

DELIMITER ;

-- Ejecutar el procedimiento
CALL SeedDisponibilidades();

-- Limpiar
DROP PROCEDURE SeedDisponibilidades;

-- Verificar inserción
SELECT 
    COUNT(*) as total_disponibilidades,
    COUNT(DISTINCT id_medico) as medicos_con_disponibilidad
FROM disponibilidad;

-- Ver ejemplo de disponibilidades
SELECT 
    d.id_disponibilidad,
    m.nombres,
    m.apellidos,
    d.dia_semana,
    d.hora_inicio,
    d.hora_fin,
    d.fecha_inicio_vigencia,
    d.fecha_fin_vigencia
FROM disponibilidad d
JOIN medico m ON d.id_medico = m.id_medico
LIMIT 20;
