/**
 * @fileoverview Controller to handle membership application requests.
 * @version 1.2.1
 * @description Handles the creation of membership applications including:
 * - File uploads to S3 (cedula, titulo, constancias, extra documents)
 * - Data validation and storage
 * - Email notifications to administrators
 * - Duplicate entry detection
 */

import MembershipApplication from '../models/membershipApplication.model.js';
import { sendEmail } from '../services/emailServices.js';
import S3Service from '../services/s3Service.js';

/**
 * Creates a new membership application and sends email notification to admin.
 * @param {object} req - Express request object containing form data and files.
 * @param {object} res - Express response object.
 * @returns {Promise<void>} Sends JSON response with success or error.
 */
export const createMembershipApplication = async (req, res) => {
  
  try {
  
    const cedulaUrl = req.files?.cedula?.[0]
      ? await S3Service.uploadFile(req.files.cedula[0], 'cedulas')
      : null;

    const tituloUrl = req.files?.titulo?.[0]
      ? await S3Service.uploadFile(req.files.titulo[0], 'titulos')
      : null;

    const constanciasUrl = req.files?.constancias?.[0]
      ? await S3Service.uploadFile(req.files.constancias[0], 'constancias')
      : null;

   
    const extraDocs = [];
    Object.keys(req.files || {}).forEach(key => {
      if (key.startsWith('extraDoc')) {
        extraDocs.push(req.files[key][0]);
      }
    });

    const extraDocsUrls = await Promise.all(
      extraDocs.map(file => S3Service.uploadFile(file, 'documentos-extra'))
    );

    const applicationData = {
      nombres: req.body.nombres,
      apellidoP: req.body.apellidoP,
      apellidoM: req.body.apellidoM,
      telefonoCasa: req.body.telefonoCasa,
      telefonoWhatsApp: req.body.telefonoWhatsApp,
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
        extra: extraDocsUrls
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
        console.error(`Error sending email to ${email}:`, err.message);
      }
    });

    res.status(201).json({
      success: true,
      message: 'Solicitud creada, recibirá un correo o mensaje por WhatsApp por parte de SOMEFIPP',
      data: { IDUsuario: application.id }
    });

  } catch (error) {
    console.error('Error creating application:', error);
    
    if (error.code === 'ER_DUP_ENTRY' || error.message.includes('Duplicate entry')) {
      return res.status(409).json({ 
        success: false, 
        message: 'Este usuario ya está registrado',
        error: 'DUPLICATE_ENTRY'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear la solicitud',
      error: error.message 
    });
  }
};
