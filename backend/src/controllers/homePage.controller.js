/**
 * @fileoverview HomePage controller for handling home page content requests
 * @version 0.1.0
 * @author EXACTUM-dev
 * @description Manages home page content delivery with categorized carousels
 */

import {
  getContentByCategories,
  searchAllContent,
} from "../models/homePage.model.js";
import { generateSignedUrl } from "../utils/cloudfront.js";

/**
 * Sanitizes user input to prevent XSS attacks
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeInput(str) {
  if (!str) return "";

  return str
    .trim()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Generates signed URL for thumbnail or returns null
 * @param {string|null} thumbnailMultimedia - Thumbnail multimedia ID
 * @returns {string|null} Signed URL or null if no thumbnail
 */
function getThumbnailUrl(thumbnailMultimedia) {
  if (!thumbnailMultimedia) {
    return null;
  }

  try {
    return generateSignedUrl(thumbnailMultimedia);
  } catch (error) {
    return null;
  }
}

/**
 * Maps content items to include thumbnail URLs
 * @param {Array<Object>} items - Content items array
 * @returns {Array<Object>} Content items with thumbnail URLs
 */
function mapContentWithThumbnails(items) {
  return items.map((item) => ({
    IDContenido: item.IDContenido,
    nombre: item.nombre,
    descripcion: item.descripcion,
    tipo: item.tipo,
    tipoMembresia: item.tipoMembresia,
    createdAt: item.createdAt,
    thumbnailUrl: getThumbnailUrl(item.thumbnailMultimedia),
  }));
}

/**
 * Gets all content organized for home page display
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function getHomeContent(req, res) {
  try {
    const categorizedContent = await getContentByCategories();

    const response = {
      recentVideos: mapContentWithThumbnails(categorizedContent.recentVideos),
      videos: mapContentWithThumbnails(categorizedContent.videos),
      articles: mapContentWithThumbnails(categorizedContent.articles),
      books: mapContentWithThumbnails(categorizedContent.books),
      podcasts: mapContentWithThumbnails(categorizedContent.podcasts),
    };

    return res.status(200).json(response);
  } catch (error) {
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
 * Searches content across all types
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function search(req, res) {
  try {
    const searchTerm = sanitizeInput(req.query.q);

    if (!searchTerm) {
      return res.status(400).json({
        error: "invalid_search",
        message: "El término de búsqueda es requerido.",
      });
    }

    const results = await searchAllContent(searchTerm);

    const response = {
      content: mapContentWithThumbnails(results),
      total: results.length,
      searchTerm,
    };

    return res.status(200).json(response);
  } catch (error) {
    if (error.message === "Database error") {
      return res.status(500).json({
        error: "database_error",
        message: "Ocurrió un error inesperado, por favor intenta más tarde.",
      });
    }

    return res.status(500).json({
      error: "internal_error",
      message: "Error al buscar contenido.",
    });
  }
}
