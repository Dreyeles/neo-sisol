-- ============================================
-- SCRIPT: populate_more_services.sql
-- Descripción: Agrega al menos 2 servicios/exámenes por departamento
-- Optimizado para Railway (sin comando USE y con subconsultas para IDs)
-- ============================================

-- 1. Consulta Externa
INSERT INTO servicios (nombre, descripcion, id_especialidad, id_departamento, duracion_minutos, costo) VALUES
('Consulta de Medicina Familiar', 'Atención integral para la familia', (SELECT id_especialidad FROM especialidades WHERE nombre = 'Medicina familiar y comunitaria' LIMIT 1), (SELECT id_departamento FROM departamento WHERE nombre = 'Consulta Externa' LIMIT 1), 30, 60.00),
('Control de Presión Arterial', 'Monitoreo de presión arterial en consulta externa', (SELECT id_especialidad FROM especialidades WHERE nombre = 'Cardiología' LIMIT 1), (SELECT id_departamento FROM departamento WHERE nombre = 'Consulta Externa' LIMIT 1), 15, 10.00);

-- 2. Emergencia
INSERT INTO servicios (nombre, descripcion, id_especialidad, id_departamento, duracion_minutos, costo) VALUES
('Soporte Vital Básico', 'Maniobras de reanimación básica', NULL, (SELECT id_departamento FROM departamento WHERE nombre = 'Emergencia' LIMIT 1), 60, 200.00),
('Sutura de Herida Simple', 'Cierre de heridas superficiales', NULL, (SELECT id_departamento FROM departamento WHERE nombre = 'Emergencia' LIMIT 1), 45, 120.00);

-- 3. Laboratorio Clínico
INSERT INTO servicios (nombre, descripcion, id_especialidad, id_departamento, duracion_minutos, costo) VALUES
('Hemograma Completo', 'Análisis de sangre integral', NULL, (SELECT id_departamento FROM departamento WHERE nombre = 'Laboratorio Clínico' LIMIT 1), 15, 45.00),
('Perfil Lipídico', 'Colesterol total, HDL, LDL y Triglicéridos', NULL, (SELECT id_departamento FROM departamento WHERE nombre = 'Laboratorio Clínico' LIMIT 1), 15, 80.00),
('Examen de Orina Completo', 'Análisis físico, químico y microscópico de orina', NULL, (SELECT id_departamento FROM departamento WHERE nombre = 'Laboratorio Clínico' LIMIT 1), 15, 25.00),
('Glucosa en Ayunas', 'Medición de azúcar en sangre', NULL, (SELECT id_departamento FROM departamento WHERE nombre = 'Laboratorio Clínico' LIMIT 1), 15, 15.00);

-- 4. Radiología e Imágenes (ID: 4) - Ya tenía muchos.

-- 5. Farmacia
INSERT INTO servicios (nombre, descripcion, id_especialidad, id_departamento, duracion_minutos, costo) VALUES
('Entrega de Medicamentos Crónicos', 'Dispensación de fármacos para enfermedades de largo plazo', NULL, (SELECT id_departamento FROM departamento WHERE nombre = 'Farmacia' LIMIT 1), 20, 0.00),
('Preparados Magistrales', 'Elaboración de fórmulas médicas personalizadas', NULL, (SELECT id_departamento FROM departamento WHERE nombre = 'Farmacia' LIMIT 1), 60, 50.00);

-- 6. Administración (ID: 6) - Ya tenía 3.

-- 7. Hospitalización
INSERT INTO servicios (nombre, descripcion, id_especialidad, id_departamento, duracion_minutos, costo) VALUES
('Cuidados de Enfermería 24h', 'Atención constante de enfermería en habitación', NULL, (SELECT id_departamento FROM departamento WHERE nombre = 'Hospitalización' LIMIT 1), 1440, 150.00),
('Monitoreo del Dolor Post-operatorio', 'Control y manejo del dolor en pacientes internados', NULL, (SELECT id_departamento FROM departamento WHERE nombre = 'Hospitalización' LIMIT 1), 60, 80.00);

-- 8. Cirugía
INSERT INTO servicios (nombre, descripcion, id_especialidad, id_departamento, duracion_minutos, costo) VALUES
('CIRUGIA MENOR - Tópico', 'Intervención quirúrgica ambulatoria simple', (SELECT id_especialidad FROM especialidades WHERE nombre = 'Cirugía General' LIMIT 1), (SELECT id_departamento FROM departamento WHERE nombre = 'Cirugía' LIMIT 1), 60, 350.00),
('Evaluación Pre-anestésica', 'Chequeo antes de una intervención quirúrgica', NULL, (SELECT id_departamento FROM departamento WHERE nombre = 'Cirugía' LIMIT 1), 30, 90.00);

-- 9. Obstetricia
INSERT INTO servicios (nombre, descripcion, id_especialidad, id_departamento, duracion_minutos, costo) VALUES
('Monitoreo Fetal', 'Prueba de bienestar fetal', (SELECT id_especialidad FROM especialidades WHERE nombre = 'Ginecología' LIMIT 1), (SELECT id_departamento FROM departamento WHERE nombre = 'Obstetricia' LIMIT 1), 30, 70.00),
('Puerperio Inmediato', 'Atención post-parto en las primeras horas', (SELECT id_especialidad FROM especialidades WHERE nombre = 'Ginecología' LIMIT 1), (SELECT id_departamento FROM departamento WHERE nombre = 'Obstetricia' LIMIT 1), 120, 150.00);

