// src/utils/dateUtils.js

export const isWithinTimeRange = (
  currentTime,
  startTime = "00:00",
  endTime = "23:59"
) => {
  const parseTime = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const current = parseTime(currentTime);
  const start = parseTime(startTime);
  const end = parseTime(endTime);

  return current >= start && current <= end;
};
export const getCurrentTime = () => {
  return new Date().toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDate = (date, locale = "es") => {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(date).toLocaleDateString(locale, options);
};

// src/utils/weatherUtils.js
import axios from "axios";

const API_KEY = "your_api_key";
const BASE_URL = "https://api.weatherapi.com/v1";

export const fetchWeatherData = async (city) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/current.json?key=${API_KEY}&q=${city}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
};
