import React, { useState } from "react";
import Sidebar from "../molecules/sidebar";
import AppHeader from "../molecules/appHeader";

export default function ProfilePage() {
  const [current, setCurrent] = useState("profile");

  const handleNavigate = (key) => setCurrent(key);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Do not pass `user` to AppHeader so Clerk profile info isn't shown */}
      <AppHeader />

      <Sidebar current={current} onNavigate={handleNavigate} />

      <main className="p-4 md:ml-[var(--sb-w,80px)] transition-[margin] duration-300 ease-in-out pb-20 md:pb-6">
        <div className="max-w-4xl mx-auto">
          {/* Intentionally empty: no Clerk UserProfile rendered */}
        </div>
      </main>
    </div>
  );
}
