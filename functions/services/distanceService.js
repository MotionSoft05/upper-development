/**
 * Distance Matrix Service
 *
 * Servicio para calcular tiempos de viaje en tiempo real entre
 * hoteles y aeropuertos
 * usando Google Distance Matrix API con consideraciones de tráfico actual.
 */

// const functions = require("firebase-functions"); // Unused import

// Cargar variables de entorno
require("dotenv").config();

// Configuración de aeropuertos mexicanos con coordenadas precisas
const AIRPORTS = {
  "MEX": {
    name: "Aeropuerto Internacional Ciudad de México",
    lat: 19.4363,
    lng: -99.0721,
    code: "MEX",
  },
  "GDL": {
    name: "Aeropuerto Internacional de Guadalajara",
    lat: 20.5218,
    lng: -103.311,
    code: "GDL",
  },
  "CUN": {
    name: "Aeropuerto Internacional de Cancún",
    lat: 21.0365,
    lng: -86.8771,
    code: "CUN",
  },
  "MTY": {
    name: "Aeropuerto Internacional de Monterrey",
    lat: 25.7785,
    lng: -100.1069,
    code: "MTY",
  },
  "PVR": {
    name: "Aeropuerto Internacional de Puerto Vallarta",
    lat: 20.6801,
    lng: -105.2544,
    code: "PVR",
  },
};

// Google Maps API Key usando variables de entorno
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  console.warn("⚠️ Google Maps API Key no configurada en .env file");
}

/**
 * Calcula distancia y tiempo de viaje entre hotel y aeropuerto
 * @param {Object} hotelLocation - {lat, lng, address}
 * @param {string} airportCode - Código del aeropuerto (MEX, GDL, CUN)
 * @param {Object} options - Opciones adicionales
 * @return {Promise<Object>} Resultado con distancia, tiempo y detalles
 */
async function calculateTravelTime(hotelLocation, airportCode, options = {}) {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error("Google Maps API Key no configurada");
    }

    const airport = AIRPORTS[airportCode.toUpperCase()];
    if (!airport) {
      throw new Error(`Aeropuerto ${airportCode} no soportado`);
    }

    if (!hotelLocation.lat || !hotelLocation.lng) {
      throw new Error("Coordenadas del hotel requeridas");
    }

    // Configurar parámetros de la API
    const params = new URLSearchParams({
      origins: `${hotelLocation.lat},${hotelLocation.lng}`,
      destinations: `${airport.lat},${airport.lng}`,
      mode: options.mode || "driving",
      language: options.language || "es",
      units: "metric",
      key: GOOGLE_MAPS_API_KEY,
    });

    // Agregar consideraciones de tráfico si está disponible
    const now = new Date();
    const departureTime = options.departureTime ||
        Math.floor(now.getTime() / 1000);

    params.append("departure_time", departureTime.toString());
    params.append("traffic_model", options.trafficModel || "best_guess");

    const url = `https://maps.googleapis.com/maps/api/distancematrix/` +
        `json?${params}`;

    console.log(`🗺️ Calculando ruta: Hotel ` +
        `(${hotelLocation.lat}, ${hotelLocation.lng}) → ${airportCode}`);

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
      throw new Error(`Google Distance Matrix API error: ` +
          `${data.status} - ${data.error_message}`);
    }

    const element = data.rows[0]?.elements[0];
    if (!element || element.status !== "OK") {
      throw new Error(`No se pudo calcular la ruta: ${element?.status}`);
    }

    // Procesar resultados
    const result = {
      origin: {
        address: hotelLocation.address ||
            `${hotelLocation.lat}, ${hotelLocation.lng}`,
        coordinates: {
          lat: hotelLocation.lat,
          lng: hotelLocation.lng,
        },
      },
      destination: {
        airport: airport.name,
        code: airportCode.toUpperCase(),
        coordinates: {
          lat: airport.lat,
          lng: airport.lng,
        },
      },
      distance: {
        text: element.distance.text,
        value: element.distance.value, // metros
        km: Math.round(element.distance.value / 1000 * 10) / 10,
      },
      duration: {
        text: element.duration.text,
        value: element.duration.value, // segundos
        minutes: Math.round(element.duration.value / 60),
      },
      durationInTraffic: element.duration_in_traffic ? {
        text: element.duration_in_traffic.text,
        value: element.duration_in_traffic.value,
        minutes: Math.round(element.duration_in_traffic.value / 60),
      } : null,
      calculatedAt: new Date().toISOString(),
      trafficConditions: element.duration_in_traffic ?
        (element.duration_in_traffic.value > element.duration.value * 1.2 ? "heavy" :
         element.duration_in_traffic.value > element.duration.value * 1.1 ? "moderate" : "light") : "unknown",
    };

    // Agregar recomendación de tiempo de salida
    const recommendedDeparture = calculateRecommendedDeparture(result);
    result.recommendations = recommendedDeparture;

    console.log(`✅ Ruta calculada: ${result.distance.km}km, ${result.duration.minutes}min`);

    return {
      success: true,
      data: result,
      source: "google_distance_matrix",
    };
  } catch (error) {
    console.error("❌ Error calculando distancia:", error.message);
    return {
      success: false,
      error: error.message,
      source: "google_distance_matrix",
    };
  }
}

