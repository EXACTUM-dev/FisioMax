/**
 * @fileoverview Email service using Amazon SES
 * @author EXACTUM-dev
 * @version 2.0.0
 * @describe Includes basic SES configuration
 */

import nodemailer from "nodemailer";
import Brevo from "@getbrevo/brevo";

const transporter = nodemailer.createTransport({
  host: process.env.SES_SMTP_HOST,
  port: parseInt(process.env.SES_SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SES_SMTP_USER,
    pass: process.env.SES_SMTP_PASSWORD,
  },
});

/**
 * Sends an email using Amazon SES SMTP transport
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.html - HTML content of the email
 * @returns {Promise<void>}
 * @throws {Error} Logs error to console if email sending fails
 * Sends an email using Amazon SES SMTP transport
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.html - HTML content of the email
 * @returns {Promise<void>}
 * @throws {Error} Logs error to console if email sending fails
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"SOMEFIPP" <${process.env.SES_SMTP_EMAIL}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Error enviando correo:", error);
  }
};

// Configure Brevo API instance
const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

// Template IDs for Brevo email templates - contact admin/ProductOwner to get the IDs
const TEMPLATE_IDS = {
  BIENVENIDA: 1,
  CONFIRMACION: 2,
  RECHAZO: 3,
  EVENTO: 5,
  RENOVACION: 4,
};

/**
 * Sends an email using a Brevo template
 * @param {string} destinatario - Recipient email address
 * @param {string} nombreMiembro - Recipient's name
 * @param {number} templateId - Brevo template ID
 * @param {Object} [params={}] - Dynamic variables for the template
 * @param {Object|null} [attachment=null] - Optional file attachment
 * @param {Buffer} attachment.buffer - File buffer content
 * @param {string} attachment.filename - Name of the attached file
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>} Response object with success status and message ID or error
 */
export async function sendBrevoEmailWithTemplate(
  destinatario,
  nombreMiembro,
  templateId,
  params = {},
  attachment = null
) {
  const emailData = {
    to: [{ email: destinatario, name: nombreMiembro }],
    templateId: templateId,
    params: {
      NOMBRE: nombreMiembro,
      ...params,
    },
  };

  // Add attachment if it exists
  if (attachment) {
    emailData.attachment = [
      {
        content: attachment.buffer.toString("base64"),
        name: attachment.filename,
      },
    ];
  }

  try {
    const response = await apiInstance.sendTransacEmail(emailData);
    console.log("Email enviado con plantilla:", response);
    return { success: true, messageId: response.messageId };
  } catch (error) {
    console.error("Error enviando email:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Sends a welcome email with certificate attachment
 * @param {string} destinatario - Recipient email address
 * @param {string} nombreMiembro - Member's name
 * @param {Object} pdfBytes - PDF certificate data
 * @param {Buffer} pdfBytes.buffer - PDF file buffer
 * @param {string} [pdfBytes.filename] - Optional custom filename for the PDF
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>} Response object with success status
 */
export async function sendWelcomeEmail(destinatario, nombreMiembro, pdfBytes) {
  return sendBrevoEmailWithTemplate(
    destinatario,
    nombreMiembro,
    TEMPLATE_IDS.BIENVENIDA,
    {
      NOMBRE_MIEMBRO: nombreMiembro,
    },
    {
      buffer: pdfBytes.buffer,
      filename:
        pdfBytes.filename ||
        `Certificado_SOMEFIPP_${nombreMiembro.replace(/\s/g, "_")}.pdf`,
    }
  );
}

/**
 * Sends a membership renewal reminder email
 * @param {string} destinatario - Recipient email address
 * @param {string} nombreMiembro - Member's name
 * @param {string} fechaVencimiento - Expiration date for the membership
 * @param {number} diasRestantes - Days remaining until expiration
 * @param {string} [linkRenovacion=''] - Renewal link
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>} Response object with success status
 */
export async function sendRenewalReminder(
  destinatario,
  nombreMiembro,
  fechaVencimiento,
  diasRestantes,
  linkRenovacion = ""
) {
  return sendBrevoEmailWithTemplate(
    destinatario,
    nombreMiembro,
    TEMPLATE_IDS.RENOVACION,
    {
      NOMBRE_MIEMBRO: nombreMiembro,
      FECHA_VENCIMIENTO: fechaVencimiento,
      DIAS_RESTANTES: diasRestantes,
      LINK_RENOVACION: linkRenovacion,
    }
  );
}

/**
 * Sends an event invitation email
 * @param {string} destinatario - Recipient email address
 * @param {string} nombreMiembro - Member's name
 * @param {Object} eventoData - Event information
 * @param {string} eventoData.nombre - Event name
 * @param {string} eventoData.fecha - Event date
 * @param {string} eventoData.lugar - Event location
 * @param {string} eventoData.urlRegistro - Registration URL for the event
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>} Response object with success status
 */
export async function sendEventInvitation(
  destinatario,
  nombreMiembro,
  eventoData
) {
  return sendBrevoEmailWithTemplate(
    destinatario,
    nombreMiembro,
    TEMPLATE_IDS.EVENTO,
    {
      NOMBRE: nombreMiembro,
      EVENTO_NOMBRE: eventoData.nombre,
      EVENTO_FECHA: eventoData.fecha,
      EVENTO_LUGAR: eventoData.lugar,
      EVENTO_URL: eventoData.urlRegistro,
    }
  );
}

/**
 * Sends a discount notification email
 * @param {string} destinatario - Recipient email address
 * @param {string} nombreMiembro - Member's name
 * @param {string} nombreDescuento - Discount name
 * @param {string} descripcion - Discount description
 * @param {string} fechaFin - Expiration date (YYYY-MM-DD)
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>} Response object
 */
export async function sendDiscountNotification(
  destinatario,
  nombreMiembro,
  nombreDescuento,
  descripcion,
  fechaFin
) {
  // Format date to readable Spanish format
  const fecha = new Date(fechaFin);
  const options = { year: "numeric", month: "long", day: "numeric" };
  const fechaFormateada = fecha.toLocaleDateString("es-MX", options);

  return sendBrevoEmailWithTemplate(
    destinatario,
    nombreMiembro,
    TEMPLATE_IDS.EVENTO,
    {
      NOMBRE_MIEMBRO: nombreMiembro,
      DESCUENTO_NOMBRE: nombreDescuento,
      DESCUENTO_DESCRIPCION: descripcion,
      FECHA_EXPIRACION: fechaFormateada,
    }
  );
}
