/**
 * @fileoverview Controller to handle user-related requests.
 * Manages user profile retrieval and transformation, including document URL generation.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import {
  getUsuarioByClerkId,
  getUsuarios,
  getUserById,
  markUserDeleted,
  reassignUserToSinRol,
  updateUserById,
} from "../models/users.model.js";
import S3Service from "../services/s3Service.js";
import { sanitizeContentInput, sanitizeEmail } from "../utils/sanitization.js";

/**
 * Gets all users with their roles from the database.
 * @param {!Object} req - Express request object.
 * @param {!Object} res - Express response object.
 * @return {!Promise<void>} Sends JSON response with users array or error.
 */
export async function getAllUsers(req, res) {
  try {
    const users = await getUsuarios();

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener los usuarios",
      message: error.message,
    });
  }
}

/**
 * Gets the profile of the authenticated user.
 * Generates fresh presigned URLs for user documents.
 * @param {!Object} req - Express request object with auth.userId.
 * @param {!Object} res - Express response object.
 * @return {!Promise<void>} Sends JSON response with user data or error.
 */
export async function getCurrentUserProfile(req, res) {
  try {
    const clerkId = req.auth?.userId;

    if (!clerkId) {
      return res.status(401).json({
        success: false,
        error: "Usuario no autenticado",
      });
    }

    const user = await getUsuarioByClerkId(clerkId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Usuario no encontrado en la base de datos",
      });
    }

    // Generate fresh presigned URLs for documents
    const [cedulaUrl, tituloUrl, constanciasUrl] = await Promise.all([
      S3Service.getPresignedUrl(user.cedula),
      S3Service.getPresignedUrl(user.titulo),
      S3Service.getPresignedUrl(user.constancias),
    ]);

    // Generate presigned URLs for additional documents
    const documentosadicionalesUrls =
      user.documentosAdicionales && user.documentosadicionales.length > 0
        ? await S3Service.getPresignedUrls(user.documentosadicionales)
        : [];

    const transformedUser = {
      nombres: user.nombres || "",
      apellidoP: user.apellidoP || "",
      apellidoM: user.apellidoM || "",
      email: user.correo || "",
      telefono: user.telefonoProfesional || "",
      telefonoProfesional: user.telefonoProfesional || "",
      telefonoWhatsapp: user.telefonoWhatsapp || "",
      fechaNacimiento: user.fechaNacimiento || "",
      foto: user.foto || null,
      licenciatura: user.licenciatura || "",
      pais: user.pais || "",
      estado: user.estado || "",
      ciudad: user.ciudad || "",
      calle: user.calle || "",
      numExterior: user.numExterior || "",
      numInterior: user.numInterior || "",
      colonia: user.colonia || "",
      codigoPostal: user.codigoPostal || "",
      instagram: user.instagram || "",
      linkedin: user.linkedin || "",
      facebook: user.facebook || "",
      paginaWeb: user.paginaWeb || "",
      cedula: cedulaUrl,
      titulo: tituloUrl,
      constancias: constanciasUrl,
      documentosadicionales: documentosadicionalesUrls,
      rol: user.rolNombre || null,
      IDRol: user.IDRol || null,
      IDUsuario: user.IDUsuario,
      clerkID: user.clerkID,
      createdAt: user.createdAt,
      // Membership information
      membershipType: user.membresiaTipo || null,
      membershipExpiresAt: user.membresiaFechaVencimiento || null,
      membershipRegisteredAt: user.membresiaCreatedAt || null,
      membershipHoursFormation: user.membresiaHorasFormacion || null,
      membershipStatus: user.membresiaAceptado,
      membershipPaymentStatus: user.membresiaEstatusPago || null,
    };

    res.status(200).json({
      success: true,
      data: transformedUser,
    });
  } catch (error) {
    console.error("Error obteniendo perfil del usuario:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener el perfil del usuario",
      message: error.message,
    });
  }
}

/**
 * Gets a specific user's profile by ID.
 * Generates fresh presigned URLs for user documents.
 * @param {!Object} req - Express request object with params.userId.
 * @param {!Object} res - Express response object.
 * @return {!Promise<void>} Sends JSON response with user data or error.
 */