/**
 * Calcula múltiples rutas a diferentes aeropuertos
 * @param {Object} hotelLocation - Ubicación del hotel
 * @param {Array} airportCodes - Lista de códigos de aeropuertos
 * @param {Object} options - Opciones adicionales
 */
async function calculateMultipleRoutes(hotelLocation, airportCodes = ["MEX", "GDL", "CUN"], options = {}) {
  try {
    console.log(`🗺️ Calculando ${airportCodes.length} rutas desde hotel...`);

    const promises = airportCodes.map((code) =>
      calculateTravelTime(hotelLocation, code, options),
    );

    const results = await Promise.all(promises);

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    // Encontrar la ruta más corta en tiempo
    const fastest = successful.reduce((prev, current) => {
      const prevTime = prev.data?.durationInTraffic?.value ||
          prev.data?.duration?.value || Infinity;
      const currentTime = current.data?.durationInTraffic?.value ||
          current.data?.duration?.value || Infinity;
      return currentTime < prevTime ? current : prev;
    }, {data: {duration: {value: Infinity}}});

    return {
      success: true,
      results: successful,
      failed: failed,
      fastest: fastest.success ? fastest.data : null,
      summary: {
        total: airportCodes.length,
        successful: successful.length,
        failed: failed.length,
        calculatedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("❌ Error en cálculo múltiple:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Calcula recomendaciones de tiempo de salida
 * @param {Object} routeData - Datos de la ruta
 * @return {Object} Tiempos recomendados
 */
function calculateRecommendedDeparture(routeData) {
  const baseTime = routeData.durationInTraffic?.minutes ||
      routeData.duration.minutes;

  // Factores de tiempo adicional recomendado
  const factors = {
    buffer: 15, // 15 min buffer general
    checkin_domestic: 90, // 90 min para vuelos nacionales
    checkin_international: 120, // 2 horas para vuelos internacionales
    traffic_buffer: routeData.trafficConditions === "heavy" ? 20 :
        routeData.trafficConditions === "moderate" ? 10 : 0,
  };

  return {
    domestic_flight: {
      recommended_departure_before_flight: baseTime + factors.buffer +
          factors.checkin_domestic + factors.traffic_buffer,
      breakdown: {
        travel_time: baseTime,
        traffic_buffer: factors.traffic_buffer,
        checkin_time: factors.checkin_domestic,
        general_buffer: factors.buffer,
      },
    },
    international_flight: {
      recommended_departure_before_flight: baseTime + factors.buffer +
          factors.checkin_international + factors.traffic_buffer,
      breakdown: {
        travel_time: baseTime,
        traffic_buffer: factors.traffic_buffer,
        checkin_time: factors.checkin_international,
        general_buffer: factors.buffer,
      },
    },
    traffic_status: routeData.trafficConditions,
  };
}

/**
 * Valida coordenadas de ubicación
 * @param {Object} location - Ubicación a validar
 * @return {Object} Resultado de validación
 */
function validateLocation(location) {
  if (!location || typeof location !== "object") {
    return {valid: false, error: "Ubicación requerida"};
  }

  if (!location.lat || !location.lng) {
    return {valid: false, error: "Coordenadas lat/lng requeridas"};
  }

  const lat = parseFloat(location.lat);
  const lng = parseFloat(location.lng);

  if (isNaN(lat) || isNaN(lng)) {
    return {valid: false, error: "Coordenadas deben ser números válidos"};
  }

  if (lat < -90 || lat > 90) {
    return {valid: false, error: "Latitud debe estar entre -90 y 90"};
  }

  if (lng < -180 || lng > 180) {
    return {valid: false, error: "Longitud debe estar entre -180 y 180"};
  }

  // Validar que esté en México aproximadamente
  if (lat < 14.5 || lat > 32.7 || lng < -118.4 || lng > -86.7) {
    return {
      valid: true,
      warning: "La ubicación parece estar fuera de México",
    };
  }

  return {valid: true};
}

module.exports = {
  calculateTravelTime,
  calculateMultipleRoutes,
  validateLocation,
  AIRPORTS,
};
