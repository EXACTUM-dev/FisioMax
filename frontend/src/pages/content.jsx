/**
 * @fileoverview Content page component for displaying multimedia content
 * @version 0.3.1
 * @author EXACTUM-dev
 * @description Main page for multimedia content with player/viewer, description and related content
 */

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useAuth } from "@clerk/clerk-react";
import { useParams, useNavigate } from "react-router-dom";

import Sidebar from "../molecules/sidebar";
import AppHeader from "../molecules/appHeader";
import VideoPlayer from "../molecules/videoPlayer";
import PDFViewer from "../molecules/pdfViewer";
import SideContainer from "../organisms/sideContainer";
import Loading from "../atoms/loading";
import AlertBanner from "../atoms/alertBanner";
import {
  getContentById,
  getAvailableContent,
} from "../services/contentServices";

/**
 * Formats date to readable Spanish format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
const formatDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return date.toLocaleDateString("es-ES", options);
};

/**
 * ContentPage component, main page for displaying multimedia content
 * @component
 * @returns {React.Element} ContentPage component
 */
export default function ContentPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { contentId } = useParams();
  const navigate = useNavigate();

  const [current, setCurrent] = useState("content");
  const [activeContentId, setActiveContentId] = useState(null);
  const [contentData, setContentData] = useState(null);
  const [relatedContent, setRelatedContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState("error");
  const [showDescription, setShowDescription] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const limit = 3;

  // Load main content by ID
  useEffect(() => {
    if (!activeContentId) return;

    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setErrorType("error");

        const token = await getToken();
        const content = await getContentById(activeContentId, token);

        if (!alive) return;

        setContentData(content);
        setShowDescription(false);
      } catch (err) {
        console.error("Error cargando contenido:", err);

        if (err.message.includes("membresía ha vencido")) {
          setError(
            "Tu membresía ha vencido. Por favor, renueva tu suscripción para acceder a este contenido."
          );
          setErrorType("warning");
        } else if (err.message.includes("nivel superior")) {
          setError("Este contenido requiere un nivel de membresía superior.");
          setErrorType("info");
        } else if (
          err.message.includes("not found") ||
          err.message.includes("no está disponible")
        ) {
          setError("El contenido solicitado no está disponible.");
          setErrorType("warning");
        } else {
          setError(
            "No se pudo cargar el contenido. Por favor, intenta más tarde."
          );
          setErrorType("error");
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [activeContentId, getToken]);

  // Load related content when main content type or offset changes
  useEffect(() => {
    if (!contentData?.contentData?.tipo) return;
    let alive = true;
    (async () => {
      try {
        const token = await getToken();
        const contentType = contentData.contentData.tipo;
        const response = await getAvailableContent(
          token,
          limit,
          offset,
          contentType
        );
        if (!alive) return;
        if (
          !response ||
          !response.content ||
          !Array.isArray(response.content)
        ) {
          setError("Formato de respuesta inválido del servidor.");
          setErrorType("error");
          return;
        }
        const slides = response.content
          .filter((item) => item.IDContenido !== activeContentId)
          .map((item) => ({
            id: item.IDContenido,
            title: item.nombre,
            subtitle: item.descripcion?.substring(0, 100) + "...",
            imageUrl: item.thumbnailUrl || "/SOMEFIPP-Logo.jpeg",
            imageAlt: item.nombre,
          }));
        if (offset === 0) {
          setRelatedContent(slides);
        } else {
          setRelatedContent((prev) => [...prev, ...slides]);
        }
        setHasMore(response.hasMore || false);
        // For first render, if no activeContentId or contentId, set the first available
        if (!activeContentId && !contentId && response.content.length > 0) {
          setActiveContentId(response.content[0].IDContenido);
          navigate(`/content/${response.content[0].IDContenido}`, {
            replace: true,
          });
        }
      } catch (err) {
        setError("No se pudo cargar el contenido relacionado.");
        setErrorType("error");
      } finally {
        setLoadingMore(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [
    contentData?.contentData?.tipo,
    offset,
    activeContentId,
    contentId,
    getToken,
    navigate,
  ]);

  // Update activeContentId when contentId param changes
  useEffect(() => {
    if (contentId) {
      const parsedId = parseInt(contentId);
      if (parsedId !== activeContentId) {
        setActiveContentId(parsedId);
        setOffset(0);
      }
    }
  }, [contentId, activeContentId]);

  const handleLoadMore = () => {
    setLoadingMore(true);
    setOffset((prev) => prev + limit);
  };

  const handleContentClick = (item) => {
    if (item?.id && item.id !== activeContentId) {
      navigate(`/content/${item.id}`);
    }
  };

  const handleContentError = (err) => {
    console.error("Error al mostrar o reproducir el contenido:", err);
    setError("Error al mostrar o reproducir el contenido.");
    setErrorType("error");
  };

  if (!isLoaded || loading) return <Loading message="Cargando contenido..." />;

  const handleCardClick = () => {
    if (window.innerWidth < 768) setShowDescription((prev) => !prev);
  };

  const isVideo = contentData?.contentData?.tipo === "video";
  const isArticle = contentData?.contentData?.tipo === "articulo";
  const isBook = contentData?.contentData?.tipo === "libro";
  const isPodcast = contentData?.contentData?.tipo === "podcast";

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <AppHeader user={user} showSearch={false} />
      <Sidebar current={current} onNavigate={setCurrent} />
      {error && (
        <AlertBanner
          type={errorType}
          message={error}
          onClose={() => setError(null)}
          closable
        />
      )}
      <main className="p-4 md:ml-[var(--sb-w,80px)] transition-[margin] duration-300 ease-in-out pb-20 md:pb-6">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] 2xl:grid-cols-[1fr_450px] gap-6">
            <div className="w-full">
              <div className="mb-6">
                {(isVideo || isPodcast)&& (
                  <VideoPlayer
                    url={contentData?.signedUrl}
                    poster={contentData?.contentData?.thumbnailUrl}
                    onError={handleContentError}
                    playing={false}
                    controls
                  />
                )}
                {(isArticle || isBook) && (
                  <PDFViewer
                    url={contentData?.signedUrl}
                    onError={handleContentError}
                  />
                )}
              </div>

              <div
                className={`
                  bg-white rounded-2xl p-6 shadow-sm transition
                  cursor-pointer md:cursor-default select-none
                `}
                onClick={handleCardClick}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-4">
                  <h1
                    className="text-2xl md:text-3xl font-bold text-gray-900 line-clamp-2 flex-1"
                    title={contentData?.contentData?.titulo}
                  >
                    {contentData?.contentData?.titulo}
                  </h1>
                  {contentData?.metadata?.createdAt && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm md:text-base shrink-0">
                      <svg
                        className="w-4 h-4 md:w-5 md:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="font-medium">
                        {formatDate(contentData.metadata.createdAt)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Descripción
                  </h2>
                  <p
                    className={`
                      text-gray-600 leading-relaxed whitespace-pre-wrap
                      ${showDescription ? "" : "hidden"}
                      md:block
                    `}
                  >
                    {contentData?.contentData?.descripcion}
                  </p>
                  <div className="md:hidden text-sm text-gray-400 mt-2 select-none">
                    {!showDescription && <>Ver más...</>}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full xl:w-[400px] 2xl:w-[450px]">
              <div className="xl:sticky xl:top-4">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div
                    className="overflow-y-auto"
                    style={{ maxHeight: "calc(100vh - 200px)" }}
                  >
                    <SideContainer
                      slides={relatedContent}
                      onSlideClick={handleContentClick}
                      hasMore={hasMore}
                      loading={loadingMore}
                      onLoadMore={handleLoadMore}
                      emptyMessage={
                        isVideo
                          ? "No hay videos disponibles"
                          : "No hay artículos disponibles"
                      }
                      completedMessage={
                        isVideo
                          ? "✓ Todos los videos cargados"
                          : "✓ Todos los artículos cargados"
                      }
                      loadMoreText={
                        isVideo ? "Cargar más videos" : "Cargar más artículos"
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
