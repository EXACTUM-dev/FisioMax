/**
 * @fileoverview User Context for caching user data and role
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { API_CONFIG, buildApiUrl } from '../config/api';
import { sendLoginErrorLog } from '../services/loginLogs.service.js';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const [state, setState] = useState({
    isLoading: true,
    existsInDB: false,
    userData: null,
    error: null,
  });

  useEffect(() => {
    async function fetchUserData() {
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
        let token;
        try {
          token = await getToken();
        } catch (tokenError) {
          /**
           * Log error when failing to obtain Clerk authentication token.
           * @type {Error} tokenError - The error thrown by getToken()
           */
          sendLoginErrorLog({
            usuario: userId,
            codigoError: 'CLERK_TOKEN_ERROR',
            mensajeError: 'Error al obtener token de autenticación de Clerk',
            detalles: {
              message: tokenError?.message,
              endpoint: API_CONFIG.ENDPOINTS.AUTH_PROFILE,
            },
          });
          throw tokenError;
        }

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
          /**
           * User authenticated in Clerk but doesn't exist in database.
           * Log this error for tracking purposes.
           */
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

        if (response.status === 401) {
          /**
           * Unauthorized - invalid or expired authentication token.
           * Log this error for tracking purposes.
           */
          sendLoginErrorLog({
            usuario: userId,
            codigoError: 'CLERK_UNAUTHORIZED',
            mensajeError: 'Token de autenticación inválido o expirado',
            detalles: {
              endpoint: API_CONFIG.ENDPOINTS.AUTH_PROFILE,
              status: response.status,
            },
          });
          throw new Error(`Error de autenticación: ${response.status}`);
        }

        if (!response.ok) {
          /**
           * Error verifying user in the system.
           * Log this error for tracking purposes.
           */
          sendLoginErrorLog({
            usuario: userId,
            codigoError: 'USER_VERIFICATION_ERROR',
            mensajeError: `Error al verificar usuario: ${response.status}`,
            detalles: {
              endpoint: API_CONFIG.ENDPOINTS.AUTH_PROFILE,
              status: response.status,
            },
          });
          throw new Error(`Error al verificar usuario: ${response.status}`);
        }

        const data = await response.json();

        // Check if user data exists
        const userExists = data.success && data.user?.id;

        setState({
          isLoading: false,
          existsInDB: userExists,
          userData: data.user || null,
          error: null,
        });
      } catch (err) {
        console.error('Error verificando usuario en BD:', err);
        /**
         * Only log if not already logged to avoid duplicate entries.
         * @type {Error} err - The error that occurred
         */
        if (!err._logged) {
          sendLoginErrorLog({
            usuario: userId,
            codigoError: 'DB_USER_CHECK_FAILED',
            mensajeError: 'Error al verificar usuario en la base de datos',
            detalles: {
              message: err?.message,
              endpoint: API_CONFIG.ENDPOINTS.AUTH_PROFILE,
            },
          });
          err._logged = true;
        }
        setState({
          isLoading: false,
          existsInDB: false,
          userData: null,
          error: err.message || 'Error al verificar usuario',
        });
      }
    }

    fetchUserData();
  }, [isLoaded, isSignedIn, getToken, userId]); // Added getToken and userId for error logging

  return (
    <UserContext.Provider value={state}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
