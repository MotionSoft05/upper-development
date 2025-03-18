// src/components/templates/PSTemplate2.jsx
import GetLanguageDate from "@/components/getLanguageDate";
import EventImageSlider from "@/components/sliders/EventImageSlider";
import { useState, useEffect } from "react";

export const PSTemplate2 = ({ event, templates, currentHour, t }) => {
  const [showFullScreen, setShowFullScreen] = useState(false);

  useEffect(() => {
    setShowFullScreen(event.primeraImagen && event.images?.length > 0);
  }, [event.primeraImagen, event.images]);

  // Renderizar el header (encabezado) para mantener consistencia
  const renderHeader = () => (
    <header className="flex justify-between items-center h-[10vh] mb-2">
      {templates.logo && (
        <div className="h-full aspect-video flex items-center">
          <img
            src={templates.logo}
            alt="Logo"
            className="object-contain h-full"
          />
        </div>
      )}
      <h1 className="font-bold uppercase text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-color">
        {event.matchingDevice}
      </h1>
    </header>
  );

  // Si estamos en modo pantalla completa, solo mostramos el header y la imagen
  if (showFullScreen && event.images?.[0]) {
    return (
      <div className="fixed inset-0 flex flex-col bg-white">
        <div className="w-[100vw] p-4">
          {/* Solo mostramos el header */}
          {renderHeader()}
        </div>

        {/* Imagen a pantalla completa que ocupa todo el espacio restante */}
        <div className="flex-1 bg-black flex items-center justify-center relative">
          <img
            src={event.images[0]}
            alt="Full screen event"
            className="max-h-full max-w-full object-contain"
          />
        </div>
      </div>
    );
  }

  // Vista normal cuando no estamos en pantalla completa
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <section
        className="w-[100vw] h-[100vh] flex flex-col z-20 rounded-lg overflow-hidden"
        style={{
          color: templates.fontColor,
          fontFamily: templates.fontStyle,
        }}
      >
        {/* Header - 10vh */}
        {renderHeader()}

        {/* Main Content - 80vh */}
        <main className="flex-1 flex flex-col min-h-0">
          {/* Content Area - 85% of main */}
          <div
            className="flex-1 min-h-0"
            style={{
              backgroundColor: templates.templateColor,
            }}
          >
            <div className="h-full grid grid-cols-3 gap-x-4">
              {/* Image Slider */}
              <div className="col-span-1 flex items-center justify-center p-4">
                <EventImageSlider
                  images={event.images}
                  onImageClick={(image) => {
                    setShowFullScreen(true);
                  }}
                />
              </div>

              {/* Event Details */}
              <div className="col-span-2 flex flex-col justify-center space-y-6 p-4">
                <div
                  className={`text-3xl md:text-6xl font-bold`}
                  style={{
                    color: templates.fontColor,
                  }}
                >
                  <h2>{event.nombreEvento}</h2>
                </div>
                <h1
                  className="text-2xl md:text-3xl lg:text-4xl font-bold"
                  style={{
                    color: templates.fontColor,
                  }}
                >
                  {event.tipoEvento}
                </h1>
                <div className="mb-4">
                  <p
                    className="text-2xl md:text-3xl lg:text-4xl font-bold"
                    style={{
                      color: templates.fontColor,
                    }}
                  >
                    {event.horaInicialReal} - {event.horaFinalReal}
                  </p>
                </div>
                <div>
                  <p
                    className="text-xl md:text-2xl lg:text-3xl"
                    style={{
                      color: templates.fontColor,
                    }}
                  >
                    {event.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer - 10vh */}
        <footer className="h-[10vh] mt-2 text-color">
          <div className="h-full flex items-center justify-between px-20 rounded-b-xl text-xl md:text-2xl lg:text-3xl">
            <p className="font-bold uppercase">
              <GetLanguageDate idioma={templates.idioma} />
            </p>
            <div className="flex items-center gap-2">
              <img src="/img/reloj.png" className="h-6 lg:h-8" alt="clock" />
              <p className="uppercase">{currentHour}</p>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
};
