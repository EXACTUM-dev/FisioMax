/**
 * @fileoverview Video player component using native HTML5 video
 * @version 0.2.0
 * @author EXACTUM-dev
 * @description Simple and reliable native video player with mobile tap support
 */

import React, { useRef } from "react";

/**
 * Native HTML5 video player component
 * @component
 * @param {Object} props - Component properties
 * @param {string} props.url - Video URL to play
 * @param {boolean} [props.controls=true] - Show video controls
 * @param {boolean} [props.playing=false] - Auto play video
 * @param {Function} [props.onReady] - Callback when video is ready
 * @param {Function} [props.onError] - Callback when video error occurs
 * @param {string} [props.className=""] - Additional CSS classes
 * @returns {React.Element} VideoPlayer component
 */
export default function VideoPlayer({
  url,
  controls = true,
  playing = false,
  onReady,
  onError,
  className = "",
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const handleContainerClick = (e) => {
    if (window.innerWidth < 768) {
      const video = videoRef.current;
      if (!video) return;

      const rect = video.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        if (video.paused) {
          video.play().catch((err) => {
            console.error("Error playing video:", err);
          });
        } else {
          video.pause();
        }
      }
    }
  };

  // Multi-format support based on file extension
  const getSources = (url) => {
    if (!url) return [];
    const ext = url.split(".").pop().toLowerCase();
    const sources = [];

    if (ext === "mp4") {
      sources.push({ src: url, type: "video/mp4" });
    } else if (ext === "webm") {
      sources.push({ src: url, type: "video/webm" });
    } else if (ext === "ogg" || ext === "ogv") {
      sources.push({ src: url, type: "video/ogg" });
    } else {
      sources.push({ src: url, type: "video/mp4" });
    }
    return sources;
  };

  if (!url) {
    return (
      <div
        className={`aspect-video w-full bg-gray-900 rounded-2xl flex items-center justify-center ${className}`}
      >
        <div className="text-center text-white p-4">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <p className="text-lg">No video URL available</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`aspect-video w-full rounded-2xl overflow-hidden bg-black ${className}`}
      onClick={handleContainerClick}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        controls={controls}
        autoPlay={playing}
        onCanPlay={onReady}
        onError={onError}
        playsInline
        preload="metadata"
        controlsList="nodownload"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
      >
        {getSources(url).map((source) => (
          <source key={source.type} src={source.src} type={source.type} />
        ))}
        Your browser does not support the video element.
      </video>
    </div>
  );
}
