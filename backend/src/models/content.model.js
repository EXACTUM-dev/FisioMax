/**
 * @fileoverview Content model for multimedia retrieval
 * @version 0.3.0
 * @author EXACTUM-dev
 * @description Handles multimedia content retrieval from database with privilege validation
 */

import db from "../../database/db.js";

/**
 * Gets a specific content by ID with its thumbnail and validates user privileges
 * @param {string} contentId - Content ID to retrieve
 * @param {string[]} userPrivileges - Array of user privilege IDs
 * @returns {Promise<Object>} Content data with thumbnail
 * @throws {Error} If content not found, access denied, or database error
 */
export async function getContentById(contentId, userPrivileges = []) {
  const query = `
    SELECT 
      c.IDContenido,
      c.IDMultimedia,
      c.nombre,
      c.descripcion,
      c.tipo,
      c.tipoMembresia,
      c.createdAt,
      t.IDMultimedia as thumbnailMultimedia,
      GROUP_CONCAT(DISTINCT a.IDPrivilegio) as requiredPrivileges
    FROM contenido c
    LEFT JOIN contenido t ON t.nombre = c.nombre
                          AND t.eliminado = 0
                          AND t.deletedAt IS NULL
                          AND t.tipo = 'imagen'
    LEFT JOIN accede a ON a.IDContenido = c.IDContenido
    WHERE c.IDContenido = ?
      AND c.eliminado = 0
      AND c.deletedAt IS NULL
      AND c.tipo IN ('video', 'articulo')
    GROUP BY c.IDContenido
    LIMIT 1
  `;

  try {
    const [rows] = await db.query(query, [contentId]);

    if (rows.length === 0) {
      throw new Error("Content not found");
    }

    const content = rows[0];

    if (content.requiredPrivileges) {
      const requiredPrivilegesArray = content.requiredPrivileges
        .split(",")
        .map((p) => String(p).trim());
      const userPrivs = (userPrivileges || []).map((p) => String(p).trim());

      const hasAccess = requiredPrivilegesArray.some((reqPriv) =>
        userPrivs.includes(reqPriv)
      );

      if (!hasAccess) {
        throw new Error("Access denied");
      }
    }

    return content;
  } catch (error) {
    if (
      error.message === "Content not found" ||
      error.message === "Access denied"
    ) {
      throw error;
    }
    console.error("Database error in getContentById:", error);
    throw new Error("Database error");
  }
}

/**
 * Gets all available content filtered by user privileges with thumbnails and pagination
 * @param {number} limit - Number of content items per page (default: 10)
 * @param {number} offset - Number of content items to skip (default: 0)
 * @param {string|null} type - Filter by content type ('video' or 'articulo')
 * @param {string[]} userPrivileges - Array of user privilege IDs
 * @returns {Promise<Object>} Object with content array and total count
 * @throws {Error} If database error
 */
export async function getAvailableContent(
  limit = 10,
  offset = 0,
  type = null,
  userPrivileges = []
) {
  let typeFilter = "AND c.tipo IN ('video', 'articulo')";
  const params = [];

  if (type) {
    typeFilter = "AND c.tipo = ?";
    params.push(type);
  }

  let privilegeJoin = "";
  let privilegeWhere = "";

  if (userPrivileges.length > 0) {
    privilegeJoin = "LEFT JOIN accede a ON a.IDContenido = c.IDContenido";
    privilegeWhere = `AND (a.IDPrivilegio IS NULL OR a.IDPrivilegio IN (${userPrivileges
      .map(() => "?")
      .join(",")}))`;
    params.push(...userPrivileges.map((p) => String(p)));
  } else {
    privilegeJoin = "LEFT JOIN accede a ON a.IDContenido = c.IDContenido";
    privilegeWhere = "AND a.IDPrivilegio IS NULL";
  }

  const countQuery = `
    SELECT COUNT(DISTINCT c.IDContenido) as total
    FROM contenido c
    ${privilegeJoin}
    WHERE c.eliminado = 0
      AND c.deletedAt IS NULL
      ${typeFilter}
      ${privilegeWhere}
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
    ${privilegeJoin}
    WHERE c.eliminado = 0
      AND c.deletedAt IS NULL
      ${typeFilter}
      ${privilegeWhere}
    GROUP BY c.IDContenido
    ORDER BY c.createdAt DESC
    LIMIT ? OFFSET ?
  `;

  try {
    const countParams = [...params];
    const [[{ total }]] = await db.query(countQuery, countParams);

    const contentParams = [...params, limit, offset];
    const [rows] = await db.query(contentQuery, contentParams);

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
