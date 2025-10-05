import React, { useState } from "react";
import { UserProfile, useUser } from "@clerk/clerk-react";
import Sidebar from "../molecules/sidebar";
import AppHeader from "../molecules/appHeader";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [current, setCurrent] = useState("profile");

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

  const handleNavigate = (key) => {
    // Esta página marca activa la opción Perfil, el enrutamiento lo maneja App.jsx o la página que navegue.
    setCurrent(key);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <AppHeader user={user} />
      <Sidebar current={current} onNavigate={handleNavigate} />

      <main className="p-4 md:ml-[var(--sb-w,80px)] transition-[margin] duration-300 ease-in-out pb-20 md:pb-6">
        <div className="max-w-4xl mx-auto">
          <UserProfile routing="path" path="/ajustes/perfil" />
        </div>
      </main>
    </div>
  );
}
