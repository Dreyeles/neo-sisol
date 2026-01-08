-- Script para crear el primer usuario administrador
USE sisol_db;

-- 1. Insertar el usuario en la tabla de autenticación
-- El tipo_usuario debe ser 'administrativo' para que el frontend lo reconozca como admin
INSERT INTO usuarios (email, password, tipo_usuario, estado) 
VALUES ('admin@sisol.com', 'admin123', 'administrativo', 'activo');

-- Obtener el ID del usuario recién insertado
SET @id_user = LAST_INSERT_ID();

-- 2. Insertar los datos personales en la tabla personal_administrativo
-- Nota: id_departamento 6 es para 'Administración' según el schema.sql
INSERT INTO personal_administrativo (
    id_usuario, 
    dni, 
    nombres, 
    apellidos, 
    fecha_nacimiento, 
    genero, 
    telefono, 
    celular, 
    direccion, 
    id_departamento, 
    cargo, 
    nivel_acceso, 
    estado, 
    fecha_contratacion
) VALUES (
    @id_user,
    '00000001',
    'Administrador',
    'Principal',
    '1990-01-01',
    'otro',
    '01-2345678',
    '987654321',
    'Sede Central SISOL',
    6,
    'Super Admin',
    'total',
    'activo',
    CURDATE()
);

-- Verificar inserción
SELECT u.email, u.tipo_usuario, p.nombres, p.apellidos 
FROM usuarios u 
JOIN personal_administrativo p ON u.id_usuario = p.id_usuario
WHERE u.email = 'admin@sisol.com';
