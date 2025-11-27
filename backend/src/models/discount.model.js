/**
 * @fileoverview Discount-specific model functions
 * @version 1.0.0
 * @author EXACTUM-dev
 * @description Handles discount content retrieval and management
 */

import db from "../../database/db.js";

/**
 * Gets active discounts (current date between fechaInicio and fechaFin)
 * @param {string|null} membershipType - Filter by membership type (optional)
 * @returns {Promise<Array>} Array of active discount objects
 * @throws {Error} If database error
 */
export async function getActiveDiscounts(membershipType = null) {
  let query = `
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
    WHERE c.tipo = 'descuento'
      AND c.eliminado = 0
      AND c.deletedAt IS NULL
      AND DATE(c.fechaInicio) <= CURDATE()
      AND DATE(c.fechaFin) >= CURDATE()
  `;

  const params = [];

  if (membershipType) {
    query += ` AND c.tipoMembresia = ?`;
    params.push(membershipType);
  }

  query += ` ORDER BY c.fechaFin ASC`;

  try {
    const [rows] = await db.query(query, params);
    return rows;
  } catch (error) {
    console.error("Error fetching active discounts:", error);
    throw new Error("Database error");
  }
}

/**
 * Gets discounts that start today (for notification purposes)
 * @returns {Promise<Array>} Array of discount objects starting today
 * @throws {Error} If database error
 */
export async function getDiscountsStartingToday() {
  const query = `
    SELECT 
      c.IDContenido,
      c.nombre,
      c.descripcion,
      c.tipoMembresia,
      c.fechaInicio,
      c.fechaFin
    FROM contenido c
    WHERE c.tipo = 'descuento'
      AND c.eliminado = 0
      AND c.deletedAt IS NULL
      AND DATE(c.fechaInicio) = CURDATE()
    ORDER BY c.tipoMembresia
  `;

  try {
    const [rows] = await db.query(query);
    return rows;
  } catch (error) {
    console.error("Error fetching discounts starting today:", error);
    throw new Error("Database error");
  }
}

/**
 * Gets expired discounts (fechaFin < current date) for cleanup
 * @returns {Promise<Array>} Array of expired discount IDs
 * @throws {Error} If database error
 */
export async function getExpiredDiscounts() {
  const query = `
    SELECT IDContenido
    FROM contenido
    WHERE tipo = 'descuento'
      AND eliminado = 0
      AND deletedAt IS NULL
      AND CURDATE() > fechaFin
  `;

  try {
    const [rows] = await db.query(query);
    return rows.map((row) => row.IDContenido);
  } catch (error) {
    console.error("Error fetching expired discounts:", error);
    throw new Error("Database error");
  }
}
