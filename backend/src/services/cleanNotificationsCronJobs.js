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
  console.log('Iniciando limpieza de notificaciones...');
  
  try {
    const query = `
      DELETE FROM notificaciones
      WHERE esRevisada = 1
        AND readAt < DATE_SUB(NOW(), INTERVAL 30 DAY)
    `;

    const [result] = await dbPool.query(query);
    
    console.log(`Eliminadas ${result.affectedRows} notificaciones antiguas`);
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
    console.log(`\n${'='.repeat(50)}`);
    console.log(`[${new Date().toISOString()}] Ejecutando limpieza de notificaciones`);
    console.log('='.repeat(50));
    cleanupOldNotifications();
  }, {
    timezone: "America/Mexico_City"
  });

  console.log('Cron Job de limpieza iniciado');
  console.log('Programado: Cada domingo a las 2:00 AM');
}

export { startCleanupCron, cleanupOldNotifications };