/**
 * @fileoverview Vista para el registro de usuarios con Clerk
 * @version 1.0.0
 * @author EXACTUM-dev
 */
import React from "react";
import { SignUp } from "@clerk/clerk-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo o título de la aplicación */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">FisioMax</h1>
          <p className="text-gray-600">Crea tu cuenta nueva</p>
        </div>
        
        {/* Componente SignUp de Clerk */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <SignUp 
            path="/register" 
            routing="path" 
            signInUrl="/login"
            afterSignUpUrl="/"
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
                formFieldLabel: "text-gray-700",
                formFieldInput: "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              }
            }}
          />
        </div>
        
        {/* Enlaces adicionales */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            ¿Ya tienes una cuenta? {" "}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Inicia sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}