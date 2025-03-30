import React, { useState, useEffect } from "react";
import { fetchAllWeatherData } from "@/utils/weatherUtils";

const WeatherWidget = ({
  ciudad,
  showForecast = false,
  variant = "default",
}) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getWeatherData = async () => {
      if (!ciudad) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchAllWeatherData(ciudad);
        setWeatherData(data);
        setError(null);
      } catch (err) {
        console.error("Error al obtener datos del clima:", err);
        setError("No se pudo cargar la información del clima");
      } finally {
        setLoading(false);
      }
    };

    getWeatherData();
  }, [ciudad]);

  if (loading) {
    return (
      <div className="animate-pulse flex items-center space-x-2">
        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
        <div className="h-4 w-12 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="text-sm text-gray-500">
        {error || "Clima no disponible"}
      </div>
    );
  }

  // Renderizar diferentes variantes del widget
  switch (variant) {
    case "minimal":
      return (
        <div className="flex items-center">
          <span className="text-xl font-bold">
            {weatherData.current.temp_c}°
          </span>
          {weatherData.current.iconUrl && (
            <img
              src={weatherData.current.iconUrl}
              alt={weatherData.current.condition}
              className="h-8 w-8 ml-1"
            />
          )}
        </div>
      );

    case "horizontal":
      return (
        <div className="flex flex-col">
          {/* Clima actual */}
          <div className="flex items-center mb-1">
            {weatherData.current.iconUrl && (
              <img
                src={weatherData.current.iconUrl}
                alt={weatherData.current.condition}
                className="h-8 w-8 mr-1"
              />
            )}
            <span className="text-lg font-bold">
              {weatherData.current.temp_c}°C
            </span>
            <span className="text-xs ml-2">
              {weatherData.current.condition}
            </span>
          </div>

          {/* Pronóstico mini */}
          {showForecast && (
            <div className="flex justify-between text-xs text-gray-600">
              <div className="text-blue-600 font-medium">
                Máx: {weatherData.hourly.maxTemp}°
              </div>
              <div className="text-blue-900 font-medium">
                Mín: {weatherData.hourly.minTemp}°
              </div>
            </div>
          )}
        </div>
      );

    case "expanded":
      return (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-sm">
          {/* Encabezado con ciudad y temperatura actual */}
          <div className="flex items-center justify-between mb-1">
            <div className="text-sm font-medium">
              {weatherData.location.name}
            </div>
            <div className="flex items-center">
              <span className="text-xl font-bold">
                {weatherData.current.temp_c}°C
              </span>
              {weatherData.current.iconUrl && (
                <img
                  src={weatherData.current.iconUrl}
                  alt={weatherData.current.condition}
                  className="h-8 w-8 ml-1"
                />
              )}
            </div>
          </div>

          {/* Condición y sensación térmica */}
          <div className="flex justify-between text-xs mb-1">
            <div>{weatherData.current.condition}</div>
            <div>Sensación: {weatherData.current.feelslike_c}°C</div>
          </div>

          {/* Pronóstico */}
          {showForecast && (
            <div className="grid grid-cols-4 gap-1 mt-2 pt-1 border-t border-gray-200">
              {weatherData.hourly.forecast.slice(0, 4).map((hour, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="text-xs">{hour.formattedTime}</div>
                  <img
                    src={hour.iconUrl}
                    alt={hour.condition}
                    className="h-6 w-6 my-1"
                  />
                  <div className="text-xs font-medium">{hour.temp_c}°</div>
                </div>
              ))}
            </div>
          )}
        </div>
      );

    default:
      return (
        <div className="flex items-center">
          {weatherData.current.iconUrl && (
            <img
              src={weatherData.current.iconUrl}
              alt={weatherData.current.condition}
              className="h-8 w-8 mr-2"
            />
          )}
          <div>
            <div className="flex items-center">
              <span className="text-xl font-bold">
                {weatherData.current.temp_c}°C
              </span>
              {showForecast && (
                <span className="text-xs ml-2">
                  {weatherData.hourly.maxTemp}° / {weatherData.hourly.minTemp}°
                </span>
              )}
            </div>
            <div className="text-xs">{weatherData.current.condition}</div>
          </div>
        </div>
      );
  }
};

export default WeatherWidget;
