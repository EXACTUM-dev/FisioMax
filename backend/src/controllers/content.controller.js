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
} from "../models/content.model.js";
import { findRoleById, getPrivilegeIdsByRole } from "../models/roles.model.js";
import { generateSignedUrl } from "../utils/cloudfront.js";
import S3Service from "../services/s3Service.js";
import { sanitizeContentInput } from "../utils/sanitization.js";
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
      console.error("Error generando URL firmada:", urlError);
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
        console.error("Error generando URL de miniatura:", thumbError);
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
    console.error("Error en el controlador del contenido:", error);

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
          console.error("Error generando miniatura para:", item.IDContenido);
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
    console.error("Error en el controlador index:", error);

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
    const { nombre, descripcion, tipo, filekey, roles } = req.body;
    const file = req.files?.file?.[0];
    const thumbnail = req.files?.thumbnail?.[0];

    if (!file && !filekey) {
      return res.status(400).json({
        success: false,
        message: "Debes proporcionar un archivo o un s3Key previamente firmado."
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
        console.error("Error parsing roles:", parseError);
        return res.status(400).json({
          success: false,
          message: "Formato de roles inválido",
        });
      }
    }

    // Validate and sanitize input using the generic sanitization utility
    const allowedTypes = ["Video", "Articulo", "Podcast", "Libro"];

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
      console.error("No valid role IDs found");
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

    // Map content type to folder
    const folderMap = {
      Video: "videos",
      Articulo: "articulos",
      Podcast: "podcasts",
      Libro: "libros",
    };

    const folder = folderMap[sanitized.tipo] || "contenido";

    if (filekey) {
      // Already uploaded from client
      finalS3Key = filekey;
    } else {
      try {
        // Upload main file to S3
        finalS3Key = await S3Service.uploadFile(file, folder);
      } catch (uploadError) {
        console.error("Error uploading file to S3:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Error al subir el archivo a S3",
        });
      }
    }

    // Create main content
    let contentId;
    try {
      contentId = await createContent({
        nombre: sanitized.nombre,
        descripcion: sanitized.descripcion || "",
        tipo: sanitized.tipo.toLowerCase(),
        IDMultimedia: finalS3Key,
        tipoMembresia: roleNames.join(", "), // Store all role names
      });

      // Assign content to all collected privileges in accede table
      await assignContentToPrivileges(contentId, allPrivilegeIds);
    } catch (dbError) {
      console.error("Error creating content in database:", dbError);
      return res.status(500).json({
        success: false,
        message: "Error al guardar el contenido en la base de datos",
      });
    }

    // Upload thumbnail if provided
    let thumbnailId = null;
    console.log(thumbnail);
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

        // Assign thumbnail to same privileges
        await assignContentToPrivileges(thumbnailId, allPrivilegeIds);
      } catch (thumbError) {
        console.error("Error uploading thumbnail:", thumbError);
        // Continue even if thumbnail fails
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
    console.error("Error in upload controller:", error);
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
    const { fileName, fileType, folder } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({
        success: false,
        message: "Nombre y tipo de archivo son requeridos",
      });
    }
    // Map content type to folder
    const folderMap = {
      Video: "videos",
      Articulo: "articulos",
      Podcast: "podcasts",
      Libro: "libros",
    };

    const s3Folder = folderMap[folder] || "contenido";

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
    console.error("Error generating presigned URL:", error);
    return res.status(500).json({
      success: false,
      message: "No se pudo generar la URL de subida",
    });
  }
}


/**
   * Generate and upload member certificate
   * @async
   * @param {number} membershipId - ID of the membership
   * @returns {Promise<CertificateResult>} Result of the generation
   */
export async function generateAndUploadCertificate(membershipId) {
    try {
      // Obtain membership data for the certificate
      const membershipData = await Payment.getMembershipDetails(membershipId);

      if (!membershipData) {
        console.error(`Membership ${membershipId} not found for certificate generation`);
        return { generated: false, error: 'Membership not found' };
      }

      const { nombre, categoria, vigencia, numeroAfiliado } = membershipData;

      // Generate the PDF
      const pdfBytes = await generarCertificado({
        nombre,
        categoria,
        vigencia,
        numero: numeroAfiliado
      });

      // Create a unique name for the file
      const timestamp = Date.now();
      const sanitizedName = nombre.replace(/\s+/g, '_').toLowerCase();
      const fileName = `certificado_${sanitizedName}_${timestamp}.pdf`;

      // Upload to S3
      const uploadResult = await uploadPdfToS3(pdfBytes, fileName);

      // Update membership with certificate URL
      await Payment.updateMembershipCertificate(membershipId, uploadResult.url);

      // Send Email to member

      console.log(`Certificate generated for membership ${membershipId}: ${uploadResult.url}`);

      return {
        generated: true,
        url: uploadResult.url,
        key: uploadResult.key
      };

    } catch (error) {
      console.error(`Error generating certificate for membership ${membershipId}:`, error);
      return { generated: false, error: error.message };
    }
  },
};

