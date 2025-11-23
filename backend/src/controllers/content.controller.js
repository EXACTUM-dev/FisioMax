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
} from "../models/content.model.js";
import {
  getUsuarioByClerkId,
  getUserById,
  updateUserCertificate
} from "../models/users.model.js";
import { findRoleById, getPrivilegeIdsByRole } from "../models/roles.model.js";
import { generateSignedUrl } from "../utils/cloudfront.js";
import { createCertificate } from "../utils/certificate.js";
import S3Service from "../services/s3Service.js";
import { sendWelcomeEmail } from "../services/emailServices.js";
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
      return res.status(500).json({
        success: false,
        message: "Error al guardar el contenido en la base de datos",
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

        // Assign thumbnail to same privileges
        await assignContentToPrivileges(thumbnailId, allPrivilegeIds);
      } catch (thumbError) {
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
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎓 INICIO: Generación de certificado');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📋 Membership ID recibido: ${membershipId}`);

    // Obtain membership data for the certificate
    console.log('\n🔍 PASO 1: Obteniendo datos de membresía...');
    const membershipData = await getUserById(membershipId);

    if (!membershipData) {
      console.error(`❌ ERROR: Membership ${membershipId} no encontrada`);
      return { generated: false, error: 'Membership not found' };
    }

    console.log('✅ Datos de membresía obtenidos exitosamente');
    console.log(`   - Nombres: ${membershipData.nombres}`);
    console.log(`   - Apellido Paterno: ${membershipData.apellidoP}`);
    console.log(`   - Apellido Materno: ${membershipData.apellidoM}`);
    console.log(`   - Tipo de Membresía: ${membershipData.membresiaTipo}`);
    console.log(`   - Correo: ${membershipData.correo}`);

    const { nombres, apellidoP, apellidoM, membresiaTipo } = membershipData;
    const vigencia = "2025";
    console.log(`   - Vigencia: ${vigencia}`);

    // Generate the PDF
    console.log('\n📄 PASO 2: Generando PDF del certificado...');
    const pdfBytes = await createCertificate({
      nombres,
      apellidoP,
      apellidoM,
      membresiaTipo,
      vigencia
    });
    console.log('✅ PDF generado exitosamente');
    console.log(`   - Nombre del archivo: ${pdfBytes.filename}`);
    console.log(`   - Tipo MIME: ${pdfBytes.mimeType}`);
    console.log(`   - Tamaño del buffer: ${pdfBytes.buffer.length} bytes`);

    const nombreCompleto = [nombres, apellidoP, apellidoM]
      .filter(Boolean)
      .join(' ')
      .trim();
    console.log(`   - Nombre completo: ${nombreCompleto}`);

    // Create a unique name for the file
    const timestamp = Date.now();
    const sanitizedName = nombreCompleto.replace(/\s+/g, '_').toLowerCase();
    const fileName = "membresias";
    console.log(`   - Timestamp: ${timestamp}`);
    console.log(`   - Nombre sanitizado: ${sanitizedName}`);
    console.log(`   - Carpeta S3: ${fileName}`);

    const fileForS3 = {
      originalname: pdfBytes.filename,
      mimetype: pdfBytes.mimeType,
      buffer: pdfBytes.buffer
    };

    // Upload to S3
    console.log('\n☁️  PASO 3: Subiendo certificado a S3...');
    console.log(`   - Archivo original: ${fileForS3.originalname}`);
    console.log(`   - MIME type: ${fileForS3.mimetype}`);
    const uploadResult = await S3Service.uploadFile(fileForS3, fileName);
    console.log('✅ Certificado subido a S3 exitosamente');
    console.log(`   - URL: ${uploadResult}`);

    //Update certificate
    console.log('\n💾 PASO 4: Actualizando certificado en la base de datos...');
    console.log(`   - Membership ID: ${membershipId}`);
    console.log(`   - URL del certificado: ${uploadResult}`);
    await updateUserCertificate(membershipId, uploadResult);
    console.log('✅ Base de datos actualizada exitosamente');

    // Send Email to member
    console.log('\n📧 PASO 5: Enviando email al miembro...');
    console.log(`   - Destinatario: ${membershipData.correo}`);
    console.log(`   - Nombre completo: ${nombreCompleto}`);
    await sendWelcomeEmail(membershipData.correo, nombreCompleto, pdfBytes);
    console.log('✅ Email enviado exitosamente');

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🎉 ÉXITO: Certificado generado completamente');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📊 Resumen:`);
    console.log(`   - Membership ID: ${membershipId}`);
    console.log(`   - URL del certificado: ${uploadResult}`);
    console.log('═══════════════════════════════════════════════════════\n');

    return {
      generated: true,
      url: uploadResult,
      key: uploadResult
    };

  } catch (error) {
    console.log('\n═══════════════════════════════════════════════════════');
    console.error('❌ ERROR CRÍTICO en generación de certificado');
    console.log('═══════════════════════════════════════════════════════');
    console.error(`   - Membership ID: ${membershipId}`);
    console.error(`   - Mensaje de error: ${error.message}`);
    console.error(`   - Stack trace:`, error.stack);
    console.log('═══════════════════════════════════════════════════════\n');
    return { generated: false, error: error.message };
  }
}

