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
 * @param {string|number} userId - Database user ID to fetch the certificate for
 * @param {string} token - Clerk auth token
 * @returns {Promise<string|null>} Presigned URL to the certificate PDF or null
 */
export async function getMembershipCertificate(userId, token) {
  if (!userId) return null;

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const resp = await fetch(`${API_URL}/users/certificate/${userId}`, {
      method: "GET",
      headers
    });

    if (!resp.ok) {
      console.warn(`Certificate not found for user ${userId}`);
      return null;
    }

    const body = await resp.json();

    // Extract certificate URL from response
    if (body.success && body.data && body.data.certificado) {
      return body.data.certificado;
    }

    return null;
  } catch (err) {
    console.error(`Error fetching certificate for user ${userId}:`, err.message);
    return null;
  }
}
