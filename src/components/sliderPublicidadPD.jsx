// src/components/sliderPublicidadPD.jsx
import { useState, useEffect, useRef, useMemo } from "react";
import "keen-slider/keen-slider.min.css";
import VideoPlayer from "./VideoPlayer";
import WeatherWidget from "./WeatherWidget";

const AdvertisementSlider = ({
  advertisements,
  templates,
  event,
  currentTime,
  weatherData,
  isPortrait = false,
  screenNumber, // Añadido para poder acceder a la configuración específica de la pantalla
}) => {
  console.log("🚀 ~ sliderPublicidadPD.jsx:15 ~ templates:", templates);
  console.log("🚀 ~ sliderPublicidadPD.jsx:15 ~ isPortrait:", isPortrait);
  console.log("🚀 ~ sliderPublicidadPD.jsx:15 ~ weatherData:", weatherData);
  console.log("🚀 ~ sliderPublicidadPD.jsx:15 ~ screenNumber:", screenNumber);
  console.log(
    "🚀 ~ sliderPublicidadPD.jsx:15 ~ advertisements:",
    advertisements
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const timeoutRef = useRef(null);
  const transitioningRef = useRef(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });
  const [videoError, setVideoError] = useState(false);

  // Obtener la dirección de rotación basado en el nuevo método
  const getRotationDirection = () => {
    // Si recibimos pantallasSettings, verificamos primero allí
    if (templates?.pantallasSettings && screenNumber) {
      const screenSpecificSetting =
        templates.pantallasSettings[screenNumber.toString()];
      if (screenSpecificSetting?.setPortrait === true) {
        // Pantalla vertical detectada en pantallasSettings
        return -90; // Valor por defecto para pantallas verticales
      }
    }

    // Luego buscamos en pantallaSettings si existe
    if (
      templates?.pantallaSettings &&
      Array.isArray(templates.pantallaSettings)
    ) {
      // Restamos 1 porque los índices de array comienzan en 0 y screenNumber comienza en 1
      const screenIndex = screenNumber ? screenNumber - 1 : 0;
      const screenSetting = templates.pantallaSettings[screenIndex];

      if (
        screenSetting?.isPortrait &&
        screenSetting?.rotationDirection !== undefined
      ) {
        return screenSetting.rotationDirection;
      } else if (screenSetting?.isPortrait) {
        return -90; // Valor por defecto para pantallas verticales
      }
    }

    // Si no se encuentra configuración específica pero isPortrait es verdadero
    if (isPortrait) {
      return -90; // Valor por defecto para pantallas verticales
    }

    // No es una pantalla vertical, no se necesita rotación
    return 0;
  };
  console.log(
    "🚀 ~ sliderPublicidadPD.jsx:33 ~ getRotationDirection ~ getRotationDirection:",
    getRotationDirection
  );

  // Determinar si la pantalla debe rotarse basado en la configuración
  const shouldRotate = () => {
    // Primero verificar pantallasSettings
    if (templates?.pantallasSettings && screenNumber) {
      const screenSpecificSetting =
        templates.pantallasSettings[screenNumber.toString()];
      if (screenSpecificSetting?.setPortrait === true) {
        return true;
      }
    }

    // Luego verificar pantallaSettings
    if (
      templates?.pantallaSettings &&
      Array.isArray(templates.pantallaSettings)
    ) {
      const screenIndex = screenNumber ? screenNumber - 1 : 0;
      const screenSetting = templates.pantallaSettings[screenIndex];
      if (screenSetting?.isPortrait) {
        return true;
      }
    }

    // Finalmente usar el prop isPortrait
    return isPortrait;
  };

  const rotationDirection = getRotationDirection();
  const rotateScreen = shouldRotate();

  // Monitor window size for responsive adjustments
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      handleResize(); // Initial call
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  // Prevent scrolling when component is mounted
  useEffect(() => {
    if (rotateScreen) {
      // Prevent scrolling on the body
      document.body.style.overflow = "hidden";
      document.body.style.margin = "0";
      document.body.style.padding = "0";
      document.body.style.height = "100%";

      // Apply specific styles to html element too
      document.documentElement.style.overflow = "hidden";
      document.documentElement.style.height = "100%";

      return () => {
        // Restore default styles when component unmounts
        document.body.style.overflow = "";
        document.body.style.margin = "";
        document.body.style.padding = "";
        document.body.style.height = "";
        document.documentElement.style.overflow = "";
        document.documentElement.style.height = "";
      };
    }
  }, [rotateScreen]);

  // Format date based on language
  const formatDate = (lang) => {
    const now = new Date();

    if (lang === "es") {
      const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      };
      return now.toLocaleDateString("es-ES", options);
    } else {
      const options = {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      };
      return now.toLocaleDateString("en-US", options);
    }
  };

  // Get current advertisement - ahora usamos directamente los anuncios ya filtrados
  const getCurrentAd = () => {
    if (!advertisements || advertisements.length === 0) return null;
    return advertisements[currentIndex];
  };

  // Handle transition to next ad
  const moveToNextAd = () => {
    if (
      !advertisements ||
      advertisements.length <= 1 ||
      transitioningRef.current
    )
      return;

    transitioningRef.current = true;

    // Start fade out
    setOpacity(0);

    // After fade out completes, change ad and fade in
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % advertisements.length);

      // Small delay before starting fade in
      setTimeout(() => {
        setOpacity(1);
        transitioningRef.current = false;
      }, 50);
    }, 500); // Wait for fade out to complete
  };

  // Reset index when advertisements change
  useEffect(() => {
    setCurrentIndex(0);
  }, [advertisements.length]);

  // Set up timer for ad rotation
  useEffect(() => {
    if (!advertisements || advertisements.length === 0) return;

    const currentAd = getCurrentAd();
    if (!currentAd) return;

    // Calculate total duration in seconds (minimum 10 seconds)
    const totalSeconds = Math.max(
      10,
      (currentAd.horas || 0) * 3600 +
        (currentAd.minutos || 0) * 60 +
        (currentAd.segundos || 0)
    );

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set timer for next ad
    timeoutRef.current = setTimeout(moveToNextAd, totalSeconds * 1000);

    // Clean up on unmount or when current ad changes
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, advertisements]);

  if (!advertisements || advertisements.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
        <p className="text-2xl text-gray-500">
          No hay publicidades disponibles para la orientación{" "}
          {rotateScreen ? "vertical" : "horizontal"}
        </p>
      </div>
    );
  }

  const currentAd = getCurrentAd();
  if (!currentAd) return null;

  const templateActual = templates || {};
  const isLoading = !weatherData;
  const idioma = templateActual.idioma || "es";

  // Render header content (used in both orientations)
  const renderHeaderContent = () => (
    <>
      {/* Logo */}
      {templateActual.logo && (
        <div className="h-full aspect-square ml-4">
          <img
            src={templateActual.logo}
            alt="Logo"
            className="rounded-lg object-contain h-full"
          />
        </div>
      )}

      {/* Title and Date */}
      <div
        className="flex flex-col items-center text-color"
        style={{ fontFamily: templateActual.fontStyle }}
      >
        {idioma === "es" && (
          <h1 className="text-xl font-bold text-center text-color">
            Eventos del día
          </h1>
        )}

        {idioma === "en" && (
          <h1 className="text-xl font-bold text-center text-color">
            Today&rsquo;s Events
          </h1>
        )}

        {idioma === "es-en" && (
          <>
            <p className="text-xl font-bold text-color">Eventos del día</p>
            <p className="text-xl font-bold text-color">Today&rsquo;s Events</p>
          </>
        )}

        {idioma === "es" && (
          <p className="text-xs text-center text-color">{formatDate("es")}</p>
        )}

        {idioma === "en" && (
          <p className="text-xs text-center text-color">{formatDate("en")}</p>
        )}

        {idioma === "es-en" && (
          <>
            <p className="text-xs text-color">{formatDate("es")}</p>
            <p className="text-xs text-color">{formatDate("en")}</p>
          </>
        )}
      </div>

      {/* Weather and Time */}
      <div className="flex flex-col items-end mr-4">
        {isLoading ? (
          <div className="animate-pulse flex space-x-2">
            <div className="rounded-full bg-gray-200 h-5 w-5"></div>
            <div className="rounded bg-gray-200 h-5 w-12"></div>
          </div>
        ) : weatherData ? (
          <>
            <WeatherWidget
              ciudad={weatherData.location}
              showForecast={true}
              variant="horizontal"
            />
            <div className="flex items-center">
              <img src="/img/reloj.png" className="p-1 h-8 mt-1" alt="Clock" />
              <div className="text-xl font-semibold text-gray-800 mt-0.5">
                {currentTime}
              </div>
            </div>
          </>
        ) : (
          <span className="text-lg text-gray-500">Sin datos</span>
        )}
      </div>
    </>
  );

  // Render advertisement content (used in both orientations)
  const renderAdvertisementContent = () => (
    <div
      className="absolute inset-0 w-full h-full transition-opacity duration-1000"
      style={{
        opacity,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {currentAd.videoUrl ? (
        <VideoPlayer
          src={currentAd.videoUrl}
          autoPlay={true}
          muted={true}
          loop={false}
          onEnded={moveToNextAd}
          onError={() => {
            setVideoError(true);
            moveToNextAd();
          }}
        />
      ) : // Para modo portrait (rotateScreen es verdadero)
      rotateScreen ? (
        <img
          key={`image-${currentIndex}`}
          className="h-full mx-auto"
          src={currentAd.imageUrl}
          alt="Advertisement"
          style={{ maxHeight: "100%" }}
        />
      ) : (
        // Imagen en modo horizontal (landscape) - Asegurando que ocupe el espacio
        <img
          key={`image-${currentIndex}`}
          src={currentAd.imageUrl}
          alt="Advertisement"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block", // Importante para eliminar espacio adicional
          }}
        />
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 w-full h-full bg-white overflow-hidden z-20"
      style={{ fontFamily: templateActual.fontStyle }}
    >
      {rotateScreen ? (
        // Portrait mode with rotation
        <div
          style={{
            position: "absolute",
            width: windowSize.height,
            height: windowSize.width,
            top: (windowSize.height - windowSize.width) / 2,
            left: (windowSize.width - windowSize.height) / 2,
            transform: `rotate(${rotationDirection}deg)`,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "white",
          }}
        >
          {/* Header Section - rotated for portrait */}
          <div className="flex items-center justify-between h-[14vh]">
            {renderHeaderContent()}
          </div>

          {/* Advertisement Content - rotated for portrait */}
          <div className="flex-1 relative portrait">
            {renderAdvertisementContent()}
          </div>
        </div>
      ) : (
        // Original landscape layout
        <div className="flex flex-col h-full w-full">
          {/* Header Section */}
          <div className="flex items-center justify-between h-[14vh]">
            {renderHeaderContent()}
          </div>

          {/* Advertisement Content - Explícitamente ocupando el espacio restante */}
          <div
            className="flex-1 relative overflow-hidden"
            style={{ height: "calc(100% - 14vh)" }}
          >
            {renderAdvertisementContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvertisementSlider;
