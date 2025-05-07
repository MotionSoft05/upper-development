// src/components/VideoPlayer.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  isVideoMarkedAsCached,
  markVideoAsCached,
  updateVideoAccess,
} from "@/utils/dexieVideoCache";

const VideoPlayer = ({
  src,
  autoPlay = true,
  muted = true,
  loop = true,
  controls = false,
  onError,
  onEnded,
  className = "",
  style = {},
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const retryCount = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    // Función para verificar y actualizar caché
    const checkCache = async () => {
      if (!src) return;

      try {
        // Verificar si tenemos el video marcado como cacheado
        const isCached = await isVideoMarkedAsCached(src);

        if (isCached) {
          console.log("Video marcado como cacheado:", src);
          await updateVideoAccess(src);
        } else {
          console.log("Video no marcado como cacheado:", src);
          // Lo marcaremos como cacheado cuando se cargue completamente
        }
      } catch (err) {
        console.error("Error al verificar caché:", err);
      }
    };

    checkCache();
  }, [src]);

  // Manejo de eventos del video
  const handleLoadedData = async () => {
    console.log("Video cargado correctamente:", src);
    setIsLoading(false);
    setError(null);

    // Marcar el video como cacheado en nuestra base de datos
    try {
      await markVideoAsCached(src);
    } catch (err) {
      console.error("Error al marcar video como cacheado:", err);
    }
  };

  const handleError = (e) => {
    console.error("Error de video:", e);

    // Intentar recargar un número limitado de veces
    if (retryCount.current < maxRetries) {
      retryCount.current += 1;
      console.log(
        `Reintentando carga (${retryCount.current}/${maxRetries})...`
      );

      // Pequeño retraso antes de reintentar
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.load();
        }
      }, 1000);
    } else {
      setError("No se pudo cargar el video después de varios intentos");
      setIsLoading(false);
      if (onError) onError(e);
    }
  };

  // Función para reintentar manualmente
  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    retryCount.current = 0;

    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  return (
    <div
      className={`video-player-container ${className}`}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#000",
        ...style,
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        controls={controls}
        playsInline
        className="w-full h-full object-contain"
        style={{
          display: isLoading || error ? "none" : "block",
          background: "#000",
        }}
        onLoadedData={handleLoadedData}
        onError={handleError}
        onEnded={onEnded}
      />

      {/* Loading Indicator */}
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

      {/* Error Display */}
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
          <div style={{ color: "white", marginBottom: "10px" }}>{error}</div>
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
