/**
 * @fileoverview Application header component with user welcome and title.
 * @author EXACTUM-dev
 * @version 1.0.0
 */

import React from "react";
import { UserButton } from "@clerk/clerk-react";

/**
 * AppHeader component properties.
 * @typedef {Object} AppHeaderProps
 * @property {User} [user] - User data for display.
 * @returns {React.Element} Application header component
 */
export default function AppHeader({ user }) {
  return (
    <header
      className="
        bg-white shadow-sm border-b border-gray-200
        transition-[margin] duration-300 ease-in-out
        md:ml-[var(--sb-w,80px)]
        mb-5 md:mb-6
        hidden sm:block
      "
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div
          className="
            grid items-center py-4
            grid-cols-[1fr_auto_1fr]
            gap-2
          "
        >
          {/* Left: welcome message */}
          <div className="text-left">
            {user && (
              <p className="text-sm text-gray-600">
                Bienvenido,{" "}
                {user.firstName || user.emailAddresses?.[0]?.emailAddress}
              </p>
            )}
          </div>

          {/* Center: title */}
          <div className="text-center">
            <p className="text-sm sm:text-base font-medium text-gray-800">
              Sociedad Mexicana de Fisioterapeutas de Piso Pélvico
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
