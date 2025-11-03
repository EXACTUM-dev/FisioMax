/**
 * @fileoverview Service for user operations (delete).
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import { apiClient, normalizeNetworkError } from "./api";

/**
 * Deletes a user (soft-delete).
 * @param {string|number} id
 * @param {string} token
 */
export async function deleteUser(id, token) {
  try {
    return await apiClient.delete(`/users/${id}`, {}, token);
  } catch (err) {
    throw normalizeNetworkError(err);
  }
}
