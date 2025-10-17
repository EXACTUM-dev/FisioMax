/**
 * @fileoverview App router: Protect routes and mounts Hero as the main page
 * @author EXACTUM-dev
 * @version 1.0.0
 */
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";

// Pages
import Hero from "./src/pages/hero";
import LoginPage from "./src/pages/login";
import RegisterPage from "./src/pages/register";
import VideoPage from "./src/pages/video";
import EmailPage from "./src/pages/email";
import ProfilePage from "./src/pages/profile";
import RolesPage from "./src/pages/roles";

// Rutes protected with Clerk
function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <Navigate to="/login" replace />
      </SignedOut>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/video"
        element={
          <ProtectedRoute>
            <VideoPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/email"
        element={
          <ProtectedRoute>
            <EmailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ajustes/perfil/*"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            {/* Unique call to dashboard: Hero */}
            <Hero />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roles"
        element={
          <ProtectedRoute>
            <RolesPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
