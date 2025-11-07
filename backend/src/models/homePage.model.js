/**
 * @fileoverview HomePage model for content retrieval
 * @version 0.1.0
 * @author EXACTUM-dev
 * @description Handles home page content retrieval organized by categories
 */

import db from "../../database/db.js";

/**
 * Valid content types for home page display
 * @constant {string[]}
 */
const DISPLAYABLE_CONTENT_TYPES = ["video", "articulo", "libro", "podcast"];

/**
 * Gets content organized by categories for home page
 * @returns {Promise<Object>} Object with categorized content arrays
 * @throws {Error} If database error
 */
export async function getContentByCategories() {
  const baseQuery = `
    SELECT 
      c.IDContenido,
      c.nombre,
      c.descripcion,
      c.tipo,
      c.tipoMembresia,
      c.createdAt,
      t.IDMultimedia as thumbnailMultimedia
    FROM contenido c
    LEFT JOIN contenido t 
      ON t.nombre = c.nombre
      AND t.tipo = 'imagen'
      AND t.tipoMembresia = c.tipoMembresia
      AND t.eliminado = 0
      AND t.deletedAt IS NULL
    WHERE c.eliminado = 0
      AND c.deletedAt IS NULL
      AND c.tipo = ?
    ORDER BY c.createdAt DESC
  `;

  try {
    // Get 3 most recent videos
    const [recentVideos] = await db.query(`${baseQuery} LIMIT 3`, ["video"]);

    // Get videos (monthly recordings)
    const [videos] = await db.query(`${baseQuery} LIMIT 10`, ["video"]);

    // Get articles (weekly articles)
    const [articles] = await db.query(`${baseQuery} LIMIT 10`, ["articulo"]);

    // Get books/documents
    const [books] = await db.query(`${baseQuery} LIMIT 10`, ["libro"]);

    // Get podcasts
    const [podcasts] = await db.query(`${baseQuery} LIMIT 10`, ["podcast"]);

    return {
      recentVideos,
      videos,
      articles,
      books,
      podcasts,
    };
  } catch (error) {
    console.error("Database error in getContentByCategories:", error);
    throw new Error("Database error");
  }
}

/**
 * Searches content across all types
 * @param {string} searchTerm - Search term to filter by title or description
 * @returns {Promise<Array<Object>>} Array of matching content
 * @throws {Error} If database error
 */
export async function searchAllContent(searchTerm) {
  const query = `
    SELECT 
      c.IDContenido,
      c.nombre,
      c.descripcion,
      c.tipo,
      c.tipoMembresia,
      c.createdAt,
      t.IDMultimedia as thumbnailMultimedia
    FROM contenido c
    LEFT JOIN contenido t 
      ON t.nombre = c.nombre
      AND t.tipo = 'imagen'
      AND t.tipoMembresia = c.tipoMembresia
      AND t.eliminado = 0
      AND t.deletedAt IS NULL
    WHERE c.eliminado = 0
      AND c.deletedAt IS NULL
      AND c.tipo IN (?)
      AND (c.nombre LIKE ? OR c.descripcion LIKE ?)
    ORDER BY c.createdAt DESC
    LIMIT 50
  `;

  const searchPattern = `%${searchTerm}%`;

  try {
    const [results] = await db.query(query, [
      DISPLAYABLE_CONTENT_TYPES,
      searchPattern,
      searchPattern,
    ]);

    return results;
  } catch (error) {
    console.error("Database error in searchAllContent:", error);
    throw new Error("Database error");
  }
}
