/**
 * @fileoverview Content controller for handling multimedia requests
 * @version 0.2.0
 * @author EXACTUM-dev
 * @description Manages multimedia content delivery
 */

import {
  getAvailableContent,
  getContentById,
  createContent,
  assignContentToRole,
  getRoleName,
} from "../models/content.model.js";
import { generateSignedUrl } from "../utils/cloudfront.js";
import S3Service from "../services/s3Service.js";

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
 * Lists available content for sidebar with thumbnails and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function index(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const type = req.query.type || null; // 'video' or 'article'

    const { content, total, hasMore } = await getAvailableContent(
      limit,
      offset,
      type
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
 * Creates new multimedia content
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function upload(req, res) {
  try {
    let { nombre, descripcion, tipo, role } = req.body;
    const file = req.files?.file?.[0];
    const thumbnail = req.files?.thumbnail?.[0];

    // Sanitize input fields - trim whitespace and remove dangerous characters
    nombre = nombre?.trim().replace(/[<>]/g, '') || '';
    descripcion = descripcion?.trim().replace(/[<>]/g, '') || '';
    tipo = tipo?.trim() || '';
    
    // Validate required fields
    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: "El nombre del archivo es obligatorio",
      });
    }

    if (nombre.length > 50) {
      return res.status(400).json({
        success: false,
        message: "El nombre del archivo no puede exceder los 50 caracteres",
      });
    }

    if (descripcion && descripcion.length > 500) {
      return res.status(400).json({
        success: false,
        message: "La descripción no puede exceder los 500 caracteres",
      });
    }

    if (!tipo) {
      return res.status(400).json({
        success: false,
        message: "El tipo de contenido es obligatorio",
      });
    }

    // Validate tipo is one of the allowed values
    const allowedTypes = ['Video', 'Articulo', 'Podcast', 'Documento'];
    if (!allowedTypes.includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: "Tipo de contenido inválido",
      });
    }

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Debes seleccionar a quién va dirigido el contenido",
      });
    }

    // Validate role is a number
    const roleId = parseInt(role);
    if (isNaN(roleId) || roleId <= 0) {
      return res.status(400).json({
        success: false,
        message: "El rol seleccionado no es válido",
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Debes seleccionar un archivo de contenido",
      });
    }

    // Map content type to folder
    const folderMap = {
      Video: "videos",
      Articulo: "articulos",
      Podcast: "podcasts",
      Documento: "documentos",
    };

    const folder = folderMap[tipo] || "contenido";

    // Upload main file to S3
    let s3Key;
    try {
      s3Key = await S3Service.uploadFile(file, folder);
    } catch (uploadError) {
      console.error("Error uploading file to S3:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Error al subir el archivo a S3",
      });
    }

    // Insert content into database
    let contentId;
    let tipoMembresia = null;
    
    try {
      // Get role name if role is provided
      if (roleId) {
        tipoMembresia = await getRoleName(roleId);
      }

      contentId = await createContent({
        nombre,
        descripcion: descripcion || '',
        tipo: tipo.toLowerCase(),
        IDMultimedia: s3Key,
        tipoMembresia,
      });

      // Assign content to role
      if (roleId) {
        await assignContentToRole(contentId, roleId);
      }
    } catch (dbError) {
      console.error("Error creating content in database:", dbError);
      return res.status(500).json({
        success: false,
        message: "Error al guardar el contenido en la base de datos",
      });
    }

    // Upload thumbnail if provided
    let thumbnailId = null;
    if (thumbnail) {
      try {
        const thumbnailKey = await S3Service.uploadFile(thumbnail, `${folder}/thumbnails`);
        thumbnailId = await createContent({
          nombre,
          descripcion: `Miniatura de ${nombre}`,
          tipo: "imagen",
          IDMultimedia: thumbnailKey,
          tipoMembresia,
        });

        // Assign thumbnail to same role
        if (roleId) {
          await assignContentToRole(thumbnailId, roleId);
        }
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
