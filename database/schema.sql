-- ============================================
-- SCRIPT DE BASE DE DATOS - SISTEMA DE CITAS MÉDICAS
-- ============================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS sisol_db;
USE sisol_db;

-- ============================================
-- TABLA: departamento
-- Descripción: Almacena los departamentos del centro médico
-- ============================================
CREATE TABLE departamento (
    id_departamento INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    ubicacion VARCHAR(100),
    telefono VARCHAR(20),
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: especialidades
-- Descripción: Almacena las especialidades médicas
-- ============================================
CREATE TABLE especialidades (
    id_especialidad INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    id_departamento INT,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_departamento) REFERENCES departamento(id_departamento) ON DELETE SET NULL
);

-- ============================================
-- TABLA: usuarios
-- Descripción: Almacena información de autenticación de todos los usuarios del sistema
-- ============================================
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('paciente', 'medico', 'administrativo', 'admin') NOT NULL,
    estado ENUM('activo', 'inactivo', 'suspendido') DEFAULT 'activo',
    ultimo_acceso TIMESTAMP NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_tipo_usuario (tipo_usuario)
);

-- ============================================
-- TABLA: paciente
-- Descripción: Almacena información personal de los pacientes
-- ============================================
CREATE TABLE paciente (
    id_paciente INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    dni VARCHAR(20) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    genero ENUM('masculino', 'femenino', 'otro') NOT NULL,
    telefono VARCHAR(20),
    celular VARCHAR(20),
    direccion TEXT,
    distrito VARCHAR(100),
    provincia VARCHAR(100),
    departamento VARCHAR(100),
    grupo_sanguineo VARCHAR(5),
    alergias TEXT,
    contacto_emergencia_nombre VARCHAR(100),
    contacto_emergencia_telefono VARCHAR(20),
    contacto_emergencia_relacion VARCHAR(50),
    ruc VARCHAR(11),
    razon_social VARCHAR(200),
    direccion_fiscal TEXT,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    INDEX idx_dni (dni),
    INDEX idx_nombres_apellidos (nombres, apellidos)
);

-- ============================================
-- TABLA: medico
-- Descripción: Almacena información de los médicos
-- ============================================
CREATE TABLE medico (
    id_medico INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    dni VARCHAR(20) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    genero ENUM('masculino', 'femenino', 'otro') NOT NULL,
    telefono VARCHAR(20),
    celular VARCHAR(20),
    direccion TEXT,
    id_especialidad INT NOT NULL,
    id_departamento INT,
    numero_colegiatura VARCHAR(50) NOT NULL UNIQUE,
    titulo_profesional VARCHAR(100),
    universidad VARCHAR(150),
    anios_experiencia INT,
    firma_digital VARCHAR(255),
    horario_atencion TEXT,
    costo_consulta DECIMAL(10, 2),
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    fecha_contratacion DATE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_especialidad) REFERENCES especialidades(id_especialidad) ON DELETE RESTRICT,
    FOREIGN KEY (id_departamento) REFERENCES departamento(id_departamento) ON DELETE SET NULL,
    INDEX idx_dni (dni),
    INDEX idx_especialidad (id_especialidad),
    INDEX idx_nombres_apellidos (nombres, apellidos)
);

-- ============================================
-- TABLA: personal_administrativo
-- Descripción: Almacena información del personal administrativo
-- ============================================
CREATE TABLE personal_administrativo (
    id_personal INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    dni VARCHAR(20) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    genero ENUM('masculino', 'femenino', 'otro') NOT NULL,
    telefono VARCHAR(20),
    celular VARCHAR(20),
    direccion TEXT,
    id_departamento INT,
    cargo VARCHAR(100) NOT NULL,
    nivel_acceso ENUM('basico', 'intermedio', 'avanzado', 'total') DEFAULT 'basico',
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    fecha_contratacion DATE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_departamento) REFERENCES departamento(id_departamento) ON DELETE SET NULL,
    INDEX idx_dni (dni),
    INDEX idx_nombres_apellidos (nombres, apellidos)
);

