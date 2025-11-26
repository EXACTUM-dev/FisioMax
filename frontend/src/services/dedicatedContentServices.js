/**
 * @fileoverview Services for dedicated content pages (videos, articles, books, podcasts)
 * @version 0.1.0
 * @author EXACTUM-dev
 * @description Handles fetching and filtering content for specialized pages
 */

import { fetchWithClerk } from "../utils/api";

/**
 * Fetches content for a specific type with pagination
 * @param {string} token - Authentication token
 * @param {string} contentType - Type of content ('video', 'articulo', 'libro', 'podcast')
 * @param {number} limit - Number of items per page
 * @param {number} offset - Pagination offset
 * @param {string} searchTerm - Search query
 * @param {string} sortBy - Sort criteria ('newest', 'oldest', 'alphabetical')
 * @returns {Promise<Object>} Content data with pagination info
 */
export async function getDedicatedContent(
  token,
  contentType,
  limit = 12,
  offset = 0,
  searchTerm = "",
  sortBy = "newest"
) {
  try {
    const params = new URLSearchParams({
      tipo: contentType,
      limit: limit.toString(),
      offset: offset.toString(),
      sortBy: sortBy,
    });

    if (searchTerm && searchTerm.trim()) {
      params.append("search", searchTerm.trim());
    }

    const response = await fetchWithClerk(
      `/api/content/available?${params.toString()}`,
      { method: "GET" },
      token
    );

    return {
      content: response.content || [],
      total: response.total || 0,
      hasMore: response.hasMore || false,
      currentOffset: offset,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Searches content within a specific type
 * @param {string} token - Authentication token
 * @param {string} contentType - Type of content
 * @param {string} searchTerm - Search query
 * @returns {Promise<Array>} Search results
 */
export async function searchDedicatedContent(token, contentType, searchTerm) {
  try {
    const params = new URLSearchParams({
      tipo: contentType,
      search: searchTerm,
      limit: "50", // Show more results for search
    });

    const response = await fetchWithClerk(
      `/api/content/available?${params.toString()}`,
      { method: "GET" },
      token
    );

    return response.content || [];
  } catch (error) {
    throw error;
  }
}
