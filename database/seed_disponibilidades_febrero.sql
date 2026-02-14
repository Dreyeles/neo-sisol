USE sisol_db;

-- Limpiar disponibilidades previas para febrero 2026 si existen (opcional, para evitar duplicados si se corre dos veces)
-- DELETE FROM disponibilidad WHERE fecha_inicio_vigencia = '2026-02-01' AND fecha_fin_vigencia = '2026-02-28';

-- Insertar disponibilidad para cada médico activo
-- Período: Febrero 2026
-- Días: Lunes a Sábado
-- Turnos: Mañana (07-13) y Tarde (14-19)

INSERT INTO disponibilidad (id_medico, dia_semana, hora_inicio, hora_fin, intervalo_minutos, fecha_inicio_vigencia, fecha_fin_vigencia, estado)
SELECT 
    m.id_medico,
    d.dia,
    t.inicio,
    t.fin,
    30,           -- intervalo de 30 min
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

-- Verificar inserción
SELECT COUNT(*) as total_disponibilidades_febrero 
FROM disponibilidad 
WHERE fecha_inicio_vigencia = '2026-02-01';
