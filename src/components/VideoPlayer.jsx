// src/components/VideoPlayer.jsx
import React, { useState, useEffect } from "react";

// Verificar si estamos en el navegador
const isBrowser = typeof window !== "undefined";

const VideoPlayer = ({
  src,
  autoPlay = true,
  muted = true,
  loop = true,
  controls = false,
  onError,
  className = "",
  style = {},
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [iframeKey, setIframeKey] = useState(Date.now());

  // Crear un ID único para este iframe
  const frameId = `video-frame-${Math.random().toString(36).substring(2, 15)}`;

  useEffect(() => {
    // Temporizador para ocultar el loader después de un tiempo
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [src, iframeKey]);

  // Función para reintentar la carga
  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setIframeKey(Date.now());
  };

  // Si no estamos en el navegador o no hay URL de video, no renderizar nada
  if (!isBrowser || !src) {
    return null;
  }

  // Crear HTML para el iframe con el video integrado directamente
  const iframeContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #000;
        }
        .video-container {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }
        video {
          max-width: 100%;
          max-height: 100%;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .fallback {
          position: absolute;
          width: 100%;
          height: 100%;
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: white;
          text-align: center;
          padding: 20px;
          background: #000;
        }
        video::-webkit-media-controls-timeline {
          display: ${controls ? "block" : "none"};
        }
      </style>
    </head>
    <body>
      <div class="video-container">
        <video 
          src="${src}" 
          ${autoPlay ? "autoplay" : ""} 
          ${muted ? "muted" : ""} 
          ${loop ? "loop" : ""} 
          ${controls ? "controls" : ""} 
          playsinline
          onloadeddata="document.getElementById('loading').style.display='none';"
          onerror="handleVideoError()"
        ></video>
        <div id="loading" class="fallback">
          <div>Cargando video...</div>
        </div>
        <div id="error" class="fallback">
          <div>Error al cargar el video</div>
          <div>Por favor intenta de nuevo</div>
        </div>
      </div>
      <script>
        function handleVideoError() {
          document.getElementById('loading').style.display = 'none';
          document.getElementById('error').style.display = 'flex';
          window.parent.postMessage('video-error', '*');
        }
      </script>
    </body>
    </html>
  `;

  return (
    <div
      className={`video-player-container ${className}`}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        ...style,
      }}
    >
      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background: "rgba(0,0,0,0.8)",
            zIndex: 2,
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid rgba(255,255,255,0.3)",
              borderRadius: "50%",
              borderTopColor: "#fff",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          <div style={{ color: "white", marginTop: "10px" }}>
            Cargando video...
          </div>
        </div>
      )}

      {error && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background: "rgba(0,0,0,0.8)",
            zIndex: 2,
          }}
        >
          <div style={{ color: "white", marginBottom: "10px" }}>
            Error al cargar el video
          </div>
          <button
            onClick={handleRetry}
            style={{
              padding: "8px 16px",
              background: "#3182ce",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      )}

      <iframe
        id={frameId}
        key={iframeKey}
        src={`data:text/html;charset=utf-8,${encodeURIComponent(
          iframeContent
        )}`}
        style={{
          border: "none",
          width: "100%",
          height: "100%",
          background: "#000",
        }}
        allow="autoplay; fullscreen"
        frameBorder="0"
        scrolling="no"
        title="Video Player"
      />

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;
