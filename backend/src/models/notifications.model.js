/**
 * @fileoverview Notifications model - Database interaction for notifications
 * @version 0.1.0
 * @author EXACTUM-dev
 * @description Provides operations for notifications.
 */

import { dbPool } from "../../config.js";

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
      JSON.stringify(metadata),
    ]);

    return {
      success: true,
      notificationID: result.insertId,
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

/**
 * Mark notification as read
 * @param {number} notificationID - Notification ID
 * @param {number} userID - User ID
 * @returns {Promise<Object>} Result of the operation.
 */
export async function markAsRead(notificationID, userID) {
  try {
    const query = `
      UPDATE notificaciones
      SET esRevisada = 1, readAt = NOW()
      WHERE IDnotificacion = ?
        AND IDusuario = ?
    `;

    const [result] = await dbPool.query(query, [notificationID, userID]);

    return {
      success: result.affectedRows > 0,
      affectedRows: result.affectedRows,
    };
  } catch (error) {
    throw new Error(`Error al marcar como leída: ${error.message}`);
  }
}
/**
 * Delete a notification for a user
 * @param {number} notificationID - Notification ID
 * @param {number} userID - User ID
 * @returns {Promise<Object>} Result of the operation.
 */
export async function deleteNotification(notificationID, userID) {
  try {
    const query = `
      DELETE FROM notificaciones
      WHERE IDnotificacion = ?
        AND IDusuario = ?
    `;

    const [result] = await dbPool.query(query, [notificationID, userID]);

    return {
      success: result.affectedRows > 0,
      affectedRows: result.affectedRows,
    };
  } catch (error) {
    throw new Error(`Error al borrar notificación: ${error.message}`);
  }
}

/**
 * Delete notifications related to a specific content id (matching metadata)
 * @param {number|string} contentId - Content ID
 * @returns {Promise<Object>} Result with affectedRows
 */
export async function deleteByContentId(contentId) {
  try {
    // Aggressive matching against metadata JSON to cover several possible formats:
    // - metadata.redirectUrl may be '/content/123' or full URL 'https://.../content/123'
    // - metadata may include a numeric or string field contentId
    // Use LIKE on the raw JSON to find these cases and delete matching rows.
    const likeUrlPattern = `%/content/${contentId}%`;
    const likeContentIdNum = `"contentId":${contentId}`;
    const likeContentIdStr = `"contentId":"${contentId}"`;
    const likeIDContenidoNum = `"IDContenido":${contentId}`;
    const likeIDContenidoStr = `"IDContenido":"${contentId}"`;

    const query = `
      DELETE FROM notificaciones
      WHERE (
        metadata LIKE ?
        OR metadata LIKE ?
        OR metadata LIKE ?
        OR metadata LIKE ?
        OR metadata LIKE ?
      )
    `;

    const [result] = await dbPool.query(query, [
      likeUrlPattern,
      `%${likeContentIdNum}%`,
      `%${likeContentIdStr}%`,
      `%${likeIDContenidoNum}%`,
      `%${likeIDContenidoStr}%`,
    ]);

    return { success: true, affectedRows: result.affectedRows };
  } catch (error) {
    throw new Error(
      `Error al borrar notificaciones por contenido: ${error.message}`
    );
  }
}
export default {
  getByUser,
  create,
  existsNotificationToday,
  markAsRead,
  deleteNotification,
  deleteByContentId,
};
