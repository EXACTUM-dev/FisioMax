/**
 * @fileoverview Hook to verify if authenticated user exists in the database.
 * @version 2.0.0
 * @author EXACTUM-dev
 * @description Now uses UserContext for cached data
 */

import { useUser as useUserContext } from '../contexts/UserContext';
import {useState, useEffect} from 'react';
import {useAuth} from '@clerk/clerk-react';
import {API_CONFIG, buildApiUrl} from '../config/api';
import {sendLoginErrorLog} from '../services/loginLogs.service.js';

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
  const {getToken, isLoaded, isSignedIn, userId} = useAuth();
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
          sendLoginErrorLog({
            usuario: userId,
            codigoError: 'DB_USER_NOT_FOUND',
            mensajeError: 'Usuario autenticado en Clerk pero no registrado en la base de datos',
            detalles: {
              endpoint: API_CONFIG.ENDPOINTS.AUTH_PROFILE,
              status: response.status,
            },
          });
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

        sendLoginErrorLog({
          usuario: userId,
          codigoError: 'DB_USER_CHECK_FAILED',
          mensajeError: 'Error al verificar usuario en la base de datos',
          detalles: {
            message: err?.message,
          },
        });
        setState({
          isLoading: false,
          existsInDB: false,
          userData: null,
          error: err.message || 'Error al verificar usuario',
        });
      }
    }

    checkUserInDB();
  }, [isLoaded, isSignedIn, getToken, userId]);

  return state;
}
