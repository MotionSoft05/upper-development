// src/utils/weatherUtils.js
import axios from "axios";

const API_KEY = "a067ad0b3d4440b192b223344240201"; // Reemplaza con tu API key real
const BASE_URL = "https://api.weatherapi.com/v1";

// Caché para evitar llamadas repetidas a la API
const weatherCache = {};
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos en milisegundos

/**
 * Obtiene los datos actuales del clima desde WeatherAPI
 * @param {string} city - Nombre de la ciudad
 * @returns {Object} - Datos del clima actual
 */
export const fetchWeatherData = async (city) => {
  try {
    // Verificar si hay datos en caché
    const cacheKey = `current_${city}`;
    if (
      weatherCache[cacheKey] &&
      Date.now() - weatherCache[cacheKey].timestamp < CACHE_DURATION
    ) {
      console.log(`Usando datos del clima en caché para ${city}`);
      return weatherCache[cacheKey].data;
    }

    // Obtener datos frescos de la API
    const response = await axios.get(
      `${BASE_URL}/current.json?key=${API_KEY}&q=${city}&lang=es`
    );

    const weatherData = {
      temp_c: response.data.current.temp_c,
      condition: response.data.current.condition.text,
      icon: response.data.current.condition.icon,
      iconUrl: `https:${response.data.current.condition.icon}`,
      temperatura: response.data.current.temp_c, // Para compatibilidad con ambos formatos
      humidity: response.data.current.humidity,
      wind_kph: response.data.current.wind_kph,
      location: response.data.location.name,
      country: response.data.location.country,
      localtime: response.data.location.localtime,
    };

    // Guardar en caché
    weatherCache[cacheKey] = {
      data: weatherData,
      timestamp: Date.now(),
    };

    return weatherData;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw new Error("No se pudo obtener la información del clima");
  }
};

/**
 * Obtiene el pronóstico del clima para las próximas horas
 * @param {string} city - Nombre de la ciudad
 * @param {number} hours - Número de horas a pronosticar (máximo 24)
 * @returns {Array} - Array con el pronóstico por hora
 */
export const fetchHourlyForecast = async (city, hours = 6) => {
  try {
    // Verificar si hay datos en caché
    const cacheKey = `forecast_${city}_${hours}`;
    if (
      weatherCache[cacheKey] &&
      Date.now() - weatherCache[cacheKey].timestamp < CACHE_DURATION
    ) {
      console.log(`Usando pronóstico en caché para ${city}`);
      return weatherCache[cacheKey].data;
    }

    // Limitar horas a un máximo de 24
    const hoursToFetch = Math.min(hours, 24);

    // Obtener datos frescos de la API - forecast para 1 día con datos por hora
    const response = await axios.get(
      `${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=1&aqi=no&alerts=no&lang=es`
    );

    // Extraer las próximas horas desde el momento actual
    const currentTime = new Date();
    const hourlyForecast = response.data.forecast.forecastday[0].hour
      .filter((hour) => {
        const hourTime = new Date(hour.time);
        return hourTime > currentTime;
      })
      .slice(0, hoursToFetch)
      .map((hour) => ({
        time: hour.time,
        formattedTime: formatHour(hour.time.split(" ")[1]),
        temp_c: hour.temp_c,
        condition: hour.condition.text,
        icon: hour.condition.icon,
        iconUrl: `https:${hour.condition.icon}`,
        chance_of_rain: hour.chance_of_rain,
        humidity: hour.humidity,
        wind_kph: hour.wind_kph,
      }));

    // Calcular máximo y mínimo
    const temps = hourlyForecast.map((h) => h.temp_c);
    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);

    const forecastData = {
      hours: hourlyForecast,
      maxTemp,
      minTemp,
      location: response.data.location.name,
      updated: response.data.current.last_updated,
    };

    // Guardar en caché
    weatherCache[cacheKey] = {
      data: forecastData,
      timestamp: Date.now(),
    };

    return forecastData;
  } catch (error) {
    console.error("Error fetching forecast data:", error);
    throw new Error("No se pudo obtener el pronóstico del clima");
  }
};

/**
 * Obtiene pronóstico diario para varios días
 * @param {string} city - Nombre de la ciudad
 * @param {number} days - Número de días (máximo 3 en la versión gratuita)
 * @returns {Array} - Array con el pronóstico por día
 */
