/**
 * @fileoverview Hook to verify if authenticated user exists in the database.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import {useState, useEffect} from 'react';
import {useAuth} from '@clerk/clerk-react';
import {API_CONFIG, buildApiUrl} from '../config/api';

/**
 * Custom hook that verifies if the Clerk authenticated user
 * also exists in the system database.
 *
 * @return {Object} User state in DB.
 * @return {boolean} return.isLoading - If data is loading.
 * @return {boolean} return.existsInDB - If user exists in DB.
 * @return {Object|null} return.userData - User data from DB.
 * @return {string|null} return.error - Error message if any.
 */
export function useDbUser() {
  const {getToken, isLoaded, isSignedIn} = useAuth();
  const [state, setState] = useState({
    isLoading: true,
    existsInDB: false,
    userData: null,
    error: null,
  });

  useEffect(() => {
    /**
     * Checks if the user exists in the database.
     * @async
     */
    async function checkUserInDB() {
      // If Clerk hasn't loaded or user is not authenticated, do nothing
      if (!isLoaded) {
        return;
      }

      if (!isSignedIn) {
        setState({
          isLoading: false,
          existsInDB: false,
          userData: null,
          error: null,
        });
        return;
      }

      try {
        // Get Clerk token
        const token = await getToken();

        // Query backend endpoint
        const response = await fetch(
            buildApiUrl(API_CONFIG.ENDPOINTS.AUTH_PROFILE),
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
        );

        if (response.status === 403) {
          // User authenticated in Clerk but doesn't exist in DB
          setState({
            isLoading: false,
            existsInDB: false,
            userData: null,
            error: 'Usuario no registrado en la base de datos',
          });
          return;
        }

        if (!response.ok) {
          throw new Error(`Error al verificar usuario: ${response.status}`);
        }

        const data = await response.json();

        setState({
          isLoading: false,
          existsInDB: data.success && data.user?.dbData !== null,
          userData: data.user,
          error: null,
        });
      } catch (err) {
        console.error('Error verificando usuario en BD:', err);
        setState({
          isLoading: false,
          existsInDB: false,
          userData: null,
          error: err.message || 'Error al verificar usuario',
        });
      }
    }

    checkUserInDB();
  }, [isLoaded, isSignedIn, getToken]);

  return state;
}
