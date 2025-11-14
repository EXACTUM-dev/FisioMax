import { buildApiUrl, API_CONFIG } from "../config/api";

/**
 * Sends a login error log to the backend.
 * Does not throw exceptions to avoid interrupting the UI flow.
 * Logs errors to console for debugging purposes.
 *
 * @param {Object} payload - Login error data to send
 * @param {string|null} [payload.usuario] - User identifier
 * @param {string|null} [payload.ipOrigen] - Source IP address
 * @param {string|null} [payload.codigoError] - Error code
 * @param {string} payload.mensajeError - Error message (required)
 * @param {Object|string|null} [payload.detalles] - Additional error details
 * @returns {Promise<void>}
 */
export async function sendLoginErrorLog(payload) {
  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.LOGS_LOGIN_ERRORS), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agenteUsuario: navigator.userAgent,
        ...payload,
      }),
    });

    // Check if the request was successful
    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch {
        // If response is not JSON, use empty object
      }
    
      return;
    }

    // Optionally log success in development
    if (process.env.NODE_ENV === "development") {
      try {
        const result = await response.json();
        console.debug("Login error log sent successfully:", result);
      } catch {
        // If response is not JSON, just log success
        console.debug("Login error log sent successfully");
      }
    }
  } catch (error) {
    // Network errors or other fetch failures
    console.error("Failed to send login error log:", error);
  }
}

