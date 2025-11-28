/**
 * @fileoverview Controller for notifications
 * @version 0.1.0
 * @author EXACTUM-dev
 */

import NotificationModel from "../models/notifications.model.js";
import { getUserByClerkId } from "../models/users.model.js";
import NotificationModel from '../models/notifications.model.js';
import { getUserByClerkId } from '../models/users.model.js';

class NotificationController {
  /**
   * Get pending notifications for current user
   * @return {Promise<void>}
   */
  static async getPendingNotifications(req, res) {
    try {

      const userID = req.query.IDUsuario;
      const isRead = req.query.esRevisada === '1' ? true : false;

      const notifications = await NotificationModel.getByUser(userID, {
        isRead,
      });
      const notifications = await NotificationModel.getByUser(userID, {
        isRead
      });

      const formattedNotifications = notifications.map((notif) => ({
      const formattedNotifications = notifications.map(notif => ({
        ...notif,
        metadata: typeof notif.metadata === 'string'
          ? JSON.parse(notif.metadata)
          : notif.metadata
      }));

      return res.status(200).json({
        success: true,
        data: formattedNotifications,
        total: formattedNotifications.length
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Error al obtener notificaciones'
      });
    }
  }

  /**
   * Execute daily verification
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @return {Promise<void>}
   */
  static async executeDailyVerification(req, res) {
    try {
      const MembershipModel = (
        await import("../models/membershipApplication.model.js")
      ).default;

      const memberships = await MembershipModel.getExpiringMemberships();

      if (memberships.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No hay membresías próximas a vencer",
          sent: 0,
          skipped: 0,
        });
      }

      let notificationsSent = 0;
      let notificationsSkipped = 0;

      for (const membership of memberships) {
        const { IDUsuario, IDMembresia, daysRemaining, fechaVencimiento } =
          membership;

        // Check if notification already exists today
        const exists = await NotificationModel.existsNotificationToday(
          IDUsuario,
          daysRemaining
        );

        if (exists) {
          notificationsSkipped++;
          continue;
        }

        // Calculate priority
        const priority = this.calculatePriority(daysRemaining);

        // Build message
        const notificationData = this.buildNotificationMessage(
          daysRemaining,
          fechaVencimiento
        );

        // Create notification
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
          },
        });

        notificationsSent++;
      }

      return res.status(200).json({
        success: true,
        message: "Verificación completada",
        sent: notificationsSent,
        skipped: notificationsSkipped,
        total: memberships.length,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Error al ejecutar verificación",
      });
    }
  }

  /**
   * Calculate priority based on days remaining
   * @param {number} daysRemaining - Days remaining until expiration
   * @returns {string} Priority level
   */
  static calculatePriority(daysRemaining) {
    if (daysRemaining === 1) return "urgent";
    if (daysRemaining === 3) return "high";
    if (daysRemaining === 7) return "medium";
    return "low"; // 15 or 30 days
  }

  /**
   * Build notification message
   * @param {number} daysRemaining - Days remaining until expiration
   * @param {string} fechaVencimiento - Expiration date
   * @returns {Object} Notification message components
   */
  static buildNotificationMessage(daysRemaining, fechaVencimiento) {
    const date = new Date(fechaVencimiento);
    const formattedDate = date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    let message = '';

    if (daysRemaining === 1) {
      message = 'Te queda 1 día para renovar tu membresía';
    } else {
      message = `Te quedan ${daysRemaining} días para renovar tu membresía`;
    }

    return {
      message,
      details: `Tu membresía vence el día ${formattedDate}`,
      subtext: 'Recuerda que puedes renovarla desde "Mi perfil"'
    };
  }

  /**
    * Mark notification as read 
    * @param {Object} req - Express request object
    * @param {Object} res - Express response object
    * @return {Promise<void>}
    */
  static async markAsRead(req, res) {
    try {
      const { id: notificationID } = req.params;


      if (!req.auth || !req.auth.userId) {
        return res.status(401).json({
          success: false,
          error: "No autenticado",
        });
      }

      const user = await getUserByClerkId(req.auth.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "Usuario no encontrado",
        });
      }

      const mysqlUserId = user.IDUsuario;
      const result = await NotificationModel.markAsRead(
        notificationID,
        mysqlUserId
      );

      if (!result.success) {
        return res.status(404).json({
          success: false,
          error: "Notificación no encontrada o no pertenece al usuario",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Notificación marcada como leída",
        affectedRows: result.affectedRows,
      });
    } catch (error) {
      console.error("Error en markAsRead:", error);
      return res.status(500).json({
        success: false,
        error: "Error al marcar notificación como leída",
        details: error.message,
      });
    }
  }

  /**
   * Delete a notification
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async deleteNotification(req, res) {
    try {
      const { id: notificationID } = req.params;

      if (!req.auth || !req.auth.userId) {
        return res
          .status(401)
          .json({ success: false, error: "No autenticado" });
      }

      const user = await getUserByClerkId(req.auth.userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, error: "Usuario no encontrado" });
      }

      const mysqlUserId = user.IDUsuario;

      const result = await NotificationModel.deleteNotification(
        notificationID,
        mysqlUserId
      );

      if (!result.success) {
        return res.status(404).json({
          success: false,
          error: "Notificación no encontrada o no pertenece al usuario",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Notificación eliminada",
        affectedRows: result.affectedRows,
      });
    } catch (error) {
      console.error("Error en deleteNotification:", error);
      return res.status(500).json({
        success: false,
        error: "Error al eliminar notificación",
        details: error.message,
      });
    }
  }

  /**
   * Trigger discount notifications manually (protected endpoint)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async triggerDiscountNotifications(req, res) {
    try {
      // Dynamically import the cron job function to avoid circular deps
      const { checkAndNotifyNewDiscounts } = await import(
        "../services/notificationCronJob.js"
      );

      // Execute the notification check
      await checkAndNotifyNewDiscounts();

      return res.status(200).json({
        success: true,
        message:
          "Triggered discount notifications job. Revisa logs para detalles.",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Error al disparar las notificaciones de descuentos",
        details: error.message,
      });
    }
  }
}

export default NotificationController;
