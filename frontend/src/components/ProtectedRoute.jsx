/**
 * @fileoverview Protected route component that validates Clerk + DB authentication.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import React from 'react';
import {Navigate, Link} from 'react-router-dom';
import {SignedIn, SignedOut, useUser, useClerk} from '@clerk/clerk-react';
import {useDbUser} from '../hooks/useDbUser';
import Button from '../atoms/button';
import Modal from '../molecules/modal';
import {Title2} from '../atoms/typography';

/**
 * Component that protects routes by requiring:
 * 1. Clerk authentication
 * 2. Database registration
 * 3. Optional: Specific roles or privileges
 *
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Content to render if authorized.
 * @param {Array<string>} props.allowedPrivileges - List of privileges that grant access.
 * @param {Array<string>} props.allowedRoles - List of roles that grant access.
 * @return {React.Element} The protected route component.
 */
export function ProtectedRoute({children, allowedPrivileges = [], allowedRoles = []}) {
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
  
  // Check if user has required privileges
  const hasPrivileges = allowedPrivileges.length === 0 || allowedPrivileges.some(valor => userPrivileges?.includes(valor));
  
  // Check if user has required role
  const hasRole = allowedRoles.length === 0 || allowedRoles.includes(userRole);
  
  // User has permission if they have the required role AND privileges AND their membership is accepted
  const hasPermission = userRole !== undefined && hasRole && hasPrivileges && userState === 1;

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
          <Modal open={true} onClose={() => {}} size="md" className="p-6" showCloseButton={false}>
            <div className="text-center">
              <div className="flex justify-center items-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <Title2 className="mb-4">Acceso No Autorizado</Title2>
              <p className="text-lg mb-4">
                Tu cuenta de autenticación está activa, pero no estás
                registrado en la base de datos del sistema.
              </p>
              <p className="text-lg mb-6">
                Por favor, contacta al administrador para completar tu
                registro.
              </p>
              {error && (
                <p className="text-sm text-red-500 mb-4">Error: {error}</p>
              )}
              <div className="space-y-3">
                <Link to="/solicitud-membresia" className="block w-full">
                  <Button
                    label="Solicitar Membresía"
                    variant="brand"
                    fullWidth
                  />
                </Link>
                <Button
                  label="Regresar"
                  variant="gray"
                  fullWidth
                  onClick={handleSignOut}
                />
              </div>
            </div>
          </Modal>
        )}
        {/* Request pending approval */}
        {!isDbLoading && isClerkLoaded && isPending && (
          <Modal open={true} onClose={() => {}} size="md" className="p-6" showCloseButton={false}>
            <div className="text-center">
              <div className="flex justify-center items-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-yellow-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <Title2 className="mb-4">Tu solicitud está siendo evaluada</Title2>
              <p className="text-lg mb-4">
                Por favor, sé paciente.
              </p>
              <p className="text-lg mb-6">
                Tu solicitud de membresía está siendo revisada por el equipo administrativo.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  💡 Tip: Revisa tu correo electrónico regularmente para no perderte ninguna actualización.
                </p>
              </div>
              <Button
                label="Regresar"
                variant="gray"
                fullWidth
                onClick={handleSignOut}
              />
            </div>
          </Modal>
        )}
        {/* Deny request */}
        {!isDbLoading && isClerkLoaded && isRejected && (
          <Modal open={true} onClose={() => {}} size="md" className="p-6" showCloseButton={false}>
            <div className="text-center">
              <div className="flex justify-center items-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <Title2 className="mb-4">Solicitud Rechazada</Title2>
              <p className="text-lg mb-4">
                Tu solicitud fue rechazada por el siguiente motivo:
              </p>
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <p className="text-base text-red-800 font-medium">
                  {rejectionReason || 'No se proporcionó un motivo específico'}
                </p>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Si consideras que esto es un error, por favor contacta al administrador.
              </p>
              <Button
                label="Regresar"
                variant="gray"
                fullWidth
                onClick={handleSignOut}
              />
            </div>
          </Modal>
        )}
        {/* Usuario sin permisos */}
        {!isDbLoading &&
          isClerkLoaded &&
          existsInDB &&
          !isRejected &&
          !isPending &&
          userState === 1 &&
          !hasPermission && (
            <Modal open={true} onClose={() => {}} size="md" className="p-6" showCloseButton={false}>
              <div className="text-center">
                <div className="flex justify-center items-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <Title2 className="mb-4">Acceso Restringido</Title2>
                <p className="text-lg mb-6">
                  No tienes los permisos necesarios para acceder a esta sección.
                </p>
                <Button
                  label="Regresar"
                  variant="gray"
                  fullWidth
                  onClick={handleSignOut}
                />
              </div>
            </Modal>
          )}
        {/* Display protected content if user exists in DB */}
        {!isDbLoading && isClerkLoaded && existsInDB && !isRejected && !isPending && hasPermission && children}
      </SignedIn>
    </>
  );
}

export default ProtectedRoute;
