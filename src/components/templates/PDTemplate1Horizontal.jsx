import React, { useState, useEffect } from "react";
import { useKeenSlider } from "keen-slider/react";
import PropTypes from "prop-types";
import QRCode from "qrcode.react";
import "keen-slider/keen-slider.min.css";
import SliderRSS from "../SliderRSS";

const PDTemplate1Horizontal = ({
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

  // Fixed number of events per page - always 4
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

  // Get template settings with defaults
  const templateActual = {
    templateColor: "#E2E8F0",
    fontColor: "#000000",
    fontStyle: "sans-serif",
    ...template,
  };

  // Get the screen name from template if available
  const screenName =
    template?.nombrePantallas?.[screenNumber - 1] || `Pantalla ${screenNumber}`;

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

  // Renderizar el header (encabezado)
  const renderHeader = () => (
    <header className="px-8 flex justify-between items-center">
      {/* Logo */}
      <div className="flex-shrink-0 w-44 h-20">
        {templateActual.logo ? (
          <img
            src={templateActual.logo}
            alt="Logo"
            className="h-full w-auto object-contain "
          />
        ) : (
          <div className="h-full w-full bg-gray-100 flex items-center justify-center rounded">
            <span className="text-gray-400">Logo</span>
          </div>
        )}
      </div>

      {/* Title and Date */}
      <div
        className="flex flex-col items-center "
        style={{ fontFamily: templateActual.fontStyle }}
      >
        {templateActual.idioma === "es" && (
          <h1 className="text-xl font-bold text-center">Eventos del día</h1>
        )}

        {templateActual.idioma === "en" && (
          <h1 className="text-xl font-bold text-center">
            Today&rsquo;s Events
          </h1>
        )}

        {templateActual.idioma === "es-en" && (
          <>
            <p className="text-xl font-bold">Eventos del día</p>
            <p className="text-xl font-bold">Today&rsquo;s Events</p>
          </>
        )}

        {templateActual.idioma === "es" && (
          <p className="text-xs text-center">{formatDate("es")}</p>
        )}

        {templateActual.idioma === "en" && (
          <p className="text-xs text-center">{formatDate("en")}</p>
        )}

        {templateActual.idioma === "es-en" && (
          <>
            <p className="text-xs">{formatDate("es")}</p>
            <p className="text-xs">{formatDate("en")}</p>
          </>
        )}
      </div>

      {/* Weather and Time */}
      <div className="flex flex-col items-end">
        {isLoading ? (
          <div className="animate-pulse flex space-x-2">
            <div className="rounded-full bg-gray-200 h-5 w-5"></div>
            <div className="rounded bg-gray-200 h-5 w-12"></div>
          </div>
        ) : weatherData ? (
          <>
            <div className="flex items-center">
              {weatherData.icon && (
                <img
                  src={weatherData.icon}
                  alt="Weather"
                  className="h-6 w-6 mr-1"
                />
              )}
              <span className="text-lg font-medium text-color">
                {weatherData.temp_c
                  ? `${weatherData.temp_c.toFixed(1)} °C`
                  : "Sin datos"}
              </span>
            </div>
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
    </header>
  );

  // Si se debe mostrar una imagen a pantalla completa
  if (showFullScreen && fullScreenImage) {
    return (
      <div
        className="flex flex-col h-screen bg-white overflow-hidden"
        style={{ fontFamily: templateActual.fontStyle }}
      >
        {/* Header sigue siendo visible */}
        {renderHeader()}

        {/* Imagen a pantalla completa */}
        <div className="flex-grow flex items-center justify-center bg-black relative">
          <img
            src={fullScreenImage}
            alt="Evento a pantalla completa"
            className="max-h-full max-w-full object-contain"
          />
        </div>
      </div>
    );
  }

  // Vista normal
  return (
    <div
      className="flex flex-col h-screen bg-white overflow-hidden"
      style={{ fontFamily: templateActual.fontStyle }}
    >
      {/* Header Section */}
      {renderHeader()}

      {/* Main Content Area - Restructured */}
      <div className="flex flex-col flex-grow overflow-hidden">
        {/* Upper Section: Events and Advertising side by side */}
        <div className="flex flex-grow mx-2">
          {/* Events Column - 75% */}
          <div className="w-3/4 mr-2  flex flex-col">
            {/* Events Header */}
            <div
              className="py-2 px-4 text-center rounded-t-lg"
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
            <div className="flex-grow overflow-auto bg-gray-50 flex flex-col">
              {shouldUseSlider ? (
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
                      nombrePantallasDirectorio={nombrePantallasDirectorio}
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
              )}
            </div>
            {/* News Header */}
            <div
              className="py-1 px-4 text-center rounded-b-lg"
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

          {/* Advertising Column - 25% */}
          <div className="w-1/4 flex items-center justify-center ">
            {publicidad ? (
              <div className="p-2 overflow-hidden">
                <img
                  src={publicidad}
                  alt="Publicidad"
                  className=" object-contain rounded-lg shadow-sm"
                />
              </div>
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">
                <span className="text-gray-400">Espacio publicitario</span>
              </div>
            )}
          </div>
        </div>

        {/* Lower Section: News and QR side by side */}
        <div className="flex h-32 py-1  ">
          {/* News Column - 75% */}
          <div className="w-3/4 flex ml-2 flex-col">
            {/* RSS Feed */}
            <div className="flex-grow bg-white">
              <SliderRSS />
            </div>
          </div>

          {/* QR Code Column - 25% */}
          <div className="w-1/4 flex flex-col items-center ">
            {qrCodeUrl ? (
              <div className="flex flex-col items-center justify-center ">
                <span className="text-xs text-gray-600 mb-1">
                  {templateActual.idioma === "en" && "Events QR"}
                  {templateActual.idioma === "es" && "QR de Eventos"}
                  {templateActual.idioma === "es-en" &&
                    "QR de Eventos / Events QR"}
                </span>
                <QRCode value={qrCodeUrl} size={60} />
              </div>
            ) : (
              <span className="text-gray-500 text-xs">QR no disponible</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Event display component that matches the design in the screenshots
const EventRow = ({
  event,
  screenName,
  total,
  nombrePantallasDirectorio = [],
  onImageClick,
}) => {
  if (!event) return null;

  // Calculate height percentage based on number of events
  const heightPercentage = 100 / 4; // Always show 4 events

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
            className="h-full w-full object-contain rounded-lg cursor-pointer"
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
        <h3 className="font-bold text-2xl">{event.nombreEvento}</h3>

        {/* Event type with prefix / */}
        <div className="flex items-center">
          <p className="text-xl">{event.tipoEvento}</p>
        </div>

        {/* Modificamos esta parte para usar los devices filtrados */}
        {filteredDevices.length > 0 && (
          <div className="text-xl">{filteredDevices[0]}</div>
        )}
      </div>

      {/* Right side info: location and time */}
      <div className="flex flex-col items-end">
        {/* Location with prefix / */}
        <p className="text-xl text-right">{event.lugar}</p>

        {/* Time range */}
        <p className="text-xl font-medium">
          {event.horaInicialSalon} a {event.horaFinalSalon}HRS
        </p>
      </div>
    </div>
  );
};

PDTemplate1Horizontal.propTypes = {
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
  nombrePantallasDirectorio: PropTypes.array,
  onImageClick: PropTypes.func,
};

export default PDTemplate1Horizontal;
