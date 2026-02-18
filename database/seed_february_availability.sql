-- =======================================================
-- SCRIPT DE DISPONIBILIDAD - FEBRERO 2026 (PRODUCCIÓN)
-- =======================================================

USE railway;

-- 1. Deshabilitar modo seguro para permitir limpieza si fuera necesario
SET SQL_SAFE_UPDATES = 0;

-- Opcional: Limpiar disponibilidades de febrero si ya existieran
-- DELETE FROM disponibilidad WHERE fecha_inicio_vigencia = '2026-02-01';

-- 2. Insertar disponibilidad para todos los médicos activos
-- Período: Febrero 2026
-- Días: Lunes a Sábado
-- Turnos: Mañana (07-13) y Tarde (14-19)
-- Intervalo: 30 minutos

INSERT INTO disponibilidad (id_medico, dia_semana, hora_inicio, hora_fin, intervalo_minutos, fecha_inicio_vigencia, fecha_fin_vigencia, estado)
SELECT 
    m.id_medico,
    d.dia,
    t.inicio,
    t.fin,
    30,           -- intervalo de 30 min por paciente
    '2026-02-01', -- inicio vigencia
    '2026-02-28', -- fin vigencia
    'activo'
FROM medico m
CROSS JOIN (
    SELECT 'lunes' as dia UNION SELECT 'martes' UNION SELECT 'miercoles' 
    UNION SELECT 'jueves' UNION SELECT 'viernes' UNION SELECT 'sabado'
) as d
CROSS JOIN (
    SELECT '07:00:00' as inicio, '13:00:00' as fin
    UNION 
    SELECT '14:00:00' as inicio, '19:00:00' as fin
) as t
WHERE m.estado = 'activo';

-- 3. Rehabilitar modo seguro
SET SQL_SAFE_UPDATES = 1;

-- 4. Verificación rápida
SELECT 
    (SELECT COUNT(*) FROM medico WHERE estado = 'activo') as total_medicos,
    COUNT(*) as total_horarios_creados,
    'Febrero 2026' as periodo
FROM disponibilidad 
WHERE fecha_inicio_vigencia = '2026-02-01';
