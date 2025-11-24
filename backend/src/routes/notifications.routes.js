/**
 * @fileoverview Routes for notifications
 * @version 0.1.0
 * @author EXACTUM-dev
 */

import express from 'express';
const router = express.Router();
import NotificationController from '../controllers/notifications.controller.js';
import { requireAuth } from '../middlewares/clerkAuth.js';

/**
 * @route   GET /api/notifications
 * @desc    Get unread notifications for current user
 * @access  Private
 */
router.get( '/', requireAuth, NotificationController.getPendingNotifications );

/**
 * @route   PATCH /api/notifications/:id
 * @desc    Mark notification as read
 * @access  Private
 */
router.patch( '/:id', requireAuth, NotificationController.markAsRead );

/**
 * @route   POST /api/notifications/test-job
 * @desc    Execute manual verification
 * @access  Private
 */
router.post( '/test-job', requireAuth, NotificationController.executeDailyVerification);

export default router;