// Ejemplo de uso en un controlador o ruta
import { dbPool } from "../../config.js";

export async function getUsuarios(req, res) {
  try {
    const [rows] = await dbPool.query("SELECT * FROM Usuario");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al consultar la base de datos" });
  }
}
