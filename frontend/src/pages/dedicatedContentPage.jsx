/**
 * @fileoverview Dedicated content page component (videos, articles, books, podcasts)
 * @version 0.1.0
 * @author EXACTUM-dev
 * @description Single reusable page component for displaying filtered content by type with grid layout
 */

import React, { useState, useEffect, useCallback } from "react";
import { useUser as useClerkUser, useAuth } from "@clerk/clerk-react";
import { useUser } from "../contexts/UserContext";
import { useNavigate, useParams } from "react-router-dom";

// Components
import Sidebar from "../molecules/sidebar";
import AppHeader from "../molecules/appHeader";
import GridCarousel from "../molecules/gridCarousel";
import Loading from "../atoms/loading";
import AlertBanner from "../atoms/alertBanner";
import Button from "../atoms/button";
import BackButton from "../atoms/backButton";
import { Title2 } from "../atoms/typography";
import ConfirmationModal from "../molecules/confirmationModal";
import SuccessErrorModal from "../organisms/successErrorModal";

// Services
import { getDedicatedContent } from "../services/dedicatedContentServices";
import { deleteContent } from "../services/contentServices";

/**
 * Content type configuration
 */
const CONTENT_CONFIG = {
  videos: {
    type: "video",
    title: "Videos",
    sidebarKey: "videos",
    placeholder: "Buscar videos...",
  },
  articulos: {
    type: "articulo",
    title: "Artículos",
    sidebarKey: "articles",
    placeholder: "Buscar artículos...",
  },
  libros: {
    type: "libro",
    title: "Libros",
    sidebarKey: "books",
    placeholder: "Buscar libros...",
  },
  podcasts: {
    type: "podcast",
    title: "Podcasts",
    sidebarKey: "podcasts",
    placeholder: "Buscar podcasts...",
  },
};

/**
 * DedicatedContentPage component
 * @component
 * @returns {React.Element}
 */
