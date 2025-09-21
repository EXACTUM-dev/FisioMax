/**
 * Version: 0.2.0
 * Main component of the FisioMax application
 * Handles navigation, data loading and rendering of main components
 */
import React, { useEffect, useMemo, useState } from "react";
import FormField from "./src/molecules/form";
import { userFormFields } from "./src/data/mockApi";
import SideContainer from "./src/organisms/sideContainer";
import { getSideSlides } from "./src/data/mockApi";
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

  // Estado para los campos del formulario de usuario
  const [formValues, setFormValues] = useState(() => {
    const initial = {};
    userFormFields.forEach(f => { initial[f.name] = ""; });
    return initial;
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  // Loaded from mock API
  const [heroSlides, setHeroSlides] = useState([]);
  const [rowSlides, setRowSlides] = useState([]);
  const [products, setProducts] = useState({ columns: [], rows: [] });
  const [userRows, setUserRows] = useState([]);
  const [roleRows, setRoleRows] = useState([]);
  const [sideSlides, setSideSlides] = useState([]);

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
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <Sidebar current={current} onNavigate={setCurrent} />
      {/* Contenedor principal y SideContainer a la derecha */}
      <div className="flex flex-1 flex-row">
        {/* Contenido principal */}
        <main className="flex-1 p-4 space-y-8 transition-[margin] duration-300 ease-in-out pb-20 md:pb-4">
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

<<<<<<< HEAD
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
=======
          {/* Formulario de usuario (campos desde mockApi) */}
          <div className="max-w-md mx-auto">
            {userFormFields.map(field => (
              <FormField
                key={field.name}
                label={field.label}
                name={field.name}
                type={field.type}
                value={formValues[field.name]}
                onChange={handleFormChange}
                placeholder={field.placeholder}
              />
            ))}
          </div>
        </main>
        {/* SideContainer a la derecha */}
        <SideContainer slides={sideSlides} />
      </div>
>>>>>>> 929da31ce33f49de5a6389c034b03c41f5ef8645
    </div>
  );
}

export default App;
