/**
 * @fileoverview Vista para consumo de videos
 * @version 1.0.0
 * @author EXACTUM-dev
 */
import React from "react";

export default function VideoPage() {
  return (
    <div className="container">
        <div className="video-section">
            <video controls>
                <source src="https://d1rfbz5vvf7qte.cloudfront.net/videos/video.mp4" type="video/mp4"/>
            </video>
        </div>
    </div>
  );
}