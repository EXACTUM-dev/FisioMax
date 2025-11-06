/**
 * @fileoverview Hook to verify if authenticated user exists in the database.
 * @version 2.0.0
 * @author EXACTUM-dev
 * @description Now uses UserContext for cached data
 */

import { useUser as useUserContext } from '../contexts/UserContext';

/**
 * Custom hook that verifies if the Clerk authenticated user
 * also exists in the system database.
 * This now uses the UserContext for cached data.
 *
 * @return {Object} User state in DB.
 * @return {boolean} return.isLoading - If data is loading.
 * @return {boolean} return.existsInDB - If user exists in DB.
 * @return {Object|null} return.userData - User data from DB.
 * @return {string|null} return.error - Error message if any.
 */
export function useDbUser() {
  return useUserContext();
}
