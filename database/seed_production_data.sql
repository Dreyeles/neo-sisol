-- ============================================
-- SCRIPT DE CARGA DE DATOS INICIALES - NEO SISOL
-- ============================================

USE railway;

-- 1. DESACTIVAR CHEQUEO DE CLAVES FORÁNEAS (Para evitar errores de orden)
SET FOREIGN_KEY_CHECKS = 0;

-- 2. LIMPIEZA (Opcional, solo si quieres empezar de cero)
TRUNCATE TABLE servicios;
TRUNCATE TABLE especialidades;
TRUNCATE TABLE departamento;

-- 3. INSERTAR DEPARTAMENTOS
INSERT INTO departamento (id_departamento, nombre, descripcion, ubicacion, telefono) VALUES
(1, 'Consulta Externa', 'Departamento de consultas médicas generales', 'Piso 1', '01-2345678'),
(2, 'Emergencia', 'Departamento de atención de emergencias 24 horas', 'Piso 1', '01-2345679'),
(3, 'Laboratorio Clínico', 'Departamento de análisis clínicos y pruebas de laboratorio', 'Piso 2', '01-2345680'),
(4, 'Radiología e Imágenes', 'Departamento de diagnóstico por imágenes', 'Piso 2', '01-2345681'),
(5, 'Farmacia', 'Departamento de farmacia y dispensación de medicamentos', 'Piso 1', '01-2345682'),
(6, 'Administración', 'Departamento administrativo y gestión hospitalaria', 'Piso 3', '01-2345683'),
(7, 'Hospitalización', 'Departamento de internamiento y cuidados hospitalarios', 'Piso 3-4', '01-2345684'),
(8, 'Cirugía', 'Departamento quirúrgico y salas de operaciones', 'Piso 2', '01-2345685'),
(9, 'Obstetricia', 'Departamento de atención obstétrica y ginecológica', 'Piso 3', '01-2345686'),
(10, 'Pediatría', 'Departamento de atención pediátrica', 'Piso 2', '01-2345687'),
(11, 'Odontología', 'Departamento de servicios odontológicos', 'Piso 1', '01-2345688'),
(12, 'Rehabilitación', 'Departamento de terapia física y rehabilitación', 'Piso 1', '01-2345689'),
(13, 'Medicina Estética', 'Departamento de tratamientos estéticos', 'Piso 2', '01-2345690'),
(14, 'Anatomía Patológica', 'Departamento de análisis anatomopatológico', 'Piso 2', '01-2345691'),
(15, 'Banco de Sangre', 'Departamento de hemoterapia y banco de sangre', 'Piso 2', '01-2345692'),
(16, 'Servicios Auxiliares', 'Departamento de servicios de apoyo médico', 'Piso 1', '01-2345693');

-- 4. INSERTAR ESPECIALIDADES
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
('Urología', 'Enfermedades del sistema urinario y reproductor masculino', 1);

-- 5. INSERTAR SERVICIOS
INSERT INTO servicios (nombre, descripcion, id_especialidad, id_departamento, duracion_minutos, costo) VALUES
('Ambulancia 24 horas', 'Servicio de ambulancia disponible las 24 horas', NULL, 2, 60, 150.00),
('Emergencias 24 horas', 'Atención de emergencias las 24 horas', NULL, 2, 30, 100.00),
('Tópico', 'Atención de tópico y curaciones', NULL, 2, 30, 40.00),
('Anatomía Patológica', 'Análisis anatomopatológico de muestras', NULL, 14, 30, 200.00),
('Atención a domicilio', 'Servicio médico a domicilio', NULL, 16, 60, 180.00),
('Cámara Hiperbárica', 'Terapia con oxígeno hiperbárico', NULL, 12, 90, 350.00),
('Hidroterapia', 'Terapia con agua', NULL, 12, 45, 80.00),
('Ozonoterapia', 'Terapia con ozono medicinal', NULL, 12, 45, 120.00),
('Terapia Del Dolor Y Cuidados Paliativos', 'Manejo del dolor y cuidados paliativos', NULL, 12, 60, 150.00),
('Terapia Física Y Rehabilitación', 'Sesiones de terapia física y rehabilitación', NULL, 12, 60, 85.00),
('Sala de operaciones', 'Uso de sala de operaciones y procedimientos quirúrgicos', NULL, 8, 120, 800.00),
('Obstetricia', 'Atención obstétrica y control prenatal', NULL, 9, 45, 90.00),
('Crecimiento y Desarrollo – Cred', 'Control de crecimiento y desarrollo infantil', NULL, 10, 30, 40.00),
('Vacunatorio', 'Servicio de vacunación', NULL, 10, 15, 50.00),
('Densitometría Ósea', 'Medición de densidad mineral ósea', NULL, 4, 30, 120.00),
('Ecografía', 'Examen ecográfico general', NULL, 4, 30, 80.00),
('Mamografía', 'Examen radiológico de mamas', NULL, 4, 30, 120.00),
('Radiología', 'Estudios radiológicos y diagnóstico por imágenes', NULL, 4, 30, 80.00),
('Resonancia Magnética', 'Estudio de resonancia magnética', NULL, 4, 45, 400.00),
('Tomografía', 'Tomografía computarizada', NULL, 4, 30, 350.00),
('Laboratorio Clínico', 'Análisis clínicos y pruebas de laboratorio', NULL, 3, 30, 60.00),
('Nutrición', 'Consulta y asesoría nutricional', NULL, 1, 45, 75.00),
('Psicología', 'Consulta y terapia psicológica', NULL, 1, 60, 100.00),
('Odontología', 'Servicios odontológicos generales', NULL, 11, 45, 80.00),
('Podología', 'Tratamiento de afecciones del pie', NULL, 12, 45, 70.00);

-- 6. REACTIVAR CHEQUEO DE CLAVES FORÁNEAS
SET FOREIGN_KEY_CHECKS = 1;
