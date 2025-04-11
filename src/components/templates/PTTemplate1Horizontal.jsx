"use client";
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import SliderPublicidadTarifario from "@/components/sliderPublicidadTarifario";
import TarifarioImageSlider from "@/components/sliders/TarifarioImageSlider";
import SliderRSS from "@/components/SliderRSS";
import TarifarioRssSlider from "@/components/TarifarioRssSlider";
import WeatherWidget from "../WeatherWidget";

const PTTemplate1Horizontal = ({ pantalla }) => {
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
    document.body.style.height = "100vh";
    document.body.style.width = "100vw";

    // Apply specific styles to html element too
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.height = "100vh";
    document.documentElement.style.width = "100vw";

    return () => {
      // Restore default styles when component unmounts
      document.body.style.overflow = "";
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.body.style.height = "";
      document.body.style.width = "";
      document.documentElement.overflow = "";
      document.documentElement.height = "";
      document.documentElement.width = "";
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

  // Función para crear línea punteada
  const DottedLine = () => (
    <div className="w-full border-b border-dotted border-gray-400"></div>
  );

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-white">
      <div className="h-full w-full flex flex-col p-2">
        {/* Header - Logo, fecha, clima y tipo de cambio */}
        <div className="flex justify-between items-center mb-2 h-20">
          {/* Logo y fecha */}
          <div className="flex items-center">
            {/* Logo */}
            {pantalla.logo && (
              <div className="mr-3">
                <img
                  src={pantalla.logo}
                  alt="Logo del hotel"
                  className="h-16 object-contain rounded-lg"
                />
              </div>
            )}

            {/* Fecha y hora */}
            <div className="text-sm text-gray-700">
              {pantalla.idioma === "es" && (
                <>
                  <p className="text-sm font-semibold">{formatDate("es")}</p>
                  <p className="text-base">{format(currentTime, "HH:mm")}</p>
                </>
              )}
              {pantalla.idioma === "en" && (
                <>
                  <p className="text-sm font-semibold">{formatDate("en")}</p>
                  <p className="text-base">{format(currentTime, "HH:mm")}</p>
                </>
              )}
              {pantalla.idioma === "es-en" && (
                <>
                  <p className="text-sm font-semibold">{formatDate("es")}</p>
                  <p className="text-xs text-gray-600">{formatDate("en")}</p>
                  <div className="flex items-center">
                    <img src="/img/reloj.png" className="p-1 h-6" alt="Clock" />
                    <p className="text-base">{format(currentTime, "HH:mm")}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Clima y tipo de cambio */}
          <div className="flex items-center space-x-4">
            {/* Clima */}
            <div className="flex items-center">
              <div className="flex flex-col">
                <WeatherWidget
                  ciudad={pantalla.ciudad}
                  showForecast={true}
                  variant="horizontal"
                />
              </div>
            </div>

            {/* Tipo de cambio */}
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase">
                {pantalla.tituloCambio ||
                  (pantalla.idioma === "en"
                    ? "EXCHANGE RATE"
                    : pantalla.idioma === "es-en"
                    ? "TIPO DE CAMBIO/EXCHANGE RATE"
                    : "TIPO DE CAMBIO")}
              </p>

              {/* Caso 1: monedaActiva es "ambos" - mostrar ambas monedas */}
              {pantalla.monedaActiva === "ambos" && (
                <>
                  {pantalla.tipoCambio?.usd && (
                    <p className="text-sm font-medium">
                      1USD= {pantalla.tipoCambio.usd}
                    </p>
                  )}
                  {pantalla.tipoCambio?.eur && (
                    <p className="text-sm font-medium">
                      1EUR= {pantalla.tipoCambio.eur}
                    </p>
                  )}
                </>
              )}

              {/* Caso 2: monedaActiva es "eur" */}
              {pantalla.monedaActiva === "eur" && (
                <>
                  {pantalla.tipoCambio?.eur && (
                    <p className="text-sm font-medium">
                      1EUR= {pantalla.tipoCambio.eur}
                    </p>
                  )}
                  {pantalla.tipoCambio?.usd && (
                    <p className="text-sm font-medium">
                      1USD= {pantalla.tipoCambio.usd}
                    </p>
                  )}
                </>
              )}

              {/* Caso 3: monedaActiva es "usd" o no está definida */}
              {(!pantalla.monedaActiva || pantalla.monedaActiva === "usd") &&
                pantalla.monedaActiva !== "ambos" &&
                pantalla.monedaActiva !== "eur" && (
                  <>
                    {pantalla.tipoCambio?.usd && (
                      <p className="text-sm font-medium">
                        1USD= {pantalla.tipoCambio.usd}
                      </p>
                    )}
                    {pantalla.tipoCambio?.eur && (
                      <p className="text-sm font-medium">
                        1EUR= {pantalla.tipoCambio.eur}
                      </p>
                    )}
                  </>
                )}
            </div>
          </div>
        </div>

        {/* Sección principal - Tarifas y publicidad */}
        <div className="flex flex-1 mb-2 overflow-hidden">
          {/* Tarifas (75%) */}
          <div className="w-3/4 flex flex-col mr-2 overflow-hidden">
            {/* Encabezado Tarifas */}
            <div
              className="py-1 px-2 rounded-t-lg"
              style={{ backgroundColor: templateBgColor }}
            >
              <h2 className="text-lg font-bold text-center text-white">
                {getText("tarifasPublico")}
              </h2>
            </div>

            {/* Lista de tarifas */}
            <div className="flex-1 overflow-auto px-4 py-2">
              {displayTarifas.length > 0 ? (
                <div className="flex flex-col justify-between h-full">
                  {displayTarifas.map((tarifa, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-1"
                      style={{
                        height: `calc(100% / ${displayTarifas.length})`,
                      }}
                    >
                      <span className="font-medium text-base">
                        {tarifa.tipo}
                      </span>
                      <div className="flex-1 mx-4">
                        <DottedLine />
                      </div>
                      <span className="font-bold text-right text-base w-20">
                        ${tarifa.precio}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 text-center">
                    {getText("noTarifas")}
                  </p>
                </div>
              )}
            </div>

            {/* Leyenda Tarifas */}
            <div className="px-3 py-1">
              <p className="text-xs text-gray-600 text-center">
                {pantalla.leyendaTarifas ||
                  (pantalla.idioma === "en"
                    ? "Prices include VAT and taxes. Foreign currency not accepted."
                    : pantalla.idioma === "es-en"
                    ? "Precios incluyen impuestos. / Prices include taxes."
                    : "Precios incluyen impuestos. No se acepta moneda extranjera.")}
              </p>
            </div>
          </div>

          {/* Publicidad (25%) */}
          <div className="w-1/4 h-full overflow-hidden">
            {pantalla.publicidad &&
            pantalla.publicidad.filter(
              (img) => !img.orientacion || img.orientacion === "horizontal"
            ).length > 0 ? (
              <div className="w-full h-full">
                <TarifarioImageSlider
                  images={pantalla.publicidad.filter(
                    (img) =>
                      !img.orientacion || img.orientacion === "horizontal"
                  )}
                  fullWidth={true}
                />
              </div>
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: templateBgColor }}
              >
                <p className="text-white text-sm">
                  {getText("espacioPublicidad")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sección inferior - Check in/out, gerente y noticias */}
        <div className="flex h-48">
          {" "}
          {/* Aumenté la altura para dar más espacio al RSS */}
          {/* Check in/out y gerente (75%) */}
          <div className="w-3/4 mr-2 flex flex-col">
            {/* Encabezado combinado */}
            <div
              className="py-1 px-8 flex justify-between rounded-t-lg"
              style={{ backgroundColor: templateBgColor }}
            >
              <h2 className="text-base font-bold text-white pl-4">
                {getText("checkInOut")}
              </h2>
              <h2 className="text-base font-bold text-white">
                {getText("gerenteTurno")}
              </h2>
            </div>

            {/* Contenido en dos columnas */}
            <div className="relative flex-1 px-4 py-2 flex">
              {/* Línea separadora vertical */}
              <div
                className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-px h-full"
                style={{
                  backgroundColor: templateBgColor,
                  opacity: 0.3,
                }}
              ></div>

              {/* CHECK IN-OUT */}
              <div className="w-1/2">
                <div className="flex mb-2">
                  <p className="w-32 font-medium text-sm">
                    {getText("entrada")}{" "}
                  </p>
                  <p className="text-sm">
                    {formatCheckTime(pantalla.checkIn) ||
                      getText("noHorarioEntrada")}
                  </p>
                </div>
                <div className="flex">
                  <p className="w-32 font-medium text-sm">
                    {getText("salida")}
                  </p>
                  <p className="text-sm">
                    {formatCheckTime(pantalla.checkOut) ||
                      getText("noHorarioSalida")}
                  </p>
                </div>
              </div>

              {/* Gerente en turno */}
              <div className="w-1/2 flex justify-end items-center pr-8">
                <p className="font-medium text-sm">
                  {pantalla.gerente?.nombre || getText("noGerente")}
                </p>
              </div>
            </div>

            {/* Leyenda extras */}
            <div className="px-3 py-1">
              <p className="text-xs text-gray-600 text-center">
                {pantalla.leyendaExtras ||
                  (pantalla.idioma === "en"
                    ? "Rates do not include meals. Payment in cash or card."
                    : pantalla.idioma === "es-en"
                    ? "Tarifas no incluyen alimentos. / Rates do not include meals."
                    : "Tarifas no incluyen alimentos. Pago en efectivo o tarjeta.")}
              </p>
            </div>
          </div>
          {/* Noticias (25%) */}
          <div className="w-1/4 flex flex-col">
            {/* Encabezado Noticias */}
            <div
              className="py-1 px-2 rounded-t-lg"
              style={{ backgroundColor: templateBgColor }}
            >
              <h2 className="text-base font-bold text-center text-white">
                {getText("noticias")}
              </h2>
            </div>

            {/* Feed de noticias */}
            <div className="flex-1 overflow-hidden">
              <TarifarioRssSlider templateColor={templateBgColor} />
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
