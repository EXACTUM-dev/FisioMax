/**
 * @fileoverview Controller to handle membership application requests.
 * @author EXACTUM-dev
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
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      middleName: req.body.middleName,
      homePhone: req.body.homePhone,
      whatsappPhone: req.body.whatsappPhone,
      email: req.body.email,
      birthDate: req.body.birthDate,
      country: req.body.country,
      state: req.body.state,
      city: req.body.city,
      neighborhood: req.body.neighborhood,
      postalCode: req.body.postalCode,
      street: req.body.street,                    
      exteriorNumber: req.body.exteriorNumber,  
      interiorNumber: req.body.interiorNumber,
      degree: req.body.degree,
      instagram: req.body.instagram,
      linkedin: req.body.linkedin,
      facebook: req.body.facebook,
      website: req.body.website,
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
            <p><strong>Nombre:</strong> ${req.body.firstName} ${req.body.lastName} ${req.body.middleName}</p>
            <p><strong>Email:</strong> ${req.body.email}</p>
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
