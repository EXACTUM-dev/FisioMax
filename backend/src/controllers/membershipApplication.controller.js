/**
 * @fileoverview Controller to handle membership application requests.
 * @author EXACTUM-dev
 * @version 1.2.3
 * @description Handles the creation of membership applications including:
 * - File uploads to S3 (cedula, titulo, constancias, extra documents)
 * - Data validation and storage
 * - Email notifications to administrators
 * - Duplicate entry detection
 * - Show membership application details by ID
 * - Approve membership applications
 */

import MembershipApplication, {
  getMembershipApplications,
  getMembershipApplicationById, 
  approveMembershipApplicationById,
  denyMembershipApplication 
} from '../models/membershipApplication.model.js';
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
  
    // Save documents in S3
  const professionalFile = req.files?.cedula?.[0] || req.files?.professionalId?.[0] || null;
  const professionalUpload = professionalFile ? await S3Service.uploadFile(professionalFile, 'cedulas') : null;
  const professionalKey = professionalUpload?.key || null;

  const degreeFile = req.files?.titulo?.[0] || req.files?.degreeDocument?.[0] || null;
  const degreeUpload = degreeFile ? await S3Service.uploadFile(degreeFile, 'titulos') : null;
  const degreeKey = degreeUpload?.key || null;

  const certificatesFile = req.files?.constancias?.[0] || req.files?.certificates?.[0] || null;
  const certificatesUpload = certificatesFile ? await S3Service.uploadFile(certificatesFile, 'constancias') : null;
  const certificatesKey = certificatesUpload?.key || null;

    // If there is an extra document
    const extraDocs = [];
    Object.keys(req.files || {}).forEach(key => {
      if (key.startsWith('extraDoc')) {
        extraDocs.push(req.files[key][0]);
      }
    });

    const extraUploads = await Promise.all(
      extraDocs.map(file => S3Service.uploadFile(file, 'documentos-extra'))
    );
      const extraKeys = extraUploads.map(u => u?.key || null).filter(Boolean);
      const nombres = (req.body.nombres || req.body.nombre || '').toString().trim();
      const apellidoP = (req.body.apellidoP || req.body.apellidoPaterno || '').toString().trim();
      const apellidoM = (req.body.apellidoM || req.body.apellidoMaterno || '').toString().trim() || null;
      const telefonoWhatsapp = (req.body.telefonoWhatsapp || '').toString().trim() || null;
      const correo = (req.body.correo || '').toString().trim();
      const fechaNacimiento = (req.body.fechaNacimiento || '').toString().trim() || null;

      const applicationData = {
        nombres,
        apellidoP,
        apellidoM,
        telefonoCasa: req.body.telefonoCasa || null,
        telefonoWhatsapp,
        correo,
        pais: req.body.pais || null,
        estado: req.body.estado || null,
        ciudad: req.body.ciudad || null,
        colonia: req.body.colonia || null,
        codigoPostal: req.body.codigoPostal || null,
        calle: req.body.calle || null,
        numExterior: req.body.numExterior || null,
        numInterior: req.body.numInterior || null,
        licenciatura: req.body.licenciatura || null,
        instagram: req.body.instagram || null,
        linkedin: req.body.linkedin || null,
        facebook: req.body.facebook || null,
        paginaWeb: req.body.paginaWeb || null,
        fechaNacimiento,
        documents: {
          titulo: degreeKey,
          identificacionProfesional: professionalKey,
          constancias: certificatesKey,
          extra: extraKeys
        }
      };

    // Send data to archive model
    const application = new MembershipApplication(applicationData);
    await application.save();

    // Create template for the email when the application is sended
    const adminEmails = ["doculili08@gmail.com"];
    adminEmails.forEach(async (email) => {
      try {
        await sendEmail({
          to: email,
          subject: "Nueva solicitud de membresía pendiente",
          html: `
              <h1>¡Atención!</h1>
              <p>Se ha registrado una nueva solicitud de membresía.</p>
              <p><strong>Nombre:</strong> ${req.body.nombres || req.body.firstName || ''} ${req.body.apellidoP || req.body.lastName || ''} ${req.body.apellidoM || req.body.middleName || ''}</p>
              <p><strong>Email:</strong> ${req.body.correo || req.body.email || ''}</p>
            `
        });
      } catch (err) {
        console.error(`Error sending email to ${email}:`, err.message);
      }
    });

    // If the applicacion is success
    res.status(201).json({
      success: true,
      message: 'Solicitud creada, recibirá un correo o mensaje por WhatsApp por parte de SOMEFIPP',
      data: { IDUsuario: application.id, IDMembresia: application.IDMembresia || null }
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


/**
 * Obtain all the membership applications
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getMemberships = async (req, res) => {
  try {
    
    const membershipApplication = await getMembershipApplications();
    res.json({
      success: true,
      data: membershipApplication,
    });
    
  } catch (error) {
    console.error("Error en getMemberships:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      message: error.message
    });
  }
};

/**
 * Aprprove membership applications
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const approveMemberships = async (req, res) => {
  try {
    const rows = await approveMembershipApplications();
    res.json({ success: true, data: rows });
    
  } catch (error) {
    console.error("Error en getMemberships:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      message: error.message
    });
  }
};


/**
 * Get membership application detail by id
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getMembershipById = async (req, res) => {
  try {
    const { id } = req.params;
    const detail = await getMembershipApplicationById(id);
    if (!detail) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }
    res.json({ success: true, data: detail });
  } catch (error) {
    console.error('Error en getMembershipById:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};

/**
 * Approve a specific membership application
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const approveMembership = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await approveMembershipApplicationById(id);
    if (!updated) return res.status(404).json({ success: false, message: 'Solicitud no encontrada o no se pudo actualizar' });

    return res.json({ success: true, message: 'Solicitud aprobada', data: updated });
  } catch (err) {
    console.error('Error aprobando solicitud:', err);
    return res.status(500).json({ success: false, message: 'Error interno del servidor', error: err.message });
  }
};

/**
 * Deny a membership application
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function denyMembership(req, res) {
  const { id } = req.params;
  const { razonRechazo } = req.body;

  try {
    // Update the application in the database with reason
    console.log('Rechazando solicitud ID:', id, 'con razón:', razonRechazo);
    const result = await denyMembershipApplication(razonRechazo, id);

    res.status(200).json({ 
      success: true,
      message: 'Solicitud rechazada exitosamente',
      id: id
    });

  } catch (error) {
    console.error('Error al rechazar solicitud:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor al rechazar la solicitud',
      message: error.message
    });
  }
}