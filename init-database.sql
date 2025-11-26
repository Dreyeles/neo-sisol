-- Script de inicialización de la base de datos para SISOL Sistema de Citas
-- Ejecutar como root: mysql -u root -p < init-database.sql

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS sisol_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE sisol_db;

-- Crear usuario específico para la aplicación (opcional, puedes usar root)
-- CREATE USER IF NOT EXISTS 'sisol_user'@'localhost' IDENTIFIED BY 'sisol123';
-- GRANT ALL PRIVILEGES ON sisol_db.* TO 'sisol_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Mostrar las bases de datos creadas
SHOW DATABASES;

-- Mostrar que estamos usando la base de datos correcta
SELECT DATABASE() as 'Base de datos actual';



