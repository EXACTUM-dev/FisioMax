/**
 * @fileoverview Payment service for integrating with Mercado Pago API.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import Payment from '../models/payment.model.js';

/**
 * Payment service for handling Mercado Pago integrations.
 */
const PaymentService = {
  /**
   * Process Mercado Pago webhook notification.
   * @param {Object} notification - Webhook notification from Mercado Pago.
   * @return {Promise<Object>} Processing result.
   */
  async processWebhook(notification) {
    try {
      const { type, data } = notification;

      // Only process payment notifications
      if (type !== 'payment') {
        return { success: true, message: 'Notification type not processed' };
      }

      const paymentId = data.id;

      // Fetch payment details from Mercado Pago
      const paymentInfo = await this.getPaymentInfo(paymentId);

      if (!paymentInfo) {
        throw new Error('Payment not found in Mercado Pago');
      }

      // Find payment in our database
      const existingPayment = await Payment.findByFolio(paymentId.toString());

      if (!existingPayment) {
        console.warn(`Payment with folio ${paymentId} not found in database`);
        return { success: false, message: 'Payment not found in database' };
      }

      // Update payment record with webhook data
      await Payment.update(paymentId.toString(), {
        payment_method_id: paymentInfo.payment_method_id,
        response_webhook: paymentInfo,
      });

      // Update membership status based on payment status
      const membershipStatus = this.mapPaymentStatusToMembership(
        paymentInfo.status
      );

      await Payment.updateMembershipStatus(
        existingPayment.IDMembresia,
        membershipStatus
      );

      return {
        success: true,
        message: 'Payment processed successfully',
        paymentStatus: paymentInfo.status,
        membershipStatus,
      };
    } catch (error) {
      console.error('Error processing webhook:', error);
      throw error;
    }
  },

  /**
   * Get payment information from Mercado Pago API.
   * @param {string} paymentId - Mercado Pago payment ID.
   * @return {Promise<Object|null>} Payment information.
   */
  async getPaymentInfo(paymentId) {
    try {
      const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

      if (!accessToken) {
        throw new Error('MERCADO_PAGO_ACCESS_TOKEN not configured');
      }

      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        console.error(
          `Mercado Pago API error: ${response.status} ${response.statusText}`
        );
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching payment from Mercado Pago:', error);
      return null;
    }
  },

  /**
   * Map Mercado Pago payment status to membership status.
   * @param {string} mpStatus - Mercado Pago status.
   * @return {string} Membership status.
   */
  mapPaymentStatusToMembership(mpStatus) {
    const statusMap = {
      'approved': 'Pagado',
      'pending': 'Pendiente',
      'in_process': 'Pendiente',
      'rejected': 'No Pagado',
      'cancelled': 'No Pagado',
      'refunded': 'No Pagado',
      'charged_back': 'No Pagado',
    };

    return statusMap[mpStatus] || 'Pendiente';
  },

  /**
   * Create a payment record for a membership.
   * @param {Object} paymentData - Payment data.
   * @return {Promise<Object>} Created payment.
   */
  async createPayment(paymentData) {
    try {
      return await Payment.create(paymentData);
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },

  /**
   * Get payment status for a user.
   * @param {number} userId - User ID.
   * @return {Promise<Object>} Payment status information.
   */
  async getUserPaymentStatus(userId) {
    try {
      const payments = await Payment.findByUser(userId);
      return {
        payments,
        hasActivePayment: payments.some(
          (p) => p.membershipPaymentStatus === 'Pagado'
        ),
      };
    } catch (error) {
      console.error('Error getting user payment status:', error);
      throw error;
    }
  },
};

export default PaymentService;
