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
    // Firebase Functions v2 - Solo usar process.env (functions.config() no disponible)
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
      source: "process.env (Functions v2)",
    });

    // Coordenadas aproximadas de aeropuertos mexicanos
    this.airportCoords = {
      MEX: {
        lat1: 19.4, lon1: -99.1, lat2: 19.45, lon2: -99.05,
        name: "Aeropuerto Internacional Ciudad de México",
        iata: "MEX",
        icao: "MMMX",
      },
      GDL: {
        lat1: 20.51, lon1: -103.32, lat2: 20.53, lon2: -103.30,
        name: "Aeropuerto Internacional de Guadalajara",
        iata: "GDL",
        icao: "MMGL",
      },
      CUN: {
        lat1: 21.03, lon1: -86.88, lat2: 21.04, lon2: -86.86,
        name: "Aeropuerto Internacional de Cancún",
        iata: "CUN",
        icao: "MMUN",
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
        // SIN LÍMITES - Procesar todos los vuelos disponibles
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
      console.log(`🛫 Consultando AeroDataBox para ${airport} (intentando TIER 2 primero)...`);

      // PASO 1: Intentar TIER 2 completo primero
      try {
        console.log(`📡 Intentando TIER 2 con timerange primero...`);

        // Usar endpoint relativo con parámetros optimizados para reducir de 512 a ~85 vuelos
        const url = `https://aerodatabox.p.rapidapi.com/flights/airports/iata/${airport}`;

        const params = new URLSearchParams({
          offsetMinutes: -30, // Comenzar 30 min antes (vs -180 default)
          durationMinutes: 1440, // Ventana total de 24 horas (sin límite práctico)
          direction: "Both",
          withLeg: "true",
          withCancelled: "true",
          withCodeshared: "true",
          withCargo: "false",
          withPrivate: "false",
          withLocation: "false",
        });

        const response = await axios.get(`${url}?${params}`, {
          headers: {
            "X-RapidAPI-Host": "aerodatabox.p.rapidapi.com",
            "X-RapidAPI-Key": this.aeroDataBoxKey,
          },
          timeout: 15000,
        });

        console.log(`✅ TIER 2 exitoso ${airport}: ${response.data.departures?.length || 0} salidas, ${response.data.arrivals?.length || 0} llegadas`);

        const fullData = this.processAeroDataBoxData(response.data, airport);
        fullData.source = "AeroDataBox (TIER 2 full)";
        return fullData;
      } catch (tier2Error) {
        console.log(`⚠️ TIER 2 falló (${tier2Error.response?.status}): ${tier2Error.message}`);
        console.log(`📡 Cayendo a FREE TIER como fallback...`);

        try {
          return await this.getFlightsFromAeroDataBoxFreeTier(airport);
        } catch (freeTierError) {
          console.log(`⚠️ FREE TIER también falló: ${freeTierError.message}`);
          throw tier2Error; // Propagar el error original del TIER 2
        }
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

    console.log(`🔄 Procesando datos de AeroDataBox para ${airport}...`);
    console.log(`📊 Datos recibidos: ${data.departures?.length || 0} salidas, ${data.arrivals?.length || 0} llegadas`);

    // Procesar SALIDAS con estructura real del playground
    if (data.departures && Array.isArray(data.departures)) {
      processed.departures = data.departures.map((flight) => ({
        flightNumber: flight.number || "N/A",
        airline: flight.airline?.name || "Unknown",
        airlineCode: flight.airline?.iata || flight.airline?.icao || "",
        destination: flight.arrival?.airport?.name || "Unknown",
        destinationCode: flight.arrival?.airport?.iata || "",

        // HORARIOS usando función corregida
        scheduledTime: this.extractAeroDataBoxTime(
            flight.departure?.scheduledTime,
        ),
        estimatedTime: this.extractAeroDataBoxTime(
            flight.departure?.revisedTime || flight.departure?.predictedTime,
        ),
        actualTime: this.extractAeroDataBoxTime(
            flight.departure?.runwayTime || flight.departure?.actualTime,
        ),

        // CAMPOS DE INFRAESTRUCTURA
        terminal: flight.departure?.terminal || "",
        gate: flight.departure?.gate || "",
        checkInDesk: flight.departure?.checkInDesk || "",

        // INFORMACIÓN ADICIONAL
        aircraft: flight.aircraft?.model || "",
        status: this.mapAeroDataBoxStatus(flight.status, flight),

        // NUEVOS CAMPOS
        delay: this.calculateDelay(
            flight.departure?.scheduledTime?.local,
            flight.departure?.revisedTime?.local,
        ),
        isCodeshare: flight.codeshareStatus === "IsCodeshared",
        dataQuality: flight.departure?.quality || flight.quality || ["Basic"],
        isLiveData: (flight.departure?.quality || flight.quality || []).includes("Live"),
      }));
    }

    // Procesar LLEGADAS con estructura real del playground
    if (data.arrivals && Array.isArray(data.arrivals)) {
      processed.arrivals = data.arrivals.map((flight) => ({
        flightNumber: flight.number || "N/A",
        airline: flight.airline?.name || "Unknown",
        airlineCode: flight.airline?.iata || flight.airline?.icao || "",
        origin: flight.departure?.airport?.name || "Unknown",
        originCode: flight.departure?.airport?.iata || "",

        // HORARIOS usando función corregida
        scheduledTime: this.extractAeroDataBoxTime(
            flight.arrival?.scheduledTime,
        ),
        estimatedTime: this.extractAeroDataBoxTime(
            flight.arrival?.revisedTime || flight.arrival?.predictedTime,
        ),
        actualTime: this.extractAeroDataBoxTime(
            flight.arrival?.runwayTime || flight.arrival?.actualTime,
        ),

        // CAMPOS DE INFRAESTRUCTURA
        terminal: flight.arrival?.terminal || "",
        gate: flight.arrival?.gate || "",
        baggage: flight.arrival?.baggageBelt || "",

        // INFORMACIÓN ADICIONAL
        aircraft: flight.aircraft?.model || "",
        status: this.mapAeroDataBoxStatus(flight.status, flight),

        // NUEVOS CAMPOS
        delay: this.calculateDelay(
            flight.arrival?.scheduledTime?.local,
            flight.arrival?.revisedTime?.local,
        ),
        isCodeshare: flight.codeshareStatus === "IsCodeshared",
        dataQuality: flight.arrival?.quality || flight.quality || ["Basic"],
        isLiveData: (flight.arrival?.quality || flight.quality || []).includes("Live"),
      }));
    }

    processed.totalFlights = processed.departures.length +
        processed.arrivals.length;

    console.log(`✅ Procesamiento completado:`);
    console.log(`   - Salidas procesadas: ${processed.departures.length}`);
    console.log(`   - Llegadas procesadas: ${processed.arrivals.length}`);
    console.log(`   - Total vuelos: ${processed.totalFlights}`);

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
   * Extraer tiempo específico de AeroDataBox con estructura {utc, local}
   * @param {Object} timeObj - Time object from AeroDataBox
   * @return {string} Formatted time HH:mm
   */
  extractAeroDataBoxTime(timeObj) {
    if (!timeObj) return "";

    try {
      // Si es un string directo (formato ISO)
      if (typeof timeObj === "string") {
        if (timeObj.includes("T")) {
          // Formato ISO: "2025-09-10T09:30:00Z"
          const timePart = timeObj.split("T")[1];
          return timePart ? timePart.substring(0, 5) : "";
        } else if (timeObj.includes(" ")) {
          // Formato: "2025-09-10 09:30-06:00" o "2025-09-10 09:30Z"
          const timePart = timeObj.split(" ")[1];
          if (timePart) {
            return timePart.substring(0, 5);
          }
        }
      }

      // Si es un objeto con propiedades utc/local
      if (typeof timeObj === "object" && timeObj !== null) {
        if (timeObj.local) {
          // Formato: "2025-09-10 09:30-06:00"
          const localTime = timeObj.local;
          if (localTime.includes(" ")) {
            const timePart = localTime.split(" ")[1];
            // Remover timezone si existe (-06:00 o +05:00)
            const cleanTime = timePart.split(/[-+]/)[0];
            return cleanTime ? cleanTime.substring(0, 5) : "";
          }
        }

        if (timeObj.utc) {
          // Formato: "2025-09-10 15:30Z" o "2025-09-10T15:30:00Z"
          const utcTime = timeObj.utc.replace("Z", "");
          let timePart;

          if (utcTime.includes("T")) {
            timePart = utcTime.split("T")[1];
          } else if (utcTime.includes(" ")) {
            timePart = utcTime.split(" ")[1];
          }

          if (timePart) {
            // Convertir UTC a hora local de México
            const [hours, minutes] = timePart.split(":");
            const utcDate = new Date();
            utcDate.setUTCHours(parseInt(hours), parseInt(minutes), 0, 0);

            return utcDate.toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              timeZone: "America/Mexico_City",
            });
          }
        }
      }

      return "";
    } catch (error) {
      console.error("Error extrayendo tiempo:", error.message, "Input:", timeObj);
      return "";
    }
  }

  /**
   * Mapear estado de vuelo de AeroDataBox con datos reales
   * @param {string} rawStatus - Raw status from API
   * @param {Object} flight - Complete flight object
   * @return {string} Mapped status in Spanish
   */
  mapAeroDataBoxStatus(rawStatus, flight) {
    // Estados reales confirmados en playground
    const statusMap = {
      "Unknown": "PROGRAMADO", // Estado más común
      "Expected": "ESPERADO", // Visto en arrivals
      "Scheduled": "PROGRAMADO",
      "Departed": "DESPEGÓ",
      "Boarding": "ABORDANDO",
      "Delayed": "RETRASADO",
      "On Time": "A TIEMPO",
      "Cancelled": "CANCELADO",
    };

    if (rawStatus && statusMap[rawStatus]) {
      return statusMap[rawStatus];
    }

    // Lógica inteligente basada en horarios
    if (flight?.departure?.runwayTime || flight?.arrival?.runwayTime) {
      return flight.departure ? "DESPEGÓ" : "ATERRIZÓ";
    }

    if (flight?.departure?.revisedTime || flight?.arrival?.revisedTime) {
      return "RETRASADO";
    }

    return "PROGRAMADO";
  }

  /**
   * Calcular estado inteligente basado en horarios reales
   * @param {string} scheduled - Scheduled time UTC
   * @param {string} revised - Revised time UTC
   * @param {string} actual - Actual runway time UTC
   * @return {string} Smart status in Spanish
   */
  calculateSmartStatus(scheduled, revised, actual) {
    if (!scheduled) return "PROGRAMADO";

    const now = new Date();
    const scheduledTime = new Date(scheduled);
    const revisedTime = revised ? new Date(revised) : null;
    const actualTime = actual ? new Date(actual) : null;

    // Si ya despegó
    if (actualTime && actualTime < now) return "DESPEGÓ";

    // Si hay tiempo revisado vs programado
    if (revisedTime && scheduledTime) {
      const delayMinutes = (revisedTime - scheduledTime) / (1000 * 60);
      if (delayMinutes > 15) return "RETRASADO";
    }

    // Basado en tiempo restante
    const timeToFlight = (scheduledTime - now) / (1000 * 60);

    if (timeToFlight < 0) return "DESPEGÓ";
    if (timeToFlight < 30) return "ABORDANDO";
    if (timeToFlight < 90) return "PRÓXIMO";
    return "A TIEMPO";
  }

  /**
   * Calcular retraso en minutos
   * @param {string} scheduledTimeLocal - Scheduled time in format "2025-09-10 09:30-06:00"
   * @param {string} revisedTimeLocal - Revised time in format "2025-09-10 09:30-06:00"
   * @return {number} Delay in minutes
   */
  calculateDelay(scheduledTimeLocal, revisedTimeLocal) {
    if (!scheduledTimeLocal || !revisedTimeLocal) return 0;

    try {
      // Parsear tiempos en formato "2025-09-10 09:30-06:00"
      const scheduled = new Date(scheduledTimeLocal.replace(/[-+]\d{2}:\d{2}$/, ""));
      const revised = new Date(revisedTimeLocal.replace(/[-+]\d{2}:\d{2}$/, ""));

      const delayMs = revised.getTime() - scheduled.getTime();
      return Math.round(delayMs / (1000 * 60)); // Minutos
    } catch (error) {
      console.error("Error calculando retraso:", error.message);
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
        direction: "Both", // Obtener salidas Y llegadas
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

    // Procesar TODAS las salidas disponibles (sin límites artificiales)
    if (data.departures && Array.isArray(data.departures)) {
      processed.departures = data.departures.map((flight) => ({
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
