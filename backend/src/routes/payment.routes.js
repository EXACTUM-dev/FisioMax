/**
 * @fileoverview Payment routes for handling payment-related endpoints.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import express from 'express';
import PaymentController from '../controllers/payment.controller.js';
import { requireAuth } from '../middlewares/clerkAuth.js';
import { requireDbUser } from '../middlewares/requireDbUser.js';

const router = express.Router();

/**
 * POST /api/payments/webhook
 * Webhook endpoint for Mercado Pago notifications.
 * Note: This endpoint should NOT have authentication middleware.
 */
router.post('/webhook', PaymentController.handleWebhook);

/**
 * GET /api/payments/status/:paymentId
 * Get payment status by payment ID.
 * Requires authentication.
 */
router.get(
  '/status/:paymentId',
  requireAuth,
  requireDbUser,
  PaymentController.getPaymentStatus
);

/**
 * GET /api/payments/user
 * Get all payments for the authenticated user.
 * Requires authentication.
 */
router.get('/user', requireAuth, requireDbUser, PaymentController.getUserPayments);

/**
 * POST /api/payments
 * Create a payment record.
 * Requires authentication.
 */
router.post('/', requireAuth, requireDbUser, PaymentController.createPaymentRecord);

export default router;
