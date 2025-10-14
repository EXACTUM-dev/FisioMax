/**
 * @fileoverview Function to fetch user names from the database model.
 * Executes a query to the database and returns user names.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import { dbPool } from "../../config.js";

/**
 * Fetches user names from the database.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Sends a JSON response with user names or an error message.
 */
export async function getUsuarios(req, res) {
  try {
    const [rows] = await dbPool.query(
        "SELECT nombres, apellidoP, apellidoM FROM usuario"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al consultar la base de datos:", error);
    res.status(500).json({ error: "Error al consultar la base de datos" });
  }
}
