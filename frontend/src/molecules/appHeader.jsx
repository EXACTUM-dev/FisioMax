/**
 * @fileoverview Application header component with user welcome, title and optional search bar
 * @version 0.2.0
 * @author EXACTUM-dev
 * @description Standardized header with optional expandable search functionality for all pages
 */

import React, { useState } from "react";
import { UserButton } from "@clerk/clerk-react";
import SearchBar from "../molecules/searchBar";
import NotificationBell from "../molecules/notificationBell.jsx";

/**
 * AppHeader component with optional expandable search functionality
 * @component
 * @param {Object} props - Component properties
 * @param {Object} [props.user] - User data for display
 * @param {boolean} [props.showSearch=false] - Whether to display search bar
 * @param {string} [props.searchValue=""] - Current search value
 * @param {Function} [props.onSearchChange] - Callback when search value changes
 * @param {string} [props.searchPlaceholder="Buscar..."] - Placeholder text for search input
 * @param {Function} [props.onSearchSubmit] - Callback when search is submitted (Enter key or button)
 * @returns {React.Element} Application header component
 */
export default function AppHeader({
  user,
  showSearch = false,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Buscar...",
  onSearchSubmit,
}) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && onSearchSubmit) {
      onSearchSubmit(searchValue);
      setMobileSearchOpen(false); // Cierra la searchbar en móvil al buscar
    }
  };

  // Desktop header
  const desktopHeader = (
    <header
      className="
        bg-white shadow-sm border-b border-gray-200
        transition-[margin] duration-300 ease-in-out
        md:ml-[var(--sb-w,80px)]
        mb-5 md:mb-6
        hidden sm:block
      "
      style={{ overflow: "clip" }}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4 gap-4">
          {/* Left: welcome message */}
          <div className="text-left min-w-0 flex-shrink-0">
            {user && (
              <p className="text-sm text-gray-600 truncate">
                Bienvenido,{" "}
                {user.firstName || user.emailAddresses?.[0]?.emailAddress}
              </p>
            )}
          </div>
          {/* Center: title */}
          <div className="text-center flex-grow px-4">
            <p className="text-sm sm:text-base font-medium text-gray-800">
              Sociedad Mexicana de Fisioterapia en Piso Pélvico
            </p>
          </div>
          {/* Right: expandable search bar or spacer */}
          <div
            className="flex items-center justify-end flex-shrink-0 relative"
            style={{ width: "40px" }}
          >
            {showSearch && (
              <SearchBar
                value={searchValue}
                onChange={onSearchChange}
                placeholder={searchPlaceholder}
                expandable={true}
                onKeyDown={handleSearchKeyDown}
              />
            )}
          </div>

          {/* notification's button */}
          <NotificationBell />

        </div>
      </div>
    </header>
  );

  // Mobile header
  const mobileHeader = (
    <header className="bg-white shadow-sm border-b border-gray-200 block sm:hidden relative z-30">
      <div className="flex items-center justify-between px-3 py-2 h-14 relative">
        {/* Logo */}
        <div className="flex items-center min-w-0">
          <img
            src="/SOMEFIPPlogo.png"
            alt="SOMEFIPP Logo"
            className="h-8 w-auto"
            style={{ maxWidth: 36 }}
          />
        </div>
        {/* Center: initials */}
        <div className="flex-grow text-center">
          <span className="text-base font-bold tracking-widest text-gray-800 select-none">
            SOMEFIPP
          </span>
        </div>
        {/* Right: search icon */}
        <div className="flex items-center justify-end min-w-0 gap-2">
          {showSearch && !mobileSearchOpen && (
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="p-2 text-slate-500 hover:text-slate-700 transition-colors"
              aria-label="Buscar"
            >
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
            </button>
          )}
          {/* notification's button */}
          <NotificationBell />
        </div>
      </div>
      {/* Mobile search overlay */}
      {mobileSearchOpen && (
        <div className="absolute inset-0 bg-white flex items-center px-3 z-40">
          <SearchBar
            value={searchValue}
            placeholder={searchPlaceholder}
            expandable={false}
            onKeyDown={handleSearchKeyDown}
            className="flex-1"
            inputClassName="py-2"
          />
          <button
            onClick={() => setMobileSearchOpen(false)}
            className="ml-2 p-2 text-slate-500 hover:text-slate-700"
            aria-label="Cerrar búsqueda"
            tabIndex={0}
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

    </header>
  );

  return (
    <>
      {desktopHeader}
      {mobileHeader}
    </>
  );
}
