/**
 * @fileoverview Header/Navbar component for Overview page
 * @author EXACTUM-dev
 * @version 1.0.0
 */

import React, { useState } from "react";
import Button from "../../atoms/button";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex justify-between items-center flex-nowrap">
          <div className="flex items-center gap-2">
            <img
              src="/SOMEFIPPlogo.png"
              alt="SOMEFIPP Logo"
              className="w-10 h-10 rounded-full"
            />
            <span className="text-xl font-bold text-gray-900">SOMEFIPP</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#benefits" className="text-gray-600 hover:text-gray-900">
              Beneficios
            </a>
            <a href="#about" className="text-gray-600 hover:text-gray-900">
              Acerca de
            </a>
            <a href="#faqs" className="text-gray-600 hover:text-gray-900">
              FAQs
            </a>
          </div>
          <div className="flex items-center gap-3 flex-nowrap">
            <div className="hidden sm:inline-flex">
              <Button
                onClick={() => {
                  navigate("/solicitud-membresia", {
                    state: { showInfoModal: true, fromOverview: true },
                  });
                }}
                variant="brand"
                size="sm"
                className="px-6 py-2 whitespace-nowrap"
                ariaLabel="Unirse a SOMEFIPP"
              >
                Unirse
              </Button>
            </div>

            {/* Login button: smaller on mobile via responsive padding classes */}
            <Button
              onClick={() => navigate("/login?mode=signin")}
              variant="outline"
              size="sm"
              className="px-3 py-1 sm:px-4 sm:py-2 whitespace-nowrap"
              ariaLabel="Iniciar sesión"
            >
              Iniciar sesión
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
}
