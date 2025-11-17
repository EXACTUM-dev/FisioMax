/**
 * @fileoverview Header/Navbar component for Overview page
 * @author EXACTUM-dev
 * @version 1.0.0
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex justify-between items-center">
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
          <button
            onClick={() => {
              navigate("/solicitud-membresia", {
                state: { showInfoModal: true, fromOverview: true },
              });
            }}
            className="bg-[#CAD00F] hover:bg-[#b8bd0d] text-gray-900 font-medium px-6 py-2 rounded-md transition-colors"
          >
            Unirse
          </button>
        </div>
      </nav>
    </header>
  );
}
