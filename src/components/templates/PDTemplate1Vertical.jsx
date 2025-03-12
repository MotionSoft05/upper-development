import React, { useState, useEffect } from "react";
import { useKeenSlider } from "keen-slider/react";
import PropTypes from "prop-types";
import QRCode from "qrcode.react";
import "keen-slider/keen-slider.min.css";
import SliderRSS from "../SliderRSS";

// Event display component for vertical layout
const EventRow = ({ event, screenName, total, heightPercentage }) => {
  if (!event) return null;

  return (
    <div
      className="flex items-center border-b border-gray-200 px-6 hover:bg-gray-100"
      style={{ height: `${heightPercentage}%` }}
    >
      {/* Image container with fixed dimensions */}
      <div className="flex-shrink-0 h-16 w-16 relative mr-4">
        {event.images && event.images.length > 0 ? (
          <img
            src={event.images[0]}
            alt={event.nombreEvento}
            className="h-full w-full object-cover"
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
        <h3 className="font-bold text-lg">{event.nombreEvento}</h3>

        {/* Event type with prefix / */}
        <div className="flex items-center">
          <p className="text-sm">{event.tipoEvento}</p>
        </div>

        {/* Screen name or location if available */}
        {event.devices && event.devices[0] && (
          <div className="text-sm">{event.devices[0]}</div>
        )}
      </div>

      {/* Right side info: location and time */}
      <div className="flex flex-col items-end">
        {/* Location with prefix / */}
        <p className="text-sm text-right">{event.lugar}</p>

        {/* Time range */}
        <p className="text-sm font-medium">
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
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

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
          transform: "rotate(90deg)",
          fontFamily: templateActual.fontStyle,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white",
        }}
      >
        {/* Header Section */}
        <header className="px-8 py-4 flex justify-between items-center border-b">
          {/* Logo */}
          <div className="flex-shrink-0 w-24 h-10">
            {templateActual.logo ? (
              <img
                src={templateActual.logo}
                alt="Logo"
                className="h-full w-auto object-contain"
              />
            ) : (
              <div className="h-full w-full bg-gray-100 flex items-center justify-center rounded">
                <span className="text-gray-400">Logo</span>
              </div>
            )}
          </div>

          {/* Title and Date */}
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-bold text-center text-gray-800">
              Eventos del día
            </h1>
            <p className="text-xs text-gray-600">{formatCompleteDate()}</p>
          </div>

          {/* Weather and Time */}
          <div className="flex flex-col items-end">
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
                  <span className="text-base font-medium text-blue-600">
                    {weatherData.temp_c
                      ? `${weatherData.temp_c.toFixed(1)} °C`
                      : "Sin datos"}
                  </span>
                </div>

                <div className="flex items-center">
                  <img
                    src="/img/reloj.png"
                    className="p-1 h-8 mt-1"
                    alt="Clock"
                  />
                  <div className="text-base font-semibold text-gray-800 mt-0.5">
                    {currentTime}
                  </div>
                </div>
              </>
            ) : (
              <span className="text-base text-gray-500">Sin datos</span>
            )}
          </div>
        </header>

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
              <h2 className="text-2xl font-bold uppercase">EVENTOS</h2>
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
                  <p className="text-gray-500">No hay eventos programados</p>
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
              <h2 className="text-lg font-bold uppercase">NOTICIAS</h2>
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
                      QR de Eventos
                    </span>
                    <QRCode value={qrCodeUrl} size={60} />
                    <span className="text-xs text-gray-600 mt-1">
                      Escanea para más
                    </span>
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
        <div className="h-64 bg-white " style={{ flexShrink: 0 }}>
          {templateActual.publicidad ? (
            <img
              src={templateActual.publicidad}
              alt="Publicidad"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">Espacio publicitario</span>
            </div>
          )}
        </div>
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
};

export default PDTemplate1Vertical;
