/**
 * @fileoverview Statistics model for membership reports
 * @version 0.1.0
 * @author EXACTUM-dev
 * @description Handles database queries for membership statistics: residence locations, membership categories, and education levels
 */

import { dbPool } from "../../config.js";

/**
 * Gets the top 5 most frequent states from the usuario table
 * @param {string|null} startDate - Optional start date filter (YYYY-MM-DD)
 * @param {string|null} endDate - Optional end date filter (YYYY-MM-DD)
 * @returns {Promise<Array<Object>>} Array of objects with label (state name) and value (count)
 */
export async function getResidenceStatistics(startDate = null, endDate = null) {
  try {
    let query = `
      SELECT 
        estado as label,
        COUNT(*) as value
      FROM usuario u
      INNER JOIN membresia m ON u.IDUsuario = m.IDUsuario
      WHERE u.eliminado = 0 
        AND u.deletedAt IS NULL
        AND m.deletedAt IS NULL
        AND m.aceptado = 1
        AND u.estado IS NOT NULL
        AND u.estado != ''
        AND u.estado != 'NULL'
    `;

    const params = [];

    // Add date filters if provided
    if (startDate) {
      query += ` AND DATE(m.createdAt) >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND DATE(m.createdAt) <= ?`;
      params.push(endDate);
    }

    query += `
      GROUP BY estado
      ORDER BY value DESC
      LIMIT 5
    `;

    const [rows] = await dbPool.query(query, params);
    
    return rows.map(row => ({
      label: row.label || "Sin especificar",
      value: parseInt(row.value) || 0
    }));
  } catch (error) {
    console.error("Error al obtener estadísticas de residencia:", error);
    throw error;
  }
}

/**
 * Gets membership category statistics
 * @param {string|null} startDate - Optional start date filter (YYYY-MM-DD)
 * @param {string|null} endDate - Optional end date filter (YYYY-MM-DD)
 * @returns {Promise<Array<Object>>} Array of objects with label (category name) and value (count)
 */
export async function getCategoryStatistics(startDate = null, endDate = null) {
  try {
    let query = `
      SELECT 
        m.tipo as label,
        COUNT(*) as value
      FROM membresia m
      INNER JOIN usuario u ON m.IDUsuario = u.IDUsuario
      WHERE m.deletedAt IS NULL
        AND u.eliminado = 0
        AND u.deletedAt IS NULL
        AND m.aceptado = 1
        AND m.tipo IS NOT NULL
        AND m.tipo != ''
    `;

    const params = [];

    // Add date filters if provided
    if (startDate) {
      query += ` AND DATE(m.createdAt) >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND DATE(m.createdAt) <= ?`;
      params.push(endDate);
    }

    query += `
      GROUP BY m.tipo
      ORDER BY value DESC
      LIMIT 5
    `;

    const [rows] = await dbPool.query(query, params);
    
    return rows.map(row => ({
      label: row.label || "Sin especificar",
      value: parseInt(row.value) || 0
    }));
  } catch (error) {
    console.error("Error al obtener estadísticas de categoría:", error);
    throw error;
  }
}

/**
 * Gets education level statistics
 * @param {string|null} startDate - Optional start date filter (YYYY-MM-DD)
 * @param {string|null} endDate - Optional end date filter (YYYY-MM-DD)
 * @returns {Promise<Array<Object>>} Array of objects with label (education level) and value (count)
 */
export async function getEducationStatistics(startDate = null, endDate = null) {
  try {
    let query = `
      SELECT 
        u.licenciatura as label,
        COUNT(*) as value
      FROM usuario u
      INNER JOIN membresia m ON u.IDUsuario = m.IDUsuario
      WHERE u.eliminado = 0 
        AND u.deletedAt IS NULL
        AND m.deletedAt IS NULL
        AND m.aceptado = 1
        AND u.licenciatura IS NOT NULL
        AND u.licenciatura != ''
        AND u.licenciatura != 'NULL'
    `;

    const params = [];

    // Add date filters if provided
    if (startDate) {
      query += ` AND DATE(m.createdAt) >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND DATE(m.createdAt) <= ?`;
      params.push(endDate);
    }

    query += `
      GROUP BY u.licenciatura
      ORDER BY value DESC
      LIMIT 5
    `;

    const [rows] = await dbPool.query(query, params);
    
    return rows.map(row => ({
      label: row.label || "Sin especificar",
      value: parseInt(row.value) || 0
    }));
  } catch (error) {
    console.error("Error al obtener estadísticas de educación:", error);
    throw error;
  }
}

