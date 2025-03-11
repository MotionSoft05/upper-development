import React, { useState, useEffect } from "react";
import { useKeenSlider } from "keen-slider/react";
import PropTypes from "prop-types";
import QRCode from "qrcode.react";
import "keen-slider/keen-slider.min.css";
import SliderRSS from "../SliderRSS";

const PDTemplate1Vertical = ({
  events,
  template,
  weatherData,
  currentTime,
  qrCodeUrl,
  t,
  screenNumber,
}) => {
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

  // Número máximo de eventos a mostrar por página en vista vertical
  // Mostramos más eventos en vertical ya que tenemos más espacio vertical
  const eventsPerPage = 8;

  // Determinar cuando mostrar el slider
  const shouldUseSlider = events.length > eventsPerPage;

  // Format current date
  const obtenerFecha = () => {
    const diasSemana = [
      "DOMINGO",
      "LUNES",
      "MARTES",
      "MIÉRCOLES",
      "JUEVES",
      "VIERNES",
      "SÁBADO",
    ];

    const meses = [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
    ];

    const now = new Date();
    const diaSemana = diasSemana[now.getDay()];
    const dia = now.getDate();
    const mes = meses[now.getMonth()];

    return `${diaSemana} ${dia}/${mes} `;
  };

  // Update date every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

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
      slideChanged(slider) {
        console.log("Slide changed to:", slider.track.details.abs);
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

  // Dividir eventos en grupos para el slider
  const chunkEvents = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const eventChunks = chunkEvents(events, eventsPerPage);

  // Get template settings with defaults
  const templateActual = {
    templateColor: "#00BFFF",
    fontColor: "#FFFFFF",
    fontStyle: "Arial, sans-serif",
    ...template,
  };

  // Event display component for vertical mode - más compacto para aprovechar el espacio vertical
  const EventCard = ({ event, index }) => (
    <div
      className="flex items-center space-x-4 border-b pr-4 mx-2 py-2"
      style={{
        height: event ? "auto" : "90px",
        borderColor: templateActual.templateColor || "#e5e7eb",
      }}
    >
      {event ? (
        <>
          <div className="flex-shrink-0">
            <img
              className="object-cover shadow-md w-16 h-16 rounded-md"
              src={event.images && event.images[0]}
              alt={event.nombreEvento}
            />
          </div>

          <div className="flex-grow min-w-0">
            <h3 className="font-bold text-xl truncate">{event.nombreEvento}</h3>
            <div className="grid grid-cols-3 gap-1 text-sm">
              {/* Tipo de evento */}
              <p className="col-span-3 truncate">{event.tipoEvento}</p>

              <div className="col-span-3 grid grid-cols-3">
                {/* Dispositivo */}
                <p className="truncate">{event.devices && event.devices[0]}</p>

                {/* Lugar */}
                <p className="text-center truncate">{event.lugar}</p>

                {/* Horario */}
                <p className="text-right">
                  {event.horaInicialSalon} a {event.horaFinalSalon}
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p></p>
      )}
    </div>
  );

  return (
    <section className="relative inset-0 w-full min-h-screen md:fixed sm:fixed min-[120px]:fixed bg-white">
      {/* Contenedor principal - diseño optimizado para pantalla vertical */}
      <div className="flex flex-col h-screen bg-white">
        {/* Header - más compacto */}
        <header className="bg-white py-4">
          <div className="flex items-center justify-between px-4">
            {/* Logo y título en una fila */}
            <div className="flex items-center">
              {templateActual.logo && (
                <img
                  src={templateActual.logo}
                  alt="Logo"
                  className="h-16 w-auto object-contain mr-4"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">Eventos del día</h1>
                <p className="text-sm">
                  {obtenerFecha()} Hr: {currentTime}
                </p>
              </div>
            </div>

            {/* Clima */}
            <div className="flex items-center">
              {isLoading ? (
                <p className="text-sm">Cargando...</p>
              ) : weatherData &&
                weatherData.current &&
                weatherData.current.temp_c ? (
                <div className="flex items-center">
                  <img
                    src={weatherData.current.condition.icon}
                    alt="Clima"
                    className="w-10 h-10"
                  />
                  <p className="text-xl font-bold ml-2">
                    {weatherData.current.temp_c}°C
                  </p>
                </div>
              ) : (
                <h2 className="text-lg">Bienvenido</h2>
              )}
            </div>
          </div>
        </header>

        {/* Título de sección */}
        <div
          className="py-2 uppercase font-bold rounded-t-lg text-center"
          style={{
            background: `linear-gradient(to bottom, ${templateActual.templateColor} 70%, #e3e3e3d9)`,
            color: templateActual.fontColor,
            fontFamily: templateActual.fontStyle,
          }}
        >
          <h2 className="text-2xl">EVENTOS</h2>
        </div>

        {/* Lista de eventos - ocupa la mayor parte de la pantalla */}
        <div className="flex-grow bg-gradient-to-t from-white to-gray-200 overflow-y-auto">
          {shouldUseSlider ? (
            <div ref={sliderRef} className="keen-slider h-full">
              {eventChunks.map((slideEventos, index) => (
                <div
                  key={index}
                  className="keen-slider__slide h-full overflow-y-auto py-2"
                >
                  {Array.from({ length: eventsPerPage }).map(
                    (_, innerIndex) => {
                      const evento = slideEventos[innerIndex];
                      return (
                        <EventCard
                          key={`slider-event-${index}-${innerIndex}`}
                          event={evento}
                          index={innerIndex}
                        />
                      );
                    }
                  )}
                </div>
              ))}
            </div>
          ) : (
            // Vista estática sin slider
            <div className="h-full overflow-y-auto py-2">
              {events.length > 0 ? (
                Array.from({
                  length: Math.min(eventsPerPage, events.length),
                }).map((_, index) => {
                  const evento = events[index];
                  return (
                    <EventCard
                      key={`static-event-${index}`}
                      event={evento}
                      index={index}
                    />
                  );
                })
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No hay eventos para mostrar
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sección de publicidad - en pantalla vertical va despues de los eventos */}
        {templateActual.publicidad && (
          <div className="h-32 w-full">
            <img
              src={templateActual.publicidad}
              alt="Publicidad"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Footer con degradado */}
        <div
          className="py-1 uppercase font-bold rounded-b-lg"
          style={{
            background: `linear-gradient(to top, ${templateActual.templateColor} 70%, #e3e3e3d9)`,
            color: templateActual.fontColor,
            fontFamily: templateActual.fontStyle,
          }}
        >
          <h2 className="text-center text-xl">NOTICIAS</h2>
        </div>

        {/* Sección de RSS y QR - posicionados en la parte inferior */}
        <div className="bg-white py-3 flex items-center justify-between px-4">
          <div className="w-3/4 overflow-hidden">
            <SliderRSS />
          </div>
          <div className="flex flex-col items-center">
            <p className="text-xs text-center">QR de Eventos</p>
            {qrCodeUrl && <QRCode value={qrCodeUrl} size={60} />}
          </div>
        </div>
      </div>
    </section>
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
