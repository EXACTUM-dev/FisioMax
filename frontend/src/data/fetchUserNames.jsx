/**
 * @fileoverview Function to fetch user names from the model.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import React from "react";

/**
 * Fetches user names from the backend model.
 * Makes a request to the users endpoint and returns full names.
 * @returns {Promise<Array<string>>} List of full user names.
 */
export async function fetchUserNames() {
  try {
    const response = await fetch("/api/users"); // Endpoint that consumes the model
    const data = await response.json();
    return data.map((user) => `${user.nombres} ${user.apellidoP} ${user.apellidoM}`);
  } catch (error) {
    console.error("Error al obtener los datos del modelo:", error);
    return ["Error al cargar nombres"];
  }
}