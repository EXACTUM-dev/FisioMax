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
import { sanitizeContentInput, sanitizeEmail } from '../utils/sanitization.js';

/**
 * Creates a new membership application and sends email notification to admin.
 * @param {object} req - Express request object containing form data and files.
 * @param {object} res - Express response object.
 * @returns {Promise<void>} Sends JSON response with success or error.
 */
export const createMembershipApplication = async (req, res) => {
  
  try {
    // Sanitize input data
    const sanitized = sanitizeContentInput(req.body, {
      stringFields: ['firstName', 'lastName', 'middleName', 'homePhone', 'whatsappPhone',
                    'birthDate', 'country', 'state', 'city', 'neighborhood', 'postalCode',
                    'street', 'exteriorNumber', 'interiorNumber', 'degree', 'instagram',
                    'linkedin', 'facebook', 'website'],
      requiredFields: ['firstName', 'lastName', 'email', 'homePhone', 'birthDate',
                      'country', 'state', 'city', 'degree'],
      maxLengths: {
        firstName: 100,
        lastName: 100,
        middleName: 100,
        homePhone: 20,
        whatsappPhone: 20,
        country: 100,
        state: 100,
        city: 100,
        neighborhood: 100,
        postalCode: 10,
        street: 200,
        exteriorNumber: 20,
        interiorNumber: 20,
        degree: 200,
        instagram: 100,
        linkedin: 200,
        facebook: 200,
        website: 200
      }
    });

    // Sanitize email
    sanitized.email = sanitizeEmail(req.body.email);
    if (!sanitized.email) {
      return res.status(400).json({
        success: false,
        message: 'Email válido es requerido'
      });
    }
  
    // Save documents in S3 (or skip if S3 is not configured)
    let professionalIdUrl = null;
    let degreeDocumentUrl = null;
    let certificatesUrl = null;
    let extraDocsUrls = [];

    // Check if AWS is configured
    const isS3Configured = process.env.AWS_REGION && process.env.AWS_BUCKET_NAME;

    if (isS3Configured) {
      professionalIdUrl = req.files?.professionalId?.[0]
        ? await S3Service.uploadFile(req.files.professionalId[0], 'cedulas')
        : null;

      degreeDocumentUrl = req.files?.degreeDocument?.[0]
        ? await S3Service.uploadFile(req.files.degreeDocument[0], 'titulos')
        : null;

      certificatesUrl = req.files?.certificates?.[0]
        ? await S3Service.uploadFile(req.files.certificates[0], 'constancias')
        : null;

      // If there is an extra document
      const extraDocs = [];
      Object.keys(req.files || {}).forEach(key => {
        if (key.startsWith('extraDoc')) {
          extraDocs.push(req.files[key][0]);
        }
      });

      extraDocsUrls = await Promise.all(
        extraDocs.map(file => S3Service.uploadFile(file, 'documentos-extra'))
      );
    } else {
      console.warn('AWS S3 not configured. Files will not be uploaded.');
      // Store file names instead of URLs for development
      if (req.files?.professionalId?.[0]) {
        professionalIdUrl = req.files.professionalId[0].originalname;
      }
      if (req.files?.degreeDocument?.[0]) {
        degreeDocumentUrl = req.files.degreeDocument[0].originalname;
      }
      if (req.files?.certificates?.[0]) {
        certificatesUrl = req.files.certificates[0].originalname;
      }
    }
    
    const applicationData = {
      firstName: sanitized.firstName,
      lastName: sanitized.lastName,
      middleName: sanitized.middleName,
      homePhone: sanitized.homePhone,
      whatsappPhone: sanitized.whatsappPhone,
      email: sanitized.email,
      birthDate: sanitized.birthDate,
      country: sanitized.country,
      state: sanitized.state,
      city: sanitized.city,
      neighborhood: sanitized.neighborhood,
      postalCode: sanitized.postalCode,
      street: sanitized.street,                    
      exteriorNumber: sanitized.exteriorNumber,  
      interiorNumber: sanitized.interiorNumber,
      degree: sanitized.degree,
      instagram: sanitized.instagram,
      linkedin: sanitized.linkedin,
      facebook: sanitized.facebook,
      website: sanitized.website,
      documents: {
        degreeDocument: degreeDocumentUrl,
        professionalId: professionalIdUrl,
        certificates: certificatesUrl,
        extra: extraDocsUrls
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
              <p><strong>Nombre:</strong> ${sanitized.firstName || ''} ${sanitized.lastName || ''} ${sanitized.middleName || ''}</p>
              <p><strong>Email:</strong> ${sanitized.email || ''}</p>
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
    // Sanitize rejection reason
    const sanitized = sanitizeContentInput(req.body, {
      stringFields: ['razonRechazo'],
      requiredFields: ['razonRechazo'],
      maxLengths: { razonRechazo: 1000 }
    });

    // Update the application in the database with reason
    await denyMembershipApplication(sanitized.razonRechazo, id);

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