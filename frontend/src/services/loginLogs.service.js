import { buildApiUrl, API_CONFIG } from "../config/api";

/**
 * Envía un log de error de login al backend.
 * No lanza excepciones para no interrumpir el flujo de la UI.
 * @param {Object} payload
 * @returns {Promise<void>}
 */
export async function sendLoginErrorLog(payload) {
  try {
    await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.LOGS_LOGIN_ERRORS), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agenteUsuario: navigator.userAgent,
        ...payload,
      }),
    });
  } catch (error) {
    console.error("No se pudo enviar el log de login:", error);
  }
}

