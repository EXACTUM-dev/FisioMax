/**
 * @fileoverview Payment model for managing payment transactions with Mercado Pago.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import db from '../../database/db.js';

/**
 * Payment model for database operations related to payments.
 */
const Payment = {
  /**
   * Create a new payment record.
   * @param {Object} paymentData - Payment information.
   * @param {number} paymentData.IDMembresia - Membership ID.
   * @param {string} paymentData.folio - Mercado Pago payment_id.
   * @param {number} paymentData.cantidad - Payment amount.
   * @param {string} [paymentData.payment_method_id] - Payment method (visa, oxxo, etc.).
   * @param {Object} [paymentData.response_webhook] - Full webhook response from Mercado Pago.
   * @return {Promise<Object>} Created payment record.
   */
  async create(paymentData) {
    const {
      IDMembresia,
      folio,
      cantidad,
      payment_method_id = null,
      response_webhook = null,
    } = paymentData;

    const [result] = await db.query(
      `INSERT INTO pago (IDMembresia, folio, cantidad, payment_method_id, response_webhook, fechaPago)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        IDMembresia,
        folio,
        cantidad,
        payment_method_id,
        response_webhook ? JSON.stringify(response_webhook) : null,
      ]
    );

    return { IDPago: result.insertId, ...paymentData };
  },

  /**
   * Find a payment by folio (payment_id from Mercado Pago).
   * @param {string} folio - Mercado Pago payment_id.
   * @return {Promise<Object|null>} Payment record or null if not found.
   */
  async findByFolio(folio) {
    const [rows] = await db.query(
      `SELECT p.*, m.IDUsuario, m.estatusPago as membershipPaymentStatus
       FROM pago p
       INNER JOIN membresia m ON p.IDMembresia = m.IDMembresia
       WHERE p.folio = ?`,
      [folio]
    );

    return rows.length > 0 ? rows[0] : null;
  },

  /**
   * Get all payments for a specific membership.
   * @param {number} IDMembresia - Membership ID.
   * @return {Promise<Array>} Array of payment records.
   */
  async findByMembership(IDMembresia) {
    const [rows] = await db.query(
      `SELECT * FROM pago
       WHERE IDMembresia = ?
       ORDER BY fechaPago DESC`,
      [IDMembresia]
    );

    return rows;
  },

  /**
   * Get all payments for a specific user.
   * @param {number} IDUsuario - User ID.
   * @return {Promise<Array>} Array of payment records with parsed webhook data.
   */
  async findByUser(IDUsuario) {
    const [rows] = await db.query(
      `SELECT p.IDPago, p.IDMembresia, p.folio, p.cantidad, p.payment_method_id, 
              p.fechaPago, p.response_webhook,
              m.tipo as membershipType, m.estatusPago as membershipPaymentStatus
       FROM pago p
       INNER JOIN membresia m ON p.IDMembresia = m.IDMembresia
       WHERE m.IDUsuario = ?
       ORDER BY p.fechaPago DESC`,
      [IDUsuario]
    );

    // Parse response_webhook JSON for each payment
    return rows.map(row => ({
      ...row,
      response_webhook: row.response_webhook ? JSON.parse(row.response_webhook) : null
    }));
  },

  /**
   * Update payment information (mainly for webhook updates).
   * @param {string} folio - Mercado Pago payment_id.
   * @param {Object} updateData - Data to update.
   * @return {Promise<boolean>} True if updated successfully.
   */
  async update(folio, updateData) {
    const { payment_method_id, response_webhook } = updateData;

    const [result] = await db.query(
      `UPDATE pago
       SET payment_method_id = ?,
           response_webhook = ?
       WHERE folio = ?`,
      [
        payment_method_id,
        response_webhook ? JSON.stringify(response_webhook) : null,
        folio,
      ]
    );

    return result.affectedRows > 0;
  },

  /**
   * Update membership payment status.
   * @param {number} IDMembresia - Membership ID.
   * @param {string} estatusPago - Payment status (Pagado, Pendiente, No Pagado).
   * @return {Promise<boolean>} True if updated successfully.
   */
  async updateMembershipStatus(IDMembresia, estatusPago) {
    const [result] = await db.query(
      `UPDATE membresia
       SET estatusPago = ?
       WHERE IDMembresia = ?`,
      [estatusPago, IDMembresia]
    );

    return result.affectedRows > 0;
  },
};

export default Payment;
