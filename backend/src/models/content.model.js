/**
 * @fileoverview Content model for multimedia retrieval
 * @version 0.2.0
 * @author EXACTUM-dev
 * @description Handles multimedia content retrieval from database
 */

import db from "../../database/db.js";

/**
 * Gets a specific content by ID with its thumbnail
 * @param {string} contentId - Content ID to retrieve
 * @returns {Promise<Object>} Content data with thumbnail
 * @throws {Error} If content not found or database error
 */
export async function getContentById(contentId) {
  const query = `
    SELECT 
      c.IDContenido,
      c.IDMultimedia,
      c.nombre,
      c.descripcion,
      c.tipo,
      c.tipoMembresia,
      c.createdAt,
      t.IDMultimedia as thumbnailMultimedia
    FROM contenido c
    LEFT JOIN contenido t ON t.nombre = c.nombre
                          AND t.eliminado = 0
                          AND t.deletedAt IS NULL
                          AND t.tipo = 'imagen'
    WHERE c.IDContenido = ?
      AND c.eliminado = 0
      AND c.deletedAt IS NULL
      AND c.tipo IN ('video', 'articulo')
    LIMIT 1
  `;

  try {
    const [rows] = await db.query(query, [contentId]);

    if (rows.length === 0) {
      throw new Error("Content not found");
    }

    return rows[0];
  } catch (error) {
    if (error.message === "Content not found") {
      throw error;
    }
    console.error("Database error in getContentById:", error);
    throw new Error("Database error");
  }
}

/**
 * Gets all available content for sidebar/carousel with thumbnails and pagination
 * @param {number} limit - Number of content items per page (default: 10)
 * @param {number} offset - Number of content items to skip (default: 0)
 * @param {string|null} type - Filter by content type ('video' or 'article')
 * @returns {Promise<Object>} Object with content array and total count
 * @throws {Error} If database error
 */
export async function getAvailableContent(limit = 10, offset = 0, type = null) {
  let typeFilter = "AND c.tipo IN ('video', 'articulo')";
  const params = [];

  if (type) {
    typeFilter = "AND c.tipo = ?";
    params.push(type);
  }

  const countQuery = `
    SELECT COUNT(*) as total
    FROM contenido c
    WHERE c.eliminado = 0
      AND c.deletedAt IS NULL
      ${typeFilter}
  `;

  const contentQuery = `
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
      AND (
        (c.tipo = 'video')
        OR
        (c.tipo = 'articulo')
      )
    WHERE c.eliminado = 0
      AND c.deletedAt IS NULL
      ${typeFilter}
    ORDER BY c.createdAt DESC
    LIMIT ? OFFSET ?
  `;

  try {
    const [[{ total }]] = await db.query(countQuery, params);
    const [rows] = await db.query(contentQuery, [...params, limit, offset]);

    return {
      content: rows,
      total,
      hasMore: offset + limit < total,
    };
  } catch (error) {
    console.error("Database error in getAvailableContent:", error);
    throw new Error("Database error");
  }
}

/**
 * Creates new content in the database
 * @param {Object} contentData - Content data to insert
 * @param {string} contentData.nombre - Content name
 * @param {string} contentData.descripcion - Content description
 * @param {string} contentData.tipo - Content type (video, articulo, imagen, etc.)
 * @param {string} contentData.IDMultimedia - S3 key for the multimedia file
 * @param {string} [contentData.tipoMembresia] - Membership type (Básico, Estándar, Premium)
 * @returns {Promise<number>} Inserted content ID
 * @throws {Error} If database error
 */
export async function createContent(contentData) {
  const query = `
    INSERT INTO contenido (
      nombre,
      descripcion,
      tipo,
      IDMultimedia,
      tipoMembresia,
      eliminado,
      createdAt
    ) VALUES (?, ?, ?, ?, ?, 0, NOW())
  `;

  try {
    const [result] = await db.query(query, [
      contentData.nombre,
      contentData.descripcion,
      contentData.tipo,
      contentData.IDMultimedia,
      contentData.tipoMembresia || null,
    ]);

    return result.insertId;
  } catch (error) {
    console.error("Database error in createContent:", error);
    throw new Error("Database error");
  }
}

/**
 * Creates a relationship between content and role
 * @param {number} contentId - Content ID
 * @param {number} roleId - Role ID
 * @returns {Promise<void>}
 * @throws {Error} If database error
 */
export async function assignContentToRole(contentId, roleId) {
  // Check if the relationship table exists, if not, we'll skip this for now
  // This would require a contenido_roles table
  const query = `
    INSERT IGNORE INTO contenido_roles (IDContenido, IDRol)
    VALUES (?, ?)
  `;

  try {
    await db.query(query, [contentId, roleId]);
  } catch (error) {
    // If table doesn't exist, just log a warning
    console.warn("Could not assign content to role - table may not exist:", error.message);
  }
}

/**
 * Gets role name by role ID
 * @param {number} roleId - Role ID
 * @returns {Promise<string|null>} Role name or null if not found
 * @throws {Error} If database error
 */
export async function getRoleName(roleId) {
  const query = `
    SELECT nombre
    FROM rol
    WHERE IDRol = ?
      AND deletedAt IS NULL
      AND eliminado = 0
    LIMIT 1
  `;

  try {
    const [rows] = await db.query(query, [roleId]);
    return rows.length > 0 ? rows[0].nombre : null;
  } catch (error) {
    console.error("Database error in getRoleName:", error);
    return null;
  }
}
