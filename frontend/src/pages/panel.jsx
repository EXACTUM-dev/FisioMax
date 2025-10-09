/**
 * @fileoverview Vista para el panel de control.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import React, { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-react";

// Atoms
import Button from "../atoms/button";
import { Title2 } from "../atoms/typography";

// Molecules
import Sidebar from "../molecules/sidebar";
import AppHeader from "../molecules/appHeader";

// Organisms
import DataSwitchContainer from "../organisms/dataSwitchContainer";

// Data y utils
import {
  userFormFields,
  getHeroSlides,
  getRowSlides,
  getProducts,
  getUsers,
  getRoles,
  getSideSlides,
} from "../data/mockApi";
import buildUserActionsColumns from "../data/tableTemplates/userActionsColumns";
import buildRolePermissionsColumns from "../data/tableTemplates/rolePermissionsColumns";

export default function Panel() {
  const { user, isLoaded } = useUser();
  const [current, setCurrent] = useState("panel");
  
    // Estados para datos mostrados en la UI
    const [heroSlides, setHeroSlides] = useState([]);
    const [rowSlides, setRowSlides] = useState([]);
    const [userRows, setUserRows] = useState([]);
    const [roleRows, setRoleRows] = useState([]);
    const [, /* sideSlides no visible en UI */ setSideSlides] = useState([]);
    const [, /* products no visibles en Dashboard actual */ setProducts] =
      useState({ columns: [], rows: [] });
  
const [error, setError] = useState(null);

useEffect(() => {
  let alive = true;
  async function fetchData() {
    try {
      const [hero, row, prod, users, roles, side] = await Promise.all([
        getHeroSlides(),
        getRowSlides(),
        getProducts(),
        getUsers(),
        getRoles(),
        getSideSlides(),
      ]);
      if (!alive) return;
      setHeroSlides(hero);
      setRowSlides(row);
      setProducts(prod);
      setUserRows(users);
      setRoleRows(roles);
      setSideSlides(side);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("Error al cargar datos. Por favor, inténtalo más tarde.");
    }
  }
  fetchData();
  return () => {
    alive = false;
  };
}, []);
  
    // Columnas para tablas
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
      {/* Header refactorizado como molécula; responde a sidebar y deja margen inferior */}
      <AppHeader user={user} />

      {/* Sidebar fija */}
      <Sidebar current={current} onNavigate={setCurrent} />

      {/* Main con margen que responde a la sidebar */}
      <main className="p-4 space-y-8 md:ml-[var(--sb-w,80px)] transition-[margin] duration-300 ease-in-out pb-20 md:pb-6">

        <DataSwitchContainer
          initialKey="users"
          views={[
            {
              key: "solicitudes",
              label: "Solicitudes",
              type: "table",
              columns: roleColumns,
              rows: roleRows,
              searchPlaceholder: "Buscar Solicitudes...",
            },
            {
              key: "users",
              label: "Usuarios",
              type: "table",
              columns: userColumns,
              rows: userRows,
              searchPlaceholder: "Buscar Usuarios...",
            },
          ]}
        />

        <div className="max-w-[70rem] mx-auto">
          <div className="flex justify-center py-6">
            <Button size="sm" label="SOMEFIPP" />
          </div>
        </div>

      </main>
    </div>
  );

}