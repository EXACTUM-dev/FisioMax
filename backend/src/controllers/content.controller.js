/**
 * @fileoverview Content controller for handling multimedia requests
 * @version 0.3.0
 * @author EXACTUM-dev
 * @description Manages multimedia content delivery
 */

import {
  getAvailableContent,
  getContentById,
  createContent,
  assignContentToPrivileges,
  updateContent,
  softDeleteContent,
  getActiveDiscounts as _getActiveDiscounts,
} from "../models/content.model.js";
import {
  getUsuarioByClerkId,
  getUserById,
  getUserByMembershipId,
  updateUserCertificate,
} from "../models/users.model.js";
import { findRoleById, getPrivilegeIdsByRole } from "../models/roles.model.js";
import { generateSignedUrl } from "../utils/cloudfront.js";
import { createCertificate } from "../utils/certificate.js";
import S3Service from "../services/s3Service.js";
import { sendWelcomeEmail } from "../services/emailServices.js";
import { sanitizeContentInput } from "../utils/sanitization.js";
import { updateContentDates } from "../models/contentDates.model.js";
import { checkAndNotifyNewDiscounts } from "../services/notificationCronJob.js";
import path from "path";
import crypto from "crypto";

/**
 * Determines S3 path based on content type
 * @param {string} type - Content type ('video' or 'article')
 * @param {string} idMultimedia - Multimedia ID
 * @returns {string} S3 path
 */
function getS3Path(type, idMultimedia) {
  return idMultimedia;
}