-- ============================================
-- TABLA: servicios
-- Descripción: Almacena los servicios médicos disponibles
-- ============================================
CREATE TABLE servicios (
    id_servicio INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    id_especialidad INT,
    id_departamento INT,
    duracion_minutos INT NOT NULL DEFAULT 30,
    costo DECIMAL(10, 2) NOT NULL,
    requiere_preparacion BOOLEAN DEFAULT FALSE,
    instrucciones_preparacion TEXT,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_especialidad) REFERENCES especialidades(id_especialidad) ON DELETE SET NULL,
    FOREIGN KEY (id_departamento) REFERENCES departamento(id_departamento) ON DELETE SET NULL,
    INDEX idx_nombre (nombre)
);

-- ============================================
-- TABLA: disponibilidad
-- Descripción: Almacena la disponibilidad de horarios de los médicos
-- ============================================
CREATE TABLE disponibilidad (
    id_disponibilidad INT AUTO_INCREMENT PRIMARY KEY,
    id_medico INT NOT NULL,
    dia_semana ENUM('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo') NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    intervalo_minutos INT DEFAULT 30,
    fecha_inicio_vigencia DATE NOT NULL,
    fecha_fin_vigencia DATE,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_medico) REFERENCES medico(id_medico) ON DELETE CASCADE,
    INDEX idx_medico_dia (id_medico, dia_semana)
);

-- ============================================
-- TABLA: cita
-- Descripción: Almacena las citas médicas programadas
-- ============================================
CREATE TABLE cita (
    id_cita INT AUTO_INCREMENT PRIMARY KEY,
    id_paciente INT NOT NULL,
    id_medico INT NOT NULL,
    id_servicio INT,
    fecha_cita DATE NOT NULL,
    hora_cita TIME NOT NULL,
    duracion_minutos INT DEFAULT 30,
    motivo_consulta TEXT,
    tipo_cita ENUM('primera_vez', 'seguimiento', 'control', 'emergencia') DEFAULT 'primera_vez',
    estado ENUM('programada', 'confirmada', 'en_curso', 'completada', 'pospuesta', 'no_asistio') DEFAULT 'programada',
    observaciones TEXT,
    id_personal_registro INT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    fecha_pospuesta TIMESTAMP NULL,
    motivo_pospuesta TEXT,
    FOREIGN KEY (id_paciente) REFERENCES paciente(id_paciente) ON DELETE CASCADE,
    FOREIGN KEY (id_medico) REFERENCES medico(id_medico) ON DELETE RESTRICT,
    FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio) ON DELETE SET NULL,
    FOREIGN KEY (id_personal_registro) REFERENCES personal_administrativo(id_personal) ON DELETE SET NULL,
    INDEX idx_fecha_hora (fecha_cita, hora_cita),
    INDEX idx_paciente (id_paciente),
    INDEX idx_medico (id_medico),
    INDEX idx_estado (estado)
);

-- ============================================
-- TABLA: atencion_medica
-- Descripción: Almacena el historial de atenciones médicas y diagnósticos
-- ============================================
CREATE TABLE atencion_medica (
    id_atencion INT AUTO_INCREMENT PRIMARY KEY,
    id_cita INT NOT NULL UNIQUE,
    id_paciente INT NOT NULL,
    id_medico INT NOT NULL,
    fecha_atencion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    motivo_consulta TEXT NOT NULL,
    sintomas TEXT,
    signos_vitales JSON,
    diagnostico TEXT NOT NULL,
    codigo_cie10 VARCHAR(10),
    tratamiento TEXT,
    receta_medica TEXT,
    examenes_solicitados TEXT,
    observaciones TEXT,
    proxima_cita_recomendada DATE,
    archivo_adjunto VARCHAR(255),
    estado ENUM('en_proceso', 'finalizada') DEFAULT 'finalizada',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cita) REFERENCES cita(id_cita) ON DELETE CASCADE,
    FOREIGN KEY (id_paciente) REFERENCES paciente(id_paciente) ON DELETE CASCADE,
    FOREIGN KEY (id_medico) REFERENCES medico(id_medico) ON DELETE RESTRICT,
    INDEX idx_paciente (id_paciente),
    INDEX idx_medico (id_medico),
    INDEX idx_fecha (fecha_atencion)
);