export async function getUserProfileById(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "ID de usuario requerido",
      });
    }

    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Usuario no encontrado en la base de datos",
      });
    }

    // Generate fresh presigned URLs for documents
    const [cedulaUrl, tituloUrl, constanciasUrl] = await Promise.all([
      S3Service.getPresignedUrl(user.cedula),
      S3Service.getPresignedUrl(user.titulo),
      S3Service.getPresignedUrl(user.constancias),
    ]);

    // Generate presigned URLs for additional documents
    const documentosadicionalesUrls =
      user.documentosadicionales && user.documentosadicionales.length > 0
        ? await S3Service.getPresignedUrls(user.documentosadicionales)
        : [];

    const transformedUser = {
      nombres: user.nombres || "",
      apellidoP: user.apellidoP || "",
      apellidoM: user.apellidoM || "",
      email: user.correo || "",
      telefono: user.telefonoProfesional || "",
      telefonoProfesional: user.telefonoProfesional || "",
      telefonoWhatsapp: user.telefonoWhatsapp || "",
      fechaNacimiento: user.fechaNacimiento || "",
      foto: user.foto || null,
      licenciatura: user.licenciatura || "",
      pais: user.pais || "",
      estado: user.estado || "",
      ciudad: user.ciudad || "",
      calle: user.calle || "",
      numExterior: user.numExterior || "",
      numInterior: user.numInterior || "",
      colonia: user.colonia || "",
      codigoPostal: user.codigoPostal || "",
      instagram: user.instagram || "",
      linkedin: user.linkedin || "",
      facebook: user.facebook || "",
      paginaWeb: user.paginaWeb || "",
      cedula: cedulaUrl,
      titulo: tituloUrl,
      constancias: constanciasUrl,
      documentosadicionales: documentosadicionalesUrls,
      rol: user.rolNombre || null,
      IDRol: user.IDRol || null,
      IDUsuario: user.IDUsuario,
      clerkID: user.clerkID,
      createdAt: user.createdAt,
      // Membership information
      membershipType: user.membresiaTipo || null,
      membershipExpiresAt: user.membresiaFechaVencimiento || null,
      membershipRegisteredAt: user.membresiaCreatedAt || null,
      membershipHoursFormation: user.membresiaHorasFormacion || null,
      membershipStatus: user.membresiaAceptado,
      membershipPaymentStatus: user.membresiaEstatusPago || null,
    };

    res.status(200).json({
      success: true,
      data: transformedUser,
    });
  } catch (error) {
    console.error("Error obteniendo perfil del usuario por ID:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener el perfil del usuario",
      message: error.message,
    });
  }
}

/**
 * Deletes a user (soft-delete) after reassigning "SinRol".
 *
 * This function performs the following steps:
 * 1. Validates the provided user ID.
 * 2. Prevents the authenticated user from deleting their own account.
 * 3. Reassigns the user's role to "SinRol".
 * 4. Marks the user as deleted in the database.
 *
 * @async
 * @function deleteUser
 * @param {import('express').Request} req - Express request object containing the user ID in params.
 * @param {import('express').Response} res - Express response object for sending the result.
 * @throws {Error} Returns appropriate HTTP status codes and messages for errors.
 * @return {Promise<void>} Sends a JSON response indicating success or failure.
 */
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const clerkId = req.auth?.userId;

    // Validate user ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID de usuario no proporcionado.",
      });
    }

    // Prevent self-deletion
    const user = await getUsuarioByClerkId(clerkId);
    if (user?.IDUsuario?.toString() === id) {
      return res.status(403).json({
        success: false,
        message: "No puedes eliminar tu propia cuenta.",
      });
    }

    // Check if the user exists
    const userToDelete = await getUserById(id);
    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado.",
      });
    }

    // Try to reassign role to "SinRol" (or mark role as deleted if SinRol doesn't exist)
    try {
      await reassignUserToSinRol(id);
    } catch (reassignError) {
      // Log the error but continue with deletion
      console.warn("Advertencia al reasignar rol:", reassignError.message);
    }

    // Mark the user as deleted
    const affectedRows = await markUserDeleted(id);
    if (affectedRows === 0) {
      return res.status(500).json({
        success: false,
        message: "No se pudo eliminar el usuario.",
      });
    }

    // Respond with success message
    res.status(200).json({
      success: true,
      message: `El usuario \"${userToDelete.nombres} ${userToDelete.apellidoP} ${userToDelete.apellidoM}\" fue eliminado con éxito.`,
    });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor.",
      error: error.message,
    });
  }
}
/**
 * Update an existing user's basic information.
 * Expects fields in req.body (only allowed fields will be updated).
 * @async
 * @function updateUser
 * @param {!Object} req - Express request object with params.userId and body containing update data.
 * @param {!Object} res - Express response object.
 * @return {!Promise<void>} Sends JSON response with updated user data or error.
 */
