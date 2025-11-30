-- Script para verificar y poblar especialidades
-- Ejecutar: mysql -u root -p < populate-especialidades.sql

USE sisol_db;

-- Verificar si existen especialidades
SELECT COUNT(*) as total_especialidades FROM especialidades;

-- Si no hay especialidades, insertarlas
INSERT INTO especialidades (nombre, descripcion, id_departamento) VALUES
('Alergias e Inmunología', 'Diagnóstico y tratamiento de alergias y enfermedades del sistema inmunológico', 1),
('Cardiología', 'Especialidad en enfermedades del corazón y sistema cardiovascular', 1),
('Cirugía Cabeza y Cuello', 'Cirugía especializada en cabeza y cuello', 1),
('Cirugía General', 'Procedimientos quirúrgicos generales', 1),
('Cirugia Pediatrica', 'Cirugía especializada en pacientes pediátricos', 1),
('Cirugía Plástica', 'Cirugía reconstructiva y estética', 1),
('Cirugía Tórax y Cardiovascular', 'Cirugía del tórax y sistema cardiovascular', 1),
('Dermatología', 'Diagnóstico y tratamiento de enfermedades de la piel', 1),
('Dermatologia Estética', 'Tratamientos estéticos de la piel', 1),
('Dermatología Láser', 'Tratamientos dermatológicos con tecnología láser', 1),
('Endocrinología', 'Tratamiento de trastornos hormonales y metabólicos', 1),
('Flebología', 'Tratamiento de enfermedades venosas', 1),
('Gastroenterología', 'Enfermedades del sistema digestivo', 1),
('Geriatría', 'Atención médica especializada en adultos mayores', 1),
('Ginecología', 'Salud reproductiva y enfermedades del sistema reproductor femenino', 1),
('Infertilidad', 'Diagnóstico y tratamiento de problemas de fertilidad', 1),
('Masoterapia', 'Terapia mediante masajes terapéuticos', 1),
('Mastología', 'Diagnóstico y tratamiento de enfermedades mamarias', 1),
('Medicina Estética', 'Tratamientos estéticos no quirúrgicos', 1),
('Medicina familiar y comunitaria', 'Atención integral de salud familiar', 1),
('Medicina fisica y rehabilitación', 'Rehabilitación y medicina física', 1),
('Medicina General', 'Atención médica general y preventiva', 1),
('Medicina Interna', 'Diagnóstico y tratamiento de enfermedades en adultos', 1),
('Nefrología', 'Enfermedades del riñón y vías urinarias', 1),
('Neumología', 'Enfermedades del sistema respiratorio', 1),
('Neurocirugía', 'Cirugía del sistema nervioso', 1),
('Neurología', 'Enfermedades del sistema nervioso', 1),
('Oftalmología', 'Diagnóstico y tratamiento de enfermedades oculares', 1),
('Oncología', 'Diagnóstico y tratamiento del cáncer', 1),
('Otorrinolaringología', 'Enfermedades de oído, nariz y garganta', 1),
('Pediatría', 'Atención médica especializada en niños y adolescentes', 1),
('Psiquiatría', 'Diagnóstico y tratamiento de trastornos mentales', 1),
('Reumatología', 'Enfermedades reumáticas y del sistema musculoesquelético', 1),
('Traumatología', 'Tratamiento de lesiones, fracturas y enfermedades del sistema locomotor', 1),
('Urología', 'Enfermedades del sistema urinario y reproductor masculino', 1)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Verificar que se insertaron
SELECT COUNT(*) as total_especialidades_despues FROM especialidades;
SELECT * FROM especialidades LIMIT 10;
