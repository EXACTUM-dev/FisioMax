/**
 * version 1.2.0
 * Controlador para solicitudes de membresía SOMEFIPP
 */

import MembershipApplication from '../models/membershipApplication.model.js';
import { sendEmail } from '../services/emailServices.js';

// Crear una nueva solicitud de membresía
export const createMembershipApplication = async (req, res) => {
  try {
    const extraDocs = [];
    Object.keys(req.files || {}).forEach(key => {
      if (key.startsWith('extraDoc')) {
        extraDocs.push(req.files[key][0]);
      }
    });

    const applicationData = {
      nombres: req.body.nombres,
      apellidoP: req.body.apellidoP,
      apellidoM: req.body.apellidoM,
      telefono: req.body.telefono,
      email: req.body.email,
      pais: req.body.pais,
      estado: req.body.estado,
      ciudad: req.body.ciudad,
      colonia: req.body.colonia,
      codigoPostal: req.body.codigoPostal,
      calle: req.body.calle,                    
      numeroExterior: req.body.numeroExterior,  
      numeroInterior: req.body.numeroInterior,
      licenciatura: req.body.licenciatura,
      instagram: req.body.instagram,
      linkedin: req.body.linkedin,
      facebook: req.body.facebook,
      paginaWeb: req.body.paginaWeb,
      documentos: {
        titulo: req.files?.titulo?.[0] || null,
        cedula: req.files?.cedula?.[0] || null,
        constancias: req.files?.constancias?.[0] || null,
        extra: extraDocs
      },
      calle: req.body.calle,
      numexterior: req.body.numexterior,
      numinterior: req.body.numinterior
    };

    // Guardar solicitud en DB
    const application = new MembershipApplication(applicationData);
    await application.save();

    // Enviar correo a administradores (SES)
    const adminEmails = ["doculili08@gmail.com"]; // Correo de admin
    adminEmails.forEach(async (email) => {
      try {
        await sendEmail({
          to: email,
          subject: "Nueva solicitud de membresía pendiente",
          html: `
            <h1>¡Atención!</h1>
            <p>Se ha registrado una nueva solicitud de membresía.</p>
            <p><strong>Nombre:</strong> ${req.body.nombres} ${req.body.apellidoP} ${req.body.apellidoM}</p>
            <p><strong>Email:</strong> ${req.body.email}</p>
          `
        });
      } catch (err) {
        console.error(`Error enviando correo a ${email}:`, err.message);
      }
    });

    // Respuesta al cliente
    res.status(201).json({
      success: true,
      message: 'Solicitud creada correctamente y correos enviados a admins',
      data: { IDUsuario: application.id }
    });

  } catch (error) {
    console.error('Error creando solicitud:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear la solicitud',
      error: error.message 
    });
  }
};