/**
 * Shows a specific content with thumbnail
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function show(req, res) {
  try {
    const { contentId } = req.params;

    const content = await getContentById(contentId);
    if (!content) {
      throw new Error("Content not found");
    }

    const s3Path = getS3Path(content.tipo, content.IDMultimedia);

    let signedUrl;
    try {
      signedUrl = generateSignedUrl(s3Path);
    } catch (urlError) {
      return res.status(500).json({
        error: "url_generation_failed",
        message: "No se pudo cargar el contenido, intenta más tarde.",
      });
    }

    let thumbnailUrl = null;
    if (content.thumbnailMultimedia) {
      try {
        thumbnailUrl = generateSignedUrl(content.thumbnailMultimedia);
      } catch (thumbError) {
        // Thumbnail generation failed, continue without it
      }
    }

    return res.status(200).json({
      contentData: {
        IDContenido: content.IDContenido,
        titulo: content.nombre,
        descripcion: content.descripcion,
        tipoMembresia: content.tipoMembresia,
        tipo: content.tipo,
        thumbnailUrl,
      },
      signedUrl,
      metadata: {
        createdAt: content.createdAt,
      },
    });
  } catch (error) {
    if (error.message === "Content not found") {
      return res.status(404).json({
        error: "not_found",
        message: "El contenido solicitado no está disponible.",
      });
    }

    if (error.message === "Database error") {
      return res.status(500).json({
        error: "database_error",
        message: "Ocurrió un error inesperado, por favor intenta más tarde.",
      });
    }

    return res.status(500).json({
      error: "internal_error",
      message: "Ocurrió un error inesperado, por favor intenta más tarde.",
    });
  }
}

/**
 * Lists available content for sidebar with thumbnails, pagination, search and sorting
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function index(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const type = req.query.tipo || req.query.type || null;
    const searchTerm = req.query.search || null;
    const sortBy = req.query.sortBy || "newest";

    // Validate sortBy parameter
    const validSortOptions = ["newest", "oldest", "alphabetical"];
    const finalSortBy = validSortOptions.includes(sortBy) ? sortBy : "newest";

    const { content, total, hasMore } = await getAvailableContent(
      limit,
      offset,
      type,
      searchTerm,
      finalSortBy
    );

    const contentWithThumbnails = content.map((item) => {
      let thumbnailUrl = null;
      if (item.thumbnailMultimedia) {
        try {
          thumbnailUrl = generateSignedUrl(item.thumbnailMultimedia);
        } catch (error) {
          // Thumbnail generation failed, continue without it
        }
      }

      return {
        IDContenido: item.IDContenido,
        nombre: item.nombre,
        descripcion: item.descripcion,
        tipo: item.tipo,
        tipoMembresia: item.tipoMembresia,
        createdAt: item.createdAt,
        thumbnailUrl,
      };
    });

    return res.status(200).json({
      content: contentWithThumbnails,
      total,
      hasMore,
      currentOffset: offset,
      limit,
    });
  } catch (error) {
    if (error.message.includes("Invalid content type")) {
      return res.status(400).json({
        error: "invalid_type",
        message: error.message,
      });
    }

    if (error.message === "Database error") {
      return res.status(500).json({
        error: "database_error",
        message: "Ocurrió un error inesperado, por favor intenta más tarde.",
      });
    }

    return res.status(500).json({
      error: "internal_error",
      message: "No se pudo cargar el contenido.",
    });
  }
}

/**
 * Creates new multimedia content and assigns it to role privileges
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function upload(req, res) {
  try {
    const { nombre, descripcion, tipo, filekey, roles, subcategoria } = req.body;
    // English: extract optional dates sent from the client
    const { fechaInicio, fechaFin } = req.body;
    const file = req.files?.file?.[0];
    const thumbnail = req.files?.thumbnail?.[0];

    if (tipo !== "Descuento" && !file && !filekey) {
      return res.status(400).json({
        success: false,
        message:
          "Debes proporcionar un archivo o un s3Key previamente firmado.",
      });
    }

    // Parse roles if it's a JSON string
    let roleIds = [];
    if (roles) {
      try {
        roleIds = typeof roles === "string" ? JSON.parse(roles) : roles;
        if (!Array.isArray(roleIds)) {
          roleIds = [roleIds];
        }
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          message: "Formato de roles inválido",
        });
      }
    }

    // Validate and sanitize input using the generic sanitization utility
    const allowedTypes = ["Video", "Articulo", "Podcast", "Libro", "Descuento"];

    let sanitized;
    try {
      sanitized = sanitizeContentInput(
        { nombre, descripcion, tipo, roles: roleIds },
        {
          stringFields: ["nombre", "descripcion", "tipo"],
          idFields: ["roles"],
          requiredFields: ["nombre", "tipo", "roles"],
          maxLengths: {
            nombre: 50,
            descripcion: 500,
          },
          allowedValues: {
            tipo: allowedTypes,
          },
        }
      );
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError.message,
      });
    }

    const validatedRoleIds = sanitized.roles;

    if (validatedRoleIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Los roles seleccionados no son válidos",
      });
    }

    // Validate all roles exist and collect all privilege IDs
    let allPrivilegeIds = [];
    let roleNames = [];

    for (const roleId of validatedRoleIds) {
      const roleData = await findRoleById(roleId);
      if (!roleData) {
        return res.status(400).json({
          success: false,
          message: `El rol con ID ${roleId} no existe`,
        });
      }

      roleNames.push(roleData.nombre);

      // Get all privileges for this role
      const privilegeIds = await getPrivilegeIdsByRole(roleId);

      if (privilegeIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: `El rol "${roleData.nombre}" no tiene privilegios asignados`,
        });
      }

      // Add privileges to the collection (avoid duplicates)
      privilegeIds.forEach((privId) => {
        if (!allPrivilegeIds.includes(privId)) {
          allPrivilegeIds.push(privId);
        }
      });
    }

    let finalS3Key;

    let finalSubcategoria = subcategoria || null;

    // Map content type to folder, handling video subcategories
    const folderMap = {
      Video: {
        'sesiones-mensuales': 'videos/sesiones-mensuales',
        'sesiones-extraordinarias': 'videos/sesiones-extraordinarias',
        'sesiones-con-proveedores': 'videos/sesiones-con-proveedores',
        'default': 'videos'
      },
      Articulo: "articulos",
      Podcast: "podcasts",
      Libro: "libros",
      Descuento: "descuentos",
    };

    let folder;
    if (sanitized.tipo === "Video" && finalSubcategoria) {
      folder = folderMap.Video[finalSubcategoria] || folderMap.Video.default;
    } else if (typeof folderMap[sanitized.tipo] === 'object') {
      folder = folderMap[sanitized.tipo].default || "contenido";
    } else {
      folder = folderMap[sanitized.tipo] || "contenido";
    }

    if (filekey) {
      // Already uploaded from client
      finalS3Key = filekey;
    } else {
      try {
        // Upload main file to S3
        finalS3Key = await S3Service.uploadFile(file, folder);
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: "Error al subir el archivo a S3",
        });
      }
    }

    // English: validate discount dates if content is a discount
    if (sanitized.tipo && sanitized.tipo.toLowerCase() === "descuento") {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (
        !fechaInicio ||
        !fechaFin ||
        !dateRegex.test(fechaInicio) ||
        !dateRegex.test(fechaFin)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "FechaInicio and FechaFin are required for Descuento and must use YYYY-MM-DD format",
        });
      }
    }

    // Create main content
    let contentId;
    try {
      // English: include discount date range when provided
      const contentPayload = {
        nombre: sanitized.nombre,
        descripcion: sanitized.descripcion || "",
        tipo: sanitized.tipo.toLowerCase(),
        IDMultimedia: finalS3Key,
        tipoMembresia: roleNames.join(", "),
        subcategoria: finalSubcategoria || null,
      };
      if (sanitized.tipo && sanitized.tipo.toLowerCase() === "descuento") {
        contentPayload.fechaInicio = fechaInicio;
        contentPayload.fechaFin = fechaFin;
      }

      contentId = await createContent(contentPayload);

      // Assign content to all collected privileges in accede table
      await assignContentToPrivileges(contentId, allPrivilegeIds);

      // Notify users if content is a discount
      if (sanitized.tipo.toLowerCase() === "descuento") {
        // Get today's date in Mexico City timezone
        const today = new Date().toLocaleDateString("en-CA", {
          timeZone: "America/Mexico_City",
        });

        // Only notify if the discount starts today
        if (fechaInicio === today) {
          // Run notification in background to not block response
          checkAndNotifyNewDiscounts({
            IDContenido: contentId,
            nombre: sanitized.nombre,
            descripcion: sanitized.descripcion,
            tipoMembresia: roleNames.join(", "),
            fechaFin: fechaFin
          }).catch(err => console.error("Error triggering discount notification:", err));
        }
      }
    } catch (dbError) {
      console.error("Database error details:", dbError);
      return res.status(500).json({
        success: false,
        message: "Error al guardar el contenido en la base de datos",
        detail: dbError.message,
      });
    }

    // Upload thumbnail if provided
    let thumbnailId = null;
    if (thumbnail && thumbnail.buffer) {
      try {
        const thumbnailKey = await S3Service.uploadFile(
          thumbnail,
          `${folder}/thumbnails`
        );
        thumbnailId = await createContent({
          nombre: sanitized.nombre,
          descripcion: `Miniatura de ${sanitized.nombre}`,
          tipo: "imagen",
          IDMultimedia: thumbnailKey,
          tipoMembresia: roleNames.join(", "),
        });
        await assignContentToPrivileges(thumbnailId, allPrivilegeIds);
      } catch (thumbError) {
        console.error("Thumbnail error:", thumbError);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Contenido subido exitosamente",
      data: {
        contentId,
        thumbnailId,
        assignedPrivileges: allPrivilegeIds.length,
        assignedRoles: roleNames,
      },
    });
  } catch (error) {
    console.error("General upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
    });
  }
}
/**
 * Generates a presigned URL for direct S3 upload
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function presignUploadUrl(req, res) {
  try {
    const { fileName, fileType, folder, subcategoria } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({
        success: false,
        message: "Nombre y tipo de archivo son requeridos",
      });
    }
    // Map content type to folder, handling video subcategories
    const folderMap = {
      Video: {
        'sesiones-mensuales': 'videos/sesiones-mensuales',
        'sesiones-extraordinarias': 'videos/sesiones-extraordinarias',
        'sesiones-con-proveedores': 'videos/sesiones-con-proveedores',
        'default': 'videos'
      },
      Articulo: "articulos",
      Podcast: "podcasts",
      Libro: "libros",
      Descuento: "descuentos",
    };

    let s3Folder;
    if (folder === "Video" && subcategoria) {
      // Use subcategory-specific folder for videos
      s3Folder = folderMap.Video[subcategoria] || folderMap.Video.default;
    } else if (typeof folderMap[folder] === 'object') {
      // If it's an object (like Video), use default
      s3Folder = folderMap[folder].default || "contenido";
    } else {
      // Use direct mapping for other types
      s3Folder = folderMap[folder] || "contenido";
    }

    /// Use your current S3 service to generate the URL
    const fileExt = path.extname(fileName);
    const s3Key = `${s3Folder}/${crypto.randomUUID()}${fileExt}`;
    //const s3Key = `${folder || "contenido"}/${Date.now()}-${fileName}`;
    const url = await S3Service.getPresignedUploadUrl(s3Key, fileType);

    return res.status(200).json({
      success: true,
      uploadUrl: url,
      key: s3Key,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "No se pudo generar la URL de subida",
    });
  }
}

/**
 * Updates content title and description
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function editContent(req, res) {
  try {
    const { contentId } = req.params;
    const { nombre, descripcion } = req.body;
    const clerkUserId = req.auth?.userId;

    if (!contentId) {
      return res.status(400).json({
        success: false,
        message: "ID de contenido es requerido",
      });
    }

    if (!nombre || !descripcion) {
      return res.status(400).json({
        success: false,
        message: "Título y descripción son requeridos",
      });
    }

    // Verify user is Admin
    const { getUserByClerkId } = await import("../models/users.model.js");
    const { findRoleById } = await import("../models/roles.model.js");
    const user = await getUserByClerkId(clerkUserId);

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Usuario no encontrado.",
      });
    }

    // Get role name to verify if user is admin
    const role = await findRoleById(user.IDRol);
    if (!role || role.nombre !== "Admin") {
      return res.status(403).json({
        success: false,
        message:
          "No tienes permisos para editar contenido. Solo los administradores pueden realizar esta acción.",
      });
    }

    // Sanitize input
    const sanitized = sanitizeContentInput(
      { nombre, descripcion },
      {
        stringFields: ["nombre", "descripcion"],
        requiredFields: ["nombre", "descripcion"],
        maxLengths: {
          nombre: 50,
          descripcion: 500,
        },
      }
    );

    // Update content
    const updatedContent = await updateContent(contentId, sanitized);

    return res.status(200).json({
      success: true,
      message: "Contenido actualizado exitosamente",
      data: updatedContent,
    });
  } catch (error) {
    if (error.message === "Content not found") {
      return res.status(404).json({
        success: false,
        message: "El contenido no existe",
      });
    }

    if (error.message === "Content type cannot be edited") {
      return res.status(400).json({
        success: false,
        message: "Este tipo de contenido no puede ser editado",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al actualizar el contenido",
      detail: error.message,
    });
  }
}

/**
 * Return active discounts for homepage.
 */
