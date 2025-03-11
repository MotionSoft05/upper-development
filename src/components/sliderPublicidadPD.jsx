// src/components/sliderPublicidadPD.jsx
import { useState, useEffect, useRef } from "react";
import "keen-slider/keen-slider.min.css";

const AdvertisementSlider = ({
  advertisements,
  templates,
  event,
  currentHour,
  weatherData,
  idioma,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const timeoutRef = useRef(null);
  const transitioningRef = useRef(false);

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

  // Get current advertisement
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
    return null;
  }

  const currentAd = getCurrentAd();
  if (!currentAd) return null;

  const templateActual = templates || {};
  const isLoading = !weatherData;

  return (
    <div className="fixed inset-0 w-full h-full bg-white overflow-hidden z-20 flex flex-col">
      {/* Header Section - 12vh */}
      <div className="flex items-center justify-between h-[12vh]">
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
          className="flex flex-col items-center"
          style={{ fontFamily: templateActual.fontStyle }}
        >
          {templateActual.idioma === "es" && (
            <h1 className="text-2xl font-bold text-center">Eventos del día</h1>
          )}

          {templateActual.idioma === "en" && (
            <h1 className="text-2xl font-bold text-center">
              Today&rsquo;s Events
            </h1>
          )}

          {templateActual.idioma === "es-en" && (
            <>
              <p className="text-2xl font-bold">Eventos del día</p>
              <p className="text-xl font-bold">Today&rsquo;s Events</p>
            </>
          )}

          {templateActual.idioma === "es" && (
            <p className="text-base text-center">{formatDate("es")}</p>
          )}

          {templateActual.idioma === "en" && (
            <p className="text-base text-center">{formatDate("en")}</p>
          )}

          {templateActual.idioma === "es-en" && (
            <>
              <p className="text-base">{formatDate("es")}</p>
              <p className="text-base">{formatDate("en")}</p>
            </>
          )}
        </div>

        {/* Weather and Time */}
        <div
          className="flex-col text-color mr-4"
          style={{ fontFamily: templateActual.fontStyle }}
        >
          <div>
            {isLoading ? (
              <p>
                {templateActual.idioma === "en" && "Loading weather data..."}
                {templateActual.idioma === "es" &&
                  "Cargando datos del clima..."}
                {templateActual.idioma === "es-en" &&
                  "Cargando datos del clima... / Loading weather data..."}
              </p>
            ) : weatherData?.current?.temp_c || weatherData?.temp_c ? (
              <div className="grid grid-cols-2 items-center">
                <img
                  src={weatherData.current?.condition?.icon || weatherData.icon}
                  alt="Clima"
                />
                <p className="text-2xl font-bold -ml-4 w-24">
                  {weatherData.current?.temp_c || weatherData.temp_c} °C
                </p>
                <div className="flex justify-center col-span-2">
                  <p className="text-2xl font-bold">{currentHour}</p>
                </div>
              </div>
            ) : (
              <h2 className="text-4xl mr-16">
                {templateActual.idioma === "en" && "Welcome"}
                {templateActual.idioma === "es" && "Bienvenido"}
                {templateActual.idioma === "es-en" && "Bienvenido / Welcome"}
              </h2>
            )}
          </div>
        </div>
      </div>

      {/* Advertisement Content - Fills remaining space */}
      <div className="flex-1 relative">
        <div
          className="absolute inset-0 w-full h-full transition-opacity duration-1000"
          style={{ opacity }}
        >
          {currentAd.videoUrl ? (
            <video
              key={`video-${currentIndex}`}
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
              src={currentAd.videoUrl}
              onEnded={moveToNextAd}
            />
          ) : (
            <img
              key={`image-${currentIndex}`}
              className="w-full h-full object-cover"
              src={currentAd.imageUrl}
              alt="Advertisement"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvertisementSlider;
