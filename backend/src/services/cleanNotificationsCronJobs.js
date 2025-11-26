/**
 * @fileoverview Service to clean old notifications from the database
 * @version 1.0.0
 * @author EXACTUM-dev
 * @description This service defines a cron job that deletes notifications that have been marked as read for more than 30 days.
 */

import cron from 'node-cron';
import { dbPool } from '../../config.js';

/**
 * Clean up old notifications that have been read for more than 30 days
 * @return {Promise<void>}
 */
async function cleanupOldNotifications() {
  try {
    const deleteQuery = `
        DELETE FROM notificaciones
        WHERE esRevisada = 1
          AND readAt < DATE_SUB(NOW(), INTERVAL 30 DAY)
      `;
    const [result] = await dbPool.query(deleteQuery);

    if (result.affectedRows > 0) {
      const [maxIdResult] = await dbPool.query(
        'SELECT MAX(IDnotificacion) as maxId FROM notificaciones'
      );

      const maxId = maxIdResult[0].maxId || 0;
      const nextId = maxId + 1;

      await dbPool.query(
        `ALTER TABLE notificaciones AUTO_INCREMENT = ${nextId}`
      );

    }
  } catch (error) {
    console.error('Error en limpieza de notificaciones:', error);
  }
}

/**
 * Start the cron job to clean old notifications every Sunday at 2:00 AM
 * @return {void}
 */
function startCleanupCron() {
  cron.schedule('0 0 2 * * 0', () => {
    cleanupOldNotifications();
  }, {
    timezone: "America/Mexico_City"
  });
}

export { startCleanupCron, cleanupOldNotifications };