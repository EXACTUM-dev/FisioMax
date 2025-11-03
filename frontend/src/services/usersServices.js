/**
 * @fileoverview Service for user operations (delete).
 * Provides functionality to delete users via API calls.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import { apiClient, normalizeNetworkError } from "./api";

/**
 * Deletes a user (soft-delete) by making an API call to the backend.
 *
 * Sends a DELETE request to the `/users/:id` endpoint with the user's ID.
 * Requires an authentication token to authorize the operation.
 *
 * @async
 * @param {string|number} id The unique identifier of the user to delete.
 * @param {string} token The authentication token for API authorization.
 * @throws {Error} Throws a normalized network error if the request fails.
 * @return {Promise<Object>} The response from the API client.
 */
export async function deleteUser(id, token) {
  try {
    return await apiClient.delete(`/users/${id}`, {}, token);
  } catch (err) {
    throw normalizeNetworkError(err);
  }
}
