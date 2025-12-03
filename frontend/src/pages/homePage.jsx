/**
 * @fileoverview HomePage component displaying multimedia content carousels
 * @version 0.2.0
 * @author EXACTUM-dev
 * @description Main page showing recent videos, articles, books and podcasts in carousels with real-time search functionality
 */

import React, { useEffect, useState, useRef } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { getHomePageContent, searchContent } from "../services/homePage";

// Atoms
import Button from "../atoms/button";
import { Title2 } from "../atoms/typography";

// Molecules
import Sidebar from "../molecules/sidebar";
import AppHeader from "../molecules/appHeader";
import GridCarousel from "../molecules/gridCarousel";

// Organisms
import Carousel from "../organisms/carousel";

/**
 * HomePage component with content carousels and real-time search functionality
 * @component
 * @returns {React.Element} HomePage component
 */
export default function HomePage() {
  const { isSignedIn, getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  const [current, setCurrent] = useState("home");
  const [recentVideos, setRecentVideos] = useState([]);
  const [sesionesMensuales, setSesionesMensuales] = useState([]);
  const [sesionesExtraordinarias, setSesionesExtraordinarias] = useState([]);
  const [videosSesionesConProveedores, setVideosSesionesConProveedores] = useState([]);
  const [articles, setArticles] = useState([]);
  const [books, setBooks] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [podcasts, setPodcasts] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);

  // Ref for debounce timeout
  const searchTimeoutRef = useRef(null);

  /**
   * Redirects to login if user is not authenticated
   */
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate("/login");
    }
  }, [isSignedIn, isLoaded, navigate]);

  /**
   * Loads all content categories on component mount
   */
  useEffect(() => {
    if (!isSignedIn) return;
    loadHomeContent();
  }, [isSignedIn]);

  /**
   * Auto-search effect with debounce
   */
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If search term is empty, clear results immediately
    if (!searchTerm.trim()) {
      setSearchResults(null);
      setSearching(false);
      return;
    }

    // Set searching state immediately for visual feedback
    setSearching(true);

    // Debounce search - wait 500ms after user stops typing
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(searchTerm);
    }, 500);

    // Cleanup on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  /**
   * Fetches all content organized by categories
   */
  const loadHomeContent = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const data = await getHomePageContent(token);

      // Transform data to carousel format
      setDiscounts(transformToCarouselFormat(data.discounts || []));
      setRecentVideos(transformToCarouselFormat(data.recentVideos || []));
      setSesionesMensuales(transformToCarouselFormat(data.sesionesMensuales || []));
      setSesionesExtraordinarias(transformToCarouselFormat(data.sesionesExtraordinarias || []));
      setVideosSesionesConProveedores(transformToCarouselFormat(data.videosSesionesConProveedores || []));
      setArticles(transformToCarouselFormat(data.articles || []));
      setBooks(transformToCarouselFormat(data.books || []));
      setPodcasts(transformToCarouselFormat(data.podcasts || []));
    } catch (err) {
      setError("No se pudo cargar el contenido. Por favor, intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Performs the search operation
   * @param {string} term - Search term
   */
  const performSearch = async (term) => {
    if (!term.trim()) {
      setSearchResults(null);
      setSearching(false);
      return;
    }

    setError(null);

    try {
      const token = await getToken();
      const results = await searchContent(token, term);

      if (results.content.length === 0) {
        setSearchResults({
          slides: [],
          total: 0,
          message: "No se encontraron resultados",
        });
      } else {
        setSearchResults({
          slides: transformToCarouselFormat(results.content),
          total: results.total,
          message: null,
        });
      }
    } catch (err) {
      setError("Error al buscar contenido. Intenta nuevamente.");
      setSearchResults(null);
    } finally {
      setSearching(false);
    }
  };

  /**
   * Transforms API data to carousel slide format compatible with existing Carousel component
   * @param {Array<Object>} items - Content items from API
   * @returns {Array<Object>} Transformed carousel slides
   */
  const transformToCarouselFormat = (items) => {
    if (!items || !Array.isArray(items)) return [];

    // Filter discounts by date: if item is a discount and has fechaInicio/fechaFin,
    // only include it when today is within [fechaInicio, fechaFin]. If dates are
    // missing, keep the item (backwards-compatible).
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // El filtrado por vigencia de la oferta se realiza en el backend
    // (getActiveDiscounts). Aquí dejamos pasar los items tal como vienen
    // desde la API para evitar duplicar lógica y problemas de timezone.
    const filtered = Array.isArray(items) ? items : [];

    return filtered.map((item) => ({
      id: item.IDContenido,
      title: item.nombre,
      subtitle: item.descripcion,
      imageUrl: item.thumbnailUrl || "/SOMEFIPP-Logo.jpeg",
      imageAlt: item.nombre || "Contenido multimedia",
      type: item.tipo,
      fechaInicio: item.fechaInicio || null,
      fechaFin: item.fechaFin || null,
      tipoMembresia: item.tipoMembresia,
      createdAt: item.createdAt,
    }));
  };

  /**
   * Handles search input change
   * @param {string} value - New search value
   */
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    // The useEffect will handle the search automatically
  };

  /**
   * Clears search and returns to home view
   */
  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults(null);
    setSearching(false);
  };

  /**
   * Navigates to dedicated content page
   * @param {string} contentType - Type of content (video, articulo, libro, podcast)
   */
  const navigateToContentPage = (contentType) => {
    const routeMap = {
      video: "/videos",
      articulo: "/articulos",
      libro: "/libros",
      podcast: "/podcasts",
    };

    navigate(routeMap[contentType] || "/home");
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
            style={{ borderBottomColor: "#CAD00F" }}
          ></div>
          <p className="mt-4 text-gray-600">Cargando contenido...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header with integrated search */}
      <AppHeader
        user={user}
        showSearch={true}
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Buscar videos, artículos, libros o podcasts..."
      />

      {/* Sidebar */}
      <Sidebar current={current} onNavigate={setCurrent} />

      {/* Main Content */}
      <main className="p-4 space-y-8 md:ml-[var(--sb-w,80px)] transition-[margin] duration-300 ease-in-out pb-20 md:pb-6">
        {/* Error Message */}
        {error && (
          <div className="max-w-[70rem] mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
            <button
              onClick={() => setError(null)}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>
        )}

        {/* Search Results or Loading - Using GridCarousel */}
        {searchTerm.trim() ? (
          <div className="max-w-[70rem] mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <Title2>
                  {searching ? "Buscando..." : "Resultados de búsqueda"}
                </Title2>
                {!searching && searchResults && searchResults.total > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {searchResults.total} resultado
                    {searchResults.total !== 1 ? "s" : ""} para "{searchTerm}"
                  </p>
                )}
              </div>
              <Button onClick={clearSearch} variant="secondary" size="md">
                Volver al inicio
              </Button>
            </div>

            {searching ? (
              <div className="text-center py-12">
                <div
                  className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
                  style={{ borderBottomColor: "#CAD00F" }}
                ></div>
                <p className="mt-4 text-gray-600">Buscando contenido...</p>
              </div>
            ) : searchResults?.message ? (
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
                <p className="text-gray-500 text-lg">{searchResults.message}</p>
              </div>
            ) : searchResults?.slides ? (
              <GridCarousel slides={searchResults.slides} />
            ) : null}
          </div>
        ) : (
          <>
            {/* Recent Videos - Hero Carousel */}
            {recentVideos.length > 0 && (
              <div>
                <Carousel slides={recentVideos} variant="hero" />
              </div>
            )}

            {/* Sesiones Mensuales */}
            {sesionesMensuales.length > 0 && (
              <>
                <div className="max-w-[70rem] mx-auto">
                  <div className="flex flex-row justify-between items-center gap-2 mb-3">
                    <Title2>Sesiones Mensuales</Title2>
                    <button
                      onClick={() => navigateToContentPage("video")}
                      className="text-sm text-[#CAD00F] hover:text-[#b8bd0d] font-medium transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Ver más →
                    </button>
                  </div>
                </div>
                <Carousel slides={sesionesMensuales} variant="row" />
              </>
            )}

            {/* Sesiones Extraordinarias */}
            {sesionesExtraordinarias.length > 0 && (
              <>
                <div className="max-w-[70rem] mx-auto">
                  <div className="flex flex-row justify-between items-center gap-2 mb-3">
                    <Title2>Sesiones Extraordinarias</Title2>
                    <button
                      onClick={() => navigateToContentPage("video")}
                      className="text-sm text-[#CAD00F] hover:text-[#b8bd0d] font-medium transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Ver más →
                    </button>
                  </div>
                </div>
                <Carousel slides={sesionesExtraordinarias} variant="row" />
              </>
            )}

            {/* Sesiones con Proveedores */}
            {videosSesionesConProveedores.length > 0 && (
              <>
                <div className="max-w-[70rem] mx-auto">
                  <div className="flex flex-row justify-between items-center gap-2 mb-3">
                    <Title2>Sesiones con Proveedores</Title2>
                    <button
                      onClick={() => navigateToContentPage("video")}
                      className="text-sm text-[#CAD00F] hover:text-[#b8bd0d] font-medium transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Ver más →
                    </button>
                  </div>
                </div>
                <Carousel slides={videosSesionesConProveedores} variant="row" />
              </>
            )}

            {/* Weekly Articles */}
            {articles.length > 0 && (
              <>
                <div className="max-w-[70rem] mx-auto">
                  <div className="flex flex-row justify-between items-center gap-2 mb-3">
                    <Title2>Artículos Semanales</Title2>
                    <button
                      onClick={() => navigateToContentPage("articulo")}
                      className="text-sm text-[#CAD00F] hover:text-[#b8bd0d] font-medium transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Ver más →
                    </button>
                  </div>
                </div>
                <Carousel slides={articles} variant="row" />
              </>
            )}

            {/* Books */}
            {books.length > 0 && (
              <>
                <div className="max-w-[70rem] mx-auto">
                  <div className="flex flex-row justify-between items-center gap-2 mb-3">
                    <Title2>Libros</Title2>
                    <button
                      onClick={() => navigateToContentPage("libro")}
                      className="text-sm text-[#CAD00F] hover:text-[#b8bd0d] font-medium transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Ver más →
                    </button>
                  </div>
                </div>
                <Carousel slides={books} variant="row" />
              </>
            )}

            {/* Podcasts */}
            {podcasts.length > 0 && (
              <>
                <div className="max-w-[70rem] mx-auto">
                  <div className="flex flex-row justify-between items-center gap-2 mb-3">
                    <Title2>Podcasts</Title2>
                    <button
                      onClick={() => navigateToContentPage("podcast")}
                      className="text-sm text-[#CAD00F] hover:text-[#b8bd0d] font-medium transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Ver más →
                    </button>
                  </div>
                </div>
                <Carousel slides={podcasts} variant="row" />
              </>
            )}
            {/* Active Discounts Carousel */}
            {discounts.length > 0 && (
              <section className="max-w-[70rem] mx-auto">
                <div className="flex flex-row justify-between items-center gap-2 mb-3">
                  <Title2>Descuentos Activos</Title2>
                  <button
                    onClick={() => navigate("/descuentos")}
                    className="text-sm text-[#CAD00F] hover:text-[#b8bd0d] font-medium transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Ver más →
                  </button>
                </div>
                <Carousel slides={discounts} variant="row" />
              </section>
            )}

            {/* Show message if no content at all */}
            {recentVideos.length === 0 &&
              sesionesMensuales.length === 0 &&
              sesionesExtraordinarias.length === 0 &&
              videosSesionesConProveedores.length === 0 &&
              articles.length === 0 &&
              books.length === 0 &&
              podcasts.length === 0 && (
                <div className="max-w-[70rem] mx-auto text-center py-12">
                  <p className="text-gray-600 text-lg">
                    No hay contenido disponible en este momento.
                  </p>
                </div>
              )}
          </>
        )}
      </main>
    </div>
  );
}
