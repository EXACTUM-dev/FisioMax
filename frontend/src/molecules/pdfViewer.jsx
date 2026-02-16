import React, { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Styles for react-pdf standard layers
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure worker for PDF.js
// We use the CDN to ensure the worker is loaded correctly from the matching version
// This avoids complex build configuration for the worker file in varied environments
// Use local static worker file to avoid all bundler/MIME type issues
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
console.log("PDF Worker Source configured to:", pdfjs.GlobalWorkerOptions.workerSrc);

export default function PDFViewer({ url, onError }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [containerWidth, setContainerWidth] = useState(null);
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // Handle resizing to fit PDF width
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          // Subtract padding/margins if necessary, here we take full container width
          // We limit max width slightly to prevent horizontal scroll issues
          setContainerWidth(entry.contentRect.width - 2);
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(error) {
    console.error("Error loading PDF:", error);
    setLoading(false);
    if (onError) onError(error);
  }

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages || 1));
  };

  // Add touch swipe support for mobile
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe && pageNumber < (numPages || 1)) {
      goToNextPage();
    }
    if (isRightSwipe && pageNumber > 1) {
      goToPrevPage();
    }
  };

  if (!url) {
    return (
      <div className="aspect-[3/4] w-full bg-gray-100 rounded-2xl flex items-center justify-center">
        <span className="text-gray-500">No hay URL de PDF disponible</span>
      </div>
    );
  }

  return (
    <div
      className="w-full flex flex-col items-center bg-gray-50 rounded-2xl overflow-hidden shadow-sm border border-gray-100"
      ref={containerRef}
    >
      {/* Controls Header */}
      <div className="w-full flex items-center justify-between p-3 bg-white border-b border-gray-200 z-10">
        <button
          onClick={goToPrevPage}
          disabled={pageNumber <= 1}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Página anterior"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span className="text-sm font-medium text-gray-700">
          Página {pageNumber} de {numPages || "--"}
        </span>

        <button
          onClick={goToNextPage}
          disabled={pageNumber >= (numPages || 1)}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Siguiente página"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* PDF Document */}
      <div
        className="w-full relative bg-gray-200 min-h-[400px] flex justify-center overflow-auto max-h-[80vh]"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#CAD00F]"></div>
            </div>
          }
          error={
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <p className="text-red-500 font-medium mb-2">Contenido cargado</p>
              <button
                onClick={() => window.open(url, '_blank')}
                className="text-blue-600 hover:underline text-sm"
              >
                Click para abrir en nueva pestaña
              </button>
            </div>
          }
        >
          {/* Only render page if we have a width to avoid layout shift/flashing */}
          {containerWidth && (
            <Page
              pageNumber={pageNumber}
              width={containerWidth}
              className="shadow-lg my-4"
              renderTextLayer={true}
              renderAnnotationLayer={true}
              loading=""
            />
          )}
        </Document>
      </div>
    </div>
  );
}
