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
 * Deletes a specific content by ID
 * @param {string} contentId - Content ID to delete
 * @param {string} token - Clerk authentication token
 * @returns {Promise<Object>} Deletion confirmation
 */
export async function deleteContent(contentId, token) {
  const response = await fetch(`${API_URL}/content/${contentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete content");
  }

  return response.json();
}