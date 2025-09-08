require("dotenv").config();
const axios = require("axios");

/**
 * Service for fetching flight data from multiple APIs
 */
class FlightService {
  /**
   * Initialize FlightService with API configuration
   */
  constructor() {
    // Configurar APIs usando variables de entorno
    this.openSkyClientId = process.env.OPENSKY_CLIENT_ID;
    this.openSkyClientSecret = process.env.OPENSKY_CLIENT_SECRET;
    this.aviationStackKey = process.env.AVIATIONSTACK_KEY;

    // Para OAuth2
    this.openSkyToken = null;
    this.tokenExpiryTime = 0;

    console.log("🔧 APIs configuradas:", {
      opensky: !!this.openSkyClientId,
      aviationstack: !!this.aviationStackKey,
      oauth2: !!(this.openSkyClientId && this.openSkyClientSecret),
    });

    // Coordenadas aproximadas de aeropuertos mexicanos
    this.airportCoords = {
      MEX: {
        lat1: 19.4, lon1: -99.1, lat2: 19.45, lon2: -99.05,
        name: "Aeropuerto Internacional Ciudad de México",
        iata: "MEX",
        icao: "MMMX",
      },
      TLC: {
        lat1: 19.33, lon1: -99.57, lat2: 19.37, lon2: -99.53,
        name: "Aeropuerto Internacional de Toluca",
        iata: "TLC",
        icao: "MMTO",
      },
      NLU: {
        lat1: 19.73, lon1: -99.02, lat2: 19.77, lon2: -98.98,
        name: "Aeropuerto Internacional Felipe Ángeles",
        iata: "NLU",
        icao: "MMSM",
      },
    };

    // Mapeo de aerolíneas
    this.airlineMapping = {
      "AMX": "Aeromexico",
      "VOI": "Volaris",
      "VIV": "VivaAerobus",
      "ITJ": "Interjet",
      "CMP": "Copa Airlines",
      "AAL": "American Airlines",
      "DAL": "Delta Air Lines",
      "UAL": "United Airlines",
      "AFR": "Air France",
      "DLH": "Lufthansa",
      "KLM": "KLM",
      "BAW": "British Airways",
    };
  }

