/**
 * @fileoverview Content model for multimedia retrieval
 * @version 0.4.0
 * @author EXACTUM-dev
 * @description Handles multimedia content retrieval from database
 */

import db from "../../database/db.js";

/**
 * Valid content types that can be displayed
 * @constant {string[]}
 */
const DISPLAYABLE_CONTENT_TYPES = [
  "video",
  "articulo",
  "podcast",
  "libro",
  "descuento",
];

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
      AND c.tipo IN (?)
    LIMIT 1
  `;

  try {
    const [rows] = await db.query(query, [
      contentId,
      DISPLAYABLE_CONTENT_TYPES,
    ]);

    if (rows.length === 0) {
      throw new Error("Content not found");
    }

    return rows[0];
  } catch (error) {
    if (error.message === "Content not found") {
      throw error;
    }
    throw new Error("Database error");
  }
}

/**
 * Gets all available content for sidebar/carousel with thumbnails, pagination, search and sorting
 * @param {number} limit - Number of content items per page (default: 10)
 * @param {number} offset - Number of content items to skip (default: 0)
 * @param {string|null} type - Filter by content type (must be in DISPLAYABLE_CONTENT_TYPES)
 * @param {string|null} searchTerm - Search term for filtering by name or description
 * @param {string} sortBy - Sort order ('newest', 'oldest', 'alphabetical')
 * @returns {Promise<Object>} Object with content array and total count
 * @throws {Error} If database error or invalid type
 */
export async function getAvailableContent(
  limit = 10,
  offset = 0,
  type = null,
  searchTerm = null,
  sortBy = "newest"
) {
  let typeFilter = "AND c.tipo IN (?)";
  let params = [DISPLAYABLE_CONTENT_TYPES];

  // If specific type is requested, validate and use it
  if (type) {
    const normalizedType = type.toLowerCase().trim();

    // Validate that the type is allowed
    if (!DISPLAYABLE_CONTENT_TYPES.includes(normalizedType)) {
      throw new Error(
        `Invalid content type: ${type}. Allowed types: ${DISPLAYABLE_CONTENT_TYPES.join(
          ", "
        )}`
      );
    }

    typeFilter = "AND c.tipo = ?";
    params = [normalizedType];
  }

  // Add search filter if provided
  let searchFilter = "";
  if (searchTerm && searchTerm.trim()) {
    searchFilter = "AND (c.nombre LIKE ? OR c.descripcion LIKE ?)";
    const searchPattern = `%${searchTerm.trim()}%`;
    params.push(searchPattern, searchPattern);
  }

  // Determine sort order
  let orderBy = "ORDER BY c.createdAt DESC"; // Default: newest
  if (sortBy === "oldest") {
    orderBy = "ORDER BY c.createdAt ASC";
  } else if (sortBy === "alphabetical") {
    orderBy = "ORDER BY c.nombre ASC";
  }

  const countQuery = `
    SELECT COUNT(*) as total
    FROM contenido c
    WHERE c.eliminado = 0
      AND c.deletedAt IS NULL
      ${typeFilter}
      ${searchFilter}
  `;

  const contentQuery = `
    SELECT 
      c.IDContenido,
      c.nombre,
      c.descripcion,
      c.tipo,
      c.tipoMembresia,
      c.fechaInicio,
      c.fechaFin,
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
      ${typeFilter}
      ${searchFilter}
    ${orderBy}
    LIMIT ? OFFSET ?
  `;

  try {
    // For count query, we need the same params except limit/offset
    const countParams = searchFilter ? [...params] : params;
    const [[{ total }]] = await db.query(countQuery, countParams);

    // For content query, add limit and offset at the end
    const contentParams = searchFilter
      ? [...params, limit, offset]
      : [...params, limit, offset];
    const [rows] = await db.query(contentQuery, contentParams);

    return {
      content: rows,
      total,
      hasMore: offset + limit < total,
    };
  } catch (error) {
    throw new Error("Database error");
  }
}

/**
 * Creates new content in the database
 * @param {Object} contentData - Content data to insert
 * @param {string} contentData.nombre - Content name
 * @param {string} contentData.descripcion - Content description
 * @param {string} contentData.tipo - Content type (video, articulo, imagen, podcast, documento, descuento)
 * @param {string} contentData.IDMultimedia - S3 key for the multimedia file
 * @param {string} [contentData.tipoMembresia] - Membership type
 * @param {string} [contentData.fechaInicio] - Start date for discounts (YYYY-MM-DD)
 * @param {string} [contentData.fechaFin] - End date for discounts (YYYY-MM-DD)
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
      fechaInicio,
      fechaFin,
      eliminado,
      createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, NOW())
  `;

  // Defensive normalization of inputs
  let tipoMembresia = contentData.tipoMembresia ?? null;
  if (Array.isArray(tipoMembresia)) {
    tipoMembresia = tipoMembresia.join(", ");
  } else if (typeof tipoMembresia === "object" && tipoMembresia !== null) {
    tipoMembresia = String(tipoMembresia);
  }

  // Ensure IDMultimedia is scalar (avoid arrays coming from duplicated form fields)
  let idMultimedia = contentData.IDMultimedia ?? null;
  if (Array.isArray(idMultimedia)) {
    idMultimedia = idMultimedia[0] ?? null;
  } else if (typeof idMultimedia === "object" && idMultimedia !== null) {
    idMultimedia = String(idMultimedia);
  }

  const params = [
    contentData.nombre,
    contentData.descripcion,
    contentData.tipo,
    idMultimedia,
    tipoMembresia || null,
    contentData.fechaInicio || null,
    contentData.fechaFin || null,
  ];

  try {
    // Ensure params length matches the number of placeholders (7)
    if (!Array.isArray(params) || params.length !== 7) {
      throw new Error(
        `Invalid parameter list for createContent; expected 7 params, got ${
          (params && params.length) || 0
        }`
      );
    }

    const [result] = await db.query(query, params);
    return result.insertId;
  } catch (error) {
    throw error;
  }
}

