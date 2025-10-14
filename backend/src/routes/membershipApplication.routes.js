/**
 * version 1.1.1
 * Router with endpoints for membership application managment.
 */
import express from 'express';
import {
  createMembershipApplication
} from '../controllers/membershipApplication.controller.js';

const router = express.Router();

/**
 * @route POST /api/membership-applications
 * @desc Create a new membership application
 * @access Public
 */
router.post('/', createMembershipApplication);

export default router;