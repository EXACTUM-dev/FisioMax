/**
 * @fileoverview Payment service for frontend payment operations.
 * @version 1.0.1
 * @author EXACTUM-dev
 */

import { API_CONFIG, buildApiUrl } from '../config/api';

/**
 * Payment service for interacting with payment endpoints.
 */
const PaymentService = {
  /**
   * Create a payment record in the database.
   * @param {Object} paymentData - Payment information.
   * @param {number} paymentData.IDMembresia - Membership ID.
   * @param {string} paymentData.folio - Mercado Pago payment_id.
   * @param {number} paymentData.cantidad - Payment amount.
   * @param {Function} getToken - Clerk getToken function.
   * @returns {Promise<Object>} Created payment record.
   */
  async createPayment(paymentData, getToken) {
    try {
      const token = await getToken();
      const response = await fetch(buildApiUrl('/api/payments'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error('Error creating payment');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },

  /**
   * Get payment status from Mercado Pago.
   * @param {string} paymentId - Mercado Pago payment_id.
   * @param {Function} getToken - Clerk getToken function.
   * @returns {Promise<Object>} Payment status information.
   */
  async getPaymentStatus(paymentId, getToken) {
    try {
      const token = await getToken();
      const response = await fetch(buildApiUrl(`/api/payments/status/${paymentId}`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error getting payment status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  },

  /**
   * Get all payments for the current user.
   * @param {Function} getToken - Clerk getToken function.
   * @returns {Promise<Object>} User's payment history.
   */
  async getUserPayments(getToken) {
    try {
      const token = await getToken();
      const response = await fetch(buildApiUrl('/api/payments/user'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error getting user payments');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting user payments:', error);
      throw error;
    }
  },

  /**
   * Redirect to Mercado Pago payment link with user metadata.
   * @param {string} paymentLink - Base Mercado Pago payment link.
   * @param {Object} userData - User data to include as metadata.
   * @param {number} userData.userId - User ID.
   * @param {number} userData.membershipId - Membership ID.
   */
  redirectToPayment(paymentLink, userData) {
    // Add metadata as URL parameters if needed
    const url = new URL(paymentLink);
    
    // Store user data in sessionStorage for when they return
    sessionStorage.setItem('pendingPayment', JSON.stringify({
      userId: userData.userId,
      membershipId: userData.membershipId,
      timestamp: Date.now(),
    }));

    // Redirect to Mercado Pago
    window.location.href = url.toString();
  },

  /**
   * Get pending payment data from session storage.
   * @returns {Object|null} Pending payment data or null.
   */
  getPendingPayment() {
    const data = sessionStorage.getItem('pendingPayment');
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Error parsing pending payment:', error);
      return null;
    }
  },

  /**
   * Clear pending payment data from session storage.
   */
  clearPendingPayment() {
    sessionStorage.removeItem('pendingPayment');
  },
};

export default PaymentService;
