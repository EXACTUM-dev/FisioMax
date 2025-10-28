/**
 * @fileoverview Video page component for displaying video content
 * @version 0.2.0
 * @author EXACTUM-dev
 * @description Main page for video content with video player, description and related courses
 */

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useAuth } from "@clerk/clerk-react";
import { useParams, useNavigate } from "react-router-dom";

import Sidebar from "../molecules/sidebar";
import AppHeader from "../molecules/appHeader";
import VideoPlayer from "../molecules/videoPlayer";
import SideContainer from "../organisms/sideContainer";
import Loading from "../atoms/loading";
import AlertBanner from "../atoms/alertBanner";
import { getVideoById, getAvailableVideos } from "../services/contentServices";

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
 * VideoPage component.
 * @component
 * @returns {React.Element} VideoPage component
 */
export default function VideoPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { videoId } = useParams();
  const navigate = useNavigate();

  const [current, setCurrent] = useState("videos");
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState("error");
  const [showDescription, setShowDescription] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const limit = 3;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const token = await getToken();
        const response = await getAvailableVideos(token, limit, offset);

        if (!alive) return;

        if (!response || !response.videos || !Array.isArray(response.videos)) {
          console.error("Invalid response structure:", response);
          setError("Formato de respuesta inválido del servidor.");
          setErrorType("error");
          return;
        }

        const slides = response.videos
          .filter((video) => video.IDContenido !== activeVideoId)
          .map((video) => ({
            id: video.IDContenido,
            title: video.nombre,
            subtitle: video.descripcion?.substring(0, 100) + "...",
            imageUrl: video.thumbnailUrl || "../src/assets/icons/bolt.png",
            imageAlt: video.nombre,
          }));

        if (offset === 0) {
          setCourses(slides);
        } else {
          setCourses((prev) => [...prev, ...slides]);
        }

        setHasMore(response.hasMore || false);

        if (!activeVideoId && !videoId && response.videos.length > 0) {
          setActiveVideoId(response.videos[0].IDContenido);
          navigate(`/video/${response.videos[0].IDContenido}`, {
            replace: true,
          });
        }
      } catch (err) {
        console.error("Error loading videos:", err);
        setError("No se pudieron cargar los videos.");
        setErrorType("error");
      } finally {
        setLoadingMore(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [getToken, offset, activeVideoId, videoId, navigate]);

  useEffect(() => {
    if (videoId) {
      const parsedId = parseInt(videoId);
      if (parsedId !== activeVideoId) {
        setActiveVideoId(parsedId);
        setOffset(0);
      }
    }
  }, [videoId, activeVideoId]);

  useEffect(() => {
    if (!activeVideoId) return;

    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setErrorType("error");

        const token = await getToken();
        const video = await getVideoById(activeVideoId, token);

        if (!alive) return;

        setVideoData(video);
        setShowDescription(false);
      } catch (err) {
        console.error("Error loading video:", err);

        if (err.message.includes("membresía ha vencido")) {
          setError(err.message);
          setErrorType("warning");
        } else if (err.message.includes("nivel superior")) {
          setError(err.message);
          setErrorType("info");
        } else if (
          err.message.includes("not found") ||
          err.message.includes("no está disponible")
        ) {
          setError("El video solicitado no está disponible.");
          setErrorType("warning");
        } else {
          setError("No se pudo cargar el video. Por favor intenta más tarde.");
          setErrorType("error");
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [activeVideoId, getToken]);

  const handleLoadMore = () => {
    setLoadingMore(true);
    setOffset((prev) => prev + limit);
  };

  const handleCourseClick = (course) => {
    if (course?.id && course.id !== activeVideoId) {
      navigate(`/video/${course.id}`);
    }
  };

  const handleVideoError = (err) => {
    console.error("Playback error:", err);
    setError("Error al reproducir el vídeo.");
    setErrorType("error");
  };

  if (!isLoaded || loading) return <Loading message="Cargando vídeo..." />;

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <AppHeader user={user} />
        <Sidebar current={current} onNavigate={setCurrent} />
        <main className="p-4 md:ml-[var(--sb-w,80px)] transition-[margin] duration-300 ease-in-out pb-20 md:pb-6">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
            <AlertBanner
              type={errorType}
              message={error}
              onClose={() => setError(null)}
              closable
            />
          </div>
        </main>
      </div>
    );
  }

  const handleCardClick = () => {
    if (window.innerWidth < 768) setShowDescription((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <AppHeader user={user} />
      <Sidebar current={current} onNavigate={setCurrent} />
      <main className="p-4 md:ml-[var(--sb-w,80px)] transition-[margin] duration-300 ease-in-out pb-20 md:pb-6">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] 2xl:grid-cols-[1fr_450px] gap-6">
            <div className="w-full">
              <div className="mb-6">
                <VideoPlayer
                  url={videoData?.signedUrl}
                  poster={videoData?.videoData?.thumbnailUrl}
                  onError={handleVideoError}
                  playing={false}
                  controls
                />
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
                    title={videoData?.videoData?.titulo}
                  >
                    {videoData?.videoData?.titulo}
                  </h1>
                  {videoData?.metadata?.createdAt && (
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
                        {formatDate(videoData.metadata.createdAt)}
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
                    {videoData?.videoData?.descripcion}
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
                      slides={courses}
                      onSlideClick={handleCourseClick}
                      hasMore={hasMore}
                      loading={loadingMore}
                      onLoadMore={handleLoadMore}
                      emptyMessage="No hay videos disponibles"
                      completedMessage="✓ Todos los videos cargados"
                      loadMoreText="Cargar más videos"
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
