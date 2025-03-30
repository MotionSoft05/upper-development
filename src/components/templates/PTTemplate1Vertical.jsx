"use client";
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import SliderPublicidadTarifario from "@/components/sliderPublicidadTarifario";
import TarifarioImageSlider from "@/components/sliders/TarifarioImageSlider";
import SliderRSS from "@/components/SliderRSS";
import WeatherWidget from "../WeatherWidget";

const PTTemplate1Vertical = ({ pantalla }) => {
  console.log(
    "🚀 ~ PTTemplate1Vertical.jsx:363 ~ PTTemplate1Vertical ~ pantalla:",
    pantalla
  );
  const [currentTime, setCurrentTime] = useState(new Date());
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

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

  // Calcular la altura proporcional para cada tarifa
  const calcularAlturaTarifa = () => {
    if (displayTarifas.length === 0) return "auto";
    // Cálculo para distribuir el espacio uniformemente
    return `calc((100% - ${displayTarifas.length * 8}px) / ${
      displayTarifas.length
    })`;
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-white">
      {/* Rotated container */}
      <div
        className="p-4 z-20"
        style={{
          position: "absolute",
          width: windowSize.height,
          height: windowSize.width,
          top: (windowSize.height - windowSize.width) / 2,
          left: (windowSize.width - windowSize.height) / 2,
          transform: "rotate(-90deg)",
          fontFamily: pantalla.fontStyle || "Arial, sans-serif",
          backgroundColor: "white",
        }}
      >
        {/* Diseño en columna única similar a la imagen de referencia */}
        <div className="h-full flex flex-col">
          {/* Sección de cabecera - Logo, fecha, clima y tipo de cambio */}
          <div className="p-4 flex">
            {/* Columna izquierda - Logo y fecha */}
            <div className="w-1/2">
              {/* Logo */}
              {pantalla.logo && (
                <div className="mb-2">
                  <img
                    src={pantalla.logo}
                    alt="Logo del hotel"
                    className="h-16 object-contain"
                  />
                </div>
              )}

              {/* Fecha - Estilo actualizado similar a la segunda imagen */}
              <div className="text-base text-gray-700">{formatFecha()}</div>
            </div>

            {/* Columna derecha - Clima y tipo de cambio */}
            <div className="w-1/2 flex flex-col items-end">
              {/* Clima - Usando el diseño de la segunda imagen */}
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

              {/* Tipo de cambio - Estilo actualizado como en la segunda imagen */}
              <div className="text-right mt-2">
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

          {/* Sección TARIFAS AL PÚBLICO */}
          <div className="flex-grow flex flex-col">
            {/* Encabezado Tarifas */}
            <div
              className="py-2 px-4 rounded-t-lg"
              style={{
                backgroundColor: templateBgColor,
              }}
            >
              <h2 className="text-xl md:text-2xl font-bold text-center text-white">
                TARIFAS AL PÚBLICO
              </h2>
            </div>

            {/* Lista de tarifas - Adaptativa según cantidad */}
            <div className="px-4 py-2 flex-grow">
              <div className="h-full flex flex-col justify-between">
                {displayTarifas.length > 0 ? (
                  <>
                    {displayTarifas.map((tarifa, index) => (
                      <div
                        key={index}
                        className="flex justify-between py-1"
                        style={{
                          minHeight: calcularAlturaTarifa(),
                        }}
                      >
                        <span className="font-medium">{tarifa.tipo}</span>
                        <span className="font-bold">${tarifa.precio}</span>
                      </div>
                    ))}

                    {/* Si tenemos menos de 10 tarifas, añadir filas vacías para mantener la distribución */}
                    {displayTarifas.length < maxTarifas &&
                      Array.from({
                        length: maxTarifas - displayTarifas.length,
                      }).map((_, index) => (
                        <div
                          key={`empty-${index}`}
                          className="flex-grow"
                          style={{
                            minHeight: calcularAlturaTarifa(),
                          }}
                        />
                      ))}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No hay tarifas disponibles</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sección CHECK IN-OUT y GERENTE EN TURNO */}
          <div>
            {/* Leyenda debajo de las tarifas */}
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-600">
                {pantalla.leyendaTarifas ||
                  "Precios incluyen el 16% IVA y el 4% ISH. Precios expresados en moneda nacional. No se acepta moneda extranjera. Tipo de Cambio Informativo. Precio por habitación por noche máximo para 2 adultos y 2 menores de 12 años."}
              </p>
            </div>
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
              <h2 className="text-xl font-bold text-white">GERENTE EN TURNO</h2>
            </div>
            <div>
              {/* Contenido en dos columnas - Estilo más parecido a la imagen de referencia */}
              <div className="my-4 px-20 py-2 flex">
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

          {/* Sección de noticias */}
          <div>
            {/* Encabezado Noticias */}
            <div
              className="py-2 px-4 rounded-t-lg"
              style={{
                backgroundColor: templateBgColor,
              }}
            >
              <h2 className="text-xl md:text-2xl font-bold text-center text-white">
                NOTICIAS
              </h2>
            </div>

            {/* Feed de noticias */}
            <div className="px-4 py-4">
              <SliderRSS />
            </div>
          </div>

          {/* Sección de publicidad con imagen completa */}
          <div className="mt-auto w-full">
            {pantalla.publicidad && pantalla.publicidad.length > 0 ? (
              <div className="w-full h-48 overflow-hidden bg-white">
                <TarifarioImageSlider
                  images={pantalla.publicidad}
                  templateStyle={{ color: textColor }}
                />
              </div>
            ) : (
              <div
                className="w-full h-32 flex items-center justify-center rounded-t-lg"
                style={{ backgroundColor: templateBgColor }}
              >
                <p className="text-white text-lg">Espacio para publicidad</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PTTemplate1Vertical;
