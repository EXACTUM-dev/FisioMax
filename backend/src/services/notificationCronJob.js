/**
 * @fileoverview Define CronJob to send notifications
 * @version 0.1.0
 * @author EXACTUM-dev
 * @description Check if exist any expires membership, and if there hasn't send any today, cron sends them.
 */

import cron from 'node-cron';
import * as MembershipModel from '../models/membershipApplication.model.js';
import * as NotificationModel from '../models/notifications.model.js';
import NotificationController from '../controllers/notifications.controller.js';

/**
 * Check for expiring memberships and send notifications
 * @async
 * @returns {Promise<void>} 
 */
async function checkExpiringMemberships() {
  
  try {
    const memberships = await MembershipModel.getExpiringMemberships();

    if (memberships.length === 0) {
      console.log('No hay membresías próximas a vencer hoy');
      return;
    }

    console.log(`Encontradas ${memberships.length} membresías próximas a vencer`);

    let notificationsSent = 0;
    let notificationsSkipped = 0;

    for (const membership of memberships) {
      const { IDUsuario, clerk_user_id, IDMembresia, daysRemaining, fechaVencimiento } = membership;

      console.log(`   - IDUsuario: ${IDUsuario}`);

      const exists = await NotificationModel.existsNotificationToday(
        IDUsuario,
        daysRemaining
      );

      if (exists) {
        console.log(` Notificación ya enviada hoy ${IDMembresia}`);
        notificationsSkipped++;
        continue;
      }

      const priority = NotificationController.calculatePriority(daysRemaining);
      const notificationData = NotificationController.buildNotificationMessage(
        daysRemaining,
        fechaVencimiento
      );

      await NotificationModel.create({
        userID: IDUsuario,
        type: 'membership_renewal',
        priority,
        message: notificationData.message,
        metadata: {
          daysRemaining,
          membershipID: IDMembresia,
          expirationDate: fechaVencimiento,
          details: notificationData.details,
          subtext: notificationData.subtext,
          clerk_user_id: clerk_user_id
        }
      });

      console.log(`Notificación enviada al usuario con ID ${IDUsuario} con ${daysRemaining} días restantes de membresía.`);
      notificationsSent++;
    }

    console.log(`\nProceso completado: \n- Notificaciones enviadas: ${notificationsSent} `);

  } catch (error) {
    console.error('Error en el Job de notificaciones:', error);
  }
}

/**
 * Start Cron Job
 * @returns {void}
 * Schedules a cron job to check for expiring memberships daily at midnight.
 */
function startNotificationsCron() {
  // Run every day at midnight (00:00)
  const scheduleExpression = '0 0 0 * * *';

  cron.schedule(scheduleExpression, () => {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`[${new Date().toISOString()}] Ejecutando Cron Job`);
    console.log('='.repeat(50));
    checkExpiringMemberships();
  }, {
    timezone: "America/Mexico_City"
  });

  console.log('Cron Job de notificaciones iniciado');
  console.log(`Programado: ${scheduleExpression} `);
}

export { startNotificationsCron, checkExpiringMemberships };