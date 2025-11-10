/**
 * @fileoverview Login page component using Clerk authentication.
 * @author EXACTUM-dev
 * @version 1.0.0
 */
import React, {useEffect} from 'react';
import {SignIn, useUser, useClerk} from '@clerk/clerk-react';
import {Navigate} from 'react-router-dom';
import {sendLoginErrorLog} from '../services/loginLogs.service.js';

/**
 * Login page component that handles user authentication via Clerk.
 * Displays a loading state while checking authentication status,
 * redirects authenticated users to the home page, and shows the
 * Clerk SignIn component for unauthenticated users.
 *
 * @return {React.Element} The rendered login page component.
 */
export default function LoginPage() {
  const {isSignedIn, isLoaded} = useUser();
  const clerk = useClerk();

  useEffect(() => {
    if (!clerk) return undefined;

    const removeListener = clerk.addListener(({event, payload}) => {
      if (event === 'signIn:failed') {
        const identifier =
          payload?.attempt?.identifier ||
          payload?.emailAddress ||
          payload?.identifier ||
          null;

        sendLoginErrorLog({
          usuario: identifier,
          codigoError: payload?.error?.code || 'CLERK_SIGNIN_FAILED',
          mensajeError:
              payload?.error?.message || 'Intento fallido de inicio de sesión',
          detalles: {
            reason: payload?.reason,
            errors: payload?.errors,
            status: payload?.status,
          },
        });
      }
    });

    return () => {
      if (typeof removeListener === 'function') {
        removeListener();
      }
    };
  }, [clerk]);

  // Display loading state while authentication status is being determined
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderBottomColor: '#CAD00F' }}></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Redirect authenticated users to home page
  // (ProtectedRoute will handle DB validation)
  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  // Display login form for unauthenticated users
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center w-full max-w-md">
        {/* Logo/Avatar */}
        <div className="flex justify-center mb-[-40px] z-10">
          <img
            src="/SOMEFIPPlogo.png"
            alt="Logo"
            className="w-20 h-20 rounded-full border-4 border-white shadow-lg bg-white"
          />
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 pt-16 w-full">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-1">
              Bienvenido a la SOMEFIPP
            </h2>
          </div>

          {/* Clerk SignIn Component */}
          <SignIn
            path="/login"
            routing="path"
            signUpUrl="/register"
            afterSignInUrl="/"
            appearance={{
              elements: {
                card: 'shadow-none',
                formButtonPrimary:
                    'bg-black hover:bg-gray-800 text-white rounded-md py-2',
                formFieldInput: 'border-gray-300 rounded-md',
                formFieldLabel: 'text-gray-700 font-medium',
              },
            }}
          />
        </div>

        {/* Additional Links */}
        <div className="mt-6 text-center text-sm text-gray-600 space-y-2">
          <p>
            ¿No tienes cuenta?{' '}
            <a
              href="/solicitud-membresia"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Solicita tu membresía
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}