/**
 * @fileoverview Protected route component that validates Clerk + DB authentication.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import React from 'react';
import {Navigate, Link} from 'react-router-dom';
import {SignedIn, SignedOut, useUser, useClerk} from '@clerk/clerk-react';
import {useDbUser} from '../hooks/useDbUser';

/**
 * Component that protects routes by requiring:
 * 1. Clerk authentication
 * 2. Database registration
 *
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Content to render if authorized.
 * @return {React.Element} The protected route component.
 */
export function ProtectedRoute({children,  allowedPrivileges = []}) {
  const {isLoaded: isClerkLoaded} = useUser();
  const {isLoading: isDbLoading, existsInDB, userData, error} = useDbUser();
  const {signOut} = useClerk();

  /**
   * Handles user sign out and redirects to login page.
   * @async
   */
  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  //RBAC Permissions
  const userRole = userData?.role;
  const userState = userData?.accept.aceptado;
  const rejectionReason = userData?.accept.motivoRechazo;
  const userPrivileges = userData?.userPrivileges.privilegios;
  const hasPrivileges = allowedPrivileges.some(valor => userPrivileges?.includes(valor));
  const hasPermission =  userRole !== undefined && (allowedPrivileges.length === 0 || hasPrivileges) && userState === 1;

  const isRejected = existsInDB && userState === 0;

  const isPending = existsInDB && (userState === null || userState === undefined);
  return (
    <>
      {/* Redirect to login if not authenticated in Clerk */}
      <SignedOut>
        <Navigate to="/login" replace />
      </SignedOut>

      {/* If authenticated in Clerk */}
      <SignedIn>
        {/* Display loading state while checking */}
        {(isDbLoading || !isClerkLoaded) && (
          <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderBottomColor: '#CAD00F' }}></div>
              <p className="mt-4 text-gray-600">Verificando acceso...</p>
            </div>
          </div>
        )}

        {/* Display unauthorized message if not in DB */}
        {!isDbLoading && isClerkLoaded && !existsInDB && (
          <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Acceso No Autorizado
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Tu cuenta de autenticación está activa, pero no estás
                registrado en la base de datos del sistema.
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Por favor, contacta al administrador para completar tu
                registro.
              </p>
              {error && (
                <p className="text-xs text-red-500 mb-4">Error: {error}</p>
              )}
              <div className="space-y-3">
                <Link
                  to="/solicitud-membresia"
                  className="block w-full bg-[#CAD00F] text-gray-900 rounded-md px-4 py-2 text-sm font-medium hover:bg-[#B3BA0D] transition-colors"
                >
                  Solicitar Membresía
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full bg-gray-100 text-gray-700 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Regresar
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Solicitud pendiente de aprobación */}
        {!isDbLoading && isClerkLoaded && isPending && (
          <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <svg
                  className="h-6 w-6 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Tu solicitud está siendo evaluada
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Por favor, sé paciente.
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Tu solicitud de membresía está siendo revisada por el equipo administrativo.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                <p className="text-xs text-yellow-800">
                  💡 Tip: Revisa tu correo electrónico regularmente para no perderte ninguna actualización.
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="block w-full bg-gray-100 text-gray-700 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Regresar
              </button>
            </div>
          </div>
        )}
        {/* Usuario rechazado */}
        {!isDbLoading && isClerkLoaded && isRejected && (
          <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Solicitud Rechazada
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Tu solicitud fue rechazada por el siguiente motivo:
              </p>
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <p className="text-sm text-red-800 font-medium">
                  {rejectionReason || 'No se proporcionó un motivo específico'}
                </p>
              </div>
              <p className="text-xs text-gray-500 mb-6">
                Si consideras que esto es un error, por favor contacta al administrador.
              </p>
              <button
                onClick={handleSignOut}
                className="block w-full bg-gray-100 text-gray-700 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Regresar
              </button>
            </div>
          </div>
        )}
        {/* Usuario sin permisos */}
        {!isDbLoading &&
          isClerkLoaded &&
          existsInDB &&
          !isRejected &&
          !isPending &&
          userState === 1 &&
          !hasPermission && (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] text-center px-4">
              <div className="max-w-md bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-2 text-gray-900">
                  Acceso restringido
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  No tienes los permisos necesarios para acceder a esta sección.
                </p>
                <button
                  onClick={handleSignOut}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Regresar
                </button>
              </div>
            </div>
          )}
        {/* Display protected content if user exists in DB */}
        {!isDbLoading && isClerkLoaded && existsInDB && !isRejected && !isPending && hasPermission && children}
      </SignedIn>
    </>
  );
}

export default ProtectedRoute;
