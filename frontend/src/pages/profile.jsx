// Import necessary libraries and components
import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";

// Molecules
import Sidebar from "../molecules/sidebar";
import AppHeader from "../molecules/appHeader";
// Atoms
import { Title2 } from "../atoms/typography";

// Organisms
import ProfileInfo from "../organisms/profileInfo";
import AddressCard from "../organisms/addressCard";
import MembershipCard from "../organisms/membershipCard";
import TicketsCard from "../organisms/ticketsCard";
import DocumentsCard from "../organisms/documentsCard";
import { getMembershipData } from "../utils/membershipData";

export default function ProfilePage() {
  const [current, setCurrent] = useState("profile");

  const handleNavigate = (key) => setCurrent(key);

  // Load membership data (from localStorage if available, otherwise defaults)
  const membership = getMembershipData();

  const { user, isLoaded } = useUser();

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
  {/* Header component with user info */}
  <AppHeader user={user} />

      <div className="flex">
        <Sidebar current={current} onNavigate={handleNavigate} />

        <main className="flex-1 p-6 md:ml-[var(--sb-w,80px)] transition-[margin] duration-300 ease-in-out pb-20 md:pb-6">
          <div className="max-w-[1100px] mx-auto">
            <Title2 className="mb-6">Mi Perfil</Title2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: profile info + address */}
            <div className="lg:col-span-2 space-y-6">
              <ProfileInfo data={membership} />
              <AddressCard data={membership} />
              <DocumentsCard data={membership} />

              {/* History / stats placeholder (simple box) */}
              <section className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                <h3 className="text-lg font-semibold mb-3">Historial</h3>
                <div className="grid grid-cols-3 gap-4 text-center text-sm text-slate-700">
                  <div>
                    <div className="text-xs text-slate-500">Cursos Completados</div>
                    <div className="font-medium mt-2">—</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Diplomados</div>
                    <div className="font-medium mt-2">—</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Horas de servicio</div>
                    <div className="font-medium mt-2">—</div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right column: membership and tickets */}
            <div className="space-y-6">
              <MembershipCard data={membership} />
              <TicketsCard tickets={[]} />
            </div>
          </div>
          </div>
        </main>
      </div>
    </div>
  );
}