export default function DedicatedContentPage() {
  const { user: clerkUser } = useClerkUser();
  const { userData, isLoading: isUserLoading } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const { contentCategory } = useParams();

  // Get config for current category
  const config = CONTENT_CONFIG[contentCategory];

  const [current, setCurrent] = useState(config?.sidebarKey || "home");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  // Delete modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [deleteResult, setDeleteResult] = useState({ success: false, message: "" });
  const [contentToDelete, setContentToDelete] = useState(null);

  // Check if user is admin (roleId 10 = Admin)
  const isAdmin = userData?.roleId === 10;

  const limit = 12;

  // Redirect if invalid category
  useEffect(() => {
    if (!config) {
      navigate("/");
    }
  }, [config, navigate]);

  /**
   * Fetches content based on current filters
   */
  const fetchContent = useCallback(
    async (reset = false) => {
      if (!config) return;

      try {
        if (reset) {
          setLoading(true);
          setContent([]);
          setOffset(0);
        } else {
          setLoadingMore(true);
        }

        const token = await getToken();
        const currentOffset = reset ? 0 : offset;

        const response = await getDedicatedContent(
          token,
          config.type,
          limit,
          currentOffset,
          searchQuery,
          sortBy
        );

        // Transform to grid format
        const formattedContent = response.content.map((item) => ({
          id: item.IDContenido,
          title: item.nombre,
          subtitle: item.descripcion,
          imageUrl: item.thumbnailUrl || "/SOMEFIPP-Logo.jpeg",
          imageAlt: item.nombre,
          type: item.tipo,
          tipoMembresia: item.tipoMembresia,
        }));

        if (reset) {
          setContent(formattedContent);
          setOffset(limit);
        } else {
          setContent((prev) => [...prev, ...formattedContent]);
          setOffset((prev) => prev + limit);
        }

        setHasMore(response.hasMore);
        setTotal(response.total);
      } catch (err) {
        console.error("Error loading content:", err);
        setError("No se pudo cargar el contenido. Intenta más tarde.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [getToken, config, searchQuery, sortBy, offset, limit]
  );

  // Initial load and when filters change
  useEffect(() => {
    if (config) {
      fetchContent(true);
    }
  }, [searchQuery, sortBy, config?.type]);

  /**
   * Handles load more button
   */
  const handleLoadMore = () => {
    fetchContent(false);
  };

  /**
   * Handles search submission
   */
  const handleSearchSubmit = () => {
    fetchContent(true);
  };

  /**
   * Handles edit action
   */
  const handleEdit = (slide) => {
    console.log("Editar contenido:", slide);
    // TODO: Implementar edición
  };

  /**
   * Handles delete action - shows confirmation modal
   */
  const handleDelete = (slide) => {
    setContentToDelete(slide);
    setShowConfirmModal(true);
  };

  /**
   * Confirms and executes deletion
   */
  const handleConfirmDelete = async () => {
    setShowConfirmModal(false);

    if (!contentToDelete) return;

    try {
      const token = await getToken();
      await deleteContent(contentToDelete.id, token);

      // Remove from local state
      setContent((prev) => prev.filter((item) => item.id !== contentToDelete.id));
      setTotal((prev) => prev - 1);

      setDeleteResult({
        success: true,
        message: "El contenido ha sido eliminado exitosamente",
      });
    } catch (error) {
      console.error("Error deleting content:", error);
      setDeleteResult({
        success: false,
        message: error.message || "No se pudo eliminar el contenido. Por favor, intenta de nuevo.",
      });
    } finally {
      setContentToDelete(null);
      setShowResultModal(true);
    }
  };

  if (isUserLoading || !config) {
    return <Loading fullscreen message="Cargando..." />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <AppHeader
        user={clerkUser}
        showSearch={true}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={config.placeholder}
        onSearchSubmit={handleSearchSubmit}
      />

      <Sidebar current={current} onNavigate={setCurrent} />

      <main className="p-4 space-y-8 md:ml-[var(--sb-w,80px)] transition-[margin] duration-300 ease-in-out pb-20 md:pb-6">
        <div className="max-w-[70rem] mx-auto">
          {/* Header with back button, title and filters */}
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center gap-4">
              <BackButton onClick={() => navigate(-1)} />
              <Title2 className="mb-0">{config.title}</Title2>
            </div>

            {/* Sort dropdown */}
            <div className="flex items-center gap-3 sm:ml-auto">
              <label
                htmlFor="sort-select"
                className="text-sm font-medium text-gray-700"
              >
                Ordenar por:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CAD00F] bg-white"
              >
                <option value="newest">Más recientes</option>
                <option value="oldest">Más antiguos</option>
                <option value="alphabetical">Alfabético (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <AlertBanner
              type="error"
              message={error}
              onClose={() => setError(null)}
              closable
              className="mb-6"
            />
          )}

          {/* Loading state */}
          {loading ? (
            <Loading message="Cargando contenido..." />
          ) : (
            <>
              {/* Results count */}
              {content.length > 0 && (
                <p className="text-sm text-gray-600 mb-4">
                  Mostrando {content.length} de {total} resultado
                  {total !== 1 ? "s" : ""}
                </p>
              )}

              {/* Content grid */}
              {content.length === 0 ? (
                <div className="text-center py-16">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-gray-500 text-lg">
                    {searchQuery
                      ? "No se encontraron resultados en esta categoría"
                      : "No hay contenido disponible en este momento"}
                  </p>
                </div>
              ) : (
                <>
                  <GridCarousel 
                    slides={content}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    showActions={isAdmin}
                  />

                  {/* Load more button */}
                  {hasMore && (
                    <div className="flex justify-center mt-8">
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                      >
                        {loadingMore ? "Cargando..." : "Cargar más"}
                      </Button>
                    </div>
                  )}

                  {/* End of results message */}
                  {!hasMore && content.length > 0 && (
                    <p className="text-center text-gray-500 text-sm mt-8">
                      ✓ Has visto todo el contenido disponible
                    </p>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>

      {/* Confirmation Modal */}
      <ConfirmationModal
        open={showConfirmModal}
        title="¿Eliminar contenido?"
        message={`¿Estás seguro de que deseas eliminar "${contentToDelete?.title}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowConfirmModal(false);
          setContentToDelete(null);
        }}
      />

      {/* Result Modal */}
      <SuccessErrorModal
        open={showResultModal}
        type={deleteResult.success ? "success" : "error"}
        title={deleteResult.success ? "¡Contenido Eliminado!" : "Error al Eliminar"}
        message={deleteResult.message}
        confirmLabel={deleteResult.success ? "Entendido" : "Cerrar"}
        onClose={() => setShowResultModal(false)}
      />
    </div>
  );
}