  /**
   * Obtener token OAuth2 de OpenSky Network
   */
  async getOpenSkyToken() {
    // Verificar si el token actual aún es válido (expira en 30 min)
    if (this.openSkyToken && Date.now() < this.tokenExpiryTime) {
      return this.openSkyToken;
    }

    if (!this.openSkyClientId || !this.openSkyClientSecret) {
      console.log("🔓 OpenSky credenciales no configuradas para OAuth2");
      return null;
    }

    try {
      console.log("🔑 Obteniendo nuevo token OAuth2 de OpenSky...");

      const tokenResponse = await axios.post(
          "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token",
          new URLSearchParams({
            grant_type: "client_credentials",
            client_id: this.openSkyClientId,
            client_secret: this.openSkyClientSecret,
          }),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            timeout: 15000,
          },
      );

      this.openSkyToken = tokenResponse.data.access_token;
      // Token expira en 30 minutos, renovarlo 5 minutos antes
      this.tokenExpiryTime = Date.now() + (25 * 60 * 1000);

      console.log("✅ Token OAuth2 obtenido correctamente");
      return this.openSkyToken;
    } catch (error) {
      console.error("❌ Error obteniendo token OAuth2:", error.message);
      if (error.response) {
        console.error("📝 Respuesta del servidor:", error.response.data);
      }
      return null;
    }
  }

  /**
   * Obtener datos usando OpenSky sin autenticación (limitado)
   * @param {string} airport - Airport code
   * @param {Object} coord - Airport coordinates
   * @return {Promise<Object|null>} Flight data or null
   */
  async getOpenSkyAnonymous(airport, coord) {
    try {
      console.log("📡 Usando OpenSky sin autenticación (limitado)");

      const response = await axios.get(
          `https://opensky-network.org/api/states/all?lamin=${coord.lat1}&lomin=${coord.lon1}&lamax=${coord.lat2}&lomax=${coord.lon2}`,
          {timeout: 15000},
      );

      return this.processOpenSkyData(response.data, airport);
    } catch (error) {
      console.error(
          `❌ OpenSky anonymous error para ${airport}:`,
          error.message,
      );

      // Manejar rate limits específicos
      if (error.response?.status === 429) {
        console.error("⏳ Rate limit excedido en OpenSky anónimo");
      }

      return null;
    }
  }

  /**
   * Obtener datos de vuelos usando OpenSky Network con OAuth2
   * @param {string} airport - Airport code
   * @return {Promise<Object>} Flight data
   */
  async getFlightsFromOpenSky(airport) {
    const coord = this.airportCoords[airport];
    if (!coord) {
      throw new Error(`Aeropuerto ${airport} no soportado`);
    }

    try {
      console.log(`📡 Obteniendo datos de OpenSky para ${airport}...`);

      // Intentar obtener token OAuth2 primero
      const token = await this.getOpenSkyToken();

      if (!token) {
        console.log(
            "🔓 No se pudo obtener token OAuth2, " +
            "usando API sin autenticación",
        );
        // Fallback a API sin autenticación (limitada)
        return await this.getOpenSkyAnonymous(airport, coord);
      }

      console.log("🔐 Usando autenticación OAuth2 para OpenSky");

      const response = await axios.get(
          `https://opensky-network.org/api/states/all?lamin=${coord.lat1}&lomin=${coord.lon1}&lamax=${coord.lat2}&lomax=${coord.lon2}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Accept": "application/json",
            },
            timeout: 15000,
          },
      );

      return this.processOpenSkyData(response.data, airport);
    } catch (error) {
      console.error(`❌ Error OpenSky OAuth2 para ${airport}:`, error.message);

      // Si el token expiró o es inválido, invalidar y intentar fallback
      if (error.response?.status === 401) {
        console.log("🔄 Token expirado/inválido, invalidando token...");
        this.openSkyToken = null;
        this.tokenExpiryTime = 0;

        // Intentar fallback sin autenticación
        try {
          return await this.getOpenSkyAnonymous(airport, coord);
        } catch (fallbackError) {
          console.error(
              `❌ Fallback también falló para ${airport}:`,
              fallbackError.message,
          );
          throw fallbackError;
        }
      }

      // Si es rate limit, propagar el error
      if (error.response?.status === 429) {
        console.log(`⏳ Rate limit detectado en OAuth2 para ${airport}`);
        throw new Error(`Rate limit en OpenSky OAuth2 para ${airport}`);
      }

      throw error;
    }
  }

  /**
   * Fallback usando AviationStack API (requiere API key)
   * @param {string} airport - Airport code
   * @return {Promise<Object|null>} Flight data or null
   */
  async getFlightsFromAviationStack(airport) {
    if (!this.aviationStackKey) {
      console.warn("⚠️ AVIATIONSTACK_KEY no configurada");
      return null;
    }

    try {
      console.log(`📡 Obteniendo datos de AviationStack para ${airport}...`);

      const [departuresResponse, arrivalsResponse] = await Promise.all([
        axios.get(
            `http://api.aviationstack.com/v1/flights?access_key=${this.aviationStackKey}&dep_iata=${airport}&limit=15`,
            {timeout: 15000},
        ),
        axios.get(
            `http://api.aviationstack.com/v1/flights?access_key=${this.aviationStackKey}&arr_iata=${airport}&limit=15`,
            {timeout: 15000},
        ),
      ]);

      return this.processAviationStackData(
          departuresResponse.data,
          arrivalsResponse.data,
          airport,
      );
    } catch (error) {
      console.error(`❌ Error AviationStack para ${airport}:`, error.message);

      // Manejar errores específicos de AviationStack
      if (error.response?.status === 403) {
        console.error("🚫 API Key inválida o límite excedido en AviationStack");
      } else if (error.response?.status === 429) {
        console.error("⏳ Rate limit excedido en AviationStack");
      }

      throw error;
    }
  }

  /**
   * Procesar datos de OpenSky Network
   * @param {Object} data - Raw OpenSky data
   * @param {string} airport - Airport code
   * @return {Object} Processed flight data
   */
  processOpenSkyData(data, airport) {
    if (!data || !data.states || data.states.length === 0) {
      return this.getEmptyFlightData(airport, "opensky");
    }

    const flights = data.states
        .filter((flight) => flight && flight[1]) // Filtrar vuelos con callsign
        .slice(0, 15) // Limitar a 15 vuelos
        .map((flight) => ({
          flightNumber: flight[1].trim() || "N/A",
          airline: this.extractAirlineFromCallsign(flight[1]),
          destination: this.determineDestination(flight, airport),
          origin: airport,
          scheduledTime: flight[3] ?
              new Date(flight[3] * 1000).toISOString() :
              new Date().toISOString(),
          estimatedTime: flight[4] ?
              new Date(flight[4] * 1000).toISOString() : null,
          status: this.determineFlightStatus(flight),
          altitude: flight[7] || 0,
          velocity: flight[9] || 0,
          heading: flight[10] || 0,
          aircraft: {
            icao24: flight[0] || null,
            callsign: flight[1] || null,
            country: flight[2] || null,
          },
        }));

    // Separar en salidas y llegadas (simulado basado en velocidad y altitud)
    const departures = flights.filter(
        (f) => f.velocity > 50 || f.altitude > 1000,
    );
    const arrivals = flights.filter(
        (f) => f.velocity <= 50 && f.altitude <= 1000,
    );

    return {
      airport: {
        code: airport,
        name: this.airportCoords[airport].name,
      },
      departures: departures,
      arrivals: arrivals,
      lastUpdate: new Date().toISOString(),
      source: "opensky",
      totalFlights: flights.length,
    };
  }

  /**
   * Procesar datos de AviationStack
   * @param {Object} departuresData - Raw departures data
   * @param {Object} arrivalsData - Raw arrivals data
   * @param {string} airport - Airport code
   * @return {Object} Processed flight data
   */
  processAviationStackData(departuresData, arrivalsData, airport) {
    const departures = (departuresData.data || []).map((flight) => ({
      flightNumber: flight.flight?.iata || flight.flight?.icao || "N/A",
      airline: flight.airline?.name || "Aerolínea desconocida",
      destination: flight.arrival?.airport || "Destino desconocido",
      origin: airport,
      scheduledTime: flight.departure?.scheduled || new Date().toISOString(),
      estimatedTime: flight.departure?.estimated || null,
      status: this.mapAviationStackStatus(flight.flight_status),
      terminal: flight.departure?.terminal || null,
      gate: flight.departure?.gate || null,
      aircraft: {
        type: flight.aircraft?.type || null,
        registration: flight.aircraft?.registration || null,
      },
    }));

    const arrivals = (arrivalsData.data || []).map((flight) => ({
      flightNumber: flight.flight?.iata || flight.flight?.icao || "N/A",
      airline: flight.airline?.name || "Aerolínea desconocida",
      origin: flight.departure?.airport || "Origen desconocido",
      destination: airport,
      scheduledTime: flight.arrival?.scheduled || new Date().toISOString(),
      estimatedTime: flight.arrival?.estimated || null,
      status: this.mapAviationStackStatus(flight.flight_status),
      terminal: flight.arrival?.terminal || null,
      gate: flight.arrival?.gate || null,
      aircraft: {
        type: flight.aircraft?.type || null,
        registration: flight.aircraft?.registration || null,
      },
    }));

    return {
      airport: {
        code: airport,
        name: this.airportCoords[airport].name,
      },
      departures: departures,
      arrivals: arrivals,
      lastUpdate: new Date().toISOString(),
      source: "aviationstack",
      totalFlights: departures.length + arrivals.length,
    };
  }

  /**
   * Extraer aerolínea del callsign
   * @param {string} callsign - Flight callsign
   * @return {string} Airline name
   */
  extractAirlineFromCallsign(callsign) {
    if (!callsign) return "Aerolínea desconocida";

    const prefix = callsign.substring(0, 3).toUpperCase();
    return this.airlineMapping[prefix] || "Otra aerolínea";
  }

  /**
   * Determinar destino basado en posición y movimiento
   * @param {Array} flight - Flight data array
   * @param {string} airport - Origin airport code
   * @return {string} Destination code
   */
  determineDestination(flight, airport) {
    // Simplificado - en una implementación real se usaría una
    // base de datos de rutas
    const destinations = ["CDMX", "GDL", "MTY", "CUN", "TIJ", "MID", "PVR"];
    return destinations[Math.floor(Math.random() * destinations.length)];
  }

  /**
   * Determinar estado del vuelo
   * @param {Array} flight - Flight data array
   * @return {string} Flight status
   */
  determineFlightStatus(flight) {
    if (!flight[8]) return "En tierra";
    if (flight[7] > 10000) return "En vuelo";
    if (flight[9] > 100) return "Despegando";
    return "Preparando";
  }

  /**
   * Mapear estado de AviationStack
   * @param {string} status - Raw status from API
   * @return {string} Mapped status in Spanish
   */
  mapAviationStackStatus(status) {
    const statusMap = {
      "scheduled": "Programado",
      "active": "En vuelo",
      "landed": "Aterrizó",
      "cancelled": "Cancelado",
      "incident": "Incidente",
      "diverted": "Desviado",
    };
    return statusMap[status] || "Desconocido";
  }

  /**
   * Datos vacíos para cuando no hay información
   * @param {string} airport - Airport code
   * @param {string} source - Data source name
   * @return {Object} Empty flight data structure
   */
  getEmptyFlightData(airport, source) {
    return {
      airport: {
        code: airport,
        name: this.airportCoords[airport].name,
      },
      departures: [],
      arrivals: [],
      lastUpdate: new Date().toISOString(),
      source: source,
      totalFlights: 0,
      error: "No hay datos de vuelos disponibles",
    };
  }

  /**
   * Obtener datos de vuelos con fallback automático
   * @param {string} airport - Airport code
   * @return {Promise<Object>} Flight data with fallback
   */
  async getFlightData(airport) {
    try {
      // Intentar OpenSky primero
      return await this.getFlightsFromOpenSky(airport);
    } catch (openSkyError) {
      console.warn(
          `OpenSky falló para ${airport}, intentando AviationStack...`,
      );

      try {
        // Fallback a AviationStack
        const aviationData = await this.getFlightsFromAviationStack(airport);
        if (aviationData) return aviationData;
      } catch (aviationError) {
        console.error(
            `AviationStack también falló para ${airport}:`,
            aviationError.message,
        );
      }

      // Si ambos fallan, retornar datos vacíos
      return this.getEmptyFlightData(airport, "fallback");
    }
  }
}

module.exports = new FlightService();