/**
 * Get active discounts (date range inclusive).
 * This returns main discount records (not thumbnails).
 */
export async function getActiveDiscounts() {
  // English: select discounts whose date range includes today
  const sql = `
    SELECT
      c.IDContenido,
      c.IDMultimedia,
      c.nombre,
      c.descripcion,
      c.tipoMembresia,
      c.fechaInicio,
      c.fechaFin,
      c.createdAt
    FROM contenido c
    WHERE c.tipo = 'descuento'
      AND c.eliminado = 0
      AND DATE(c.fechaInicio) <= CURDATE()
      AND DATE(c.fechaFin) >= CURDATE()
    ORDER BY c.createdAt DESC
  `;
  const [rows] = await dbPool.query(sql);
  return rows;
}

/**
 * Assigns content to multiple privileges using the accede table
 * @param {number} contentId - Content ID
 * @param {Array<number>} privilegeIds - Array of privilege IDs
 * @returns {Promise<void>}
 * @throws {Error} If database error
 */
export async function assignContentToPrivileges(contentId, privilegeIds) {
  if (!privilegeIds || privilegeIds.length === 0) {
    return;
  }

  const query = `
    INSERT IGNORE INTO accede (IDContenido, IDPrivilegio)
    VALUES (?, ?)
  `;

  try {
    // Insert each privilege relation
    for (const privilegeId of privilegeIds) {
      await db.query(query, [contentId, privilegeId]);
    }
  } catch (error) {
    throw new Error("Database error");
  }
}

/**
 * Updates content title and description
 * @param {number} contentId - Content ID to update
 * @param {Object} updateData - Data to update
 * @param {string} updateData.nombre - New title
 * @param {string} updateData.descripcion - New description
 * @returns {Promise<Object>} Updated content data
 * @throws {Error} If content not found or database error
 */
export async function updateContent(contentId, updateData) {
  const { nombre, descripcion } = updateData;

  // First check if content exists
  const checkQuery = `
    SELECT IDContenido, nombre, tipo
    FROM contenido
    WHERE IDContenido = ?
      AND eliminado = 0
      AND deletedAt IS NULL
  `;

  try {
    const [existing] = await db.query(checkQuery, [contentId]);

    if (existing.length === 0) {
      throw new Error("Content not found");
    }

    const oldNombre = existing[0].nombre;
    const contentType = existing[0].tipo;

    // Verify it's an editable content type
    if (!DISPLAYABLE_CONTENT_TYPES.includes(contentType)) {
      throw new Error("Content type cannot be edited");
    }

    // Update main content
    const updateQuery = `
      UPDATE contenido 
      SET nombre = ?, descripcion = ?
      WHERE IDContenido = ?
        AND eliminado = 0
        AND deletedAt IS NULL
    `;

    const [updateResult] = await db.query(updateQuery, [
      nombre,
      descripcion,
      contentId,
    ]);

    if (updateResult.affectedRows === 0) {
      throw new Error("Content not found or already deleted");
    }

    // Also update thumbnail with same name if exists
    const updateThumbnailQuery = `
      UPDATE contenido 
      SET nombre = ?, descripcion = ?
      WHERE nombre = ?
        AND tipo = 'imagen'
        AND eliminado = 0
        AND deletedAt IS NULL
    `;

    await db.query(updateThumbnailQuery, [
      nombre,
      `Miniatura de ${nombre}`,
      oldNombre,
    ]);

    // Return updated content
    const [updated] = await db.query(
      `SELECT * FROM contenido WHERE IDContenido = ?`,
      [contentId]
    );

    return updated[0];
  } catch (error) {
    if (
      error.message === "Content not found" ||
      error.message === "Content type cannot be edited" ||
      error.message === "Content not found or already deleted"
    ) {
      throw error;
    }
    throw new Error("Database error");
  }
}

/**
 * Soft deletes content and returns S3 keys for physical deletion
 * @param {number} contentId - Content ID to delete
 * @returns {Promise<Object>} Object with mainKey and thumbnailKey
 * @throws {Error} If content not found or database error
 */
export async function softDeleteContent(contentId) {
  // Get content info including S3 keys
  const selectQuery = `
    SELECT 
      c.nombre,
      c.IDMultimedia as mainKey,
      t.IDMultimedia as thumbnailKey
    FROM contenido c
    LEFT JOIN contenido t 
      ON t.nombre = c.nombre 
      AND t.tipo = 'imagen'
      AND t.eliminado = 0
      AND t.deletedAt IS NULL
    WHERE c.IDContenido = ?
      AND c.eliminado = 0
      AND c.deletedAt IS NULL
      AND c.tipo IN (?)
    LIMIT 1
  `;

  try {
    const [rows] = await db.query(selectQuery, [
      contentId,
      DISPLAYABLE_CONTENT_TYPES,
    ]);

    if (rows.length === 0) {
      throw new Error("Content not found");
    }

    const { nombre, mainKey, thumbnailKey } = rows[0];

    // Soft delete all content with this name (main + thumbnail)
    const updateQuery = `
      UPDATE contenido 
      SET eliminado = 1, deletedAt = NOW()
      WHERE nombre = ?
    `;

    await db.query(updateQuery, [nombre]);

    return { mainKey, thumbnailKey };
  } catch (error) {
    if (error.message === "Content not found") {
      throw error;
    }
    throw new Error("Database error");
  }
}
