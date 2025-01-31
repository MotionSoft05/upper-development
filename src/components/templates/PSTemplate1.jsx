import GetLanguageDate from "../GetLanguageDate";
import EventImageSlider from "@/components/sliders/EventImageSlider";

export const PSTemplate1 = ({ event, templates, currentHour, t }) => {
  return (
    <section
      className="fixed inset-0 flex flex-col p-4 bg-white"
      style={{
        color: templates.fontColor,
        fontFamily: templates.fontStyle,
      }}
    >
      {/* Header - 10vh */}
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

      {/* Main Content - 80vh */}
      <main className="flex-1 flex flex-col min-h-0">
        {/* Event Title - 15% of main */}
        <div className="h-[15%] mb-2">
          <div
            className="h-full flex items-center uppercase text-xl md:text-2xl lg:text-4xl xl:text-5xl font-bold px-20 rounded-t-xl"
            style={{
              backgroundColor: templates.templateColor,
            }}
          >
            <h2>{event.nombreEvento}</h2>
          </div>
        </div>

        {/* Content Area - 85% of main */}
        <div className="flex-1 min-h-0 bg-gradient-to-b from-gray-100 via-white to-gray-100">
          <div className="h-full grid grid-cols-3 gap-x-4">
            {/* Image Slider */}
            <div className="col-span-1 flex items-center justify-center p-4">
              <EventImageSlider images={event.images} />
            </div>

            {/* Event Details */}
            <div className="col-span-2 flex flex-col justify-center space-y-6 p-4">
              <div>
                <p className="text-2xl md:text-3xl lg:text-4xl text-color font-bold">
                  {templates.idioma === "en" && "Session"}
                  {templates.idioma === "es" && "Sesión"}
                  {templates.idioma === "es-en" && "Sesión / Session"}
                </p>
                <p className="text-2xl md:text-3xl text-color lg:text-4xl font-bold">
                  {event.horaInicialReal}
                  <span className="text-xl text-color lg:text-2xl"> hrs.</span>
                </p>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl text-color lg:text-4xl font-bold mb-4">
                  {event.tipoEvento}
                </h1>
                <p className="text-xl md:text-2xl text-color lg:text-3xl">
                  {event.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - 10vh */}
      <footer className="h-[10vh] mt-2">
        <div
          className="h-full flex items-center justify-between px-20 rounded-b-xl text-xl md:text-2xl lg:text-3xl"
          style={{
            backgroundColor: templates.templateColor,
          }}
        >
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
  );
};
