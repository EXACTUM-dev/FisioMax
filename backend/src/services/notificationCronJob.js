/**
 * @fileoverview Define CronJob to send notifications and renewal emails
 * @version 0.3.0
 * @author EXACTUM-dev
 * @description Check if exist any expires membership, and if there hasn't send any today, cron sends them.
 * Now includes Mercado Pago payment link generation for renewal emails.
 */

import cron from 'node-cron';
import * as MembershipModel from '../models/membershipApplication.model.js';
import * as NotificationModel from '../models/notifications.model.js';
import NotificationController from '../controllers/notifications.controller.js';
import { sendRenewalReminder } from './emailServices.js';
import { decryptFields } from './encryptionService.js';
import PaymentService from './payment.service.js';

/**
 * Sensitive fields that need to be decrypted
 * @constant {Array<string>}
 */
const SENSITIVE_FIELDS = ['nombres', 'apellidoP', 'correo'];

/**
 * Membership prices in MXN (per year) - must match frontend prices
 * @constant {Object}
 */
const MEMBERSHIP_PRICES = {
  'Estudiante': 900,
  'Licenciado en Formación': 1100,
  'Licenciado Especializado': 1500,
  'Fisioterapeuta Extranjero': 1100,
  'básica': 5,
  'Personal de la salud': 1100,
};

/**
 * Check for expiring memberships and send notifications and emails
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
    let emailsSent = 0;
    let emailsFailed = 0;

    for (const membership of memberships) {
      const { IDUsuario, clerk_user_id, IDMembresia, daysRemaining, fechaVencimiento, tipo } = membership;

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

      // Create notification in database
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

      // Send renewal reminder email
      try {
        // Decrypt sensitive fields
        const decryptedData = decryptFields(membership, SENSITIVE_FIELDS);
        const { nombres, apellidoP, correo } = decryptedData;

        // Build full name
        const nombreCompleto = `${nombres} ${apellidoP}`.trim();

        // Format expiration date
        const fechaFormateada = new Date(fechaVencimiento).toLocaleDateString('es-MX', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        // Generate Mercado Pago payment link
        let linkRenovacion = '';
        try {
          const membershipType = tipo || 'básica';
          const amount = MEMBERSHIP_PRICES[membershipType] || 1500;

          console.log(`   → Generando link de pago para membresía tipo: ${membershipType}, monto: $${amount} MXN`);

          const preference = await PaymentService.createPaymentPreference({
            membershipId: IDMembresia,
            membershipType,
            amount,
            userEmail: correo,
          });

          linkRenovacion = preference.init_point;
          console.log(`   ✓ Link de pago generado: ${linkRenovacion}`);
        } catch (paymentError) {
          console.error(`   ✗ Error al generar link de pago:`, paymentError.message);
          // Continue sending email without payment link
        }

        // Send email with payment link
        const emailResult = await sendRenewalReminder(
          correo,
          nombreCompleto,
          fechaFormateada,
          daysRemaining,
          linkRenovacion
        );

        if (emailResult.success) {
          console.log(`   ✓ Correo de renovación enviado a ${correo}`);
          emailsSent++;
        } else {
          console.error(`   ✗ Error al enviar correo a ${correo}:`, emailResult.error);
          emailsFailed++;
        }
      } catch (emailError) {
        console.error(`   ✗ Error al procesar/enviar correo para usuario ${IDUsuario}:`, emailError.message);
        emailsFailed++;
      }
    }

    console.log(`\nProceso completado:`);
    console.log(`- Notificaciones enviadas: ${notificationsSent}`);
    console.log(`- Notificaciones omitidas (ya enviadas): ${notificationsSkipped}`);
    console.log(`- Correos enviados: ${emailsSent}`);
    console.log(`- Correos fallidos: ${emailsFailed}`);

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