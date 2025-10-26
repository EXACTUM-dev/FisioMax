/**
 * @fileoverview Video page component for displaying video content
 * @version 0.2.0
 * @author EXACTUM-dev
 * @description Main page for video content with video player, description and related courses
 */

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";

// Molecules
import Sidebar from "../molecules/sidebar";
import AppHeader from "../molecules/appHeader";
import VideoPlayer from "../molecules/videoPlayer";

// Organisms
import SideContainer from "../organisms/sideContainer";

// Atoms
import Loading from "../atoms/loading";
import AlertBanner from "../atoms/alertBanner";

// Mock API
import { getVideoById, getSideSlides, defaultVideoId } from "../data/mockApi";

/**
 * VideoPage component.
 * @component
 * @returns {React.Element} VideoPage component
 */
export default function VideoPage() {
  const { user, isLoaded } = useUser();
  const [current, setCurrent] = useState("videos");
  const [activeVideoId, setActiveVideoId] = useState(defaultVideoId);
  const [videoData, setVideoData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState("error");

  const [showDescription, setShowDescription] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const slides = await getSideSlides();
        if (!alive) return;
        setCourses(slides);
      } catch (err) {
        console.error("Error loading slides:", err);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setErrorType("error");
        const video = await getVideoById(activeVideoId);
        if (!alive) return;
        setVideoData(video);
        setShowDescription(false);
      } catch (err) {
        console.error("Error loading video:", err);
        if (err.message?.includes("not found")) {
          setError("El video solicitado no está disponible.");
          setErrorType("warning");
        } else {
          setError("No se pudo cargar el video. Intenta más tarde.");
          setErrorType("error");
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [activeVideoId]);

  const handleCourseClick = (course) => {
    if (course?.id && course.id !== activeVideoId) {
      setActiveVideoId(course.id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleVideoReady = () => {
    console.log("Video ready");
  };

  const handleVideoError = (err) => {
    console.error("Playback error:", err);
    setError("Error al reproducir el video.");
    setErrorType("error");
  };

  if (!isLoaded || loading) return <Loading message="Cargando video..." />;

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <AppHeader user={user} />
        <Sidebar current={current} onNavigate={setCurrent} />
        <main className="p-4 md:ml-[var(--sb-w,80px)] transition-[margin] duration-300 ease-in-out pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto">
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
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="mb-6">
                <VideoPlayer
                  url={videoData?.signedUrl}
                  onReady={handleVideoReady}
                  onError={handleVideoError}
                  playing={false}
                  controls
                />
              </div>

              <div
                className={`
                  bg-white rounded-2xl p-6 shadow-sm transition
                  ${window.innerWidth < 768 ? "cursor-pointer select-none" : ""}
                `}
                onClick={handleCardClick}
              >
                <h1
                  className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 line-clamp-2"
                  title={videoData?.videoData?.titulo}
                >
                  {videoData?.videoData?.titulo}
                </h1>
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
                  <div className="md:hidden text-2xl text-gray-400 mt-2 select-none">
                    {!showDescription && <>...</>}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <SideContainer
                slides={courses}
                onSlideClick={handleCourseClick}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
