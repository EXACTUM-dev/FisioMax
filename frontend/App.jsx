/**
 * @fileoverview App router: Protect routes and mounts pages
 * @author EXACTUM-dev
 * @version 1.1.0
 */

import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import ProtectedRoute from "./src/components/ProtectedRoute";
import { useSessionTimeout } from "./src/hooks/useSessionTimeout";
import SessionExpiredModal from "./src/components/SessionExpiredModal";

// Pages
import HomePage from "./src/pages/homePage";
import LoginPage from "./src/pages/login";
import RegisterPage from "./src/pages/register";
import UploadMultimediaPage from "./src/pages/uploadMultimedia";
import EmailPage from "./src/pages/email";
import MembershipApplicationPage from "./src/pages/membershipApplication";
import ContentPage from "./src/pages/content";
import DedicatedContentPage from "./src/pages/dedicatedContentPage";
import OverviewPage from "./src/overviewPage/overviewPage";

// Protected routes with Clerk (only login use Clerk)
import ProfilePage from "./src/pages/profile";
import Panel from "./src/pages/panel";
import RolesPage from "./src/pages/roles";

// App component with routes
export default function App() {
  const { isSignedIn } = useAuth();

  // Enable session timeout monitoring for authenticated users
  const { showExpiredModal } = useSessionTimeout({
    enabled: isSignedIn,
  });

  return (
    <>
      <SessionExpiredModal open={showExpiredModal} />
      <Routes>
      <Route path="/overview" element={<OverviewPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/solicitud-membresia"
        element={<MembershipApplicationPage />}
      />
      <Route
        path="/content"
        element={
          <ProtectedRoute>
            <ContentPage />
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
        path="/perfil"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:userId"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/panel"
        element={
          <ProtectedRoute
            allowedPrivileges={["Gestión de Usuarios", "Gestión de Membresías"]}
          >
            <Panel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roles"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <RolesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/content/:contentId"
        element={
          <ProtectedRoute>
            <ContentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:contentCategory"
        element={
          <ProtectedRoute>
            <DedicatedContentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/uploadMultimedia"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <UploadMultimediaPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
