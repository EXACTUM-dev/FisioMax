/**
 * version 1.2.1
 * Controller to handle the membership information request
 * Includes the creation of the application and the sending of an email about a new request to the admin
 */

import MembershipApplication from '../models/membershipApplication.model.js';
import { sendEmail } from '../services/emailServices.js';
import S3Service from '../services/s3Service.js';

/**
 * Create a new membership application and send an email to admin using SES
 * @param {object} req - Express request object 
 * @param {object} res - Express response object 
 */
export const createMembershipApplication = async (req, res) => {
  
  try {
    const extraDocs = [];
    Object.keys(req.files || {}).forEach(key => {
      if (key.startsWith('extraDoc')) {
        extraDocs.push(req.files[key][0]);
      }
    });

    const cedulaUrl = req.files?.cedula?.[0]
      ? await S3Service.uploadFile(req.files.cedula[0], 'cedulas')
      : null;

    const tituloUrl = req.files?.titulo?.[0]
      ? await S3Service.uploadFile(req.files.titulo[0], 'titulos')
      : null;

    const constanciasUrl = req.files?.constancias?.[0]
      ? await S3Service.uploadFile(req.files.constancias[0], 'constancias')
      : null;

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
        titulo: tituloUrl,
        cedula: cedulaUrl,
        constancias: constanciasUrl,
        extra: extraDocs
      },
      calle: req.body.calle,
      numexterior: req.body.numexterior,
      numinterior: req.body.numinterior
    };

    const application = new MembershipApplication(applicationData);
    await application.save();

    const adminEmails = ["doculili08@gmail.com"];
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

    res.status(201).json({
      success: true,
      message: 'Solicitud creada, recibirá un correo o mensaje por WhatsApp por parte de SOMEFIPP',
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
