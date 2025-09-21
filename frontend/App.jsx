/**
 * Version: 0.2.0
 * Main component of the FisioMax application
 * Handles navigation, data loading and rendering of main components
 */
import React, { useEffect, useMemo, useState } from "react";
import Carousel from "./src/organisms/carousel";
import { Title2 } from "./src/atoms/typography";
import Sidebar from "./src/molecules/sidebar";
import Button from "./src/atoms/button";
import DataTable from "./src/organisms/dataTable";
import DataSwitchContainer from "./src/organisms/dataSwitchContainer";
import buildUserActionsColumns from "./src/data/tableTemplates/userActionsColumns";
import buildRolePermissionsColumns from "./src/data/tableTemplates/rolePermissionsColumns";
import {
  getHeroSlides,
  getRowSlides,
  getProducts,
  getUsers,
  getRoles,
} from "./src/data/mockApi";

function App() {
  const [current, setCurrent] = useState("home");

  // Loaded from mock API
  const [heroSlides, setHeroSlides] = useState([]);
  const [rowSlides, setRowSlides] = useState([]);
  const [products, setProducts] = useState({ columns: [], rows: [] });
  const [userRows, setUserRows] = useState([]);
  const [roleRows, setRoleRows] = useState([]);

  useEffect(() => {
    let alive = true;
    Promise.all([
      getHeroSlides(),
      getRowSlides(),
      getProducts(),
      getUsers(),
      getRoles(),
    ]).then(([hero, row, prod, users, roles]) => {
      if (!alive) return;
      setHeroSlides(hero);
      setRowSlides(row);
      setProducts(prod);
      setUserRows(users);
      setRoleRows(roles);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Users table columns
  const userColumns = useMemo(
    () =>
      buildUserActionsColumns({
        onOpenDocument: (row) => {
          const url = row?.documentos?.url;
          if (url) window.open(url, "_blank", "noopener,noreferrer");
        },
        onAccept: (row) => {
          console.log("Accept:", row);
        },
        onDelete: (row) => {
          setUserRows((prev) => prev.filter((r) => r.id !== row.id));
        },
      }),
    []
  );

  // Roles table columns
  const roleColumns = useMemo(
    () =>
      buildRolePermissionsColumns({
        onEdit: (row) => {
          console.log("Edit role:", row);
        },
        onDelete: (row) => {
          setRoleRows((prev) => prev.filter((r) => r.id !== row.id));
        },
      }),
    []
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar current={current} onNavigate={setCurrent} />

      {/* Desktop: smooth left margin. Mobile: padding-bottom to not cover content with bar. */}
      <main className="p-4 space-y-8 md:ml-[var(--sb-w,80px)] transition-[margin] duration-300 ease-in-out pb-20 md:pb-4">
        {/* Hero carousel */}
        <Carousel slides={heroSlides} variant="hero" />

        <div className="max-w-[70rem] mx-auto">
          <Title2 className="mt-6 mb-3">Weekly Articles</Title2>
        </div>

        {/* Row carousel */}
        <Carousel slides={rowSlides} variant="row" />

        {/* Switchable container with tabs + search (Users / Roles) */}
        <DataSwitchContainer
          initialKey="users"
          views={[
            {
              key: "users",
              label: "Users",
              type: "table",
              columns: userColumns,
              rows: userRows,
              searchPlaceholder: "Search users...",
              // Optional: mark action columns as non-searchable in your templates if needed
            },
            {
              key: "roles",
              label: "Roles & Permissions",
              type: "table",
              columns: roleColumns,
              rows: roleRows,
              searchPlaceholder: "Search roles...",
            },
          ]}
        />
        {/* Brand button at the bottom */}
        <div className="max-w-[70rem] mx-auto">
          <div className="flex justify-center py-6">
            <Button size="sm" label="SOMEFIPP" />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
