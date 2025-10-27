/**
 * @fileoverview Content model for video retrieval
 * @version 0.1.0
 * @author EXACTUM-dev
 * @description Handles content retrieval from database
 */

import db from "../../database/db.js";

/**
 * Gets a specific video by ID with its thumbnail
 * @param {string} videoId - Content ID to retrieve
 * @returns {Promise<Object>} Video data with thumbnail
 * @throws {Error} If video not found or database error
 */
export async function obtenerVideo(videoId) {
  const query = `
    SELECT 
      v.IDContenido,
      v.IDMultimedia,
      v.nombre,
      v.descripcion,
      v.tipo,
      v.tipoMembresia,
      v.createdAt,
      t.IDMultimedia as thumbnailMultimedia
    FROM contenido v
    LEFT JOIN contenido t ON t.nombre = v.nombre
                          AND t.eliminado = 0
                          AND t.deletedAt IS NULL
                          AND t.tipo = 'imagen'
    WHERE v.IDContenido = ?
      AND v.eliminado = 0
      AND v.deletedAt IS NULL
      AND v.tipo = 'video'
    LIMIT 1
  `;

  try {
    const [rows] = await db.query(query, [videoId]);

    if (rows.length === 0) {
      throw new Error("Video not found");
    }

    return rows[0];
  } catch (error) {
    if (error.message === "Video not found") {
      throw error;
    }
    console.error("Database error in obtenerVideo:", error);
    throw new Error("Database error");
  }
}

/**
 * Gets all available videos for sidebar/carousel with thumbnails and pagination
 * @param {number} limit - Number of videos per page (default: 10)
 * @param {number} offset - Number of videos to skip (default: 0)
 * @returns {Promise<Object>} Object with videos array and total count
 * @throws {Error} If database error
 */
export async function getAvailableVideos(limit = 10, offset = 0) {
  const countQuery = `
    SELECT COUNT(*) as total
    FROM contenido
    WHERE eliminado = 0
      AND deletedAt IS NULL
      AND tipo = 'video'
  `;

  const videosQuery = `
    SELECT 
      v.IDContenido,
      v.nombre,
      v.descripcion,
      v.tipo,
      v.tipoMembresia,
      v.createdAt,
      t.IDMultimedia as thumbnailMultimedia
    FROM contenido v
    LEFT JOIN contenido t ON t.nombre = v.nombre
                          AND t.eliminado = 0
                          AND t.deletedAt IS NULL
                          AND t.tipo = 'imagen'
    WHERE v.eliminado = 0
      AND v.deletedAt IS NULL
      AND v.tipo = 'video'
    ORDER BY v.createdAt DESC
    LIMIT ? OFFSET ?
  `;

  try {
    const [[{ total }]] = await db.query(countQuery);
    const [rows] = await db.query(videosQuery, [limit, offset]);

    return {
      videos: rows,
      total,
      hasMore: offset + limit < total,
    };
  } catch (error) {
    console.error("Database error in getAvailableVideos:", error);
    throw new Error("Database error");
  }
}
