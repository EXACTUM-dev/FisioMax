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
  denyMembershipApplication,
  getMaxNoAfiliado,
  deleteMembershipApplication
} from "../models/membershipApplication.model.js";
import { sendEmail, sendRejectionEmail, sendAcceptanceEmail } from "../services/emailServices.js";
import S3Service from "../services/s3Service.js";
import PaymentService from "../services/payment.service.js";
import { sanitizeContentInput, sanitizeEmail } from "../utils/sanitization.js";

/**
 * Creates a new membership application and sends email notification to admin.
 * @param {object} req - Express request object containing form data and files.
 * @param {object} res - Express response object.
 * @returns {Promise<void>} Sends JSON response with success or error.
 */
export const createMembershipApplication = async (req, res) => {
  try {
    console.log('📝 [MEMBERSHIP] New application - Email:', req.body.email);
    // Sanitize input data
    const sanitized = sanitizeContentInput(req.body, {
      stringFields: [
        "firstName",
        "lastName",
        "middleName",
        "professionalPhone",
        "whatsappPhone",
        "birthDate",
        "membershipType",
        "country",
        "state",
        "city",
        "neighborhood",
        "postalCode",
        "street",
        "exteriorNumber",
        "interiorNumber",
        "degree",
        "instagram",
        "linkedin",
        "facebook",
        "website",
      ],
      requiredFields: [
        "firstName",
        "lastName",
        "email",
        "whatsappPhone",
        "birthDate",
        "country",
        "state",
      ],
      maxLengths: {
        firstName: 100,
        lastName: 100,
        middleName: 100,
        professionalPhone: 20,
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
        website: 200,
      },
    });

    // Sanitize email
    sanitized.email = sanitizeEmail(req.body.email);
    // Ensure numeric hours field is normalized and available on sanitized
    if (req.body.membershipHoursFormation !== undefined) {
      sanitized.membershipHoursFormation = Number(
        req.body.membershipHoursFormation
      );
    }
    if (!sanitized.email) {
      return res.status(400).json({
        success: false,
        message: "Email válido es requerido",
      });
    }

    // Save documents in S3 (or skip if S3 is not configured)
    let professionalIdUrl = null;
    let degreeDocumentUrl = null;
    let certificatesUrl = null;
    let extraDocsUrls = [];

    // Check if AWS is configured
    const isS3Configured =
      process.env.AWS_REGION && process.env.AWS_BUCKET_NAME;

    if (isS3Configured) {
      professionalIdUrl = req.files?.professionalId?.[0]
        ? await S3Service.uploadFile(req.files.professionalId[0], "cedulas")
        : null;

      degreeDocumentUrl = req.files?.degreeDocument?.[0]
        ? await S3Service.uploadFile(req.files.degreeDocument[0], "titulos")
        : null;

      certificatesUrl = req.files?.certificates?.[0]
        ? await S3Service.uploadFile(req.files.certificates[0], "constancias")
        : null;

      // If there is an extra document
      const extraDocs = [];
      Object.keys(req.files || {}).forEach((key) => {
        if (key.startsWith("extraDoc")) {
          extraDocs.push(req.files[key][0]);
        }
      });

      extraDocsUrls = await Promise.all(
        extraDocs.map((file) => S3Service.uploadFile(file, "documentos-extra"))
      );
    } else {
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
      professionalPhone: sanitized.professionalPhone,
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
        extra: extraDocsUrls,
      },
      membershipType: sanitized.membershipType || null,
      membershipHoursFormation:
        sanitized.membershipHoursFormation !== undefined
          ? sanitized.membershipHoursFormation
          : null,
    };

    // applicationData prepared

    // Send data to archive model
    const application = new MembershipApplication(applicationData);
    await application.save();

    // saved detail verification removed (debug)

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
              <p><strong>Nombre:</strong> ${sanitized.firstName || ""} ${sanitized.lastName || ""
            } ${sanitized.middleName || ""}</p>
              <p><strong>Email:</strong> ${sanitized.email || ""}</p>
            `,
        });
      } catch (err) {
        return res.status(500).json({
          success: false,
          message: "Error al enviar correo electrónico",
          error: err.message,
        });
      }
    });

    // If the applicacion is success
    res.status(201).json({
      success: true,
      message:
        "Solicitud creada, recibirá un correo o mensaje por WhatsApp por parte de SOMEFIPP",
      data: {
        IDUsuario: application.id,
        IDMembresia: application.IDMembresia || null,
      },
    });
  } catch (error) {
    if (
      error.code === "ER_DUP_ENTRY" ||
      error.message.includes("Duplicate entry")
    ) {
      return res.status(409).json({
        success: false,
        message: "Este usuario ya está registrado",
        error: "DUPLICATE_ENTRY",
      });
    }

    // Check if it's a validation error from sanitization
    if (error.message && error.message.includes("requerido")) {
      return res.status(400).json({
        success: false,
        message: error.message,
        error: "VALIDATION_ERROR",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error al crear la solicitud",
      error: error.message,
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
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      message: error.message,
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
      return res
        .status(404)
        .json({ success: false, message: "Solicitud no encontrada" });
    }
    res.json({ success: true, data: detail });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

/**
 * Membership prices in MXN (per year)
 * @constant {Object}
 */
const MEMBERSHIP_PRICES = {
  'Estudiante': 900,
  'Licenciado en Formación': 1100,
  'Licenciado Especializado': 1500,
  'Fisioterapeuta Extranjero': 1800,
  'Admin': 5,
  'Personal de la salud': 1100,
};

/**
 * Approve a specific membership application
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const approveMembership = async (req, res) => {
  try {
    const { id } = req.params;
    const { noAfiliado } = req.body;

    // Get membership application details before approving
    const membershipDetails = await getMembershipApplicationById(id);

    if (!membershipDetails) {
      return res.status(404).json({
        success: false,
        message: "Solicitud no encontrada",
      });
    }

    const updated = await approveMembershipApplicationById(id, noAfiliado);
    if (!updated)
      return res.status(404).json({
        success: false,
        message: "Solicitud no encontrada o no se pudo actualizar",
      });

    // Send acceptance email with payment link
    try {
      const nombreCompleto = membershipDetails.nombreCompleto ||
        `${membershipDetails.nombres || ""} ${membershipDetails.apellidoP || ""} ${membershipDetails.apellidoM || ""}`.trim();
      const email = membershipDetails.correo;
      const membershipType = membershipDetails.membershipType || 'Admin';
      const amount = MEMBERSHIP_PRICES[membershipType] || 1500;

      if (email && nombreCompleto) {
        // Generate Mercado Pago payment link
        let linkPago = '';
        try {
          const preference = await PaymentService.createPaymentPreference({
            membershipId: id,
            membershipType,
            amount,
            userEmail: email,
          });
          linkPago = preference.init_point;

          // Create initial payment record
          await PaymentService.createPayment({
            IDMembresia: id,
            folio: preference.id,
            cantidad: amount,
            payment_method_id: 'pending', // Will be updated by webhook
            response_webhook: { status: 'pending' },
            membershipPaymentStatus: 'Pendiente'
          });

        } catch (paymentError) {
          // Continue without payment link if generation fails
          linkPago = 'https://somefipp.com/pagos'; // Fallback URL or empty
        }

        await sendAcceptanceEmail(
          email,
          nombreCompleto,
          membershipType,
          amount,
          linkPago
        );
      }
    } catch (emailError) {
    }

    return res.json({
      success: true,
      message: "Solicitud aprobada",
      data: updated,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: err.message,
    });
  }
};

/**
 * Deny a membership application
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
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
      stringFields: ["razonRechazo"],
      requiredFields: ["razonRechazo"],
      maxLengths: { razonRechazo: 1000 },
    });

    // Get membership application details before rejecting
    const membershipDetails = await getMembershipApplicationById(id);

    if (!membershipDetails) {
      return res.status(404).json({
        success: false,
        message: "Solicitud no encontrada",
      });
    }

    // Update the application in the database with reason
    await denyMembershipApplication(sanitized.razonRechazo, id);

    // Send rejection email to the applicant
    try {
      const nombreCompleto = membershipDetails.nombreCompleto ||
        `${membershipDetails.nombres || ""} ${membershipDetails.apellidoP || ""} ${membershipDetails.apellidoM || ""}`.trim();
      const email = membershipDetails.correo;

      if (email && nombreCompleto) {
        const emailResult = await sendRejectionEmail(email, nombreCompleto, sanitized.razonRechazo);

        if (emailResult.success) {
        } else {
        }
      } else {
      }
    } catch (emailError) {
    }

    res.status(200).json({
      success: true,
      message: "Solicitud rechazada exitosamente",
      id: id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error interno del servidor al rechazar la solicitud",
      message: error.message,
    });
  }
}

/**
 * Get the maximum noAfiliado
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getMaxNoAfiliadoController = async (req, res) => {
  try {
    const { type } = req.query;
    const maxNoAfiliado = await getMaxNoAfiliado(type);
    res.json({
      success: true,
      data: maxNoAfiliado,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

/**
 * Deletes a membership application
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteMembership = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID de membresía requerido"
      });
    }

    // Retrieve application details to get file keys
    const detail = await getMembershipApplicationById(id);

    if (!detail) {
      return res.status(404).json({
        success: false,
        message: "Solicitud no encontrada o ya eliminada"
      });
    }

    // Delete files from S3 if they exist
    if (detail.documentos && Array.isArray(detail.documentos)) {
      try {
        const deletePromises = detail.documentos
          .filter(doc => doc.key)
          .map(doc => S3Service.deleteFile(doc.key));

        await Promise.all(deletePromises);
      } catch (s3Error) {
        console.error("Error removing files from S3:", s3Error);
        // Continue with deletion even if S3 fails
      }
    }

    const deleted = await deleteMembershipApplication(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Solicitud no encontrada o ya eliminada"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Solicitud eliminada correctamente"
    });
  } catch (error) {
    console.error("Error al eliminar solicitud:", error);
    return res.status(500).json({
      success: false,
      message: "Error al eliminar la solicitud",
      error: error.message
    });
  }
};
