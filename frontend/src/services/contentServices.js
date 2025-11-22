/**
 * @fileoverview Content API service for multimedia content requests
 * @version 0.2.0
 * @author EXACTUM-dev
 * @description Handles API calls for multimedia content (videos and articles)
 */

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("VITE_API_URL no está definida en las variables de entorno");
}

/**
 * Fetches a specific content by ID
 * @param {string} contentId - Content ID to fetch
 * @param {string} token - Clerk authentication token
 * @returns {Promise<Object>} Content data with signed URL
 */
export async function getContentById(contentId, token) {
  const response = await fetch(`${API_URL}/content/${contentId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch content");
  }

  return response.json();
}

/**
 * Fetches all available content for sidebar with pagination
 * @param {string} token - Clerk authentication token
 * @param {number} limit - Number of content items per page
 * @param {number} offset - Number of content items to skip
 * @param {string} type - Type of content ('video' or 'articulo')
 * @returns {Promise<Object>} Object with content array and pagination info
 */
export async function getAvailableContent(
  token,
  limit = 10,
  offset = 0,
  type = null
) {
  let url = `${API_URL}/content?limit=${limit}&offset=${offset}`;
  if (type) {
    url += `&type=${type}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch content");
  }

  return response.json();
}

/**
 * Attempts to fetch a membership certificate URL for a given user.
 * Tries a few possible backend endpoints and response shapes to be resilient.
 * @param {string|number} userId - Database user ID to fetch the certificate for
 * @param {string} token - Clerk auth token
 * @returns {Promise<string|null>} Presigned URL to the certificate PDF or null
 */
export async function getMembershipCertificate(userId, token) {
  if (!userId) return null;

  const endpoints = [
    // possible endpoints (some may not exist depending on backend)
    `${API_URL}/membresias/${userId}`,
    `${API_URL}/membership-applications/${userId}`,
    `${API_URL}/api/membresias/${userId}`,
  ];

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  for (const url of endpoints) {
    try {
      const resp = await fetch(url, { method: "GET", headers });
      if (!resp.ok) continue;
      const body = await resp.json();

      // Different backends may return the payload under `data` or as the body directly
      const payload = body.data || body || {};

      // Common places where certificate URL might be stored
      const candidates = [];
      if (payload.certificado) candidates.push(payload.certificado);
      if (payload.certificate) candidates.push(payload.certificate);
      if (payload.__raw && payload.__raw.certificado)
        candidates.push(payload.__raw.certificado);
      // documentos array may include the certificate as one of the docs
      if (Array.isArray(payload.documentos)) {
        for (const d of payload.documentos) {
          if (
            d.id === "certificado" ||
            /certifica/i.test(d.label || d.nombre || "")
          ) {
            if (d.url) candidates.push(d.url);
            if (d.key) candidates.push(d.key);
          }
        }
      }

      // Try first truthy candidate
      const found = candidates.find(Boolean) || null;
      if (found) return found;
    } catch (err) {
      // ignore and try next
      // console.debug(`Certificate fetch failed for ${url}:`, err.message);
    }
  }

  return null;
}
