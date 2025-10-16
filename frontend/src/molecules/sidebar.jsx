/**
 * @fileoverview Responsive lateral navigation with self-contained routing + Clerk logout
 * @author EXACTUM-dev
 * @version 1.0.0
 * @description Desktop (expandable on hover) + Mobile (bottom bar)
 */
import React, { useMemo, useState, useEffect } from "react";
import { useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
// Confirmation modal for logout
import ConfirmationModal from "../molecules/confirmationModal";

// Icon resources
import logoSrc from "../assets/icons/SOMEFIPPlogo.png";
import boltSrc from "../assets/icons/bolt.png";
import logoutSrc from "../assets/icons/log-out.png";
import houseSrc from "../assets/icons/house.png";
import profileSrc from "../assets/icons/circle-user-round.png";

// Main sidebar container component
function SidebarContainer({ open, setOpen, children, className = "" }) {
  const width = open ? 224 : 80;

  useEffect(() => {
    requestAnimationFrame(() => {
      document.documentElement.style.setProperty("--sb-w", `${width}px`);
    });
  }, [width]);

  return (
    <aside
      aria-label="Sidebar"
      aria-expanded={open}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className={`hidden md:block fixed left-0 top-0 h-screen bg-[#F5F5F5] border-r border-slate-200 z-40 transition-[width] duration-300 ease-in-out overflow-visible ${className}`}
      style={{ width }}
    >
      {children}
    </aside>
  );
}

// Internal sidebar body component
function SidebarBody({ open, children, className = "" }) {
  const padX = open ? "px-3" : "px-0";
  return (
    <div
      className={`h-full flex flex-col items-stretch py-4 ${padX} ${className}`}
    >
      {children}
    </div>
  );
}

// Individual navigation link component
function SidebarLink({ icon, label, open, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={!open ? label : undefined}
      aria-current={active ? "page" : undefined}
      className="group relative flex h-12 w-full items-center rounded-md hover:bg-slate-200 hover:shadow-sm transition-all duration-200 hover:scale-[1.02]"
    >
      {/* Fixed and centered icon (80px column) */}
      <div className="absolute left-0 w-[80px] h-full flex justify-center items-center">
        <span className="grid place-items-center w-8 h-8">{icon}</span>
      </div>

      {/* Text that appears/disappears with animation */}
      <span
        className={`absolute left-[80px] text-sm text-slate-800 whitespace-pre transition-all duration-300 ease-in-out ${
          open
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-4 pointer-events-none"
        }`}
      >
        {label}
      </span>

      {/* Visual indicator for active element */}
      {active &&
        (open ? (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-1.5 rounded-full bg-brand" />
        ) : (
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-6 rounded-full bg-brand" />
        ))}
    </button>
  );
}

// Main exported component
export default function Sidebar({ current = "home", onNavigate }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(current);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { signOut } = useClerk();
  const navigate = useNavigate();

  useEffect(() => {
    setActive(current);
  }, [current]);

  // Navigation links configuration
  const links = useMemo(
    () => [
      { key: "home", label: "Inicio", icon: houseSrc },
      { key: "bolt", label: "Gestión", icon: boltSrc },
      { key: "profile", label: "Perfil", icon: profileSrc },
      { key: "logout", label: "Cerrar sesión", icon: logoutSrc },
    ],
    []
  );

  // Map keys to routes handled here
  const routeMap = useMemo(
    () => ({
      home: "/",
      profile: "/ajustes/perfil",
      // bolt: "/gestion", // Descomenta si tienes esta ruta
    }),
    []
  );

  const handleNavigate = (key) => {
    if (key === "logout") {
      // Logout con redirección a /login
      setShowLogoutModal(true)
      //signOut({ redirectUrl: "/login" });
      return;
    }

    setActive(key);

    // Navegación propia de la sidebar
    const path = routeMap[key];
    if (path) {
      navigate(path, { replace: key === "home" }); // replace para home si deseas
    }

    // Callback opcional (por compatibilidad)
    onNavigate?.(key);
  };

  // Separation of main links and logout
  const mainLinks = links.filter((l) => l.key !== "logout");
  const logoutLink = links.find((l) => l.key === "logout");

  return (
    <>
      {/* Desktop/Tablet version (left sidebar) */}
      <SidebarContainer open={open} setOpen={setOpen}>
        <SidebarBody open={open} className="justify-between gap-5">
          {/* Top section: Logo + Main links */}
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {/* Centered and stable logo */}
            <div className="relative h-14 mb-4">
              <div className="absolute left-0 w-[80px] h-full flex justify-center items-center">
                <div className="w-12 h-12 grid place-items-center rounded-full ring-1 ring-slate-200 bg-white p-1">
                  <img
                    src={logoSrc}
                    alt="SOMEFIPP"
                    className="w-9 h-9 object-contain"
                  />
                </div>
              </div>
              <span
                className={`absolute left-[80px] h-full flex items-center text-sm font-medium text-slate-900 transition-all duration-300 ease-in-out ${
                  open
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-4 pointer-events-none"
                }`}
              >
                SOMEFIPP
              </span>
            </div>

            {/* Main navigation */}
            <nav className="flex flex-col gap-2">
              {mainLinks.map((l) => (
                <SidebarLink
                  key={l.key}
                  icon={<img src={l.icon} alt="" className="w-6 h-6" />}
                  label={l.label}
                  open={open}
                  active={active === l.key}
                  onClick={() => handleNavigate(l.key)}
                />
              ))}
            </nav>
          </div>

          {/* Bottom section: Logout */}
          {logoutLink && (
            <div className="pt-2 border-t border-slate-200/70">
              <SidebarLink
                icon={<img src={logoutLink.icon} alt="" className="w-6 h-6" />}
                label={logoutLink.label}
                open={open}
                active={active === logoutLink.key}
                onClick={() => handleNavigate(logoutLink.key)}
              />
            </div>
          )}
        </SidebarBody>
      </SidebarContainer>

      {/* Mobile version: bottom bar */}
      <nav
        className="
          md:hidden fixed bottom-0 left-0 right-0 z-40
          bg-[#F5F5F5] border-t border-slate-200
          px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)]
        "
      >
        <ul className="grid grid-cols-4 gap-2">
          {links.map((l) => {
            const isActive = active === l.key;
            return (
              <li key={l.key} className="relative">
                {/* Top indicator for mobile */}
                <span
                  className={`absolute -top-2 left-1/2 -translate-x-1/2 h-1.5 w-6 rounded-full transition-colors ${
                    isActive ? "bg-brand" : "bg-transparent"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => handleNavigate(l.key)}
                  className="w-full py-2 flex flex-col items-center gap-1"
                >
                  <img
                    src={l.icon}
                    alt=""
                    className={`w-6 h-6 ${
                      isActive ? "opacity-100" : "opacity-70"
                    }`}
                  />
                  <span
                    className={`text-[11px] leading-none ${
                      isActive ? "text-slate-900" : "text-slate-500"
                    }`}
                  >
                    {l.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <ConfirmationModal
        open={showLogoutModal}
        title="¿Cerrar sesión?"
        message="¿Estás seguro que deseas cerrar sesión?"
        confirmLabel="Cerrar sesión"
        cancelLabel="Cancelar"
        onConfirm={() => {
          setShowLogoutModal(false);
          signOut({ redirectUrl: "/login" });
        }}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
}
