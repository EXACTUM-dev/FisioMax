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

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Middleware to handle multiple file uploads
const uploadFields = upload.fields([
  { name: 'degreeDocument', maxCount: 1 },
  { name: 'professionalId', maxCount: 1 },
  { name: 'certificates', maxCount: 1 },
  { name: 'extraDoc1', maxCount: 1 },
  { name: 'extraDoc2', maxCount: 1 },
  { name: 'extraDoc3', maxCount: 1 },
  { name: 'extraDoc4', maxCount: 1 },
  { name: 'extraDoc5', maxCount: 1 },
]);

/**
 * @route POST /api/membership-applications
 * @desc Create a new membership application
 * @access Public
 */
router.post('/', uploadFields, createMembershipApplication);

export default router;