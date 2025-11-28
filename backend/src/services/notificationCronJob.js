/**
 * @fileoverview Define CronJob to send notifications and renewal emails
 * @version 0.3.0
 * @author EXACTUM-dev
 * @description Check if exist any expires membership, and if there hasn't send any today, cron sends them.
 * Now includes Mercado Pago payment link generation for renewal emails.
 */

import cron from "node-cron";
import * as MembershipModel from "../models/membershipApplication.model.js";
import * as NotificationModel from "../models/notifications.model.js";
import NotificationController from "../controllers/notifications.controller.js";
import { sendRenewalReminder } from "./emailServices.js";
import { decryptFields } from "./encryptionService.js";
import PaymentService from "./payment.service.js";
import {
  getDiscountsStartingToday,
  getExpiredDiscounts,
} from "../models/discount.model.js";
import { sendDiscountNotification, FRONTEND_URL } from "./emailServices.js";
import { softDeleteContent } from "../models/content.model.js";

/**
 * Sensitive fields that need to be decrypted
 * @constant {Array<string>}
 */
const SENSITIVE_FIELDS = ["nombres", "apellidoP", "correo"];

/**
 * Membership prices in MXN (per year) - must match frontend prices
 * @constant {Object}
 */
const MEMBERSHIP_PRICES = {
  Estudiante: 900,
  "Licenciado en Formación": 1100,
  "Licenciado Especializado": 1500,
  "Fisioterapeuta Extranjero": 1100,
  básica: 5,
  "Personal de la salud": 1100,
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
      return;
    }

    let notificationsSent = 0;
    let notificationsSkipped = 0;
    let emailsSent = 0;
    let emailsFailed = 0;

    for (const membership of memberships) {
      const { IDUsuario, clerk_user_id, IDMembresia, daysRemaining, fechaVencimiento, tipo } = membership;
      const exists = await NotificationModel.existsNotificationToday(
        IDUsuario,
        daysRemaining
      );

      if (exists) {
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
        type: "membership_renewal",
        priority,
        message: notificationData.message,
        metadata: {
          daysRemaining,
          membershipID: IDMembresia,
          expirationDate: fechaVencimiento,
          details: notificationData.details,
          subtext: notificationData.subtext,
          clerk_user_id: clerk_user_id,
        },
      });

      notificationsSent++;

      // Send renewal reminder email
      try {
        // Decrypt sensitive fields
        const decryptedData = decryptFields(membership, SENSITIVE_FIELDS);
        const { nombres, apellidoP, correo } = decryptedData;

        // Build full name
        const nombreCompleto = `${nombres} ${apellidoP}`.trim();

        // Format expiration date
        const fechaFormateada = new Date(fechaVencimiento).toLocaleDateString(
          "es-MX",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        );

        // Generate Mercado Pago payment link
        let linkRenovacion = "";
        try {
          const membershipType = tipo || "básica";
          const amount = MEMBERSHIP_PRICES[membershipType] || 1500;

          const preference = await PaymentService.createPaymentPreference({
            membershipId: IDMembresia,
            membershipType,
            amount,
            userEmail: correo,
          });

          linkRenovacion = preference.init_point;
        } catch (paymentError) {
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
          emailsSent++;
        } else {
          emailsFailed++;
        }
      } catch (emailError) {
        emailsFailed++;
      }
    }
    return {
      notificationsSent,
      notificationsSkipped,
      emailsSent,
      emailsFailed
    };
  } catch (error) {
    return error;
  }
}

/**
 * Start Cron Job
 * @returns {void}
 * Schedules a cron job to check for expiring memberships daily at midnight.
 */
function startNotificationsCron() {
  // Run every day at midnight (00:00)
  const scheduleExpression = "0 0 0 * * *";

  cron.schedule(
    scheduleExpression,
    () => {
      console.log(`\n${"=".repeat(50)}`);
      console.log(`[${new Date().toISOString()}] Ejecutando Cron Job`);
      console.log("=".repeat(50));
      checkExpiringMemberships();
      checkAndNotifyNewDiscounts();
      deleteExpiredDiscounts();
    },
    {
      timezone: "America/Mexico_City",
    }
  );

  console.log("Cron Job de notificaciones iniciado");
  console.log(`Programado: ${scheduleExpression} `);
}

/**
 * Check for new discounts and send notifications to eligible members
 * @async
 * @param {Object|null} specificDiscount - Optional specific discount to notify about immediately
 * @returns {Promise<void>}
 */
