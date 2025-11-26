/**
 * @fileoverview Payment controller for handling payment-related HTTP requests.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import PaymentService from '../services/payment.service.js';
import Payment from '../models/payment.model.js';
import { getUsuarioByClerkId } from '../models/users.model.js';

/**
 * Payment controller.
 */
const PaymentController = {
  /**
   * Handle Mercado Pago webhook notifications.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  async handleWebhook(req, res) {
    try {

      const result = await PaymentService.processWebhook(req.body);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error processing webhook',
        error: error.message,
      });
    }
  },

  /**
   * Get payment status by payment ID.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  async getPaymentStatus(req, res) {
    try {
      const { paymentId } = req.params;

      // Get payment info from Mercado Pago
      const paymentInfo = await PaymentService.getPaymentInfo(paymentId);

      if (!paymentInfo) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found',
        });
      }

      // Check if payment exists in our database
      const localPayment = await Payment.findByFolio(paymentId);

      res.json({
        success: true,
        payment: paymentInfo,
        localRecord: localPayment,
        membershipStatus: localPayment
          ? localPayment.membershipPaymentStatus
          : null,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving payment status',
        error: error.message,
      });
    }
  },

  /**
   * Get all payments for the authenticated user or another user (admin only).
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  async getUserPayments(req, res) {
    try {
      const clerkId = req.auth?.userId;
      const targetUserId = req.query.userId; // Optional query parameter

      if (!clerkId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      // Get requesting user from database using Clerk ID
      const requestingUser = await getUsuarioByClerkId(clerkId);

      if (!requestingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found in database',
        });
      }

      let targetUserIdToFetch;

      // If viewing another user's payments
      if (targetUserId && targetUserId !== requestingUser.IDUsuario.toString()) {
        // Admin check removed as requested - route is already protected
        targetUserIdToFetch = parseInt(targetUserId);
      } else {
        // Viewing own payments
        targetUserIdToFetch = requestingUser.IDUsuario;
      }

      const paymentStatus = await PaymentService.getUserPaymentStatus(targetUserIdToFetch);

      res.json({
        success: true,
        ...paymentStatus,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving user payments',
        error: error.message,
      });
    }
  },

  /**
   * Create a payment record (called when user initiates payment).
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  async createPaymentRecord(req, res) {
    try {
      const { IDMembresia, folio, cantidad, payment_method_id } = req.body;

      // Validate required fields
      if (!IDMembresia || !folio || !cantidad) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: IDMembresia, folio, cantidad',
        });
      }

      const payment = await PaymentService.createPayment({
        IDMembresia,
        folio,
        cantidad,
        payment_method_id,
      });

      res.status(201).json({
        success: true,
        message: 'Payment record created',
        payment,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating payment record',
        error: error.message,
      });
    }
  },

  /**
   * Create a payment preference for Mercado Pago.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  async createPaymentPreference(req, res) {
    try {
      const clerkId = req.auth?.userId;

      if (!clerkId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      // Get user from database using Clerk ID
      const user = await getUsuarioByClerkId(clerkId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found in database',
        });
      }

      const { membershipType, amount } = req.body;

      // Validate required fields
      if (!user.IDMembresia) {
        return res.status(400).json({
          success: false,
          message: 'User does not have a membership',
        });
      }

      if (!membershipType || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: membershipType, amount',
        });
      }

      if (!user.correo) {
        return res.status(400).json({
          success: false,
          message: 'User email is required for payment',
        });
      }

      // Create payment preference in Mercado Pago
      const preference = await PaymentService.createPaymentPreference({
        membershipId: user.IDMembresia,
        membershipType,
        amount,
        userEmail: user.correo,
      });

      res.json({
        success: true,
        preference,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating payment preference',
        error: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      });
    }
  },
};

export default PaymentController;
