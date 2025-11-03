/**
 * @fileoverview Content controller for handling multimedia requests with RBAC
 * @version 0.3.0
 * @author EXACTUM-dev
 * @description Manages multimedia content delivery with privilege validation
 */

import {
  getAvailableContent,
  getContentById,
} from "../models/content.model.js";
import { generateSignedUrl } from "../utils/cloudfront.js";
import { getUserRolesAndPermissions } from "../models/role.js";

/**
 * Determines S3 path based on content type
 * @param {string} type - Content type ('video' or 'articulo')
 * @param {string} idMultimedia - Multimedia ID
 * @returns {string} S3 path
 */
function getS3Path(type, idMultimedia) {
  return idMultimedia;
}

/**
 * Shows a specific content with thumbnail and validates user privileges
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function show(req, res) {
  try {
    const { contentId } = req.params;
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        error: "unauthorized",
        message: "Usuario no autenticado.",
      });
    }

    // Get user privileges
    const { privilegiosIds } = await getUserRolesAndPermissions(userId);

    const content = await getContentById(contentId, privilegiosIds);
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

    if (error.message === "Access denied") {
      return res.status(403).json({
        error: "access_denied",
        message: "No tienes permisos para acceder a este contenido.",
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
 * Lists available content filtered by user privileges with thumbnails and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function index(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const type = req.query.type || null;
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        error: "unauthorized",
        message: "Usuario no autenticado.",
      });
    }

    // Get user privileges
    const { privilegiosIds } = await getUserRolesAndPermissions(userId);

    const { content, total, hasMore } = await getAvailableContent(
      limit,
      offset,
      type,
      privilegiosIds
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
