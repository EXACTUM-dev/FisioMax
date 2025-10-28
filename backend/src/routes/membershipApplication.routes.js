/**
 * @fileoverview Router with endpoints for membership application managment.
 * @author EXACTUM-dev
 * @version 1.2.1
 * @description Defines endpoints to retrive membership applications
 */
import express from 'express';
import multer from 'multer';
import {
  createMembershipApplication,
  getAllMembershipApplications,
  getMembershipApplicationById,
  getDocumentUrl,
  uploadPaymentProof,
  approveApplication,
  rejectApplication
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
  { name: 'certificates', maxCount: 1  },
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


// Middleware for single payment proof upload
const uploadSingle = upload.single('comprobante');

/**
 * @route GET /api/membresias
 * @desc Get all membership applications with optional filters
 * @access Admin
 * @query {boolean} estatusPago - Filter by payment status
 * @query {string} aceptado - Filter by acceptance status (null, 0, 1)
 */
router.get('/', getAllMembershipApplications);

/**
 * @route GET /api/membresias/:id
 * @desc Get a single membership application by ID
 * @access Admin
 */
router.get('/:id', getMembershipApplicationById);

/**
 * @route GET /api/membresias/:id/documento/:tipo
 * @desc Get document URL for viewing
 * @access Admin
 * @param {string} tipo - Document type (titulo, constancia, cedula, adicional)
 */
router.get('/:id/documento/:tipo', getDocumentUrl);

/**
 * @route POST /api/membresias/:id/comprobante
 * @desc Upload payment proof for an application
 * @access Public/Member
 */
router.post('/:id/comprobante', uploadSingle, uploadPaymentProof);

/**
 * @route POST /api/membresias/:id/aprobar
 * @desc Approve a membership application
 * @access Admin
 */
router.post('/:id/aprobar', approveApplication);

/**
 * @route POST /api/membresias/:id/rechazar
 * @desc Reject a membership application
 * @access Admin
 * @body {string} motivoRechazo - Reason for rejection (max 200 chars)
 */
router.post('/:id/rechazar', rejectApplication);

/**
 * @route POST /api/membership-applications
 * @desc Create a new membership application
 * @access Public
 */
router.post('/membership-applications', uploadFields, createMembershipApplication);

export default router;


