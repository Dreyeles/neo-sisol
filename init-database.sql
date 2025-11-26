-- Script de inicialización de la base de datos para SISOL Sistema de Citas
-- Ejecutar como root: mysql -u root -p < init-database.sql

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS sisolv_final CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE sisolv_final;

-- Crear usuario específico para la aplicación (opcional, puedes usar root)
-- CREATE USER IF NOT EXISTS 'sisol_user'@'localhost' IDENTIFIED BY 'sisol123';
-- GRANT ALL PRIVILEGES ON sisolv_final.* TO 'sisol_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Mostrar las bases de datos creadas
SHOW DATABASES;

-- Mostrar que estamos usando la base de datos correcta
SELECT DATABASE() as 'Base de datos actual';



