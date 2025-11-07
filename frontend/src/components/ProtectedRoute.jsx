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
    try {
      await signOut({ redirectUrl: '/login' });
    } catch (error) {
      console.error('Error during sign out:', error);
      // Fallback to manual redirect if signOut fails
      window.location.href = '/login';
    }
  };

  //RBAC Permissions
  const userRole = userData?.role;
  const userState = userData?.accept.aceptado;
  const rejectionReason = userData?.accept.motivoRechazo;
  const userPrivileges = userData?.userPrivileges.privilegios;
  const paymentStatus = userData?.membershipPaymentStatus;
  const membershipRegisteredAt = userData?.membershipRegisteredAt;
  const membershipExpiresAt = userData?.membershipExpiresAt;
  
  // Check if user has required privileges
  const hasPrivileges = allowedPrivileges.length === 0 || allowedPrivileges.some(valor => userPrivileges?.includes(valor));
  
  // Check if user has required role
  const hasRole = allowedRoles.length === 0 || allowedRoles.includes(userRole);
  
  // Check if payment is completed AND membership is within valid date range
  const now = new Date();
  const registeredDate = membershipRegisteredAt ? new Date(membershipRegisteredAt) : null;
  const expiresDate = membershipExpiresAt ? new Date(membershipExpiresAt) : null;
  
  const isWithinMembershipPeriod = registeredDate && expiresDate && 
    now >= registeredDate && now <= expiresDate;
  
  const hasValidPayment = paymentStatus === 'Pagado' && isWithinMembershipPeriod;
  
  // User has permission if they have the required role AND privileges AND their membership is accepted
  // Payment validation is separate to show specific messages
  const hasBasicPermission = userRole !== undefined && hasRole && hasPrivileges && userState === 1;
  const hasPermission = hasBasicPermission && hasValidPayment;

  const isRejected = existsInDB && userState === 0;

  const isPending = existsInDB && (userState === null || userState === undefined);
  
  // Membership expired - payment was made but membership period ended
  const isMembershipExpired = existsInDB && userState === 1 && paymentStatus === 'Pagado' && expiresDate && now > expiresDate;
  
  // Membership not started yet
  const isMembershipNotStarted = existsInDB && userState === 1 && paymentStatus === 'Pagado' && registeredDate && now < registeredDate;
  
  // Payment pending - membership accepted but not paid or expired
  const isPaymentPending = existsInDB && userState === 1 && (paymentStatus !== 'Pagado' || !isWithinMembershipPeriod) && !isMembershipExpired && !isMembershipNotStarted;
  
  // Debug logs
  React.useEffect(() => {
    if (!isDbLoading && isClerkLoaded) {
      console.log('ProtectedRoute Debug:', {
        existsInDB,
        userState,
        paymentStatus,
        hasValidPayment,
        isPaymentPending,
        isMembershipExpired,
        isMembershipNotStarted,
        isPending,
        isRejected,
        hasRole,
        hasPrivileges,
        hasBasicPermission,
        hasPermission,
        allowedRolesLength: allowedRoles.length,
        allowedPrivilegesLength: allowedPrivileges.length,
        now: now.toISOString(),
        registeredDate: registeredDate?.toISOString(),
        expiresDate: expiresDate?.toISOString(),
        userRole,
        userPrivileges
      });
    }
  }, [isDbLoading, isClerkLoaded, existsInDB, userState, paymentStatus, hasValidPayment, isPaymentPending, isMembershipExpired, isMembershipNotStarted]);
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
                  Tip: Revisa tu correo electrónico regularmente para no perderte ninguna actualización.
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
        {/* Payment pending - membership accepted but not paid */}
        {!isDbLoading && isClerkLoaded && isPaymentPending && (
          <Modal open={true} onClose={() => {}} size="md" className="p-6" showCloseButton={false}>
            <div className="text-center">
              <div className="flex justify-center items-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16"
                  style={{ color: '#CAD00F' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <Title2 className="mb-4">No Puedes Acceder a la Aplicación</Title2>
              <p className="text-lg mb-4 font-semibold" style={{ color: '#CAD00F' }}>
                Pago de Membresía Pendiente
              </p>
              <p className="text-base mb-6">
                Tu solicitud de membresía ha sido aprobada, pero aún no se ha completado el pago. 
                Para acceder al sistema es necesario completar el proceso de pago.
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-md p-4 mb-6">
                <p className="text-sm text-orange-800">
                  <strong>Acción requerida:</strong> Contacta al administrador para obtener información sobre cómo realizar tu pago de membresía.
                </p>
              </div>
              <Button
                label="Cerrar Sesión"
                variant="gray"
                fullWidth
                onClick={handleSignOut}
              />
            </div>
          </Modal>
        )}
        
        {/* Membership expired */}
        {!isDbLoading && isClerkLoaded && isMembershipExpired && (
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <Title2 className="mb-4">No Puedes Acceder a la Aplicación</Title2>
              <p className="text-lg mb-4 font-semibold text-red-600">
                Tu Membresía Ha Vencido
              </p>
              <p className="text-base mb-4">
                Tu membresía ha expirado y necesita ser renovada para continuar accediendo al sistema.
              </p>
              {expiresDate && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                  <p className="text-sm text-red-800">
                    <strong>Fecha de vencimiento:</strong> {new Date(membershipExpiresAt).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
              <div className="bg-orange-50 border border-orange-200 rounded-md p-4 mb-6">
                <p className="text-sm text-orange-800">
                  <strong>Acción requerida:</strong> Contacta al administrador para renovar tu membresía y recuperar el acceso.
                </p>
              </div>
              <Button
                label="Cerrar Sesión"
                variant="gray"
                fullWidth
                onClick={handleSignOut}
              />
            </div>
          </Modal>
        )}
        
        {/* Membership not started yet */}
        {!isDbLoading && isClerkLoaded && isMembershipNotStarted && (
          <Modal open={true} onClose={() => {}} size="md" className="p-6" showCloseButton={false}>
            <div className="text-center">
              <div className="flex justify-center items-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-blue-500"
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
              <Title2 className="mb-4">No Puedes Acceder a la Aplicación</Title2>
              <p className="text-lg mb-4 font-semibold text-blue-600">
                Tu Membresía Aún No Ha Comenzado
              </p>
              <p className="text-base mb-4">
                Tu membresía está programada para iniciar próximamente. Podrás acceder al sistema a partir de la fecha de inicio.
              </p>
              {registeredDate && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Fecha de inicio:</strong> {new Date(membershipRegisteredAt).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  Por favor, regresa en la fecha indicada o contacta al administrador si tienes alguna duda.
                </p>
              </div>
              <Button
                label="Cerrar Sesión"
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
          !isPaymentPending &&
          !isMembershipExpired &&
          !isMembershipNotStarted &&
          userState === 1 &&
          !hasPermission && (
            <Navigate to="/" replace />
          )}
        {/* Display protected content if user exists in DB */}
        {!isDbLoading && isClerkLoaded && existsInDB && !isRejected && !isPending && !isPaymentPending && !isMembershipExpired && !isMembershipNotStarted && hasPermission && children}
      </SignedIn>
    </>
  );
}

export default ProtectedRoute;
