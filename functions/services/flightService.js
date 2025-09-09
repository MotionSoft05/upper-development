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
    this.aeroDataBoxKey = process.env.AERODATABOX_API_KEY;

    // Para OAuth2
    this.openSkyToken = null;
    this.tokenExpiryTime = 0;

    console.log("🔧 APIs configuradas:", {
      aerodatabox: !!this.aeroDataBoxKey,
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
   * Obtener datos de vuelos usando AeroDataBox API
   * @param {string} airport - Airport code
   * @return {Promise<Object>} Flight data from AeroDataBox
   */
  async getFlightsFromAeroDataBox(airport) {
    if (!this.aeroDataBoxKey) {
      throw new Error("AERODATABOX_API_KEY no configurada");
    }

    try {
      console.log(`🛫 Consultando AeroDataBox para ${airport} (intentando plan gratuito primero)...`);

      // PASO 1: Intentar enfoque de plan gratuito primero
      try {
        console.log(`📡 Intentando enfoque FREE TIER primero...`);
        return await this.getFlightsFromAeroDataBoxFreeTier(airport);
      } catch (freeTierError) {
        console.log(`⚠️ Plan gratuito falló: ${freeTierError.message}`);
        console.log(`📡 Intentando endpoint FIDS completo...`);

        // PASO 2: Si falla, intentar con endpoint completo (plan pagado)
        const url = `https://aerodatabox.p.rapidapi.com/flights/airports/iata/${airport}`;

        const params = new URLSearchParams({
          withLeg: "true",
          withCancelled: "true",
          withCodeshared: "true",
          withCargo: "false",
          withPrivate: "false",
          direction: "Both",
        });

        const response = await axios.get(`${url}?${params}`, {
          headers: {
            "X-RapidAPI-Host": "aerodatabox.p.rapidapi.com",
            "X-RapidAPI-Key": this.aeroDataBoxKey,
          },
          timeout: 15000,
        });

        console.log(`✅ AeroDataBox FIDS completo ${airport}: ${response.data.departures?.length || 0} salidas, ${response.data.arrivals?.length || 0} llegadas`);

        const fullData = this.processAeroDataBoxData(response.data, airport);
        fullData.source = "AeroDataBox (full FIDS)";
        return fullData;
      }
    } catch (error) {
      console.error(`❌ Error AeroDataBox ${airport}:`, error.message);

      if (error.response?.status === 403) {
        console.error("🚫 API Key inválida o límite excedido en AeroDataBox");
      } else if (error.response?.status === 429) {
        console.error("⏳ Rate limit excedido en AeroDataBox");
      }

      throw error;
    }
  }

  /**
   * Procesar datos de AeroDataBox
   * @param {Object} data - Raw AeroDataBox data
   * @param {string} airport - Airport code
   * @return {Object} Processed flight data
   */
  processAeroDataBoxData(data, airport) {
    const processed = {
      airport: {
        code: airport,
        name: this.airportCoords[airport].name,
      },
      departures: [],
      arrivals: [],
      lastUpdate: new Date().toISOString(),
      source: "AeroDataBox",
    };

    // Procesar SALIDAS
    if (data.departures && Array.isArray(data.departures)) {
      processed.departures = data.departures.map((flight) => ({
        flightNumber: flight.number || "N/A",
        airline: flight.airline?.name || "Unknown",
        airlineCode: flight.airline?.iata || flight.airline?.icao || "",
        destination: flight.movement?.airport?.name || "Unknown",
        destinationCode: flight.movement?.airport?.iata || flight.movement?.airport?.icao || "",
        scheduledTime: this.extractTime(flight.movement?.scheduledTimeLocal),
        actualTime: this.extractTime(flight.movement?.actualTimeLocal),
        estimatedTime: this.extractTime(flight.movement?.estimatedTimeLocal),
        status: this.mapAeroDataBoxStatus(flight.status),
        terminal: flight.movement?.terminal || "",
        gate: flight.movement?.gate || "",
        checkInDesk: flight.movement?.checkInDesk || "",
        aircraft: flight.aircraft?.model || "",
        delay: this.calculateDelay(
            flight.movement?.scheduledTimeLocal,
            flight.movement?.actualTimeLocal ||
                flight.movement?.estimatedTimeLocal,
        ),
        isCodeshare: flight.codeshareStatus === "IsCodeshared",
      }));
    }

    // Procesar LLEGADAS
    if (data.arrivals && Array.isArray(data.arrivals)) {
      processed.arrivals = data.arrivals.map((flight) => ({
        flightNumber: flight.number || "N/A",
        airline: flight.airline?.name || "Unknown",
        airlineCode: flight.airline?.iata || flight.airline?.icao || "",
        origin: flight.movement?.airport?.name || "Unknown",
        originCode: flight.movement?.airport?.iata || flight.movement?.airport?.icao || "",
        scheduledTime: this.extractTime(flight.movement?.scheduledTimeLocal),
        actualTime: this.extractTime(flight.movement?.actualTimeLocal),
        estimatedTime: this.extractTime(flight.movement?.estimatedTimeLocal),
        status: this.mapAeroDataBoxStatus(flight.status),
        terminal: flight.movement?.terminal || "",
        gate: flight.movement?.gate || "",
        baggage: flight.movement?.baggageBelt || "",
        aircraft: flight.aircraft?.model || "",
        delay: this.calculateDelay(
            flight.movement?.scheduledTimeLocal,
            flight.movement?.actualTimeLocal ||
                flight.movement?.estimatedTimeLocal,
        ),
        isCodeshare: flight.codeshareStatus === "IsCodeshared",
      }));
    }

    processed.totalFlights = processed.departures.length +
        processed.arrivals.length;
    return processed;
  }

  /**
   * Extraer tiempo de string ISO
   * @param {string} timeString - ISO time string
   * @return {string} Formatted time HH:mm
   */
  extractTime(timeString) {
    if (!timeString) return "";
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return timeString;
    }
  }

  /**
   * Mapear estado de vuelo de AeroDataBox
   * @param {string} status - Raw status from API
   * @return {string} Mapped status in Spanish
   */
  mapAeroDataBoxStatus(status) {
    const statusMap = {
      "Scheduled": "Programado",
      "Active": "En vuelo",
      "Landed": "Aterrizó",
      "Cancelled": "Cancelado",
      "Diverted": "Desviado",
      "Delayed": "Retrasado",
      "Boarding": "Abordando",
      "GateClosed": "Puerta cerrada",
    };
    return statusMap[status] || status || "Desconocido";
  }

  /**
   * Calcular retraso en minutos
   * @param {string} scheduled - Scheduled time ISO string
   * @param {string} actual - Actual time ISO string
   * @return {number} Delay in minutes
   */
  calculateDelay(scheduled, actual) {
    if (!scheduled || !actual) return 0;
    try {
      const scheduledTime = new Date(scheduled);
      const actualTime = new Date(actual);
      return Math.round((actualTime - scheduledTime) / (1000 * 60));
    } catch {
      return 0;
    }
  }

  /**
   * Obtener datos de AeroDataBox usando enfoque de plan gratuito
   * @param {string} airport - Airport code
   * @return {Promise<Object>} Flight data with free tier approach
   */
  async getFlightsFromAeroDataBoxFreeTier(airport) {
    if (!this.aeroDataBoxKey) {
      throw new Error("AERODATABOX_API_KEY no configurada");
    }

    try {
      console.log(`🛫 Consultando AeroDataBox para ${airport} (plan gratuito)...`);

      // PASO 1: Probar endpoint TIER 1 primero (Airport info)
      const airportInfoUrl = `https://aerodatabox.p.rapidapi.com/airports/iata/${airport}`;

      console.log(`📡 Probando endpoint TIER 1: ${airportInfoUrl}`);

      const airportResponse = await axios.get(airportInfoUrl, {
        headers: {
          "X-RapidAPI-Host": "aerodatabox.p.rapidapi.com",
          "X-RapidAPI-Key": this.aeroDataBoxKey,
        },
        timeout: 15000,
      });

      if (airportResponse.status === 200) {
        const airportData = airportResponse.data;
        console.log(`✅ TIER 1 exitoso para ${airport}:`, airportData.name);

        // Ahora intentar FIDS con parámetros mínimos
        return await this.tryFIDSWithMinimalParams(airport, airportData);
      } else {
        console.log(`❌ TIER 1 falló (${airportResponse.status}), intentando approach alternativo...`);
        throw new Error(`Airport info failed: ${airportResponse.status}`);
      }
    } catch (error) {
      console.error(`❌ Error AeroDataBox free tier ${airport}:`, error.message);
      throw error;
    }
  }

  /**
   * Función para probar FIDS con parámetros mínimos
   * @param {string} airportCode - Airport code
   * @param {Object} airportInfo - Airport information from TIER 1
   * @return {Promise<Object>} Limited flight data
   */
  async tryFIDSWithMinimalParams(airportCode, airportInfo) {
    try {
      // Endpoint FIDS pero con parámetros muy específicos para reducir carga
      const fidsUrl = `https://aerodatabox.p.rapidapi.com/flights/airports/iata/${airportCode}`;

      // Parámetros MUY limitados para plan gratuito
      const params = new URLSearchParams({
        withLeg: "false", // Reducir complejidad
        withCancelled: "false", // Solo vuelos activos
        withCodeshared: "false", // Sin codeshare
        withCargo: "false",
        withPrivate: "false",
        direction: "Departure", // Solo salidas para reducir datos
      });

      console.log(`📡 Intentando FIDS limitado: ${fidsUrl}?${params}`);

      const response = await axios.get(`${fidsUrl}?${params}`, {
        headers: {
          "X-RapidAPI-Host": "aerodatabox.p.rapidapi.com",
          "X-RapidAPI-Key": this.aeroDataBoxKey,
        },
        timeout: 15000,
      });

      if (response.status === 200) {
        const data = response.data;
        console.log(`✅ FIDS exitoso ${airportCode}: ` +
            `${data.departures?.length || 0} salidas`);

        return this.processAeroDataBoxMinimalData(
            data, airportCode, airportInfo);
      } else {
        throw new Error(`FIDS Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error(`❌ Error FIDS ${airportCode}:`, error.message);

      // Si FIDS falla, retornar solo info del aeropuerto
      return this.getBasicAirportInfo(airportCode, airportInfo);
    }
  }

  /**
   * Procesar datos mínimos de AeroDataBox
   * @param {Object} data - Minimal flight data
   * @param {string} airport - Airport code
   * @param {Object} airportInfo - Airport information
   * @return {Object} Processed minimal flight data
   */
  processAeroDataBoxMinimalData(data, airport, airportInfo) {
    const processed = {
      airport: {
        code: airport,
        name: this.airportCoords[airport].name,
      },
      departures: [],
      arrivals: [],
      lastUpdate: new Date().toISOString(),
      source: "AeroDataBox (free tier)",
      airportInfo: {
        name: airportInfo.fullName || airportInfo.name,
        city: airportInfo.city?.name,
        country: airportInfo.country?.name,
        timezone: airportInfo.timeZone,
      },
    };

    // Procesar solo SALIDAS (limitado en plan gratuito)
    if (data.departures && Array.isArray(data.departures)) {
      processed.departures = data.departures.slice(0, 5).map((flight) => ({
        flightNumber: flight.number || "N/A",
        airline: flight.airline?.name || "Unknown",
        destination: flight.movement?.airport?.name || "Unknown",
        scheduledTime: this.extractTime(flight.movement?.scheduledTimeLocal),
        status: this.mapAeroDataBoxStatus(flight.status),
        terminal: flight.movement?.terminal || "",
        gate: flight.movement?.gate || "",
        aircraft: flight.aircraft?.model || "",
      }));
    }

    processed.totalFlights = processed.departures.length;
    processed.note = "Plan gratuito - datos limitados disponibles";

    return processed;
  }

  /**
   * Retornar información básica del aeropuerto cuando los vuelos no están disponibles
   * @param {string} airport - Airport code
   * @param {Object} airportInfo - Airport information
   * @return {Object} Basic airport information
   */
  getBasicAirportInfo(airport, airportInfo) {
    return {
      airport: {
        code: airport,
        name: this.airportCoords[airport].name,
      },
      departures: [],
      arrivals: [],
      lastUpdate: new Date().toISOString(),
      source: "AeroDataBox (airport info only)",
      airportInfo: {
        name: airportInfo.fullName || airportInfo.name,
        city: airportInfo.city?.name,
        country: airportInfo.country?.name,
        timezone: airportInfo.timeZone,
      },
      totalFlights: 0,
      note: "Solo información de aeropuerto disponible en plan gratuito",
    };
  }

  /**
   * Método de testing para AeroDataBox con enfoque de plan gratuito
   * @param {string} airport - Airport code to test (default: MEX)
   * @return {Promise<Object>} Test results
   */
  async testAeroDataBoxFreeTier(airport = "MEX") {
    console.log(`🧪 Testing AeroDataBox con enfoque de plan gratuito para ${airport}...`);

    try {
      // Test 1: Verificar conectividad básica
      console.log("1. Probando conectividad básica...");
      const basicData = await this.getFlightsFromAeroDataBoxFreeTier(airport);

      console.log("✅ Test plan gratuito exitoso:", {
        airport: basicData.airport.code,
        airportName: basicData.airportInfo?.name,
        departures: basicData.departures?.length || 0,
        source: basicData.source,
        note: basicData.note,
      });

      return basicData;
    } catch (error) {
      console.log("2. Probando fallback con parámetros mínimos...");

      try {
        const minimalData = await this.getFlightsFromAeroDataBox(airport);
        console.log("✅ Test fallback exitoso:", {
          departures: minimalData.departures?.length || 0,
          source: minimalData.source,
        });
        return minimalData;
      } catch (secondError) {
        console.error("❌ Ambos tests fallaron:", secondError.message);
        throw secondError;
      }
    }
  }

  /**
   * Método de testing para AeroDataBox
   * @param {string} airport - Airport code to test (default: MEX)
   * @return {Promise<Object>} Test results
   */
  async testAeroDataBox(airport = "MEX") {
    console.log(`🧪 Testing AeroDataBox para ${airport}...`);

    try {
      const testData = await this.getFlightsFromAeroDataBox(airport);
      console.log("✅ Test AeroDataBox exitoso:", {
        departures: testData.departures.length,
        arrivals: testData.arrivals.length,
        source: testData.source,
        totalFlights: testData.totalFlights,
      });
      return testData;
    } catch (error) {
      console.error("❌ Test AeroDataBox falló:", error.message);
      throw error;
    }
  }

  /**
   * Obtener datos de vuelos con fallback automático
   * @param {string} airport - Airport code
   * @return {Promise<Object>} Flight data with fallback
   */
  async getFlightData(airport) {
    console.log(`🚀 Obteniendo datos de vuelos para ${airport} con nueva jerarquía de APIs (FREE TIER optimizado)...`);

    try {
      // PASO 1: Intentar AeroDataBox con plan gratuito optimizado PRIMERO
      console.log(`📡 Intentando AeroDataBox (FREE TIER optimizado) para ${airport}...`);
      const aeroData = await this.getFlightsFromAeroDataBox(airport);
      console.log(`✅ AeroDataBox exitoso para ${airport} - Fuente: ${aeroData.source}`);
      return aeroData;
    } catch (aeroError) {
      console.warn(`⚠️ AeroDataBox falló para ${airport}: ${aeroError.message}`);
      console.log(`📡 Intentando OpenSky como fallback...`);

      try {
        // PASO 2: Fallback a OpenSky
        const openSkyData = await this.getFlightsFromOpenSky(airport);
        console.log(`✅ OpenSky exitoso para ${airport} (fallback)`);
        // Marcar que vino de fallback
        openSkyData.source = "OpenSky (fallback from AeroDataBox)";
        return openSkyData;
      } catch (openSkyError) {
        console.warn(`⚠️ OpenSky también falló para ${airport}: ${openSkyError.message}`);
        console.log(`📡 Intentando AviationStack como último fallback...`);

        try {
          // PASO 3: Último fallback a AviationStack
          const aviationData = await this.getFlightsFromAviationStack(airport);
          if (aviationData) {
            console.log(`✅ AviationStack exitoso para ${airport} (último fallback)`);
            // Marcar que vino de múltiples fallbacks
            aviationData.source = "AviationStack (fallback from AeroDataBox + OpenSky)";
            return aviationData;
          }
        } catch (aviationError) {
          console.error(`❌ Todas las APIs fallaron para ${airport}`);
          console.error(`- AeroDataBox: ${aeroError.message}`);
          console.error(`- OpenSky: ${openSkyError.message}`);
          console.error(`- AviationStack: ${aviationError.message}`);
        }
      }
    }

    // Si todas las APIs fallan, retornar datos vacíos
    const emptyData = this.getEmptyFlightData(airport, "all-apis-failed");
    emptyData.error = "Todas las APIs fallaron (AeroDataBox, OpenSky, AviationStack)";
    return emptyData;
  }
}

module.exports = new FlightService();
