/**
 * @fileoverview Shared helpers to normalize HTTP/network errors across services
 * @version 1.0.0
 * @author EXACTUM-dev
 */

/**
 * Returns true if the error looks like a network connectivity failure.
 * Works with fetch/Axios and proxy ECONNREFUSED.
 * @param {unknown} err
 * @returns {boolean}
 */
export function isNetworkError(err) {
  const msg = String(err?.message ?? "");
  return (
    err?.code === "NETWORK_ERROR" ||
    msg.includes("Failed to fetch") ||
    msg.includes("NetworkError") ||
    msg.includes("Network Error") ||
    msg.includes("ECONNREFUSED")
  );
}

/**
 * Normalizes any low-level network error into a user-friendly Error.
 * Preserves non-network errors as-is.
 * @param {unknown} err
 * @returns {Error}
 */
export function normalizeNetworkError(err) {
  if (isNetworkError(err)) {
    const e = new Error("No hay conexión con el servidor. Intenta más tarde.");
    e.code = "NETWORK_ERROR";
    return e;
  }
  return err instanceof Error ? err : new Error(String(err));
}

/**
 * Maps an Error object to an end-user friendly message.
 * @param {unknown} err
 * @param {string} [fallback="Ocurrió un error. Intenta nuevamente."]
 * @returns {string}
 */
export function toUserMessage(
  err,
  fallback = "Ocurrió un error. Intenta nuevamente."
) {
  if (isNetworkError(err)) {
    return "No hay conexión con el servidor. Intenta más tarde.";
  }
  return String(err?.message || fallback);
}
