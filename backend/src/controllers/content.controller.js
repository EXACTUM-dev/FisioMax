/**
 * @fileoverview Content controller for handling video requests
 * @version 0.1.0
 * @author EXACTUM-dev
 * @description Manages video content delivery
 */

import { obtenerVideo, getAvailableVideos } from "../models/content.model.js";
import { generateSignedUrl } from "../utils/cloudfront.js";

/**
 * Shows a specific video with thumbnail
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function show(req, res) {
  try {
    const { videoId } = req.params;

    const video = await obtenerVideo(videoId);

    let signedUrl;
    try {
      signedUrl = generateSignedUrl(video.IDMultimedia);
    } catch (urlError) {
      console.error("Error generating signed URL:", urlError);
      return res.status(500).json({
        error: "url_generation_failed",
        message: "No se pudo cargar el video, intenta más tarde.",
      });
    }

    let thumbnailUrl = null;
    if (video.thumbnailMultimedia) {
      try {
        thumbnailUrl = generateSignedUrl(video.thumbnailMultimedia);
      } catch (thumbError) {
        console.error("Error generating thumbnail URL:", thumbError);
      }
    }

    return res.status(200).json({
      videoData: {
        IDContenido: video.IDContenido,
        titulo: video.nombre,
        descripcion: video.descripcion,
        tipoMembresia: video.tipoMembresia,
        tipo: video.tipo,
        thumbnailUrl,
      },
      signedUrl,
      metadata: {
        createdAt: video.createdAt,
      },
    });
  } catch (error) {
    console.error("Error in show controller:", error);

    if (error.message === "Video not found") {
      return res.status(404).json({
        error: "not_found",
        message: "El video solicitado no está disponible.",
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
 * Lists available videos for sidebar with thumbnails and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function index(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const { videos, total, hasMore } = await getAvailableVideos(limit, offset);

    const videosWithThumbnails = videos.map((video) => {
      let thumbnailUrl = null;
      if (video.thumbnailMultimedia) {
        try {
          thumbnailUrl = generateSignedUrl(video.thumbnailMultimedia);
        } catch (error) {
          console.error("Error generating thumbnail for:", video.IDContenido);
        }
      }

      return {
        IDContenido: video.IDContenido,
        nombre: video.nombre,
        descripcion: video.descripcion,
        tipo: video.tipo,
        tipoMembresia: video.tipoMembresia,
        createdAt: video.createdAt,
        thumbnailUrl,
      };
    });

    return res.status(200).json({
      videos: videosWithThumbnails,
      total,
      hasMore,
      currentOffset: offset,
      limit,
    });
  } catch (error) {
    console.error("Error in index controller:", error);

    if (error.message === "Database error") {
      return res.status(500).json({
        error: "database_error",
        message: "Ocurrió un error inesperado, por favor intenta más tarde.",
      });
    }

    return res.status(500).json({
      error: "internal_error",
      message: "No se pudieron cargar los videos.",
    });
  }
}
