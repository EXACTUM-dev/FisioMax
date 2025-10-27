/**
 * @fileoverview Email service using Amazon SES 
 * @author EXACTUM-dev
 * @version 1.0.0
 * @describe Inlcudes basic SES configuration
 */

import nodemailer from "nodemailer";

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
