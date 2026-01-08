import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Obtener todos los departamentos activos
router.get('/departamentos', async (req, res) => {
    try {
        const [departamentos] = await db.query('SELECT * FROM departamento WHERE estado = "activo" ORDER BY nombre');
        res.json({
            status: 'OK',
            data: departamentos
        });
    } catch (error) {
        console.error('Error al obtener departamentos:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al obtener departamentos'
        });
    }
});

// Obtener servicios por id_departamento
router.get('/por-departamento/:id_departamento', async (req, res) => {
    try {
        const { id_departamento } = req.params;
        const [servicios] = await db.query(
            'SELECT * FROM servicios WHERE id_departamento = ? AND estado = "activo" ORDER BY nombre',
            [id_departamento]
        );
        res.json({
            status: 'OK',
            data: servicios
        });
    } catch (error) {
        console.error('Error al obtener servicios:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al obtener servicios'
        });
    }
});

// Obtener todos los servicios (para administración)
router.get('/', async (req, res) => {
    try {
        const [servicios] = await db.query(`
            SELECT s.*, e.nombre as especialidad_nombre, d.nombre as departamento_nombre 
            FROM servicios s
            LEFT JOIN especialidades e ON s.id_especialidad = e.id_especialidad
            LEFT JOIN departamento d ON s.id_departamento = d.id_departamento
            ORDER BY s.nombre
        `);
        res.json({
            status: 'OK',
            data: servicios
        });
    } catch (error) {
        console.error('Error al obtener todos los servicios:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al obtener servicios'
        });
    }
});

// Actualizar precio de un servicio
router.put('/:id_servicio', async (req, res) => {
    try {
        const { id_servicio } = req.params;
        const { costo, estado, nombre, descripcion } = req.body;

        await db.query(
            'UPDATE servicios SET costo = ?, estado = ?, nombre = ?, descripcion = ? WHERE id_servicio = ?',
            [costo, estado || 'activo', nombre, descripcion, id_servicio]
        );

        res.json({
            status: 'OK',
            message: 'Servicio actualizado correctamente'
        });
    } catch (error) {
        console.error('Error al actualizar servicio:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al actualizar servicio'
        });
    }
});

export default router;