async function checkAndNotifyNewDiscounts(specificDiscount = null) {
  try {
    console.log("[Discount Notifications] Checking for new discounts...");

    let discounts = [];
    if (specificDiscount) {
      discounts = [specificDiscount];
      console.log(`[Discount Notifications] Processing specific discount: ${specificDiscount.nombre}`);
    } else {
      discounts = await getDiscountsStartingToday();
    }

    if (discounts.length === 0) {
      console.log("[Discount Notifications] No new discounts starting today");
      return;
    }

    console.log(
      `[Discount Notifications] Found ${discounts.length} discount(s)`
    );

    let emailsSent = 0;
    let emailsFailed = 0;

    for (const discount of discounts) {
      const { IDContenido, nombre, descripcion, tipoMembresia, fechaFin } =
        discount;

      console.log(
        `[Discount Notifications] Processing discount ID=${IDContenido} name="${nombre}" tipoMembresia="${tipoMembresia}" fechaFin=${fechaFin}`
      );

      try {
        // Select users joining the membresia table so we can filter by
        // membership type and payment status. The `membresiaTipo` is
        // stored in the `membresia` table (alias m.tipo), not as a
        // column on usuario.
        // Parse `tipoMembresia` which may contain multiple membership
        // types separated by commas or the Spanish conjunction ' y '.
        // Example: "Admin, Fisioterapeutas en formación, Estudiante y Servicio social"
        const rawTypes = tipoMembresia || "";
        const normalized = rawTypes.replace(/\s+y\s+/gi, ",");
        const parsedTypes = normalized
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);

        console.log(
          `[Discount Notifications] Parsed membership types for discount ${IDContenido}: ${JSON.stringify(
            parsedTypes
          )}`
        );

        const db = (await import("../../database/db.js")).default;

        if (parsedTypes.length === 0) {
          console.log(
            `[Discount Notifications] No membership types parsed for discount ${IDContenido}, skipping.`
          );
          continue;
        }

        // Normalize parsed types to lowercase for case-insensitive comparison
        const parsedTypesLower = parsedTypes.map((t) => t.toLowerCase());

        // Build LIKE patterns for each parsed type to allow partial matches
        // (e.g. discount has 'Admin' but DB stores 'Membresía Admin').
        const likePatterns = parsedTypesLower.map((t) => `%${t}%`);

        console.log(
          `[Discount Notifications] Membership LIKE patterns for discount ${IDContenido}: ${JSON.stringify(
            likePatterns
          )}`
        );

        // Build SQL with ORed LIKE conditions for LOWER(m.tipo)
        const likeConditions = parsedTypesLower
          .map(() => `LOWER(m.tipo) LIKE ?`)
          .join(" OR ");

        // Join to membresia but evaluate tipo/aceptado/estatusPago in WHERE
        const query = `
          SELECT u.IDUsuario, u.correo, u.nombres, u.apellidoP, u.apellidoM, m.tipo as membershipType, m.aceptado, m.estatusPago
          FROM usuario u
          INNER JOIN membresia m ON u.IDUsuario = m.IDUsuario
            AND m.deletedAt IS NULL
          WHERE u.eliminado = 0
            AND u.deletedAt IS NULL
            AND (m.aceptado = 1 OR LOWER(m.estatusPago) = 'pagado')
            AND (${likeConditions})
        `;

        const queryParams = [...likePatterns];
        const [users] = await db.query(query, queryParams);

        if (Array.isArray(users) && users.length > 0) {
          const userIds = users.slice(0, 5).map((u) => u.IDUsuario);
          console.log(
            `[Discount Notifications] Sample user IDs for discount ${IDContenido}: ${JSON.stringify(
              userIds
            )}`
          );
        }

        console.log(
          `[Discount Notifications] Discount ID=${IDContenido} matched users: ${
            Array.isArray(users) ? users.length : 0
          }`
        );

        if (!Array.isArray(users) || users.length === 0) {
          // no users matched this discount; continue to next
          continue;
        }

        for (const user of users) {
          try {
            const decryptedData = decryptFields(user, SENSITIVE_FIELDS);
            const nombreCompleto =
              `${decryptedData.nombres} ${decryptedData.apellidoP}`.trim();

            const emailResult = await sendDiscountNotification(
              decryptedData.correo,
              nombreCompleto,
              nombre,
              descripcion,
              fechaFin,
              `${FRONTEND_URL}/content/${IDContenido}`
            );

            console.log(
              `[Discount Notifications] Email result for user ${
                user.IDUsuario
              }: ${JSON.stringify(emailResult)}`
            );

            if (emailResult.success) {
              emailsSent++;

              // Create notification in database
              await NotificationModel.create({
                userID: user.IDUsuario,
                type: "discount",
                priority: "medium",
                message: `Nuevo descuento disponible: ${nombre}`,
                metadata: {
                  discountId: IDContenido,
                  discountName: nombre,
                  expiresAt: fechaFin,
                  // internal SPA route that the frontend will navigate to
                  redirectUrl: `/content/${IDContenido}`,
                },
              });
            } else {
              emailsFailed++;
            }
          } catch (userError) {
            console.error(
              `Error sending to user ${user.IDUsuario}:`,
              userError.message
            );
            emailsFailed++;
          }
        }
      } catch (discountError) {
        console.error(
          `Error processing discount ${IDContenido}:`,
          discountError.message
        );
      }
    }

    console.log(
      `[Discount Notifications] Sent: ${emailsSent}, Failed: ${emailsFailed}`
    );
  } catch (error) {
    console.error("[Discount Notifications] Error:", error);
  }
}

/**
 * Delete expired discounts
 * @async
 * @returns {Promise<void>}
 */
async function deleteExpiredDiscounts() {
  try {
    console.log("[Discount Cleanup] Checking for expired discounts...");

    const expiredIds = await getExpiredDiscounts();

    if (expiredIds.length === 0) {
      console.log("[Discount Cleanup] No expired discounts to delete");
      return;
    }

    console.log(
      `[Discount Cleanup] Deleting ${expiredIds.length} expired discount(s)`
    );

    for (const contentId of expiredIds) {
      try {
        await softDeleteContent(contentId);
        console.log(`   ✓ Deleted discount ID: ${contentId}`);
      } catch (error) {
        console.error(
          `   ✗ Error deleting discount ${contentId}:`,
          error.message
        );
      }
    }
  } catch (error) {
    console.error("[Discount Cleanup] Error:", error);
  }
}

export {
  startNotificationsCron,
  checkExpiringMemberships,
  checkAndNotifyNewDiscounts,
  deleteExpiredDiscounts,
};