export async function updateUser(req, res) {
  try {
    const { userId } = req.params;
    const updateData = req.body || {};

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, error: "ID de usuario requerido" });
    }

    // Sanitize user input
    const sanitized = sanitizeContentInput(updateData, {
      stringFields: [
        "nombres",
        "apellidoP",
        "apellidoM",
        "telefonoProfesional",
        "telefonoWhatsapp",
        "licenciatura",
        "pais",
        "estado",
        "ciudad",
        "calle",
        "numExterior",
        "numInterior",
        "colonia",
        "codigoPostal",
        "instagram",
        "linkedin",
        "facebook",
        "paginaWeb",
        "membershipType",
        "membershipPaymentStatus",
      ],
      maxLengths: {
        nombres: 60,
        apellidoP: 60,
        apellidoM: 60,
        telefonoProfesional: 13,
        telefonoWhatsapp: 13,
        licenciatura: 100,
        pais: 60,
        estado: 60,
        ciudad: 60,
        calle: 25,
        numExterior: 10,
        numInterior: 10,
        colonia: 60,
        codigoPostal: 60,
        instagram: 25,
        linkedin: 25,
        facebook: 25,
        paginaWeb: 255,
        membershipType: 50,
        membershipPaymentStatus: 50,
      },
    });

    // Sanitize email separately if present
    if (updateData.email) {
        sanitized.email = sanitizeEmail(updateData.email);
    }

    const formatDateForMySQL = (isoDate) => {
        if (!isoDate) return null;
        // Transform '2025-11-07T00:00:00.000Z' -> '2025-11-07 00:00:00'
        return isoDate.replace('T', ' ').replace('.000Z', '');
    };

    // Pass through membershipExpiresAt as date (already validated by database)
    if (updateData.membershipExpiresAt) {
        sanitized.membershipExpiresAt = formatDateForMySQL(updateData.membershipExpiresAt);
    }

    // Pass through membershipRegisteredAt as date (already validated by database)
    if (updateData.membershipRegisteredAt) {
        sanitized.membershipRegisteredAt = formatDateForMySQL(updateData.membershipRegisteredAt);
    }

    const updated = await updateUserById(userId, sanitized);        if (!updated) {
    return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    // Generate presigned URLs for documents
    const [cedulaUrl, tituloUrl, constanciasUrl] = await Promise.all([
      S3Service.getPresignedUrl(updated.cedula),
      S3Service.getPresignedUrl(updated.titulo),
      S3Service.getPresignedUrl(updated.constancias),
    ]);

    const transformedUser = {
      nombres: updated.nombres || "",
      apellidoP: updated.apellidoP || "",
      apellidoM: updated.apellidoM || "",
      email: updated.correo || "",
      telefonoProfesional: updated.telefonoProfesional || "",
      telefonoWhatsapp: updated.telefonoWhatsapp || "",
      fechaNacimiento: updated.fechaNacimiento || "",
      licenciatura: updated.licenciatura || "",
      pais: updated.pais || "",
      estado: updated.estado || "",
      ciudad: updated.ciudad || "",
      calle: updated.calle || "",
      numExterior: updated.numExterior || "",
      numInterior: updated.numInterior || "",
      colonia: updated.colonia || "",
      codigoPostal: updated.codigoPostal || "",
      instagram: updated.instagram || "",
      linkedin: updated.linkedin || "",
      facebook: updated.facebook || "",
      paginaWeb: updated.paginaWeb || "",
      cedula: cedulaUrl,
      titulo: tituloUrl,
      constancias: constanciasUrl,
      IDUsuario: updated.IDUsuario,
      IDRol: updated.IDRol || null,
      rol: updated.rolNombre || null,
      clerkID: updated.clerkID || null,
      // Membership information
      membershipType: updated.membresiaTipo || null,
      membershipExpiresAt: updated.membresiaFechaVencimiento || null,
      membershipRegisteredAt: updated.membresiaCreatedAt || null,
      membershipHoursFormation: updated.membresiaHorasFormacion || null,
      membershipStatus: updated.membresiaAceptado,
      membershipPaymentStatus: updated.membresiaEstatusPago || null,
    };

    return res.status(200).json({ success: true, data: transformedUser });
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    return res.status(500).json({
      success: false,
      error: "Error al actualizar el usuario",
      message: error.message,
    });
  }
}

/**
 * Update user documents (titulo, cedula, constancias, and extra documents).
 * Handles file uploads to S3 and updates database.
 * @async
 * @function updateUserDocuments
 * @param {!Object} req - Express request object with params.userId and files in req.files.
 * @param {!Object} res - Express response object.
 * @return {!Promise<void>} Sends JSON response with updated user data or error.
 */
