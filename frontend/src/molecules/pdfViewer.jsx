/**
 * @fileoverview PDFViewer molecule for displaying PDF articles inline
 * @version 0.2.0
 * @author EXACTUM-dev
 * @description PDF viewer with Mozilla PDF.js for better Android compatibility
 */
import React, { useRef, useState, useEffect } from "react";

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export default function PDFViewer({ url, onError }) {
  const iframeRef = useRef(null);
  const [showFallback, setShowFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset loading state when URL changes
    setIsLoading(true);
    setShowFallback(false);

    // Set a timeout to show fallback if loading takes too long
    const timer = setTimeout(() => {
      if (isLoading && isAndroid()) {
        setShowFallback(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [url, isLoading]);

  if (!url) {
    return (
      <div className="aspect-[3/4] w-full bg-gray-100 rounded-2xl flex items-center justify-center">
        <span className="text-gray-500">No PDF URL available</span>
      </div>
    );
  }

  // Handle download
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = url;
    link.download = url.split("/").pop() || "document.pdf";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // For Android: Use Mozilla PDF.js viewer (more reliable than Google Docs)
  // For iOS: Direct URL works well
  // For Desktop: Direct URL
  let viewerUrl;

  if (isAndroid()) {
    // Use Mozilla's PDF.js viewer hosted on CDN - works better on Android
    viewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(url)}`;
  } else if (isIOS()) {
    // iOS Safari handles PDFs natively very well
    viewerUrl = url;
  } else {
    // Desktop browsers
    viewerUrl = url;
  }

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = (e) => {
    console.error("PDF iframe error:", e);
    setShowFallback(true);
    setIsLoading(false);
    if (onError) onError(e);
  };

  return (
    <div className="w-full">
      {/* Download button - always visible on Android, helpful as fallback */}
      {(isAndroid() || showFallback) && (
        <div className="mb-4 flex flex-col sm:flex-row gap-2 items-center justify-center bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              {showFallback
                ? "¿Problemas para ver el PDF?"
                : "¿No se visualiza correctamente?"}
            </span>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Descargar PDF
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 rounded-2xl z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="text-gray-600 text-sm">Cargando PDF...</span>
          </div>
        </div>
      )}

      {/* PDF Viewer */}
      <div
        className="w-full rounded-2xl overflow-hidden bg-gray-100 relative"
        style={{ height: "70vh" }}
      >
        <iframe
          ref={iframeRef}
          src={viewerUrl}
          title="PDF Article"
          width="100%"
          height="100%"
          style={{
            border: "none",
            background: "#f3f4f6",
          }}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          // Allow PDF.js to work properly
          sandbox="allow-same-origin allow-scripts allow-forms allow-downloads"
        />
      </div>
    </div>
  );
}