export async function getActiveDiscounts(req, res) {
  try {
    const discounts = await _getActiveDiscounts();
    return res.status(200).json({ success: true, data: discounts });
  } catch (err) {
    console.error("Error fetching active discounts:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * Deletes content (soft delete in DB + physical delete in S3)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function deleteContent(req, res) {
  try {
    const { contentId } = req.params;
    const clerkUserId = req.auth?.userId;

    if (!contentId) {
      return res.status(400).json({
        success: false,
        message: "ID de contenido es requerido",
      });
    }

    // Verify user is Admin
    const { getUserByClerkId } = await import("../models/users.model.js");
    const { findRoleById } = await import("../models/roles.model.js");
    const user = await getUserByClerkId(clerkUserId);

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Usuario no encontrado.",
      });
    }

    // Get role name to verify if user is admin
    const role = await findRoleById(user.IDRol);
    if (!role || role.nombre !== "Admin") {
      return res.status(403).json({
        success: false,
        message:
          "No tienes permisos para eliminar contenido. Solo los administradores pueden realizar esta acción.",
      });
    }

    // Soft delete in database and get S3 keys
    const { mainKey, thumbnailKey } = await softDeleteContent(contentId);

    // Delete files from S3 in parallel
    const deletePromises = [];

    if (mainKey) {
      deletePromises.push(S3Service.deleteFile(mainKey));
    }

    if (thumbnailKey) {
      deletePromises.push(S3Service.deleteFile(thumbnailKey));
    }

    await Promise.all(deletePromises);

    // Also delete any notifications that reference this content
    try {
      const NotificationModel = (
        await import("../models/notifications.model.js")
      ).default;

      const deleted = await NotificationModel.deleteByContentId(contentId);
      // include number of deleted notifications in response for transparency
      return res.status(200).json({
        success: true,
        message: "Contenido eliminado exitosamente",
        deletedNotifications: deleted.affectedRows || 0,
      });
    } catch (notifErr) {
      console.error("Error deleting related notifications:", notifErr);
      // Content deleted successfully; return success but warn about notifications
      return res.status(200).json({
        success: true,
        message:
          "Contenido eliminado exitosamente (error al eliminar notificaciones relacionadas)",
      });
    }
  } catch (error) {
    if (error.message === "Content not found") {
      return res.status(404).json({
        success: false,
        message: "El contenido no existe",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al eliminar el contenido",
    });
  }
}

