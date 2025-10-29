/**
 * @fileoverview Router with endpoints for membership application managment.
 * @author EXACTUM-dev
 * @version 1.2.2
 * @description Defines endpoint to retrive membership applications
 */
import express from 'express';
import multer from 'multer';
import {
  createMembershipApplication,
  getMemberships,
  getMembershipById,
  approveMembership,
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
  // Accept both English and Spanish field names for files to remain compatible with clients
  { name: 'degreeDocument', maxCount: 1 },
  { name: 'titulo', maxCount: 1 },
  { name: 'professionalId', maxCount: 1 },
  { name: 'cedula', maxCount: 1 },
  { name: 'certificates', maxCount: 1 },
  { name: 'constancias', maxCount: 1 },
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


/**
 * @route GET /api/membresias
 * @description Obtain all the membership application
 * @access Private
 */
//router.get('/', requireAuth, getMemberships);
router.get('/', getMemberships);

// Detail endpoint for a single membership application
router.get('/:id', getMembershipById);


/**
 * @route POST /api/membresias/{id}/aprobar
 * @description Approve the membership application
 * @access Private
 */
router.post('/:id/aprobar', approveMembership);


export default router;