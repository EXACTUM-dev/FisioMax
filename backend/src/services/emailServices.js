/**
 * @fileoverview Email service using Amazon SES 
 * @author EXACTUM-dev
 * @version 1.0.0
 * @describe Inlcudes basic SES configuration
 */

import nodemailer from "nodemailer";
import Brevo from "@getbrevo/brevo";

const transporter = nodemailer.createTransport({
  host: process.env.SES_SMTP_HOST,
  port: parseInt(process.env.SES_SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SES_SMTP_USER,
    pass: process.env.SES_SMTP_PASSWORD
  }
});

/**
 * Send an email to admin
 * @param {object} to - admin email 
 * @param {object} subject - Propouse of the email
 * @param {object} html - templete of the email 
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"SOMEFIPP" <${process.env.SES_SMTP_EMAIL}>`,
      to,
      subject,
      html
    });
  } catch (error) {
    console.error("Error enviando correo:", error);
  }
};

// Configurar API
const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);


//Id for the templates in Brevo, contact the admin/ProductOwner to get the ids
const TEMPLATE_IDS = {
  BIENVENIDA: 1,
  CONFIRMACION: 2,
  RENOVACION: 3,
  EVENTO: 4
};

/**
 * Enviar email usando una plantilla de Brevo
 * @param {string} destinatario - Correo destino
 * @param {string} nombreMiembro - Nombre del destinatario
 * @param {number} templateId - ID de la plantilla en Brevo
 * @param {Object} params - Variables dinámicas para la plantilla
 * @param {Object} [attachment] - Archivo adjunto opcional
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
      ...params
    }
  };

  // Agregar adjunto si existe
  if (attachment) {
    emailData.attachment = [{
      content: attachment.buffer.toString('base64'),
      name: attachment.filename
    }];
  }

  try {
    const response = await apiInstance.sendTransacEmail(emailData);
    console.log('Email enviado con plantilla:', response);
    return { success: true, messageId: response.messageId };
  } catch (error) {
    console.error('Error enviando email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Enviar email de bienvenida con certificado
 */
export async function sendWelcomeEmail(destinatario, nombreMiembro, pdfBytes) {
  return sendBrevoEmailWithTemplate(
    destinatario,
    nombreMiembro,
    TEMPLATE_IDS.BIENVENIDA,
    {
      NOMBREMIEMBRO: nombreMiembro
    },
    {
      buffer: pdfBytes.buffer,
      filename: pdfBytes.filename || `Certificado_SOMEFIPP_${nombreMiembro.replace(/\s/g, '_')}.pdf`
    }
  );
}

/**
 * Enviar recordatorio de renovación
 */
export async function sendRenewalReminder(destinatario, nombreMiembro, fechaVencimiento) {
  return sendBrevoEmailWithTemplate(
    destinatario,
    nombreMiembro,
    TEMPLATE_IDS.RENOVACION,
    {
      NOMBRE: nombreMiembro,
      FECHA_VENCIMIENTO: fechaVencimiento
    }
  );
}

/**
 * Enviar invitación a evento
 */
export async function sendEventInvitation(destinatario, nombreMiembro, eventoData) {
  return sendBrevoEmailWithTemplate(
    destinatario,
    nombreMiembro,
    TEMPLATE_IDS.EVENTO,
    {
      NOMBRE: nombreMiembro,
      EVENTO_NOMBRE: eventoData.nombre,
      EVENTO_FECHA: eventoData.fecha,
      EVENTO_LUGAR: eventoData.lugar,
      EVENTO_URL: eventoData.urlRegistro
    }
  );
}

// Mantener función original para casos donde no uses plantilla
export async function sendBrevoEmail(destinatario, nombreMiembro, pdfBytes) {
  const pdfBase64 = pdfBytes.buffer.toString('base64');

  const emailData = {
    sender: { name: 'SOMEFIPP', email: 'noreply@jaimelasticmax.dev' },
    to: [{ email: destinatario, name: nombreMiembro }],
    subject: 'Bienvenido a SOMEFIPP – Tu certificado de afiliación',
    htmlContent: `<p>Estimado <strong>${nombreMiembro}</strong>:...</p>`,
    attachment: [{
      content: pdfBase64,
      name: pdfBytes.filename || `Certificado_SOMEFIPP_${nombreMiembro.replace(/\s/g, '_')}.pdf`
    }]
  };

  try {
    const response = await apiInstance.sendTransacEmail(emailData);
    return { success: true, messageId: response.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
}