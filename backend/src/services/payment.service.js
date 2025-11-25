/**
 * @fileoverview Payment service for integrating with Mercado Pago API.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import Payment from '../models/payment.model.js';
import { generateAndUploadCertificate } from '../controllers/content.controller.js';


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
      let existingPayment = await Payment.findByFolio(paymentId.toString());

      if (!existingPayment) {

        // Try to extract membership ID from metadata or external_reference
        const externalReference = paymentInfo.external_reference;
        const metadata = paymentInfo.metadata;

        // Attempt to find membership ID from metadata or external reference
        let membershipId = metadata?.membership_id || metadata?.IDMembresia;

        if (!membershipId && externalReference) {
          // Try parsing external_reference as JSON if it contains membership info
          try {
            const parsed = JSON.parse(externalReference);
            membershipId = parsed.membershipId || parsed.IDMembresia;
          } catch (e) {
            // If not JSON, treat as direct membership ID
            membershipId = parseInt(externalReference);
          }
        }

        if (!membershipId) {
          console.warn(`Cannot create payment record: no membership ID found in payment ${paymentId}`);
          return {
            success: false,
            message: 'Payment not found in database and no membership ID in webhook data',
            info: 'Payment may need to be manually linked to a membership'
          };
        }

        // Create payment record from webhook data
        existingPayment = await Payment.create({
          IDMembresia: membershipId,
          folio: paymentId.toString(),
          cantidad: paymentInfo.transaction_amount,
          payment_method_id: paymentInfo.payment_method_id,
          response_webhook: paymentInfo,
        });

      } else {
        // Update existing payment record with webhook data
        await Payment.update(paymentId.toString(), {
          payment_method_id: paymentInfo.payment_method_id,
          response_webhook: paymentInfo,
        });
      }

      // Update membership status based on payment status
      const membershipStatus = this.mapPaymentStatusToMembership(
        paymentInfo.status
      );

      await Payment.updateMembershipStatus(
        existingPayment.IDMembresia,
        membershipStatus
      );

      let certificateResult = { generated: false };

      // If payment is approved, update expiration date and generate certificate
      if (paymentInfo.status === 'approved') {
        // Update membership expiration date to one year from now
        await Payment.updateMembershipExpirationDate(
          existingPayment.IDMembresia
        );

        // Generate certificate with the updated expiration date
        certificateResult = await generateAndUploadCertificate(
          existingPayment.IDMembresia
        );
      }

      return {
        success: true,
        message: 'Payment processed successfully',
        paymentStatus: paymentInfo.status,
        membershipStatus,
      };
    } catch (error) {
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
        throw new Error(
          `Mercado Pago API error: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create a payment preference in Mercado Pago.
   * @param {Object} preferenceData - Preference data.
   * @param {number} preferenceData.membershipId - Membership ID.
   * @param {string} preferenceData.membershipType - Membership type.
   * @param {number} preferenceData.amount - Payment amount.
   * @param {string} preferenceData.userEmail - User email.
   * @return {Promise<Object>} Preference with init_point URL.
   */
  async createPaymentPreference(preferenceData) {
    try {
      const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

      if (!accessToken) {
        throw new Error('MERCADO_PAGO_ACCESS_TOKEN not configured');
      }

      const { membershipId, membershipType, amount, userEmail } = preferenceData;

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

      const preference = {
        items: [
          {
            title: `Membresía ${membershipType} - SOMEFIPP`,
            quantity: 1,
            unit_price: amount,
            currency_id: 'MXN',
          },
        ],
        payer: {
          email: userEmail,
        },
        external_reference: membershipId.toString(),
        metadata: {
          membership_id: membershipId,
          membership_type: membershipType,
        },
        back_urls: {
          success: `${frontendUrl}/payment/return`,
          failure: `${frontendUrl}/payment/return`,
          pending: `${frontendUrl}/payment/return`,
        },
        notification_url: `${backendUrl}/api/payments/webhook`,
      };

      // Only enable auto_return in production (not with localhost)
      if (!frontendUrl.includes('localhost')) {
        preference.auto_return = 'approved';
      }

      const response = await fetch(
        'https://api.mercadopago.com/checkout/preferences',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(preference),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Mercado Pago API error: ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();

      return {
        id: result.id,
        init_point: result.init_point,
      };
    } catch (error) {
      throw error;
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
      throw error;
    }
  },
};

export default PaymentService;
