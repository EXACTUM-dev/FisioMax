/**
 * @fileoverview Content API service for video requests
 * @version 0.1.0
 * @author EXACTUM-dev
 * @description Handles API calls for video content
 */

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("VITE_API_URL is not defined in environment variables");
}

/**
 * Fetches a specific video by ID
 * @param {string} videoId - Video ID to fetch
 * @param {string} token - Clerk authentication token
 * @returns {Promise<Object>} Video data with signed URL
 */
export async function getVideoById(videoId, token) {
  const response = await fetch(`${API_URL}/videos/${videoId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch video");
  }

  return response.json();
}

/**
 * Fetches all available videos for sidebar with pagination
 * @param {string} token - Clerk authentication token
 * @param {number} limit - Number of videos per page
 * @param {number} offset - Number of videos to skip
 * @returns {Promise<Object>} Object with videos array and pagination info
 */
export async function getAvailableVideos(token, limit = 10, offset = 0) {
  const response = await fetch(
    `${API_URL}/videos?limit=${limit}&offset=${offset}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch videos");
  }

  return response.json();
}
