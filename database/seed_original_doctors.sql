-- =======================================================
-- SCRIPT DE MIGRACIÓN DE MÉDICOS (NOMBRES REALES) - NEO SISOL
-- =======================================================

USE railway;

-- 1. Limpieza segura de médicos actuales
SET SQL_SAFE_UPDATES = 0; -- Deshabilitar modo seguro para permitir limpieza masiva
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM usuarios WHERE tipo_usuario = 'medico';
DELETE FROM medico;
SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1; -- Rehabilitar modo seguro

-- 2. Crear tabla temporal con los nombres originales del proyecto
DROP TEMPORARY TABLE IF EXISTS temp_nombres_originales;
CREATE TEMPORARY TABLE temp_nombres_originales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    genero ENUM('masculino', 'femenino')
);

INSERT INTO temp_nombres_originales (nombre, apellido, genero) VALUES
('Aaron', 'Alvarez', 'masculino'), ('Ana', 'Acosta', 'femenino'),
('Bruno', 'Benitez', 'masculino'), ('Beatriz', 'Barrios', 'femenino'),
('Carlos', 'Castro', 'masculino'), ('Carla', 'Carrillo', 'femenino'),
('Daniel', 'Diaz', 'masculino'), ('Diana', 'Dominguez', 'femenino'),
('Eduardo', 'Espinoza', 'masculino'), ('Elena', 'Estrada', 'femenino'),
('Fernando', 'Flores', 'masculino'), ('Fernanda', 'Fernandez', 'femenino'),
('Gabriel', 'Garcia', 'masculino'), ('Gabriela', 'Gomez', 'femenino'),
('Hugo', 'Hernandez', 'masculino'), ('Hilda', 'Huaman', 'femenino'),
('Ignacio', 'Ibarra', 'masculino'), ('Isabel', 'Iglesias', 'femenino'),
('Javier', 'Jimenez', 'masculino'), ('Julia', 'Juarez', 'femenino'),
('Kevin', 'Kahn', 'masculino'), ('Karla', 'Klein', 'femenino'),
('Luis', 'Lopez', 'masculino'), ('Laura', 'Linares', 'femenino'),
('Manuel', 'Martinez', 'masculino'), ('Maria', 'Mendoza', 'femenino'),
('Nicolas', 'Nuñez', 'masculino'), ('Natalia', 'Navarro', 'femenino'),
('Oscar', 'Ortega', 'masculino'), ('Olivia', 'Ochoa', 'femenino'),
('Pedro', 'Perez', 'masculino'), ('Patricia', 'Paredes', 'femenino'),
('Quintin', 'Quispe', 'masculino'), ('Queta', 'Quintana', 'femenino'),
('Ricardo', 'Ramirez', 'masculino'), ('Rosa', 'Rojas', 'femenino'),
('Sergio', 'Sanchez', 'masculino'), ('Sofia', 'Salazar', 'femenino');

-- 3. Procedimiento para asignar estos nombres a las especialidades
DROP PROCEDURE IF EXISTS MigrarMedicosOriginales;
DELIMITER //

CREATE PROCEDURE MigrarMedicosOriginales()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_id_esp INT;
    DECLARE v_nom_esp VARCHAR(100);
    DECLARE v_counter INT DEFAULT 1;
    DECLARE v_max_names INT;
    
    -- Cursor para especialidades
    DECLARE cur CURSOR FOR SELECT id_especialidad, nombre FROM especialidades;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    SELECT COUNT(*) INTO v_max_names FROM temp_nombres_originales;
    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO v_id_esp, v_nom_esp;
        IF done THEN LEAVE read_loop; END IF;

        -- Insertar 2 médicos por especialidad usando la lista original
        
        -- Médico 1
        SELECT nombre, apellido, genero INTO @n1, @a1, @g1 FROM temp_nombres_originales WHERE id = v_counter;
        INSERT INTO usuarios (email, password, tipo_usuario, estado) VALUES (CONCAT(LOWER(@n1), '.', LOWER(@a1), '@sisol.com'), '123456', 'medico', 'activo');
        INSERT INTO medico (id_usuario, dni, nombres, apellidos, fecha_nacimiento, genero, id_especialidad, numero_colegiatura, horario_atencion, costo_consulta)
        VALUES (LAST_INSERT_ID(), CONCAT(70000000 + (v_id_esp * 100) + 1), @n1, @a1, '1980-05-15', @g1, v_id_esp, CONCAT('CMP-', 10000 + (v_id_esp * 10) + 1), 'Lun-Vie 08:00 - 14:00', 50.00);
        
        SET v_counter = IF(v_counter >= v_max_names, 1, v_counter + 1);

        -- Médico 2
        SELECT nombre, apellido, genero INTO @n2, @a2, @g2 FROM temp_nombres_originales WHERE id = v_counter;
        INSERT INTO usuarios (email, password, tipo_usuario, estado) VALUES (CONCAT(LOWER(@n2), '.', LOWER(@a2), '@sisol.com'), '123456', 'medico', 'activo');
        INSERT INTO medico (id_usuario, dni, nombres, apellidos, fecha_nacimiento, genero, id_especialidad, numero_colegiatura, horario_atencion, costo_consulta)
        VALUES (LAST_INSERT_ID(), CONCAT(70000000 + (v_id_esp * 100) + 2), @n2, @a2, '1985-08-20', @g2, v_id_esp, CONCAT('CMP-', 10000 + (v_id_esp * 10) + 2), 'Lun-Vie 14:00 - 20:00', 50.00);

        SET v_counter = IF(v_counter >= v_max_names, 1, v_counter + 1);

    END LOOP;

    CLOSE cur;
END //
DELIMITER ;

CALL MigrarMedicosOriginales();
DROP PROCEDURE MigrarMedicosOriginales;
DROP TEMPORARY TABLE temp_nombres_originales;
