/**
 * @fileoverview Content dates model - Database interaction for content dates.
 * @version 0.2.0
 * @author EXACTUM-dev
 * @description Provides functions to update content start and end dates in the database.
 */
import db from "../../database/db.js";

/**
 * Updates fechaInicio and fechaFin for a content row
 * @param {number|string} contentId
 * @param {string|null} fechaInicio - YYYY-MM-DD or null
 * @param {string|null} fechaFin - YYYY-MM-DD or null
 */
export async function updateContentDates(contentId, fechaInicio, fechaFin) {
  const query = `
    UPDATE contenido
    SET fechaInicio = ?, fechaFin = ?
    WHERE IDContenido = ?
      AND eliminado = 0
      AND deletedAt IS NULL
  `;

  try {
    const [result] = await db.query(query, [
      fechaInicio || null,
      fechaFin || null,
      contentId,
    ]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error updating content dates:", error);
    throw new Error("Database error");
  }
}
