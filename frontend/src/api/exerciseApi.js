// frontend/src/api/exerciseApi.js
/**
 * @fileoverview Cliente API para conectar con el backend de ejercicios
 * @version 1.0.0
 * @author EXACTUM-dev
 */

// URL base para las llamadas a la API - se configura automáticamente con el proxy de Vite
const BASE_URL = "/api";

/**
 * Cliente para el API de ejercicios
 */
export const exerciseApi = {
  /**
   * Obtiene todos los ejercicios con filtros opcionales
   * @param {Object} filters - Filtros opcionales (category, difficulty, muscleGroup)
   * @returns {Promise} Promise con los datos
   */
  getAll: async (filters = {}) => {
    try {
      // Construir la URL con los filtros como query params
      let url = `${BASE_URL}/exercises`;
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const queryString = queryParams.toString();
      if (queryString) url += `?${queryString}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Error al obtener ejercicios");
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  /**
   * Obtiene un ejercicio específico por ID
   * @param {number} id - ID del ejercicio
   * @returns {Promise} Promise con los datos
   */
  getById: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/exercises/${id}`);
      if (!response.ok) throw new Error("Error al obtener ejercicio");
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  /**
   * Crea un nuevo ejercicio
   * @param {Object} exerciseData - Datos del ejercicio
   * @returns {Promise} Promise con el ejercicio creado
   */
  create: async (exerciseData) => {
    try {
      const response = await fetch(`${BASE_URL}/exercises`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(exerciseData),
      });

      if (!response.ok) throw new Error("Error al crear ejercicio");
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
};
