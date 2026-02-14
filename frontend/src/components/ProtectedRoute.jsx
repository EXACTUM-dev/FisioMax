/**
 * @fileoverview Protected route component that validates Clerk + DB authentication.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, useUser, useClerk } from '@clerk/clerk-react';
import { useDbUser } from '../hooks/useDbUser';
import Button from '../atoms/button';
import Modal from '../molecules/modal';
import { Title2 } from '../atoms/typography';

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
export function ProtectedRoute({ children, allowedPrivileges = [], allowedRoles = [] }) {
  const { isLoaded: isClerkLoaded } = useUser();
  const { isLoading: isDbLoading, existsInDB, userData, error, applicationStatus } = useDbUser();
  const { signOut } = useClerk();

  /**
   * Handles user sign out and redirects to login page.
   * @async
   */
  const handleSignOut = async () => {
    try {
      await signOut({ redirectUrl: '/login' });
    } catch (error) {
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

  // Add 1 day to expiration date since the expiration date is the last valid day
  const effectiveExpiresDate = expiresDate ? new Date(expiresDate.getTime() + 24 * 60 * 60 * 1000) : null;

  const isWithinMembershipPeriod = registeredDate && effectiveExpiresDate &&
    now >= registeredDate && now < effectiveExpiresDate;

  const hasValidPayment = paymentStatus === 'Pagado' && isWithinMembershipPeriod;

  // User has permission if they have the required role AND privileges AND their membership is accepted
  // Payment validation is separate to show specific messages
  const hasBasicPermission = userRole !== undefined && hasRole && hasPrivileges && userState === 1;
  const hasPermission = hasBasicPermission && hasValidPayment;

  const isRejected = existsInDB && userState === 0;

  const isPending = existsInDB && (userState === null || userState === undefined);

  // Membership expired - payment was made but membership period ended (after expiration date + 1 day)
  const isMembershipExpired = existsInDB && userState === 1 && paymentStatus === 'Pagado' && effectiveExpiresDate && now >= effectiveExpiresDate;

  // Membership not started yet
  const isMembershipNotStarted = existsInDB && userState === 1 && paymentStatus === 'Pagado' && registeredDate && now < registeredDate;

  // Payment pending - membership accepted but not paid or expired
  const isPaymentPending = existsInDB && userState === 1 && (paymentStatus !== 'Pagado' || !isWithinMembershipPeriod) && !isMembershipExpired && !isMembershipNotStarted;

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

        {/* Case 1: User hasn't submitted membership application */}
        {!isDbLoading && isClerkLoaded && !isPending && applicationStatus === 'not_submitted' && (
          <Modal open={true} onClose={() => { }} size="md" className="p-6" showCloseButton={false}>
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <Title2 className="mb-4">Solicitud de Membresía Pendiente</Title2>
              <p className="text-lg mb-4">
                No hemos encontrado una solicitud de membresía asociada a tu cuenta.
              </p>
              <p className="text-base mb-6">
                Para acceder al sistema, primero debes enviar tu solicitud de membresía.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Siguiente paso:</strong> Completa el formulario de solicitud de membresía para que podamos revisar tu aplicación.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  label="Enviar Solicitud"
                  variant="brand"
                  fullWidth
                  onClick={() => window.location.href = '/solicitud-membresia'}
                />
                <Button
                  label="Cerrar Sesión"
                  variant="gray"
                  fullWidth
                  onClick={handleSignOut}
                />
              </div>
            </div>
          </Modal>
        )}
        {/* Case 2: User submitted application but hasn't completed Clerk signup */}
        {!isDbLoading && isClerkLoaded && !isPending && applicationStatus === 'pending_signup' && (
          <Modal open={true} onClose={() => { }} size="md" className="p-6" showCloseButton={false}>
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
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
              <Title2 className="mb-4">Completa tu Registro</Title2>
              <p className="text-lg mb-4 font-semibold text-blue-600">
                Tu solicitud ha sido recibida
              </p>
              <p className="text-base mb-4">
                Hemos encontrado tu solicitud de membresía, pero aún no has completado el proceso de creación de cuenta.
              </p>
              <p className="text-base mb-6">
                Para acceder al sistema, necesitas completar tu registro en nuestra plataforma.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Siguiente paso:</strong> Haz clic en "Crear Cuenta" para completar tu registro y vincular tu solicitud de membresía.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  label="Crear Cuenta"
                  variant="brand"
                  fullWidth
                  onClick={() => window.location.href = '/login?mode=signup'}
                />
                <Button
                  label="Cerrar Sesión"
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
          <Modal open={true} onClose={() => { }} size="md" className="p-6" showCloseButton={false}>
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
          <Modal open={true} onClose={() => { }} size="md" className="p-6" showCloseButton={false}>
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
          <Modal open={true} onClose={() => { }} size="md" className="p-6" showCloseButton={false}>
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
              <Title2 className="mb-4">Aun falta un paso más</Title2>
              <p className="text-lg mb-4 font-semibold" style={{ color: '#CAD00F' }}>
                Pago de Membresía Pendiente
              </p>
              <p className="text-base mb-6">
                Tu solicitud de membresía ha sido aprobada, pero aún no se ha completado el pago.
                Para acceder al sistema es necesario completar el proceso de pago.
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-md p-4 mb-6">
                <p className="text-sm text-orange-800">
                  <strong>Nota:</strong> Revisa tu buzón de correo electrónico para saber como realizar tu pago.
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
          <Modal open={true} onClose={() => { }} size="md" className="p-6" showCloseButton={false}>
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
          <Modal open={true} onClose={() => { }} size="md" className="p-6" showCloseButton={false}>
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
