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

  // Número máximo de eventos a mostrar por página en vista horizontal
  const eventsPerPage = 5;

  // Determinar cuando mostrar el slider
  const shouldUseSlider = events.length > eventsPerPage;

  // Format current date in correct language format
  const formatDate = () => {
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
      "ENERO",
      "FEBRERO",
      "MARZO",
      "ABRIL",
      "MAYO",
      "JUNIO",
      "JULIO",
      "AGOSTO",
      "SEPTIEMBRE",
      "OCTUBRE",
      "NOVIEMBRE",
      "DICIEMBRE",
    ];

    const day = currentDate.getDay();
    const date = currentDate.getDate();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    return `${diasSemana[day]} ${date} DE ${meses[month]} ${year}`;
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
  // Get the screen name from template if available
  const screenName =
    template?.nombrePantallas?.[screenNumber - 1] || `Pantalla ${screenNumber}`;

  // Event display component for horizontal mode
  const EventCard = ({ event, index }) => (
    <div
      className="flex items-center space-x-4 border-b pr-8"
      style={{
        height: event ? "auto" : "110px",
        borderColor: templateActual.templateColor || "#e5e7eb",
      }}
    >
      {event ? (
        <>
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              width: "20vw",
              height: "20vw",
              maxWidth: "100px",
              maxHeight: "100px",
            }}
          >
            <img
              className="object-contain my-2 shadow-xl"
              src={event.images && event.images[0]}
              alt={event.nombreEvento}
              style={{
                width: "5vw",
                height: "5vw",
                objectFit: "cover",
              }}
            />
          </div>

          <div className="w-full">
            <h3 className="font-bold mb-4 text-base lg:text-3xl">
              {event.nombreEvento}
            </h3>
            <div className="grid grid-cols-3 gap-1 font-bold text-xs">
              {/* Columna 1: Tipo de evento (span completo) */}
              <p className="col-span-3">{event.tipoEvento}</p>

              {/* Mostramos el nombre de la pantalla específica a la que está asignado el evento */}
              <p className="text-base">
                {(event.devices &&
                  event.devices.find(
                    (d) =>
                      template?.nombrePantallas &&
                      Object.values(template.nombrePantallas).includes(d)
                  )) ||
                  screenName}
              </p>
              {/* Columna 1: Dispositivo (a la izquierda) */}
              <p className="">{event.devices && event.devices[0]}</p>

              {/* Columna 2: Lugar (en el centro) */}
              <p className="text-center">{event.lugar}</p>

              {/* Columna 3: Rango de horas (a la derecha) */}
              <p className="text-right">
                {event.horaInicialSalon} a {event.horaFinalSalon}HRS
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

  return (
    <section className="relative inset-0 w-full min-h-screen md:fixed sm:fixed min-[120px]:fixed bg-white">
      <div className="bg-white text-black flex flex-col justify-center">
        <div
          id="Content"
          className="flex-grow flex flex-col justify-center mx-2 my-2"
        >
          {/* Header */}
          <div className="flex flex-col items-center justify-center md:flex-row md:justify-between">
            {/* Logo en la esquina superior izquierda */}
            <div className="">
              {templateActual.logo && (
                <>
                  <div
                    className="max-w-[150px] lg:max-w-[250px]"
                    style={{
                      marginBottom: "20px",
                    }}
                  >
                    <img
                      src={templateActual.logo}
                      alt="Logo"
                      className="rounded-lg object-contain w-full h-full"
                    />
                  </div>
                </>
              )}
            </div>
            {/* Titulo, fecha y hora central */}
            <div className="flex flex-col text-color items-center md:ml-4">
              <p className="text-xs lg:text-2xl text-center mb-2">
                {obtenerFecha()} Hr: {currentTime}
              </p>
              <h1 className="text-2xl lg:text-4xl font-bold">
                Eventos del día
              </h1>
            </div>

            {/* Clima e Icono */}
            <div className="flex flex-col md:flex-row text-color items-center md:ml-4">
              {isLoading ? (
                <p>Cargando datos del clima...</p>
              ) : weatherData &&
                weatherData.current &&
                weatherData.current.temp_c ? (
                <div className="flex items-center justify-center md:mr-4">
                  <img
                    src={weatherData.current.condition.icon}
                    alt="Clima"
                    className="w-12"
                  />
                  <p className="text-2xl font-bold ml-2 mr-6">
                    {weatherData.current.temp_c} °C
                  </p>
                </div>
              ) : (
                <h2 className="text-2xl mr-16">Bienvenido</h2>
              )}
            </div>
          </div>

          <div className="">
            {/* Linea arriba */}
            <div
              className="text-white py-1 uppercase text-5xl md:text-7xl font-bold px-20 rounded-t-xl h-16"
              style={{
                background: `linear-gradient(to bottom, ${templateActual.templateColor} 70%, #e3e3e3d9)`,
                color: templateActual.fontColor,
                fontFamily: templateActual.fontStyle,
              }}
            >
              {/* Título */}
              <h2
                className="text-white text-4xl text-center"
                style={{
                  color: templateActual.fontColor,
                }}
              >
                EVENTOS
              </h2>
            </div>

            {/* Contenido principal */}
            <div className="bg-gradient-to-t from-white to-gray-200 text-gray-50">
              <div className="text-black">
                {/* Estructura de dos columnas: lista de eventos y publicidad */}
                <div className="flex flex-col md:flex-row">
                  {/* Columna de eventos - ocupa 3/4 del ancho */}
                  <div className="w-full md:w-3/4 space-y-5 pl-2 flex-grow">
                    {/* Slots predeterminados */}
                    {shouldUseSlider ? (
                      <div ref={sliderRef} className="keen-slider">
                        {eventChunks.map((slideEventos, index) => (
                          <div key={index} className="keen-slider__slide my-2">
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
                      <div>
                        {events.length > 0 ? (
                          Array.from({ length: eventsPerPage }).map(
                            (_, index) => {
                              const evento =
                                index < events.length ? events[index] : null;
                              return (
                                <EventCard
                                  key={`static-event-${index}`}
                                  event={evento}
                                  index={index}
                                />
                              );
                            }
                          )
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            No hay eventos para mostrar
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Columna de publicidad - ocupa 1/4 del ancho */}
                  <div className="w-full md:w-1/4 flex items-center justify-center">
                    {templateActual.publicidad && (
                      <div className="h-full w-full">
                        <img
                          src={templateActual.publicidad}
                          alt="Publicidad"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Linea abajo */}
            <div
              className="text-white py-1 uppercase text-5xl md:text-7xl font-bold px-20 rounded-b-xl h-16 flex justify-center items-end"
              style={{
                background: `linear-gradient(to top, ${templateActual.templateColor} 70%, #e3e3e3d9)`,
                color: templateActual.fontColor,
                fontFamily: templateActual.fontStyle,
              }}
            >
              {/* Footer */}
              <h2 className="text-white"></h2>
            </div>
          </div>

          {/* Footer with RSS and QR */}
          <div className="mt-4 flex justify-between items-center">
            <div className="w-3/4">
              <SliderRSS />
            </div>
            <div className="w-1/4 flex flex-col items-center">
              <p className="text-center">QR de Eventos</p>
              {qrCodeUrl && <QRCode value={qrCodeUrl} size={70} />}
            </div>
          </div>
        </div>
      </div>
    </section>
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
};

export default PDTemplate1Horizontal;
