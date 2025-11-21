/**
 * @fileoverview Punto de entrada principal de la aplicación React.
 * @version 1.0.0
 * @author EXACTUM-dev
 *
 * Inicializa la aplicación y verifica la existencia de la Clerk Publishable Key.
 */
import React, { StrictMode } from "react";
import ReactDOM from 'react-dom/client';
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { UserProvider } from "./contexts/UserContext.jsx";
import authConfig from "./config/auth.config.js";
import "../index.css";
import App from "../App.jsx";

/**
 * Clerk Publishable Key obtenida desde las variables de entorno.
 * Lanza un error si la clave no está definida, previniendo la ejecución de la app sin autenticación.
 * @const {string}
 */
const PUBLISHABLE_KEY = authConfig.publishableKey;
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key. Please set VITE_CLERK_PUBLISHABLE_KEY in your .env file.");
}

/**
 * Renderiza la aplicación principal dentro del elemento root del DOM,
 * envolviendo la app con ClerkProvider para la autenticación.
 */
ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
      <ClerkProvider 
        publishableKey={PUBLISHABLE_KEY}
        appearance={{
          variables: { colorPrimary: '#0F172A' }
        }}
        sessionTokenRefreshInSeconds={authConfig.sessionTokenRefreshInSeconds}
      >
        <UserProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </UserProvider>
      </ClerkProvider>
  </StrictMode>
);
