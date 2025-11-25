/**
 * @fileoverview Media player component supporting video and audio files (extended from native HTML5 video)
 * @version 0.3.0
 * @author EXACTUM-dev
 * @description Simple and reliable native player with mobile tap support and audio compatibility
 */

import React, { useRef } from "react";

/**
 * Native HTML5 media player component
 * @component
 * @param {Object} props - Component properties
 * @param {string} props.url - Media URL to play (video or audio)
 * @param {boolean} [props.controls=true] - Show media controls
 * @param {boolean} [props.playing=false] - Auto play media
 * @param {Function} [props.onReady] - Callback when media is ready
 * @param {Function} [props.onError] - Callback when media error occurs
 * @param {string} [props.className=""] - Additional CSS classes
 * @returns {React.Element} MediaPlayer component
 */
export default function MediaPlayer({
  url,
  controls = true,
  playing = false,
  onReady,
  onError,
  className = "",
}) {
  const mediaRef = useRef(null);
  const containerRef = useRef(null);

  /**
   * Handles tap-to-play/pause behavior on mobile for video
   */
  const handleContainerClick = (e) => {
    if (window.innerWidth < 768) {
      const media = mediaRef.current;
      if (!media) return;

      const rect = media.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        if (media.paused) {
          media.play().catch((err) => {
            onError(err);
          });
        } else {
          media.pause();
        }
      }
    }
  };

  /**
   * Multi-format support based on file extension
   * Supports: MP4, WEBM, OGG, MP3, M4A, WAV, AAC, OGA
   */
  const getSources = (url) => {
    if (!url) return [];
    const ext = url.split(".").pop().toLowerCase();
    const sources = [];

    // Video formats
    if (["mp4", "webm", "ogg", "ogv"].includes(ext)) {
      sources.push({ src: url, type: `video/${ext === "ogv" ? "ogg" : ext}` });
    }
    // Audio formats
    else if (["mp3", "m4a", "wav", "aac", "oga"].includes(ext)) {
      sources.push({ src: url, type: `audio/${ext === "oga" ? "ogg" : ext}` });
    }
    // Default fallback
    else {
      sources.push({ src: url, type: "video/mp4" });
    }
    return sources;
  };

  // Handle missing URL case
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
          <p className="text-lg">No media URL available</p>
        </div>
      </div>
    );
  }

  // Determine if media is audio or video
  const ext = url.split(".").pop().toLowerCase();
  const isAudio = ["mp3", "m4a", "wav", "aac", "oga"].includes(ext);

  return (
    <div
      ref={containerRef}
      className={`${isAudio ? "w-full" : "aspect-video w-full"} rounded-2xl overflow-hidden bg-black ${className}`}
      onClick={!isAudio ? handleContainerClick : undefined}
    >
      {isAudio ? (
        /**
         * Render audio element for supported formats
         */
        <audio
          ref={mediaRef}
          className="w-full"
          controls={controls}
          autoPlay={playing}
          onCanPlay={onReady}
          onError={onError}
          preload="metadata"
          controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
        >
          {getSources(url).map((source) => (
            <source key={source.type} src={source.src} type={source.type} />
          ))}
          Your browser does not support the audio element.
        </audio>
      ) : (
        /**
         * Render video element for supported formats
         */
        <video
          ref={mediaRef}
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
      )}
    </div>
  );
}
