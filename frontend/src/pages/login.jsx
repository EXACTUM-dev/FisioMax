/**
 * @fileoverview Login page component using Clerk authentication.
 * @author EXACTUM-dev
 * @version 1.0.3
 */
import React, { useEffect, useState } from "react";
import { SignIn, SignUp, useUser, useClerk } from "@clerk/clerk-react";
import { Navigate, useSearchParams } from "react-router-dom";
import { sendLoginErrorLog } from "../services/loginLogs.service.js";
import MembershipInfoModal from "../overviewPage/membershipInfoModal";

/**
 * Login page component that handles user authentication via Clerk.
 * Supports both sign-in and sign-up modes for OAuth providers.
 * Uses URL parameter ?mode=signup to switch between modes.
 *
 * @return {React.Element} The rendered login page component.
 */
export default function LoginPage() {
  const { isSignedIn, isLoaded } = useUser();
  const clerk = useClerk();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "signin";
  const [showMembershipModal, setShowMembershipModal] = useState(false);

  useEffect(() => {
    if (!clerk) return;
    if (mode === "signup" && searchParams.get("fromMembership") === "1") {
      setShowMembershipModal(true);
    }

    const removeListener = clerk.addListener(({ event, payload }) => {
      if (event === "signIn:failed") {
        const identifier =
          payload?.attempt?.identifier ||
          payload?.emailAddress ||
          payload?.identifier ||
          null;

        sendLoginErrorLog({
          usuario: identifier,
          codigoError: payload?.error?.code || "CLERK_SIGNIN_FAILED",
          mensajeError:
            payload?.error?.message || "Intento fallido de inicio de sesión",
          detalles: {
            reason: payload?.reason,
            errors: payload?.errors,
            status: payload?.status,
          },
        });
      }
    });

    return () => {
      if (typeof removeListener === "function") {
        removeListener();
      }
    };
  }, [clerk, mode, searchParams]);

  // Display loading state while authentication status is being determined
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
            style={{ borderBottomColor: "#CAD00F" }}
          ></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Redirect authenticated users to home page
  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  // Display login form for unauthenticated users
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <MembershipInfoModal
        open={showMembershipModal}
        onClose={() => setShowMembershipModal(false)}
        highlightStep={2}
      />
      <div className="flex flex-col items-center w-full max-w-md">
        {/* Logo/Avatar */}
        <div className="flex justify-center mb-[-40px] sm:mb-[-40px] lg:mb-[-30px] z-10">
          <img
            src="/SOMEFIPPlogo.png"
            alt="Logo"
            className="w-20 h-20 rounded-full border-4 border-white shadow-lg bg-white"
          />
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 pt-16 w-full">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-1">
              Bienvenido a la SOMEFIPP
            </h2>
          </div>

          {/* Clerk SignIn/SignUp Component - Dynamic based on mode */}
          <div className="flex justify-center">
            {mode === "signup" ? (
              <SignUp
                path="/login"
                routing="path"
                signInUrl="/login?mode=signin"
                afterSignUpUrl="/"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-none w-full",
                    formButtonPrimary:
                      "bg-black hover:bg-gray-800 text-white rounded-md py-2",
                    socialButtonsBlockButton:
                      "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300",
                    formFieldInput: "border-gray-300 rounded-md",
                    formFieldLabel: "text-gray-700 font-medium",
                    footer: "hidden",
                  },
                }}
              />
            ) : (
              <SignIn
                path="/login"
                routing="path"
                signUpUrl="/login?mode=signup"
                afterSignInUrl="/"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-none w-full",
                    formButtonPrimary:
                      "bg-black hover:bg-gray-800 text-white rounded-md py-2",
                    socialButtonsBlockButton:
                      "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300",
                    formFieldInput: "border-gray-300 rounded-md",
                    formFieldLabel: "text-gray-700 font-medium",
                    footer: "hidden",
                  },
                }}
              />
            )}
          </div>
        </div>

        {/* Additional Links */}
        <div className="mt-6 text-center text-sm text-gray-600 space-y-2 px-4">
          <p>
            ¿No tienes cuenta?{" "}
            <a
              href="/solicitud-membresia"
              className="text-[#CAD00F] hover:text-[#b8bd0d] font-medium transition-colors"
            >
              Solicita tu membresía
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
