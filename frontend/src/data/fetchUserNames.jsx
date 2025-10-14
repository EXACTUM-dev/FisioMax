/**
 * @fileoverview Función para obtener nombres desde el modelo.
 * Realiza una solicitud al endpoint del modelo y devuelve los nombres de los usuarios.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import React from "react";

/**
 * Obtiene los nombres de los usuarios desde el modelo.
 * @returns {Promise<Array<string>>} - Lista de nombres completos de los usuarios.
 */
export async function fetchUserNames() {
  try {
    const response = await fetch("/api/usuarios"); // Endpoint que consume el modelo
    const data = await response.json();
    return data.map((user) => `${user.nombres} ${user.apellidoP} ${user.apellidoM}`);
  } catch (error) {
    console.error("Error al obtener los datos del modelo:", error);
    return ["Error al cargar nombres"];
  }
}