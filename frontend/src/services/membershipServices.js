/**
 * @fileoverview Service for membership application operations.
 * Provides functionality to manage membership applications via API calls.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import { apiClient, normalizeNetworkError } from "./api";

/**
 * Deletes a membership application (soft-delete) by making an API call to the backend.
 *
 * Sends a DELETE request to the `/membership-applications/:id` endpoint with the ID.
 * Requires an authentication token to authorize the operation.
 *
 * @async
 * @param {string|number} id The unique identifier of the membership application to delete.
 * @param {string} token The authentication token for API authorization.
 * @throws {Error} Throws a normalized network error if the request fails.
 * @return {Promise<Object>} The response from the API client.
 */
export async function deleteMembership(id, token) {
    try {
        return await apiClient.delete(`/membership-applications/${id}`, {}, token);
    } catch (err) {
        throw normalizeNetworkError(err);
    }
}