-- ============================================
-- TABLA: pago
-- Descripción: Almacena información de los pagos realizados
-- ============================================
CREATE TABLE pago (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_cita INT NOT NULL,
    id_paciente INT NOT NULL,
    id_servicio INT,
    monto DECIMAL(10, 2) NOT NULL,
    descuento DECIMAL(10, 2) DEFAULT 0.00,
    monto_total DECIMAL(10, 2) NOT NULL,
    metodo_pago ENUM('tarjeta_debito', 'tarjeta_credito', 'transferencia', 'yape', 'plin') NOT NULL,
    numero_transaccion VARCHAR(100),
    estado_pago ENUM('pendiente', 'pagado', 'cancelado') DEFAULT 'pendiente',
    fecha_pago TIMESTAMP NULL,
    comprobante_tipo ENUM('boleta', 'factura') DEFAULT 'boleta',
    comprobante_numero VARCHAR(50),
    comprobante_archivo VARCHAR(255),
    id_personal_registro INT,
    observaciones TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cita) REFERENCES cita(id_cita) ON DELETE CASCADE,
    FOREIGN KEY (id_paciente) REFERENCES paciente(id_paciente) ON DELETE CASCADE,
    FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio) ON DELETE SET NULL,
    FOREIGN KEY (id_personal_registro) REFERENCES personal_administrativo(id_personal) ON DELETE SET NULL,
    INDEX idx_paciente (id_paciente),
    INDEX idx_estado (estado_pago),
    INDEX idx_fecha (fecha_pago)
);

-- ============================================
-- TABLA: historial_medico
-- Descripción: Almacena el historial médico general del paciente
-- ============================================
CREATE TABLE historial_medico (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_paciente INT NOT NULL UNIQUE,
    antecedentes_personales TEXT,
    antecedentes_familiares TEXT,
    enfermedades_cronicas TEXT,
    cirugias_previas TEXT,
    medicamentos_actuales TEXT,
    alergias_medicamentos TEXT,
    habitos TEXT,
    vacunas TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_paciente) REFERENCES paciente(id_paciente) ON DELETE CASCADE
);

-- ============================================
-- TABLA: notificaciones
-- Descripción: Almacena las notificaciones del sistema
-- ============================================
CREATE TABLE notificaciones (
    id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    tipo ENUM('cita', 'pago', 'recordatorio', 'sistema', 'promocion') NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    id_referencia INT,
    leida BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura TIMESTAMP NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    INDEX idx_usuario_leida (id_usuario, leida),
    INDEX idx_fecha (fecha_envio)
);

-- ============================================
-- DATOS DE EJEMPLO
-- ============================================

-- Insertar departamentos
INSERT INTO departamento (nombre, descripcion, ubicacion, telefono) VALUES
('Consulta Externa', 'Departamento de consultas médicas generales', 'Piso 1', '01-2345678'),
('Emergencia', 'Departamento de atención de emergencias 24 horas', 'Piso 1', '01-2345679'),
('Laboratorio Clínico', 'Departamento de análisis clínicos y pruebas de laboratorio', 'Piso 2', '01-2345680'),
('Radiología e Imágenes', 'Departamento de diagnóstico por imágenes', 'Piso 2', '01-2345681'),
('Farmacia', 'Departamento de farmacia y dispensación de medicamentos', 'Piso 1', '01-2345682'),
('Administración', 'Departamento administrativo y gestión hospitalaria', 'Piso 3', '01-2345683'),
('Hospitalización', 'Departamento de internamiento y cuidados hospitalarios', 'Piso 3-4', '01-2345684'),
('Cirugía', 'Departamento quirúrgico y salas de operaciones', 'Piso 2', '01-2345685'),
('Obstetricia', 'Departamento de atención obstétrica y ginecológica', 'Piso 3', '01-2345686'),
('Pediatría', 'Departamento de atención pediátrica', 'Piso 2', '01-2345687'),
('Odontología', 'Departamento de servicios odontológicos', 'Piso 1', '01-2345688'),
('Rehabilitación', 'Departamento de terapia física y rehabilitación', 'Piso 1', '01-2345689'),
('Medicina Estética', 'Departamento de tratamientos estéticos', 'Piso 2', '01-2345690'),
('Anatomía Patológica', 'Departamento de análisis anatomopatológico', 'Piso 2', '01-2345691'),
('Banco de Sangre', 'Departamento de hemoterapia y banco de sangre', 'Piso 2', '01-2345692'),
('Servicios Auxiliares', 'Departamento de servicios de apoyo médico', 'Piso 1', '01-2345693');

