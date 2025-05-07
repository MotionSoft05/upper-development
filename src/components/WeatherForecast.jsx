import React, { useState, useEffect } from "react";
import { fetchAllWeatherData } from "@/utils/weatherUtils";

const WeatherForecast = ({ ciudad, compact = false }) => {
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
      <div className="animate-pulse flex flex-col items-center p-2">
        <div className="h-8 w-24 bg-gray-200 rounded mb-2"></div>
        <div className="h-12 w-12 bg-gray-200 rounded-full mb-2"></div>
        <div className="h-4 w-16 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="text-center text-gray-500 text-sm p-2">
        {error || "Información del clima no disponible"}
      </div>
    );
  }

  // Mostrar versión compacta (solo clima actual)
  if (compact) {
    return (
      <div className="flex items-center justify-center">
        <div className="flex items-center">
          <span className="text-xl font-bold">
            {weatherData.current.temp_c}°C
          </span>
          {weatherData.current.iconUrl && (
            <img
              src={weatherData.current.iconUrl}
              alt={weatherData.current.condition}
              className="h-8 w-8 ml-2"
            />
          )}
        </div>
      </div>
    );
  }

  // Versión completa con pronóstico
  return (
    <div className="weather-forecast-container p-2">
      {/* Clima actual */}
      <div className="current-weather mb-4 flex items-center justify-between bg-gray-100 p-3 rounded-lg">
        <div>
          <div className="text-lg font-bold">{weatherData.location.name}</div>
          <div className="text-3xl font-bold">
            {weatherData.current.temp_c}°C
          </div>
          <div className="text-sm">{weatherData.current.condition}</div>
          <div className="text-xs text-gray-500">
            Humedad: {weatherData.current.humidity}% | Viento:{" "}
            {weatherData.current.wind_kph} km/h
          </div>
        </div>
        {weatherData.current.iconUrl && (
          <img
            src={weatherData.current.iconUrl}
            alt={weatherData.current.condition}
            className="h-16 w-16"
          />
        )}
      </div>

      {/* Máximo y mínimo de las próximas horas */}
      <div className="min-max-temp flex justify-between text-sm mb-2">
        <div>
          <span className="font-medium">Máx:</span> {weatherData.hourly.maxTemp}
          °C
        </div>
        <div>
          <span className="font-medium">Mín:</span> {weatherData.hourly.minTemp}
          °C
        </div>
      </div>

      {/* Pronóstico por hora */}
      <div className="hourly-forecast mb-4">
        <h3 className="text-sm font-bold mb-2">Próximas horas</h3>
        <div className="grid grid-cols-6 gap-1">
          {weatherData.hourly.forecast.map((hour, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="text-xs">{hour.formattedTime}</div>
              <img
                src={hour.iconUrl}
                alt={hour.condition}
                className="h-8 w-8 my-1"
              />
              <div className="text-sm font-medium">{hour.temp_c}°</div>
              <div className="text-xs text-blue-500">
                {hour.chance_of_rain}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pronóstico diario */}
      <div className="daily-forecast">
        <h3 className="text-sm font-bold mb-2">Próximos días</h3>
        <div className="flex flex-col">
          {weatherData.daily.map((day, index) => (
            <div
              key={index}
              className={`flex items-center justify-between py-1 ${
                index < weatherData.daily.length - 1
                  ? "border-b border-gray-200"
                  : ""
              }`}
            >
              <div className="flex items-center">
                <img
                  src={day.iconUrl}
                  alt={day.condition}
                  className="h-8 w-8 mr-2"
                />
                <div>
                  <div className="text-sm font-medium">
                    {new Date(day.date).toLocaleDateString("es-ES", {
                      weekday: "short",
                    })}
                  </div>
                  <div className="text-xs text-gray-500">{day.condition}</div>
                </div>
              </div>
              <div className="text-sm">
                <span className="font-medium">{day.maxtemp_c}°</span> /{" "}
                {day.mintemp_c}°
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherForecast;
