/**
 * @fileoverview Servicio de correo con Amazon SES
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import nodemailer from "nodemailer";

// Configuración de SES
const transporter = nodemailer.createTransport({
  host: process.env.SES_SMTP_HOST,
  port: parseInt(process.env.SES_SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SES_SMTP_USER,     // SMTP username de SES
    pass: process.env.SES_SMTP_PASSWORD     // SMTP password de SES
  }
});


export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"SOMEFIPP" <${process.env.SES_SMTP_EMAIL}>`,
      to,
      subject,
      html
    });

    console.log("Correo enviado:", info.messageId);
  } catch (error) {
    console.error("Error enviando correo:", error);
  }
};
