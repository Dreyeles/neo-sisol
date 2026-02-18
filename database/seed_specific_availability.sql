-- =======================================================
-- DISPONIBILIDAD ESPECÍFICA - MARIO Y DREYFULIN
-- =======================================================

USE railway;

SET SQL_SAFE_UPDATES = 0;

-- 1. Disponibilidad para MARIO BROSS (ID 37)
-- Turno: Tarde (14:00 - 19:00)
-- Días: Lunes a Sábado (Febrero 2026)
INSERT INTO disponibilidad (id_medico, dia_semana, hora_inicio, hora_fin, intervalo_minutos, fecha_inicio_vigencia, fecha_fin_vigencia, estado)
SELECT 
    37, -- ID de Mario Bross
    d.dia,
    '14:00:00',
    '19:00:00',
    30,
    '2026-02-01',
    '2026-02-28',
    'activo'
FROM (
    SELECT 'lunes' as dia UNION SELECT 'martes' UNION SELECT 'miercoles' 
    UNION SELECT 'jueves' UNION SELECT 'viernes' UNION SELECT 'sabado'
) as d;

-- 2. Disponibilidad para dreyfulin (ID 38)
-- Turno: Mañana (08:00 - 13:00)
-- Días: Lunes a Sábado (Febrero 2026)
INSERT INTO disponibilidad (id_medico, dia_semana, hora_inicio, hora_fin, intervalo_minutos, fecha_inicio_vigencia, fecha_fin_vigencia, estado)
SELECT 
    38, -- ID de dreyfulin
    d.dia,
    '08:00:00',
    '13:00:00',
    30,
    '2026-02-01',
    '2026-02-28',
    'activo'
FROM (
    SELECT 'lunes' as dia UNION SELECT 'martes' UNION SELECT 'miercoles' 
    UNION SELECT 'jueves' UNION SELECT 'viernes' UNION SELECT 'sabado'
) as d;

SET SQL_SAFE_UPDATES = 1;

-- Verificación
SELECT m.nombres, m.apellidos, d.dia_semana, d.hora_inicio, d.hora_fin 
FROM disponibilidad d
JOIN medico m ON d.id_medico = m.id_medico
WHERE m.id_medico IN (37, 38);
