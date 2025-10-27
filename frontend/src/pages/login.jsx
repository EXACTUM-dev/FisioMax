/**
 * @fileoverview Login view using Clerk
 * @author EXACTUM-dev 
 * @version 1.0.0
 */
import React from "react";
import { SignIn } from "@clerk/clerk-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center w-full max-w-md">
        {/* Logo/avatar */}
        <div className="flex justify-center mb-[-40px] z-10">
          <img
            src="/SOMEFIPPlogo.png"
            alt="Logo"
            className="w-20 h-20 rounded-full border-4 border-white shadow-lg bg-white"
          />
        </div>
        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 pt-16 w-full">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-1">
              Bienvenido a la SOMEFIPP
            </h2>
          </div>
          {/* Clerk SignIn */}
          <SignIn
            path="/login"
            routing="path"
            signUpUrl="/register"
            afterSignInUrl="/"
            appearance={{
              elements: {
                card: "shadow-none",
                formButtonPrimary: "bg-black hover:bg-gray-800 text-white rounded-md py-2",
                formFieldInput: "border-gray-300 rounded-md",
                formFieldLabel: "text-gray-700 font-medium",
              },
            }}
          />
        </div>
        
        {/* Additional links */}
        <div className="mt-6 text-center text-sm text-gray-600 space-y-2">
          <p>
            ¿No tienes cuenta? {" "}
            <a href="/solicitud-membresia" className="text-blue-600 hover:text-blue-700 font-medium">
              Solicita tu membresía
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}