-- Insertar especialidades
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

-- Insertar servicios
INSERT INTO servicios (nombre, descripcion, id_especialidad, id_departamento, duracion_minutos, costo) VALUES
-- Servicios Administrativos (Departamento 6: Administración)
('Administración Hospitalaria', 'Servicios administrativos y gestión hospitalaria', NULL, 6, 30, 0.00),

-- Servicios de Emergencia (Departamento 2: Emergencia)
('Ambulancia 24 horas', 'Servicio de ambulancia disponible las 24 horas', NULL, 2, 60, 150.00),
('Emergencias 24 horas', 'Atención de emergencias las 24 horas', NULL, 2, 30, 100.00),
('Tópico', 'Atención de tópico y curaciones', NULL, 2, 30, 40.00),

-- Servicios de Anatomía Patológica (Departamento 14: Anatomía Patológica)
('Anatomía Patológica', 'Análisis anatomopatológico de muestras', NULL, 14, 30, 200.00),

-- Servicios a Domicilio (Departamento 16: Servicios Auxiliares)
('Atención a domicilio', 'Servicio médico a domicilio', NULL, 16, 60, 180.00),

-- Servicios de Banco de Sangre (Departamento 15: Banco de Sangre)
('Banco de sangre', 'Servicio de banco de sangre y hemoderivados', NULL, 15, 45, 0.00),

-- Servicios de Terapias Especiales (Departamento 12: Rehabilitación)
('Cámara Hiperbárica', 'Terapia con oxígeno hiperbárico', NULL, 12, 90, 350.00),
('Hidroterapia', 'Terapia con agua', NULL, 12, 45, 80.00),
('Ozonoterapia', 'Terapia con ozono medicinal', NULL, 12, 45, 120.00),
('Terapia Del Dolor Y Cuidados Paliativos', 'Manejo del dolor y cuidados paliativos', NULL, 12, 60, 150.00),
('Terapia Física Y Rehabilitación', 'Sesiones de terapia física y rehabilitación', NULL, 12, 60, 85.00),

-- Servicios de Cirugía (Departamento 8: Cirugía)
('Central de esterilización', 'Servicio de esterilización de equipos médicos', NULL, 8, 30, 0.00),
('Sala de operaciones', 'Uso de sala de operaciones y procedimientos quirúrgicos', NULL, 8, 120, 800.00),

-- Servicios de Obstetricia (Departamento 9: Obstetricia)
('Central obstétrico', 'Atención de partos y procedimientos obstétricos', NULL, 9, 120, 500.00),
('Obstetricia', 'Atención obstétrica y control prenatal', NULL, 9, 45, 90.00),

-- Servicios de Pediatría (Departamento 10: Pediatría)
('Crecimiento y Desarrollo – Cred', 'Control de crecimiento y desarrollo infantil', NULL, 10, 30, 40.00),
('Vacunatorio', 'Servicio de vacunación', NULL, 10, 15, 50.00),

