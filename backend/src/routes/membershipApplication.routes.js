/**
 * version 1.1.1
 * Router with endpoints for membership application managment.
 */
import express from 'express';
import multer from 'multer';
import {
  createMembershipApplication
} from '../controllers/membershipApplication.controller.js';

const router = express.Router();
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['application/pdf'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se aceptan archivos PDF.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

/**
 * @route POST /api/membership-applications
 * @desc Create a new membership application
 * @access Public
 */
router.post('/', upload.any(), createMembershipApplication);

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande (máx 10MB).'
      });
    }
  }
  
  if (error.message?.includes('Solo se aceptan')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
});

export default router;