import React, { useState, useEffect } from "react";
import { useKeenSlider } from "keen-slider/react";
import PropTypes from "prop-types";
import QRCode from "qrcode.react";
import "keen-slider/keen-slider.min.css";
import SliderRSS from "../SliderRSS";

// Event display component for vertical layout
const EventRow = ({
  event,
  screenName,
  total,
  heightPercentage,
  nombrePantallasDirectorio = [],
  onImageClick,
}) => {
  if (!event) return null;

  // Filtrar los devices para mostrar solo los que NO están en nombrePantallasDirectorio
  const filteredDevices = event.devices
    ? event.devices.filter(
        (device) => !nombrePantallasDirectorio.includes(device)
      )
    : [];
  return (
    <div
      className="flex items-center border-b border-gray-200 px-6 hover:bg-gray-100"
      style={{ height: `${heightPercentage}%` }}
    >
      {/* Image container with fixed dimensions */}
      <div className="flex-shrink-0 h-28 w-28 relative mr-4">
        {event.images && event.images.length > 0 ? (
          <img
            src={event.images[0]}
            alt={event.nombreEvento}
            className="h-full w-full  rounded-lg cursor-pointer"
            onClick={() => onImageClick && onImageClick(event.images[0])}
          />
        ) : (
          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-xs">Sin imagen</span>
          </div>
        )}
      </div>

      {/* Event details - Using prefix // and / as in the screenshot */}
      <div className="flex-grow">
        {/* Event title with prefix // */}
        <h3 className="font-bold text-xl">{event.nombreEvento}</h3>

        {/* Event type with prefix / */}
        <div className="flex items-center">
          <p className="text-base">{event.tipoEvento}</p>
        </div>

        {/* Modificamos esta parte para usar los devices filtrados */}
        {filteredDevices.length > 0 && (
          <div className="text-xl">{filteredDevices[0]}</div>
        )}
      </div>

      {/* Right side info: location and time */}
      <div className="flex flex-col items-end">
        {/* Location with prefix / */}
        <p className="text-base text-right">{event.lugar}</p>

        {/* Time range */}
        <p className="text-base font-medium">
          {event.horaInicialSalon} a {event.horaFinalSalon}HRS
        </p>
      </div>
    </div>
  );
};