-- Servicios de Radiología e Imágenes (Departamento 4: Radiología e Imágenes)
('Densitometría Ósea', 'Medición de densidad mineral ósea', NULL, 4, 30, 120.00),
('Ecografía', 'Examen ecográfico general', NULL, 4, 30, 80.00),
('Ecografia Ginecológica', 'Ecografía especializada ginecológica', NULL, 4, 30, 90.00),
('Ecografía Mamaria', 'Ecografía de mamas', NULL, 4, 30, 100.00),
('Ecografía Urológica', 'Ecografía del sistema urinario', NULL, 4, 30, 95.00),
('Mamografía', 'Examen radiológico de mamas', NULL, 4, 30, 120.00),
('Radiología', 'Estudios radiológicos y diagnóstico por imágenes', NULL, 4, 30, 80.00),
('Resonancia Magnética', 'Estudio de resonancia magnética', NULL, 4, 45, 400.00),
('Tomografía', 'Tomografía computarizada', NULL, 4, 30, 350.00),

-- Servicios de Laboratorio Clínico (Departamento 3: Laboratorio Clínico)
('Laboratorio Clínico', 'Análisis clínicos y pruebas de laboratorio', NULL, 3, 30, 60.00),

-- Servicios Neurológicos (Departamento 16: Servicios Auxiliares)
('Electroencefalograma', 'Estudio de actividad eléctrica cerebral', NULL, 16, 45, 150.00),
('Electromiografía', 'Estudio de actividad eléctrica muscular', NULL, 16, 60, 180.00),

-- Servicios Administrativos de Salud (Departamento 6: Administración)
('Examen para brevete', 'Evaluación médica para licencia de conducir', NULL, 6, 30, 50.00),
('Salud ocupacional', 'Evaluaciones de salud ocupacional', NULL, 6, 45, 90.00),

-- Servicios de Farmacia (Departamento 5: Farmacia)
('Farmacia', 'Servicio de farmacia y dispensación de medicamentos', NULL, 5, 15, 0.00),
('Farmacia Dermatológica', 'Farmacia especializada en productos dermatológicos', NULL, 5, 15, 0.00),

-- Servicios de Hospitalización (Departamento 7: Hospitalización)
('Hospitalización', 'Servicio de internamiento hospitalario', NULL, 7, 1440, 300.00),
('Planta De Oxígeno', 'Suministro de oxígeno medicinal', NULL, 7, 30, 0.00),

-- Servicios de Medicina Estética (Departamento 13: Medicina Estética)
('Medicina Estética', 'Tratamientos estéticos médicos', NULL, 13, 60, 200.00),

-- Servicios de Consulta Externa (Departamento 1: Consulta Externa)
('Nutrición', 'Consulta y asesoría nutricional', NULL, 1, 45, 75.00),
('Psicología', 'Consulta y terapia psicológica', NULL, 1, 60, 100.00),

-- Servicios de Odontología (Departamento 11: Odontología)
('Odontología', 'Servicios odontológicos generales', NULL, 11, 45, 80.00),
('Odontopediatría', 'Odontología pediátrica', NULL, 11, 45, 85.00),

-- Servicios de Óptica (Departamento 16: Servicios Auxiliares)
('Óptica', 'Venta de lentes y productos ópticos', NULL, 16, 30, 0.00),
('Optometría', 'Evaluación visual y refracción', NULL, 16, 30, 60.00),

-- Servicios de Ortopedia (Departamento 16: Servicios Auxiliares)
('Ortopedia', 'Consulta y tratamiento ortopédico', NULL, 16, 30, 100.00),
('Venta de artículos de ortopedia', 'Venta de productos ortopédicos', NULL, 16, 30, 0.00),

-- Servicios de Podología (Departamento 12: Rehabilitación)
('Podología', 'Tratamiento de afecciones del pie', NULL, 12, 45, 70.00);

-- ============================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ============================================

-- Índices compuestos para mejorar consultas frecuentes
CREATE INDEX idx_cita_fecha_medico ON cita(fecha_cita, id_medico, estado);
CREATE INDEX idx_pago_fecha_estado ON pago(fecha_pago, estado_pago);
CREATE INDEX idx_atencion_paciente_fecha ON atencion_medica(id_paciente, fecha_atencion);

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
