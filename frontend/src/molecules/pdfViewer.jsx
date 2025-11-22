/**
 * @fileoverview PDFViewer molecule for displaying PDF articles inline
 * @version 0.1.1
 * @author EXACTUM-dev
 * @description Simple PDF viewer without custom zoom or reload controls
 */
import React, { useRef } from "react";

function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export default function PDFViewer({ url, onError }) {
  const iframeRef = useRef(null);

  if (!url) {
    return (
      <div className="aspect-[3/4] w-full bg-gray-100 rounded-2xl flex items-center justify-center">
        <span className="text-gray-500">No PDF URL available</span>
      </div>
    );
  }

  // Use Google Docs viewer for mobile devices
  const viewerUrl = isMobile()
    ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
        url
      )}`
    : url;

  return (
    <div className="w-full">
      <div
        className="w-full rounded-2xl overflow-hidden bg-gray-100"
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
          onError={onError}
        />
      </div>
    </div>
  );
}