const PDTemplate1Vertical = ({
  events,
  template,
  weatherData,
  currentTime,
  qrCodeUrl,
  t,
  screenNumber,
  publicidad,
  nombrePantallasDirectorio = [],
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });
  // State for full screen image functionality
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(null);

  // Fixed number of events per page - always 4 for vertical layout
  const eventsPerPage = 4;

  // Dividir eventos en grupos para el slider
  const chunkEvents = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const eventChunks = chunkEvents(events, eventsPerPage);
  const shouldUseSlider = events.length > eventsPerPage;

  // Monitor window size for responsive adjustments
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial call

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Set loading to false when weather data is fetched or times out
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    if (weatherData) {
      setIsLoading(false);
      clearTimeout(timer);
    }

    return () => clearTimeout(timer);
  }, [weatherData]);

  // Update date every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Check for primeraImagen flag in events
  useEffect(() => {
    const eventWithPrimeraImagen = events.find(
      (event) => event.primeraImagen && event.images?.length > 0
    );

    if (eventWithPrimeraImagen) {
      setFullScreenImage(eventWithPrimeraImagen.images[0]);
      setShowFullScreen(true);
    } else {
      setShowFullScreen(false);
    }
  }, [events]);

  // Get template settings with defaults
  const templateActual = {
    templateColor: "#E2E8F0",
    fontColor: "#000000",
    fontStyle: "sans-serif",
    ...template,
  };
  console.log(
    "🚀 ~ PDTemplate1Vertical.jsx:147 ~ templateActual:",
    templateActual
  );

  // Get the screen name from template if available
  const screenName =
    template?.nombrePantallas?.[screenNumber - 1] || `Pantalla ${screenNumber}`;

  // Añadir aquí el nuevo código de rotación
  const getRotationDirection = () => {
    // Primero, buscar en pantallaSettings con isPortrait true
    const portraitSetting = templateActual.pantallaSettings?.find(
      (setting) => setting.isPortrait && setting.rotationDirection
    );

    // Si no se encuentra, buscar en pantallasSettings
    if (!portraitSetting && templateActual.pantallasSettings) {
      const portraitScreenSetting = Object.values(
        templateActual.pantallasSettings
      ).find((setting) => setting.setPortrait === true);

      // Si se encuentra una pantalla en vertical, usar -90 por defecto
      if (portraitScreenSetting) {
        return -90;
      }
    }

    // Si se encuentra en pantallaSettings, usar su rotationDirection
    if (portraitSetting && portraitSetting.rotationDirection) {
      return portraitSetting.rotationDirection;
    }

    // Por defecto, rotar -90 grados
    return -90;
  };

  const rotationDirection = getRotationDirection();
  // Configuración del slider con autoplay
  const [sliderRef] = useKeenSlider(
    {
      slides: {
        perView: 1,
        spacing: 10,
      },
      loop: true,
      mode: "snap",
      dragSpeed: 0.5,
      defaultAnimation: {
        duration: 2000,
      },
    },
    [
      // Plugin de autoplay
      (slider) => {
        let timeout;
        let mouseOver = false;

        function clearNextTimeout() {
          clearTimeout(timeout);
        }

        function nextTimeout() {
          clearTimeout(timeout);
          if (mouseOver) return;
          timeout = setTimeout(() => {
            slider.next();
          }, 5000); // 5 segundos de autoplay
        }

        slider.on("created", () => {
          slider.container.addEventListener("mouseover", () => {
            mouseOver = true;
            clearNextTimeout();
          });
          slider.container.addEventListener("mouseout", () => {
            mouseOver = false;
            nextTimeout();
          });
          nextTimeout();
        });

        slider.on("dragStarted", clearNextTimeout);
        slider.on("animationEnded", nextTimeout);
        slider.on("updated", nextTimeout);
      },
    ]
  );

  const formatCompleteDate = () => {
    const diasSemana = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];

    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    const now = new Date();
    const diaSemana = diasSemana[now.getDay()];
    const dia = now.getDate();
    const mes = meses[now.getMonth()];
    const year = now.getFullYear();

    return `${diaSemana} ${dia} ${mes} ${year}`;
  };
  // Format current date in Spanish and English
  const formatDate = (language) => {
    const options = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    if (language === "es") {
      return currentDate.toLocaleDateString("es-ES", options);
    } else {
      return currentDate.toLocaleDateString("en-US", options);
    }
  };
  // Add a useEffect to prevent body scrolling
  useEffect(() => {
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
  }, []);

  // Renderizar el header (encabezado) para mantener consistencia
  const renderHeader = () => (
    <header className="px-8 py-4 flex justify-between items-center border-b">
      {/* Logo */}
      <div className="flex-shrink-0 w-36 h-20">
        {templateActual.logo ? (
          <img
            src={templateActual.logo}
            alt="Logo"
            className="h-full w-auto object-contain rounded-lg"
          />
        ) : (
          <div className="h-full w-full bg-gray-100 flex items-center justify-center rounded">
            <span className="text-gray-400">Logo</span>
          </div>
        )}
      </div>

      {/* Title and Date */}
      <div
        className="flex flex-col items-center text-color "
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
            <p className="text-2xl font-bold">Today&rsquo;s Events</p>
          </>
        )}

        {templateActual.idioma === "es" && (
          <p className="text-sm text-center">{formatDate("es")}</p>
        )}

        {templateActual.idioma === "en" && (
          <p className="text-sm text-center">{formatDate("en")}</p>
        )}

        {templateActual.idioma === "es-en" && (
          <>
            <p className="text-sm">{formatDate("es")}</p>
            <p className="text-sm">{formatDate("en")}</p>
          </>
        )}
      </div>

      {/* Weather and Time */}
      <div className="flex flex-col items-end ">
        {isLoading ? (
          <div className="animate-pulse flex space-x-2">
            <div className="rounded-full bg-gray-200 h-4 w-4"></div>
            <div className="rounded bg-gray-200 h-4 w-10"></div>
          </div>
        ) : weatherData ? (
          <>
            <div className="flex items-center">
              {weatherData.icon && (
                <img
                  src={weatherData.icon}
                  alt="Weather"
                  className="h-5 w-5 mr-1"
                />
              )}
              <span className="text-base font-medium text-color">
                {weatherData.temp_c
                  ? `${weatherData.temp_c.toFixed(1)} °C`
                  : "Sin datos"}
              </span>
            </div>

            <div className="flex items-center">
              <img src="/img/reloj.png" className="p-1 h-8 mt-1" alt="Clock" />
              <div className="text-lg font-semibold text-color mt-0.5">
                {currentTime}
              </div>
            </div>
          </>
        ) : (
          <span className="text-base text-color">Sin datos</span>
        )}
      </div>
    </header>
  );

  return (
    <div className="h-screen w-screen overflow-hidden bg-white">
      {/* Rotated container */}
      <div
        style={{
          position: "absolute",
          width: windowSize.height,
          height: windowSize.width,
          top: (windowSize.height - windowSize.width) / 2,
          left: (windowSize.width - windowSize.height) / 2,
          transform: `rotate(${rotationDirection}deg)`,
          fontFamily: templateActual.fontStyle,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white",
        }}
      >
        {/* Header Section */}
        {renderHeader()}

        {/* Si se debe mostrar una imagen a pantalla completa */}
        {showFullScreen && fullScreenImage ? (
          <div className="flex-grow flex items-center justify-center bg-black relative">
            <img
              src={fullScreenImage}
              alt="Evento a pantalla completa"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ) : (
          <>
            {/* Main Content Area - Restructured for vertical layout */}
            <div className="flex-1 flex flex-col">
              {/* Events Section - Increased flex-grow for more space */}
              <div className="flex-grow flex flex-col" style={{ flexGrow: 3 }}>
                {/* Events Header */}
                <div
                  className="py-2 px-4 text-center"
                  style={{
                    backgroundColor: templateActual.templateColor,
                    color: templateActual.fontColor,
                  }}
                >
                  <h2 className="text-2xl font-bold uppercase">
                    {" "}
                    {templateActual.idioma === "en" && "EVENTS"}
                    {templateActual.idioma === "es" && "EVENTOS"}
                    {templateActual.idioma === "es-en" && "EVENTOS / EVENTS"}
                  </h2>
                </div>

                {/* Events Content */}
                <div className="flex-grow bg-gray-50 overflow-auto">
                  {events.length > 0 ? (
                    shouldUseSlider ? (
                      <div ref={sliderRef} className="keen-slider h-full">
                        {eventChunks.map((chunk, index) => (
                          <div
                            key={index}
                            className="keen-slider__slide overflow-hidden h-full"
                          >
                            <div className="flex flex-col h-full">
                              {chunk.map((event, eventIndex) => (
                                <EventRow
                                  key={`event-${index}-${eventIndex}`}
                                  event={event}
                                  screenName={screenName}
                                  total={chunk.length}
                                  heightPercentage={100 / eventsPerPage}
                                  nombrePantallasDirectorio={
                                    nombrePantallasDirectorio
                                  }
                                  onImageClick={(image) => {
                                    setFullScreenImage(image);
                                    setShowFullScreen(true);
                                  }}
                                />
                              ))}
                              {/* Fill remaining slots with empty rows */}
                              {Array.from({
                                length: eventsPerPage - chunk.length,
                              }).map((_, i) => (
                                <div
                                  key={`empty-${index}-${i}`}
                                  className="flex-grow border-b border-gray-200"
                                  style={{ height: `${100 / eventsPerPage}%` }}
                                ></div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col">
                        {events.map((event, index) => (
                          <EventRow
                            key={`event-${index}`}
                            event={event}
                            screenName={screenName}
                            total={events.length}
                            heightPercentage={100 / eventsPerPage}
                            nombrePantallasDirectorio={
                              nombrePantallasDirectorio
                            }
                            onImageClick={(image) => {
                              setFullScreenImage(image);
                              setShowFullScreen(true);
                            }}
                          />
                        ))}
                        {/* Fill remaining slots with empty rows */}
                        {Array.from({
                          length: Math.max(0, eventsPerPage - events.length),
                        }).map((_, i) => (
                          <div
                            key={`empty-${i}`}
                            className="flex-grow border-b border-gray-200"
                            style={{ height: `${100 / eventsPerPage}%` }}
                          ></div>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">
                        No hay eventos programados
                      </p>
                    </div>
                  )}
                </div>
                {/* News Header */}
                <div
                  className="py-1 px-4 text-center"
                  style={{
                    backgroundColor: templateActual.templateColor,
                    color: templateActual.fontColor,
                  }}
                >
                  <h2 className="text-2xl font-bold uppercase">
                    {" "}
                    {templateActual.idioma === "en" && "NEWS"}
                    {templateActual.idioma === "es" && "NOTICIAS"}
                    {templateActual.idioma === "es-en" && "NOTICIAS / NEWS"}
                  </h2>
                </div>
              </div>

              {/* News/RSS Section */}
              <div className="bg-white">
                {/* RSS Feed */}
                <div className="h-40 flex items-center">
                  <div className="w-3/4">
                    <SliderRSS />
                  </div>

                  {/* QR Code */}
                  <div className="w-1/4 flex flex-col items-center justify-center h-full">
                    {qrCodeUrl ? (
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-xs text-gray-600 mb-1">
                          {templateActual.idioma === "en" && "Events QR"}
                          {templateActual.idioma === "es" && "QR de Eventos"}
                          {templateActual.idioma === "es-en" &&
                            "QR de Eventos / Events QR"}
                        </span>
                        <QRCode value={qrCodeUrl} size={60} />
                      </div>
                    ) : (
                      <span className="text-gray-500 text-xs">
                        QR no disponible
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Advertising Section - Now with more height (width when rotated) */}
            <div className="w-full flex justify-center">
              {" "}
              <div
                className="h-64 mb-2 w-[35rem] bg-white rounded-lg overflow-hidden"
                style={{ flexShrink: 0 }}
              >
                {publicidad ? (
                  <img
                    src={publicidad}
                    alt="Publicidad"
                    className="object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">
                    <span className="text-gray-400">Espacio publicitario</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

PDTemplate1Vertical.propTypes = {
  events: PropTypes.array.isRequired,
  template: PropTypes.object,
  weatherData: PropTypes.object,
  currentTime: PropTypes.string.isRequired,
  qrCodeUrl: PropTypes.string,
  t: PropTypes.func,
  screenNumber: PropTypes.number,
  nombrePantallasDirectorio: PropTypes.array,
  publicidad: PropTypes.string,
};

EventRow.propTypes = {
  event: PropTypes.object.isRequired,
  screenName: PropTypes.string,
  total: PropTypes.number,
  heightPercentage: PropTypes.number.isRequired,
  nombrePantallasDirectorio: PropTypes.array,
  onImageClick: PropTypes.func,
};

export default PDTemplate1Vertical;
