/**
 * @fileoverview HomePage model for content retrieval
 * @version 0.2.0
 * @author EXACTUM-dev
 * @description Handles home page content retrieval organized by categories
 */

import db from "../../database/db.js";

/**
 * Valid content types for home page display
 * @constant {string[]}
 */
const DISPLAYABLE_CONTENT_TYPES = [
  "video",
  "articulo",
  "libro",
  "podcast",
  "descuento",
];

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
      c.fechaInicio,
      c.fechaFin,
      c.createdAt,
      CASE 
        WHEN c.tipo = 'descuento' AND t.IDMultimedia IS NULL THEN c.IDMultimedia
        ELSE t.IDMultimedia
      END as thumbnailMultimedia
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
  `;

  try {
    // Get 3 most recent videos for hero carousel
    const [recentVideos] = await db.query(
      `${baseQuery} ORDER BY c.createdAt DESC LIMIT 3`,
      ["video"]
    );

    // Get 9 videos (monthly recordings) for row carousel
    const [videos] = await db.query(
      `${baseQuery} ORDER BY c.createdAt DESC LIMIT 9`,
      ["video"]
    );

    // Get 9 articles (weekly articles) for row carousel
    const [articles] = await db.query(
      `${baseQuery} ORDER BY c.createdAt DESC LIMIT 9`,
      ["articulo"]
    );

    // Get 9 books/documents for row carousel
    const [books] = await db.query(
      `${baseQuery} ORDER BY c.createdAt DESC LIMIT 9`,
      ["libro"]
    );

    // Get 9 podcasts for row carousel
    const [podcasts] = await db.query(
      `${baseQuery} ORDER BY c.createdAt DESC LIMIT 9`,
      ["podcast"]
    );

    // Get active discounts
    const [discounts] = await db.query(
      `
      ${baseQuery} 
      AND c.fechaInicio <= NOW() 
      AND c.fechaFin >= NOW()
      ORDER BY c.createdAt DESC 
      LIMIT 9
    `,
      ["descuento"]
    );

    return {
      recentVideos,
      videos,
      articles,
      books,
      podcasts,
      discounts,
    };
  } catch (error) {
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
      c.fechaInicio,
      c.fechaFin,
      c.createdAt,
      CASE 
        WHEN c.tipo = 'descuento' AND t.IDMultimedia IS NULL THEN c.IDMultimedia
        ELSE t.IDMultimedia
      END as thumbnailMultimedia
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
    throw new Error("Database error");
  }
}