-- 10. Pediatría
INSERT INTO servicios (nombre, descripcion, id_especialidad, id_departamento, duracion_minutos, costo) VALUES
('Evaluación Nutricional Pediátrica', 'Control de peso y talla especializado en niños', (SELECT id_especialidad FROM especialidades WHERE nombre = 'Pediatría' LIMIT 1), (SELECT id_departamento FROM departamento WHERE nombre = 'Pediatría' LIMIT 1), 30, 50.00),
('Tamizaje Neonatal', 'Pruebas diagnósticas tempranas para recién nacidos', (SELECT id_especialidad FROM especialidades WHERE nombre = 'Pediatría' LIMIT 1), (SELECT id_departamento FROM departamento WHERE nombre = 'Pediatría' LIMIT 1), 20, 90.00);

-- 11. Odontología
INSERT INTO servicios (nombre, descripcion, id_especialidad, id_departamento, duracion_minutos, costo) VALUES
('Limpieza Dental (Profilaxis)', 'Eliminación de placa y sarro dental', (SELECT id_especialidad FROM especialidades WHERE nombre = 'Urología' LIMIT 1), (SELECT id_departamento FROM departamento WHERE nombre = 'Odontología' LIMIT 1), 45, 120.00),
('Extracción Dental Simple', 'Exodoncia de diente sin complicaciones', (SELECT id_especialidad FROM especialidades WHERE nombre = 'Urología' LIMIT 1), (SELECT id_departamento FROM departamento WHERE nombre = 'Odontología' LIMIT 1), 60, 150.00);

-- 12. Rehabilitación
INSERT INTO servicios (nombre, descripcion, id_especialidad, id_departamento, duracion_minutos, costo) VALUES
('Terapia Ocupacional', 'Rehabilitación para actividades de la vida diaria', (SELECT id_especialidad FROM especialidades WHERE nombre = 'Medicina fisica y rehabilitación' LIMIT 1), (SELECT id_departamento FROM departamento WHERE nombre = 'Rehabilitación' LIMIT 1), 60, 90.00),
('Terapia de Lenguaje', 'Tratamiento de trastornos de la comunicación', (SELECT id_especialidad FROM especialidades WHERE nombre = 'Medicina fisica y rehabilitación' LIMIT 1), (SELECT id_departamento FROM departamento WHERE nombre = 'Rehabilitación' LIMIT 1), 45, 75.00);

-- 13. Medicina Estética
INSERT INTO servicios (nombre, descripcion, id_especialidad, id_departamento, duracion_minutos, costo) VALUES
('Limpieza Facial Profunda', 'Tratamiento estético de limpieza de cutis', (SELECT id_especialidad FROM especialidades WHERE nombre = 'Medicina Estética' LIMIT 1), (SELECT id_departamento FROM departamento WHERE nombre = 'Medicina Estética' LIMIT 1), 60, 120.00),
('Aplicación de Toxina Botulínica', 'Tratamiento para líneas de expresión', (SELECT id_especialidad FROM especialidades WHERE nombre = 'Medicina Estética' LIMIT 1), (SELECT id_departamento FROM departamento WHERE nombre = 'Medicina Estética' LIMIT 1), 30, 800.00);

-- 14. Anatomía Patológica
INSERT INTO servicios (nombre, descripcion, id_especialidad, id_departamento, duracion_minutos, costo) VALUES
('Biopsia de Tejido Blando', 'Análisis histopatológico de muestra sólida', NULL, (SELECT id_departamento FROM departamento WHERE nombre = 'Anatomía Patológica' LIMIT 1), 30, 450.00),
('Papanicolaou (PAP)', 'Citología cervical para detección precoz', (SELECT id_especialidad FROM especialidades WHERE nombre = 'Ginecología' LIMIT 1), (SELECT id_departamento FROM departamento WHERE nombre = 'Anatomía Patológica' LIMIT 1), 15, 60.00);

-- 15. Banco de Sangre
INSERT INTO servicios (nombre, descripcion, id_especialidad, id_departamento, duracion_minutos, costo) VALUES
('Determinación de Grupo y Factor', 'Prueba rápida de hemoclasificación', NULL, (SELECT id_departamento FROM departamento WHERE nombre = 'Banco de Sangre' LIMIT 1), 15, 30.00),
('Prueba Cruzada para Transfusión', 'Prueba de compatibilidad sanguínea', NULL, (SELECT id_departamento FROM departamento WHERE nombre = 'Banco de Sangre' LIMIT 1), 45, 120.00);

-- 16. Servicios Auxiliares
INSERT INTO servicios (nombre, descripcion, id_especialidad, id_departamento, duracion_minutos, costo) VALUES
('Electrocardiograma (EKG)', 'Estudio gráfico de la actividad eléctrica del corazón', (SELECT id_especialidad FROM especialidades WHERE nombre = 'Cardiología' LIMIT 1), (SELECT id_departamento FROM departamento WHERE nombre = 'Servicios Auxiliares' LIMIT 1), 20, 60.00),
('Espirometría', 'Prueba de función pulmonar', (SELECT id_especialidad FROM especialidades WHERE nombre = 'Neumología' LIMIT 1), (SELECT id_departamento FROM departamento WHERE nombre = 'Servicios Auxiliares' LIMIT 1), 30, 90.00);
