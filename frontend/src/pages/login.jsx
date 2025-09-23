/**
 * @fileoverview Vista para el inicio de sesión con Clerk
 * @version 1.0.0
 * @author EXACTUM-dev
 */
import React from "react";
import { SignIn } from "@clerk/clerk-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo o título de la aplicación */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">FisioMax</h1>
          <p className="text-gray-600">Inicia sesión en tu cuenta</p>
        </div>
        
        {/* Componente SignIn de Clerk */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <SignIn 
            path="/login" 
            routing="path" 
            signUpUrl="/register"
            afterSignInUrl="/"
            appearance={{
              elements: {
                card: "shadow-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "bg-white hover:bg-gray-50 text-gray-600 border border-gray-300",
                dividerLine: "bg-gray-300",
                dividerText: "text-gray-500",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                footerActionLink: "text-blue-600 hover:text-blue-700",
                identityPreviewText: "text-gray-700",
                identityPreviewEditButtonIcon: "text-gray-500",
                formFieldLabel: "text-gray-700",
                formFieldInput: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                otpCodeFieldInput: "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              }
            }}
          />
        </div>
        
        {/* Enlaces adicionales */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            ¿Necesitas ayuda? {" "}
            <a href="/support" className="text-blue-600 hover:text-blue-700 font-medium">
              Contacta soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}