export async function updateUserDocuments(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, error: "ID de usuario requerido" });
    }

    // Get current user data to retrieve old document keys
    const currentUser = await getUserById(userId);
    if (!currentUser) {
      return res
        .status(404)
        .json({ success: false, error: "Usuario no encontrado" });
    }

    const updateData = {};

    // Check if AWS is configured
    const isS3Configured =
      process.env.AWS_REGION && process.env.AWS_BUCKET_NAME;

    if (isS3Configured) {
      // Upload files to S3 if provided, and delete old ones
      if (req.files?.titulo?.[0]) {
        if (currentUser.titulo) {
          await S3Service.deleteFile(currentUser.titulo);
        }
        updateData.titulo = await S3Service.uploadFile(
          req.files.titulo[0],
          "titulos"
        );
      }
      if (req.files?.cedula?.[0]) {
        if (currentUser.cedula) {
          await S3Service.deleteFile(currentUser.cedula);
        }
        updateData.cedula = await S3Service.uploadFile(
          req.files.cedula[0],
          "cedulas"
        );
      }
      if (req.files?.constancias?.[0]) {
        if (currentUser.constancias) {
          await S3Service.deleteFile(currentUser.constancias);
        }
        updateData.constancias = await S3Service.uploadFile(
          req.files.constancias[0],
          "constancias"
        );
      }

      // Handle extra documents
      const extraDocs = [];
      Object.keys(req.files || {}).forEach((key) => {
        if (key.startsWith("extraDoc")) {
          extraDocs.push(req.files[key][0]);
        }
      });

      if (extraDocs.length > 0) {
        // Delete old extra documents if they exist
        if (currentUser.documentosadicionales && currentUser.documentosadicionales.length > 0) {
          await Promise.all(
            currentUser.documentosadicionales.map(docKey => 
              S3Service.deleteFile(docKey)
            )
          );
        }

        // Upload new extra documents
        const extraDocsUrls = await Promise.all(
          extraDocs.map((file) => S3Service.uploadFile(file, "documentos-extra"))
        );
        
        updateData.documentosadicionales = extraDocsUrls;
      }
    } else {
      console.warn("AWS S3 not configured. Files will not be uploaded.");
      if (req.files?.titulo?.[0]) {
        updateData.titulo = req.files.titulo[0].originalname;
      }
      if (req.files?.cedula?.[0]) {
        updateData.cedula = req.files.cedula[0].originalname;
      }
      if (req.files?.constancias?.[0]) {
        updateData.constancias = req.files.constancias[0].originalname;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No se proporcionaron archivos para actualizar",
      });
    }

    const updated = await updateUserById(userId, updateData);

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, error: "Usuario no encontrado" });
    }

    // Generate fresh presigned URLs for all documents
    const [cedulaUrl, tituloUrl, constanciasUrl] = await Promise.all([
      S3Service.getPresignedUrl(updated.cedula),
      S3Service.getPresignedUrl(updated.titulo),
      S3Service.getPresignedUrl(updated.constancias),
    ]);

    // Generate presigned URLs for additional documents
    const documentosadicionalesUrls =
      updated.documentosadicionales && updated.documentosadicionales.length > 0
        ? await S3Service.getPresignedUrls(updated.documentosadicionales)
        : [];

    const transformedUser = {
      nombres: updated.nombres || "",
      apellidoP: updated.apellidoP || "",
      apellidoM: updated.apellidoM || "",
      email: updated.correo || "",
      telefonoProfesional: updated.telefonoProfesional || "",
      telefonoWhatsapp: updated.telefonoWhatsapp || "",
      fechaNacimiento: updated.fechaNacimiento || "",
      licenciatura: updated.licenciatura || "",
      pais: updated.pais || "",
      estado: updated.estado || "",
      ciudad: updated.ciudad || "",
      calle: updated.calle || "",
      numExterior: updated.numExterior || "",
      numInterior: updated.numInterior || "",
      colonia: updated.colonia || "",
      codigoPostal: updated.codigoPostal || "",
      instagram: updated.instagram || "",
      linkedin: updated.linkedin || "",
      facebook: updated.facebook || "",
      paginaWeb: updated.paginaWeb || "",
      cedula: cedulaUrl,
      titulo: tituloUrl,
      constancias: constanciasUrl,
      documentosadicionales: documentosadicionalesUrls,
      IDUsuario: updated.IDUsuario,
      IDRol: updated.IDRol || null,
      rol: updated.rolNombre || null,
      clerkID: updated.clerkID || null,
    };

    return res.status(200).json({ success: true, data: transformedUser });
  } catch (error) {
    console.error("Error actualizando documentos del usuario:", error);
    return res.status(500).json({
      success: false,
      error: "Error al actualizar los documentos",
      message: error.message,
    });
  }
}
