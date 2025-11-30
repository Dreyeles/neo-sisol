-- Script para insertar 2 médicos por cada especialidad con nombres reales
USE sisol_db;

-- Limpiar datos anteriores (usuarios y médicos de prueba)
-- Borramos usuarios que tengan el formato de email de prueba anterior o el nuevo
DELETE FROM usuarios WHERE email LIKE 'medico%.%@sisol.com';

DROP PROCEDURE IF EXISTS SeedMedicos;
DROP TEMPORARY TABLE IF EXISTS temp_nombres;

CREATE TEMPORARY TABLE temp_nombres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    genero ENUM('masculino', 'femenino')
);

INSERT INTO temp_nombres (nombre, apellido, genero) VALUES
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
('Sergio', 'Sanchez', 'masculino'), ('Sofia', 'Salazar', 'femenino'),
('Tomas', 'Torres', 'masculino'), ('Tatiana', 'Tapia', 'femenino'),
('Ulises', 'Uribe', 'masculino'), ('Ursula', 'Ugarte', 'femenino'),
('Victor', 'Vargas', 'masculino'), ('Valentina', 'Vega', 'femenino'),
('Walter', 'Wong', 'masculino'), ('Wendy', 'Williams', 'femenino'),
('Xavier', 'Ximenez', 'masculino'), ('Ximena', 'Xara', 'femenino'),
('Yago', 'Yañez', 'masculino'), ('Yolanda', 'Yovera', 'femenino'),
('Zacarias', 'Zambrano', 'masculino'), ('Zoe', 'Zavala', 'femenino'),
('Alejandro', 'Avila', 'masculino'), ('Andrea', 'Arce', 'femenino'),
('Bernardo', 'Bravo', 'masculino'), ('Bianca', 'Bustamante', 'femenino'),
('Cesar', 'Campos', 'masculino'), ('Cecilia', 'Cordova', 'femenino'),
('Diego', 'Delgado', 'masculino'), ('Daniela', 'Davila', 'femenino'),
('Esteban', 'Escobar', 'masculino'), ('Erika', 'Echevarria', 'femenino'),
('Felipe', 'Farfan', 'masculino'), ('Fiorella', 'Fuentes', 'femenino'),
('Gustavo', 'Guerra', 'masculino'), ('Gloria', 'Galvez', 'femenino'),
('Hector', 'Hidalgo', 'masculino'), ('Haydee', 'Herrera', 'femenino'),
('Ivan', 'Izquierdo', 'masculino'), ('Irene', 'Inga', 'femenino'),
('Jorge', 'Jara', 'masculino'), ('Jessica', 'Jaimes', 'femenino');

DELIMITER //

CREATE PROCEDURE SeedMedicos()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_id_especialidad INT;
    DECLARE v_nombre_especialidad VARCHAR(100);
    DECLARE v_counter INT DEFAULT 1;
    
    -- Cursor para recorrer todas las especialidades activas
    DECLARE cur CURSOR FOR SELECT id_especialidad, nombre FROM especialidades WHERE estado = 'activo';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO v_id_especialidad, v_nombre_especialidad;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- =============================================
        -- MEDICO 1
        -- =============================================
        SELECT nombre, apellido, genero INTO @nombre1, @apellido1, @genero1 FROM temp_nombres WHERE id = v_counter;
        SET v_counter = v_counter + 1;
        -- Si se acaban los nombres, reiniciar contador (aunque tenemos suficientes)
        IF @nombre1 IS NULL THEN
            SET v_counter = 1;
            SELECT nombre, apellido, genero INTO @nombre1, @apellido1, @genero1 FROM temp_nombres WHERE id = v_counter;
            SET v_counter = v_counter + 1;
        END IF;
        
        INSERT INTO usuarios (email, password, tipo_usuario, estado) 
        VALUES (
            CONCAT('medico.', LOWER(@nombre1), '.', LOWER(@apellido1), v_id_especialidad, '@sisol.com'), 
            '123456', 
            'medico', 
            'activo'
        );
        
        SET @id_usuario1 = LAST_INSERT_ID();
        
        INSERT INTO medico (
            id_usuario, dni, nombres, apellidos, fecha_nacimiento, genero, telefono, 
            id_especialidad, numero_colegiatura, estado, horario_atencion, costo_consulta
        )
        VALUES (
            @id_usuario1, 
            CONCAT(10000000 + (v_id_especialidad * 100) + 1), 
            @nombre1, 
            @apellido1, 
            '1980-05-15', 
            @genero1, 
            '999000001', 
            v_id_especialidad, 
            CONCAT('CMP-', 10000 + (v_id_especialidad * 100) + 1), 
            'activo',
            'Lunes a Viernes 8:00 AM - 1:00 PM',
            50.00
        );

        -- =============================================
        -- MEDICO 2
        -- =============================================
        SELECT nombre, apellido, genero INTO @nombre2, @apellido2, @genero2 FROM temp_nombres WHERE id = v_counter;
        SET v_counter = v_counter + 1;
        IF @nombre2 IS NULL THEN
            SET v_counter = 1;
            SELECT nombre, apellido, genero INTO @nombre2, @apellido2, @genero2 FROM temp_nombres WHERE id = v_counter;
            SET v_counter = v_counter + 1;
        END IF;
        
        INSERT INTO usuarios (email, password, tipo_usuario, estado) 
        VALUES (
            CONCAT('medico.', LOWER(@nombre2), '.', LOWER(@apellido2), v_id_especialidad, '@sisol.com'), 
            '123456', 
            'medico', 
            'activo'
        );
        
        SET @id_usuario2 = LAST_INSERT_ID();
        
        INSERT INTO medico (
            id_usuario, dni, nombres, apellidos, fecha_nacimiento, genero, telefono, 
            id_especialidad, numero_colegiatura, estado, horario_atencion, costo_consulta
        )
        VALUES (
            @id_usuario2, 
            CONCAT(10000000 + (v_id_especialidad * 100) + 2), 
            @nombre2, 
            @apellido2, 
            '1985-08-20', 
            @genero2, 
            '999000002', 
            v_id_especialidad, 
            CONCAT('CMP-', 10000 + (v_id_especialidad * 100) + 2), 
            'activo',
            'Lunes a Viernes 2:00 PM - 7:00 PM',
            50.00
        );
        
    END LOOP;

    CLOSE cur;
END //

DELIMITER ;

CALL SeedMedicos();
DROP PROCEDURE SeedMedicos;
DROP TEMPORARY TABLE temp_nombres;

-- Verificar inserción
SELECT m.id_medico, m.nombres, m.apellidos, e.nombre as especialidad, u.email 
FROM medico m
JOIN especialidades e ON m.id_especialidad = e.id_especialidad
JOIN usuarios u ON m.id_usuario = u.id_usuario
ORDER BY e.nombre;
