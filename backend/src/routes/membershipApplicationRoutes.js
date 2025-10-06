/**
 * @fileoverview Rutas para solicitudes de membresía SOMEFIPP
 * @version 1.0.0
 * @author EXACTUM-dev
 */
import express from 'express';
import multer from 'multer';
import {
  createMembershipApplication,
  getMembershipApplications,
  getMembershipApplicationById,
  updateMembershipApplicationStatus,
  downloadDocument
} from '../controllers/membershipApplicationController.js';

const router = express.Router();

// Configuración de multer para manejo de archivos
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Permitir solo PDF, DOC y DOCX
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se aceptan PDF, DOC y DOCX.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo por archivo
    files: 3 // Máximo 3 archivos
  }
});

/**
 * @route POST /api/membership-applications
 * @desc Crear una nueva solicitud de membresía
 * @access Public
 */
router.post('/', upload.fields([
  { name: 'titulo', maxCount: 1 },
  { name: 'cedula', maxCount: 1 },
  { name: 'constancias', maxCount: 1 }
]), createMembershipApplication);

/**
 * @route GET /api/membership-applications
 * @desc Obtener todas las solicitudes de membresía (con filtros y paginación)
 * @access Private (Admin)
 * @query {string} estado - Filtrar por estado (pendiente, aprobada, rechazada, en_revision)
 * @query {number} page - Número de página (default: 1)
 * @query {number} limit - Elementos por página (default: 10)
 */
router.get('/', getMembershipApplications);

/**
 * @route GET /api/membership-applications/:id
 * @desc Obtener una solicitud específica por ID
 * @access Private (Admin)
 * @param {string} id - ID de la solicitud
 */
router.get('/:id', getMembershipApplicationById);

/**
 * @route PUT /api/membership-applications/:id/status
 * @desc Actualizar el estado de una solicitud
 * @access Private (Admin)
 * @param {string} id - ID de la solicitud
 * @body {string} estado - Nuevo estado (pendiente, aprobada, rechazada, en_revision)
 * @body {string} notas - Notas adicionales (opcional)
 */
router.put('/:id/status', updateMembershipApplicationStatus);

/**
 * @route GET /api/membership-applications/:id/documents/:documentType
 * @desc Descargar un documento específico de una solicitud
 * @access Private (Admin)
 * @param {string} id - ID de la solicitud
 * @param {string} documentType - Tipo de documento (titulo, cedula, constancias)
 */
router.get('/:id/documents/:documentType', downloadDocument);

// Middleware de manejo de errores específico para multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Demasiados archivos. El máximo permitido es 3 archivos.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Campo de archivo inesperado.'
      });
    }
  }
  
  if (error.message === 'Tipo de archivo no permitido. Solo se aceptan PDF, DOC y DOCX.') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
});

export default router;
