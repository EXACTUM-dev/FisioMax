/**
 * Version: 0.3.4
 * Main component of the FisioMax application with Clerk authentication
 * Handles routing for login, register, video, email and exercises pages with protected route logic
 */

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";

import LoginPage from "./src/pages/login";
import RegisterPage from "./src/pages/register";
import ExerciseTestPage from "./src/pages/exerciseTestPage";
import VideoPage from "./src/pages/video";
import EmailPage from "./src/pages/email";

// ProtectedRoute: if signed in, render children; otherwise, redirect to /login
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

// Minimal protected page showing user info and logout option
function ProtectedLogin() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-semibold text-gray-900">FisioMax</h1>
            <UserButton afterSignOutUrl="/login" />
          </div>
        </div>
      </header>

      <main className="p-6">
        {user && (
          <p className="text-gray-700">
            Welcome, {user.firstName || user.emailAddresses?.[0]?.emailAddress}
          </p>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/video" element={<VideoPage />} />
      <Route path="/email" element={<EmailPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ProtectedLogin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exercises"
        element={
          <ProtectedRoute>
            <ExerciseTestPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
