"use client";
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import SliderPublicidadTarifario from "@/components/sliderPublicidadTarifario";
import TarifarioImageSlider from "@/components/sliders/TarifarioImageSlider";
import SliderRSS from "@/components/SliderRSS";
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

  // Formatear la fecha en español e inglés
  const formatFecha = () => {
    if (pantalla.idioma === "es-en") {
      // Formato bilingüe - mostrar ambos idiomas con estilo personalizado
      const spanishDate = format(currentTime, "EEEE, dd 'de' MMMM", {
        locale: es,
      });
      const englishDate = format(currentTime, "EEEE, MMMM dd");
      return (
        <>
          <span className="font-semibold">{spanishDate}</span>
          <br />
          <span className="text-gray-600">{englishDate}</span>
        </>
      );
    } else if (pantalla.idioma === "en") {
      // Solo inglés
      return format(currentTime, "EEEE, MMMM dd");
    } else {
      // Por defecto español
      return format(currentTime, "EEEE, dd 'de' MMMM", { locale: es });
    }
  };

  // Color de fondo del template (encabezado, pie de página, banners)
  const templateBgColor = pantalla.templateColor || "#444444";
  const textColor = pantalla.fontColor || "#000000";

  // Obtener tarifas con un máximo de 10
  const tarifas = pantalla.tarifas || [];
  const maxTarifas = 10;
  const displayTarifas = tarifas.slice(0, maxTarifas);

  return (
    <div className="h-screen w-screen overflow-hidden bg-white">
      <div className="h-full w-full p-4">
        <div className="h-full flex flex-col">
          {/* Sección superior - Header con logo, fecha, clima y tipo de cambio */}
          <div className="flex justify-between items-center mb-2">
            {/* Columna izquierda - Logo y fecha */}
            <div className="flex items-center">
              {/* Logo */}
              {pantalla.logo && (
                <div className="mr-4">
                  <img
                    src={pantalla.logo}
                    alt="Logo del hotel"
                    className="h-16 object-contain"
                  />
                </div>
              )}

              {/* Fecha */}
              <div className="text-base text-gray-700">{formatFecha()}</div>
            </div>

            {/* Columna derecha - Clima y tipo de cambio */}
            <div className="flex items-center space-x-6">
              {/* Clima */}
              <div className="flex items-end">
                <div className="flex flex-col items-end mr-1">
                  <span className="text-3xl font-semibold">{`29°C`}</span>
                  <div className="flex text-xs">
                    <span className="px-1 mr-1 bg-blue-500 text-white">13</span>
                    <span className="px-1 bg-red-500 text-white">31</span>
                  </div>
                </div>
                <div className="text-yellow-500">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="12" cy="12" r="8" fill="currentColor" />
                  </svg>
                </div>
              </div>

              {/* Tipo de cambio */}
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase">
                  Tipo de cambio para consumos del día
                </p>
                <p className="text-base font-medium">
                  1USD= {pantalla.tipoCambio?.usd || "20.3893"}
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
                    TARIFAS AL PÚBLICO
                  </h2>
                </div>

                {/* Lista de tarifas - Formato de tabla para horizontal */}
                <div className="py-2 flex-1 overflow-hidden">
                  <div className="h-full flex flex-wrap">
                    {displayTarifas.length > 0 ? (
                      <div className="w-full grid grid-cols-2 gap-x-4 gap-y-2">
                        {displayTarifas.map((tarifa, index) => (
                          <div
                            key={index}
                            className="flex justify-between py-1 px-2"
                          >
                            <span className="font-medium">{tarifa.tipo}</span>
                            <span className="font-bold">${tarifa.precio}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full w-full">
                        <p className="text-gray-500">
                          No hay tarifas disponibles
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Leyenda debajo de las tarifas */}
                <div className="px-4 py-1">
                  <p className="text-xs text-gray-600">
                    {pantalla.leyendaTarifas ||
                      "Precios incluyen el 16% IVA y el 4% ISH. Precios expresados en moneda nacional. No se acepta moneda extranjera. Tipo de Cambio Informativo. Precio por habitación por noche máximo para 2 adultos y 2 menores de 12 años."}
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
                    CHECK IN-OUT
                  </h2>
                  <h2 className="text-xl font-bold text-white">
                    GERENTE EN TURNO
                  </h2>
                </div>
                <div>
                  {/* Contenido en dos columnas */}
                  <div className="my-2 px-20 py-2 flex">
                    {/* CHECK IN-OUT columna izquierda */}
                    <div className="w-1/2">
                      <div className="flex mb-2">
                        <p className="w-12 font-medium">IN</p>
                        <p>{pantalla.checkIn || "15:00 hrs."}</p>
                      </div>
                      <div className="flex">
                        <p className="w-12 font-medium">OUT</p>
                        <p>{pantalla.checkOut || "12:00 hrs."}</p>
                      </div>
                    </div>

                    {/* Gerente en turno columna derecha */}
                    <div className="w-1/2 text-right justify-end items-center flex">
                      <p className="font-medium">
                        {pantalla.gerente?.nombre || "Laura Ruiz"}
                      </p>
                    </div>
                  </div>

                  {/* Leyenda extras */}
                  <div className="px-4 pb-2">
                    <p className="text-xs text-gray-600">
                      {pantalla.leyendaExtras ||
                        "Tarifas no incluyen alimentos. Forma de pago en efectivo (moneda nacional), tarjeta de crédito o débito y transferencias bancarias (48Hrs de anticipación). Tarifa puede variar por ocupación y disponibilidad. Convenio estacionamiento $170.00 por auto, por noche."}
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
                    NOTICIAS
                  </h2>
                </div>

                {/* Feed de noticias */}
                <div className="px-2 py-2 flex-1 overflow-hidden">
                  <SliderRSS />
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
                      Espacio para publicidad
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

export default PTTemplate1Horizontal;
