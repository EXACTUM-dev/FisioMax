/**
 * @fileoverview HomePage API service for multimedia content
 * @version 0.2.0
 * @author EXACTUM-dev
 * @description Handles API calls for HomePage content (videos, articles, books, podcasts)
 */

import { apiClient } from "./api";

/**
 * Fetches all content organized for home page display
 * @param {string} token - Clerk authentication token
 * @returns {Promise<Object>} Object with categorized content arrays
 */
export async function getHomePageContent(token) {
  return apiClient.get("/home", {}, token);
}

/**
 * Searches content across all types
 * @param {string} token - Clerk authentication token
 * @param {string} searchTerm - Search term to filter content
 * @returns {Promise<Object>} Object with search results
 */
export async function searchContent(token, searchTerm) {
  return apiClient.get(
    `/home/search?q=${encodeURIComponent(searchTerm)}`,
    {},
    token
  );
}
