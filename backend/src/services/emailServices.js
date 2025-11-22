/**
 * @fileoverview Email service using Amazon SES 
 * @author EXACTUM-dev
 * @version 1.0.0
 * @describe Inlcudes basic SES configuration
 */

import nodemailer from "nodemailer";
import Brevo from "@getbrevo/brevo";
import fs from "fs/promises";

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

/**
 * Send an email with Brevo
 * @param {string} destinatario - Correo destino
 * @param {string} nombreMiembro - Nombre del nuevo miembro
 * @param {string} pdfPath - Ruta del PDF generado
 */
export async function sendBrevoEmail(destinatario, nombreMiembro, pdfPath) {
  // Leer el PDF y convertir a base64
  const pdfBuffer = fs.readFileSync(pdfPath);
  const pdfBase64 = pdfBuffer.toString('base64');

  const emailData = {
    sender: {
      name: 'SOMEFIPP',
      email: 'noreply@jaimelasticmax.dev'
    },
    to: [
      {
        email: destinatario,
        name: nombreMiembro
      }
    ],
    subject: 'Bienvenido a SOMEFIPP – Tu certificado de afiliación',
    htmlContent: `
      <p>Estimado <strong>${nombreMiembro}</strong>:</p>
      
      <p>Es un placer darte la más cordial bienvenida a la <strong>Sociedad Mexicana de Fisioterapia en Piso Pélvico (SOMEFIPP)</strong>. 
      Estamos encantados de tenerte como parte de nuestra comunidad y esperamos que encuentres en nuestra sociedad un espacio valioso para el intercambio de conocimientos y el crecimiento profesional.</p>

      <p>Como nuevo miembro, queremos brindarte información clave para que puedas aprovechar al máximo tu afiliación:</p>

      <ol>
        <li><strong>Recursos y Beneficios:</strong> Explora los recursos disponibles para nuestros miembros, que incluyen acceso a eventos exclusivos, material educativo y oportunidades de networking. Puedes encontrar más detalles en nuestra página web: 
        <a href="https://www.somefipp.com" target="_blank">www.somefipp.com</a></li>
        <br>

        <li><strong>Próximos Eventos:</strong> Mantente al tanto de nuestros próximos eventos y actividades. Estamos comprometidos en ofrecer oportunidades de aprendizaje continuo. No dudes en participar y contribuir a la comunidad.</li>
        <br>

        <li><strong>Comunicación:</strong> Mantente conectado con nosotros a través de nuestras redes sociales y boletines informativos para recibir actualizaciones importantes, noticias del sector y oportunidades profesionales: <strong>@somefipp</strong></li>
        <br>

        <li><strong>Contacto:</strong> Si tienes alguna pregunta o necesitas asistencia, no dudes en ponerte en contacto con nuestro equipo a través de 
        <a href="mailto:contacto@somefipp.com">contacto@somefipp.com</a></li>
      </ol>

      <p>Agradecemos tu participación y confianza en la <strong>Sociedad Mexicana de Fisioterapia en Piso Pélvico</strong>. Esperamos que tu experiencia con nosotros sea enriquecedora y beneficiosa para tu desarrollo profesional.</p>

      <p>¡Bienvenido de nuevo! Y esperamos verte pronto en nuestros eventos.</p>

      <p>Saludos cordiales,</p>

      <p><strong>Artemio Cruz</strong><br>
      Presidente SOMEFIPP</p>
    `,
    attachment: [
      {
        content: pdfBase64,
        name: `Certificado_SOMEFIPP_${nombreMiembro.replace(/\s/g, '_')}.pdf`
      }
    ]
  };

  try {
    const response = await apiInstance.sendTransacEmail(emailData);
    console.log('Email enviado:', response);
    return { success: true, messageId: response.messageId };
  } catch (error) {
    console.error('Error enviando email:', error);
    return { success: false, error: error.message };
  }
}
