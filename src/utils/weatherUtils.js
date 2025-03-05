// src/utils/weatherUtils.js
import axios from "axios";

const API_KEY = "a067ad0b3d4440b192b223344240201"; // Reemplaza con tu API key real
const BASE_URL = "https://api.weatherapi.com/v1";

export const fetchWeatherData = async (city) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/current.json?key=${API_KEY}&q=${city}&lang=es`
    );

    return {
      temp_c: response.data.current.temp_c,
      condition: response.data.current.condition.text,
      icon: response.data.current.condition.icon,
      humidity: response.data.current.humidity,
      wind_kph: response.data.current.wind_kph,
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw new Error("No se pudo obtener la información del clima");
  }
};

// Opcional: Función para formatear la hora del pronóstico
export const formatHour = (hourString) => {
  const hour = parseInt(hourString.split(":")[0]);
  return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
};
