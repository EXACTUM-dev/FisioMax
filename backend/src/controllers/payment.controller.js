/**
 * @fileoverview Payment controller for handling payment-related HTTP requests.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import PaymentService from '../services/payment.service.js';
import Payment from '../models/payment.model.js';

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
      const userId = req.user?.IDUsuario;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const paymentStatus = await PaymentService.getUserPaymentStatus(userId);

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
};

export default PaymentController;
