/**
 * @fileoverview Payment service for integrating with Mercado Pago API.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import Payment from '../models/payment.model.js';
import Content from '../models/content.controller.js';


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
        console.log(`Payment with folio ${paymentId} not found in database. Attempting to create from webhook data...`);
        
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

        console.log(`Created payment record from webhook: ${paymentId} for membership ${membershipId}`);
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

      /*if (paymentInfo.status === 'approved') {
        certificateResult = await Content.generateAndUploadCertificate(
          existingPayment.IDMembresia
        );
      } */

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
      console.log('[Payment Service] Creating preference with data:', preferenceData);
      const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

      if (!accessToken) {
        console.error('[Payment Service] MERCADO_PAGO_ACCESS_TOKEN not configured');
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

      console.log('[Payment Service] Preference object:', JSON.stringify(preference, null, 2));
      console.log('[Payment Service] Calling Mercado Pago API...');

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

      console.log('[Payment Service] Mercado Pago response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[Payment Service] Mercado Pago preference creation error:', errorData);
        throw new Error(`Mercado Pago API error: ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      console.log('[Payment Service] Preference created successfully:', {
        id: result.id,
        init_point: result.init_point ? 'present' : 'missing',
      });

      return {
        id: result.id,
        init_point: result.init_point,
      };
    } catch (error) {
      console.error('[Payment Service] Error creating payment preference:', error);
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
