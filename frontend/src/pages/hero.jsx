/**
 * Version: 0.1.0
 * Responsive lateral navigation with self-contained routing + Clerk logout
 * Desktop (expandable on hover) + Mobile (bottom bar)
 */

import React, { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-react";

// Atoms
import Button from "../atoms/button";
import { Title2 } from "../atoms/typography";

// Molecules
import FormField from "../molecules/form";
import Sidebar from "../molecules/sidebar";
import AppHeader from "../molecules/appHeader";

// Organisms
import Carousel from "../organisms/carousel";
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

export default function Hero() {
  const { user, isLoaded } = useUser();
  const [current, setCurrent] = useState("home");

  // Form state (solo para la UI del formulario)
  const [formValues, setFormValues] = useState(() => {
    const initial = {};
    userFormFields.forEach((f) => (initial[f.name] = ""));
    return initial;
  });
  const handleFormChange = (e) =>
    setFormValues((p) => ({ ...p, [e.target.name]: e.target.value }));

  // Estados para datos mostrados en la UI
  const [heroSlides, setHeroSlides] = useState([]);
  const [rowSlides, setRowSlides] = useState([]);
  const [userRows, setUserRows] = useState([]);
  const [roleRows, setRoleRows] = useState([]);
  const [, /* sideSlides no visible en UI */ setSideSlides] = useState([]);
  const [, /* products no visibles en Dashboard actual */ setProducts] =
    useState({ columns: [], rows: [] });

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderBottomColor: '#CAD00F' }}></div>
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
        <Carousel slides={heroSlides} variant="hero" />

        <div className="max-w-[70rem] mx-auto">
          <Title2 className="mt-6 mb-3">Weekly Articles</Title2>
        </div>

        <Carousel slides={rowSlides} variant="row" />

      </main>
    </div>
  );
}
