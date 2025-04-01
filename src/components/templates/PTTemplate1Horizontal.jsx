"use client";
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import SliderPublicidadTarifario from "@/components/sliderPublicidadTarifario";
import TarifarioImageSlider from "@/components/sliders/TarifarioImageSlider";
import TarifarioRssSlider from "@/components/TarifarioRssSlider";
import WeatherWidget from "../WeatherWidget";

const PTTemplate1Horizontal = ({ pantalla }) => {
  console.log(
    "🚀 ~ PTTemplate1Horizontal.jsx ~ PTTemplate1Horizontal ~ pantalla:",
    pantalla
  );
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Actualiza el reloj cada segundo
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Limpia los intervalos al desmontar
    return () => {
      clearInterval(timer);
    };
  }, []);

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

  if (!pantalla) return null;

  // Textos basados en el idioma seleccionado
  const getText = (key) => {
    const translations = {
      // Textos en español
      es: {
        tarifasPublico: "TARIFAS AL PÚBLICO",
        noticias: "NOTICIAS",
        checkInOut: "CHECK IN-OUT",
        gerenteTurno: "GERENTE EN TURNO",
        noTarifas: "No se encontraron tarifas disponibles",
        noGerente: "No se encontró gerente en turno",
        espacioPublicidad: "Espacio para publicidad",
        entrada: "ENTRADA",
        salida: "SALIDA",
        noHorarioEntrada: "Horario no disponible",
        noHorarioSalida: "Horario no disponible",
      },
      // Textos en inglés
      en: {
        tarifasPublico: "PUBLIC RATES",
        noticias: "NEWS",
        checkInOut: "CHECK IN-OUT",
        gerenteTurno: "MANAGER ON DUTY",
        noTarifas: "No rates available",
        noGerente: "No manager on duty found",
        espacioPublicidad: "Space for advertising",
        entrada: "CHECK IN",
        salida: "CHECK OUT",
        noHorarioEntrada: "Schedule not available",
        noHorarioSalida: "Schedule not available",
      },
      // Textos en español e inglés (formato compacto)
      "es-en": {
        tarifasPublico: "TARIFAS/RATES",
        noticias: "NOTICIAS/NEWS",
        checkInOut: "CHECK IN-OUT",
        gerenteTurno: "GERENTE/MANAGER",
        noTarifas: "No se encontraron tarifas / No rates available",
        noGerente: "No se encontró gerente / No manager found",
        espacioPublicidad: "Espacio para publicidad / Space for advertising",
        entrada: "ENTRADA/CHECK IN",
        salida: "SALIDA/CHECK OUT",
        noHorarioEntrada: "Horario no disponible / Schedule not available",
        noHorarioSalida: "Horario no disponible / Schedule not available",
      },
    };

    // Determina el idioma a utilizar (por defecto español)
    const lang = pantalla.idioma || "es";
    return translations[lang][key] || translations.es[key];
  };

  // Formatear la fecha según el idioma
  const formatDate = (lang) => {
    if (lang === "es") {
      return format(currentTime, "EEEE, dd 'de' MMMM", { locale: es });
    } else {
      return format(currentTime, "EEEE, MMMM dd");
    }
  };

  // Color de fondo del template (encabezado, pie de página, banners)
  const templateBgColor = pantalla.templateColor || "#444444";
  const textColor = pantalla.fontColor || "#000000";

  // Obtener tarifas con un máximo de 10
  const tarifas = pantalla.tarifas || [];
  const maxTarifas = 10;
  const displayTarifas = tarifas.slice(0, maxTarifas);

  // Determina el tamaño de fuente basado en la cantidad de tarifas
  const getTarifaFontSize = () => {
    if (displayTarifas.length <= 3) return "text-xl";
    if (displayTarifas.length <= 6) return "text-lg";
    return "text-base";
  };

  const tarifaFontSize = getTarifaFontSize();

  // Divide las tarifas en dos columnas
  const getColumnasTarifas = () => {
    const mitad = Math.ceil(displayTarifas.length / 2);
    const columna1 = displayTarifas.slice(0, mitad);
    const columna2 = displayTarifas.slice(mitad);
    return { columna1, columna2 };
  };

  const { columna1, columna2 } = getColumnasTarifas();

  // Función para crear línea punteada
  const DottedLine = () => (
    <div className="w-full border-b border-dotted border-gray-400 mt-1"></div>
  );

  return (
    <div className="h-screen w-screen overflow-hidden bg-white">
      <div className="h-full w-full p-4">
        <div className="h-full flex flex-col">
          {/* Sección superior - Header con logo, fecha, clima y tipo de cambio */}
          <div className="flex justify-between items-center mb-2">
            {/* Columna izquierda - Logo y fecha */}
            <div className="flex items-center">
              {/* Logo (tamaño aumentado) */}
              {pantalla.logo && (
                <div className="mr-4">
                  <img
                    src={pantalla.logo}
                    alt="Logo del hotel"
                    className="h-20 object-contain" // Aumentado de h-16 a h-20
                  />
                </div>
              )}

              {/* Fecha y hora con formato según idioma */}
              <div className="text-base text-gray-700">
                {pantalla.idioma === "es" && (
                  <>
                    <p className="text-base font-semibold">
                      {formatDate("es")}
                    </p>
                    <p className="text-lg">{format(currentTime, "HH:mm")}</p>
                  </>
                )}
                {pantalla.idioma === "en" && (
                  <>
                    <p className="text-base font-semibold">
                      {formatDate("en")}
                    </p>
                    <p className="text-lg">{format(currentTime, "HH:mm")}</p>
                  </>
                )}
                {pantalla.idioma === "es-en" && (
                  <>
                    <p className="text-base font-semibold">
                      {formatDate("es")}
                    </p>
                    <p className="text-sm text-gray-600">{formatDate("en")}</p>
                    <p className="text-lg">{format(currentTime, "HH:mm")}</p>
                  </>
                )}
              </div>
            </div>

            {/* Columna derecha - Clima y tipo de cambio */}
            <div className="flex items-center space-x-6">
              {/* Clima con icono a la izquierda */}
              <div className="flex items-center">
                {/* Icono del clima a la izquierda */}
                <div className="mr-2">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-yellow-500"
                  >
                    <circle cx="12" cy="12" r="5" fill="currentColor" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                </div>

                {/* Temperatura y rango */}
                <div className="flex flex-col">
                  <span className="text-3xl font-semibold">{`29°C`}</span>
                  <div className="flex text-xs">
                    <span className="px-1 mr-1 bg-blue-500 text-white">13</span>
                    <span className="px-1 bg-red-500 text-white">31</span>
                  </div>
                </div>
              </div>

              {/* Tipo de cambio */}
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase">
                  {pantalla.tituloCambio ||
                    (pantalla.idioma === "en"
                      ? "EXCHANGE RATE FOR DAILY EXPENSES"
                      : pantalla.idioma === "es-en"
                      ? "TIPO DE CAMBIO/EXCHANGE RATE"
                      : "TIPO DE CAMBIO PARA CONSUMOS DEL DÍA")}
                </p>
                <p className="text-base font-medium">
                  1USD= {pantalla.tipoCambio?.usd || "20.00"}
                </p>
                {pantalla.tipoCambio?.eur && (
                  <p className="text-base font-medium">
                    1EUR= {pantalla.tipoCambio.eur}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contenido principal - Layout en dos columnas */}
          <div className="flex-1 flex">
            {/* Columna izquierda (70%) - Tarifas */}
            <div className="w-[70%] flex flex-col mr-2">
              {/* Sección TARIFAS AL PÚBLICO */}
              <div className="flex-1 flex flex-col">
                {/* Encabezado Tarifas */}
                <div
                  className="py-2 px-4 rounded-t-lg"
                  style={{
                    backgroundColor: templateBgColor,
                  }}
                >
                  <h2 className="text-xl font-bold text-center text-white">
                    {getText("tarifasPublico")}
                  </h2>
                </div>

                {/* Lista de tarifas en dos columnas con separador */}
                <div className="py-3 flex-1 overflow-hidden">
                  <div className="h-full flex relative">
                    {/* Separador vertical entre columnas de tarifas */}
                    <div
                      className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-px h-[90%]"
                      style={{ backgroundColor: templateBgColor, opacity: 0.3 }}
                    ></div>

                    {/* Columna 1 de tarifas */}
                    <div className="w-1/2 pr-4">
                      {columna1.length > 0 ? (
                        <div className="flex flex-col gap-y-2">
                          {columna1.map((tarifa, index) => (
                            <div
                              key={index}
                              className={`flex items-center ${tarifaFontSize}`}
                            >
                              <span className="font-medium">{tarifa.tipo}</span>
                              <DottedLine />
                              <span className="font-bold text-right w-20">
                                ${tarifa.precio}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full w-full">
                          <p className="text-gray-500 text-center px-4">
                            {getText("noTarifas")}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Columna 2 de tarifas */}
                    <div className="w-1/2 pl-4">
                      {columna2.length > 0 ? (
                        <div className="flex flex-col gap-y-2">
                          {columna2.map((tarifa, index) => (
                            <div
                              key={index}
                              className={`flex items-center ${tarifaFontSize}`}
                            >
                              <span className="font-medium">{tarifa.tipo}</span>
                              <DottedLine />
                              <span className="font-bold text-right w-20">
                                ${tarifa.precio}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Leyenda debajo de las tarifas - Centrada y en pirámide invertida */}
                <div className="px-4 pb-2">
                  <p
                    className="text-xs text-gray-600 text-center mx-auto"
                    style={{
                      maxWidth:
                        pantalla.leyendaTarifas?.length > 100 ? "100%" : "80%",
                    }}
                  >
                    {pantalla.leyendaTarifas ||
                      (pantalla.idioma === "en"
                        ? "Prices include VAT and taxes. Foreign currency not accepted."
                        : pantalla.idioma === "es-en"
                        ? "Precios incluyen impuestos. / Prices include taxes."
                        : "Precios incluyen impuestos. No se acepta moneda extranjera.")}
                  </p>
                </div>
              </div>

              {/* Sección CHECK IN-OUT y GERENTE EN TURNO */}
              <div className="mt-2">
                {/* Encabezado combinado */}
                <div
                  className="py-2 px-10 flex justify-between rounded-t-lg"
                  style={{
                    backgroundColor: templateBgColor,
                  }}
                >
                  <h2 className="text-xl pl-6 font-bold text-white">
                    {getText("checkInOut")}
                  </h2>
                  <h2 className="text-xl font-bold text-white">
                    {getText("gerenteTurno")}
                  </h2>
                </div>
                <div>
                  {/* Contenido en dos columnas con separador */}
                  <div className="relative my-2 px-20 py-2 flex">
                    {/* Línea separadora vertical */}
                    <div
                      className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-px h-full"
                      style={{ backgroundColor: templateBgColor, opacity: 0.3 }}
                    ></div>

                    {/* CHECK IN-OUT columna izquierda */}
                    <div className="w-1/2">
                      <div className="flex mb-2">
                        <p className="w-40 font-medium">{getText("entrada")}</p>
                        <p>
                          {formatCheckTime(pantalla.checkIn) ||
                            getText("noHorarioEntrada")}
                        </p>
                      </div>
                      <div className="flex">
                        <p className="w-40 font-medium">{getText("salida")}</p>
                        <p>
                          {formatCheckTime(pantalla.checkOut) ||
                            getText("noHorarioSalida")}
                        </p>
                      </div>
                    </div>

                    {/* Gerente en turno columna derecha */}
                    <div className="w-1/2 text-right justify-end items-center flex">
                      <p className="font-medium">
                        {pantalla.gerente?.nombre || getText("noGerente")}
                      </p>
                    </div>
                  </div>

                  {/* Leyenda extras - Centrada y en pirámide invertida */}
                  <div className="px-4 pb-2">
                    <p
                      className="text-xs text-gray-600 text-center mx-auto"
                      style={{
                        maxWidth:
                          pantalla.leyendaExtras?.length > 100 ? "100%" : "80%",
                      }}
                    >
                      {pantalla.leyendaExtras ||
                        (pantalla.idioma === "en"
                          ? "Rates do not include meals. Payment in cash or card."
                          : pantalla.idioma === "es-en"
                          ? "Tarifas no incluyen alimentos. / Rates do not include meals."
                          : "Tarifas no incluyen alimentos. Pago en efectivo o tarjeta.")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna derecha (30%) - Noticias y Publicidad */}
            <div className="w-[30%] flex flex-col">
              {/* Sección de noticias */}
              <div className="flex-1 flex flex-col">
                {/* Encabezado Noticias */}
                <div
                  className="py-2 px-4 rounded-t-lg"
                  style={{
                    backgroundColor: templateBgColor,
                  }}
                >
                  <h2 className="text-xl font-bold text-center text-white">
                    {getText("noticias")}
                  </h2>
                </div>

                {/* Feed de noticias */}
                {/* Feed de noticias */}
                <div className="px-2 py-2 flex-1 overflow-hidden">
                  <TarifarioRssSlider templateColor={templateBgColor} />
                </div>
              </div>

              {/* Sección de publicidad */}
              <div className="mt-2 h-48">
                {pantalla.publicidad && pantalla.publicidad.length > 0 ? (
                  <div className="w-full h-full overflow-hidden bg-white">
                    <TarifarioImageSlider
                      images={pantalla.publicidad}
                      templateStyle={{ color: textColor }}
                    />
                  </div>
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center rounded-t-lg"
                    style={{ backgroundColor: templateBgColor }}
                  >
                    <p className="text-white text-lg">
                      {getText("espacioPublicidad")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Función auxiliar para formatear la hora de check-in/check-out en formato HH:MM
function formatCheckTime(timeString) {
  if (!timeString) return null;

  // Elimina cualquier texto que no sea la hora
  const timeOnly = timeString.replace(/[^0-9:]/g, "");

  // Si ya tiene formato HH:MM, lo devuelve tal cual
  if (/^\d{1,2}:\d{2}$/.test(timeOnly)) {
    return timeOnly + " hrs.";
  }

  // Si es solo un número, asume que son horas y agrega :00
  if (/^\d{1,2}$/.test(timeOnly)) {
    return timeOnly + ":00 hrs.";
  }

  // Si no puede interpretar el formato, devuelve el valor original
  return timeString;
}

export default PTTemplate1Horizontal;
