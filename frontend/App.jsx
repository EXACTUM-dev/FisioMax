/**
 * @fileoverview App router: Protect routes and mounts Hero as the main page
 * @author EXACTUM-dev
 * @version 1.0.0
 */

import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";
import ProtectedRoute from "./src/components/ProtectedRoute";
import FormField from "./src/molecules/form";
import {
  userFormFields,
  getHeroSlides,
  getRowSlides,
  getProducts,
  getUsers,
  getRoles,
  getSideSlides,
} from "./src/data/mockApi";
import Carousel from "./src/organisms/carousel";
import { Title2 } from "./src/atoms/typography";
import Sidebar from "./src/molecules/sidebar";
import Button from "./src/atoms/button";
import DataSwitchContainer from "./src/organisms/dataSwitchContainer";
import buildUserActionsColumns from "./src/data/tableTemplates/userActionsColumns";
import buildRolePermissionsColumns from "./src/data/tableTemplates/rolePermissionsColumns";

// Pages
import Hero from "./src/pages/hero";
import LoginPage from "./src/pages/login";
import RegisterPage from "./src/pages/register";
import VideoPage from "./src/pages/video";
import EmailPage from "./src/pages/email";
import MembershipApplicationPage from "./src/pages/membershipApplication";

// Protected routes with Clerk (only login use Clerk)
import ProfilePage from "./src/pages/profile";
import Panel from "./src/pages/panel";
import RolesPage from "./src/pages/roles";

// Dashboard component
function Dashboard() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [current, setCurrent] = useState("home");
  const navigate = useNavigate();

  // Form state
  const [formValues, setFormValues] = useState(() => {
    const initial = {};
    userFormFields.forEach((f) => {
      initial[f.name] = "";
    });
    return initial;
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // Data status
  const [heroSlides, setHeroSlides] = useState([]);
  const [rowSlides, setRowSlides] = useState([]);
  const [products, setProducts] = useState({ columns: [], rows: [] });
  const [userRows, setUserRows] = useState([]);
  const [roleRows, setRoleRows] = useState([]);
  const [sideSlides, setSideSlides] = useState([]);

  // Backend's Fetch
  useEffect(() => {
    if (isSignedIn && user) {
      fetch("/api/usuarios")
        .then((res) => res.json())
        .then((data) => {
          console.log("Usuarios desde backend:", data);
        })
        .catch((err) => console.error("Error al obtener usuarios:", err));
    }
  }, [user, isSignedIn]);

  // Load mock data
  useEffect(() => {
    let alive = true;
    Promise.all([
      getHeroSlides(),
      getRowSlides(),
      getProducts(),
      getUsers(),
      getRoles(),
      getSideSlides(),
    ]).then(([hero, row, prod, users, roles, side]) => {
      if (!alive) return;
      setHeroSlides(hero);
      setRowSlides(row);
      setProducts(prod);
      setUserRows(users);
      setRoleRows(roles);
      setSideSlides(side);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Table's columns
  const userColumns = useMemo(
    () =>
      buildUserActionsColumns({
        onOpenDocument: (row) => {
          const url = row?.documentos?.url;
          if (url) window.open(url, "_blank", "noopener,noreferrer");
        },
        onAccept: () => {},
        onDelete: (row) =>
          setUserRows((prev) => prev.filter((r) => r.id !== row.id)),
      }),
    []
  );

  const roleColumns = useMemo(
    () =>
      buildRolePermissionsColumns({
        onEdit: () => {},
        onDelete: (row) =>
          setRoleRows((prev) => prev.filter((r) => r.id !== row.id)),
      }),
    []
  );

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                FisioMax Dashboard
              </h1>
              {user && (
                <p className="text-sm text-gray-600 mt-1">
                  Bienvenido,{" "}
                  {user.firstName || user.emailAddresses[0].emailAddress}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <UserButton
                afterSignOutUrl="/login"
                appearance={{
                  elements: {
                    avatarBox: "h-10 w-10",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </header>

      <Sidebar current={current} onNavigate={setCurrent} />

      <main className="p-4 space-y-8 md:ml-[var(--sb-w,80px)] transition-[margin] duration-300 ease-in-out pb-20 md:pb-4">
        <Carousel slides={heroSlides} variant="hero" />

        <div className="max-w-[70rem] mx-auto">
          <Title2 className="mt-6 mb-3">Weekly Articles</Title2>
        </div>

        <Carousel slides={rowSlides} variant="row" />

        <DataSwitchContainer
          initialKey="users"
          views={[
            {
              key: "users",
              label: "Users",
              type: "table",
              columns: userColumns,
              rows: userRows,
              searchPlaceholder: "Search users...",
            },
            {
              key: "roles",
              label: "Roles & Permissions",
              type: "table",
              columns: roleColumns,
              rows: roleRows,
              searchPlaceholder: "Search roles...",
            },
          ]}
        />

        <div className="max-w-[70rem] mx-auto">
          <div className="flex justify-center py-6">
            <Button
              size="sm"
              label="Solicitar Membresía SOMEFIPP"
              onClick={() => navigate("/solicitud-membresia")}
            />
          </div>
        </div>

        <div className="max-w-md mx-auto">
          {userFormFields.map((field) => (
            <FormField
              key={field.name}
              label={field.label}
              name={field.name}
              type={field.type}
              value={formValues[field.name]}
              onChange={handleFormChange}
              placeholder={field.placeholder}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

// App component with routes
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/solicitud-membresia"
        element={<MembershipApplicationPage />}
      />
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
        path="/panel"
        element={
          <ProtectedRoute>
            <Panel />
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
      <Route
        path="/"
        element={
          <ProtectedRoute>
            {/* Unique call to dashboard: Hero */}
            <Hero />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