/**
 * Generate and upload member certificate
 * @async
 * @param {number} membershipId - ID of the membership
 * @returns {Promise<CertificateResult>} Result of the generation
 */
export async function generateAndUploadCertificate(membershipId, sendEmail = true) {
  try {
    const membershipData = await getUserByMembershipId(membershipId);

    if (!membershipData) {
      return { generated: false, error: "Membership not found" };
    }

    const {
      nombres,
      apellidoP,
      apellidoM,
      membresiaTipo,
      membresiaFechaVencimiento,
      membresiaNoAfiliado,
    } = membershipData;

    // Format fechaVencimiento to "Mes Año" format (e.g., "Diciembre 2025")
    const mesesEspanol = [
      "ENERO",
      "FEBRERO",
      "MARZO",
      "ABRIL",
      "MAYO",
      "JUNIO",
      "JULIO",
      "AGOSTO",
      "SEPTIEMBRE",
      "OCTUBRE",
      "NOVIEMBRE",
      "DICIEMBRE",
    ];

    const fechaVencimiento = new Date(membresiaFechaVencimiento);
    const mes = mesesEspanol[fechaVencimiento.getMonth()];
    const año = fechaVencimiento.getFullYear();
    const vigencia = `${mes} ${año}`;

    // Generate the PDF
    const pdfBytes = await createCertificate({
      nombres,
      apellidoP,
      apellidoM,
      membresiaTipo,
      vigencia,
      membresiaNoAfiliado,
    });

    const nombreCompleto = [nombres, apellidoP, apellidoM]
      .filter(Boolean)
      .join(" ")
      .trim();

    // Create a unique name for the file
    const timestamp = Date.now();
    const sanitizedName = nombreCompleto.replace(/\s+/g, "_").toLowerCase();
    const fileName = "membresias";

    const fileForS3 = {
      originalname: pdfBytes.filename,
      mimetype: pdfBytes.mimeType,
      buffer: pdfBytes.buffer,
    };

    // Upload to S3
    const uploadResult = await S3Service.uploadFile(fileForS3, fileName);

    //Update certificate
    await updateUserCertificate(membershipId, uploadResult);

    // Send Email to member only if requested
    if (sendEmail) {
      await sendWelcomeEmail(membershipData.correo, nombreCompleto, pdfBytes);
    }

    return {
      generated: true,
      url: uploadResult,
      key: uploadResult,
    };
  } catch (error) {
    return { generated: false, error: error.message };
  }
}

/**
 * Updates discount dates for an existing content row (admin)
 */
export async function updateDates(req, res) {
  try {
    const { contentId } = req.params;
    const { fechaInicio, fechaFin } = req.body;

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(fechaInicio) || !dateRegex.test(fechaFin)) {
      return res.status(400).json({
        success: false,
        message: "Formato de fecha inválido. Use YYYY-MM-DD",
      });
    }

    const updated = await updateContentDates(contentId, fechaInicio, fechaFin);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Contenido no encontrado o no editable",
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Fechas actualizadas" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error al actualizar fechas" });
  }
}
