/**
 * @fileoverview Rutas para solicitudes de membresía SOMEFIPP
 * @version 1.0.0
 * @author EXACTUM-dev
 */
import express from 'express';
import multer from 'multer';
import {
  createMembershipApplication
} from '../controllers/membershipApplicationController.js';

const router = express.Router();

// Configuración de multer para manejo de archivos
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Solo permite PDF
  const allowedMimes = [
    'application/pdf'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se aceptan PDF.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo por archivo
  }
});

/**
 * @route POST /api/membership-applications
 * @desc Crear una nueva solicitud de membresía
 * @access Public
 */

router.post('/', upload.any(), (req, res, next) => {
  // Reorganizar archivos para mandar todos
  const filesObject = {};
  
  if (req.files && Array.isArray(req.files)) {
    req.files.forEach(file => {
      if (!filesObject[file.fieldname]) {
        filesObject[file.fieldname] = [];
      }
      filesObject[file.fieldname].push(file);
    });
  }
  
  req.files = filesObject;
  next();
}, createMembershipApplication);




// Middleware de manejo de errores específico para multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB.'
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
