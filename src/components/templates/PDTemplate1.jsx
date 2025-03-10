import React, { useState, useEffect } from "react";
import { useKeenSlider } from "keen-slider/react";
import PropTypes from "prop-types";
import QRCode from "qrcode.react";
import "keen-slider/keen-slider.min.css";
import SliderRSS from "../SliderRSS";

const PDTemplate1 = ({
  events,
  template,
  weatherData,
  currentTime,
  qrCodeUrl,
}) => {
  console.log("🚀 ~ PDTemplate1.jsx:17 ~ template:", template);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  const [isLoading, setIsLoading] = useState(true);

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

  // Update window size on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Setup for date formatting
  const [currentDate, setCurrentDate] = useState(new Date());

  // Determinar cuando mostrar el slider
  const portraitThreshold = 5;
  const landscapeThreshold = 5;
  const eventThreshold = template.setPortrait
    ? portraitThreshold
    : landscapeThreshold;
  const shouldUseSlider = events.length > eventThreshold;

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

  // Update date every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Modifica la configuración del slider para añadir autoplay
  // Reemplaza el código actual por este:

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
      slideChanged(slider) {
        console.log("Slide changed to:", slider.track.details.abs);
      },
    },
    [
      // Añadir el plugin de autoplay
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

  // Dividir eventos en grupos para el slider
  const chunkEvents = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const eventChunks = chunkEvents(events, eventThreshold);

  // Get template settings with defaults
  const templateActual = {
    templateColor: "#00BFFF",
    fontColor: "#FFFFFF",
    fontStyle: "Arial, sans-serif",
    idioma: "es-en",
    ...template,
  };

  // Event display component for landscape mode
  const EventCardLandscape = ({ event, index }) => (
    <div
      className="flex items-center space-x-4 border-b pr-8"
      style={{
        height: event ? "130px" : "129px",
        borderColor: templateActual.templateColor || "#e5e7eb",
      }}
    >
      {event ? (
        <>
          <div className="my-auto flex justify-center items-center relative overflow-hidden w-[7vw] h-[7vw]">
            <img
              style={{
                objectFit: "cover",
              }}
              src={event.images && event.images[0]}
              alt={event.nombreEvento}
              className=""
            />
          </div>

          <div className="w-full">
            <h3 className="font-bold mb-4 text-lg">{event.nombreEvento}</h3>
            <div className="grid grid-cols-3 gap-1 font-bold text-2xl">
              {/* Columna 1: Tipo de evento (arriba, span completo) */}
              <p className="col-span-3 text-sm">{event.tipoEvento}</p>

              {/* Columna 1: Dispositivo (a la izquierda) */}
              <p className="text-sm">{event.devices && event.devices[0]}</p>

              {/* Columna 2: Lugar (en el centro) */}
              <p className="text-center text-sm">{event.lugar}</p>

              {/* Columna 3: Rango de horas (a la derecha) */}
              <p className="text-right text-sm">
                {event.horaInicialReal || "00:00"} a{" "}
                {event.horaFinalReal || "23:59"}HRS
              </p>
            </div>
          </div>
        </>
      ) : (
        // Si no hay evento, mostrar el espacio vacío
        <p></p>
      )}
    </div>
  );

  // Event display component for portrait mode
  const EventCardPortrait = ({ event, index }) => (
    <div
      className="flex items-center space-x-4 space-y-5 border-b pr-16"
      style={{
        height: event ? "123px" : "122px",
        borderColor: templateActual.templateColor || "#e5e7eb",
      }}
    >
      {event ? (
        <>
          <div className="my-auto flex justify-center items-center relative overflow-hidden w-[7vw] h-[7vw]">
            <img
              style={{
                objectFit: "object-cover",
              }}
              src={event.images && event.images[0]}
              alt={event.nombreEvento}
              className=""
            />
          </div>

          <div className="w-full">
            <h3 className="font-bold mb-4 text-xl">{event.nombreEvento}</h3>
            <div className="grid grid-cols-3 gap-1 font-bold text-2xl">
              {/* Columna 1: Tipo de evento (arriba, span completo) */}
              <p className="col-span-3 text-base">{event.tipoEvento}</p>

              {/* Columna 1: Dispositivo (a la izquierda) */}
              <p className="text-base">{event.devices && event.devices[0]}</p>

              {/* Columna 2: Lugar (en el centro) */}
              <p className="text-center text-base">{event.lugar}</p>

              {/* Columna 3: Rango de horas (a la derecha) */}
              <p className="text-right text-lg">
                {event.horaInicialReal || "00:00"} a{" "}
                {event.horaFinalReal || "23:59"}HRS
              </p>
            </div>
          </div>
        </>
      ) : (
        // Si no hay evento, mostrar el espacio vacío
        <p></p>
      )}
    </div>
  );

  // Handle language display
  const getLanguageDisplay = (esContent, enContent) => {
    switch (templateActual.idioma) {
      case "es":
        return esContent;
      case "en":
        return enContent;
      case "es-en":
      default:
        return (
          <>
            {esContent}
            {enContent}
          </>
        );
    }
  };

  return (
    <section className="relative inset-0 w-full min-h-screen md:fixed sm:fixed min-[120px]:fixed z-20 bg-white">
      <div
        style={{
          transform: template.setPortrait ? "rotate(90deg)" : "rotate(0deg)",
          maxWidth: template.setPortrait ? "100vh" : "", // Establecer el ancho máximo para ajustarse a la pantalla
          height: template.setPortrait ? "100vh" : "", // Ajustar la altura según la orientación
          width: template.setPortrait ? "100%" : "", // Asegurar que el ancho se ajuste correctamente
          marginLeft: template.setPortrait ? "auto" : "",
          marginRight: template.setPortrait ? "0px" : "",
        }}
      >
        {/* Header Section - 10vh */}
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
            className="flex flex-col items-center "
            style={{ fontFamily: templateActual.fontStyle }}
          >
            {templateActual.idioma === "es" && (
              <h1 className="text-2xl font-bold text-center">
                Eventos del día
              </h1>
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
            className="flex-col text-color"
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
                    src={
                      weatherData.current?.condition?.icon || weatherData.icon
                    }
                    alt="Clima"
                  />
                  <p className="text-2xl font-bold -ml-4 w-24">
                    {weatherData.current?.temp_c || weatherData.temp_c} °C
                  </p>
                  <div className="flex justify-center col-span-2">
                    <p className="text-2xl font-bold">{currentTime}</p>
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

        {/* Main Content - 80vh */}
        <div className="h-[76vh]">
          {!template.setPortrait ? (
            // LANDSCAPE MODE
            <div className="grid grid-cols-4 h-full">
              <div className="col-span-3 h-full flex flex-col mx-3">
                {/* Events Header */}
                <div
                  className="text-center uppercase font-bold px-20 rounded-t-xl h-8 flex justify-center items-center"
                  style={{
                    background: `linear-gradient(to bottom, ${templateActual.templateColor} 70%, #e3e3e3d9)`,
                    color: templateActual.fontColor,
                  }}
                >
                  <h2 className="text-xl">
                    {templateActual.idioma === "en" && "EVENTS"}
                    {templateActual.idioma === "es" && "EVENTOS"}
                    {templateActual.idioma === "es-en" && "EVENTOS / EVENTS"}
                  </h2>
                </div>

                {/* Events List - Landscape */}
                <div className="flex-1 bg-gradient-to-t from-white to-gray-200 overflow-y-auto">
                  <div className="flex flex-col text-black">
                    <div className="pl-5 flex-grow">
                      {/* Slider content */}
                      <div
                        style={{
                          display: shouldUseSlider ? "block" : "none",
                        }}
                      >
                        <div ref={sliderRef} className="keen-slider">
                          {eventChunks.map((slideEventos, index) => (
                            <div key={index} className="keen-slider__slide">
                              {Array.from({
                                length: landscapeThreshold,
                              }).map((_, innerIndex) => {
                                const evento = slideEventos[innerIndex];
                                return (
                                  <EventCardLandscape
                                    key={`slider-landscape-${index}-${innerIndex}`}
                                    event={evento}
                                    index={innerIndex}
                                  />
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Static content */}
                      <div
                        style={{
                          display: shouldUseSlider ? "none" : "block",
                        }}
                      >
                        {events.length > 0 ? (
                          <div>
                            {Array.from({
                              length: landscapeThreshold,
                            }).map((_, index) => {
                              const evento =
                                index < events.length ? events[index] : null;
                              return (
                                <EventCardLandscape
                                  key={`static-landscape-${index}`}
                                  event={evento}
                                  index={index}
                                />
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            No hay eventos para mostrar
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* News Footer */}
                <div
                  className="text-center uppercase font-bold px-20 rounded-b-xl h-8 flex justify-center items-center"
                  style={{
                    background: `linear-gradient(to top, ${templateActual.templateColor} 70%, #e3e3e3d9)`,
                    color: templateActual.fontColor,
                  }}
                >
                  <h2 className="text-xl">
                    {templateActual.idioma === "en" && "NEWS"}
                    {templateActual.idioma === "es" && "NOTICIAS"}
                    {templateActual.idioma === "es-en" && "NOTICIAS / NEWS"}
                  </h2>
                </div>
              </div>

              {/* Advertisement Column - Landscape */}
              <div className="col-span-1 flex items-center justify-center mx-3">
                {templateActual.publicidad && (
                  <div style={{ height: "100%", borderRadius: "10px" }}>
                    <img
                      src={templateActual.publicidad}
                      alt="Advertisement"
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "10px",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            // PORTRAIT MODE
            <div className="h-full">
              {/* Events Header - Portrait */}
              <div
                className="text-center uppercase font-bold px-20 rounded-t-xl h-8 flex justify-center items-center"
                style={{
                  background: `linear-gradient(to bottom, ${templateActual.templateColor} 70%, #e3e3e3d9)`,
                  color: templateActual.fontColor,
                }}
              >
                <h2 className="text-2xl">
                  {templateActual.idioma === "en" && "EVENTS"}
                  {templateActual.idioma === "es" && "EVENTOS"}
                  {templateActual.idioma === "es-en" && "EVENTOS / EVENTS"}
                </h2>
              </div>

              {/* Events List - Portrait */}
              <div className="bg-gradient-to-t from-white to-gray-200 relative z-20 h-[calc(100%-96px)]">
                <div className="text-black h-full">
                  <div className="flex flex-col h-full">
                    <div className="pl-5 flex-grow">
                      {/* Portrait slider/static view with different sizing */}
                      <div
                        style={{ display: shouldUseSlider ? "block" : "none" }}
                      >
                        <div ref={sliderRef} className="keen-slider">
                          {eventChunks.map((slideEventos, index) => (
                            <div
                              key={index}
                              className="keen-slider__slide my-2"
                            >
                              {Array.from({ length: portraitThreshold }).map(
                                (_, innerIndex) => {
                                  const evento = slideEventos[innerIndex];
                                  return (
                                    <EventCardPortrait
                                      key={`slider-portrait-${index}-${innerIndex}`}
                                      event={evento}
                                      index={innerIndex}
                                    />
                                  );
                                }
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Static portrait view */}
                      <div
                        style={{ display: shouldUseSlider ? "none" : "block" }}
                      >
                        {events.length > 0 ? (
                          <div>
                            {Array.from({ length: portraitThreshold }).map(
                              (_, index) => {
                                const evento =
                                  index < events.length ? events[index] : null;
                                return (
                                  <EventCardPortrait
                                    key={`static-portrait-${index}`}
                                    event={evento}
                                    index={index}
                                  />
                                );
                              }
                            )}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            No hay eventos para mostrar
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* News Footer - Portrait */}
              <div
                className="text-center uppercase font-bold px-20 rounded-b-xl h-8 flex justify-center items-center"
                style={{
                  background: `linear-gradient(to top, ${templateActual.templateColor} 70%, #e3e3e3d9)`,
                  color: templateActual.fontColor,
                }}
              >
                <h2 className="text-2xl">
                  {templateActual.idioma === "en" && "NEWS"}
                  {templateActual.idioma === "es" && "NOTICIAS"}
                  {templateActual.idioma === "es-en" && "NOTICIAS / NEWS"}
                </h2>
              </div>
            </div>
          )}
        </div>

        {/* Footer - 10vh */}
        <div className="h-[12vh] bg-white">
          <div className="flex justify-between items-center h-full px-4">
            {/* RSS Feed */}
            <div className="w-9/12">
              <div className="flex items-center h-[11vh] font-black bg-gradient-to-r from-gray-300 to-white w-full rounded-md">
                <SliderRSS />
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center">
              <p className="text-center">
                {templateActual.idioma === "en" && "Events QR"}
                {templateActual.idioma === "es" && "QR de Eventos"}
                {templateActual.idioma === "es-en" &&
                  "QR de Eventos / Events QR"}
              </p>
              {(qrCodeUrl || templateActual.qrCodeUrl) && (
                <a
                  href={qrCodeUrl || templateActual.qrCodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ cursor: "pointer" }}
                >
                  {/* Muestra el código QR */}
                  <QRCode
                    value={qrCodeUrl || templateActual.qrCodeUrl}
                    size={70}
                  />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Portrait mode advertisement - positioned at the bottom */}
        {template.setPortrait && templateActual.publicidad && (
          <div
            className="bottom-0 left-0 right-0 flex items-center justify-center mx-3"
            style={{ zIndex: 10 }}
          >
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                width: "100%",
                height: "22vw",
                borderRadius: "10px",
              }}
            >
              <img
                src={templateActual.publicidad}
                alt="Advertisement"
                style={{
                  width: "100%",
                  height: "27vw",
                  objectFit: "cover",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

PDTemplate1.propTypes = {
  events: PropTypes.array.isRequired,
  template: PropTypes.object,
  weatherData: PropTypes.object,
  currentTime: PropTypes.string.isRequired,
  qrCodeUrl: PropTypes.string,
};

export default PDTemplate1;
