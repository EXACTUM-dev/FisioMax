/**
 * @fileoverview Notifications model - Database interaction for notifications
 * @version 0.1.0
 * @author EXACTUM-dev
 * @description Provides operations for notifications.
 */

import { dbPool } from '../../config.js';

/**
 * Get all unseen notifications from database by user.
 * @param {number} userID - User ID
 * @param {Object} filters - Filters for the query
 * @param {boolean} [filters.isRead=false] - Filter by read status
 * @returns {Promise<Array>} Array of notifications.
 */
export async function getByUser(userID, filters = {}) {
  try {
    const { isRead = false } = filters;
    
    const query = `
      SELECT 
        IDnotificacion,
        tipo,
        prioridad,
        mensaje,
        metadata,
        createdAt
      FROM notificaciones
      WHERE IDusuario = ?
        AND esRevisada = ?
      ORDER BY 
        FIELD(prioridad, 'urgent', 'high', 'medium', 'low'),
        createdAt DESC
    `;

    const [notifications] = await dbPool.query(query, [userID, isRead ? 1 : 0]);
    return notifications;
  } catch (error) {
    throw new Error(`Error al obtener notificaciones: ${error.message}`);
  }
}

/**
 * Create a new notification
 * @param {Object} notificationData - Notification data
 * @param {number} notificationData.userID - User ID
 * @param {string} notificationData.type - Notification type
 * @param {string} notificationData.priority - Notification priority
 * @param {string} notificationData.message - Notification message
 * @param {Object} notificationData.metadata - Additional metadata
 * @returns {Promise<Object>} Created notification information.
 */
export async function create(notificationData) {
  try {
    const { userID, type, priority, message, metadata } = notificationData;

    const query = `
      INSERT INTO notificaciones 
      (IDusuario, tipo, prioridad, mensaje, metadata, esRevisada, createdAt)
      VALUES (?, ?, ?, ?, ?, 0, NOW())
    `;

    const [result] = await dbPool.query(query, [
      userID,
      type,
      priority,
      message,
      JSON.stringify(metadata)
    ]);

    return {
      success: true,
      notificationID: result.insertId
    };
  } catch (error) {
    throw new Error(`Error al crear notificación: ${error.message}`);
  }
}

/**
 * Verify if exist any notification today for specific days
 * @param {number} userID - User ID
 * @param {number} daysRemaining - Days remaining until expiration
 * @returns {Promise<Boolean>} True if exists, false otherwise.
 */ 
export async function existsNotificationToday(userID, daysRemaining) {
  try {
    const query = `
      SELECT COUNT(*) as count 
      FROM notificaciones
      WHERE IDusuario = ?
        AND tipo = 'membership_renewal'
        AND DATE(createdAt) = CURDATE()
        AND JSON_EXTRACT(metadata, '$.daysRemaining') = ?
    `;

    const [result] = await dbPool.query(query, [userID, daysRemaining]);
    return result[0].count > 0;
  } catch (error) {
    throw new Error(`Error al verificar notificación: ${error.message}`);
  }
}

export default { getByUser, create, existsNotificationToday, };