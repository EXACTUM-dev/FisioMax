/**
 * @fileoverview User Context for caching user data and role
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { API_CONFIG, buildApiUrl } from '../config/api';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
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
        setState({
          isLoading: false,
          existsInDB: false,
          userData: null,
          error: err.message || 'Error al verificar usuario',
        });
      }
    }

    fetchUserData();
  }, [isLoaded, isSignedIn]); // Removed getToken from dependencies

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
