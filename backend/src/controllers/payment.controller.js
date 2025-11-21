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
      console.log('Received webhook:', JSON.stringify(req.body, null, 2));

      const result = await PaymentService.processWebhook(req.body);

      res.status(200).json(result);
    } catch (error) {
      console.error('Webhook processing error:', error);
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
      console.error('Error getting payment status:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving payment status',
        error: error.message,
      });
    }
  },

  /**
   * Get all payments for the authenticated user.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  async getUserPayments(req, res) {
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

      const paymentStatus = await PaymentService.getUserPaymentStatus(user.IDUsuario);

      res.json({
        success: true,
        ...paymentStatus,
      });
    } catch (error) {
      console.error('Error getting user payments:', error);
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
      console.error('Error creating payment record:', error);
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
      console.log('[Payment Preference] Request received');
      const clerkId = req.auth?.userId;

      if (!clerkId) {
        console.log('[Payment Preference] No Clerk ID found');
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      console.log('[Payment Preference] Fetching user for Clerk ID:', clerkId);
      // Get user from database using Clerk ID
      const user = await getUsuarioByClerkId(clerkId);

      if (!user) {
        console.log('[Payment Preference] User not found in database');
        return res.status(404).json({
          success: false,
          message: 'User not found in database',
        });
      }

      console.log('[Payment Preference] User found:', {
        IDUsuario: user.IDUsuario,
        IDMembresia: user.IDMembresia,
        correo: user.correo ? 'present' : 'missing',
      });

      const { membershipType, amount } = req.body;
      console.log('[Payment Preference] Request body:', { membershipType, amount });

      // Validate required fields
      if (!user.IDMembresia) {
        console.log('[Payment Preference] User does not have a membership');
        return res.status(400).json({
          success: false,
          message: 'User does not have a membership',
        });
      }

      if (!membershipType || !amount) {
        console.log('[Payment Preference] Missing required fields');
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: membershipType, amount',
        });
      }

      if (!user.correo) {
        console.log('[Payment Preference] User email is missing');
        return res.status(400).json({
          success: false,
          message: 'User email is required for payment',
        });
      }

      console.log('[Payment Preference] Creating payment preference...');
      // Create payment preference in Mercado Pago
      const preference = await PaymentService.createPaymentPreference({
        membershipId: user.IDMembresia,
        membershipType,
        amount,
        userEmail: user.correo,
      });

      console.log('[Payment Preference] Preference created successfully');
      res.json({
        success: true,
        preference,
      });
    } catch (error) {
      console.error('[Payment Preference] Error:', error);
      console.error('[Payment Preference] Error stack:', error.stack);
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
