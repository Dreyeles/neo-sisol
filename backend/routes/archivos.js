import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from '../config/database.js';

const router = express.Router();

// Configuración de Multer
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Subir archivo (Actualizando JSON en historial_medico)
router.post('/upload', upload.single('archivo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: 'ERROR', message: 'No se ha subido ningún archivo.' });
        }

        const { id_paciente, id_medico, tipo_documento, descripcion } = req.body;

        if (!id_paciente) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ status: 'ERROR', message: 'Falta id_paciente.' });
        }

        const nuevoArchivo = {
            id_archivo: Date.now().toString(), // Generar ID único simple
            id_medico: id_medico,
            tipo_documento: tipo_documento || 'Otro',
            nombre_original: req.file.originalname,
            nombre_archivo: req.file.filename,
            ruta_archivo: `/uploads/${req.file.filename}`,
            descripcion: descripcion || '',
            fecha_subida: new Date().toISOString()
        };

        // 1. Obtener historial actual
        const [rows] = await db.query('SELECT archivos_adjuntos FROM historial_medico WHERE id_paciente = ?', [id_paciente]);

        let archivosActuales = [];
        let existeHistorial = false;

        if (rows.length > 0) {
            existeHistorial = true;
            if (rows[0].archivos_adjuntos) {
                try {
                    archivosActuales = JSON.parse(rows[0].archivos_adjuntos);
                    if (!Array.isArray(archivosActuales)) archivosActuales = [];
                } catch (e) {
                    archivosActuales = [];
                }
            }
        }

        // 2. Agregar nuevo archivo
        archivosActuales.unshift(nuevoArchivo); // Agregar al inicio
        const jsonArchivos = JSON.stringify(archivosActuales);

        // 3. Actualizar o Insertar
        if (existeHistorial) {
            await db.query('UPDATE historial_medico SET archivos_adjuntos = ? WHERE id_paciente = ?', [jsonArchivos, id_paciente]);
        } else {
            await db.query('INSERT INTO historial_medico (id_paciente, archivos_adjuntos) VALUES (?, ?)', [id_paciente, jsonArchivos]);
        }

        res.status(200).json({
            status: 'OK',
            message: 'Archivo subido correctamente',
            data: nuevoArchivo
        });

    } catch (error) {
        console.error('Error al subir archivo:', error);
        if (req.file) {
            try { fs.unlinkSync(req.file.path); } catch (e) { }
        }
        res.status(500).json({ status: 'ERROR', message: 'Error interno al procesar el archivo.' });
    }
});

// Listar archivos de un paciente (Leyendo JSON)
router.get('/paciente/:id_paciente', async (req, res) => {
    try {
        const { id_paciente } = req.params;
        const [rows] = await db.query('SELECT archivos_adjuntos FROM historial_medico WHERE id_paciente = ?', [id_paciente]);

        let archivos = [];
        if (rows.length > 0 && rows[0].archivos_adjuntos) {
            try {
                archivos = JSON.parse(rows[0].archivos_adjuntos);
            } catch (e) {
                console.error("Error parseando JSON de archivos", e);
            }
        }

        // Enriquecer con datos del médico (opcional, requeriría hacer queries adicionales o almacenar nombre medico en el JSON)
        // Por simplicidad y performance, asumimos que el frontend mostrará el ID o que guardaremos el nombre en el futuro.
        // O podemos hacer un map y buscar los nombres, pero es costoso.
        // Mejor: Almacenar nombre del médico en el JSON al subir. 
        // VOY A ACTUALIZAR LA SUBIDA PARA INCLUIR EL NOMBRE DEL MÉDICO SI ES POSIBLE, PERO PIDO ID_MEDICO EN EL BODY.
        // Para no complicar, devolvemos lo que hay en el JSON.

        res.json({ status: 'OK', data: archivos });
    } catch (error) {
        console.error('Error al listar archivos:', error);
        res.status(500).json({ status: 'ERROR', message: 'Error al obtener archivos.' });
    }
});

export default router;
