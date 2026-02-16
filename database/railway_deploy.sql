-- ============================================
-- SCRIPT DE BASE DE DATOS - OPTIMIZADO PARA RAILWAY
-- ============================================

-- NOTA: Se han eliminado los comandos CREATE DATABASE y USE 
-- para usar la base de datos que Railway asigna por defecto.

-- ============================================
-- TABLA: departamento
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
-- DATOS DE EJEMPLO (Omitidos para brevedad en railway_deploy)
-- Puedes añadir INSERTs aquí si lo deseas
-- ============================================

-- Índices compuestos finales
CREATE INDEX idx_cita_fecha_medico ON cita(fecha_cita, id_medico, estado);
CREATE INDEX idx_pago_fecha_estado ON pago(fecha_pago, estado_pago);
CREATE INDEX idx_atencion_paciente_fecha ON atencion_medica(id_paciente, fecha_atencion);