export const fetchDailyForecast = async (city, days = 3) => {
  try {
    // Verificar si hay datos en caché
    const cacheKey = `daily_${city}_${days}`;
    if (
      weatherCache[cacheKey] &&
      Date.now() - weatherCache[cacheKey].timestamp < CACHE_DURATION
    ) {
      console.log(`Usando pronóstico diario en caché para ${city}`);
      return weatherCache[cacheKey].data;
    }

    // Limitar días a un máximo de 3 (versión gratuita de la API)
    const daysToFetch = Math.min(days, 3);

    const response = await axios.get(
      `${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=${daysToFetch}&aqi=no&alerts=no&lang=es`
    );

    const dailyForecast = response.data.forecast.forecastday.map((day) => ({
      date: day.date,
      maxtemp_c: day.day.maxtemp_c,
      mintemp_c: day.day.mintemp_c,
      avgtemp_c: day.day.avgtemp_c,
      condition: day.day.condition.text,
      icon: day.day.condition.icon,
      iconUrl: `https:${day.day.condition.icon}`,
      chance_of_rain: day.day.daily_chance_of_rain,
      humidity: day.day.avghumidity,
    }));

    // Guardar en caché
    weatherCache[cacheKey] = {
      data: dailyForecast,
      timestamp: Date.now(),
    };

    return dailyForecast;
  } catch (error) {
    console.error("Error fetching daily forecast:", error);
    throw new Error("No se pudo obtener el pronóstico diario");
  }
};

/**
 * Obtiene todos los datos del clima (actual, horario y diario) en una sola llamada
 * @param {string} city - Nombre de la ciudad
 * @returns {Object} - Objeto con todos los datos del clima
 */
export const fetchAllWeatherData = async (city) => {
  try {
    // Verificar si hay datos en caché
    const cacheKey = `all_${city}`;
    if (
      weatherCache[cacheKey] &&
      Date.now() - weatherCache[cacheKey].timestamp < CACHE_DURATION
    ) {
      console.log(`Usando datos completos del clima en caché para ${city}`);
      return weatherCache[cacheKey].data;
    }

    // Realizar una única petición a la API para obtener todos los datos
    const response = await axios.get(
      `${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=3&aqi=no&alerts=no&lang=es`
    );

    // Datos actuales
    const current = {
      temp_c: response.data.current.temp_c,
      temperatura: response.data.current.temp_c, // Para compatibilidad
      condition: response.data.current.condition.text,
      icon: response.data.current.condition.icon,
      iconUrl: `https:${response.data.current.condition.icon}`,
      humidity: response.data.current.humidity,
      wind_kph: response.data.current.wind_kph,
      feelslike_c: response.data.current.feelslike_c,
      uv: response.data.current.uv,
    };

    // Extraer pronóstico horario para las próximas 6 horas
    const currentTime = new Date();
    const hourlyForecast = response.data.forecast.forecastday[0].hour
      .filter((hour) => {
        const hourTime = new Date(hour.time);
        return hourTime > currentTime;
      })
      .slice(0, 6)
      .map((hour) => ({
        time: hour.time,
        formattedTime: formatHour(hour.time.split(" ")[1]),
        temp_c: hour.temp_c,
        condition: hour.condition.text,
        icon: hour.condition.icon,
        iconUrl: `https:${hour.condition.icon}`,
        chance_of_rain: hour.chance_of_rain,
      }));

    // Datos para pronóstico diario
    const dailyForecast = response.data.forecast.forecastday.map((day) => ({
      date: day.date,
      maxtemp_c: day.day.maxtemp_c,
      mintemp_c: day.day.mintemp_c,
      condition: day.day.condition.text,
      icon: day.day.condition.icon,
      iconUrl: `https:${day.day.condition.icon}`,
      chance_of_rain: day.day.daily_chance_of_rain,
    }));

    // Calcular máximo y mínimo de las próximas horas
    const hourTemps = hourlyForecast.map((h) => h.temp_c);
    const maxHourTemp = Math.max(...hourTemps);
    const minHourTemp = Math.min(...hourTemps);

    const allData = {
      current,
      hourly: {
        forecast: hourlyForecast,
        maxTemp: maxHourTemp,
        minTemp: minHourTemp,
      },
      daily: dailyForecast,
      location: {
        name: response.data.location.name,
        country: response.data.location.country,
        localtime: response.data.location.localtime,
      },
    };

    // Guardar en caché
    weatherCache[cacheKey] = {
      data: allData,
      timestamp: Date.now(),
    };

    return allData;
  } catch (error) {
    console.error("Error fetching all weather data:", error);
    throw new Error("No se pudo obtener la información completa del clima");
  }
};

// Función mantiene compatibilidad con el código existente
export const obtenerClima = async (city) => {
  try {
    const weatherData = await fetchWeatherData(city);
    return weatherData;
  } catch (error) {
    console.error("Error al obtener datos del clima (obtenerClima):", error);
    return null;
  }
};

// Función para formatear la hora del pronóstico
export const formatHour = (hourString) => {
  const hour = parseInt(hourString.split(":")[0]);
  return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
};
