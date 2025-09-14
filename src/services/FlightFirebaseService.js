import { 
  getFirestore, 
  doc, 
  onSnapshot, 
  getDoc 
} from "firebase/firestore";

/**
 * Servicio para obtener datos de vuelos desde Firebase
 * Diseñado para ser usado en la app Android TV
 */
export class FlightFirebaseService {
  constructor() {
    this.db = getFirestore();
    this.activeListeners = new Map();
  }

  /**
   * Suscribirse a actualizaciones en tiempo real de datos de vuelos
   * @param {string} airport - Código del aeropuerto (MEX, GDL, CUN)
   * @param {function} callback - Función callback para recibir los datos
   * @param {function} errorCallback - Función callback para manejar errores
   * @returns {function} - Función para desuscribirse
   */
  subscribeToFlightData(airport, callback, errorCallback = null) {
    const airportCode = airport.toUpperCase();
    
    console.log(`🔄 Suscribiéndose a datos de vuelos para ${airportCode}`);
    
    const unsubscribe = onSnapshot(
      doc(this.db, 'flightData', airportCode),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const processedData = this.processFlightData(data, airportCode);
          
          console.log(`✅ Datos actualizados recibidos para ${airportCode}:`, {
            totalFlights: processedData.totalFlights,
            departures: processedData.departures.length,
            arrivals: processedData.arrivals.length,
            lastUpdate: processedData.lastUpdate,
            source: processedData.source
          });
          
          callback(processedData);
        } else {
          console.warn(`⚠️ No existen datos para ${airportCode}`);
          callback(this.getEmptyFlightData(airportCode));
        }
      },
      (error) => {
        console.error(`❌ Error en suscripción para ${airportCode}:`, error);
        if (errorCallback) {
          errorCallback(error);
        } else {
          // Fallback: intentar obtener datos estáticos
          this.getFlightData(airportCode).then(callback).catch(() => {
            callback(this.getEmptyFlightData(airportCode));
          });
        }
      }
    );
    
    // Guardar referencia para poder desuscribirse después
    this.activeListeners.set(airportCode, unsubscribe);
    
    return unsubscribe;
  }

  /**
   * Obtener datos de vuelos una sola vez (sin suscripción)
   * @param {string} airport - Código del aeropuerto
   * @returns {Promise<Object>} - Datos de vuelos
   */
  async getFlightData(airport) {
    const airportCode = airport.toUpperCase();
    
    try {
      console.log(`📡 Obteniendo datos estáticos para ${airportCode}`);
      
      const docRef = doc(this.db, 'flightData', airportCode);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const processedData = this.processFlightData(data, airportCode);
        
        console.log(`✅ Datos obtenidos para ${airportCode}`);
        return processedData;
      } else {
        console.warn(`⚠️ No existen datos para ${airportCode}`);
        return this.getEmptyFlightData(airportCode);
      }
    } catch (error) {
      console.error(`❌ Error obteniendo datos para ${airportCode}:`, error);
      throw error;
    }
  }

  /**
   * Procesar y validar los datos de vuelos recibidos de Firebase
   * @param {Object} rawData - Datos crudos de Firebase
   * @param {string} airportCode - Código del aeropuerto
   * @returns {Object} - Datos procesados y validados
   */
  processFlightData(rawData, airportCode) {
    const now = Date.now();
    const lastUpdate = rawData.serverTimestamp?.toDate() || new Date(rawData.lastUpdate);
    const ageInMinutes = (now - lastUpdate.getTime()) / (1000 * 60);
    
    // Determinar si los datos están "frescos" (actualización cada 20 minutos)
    const isStale = ageInMinutes > 25; // Considerar obsoletos después de 25 minutos
    const isVeryStale = ageInMinutes > 60; // Muy obsoletos después de 1 hora
    
    return {
      airport: {
        code: airportCode,
        name: rawData.airport?.name || `Aeropuerto ${airportCode}`,
      },
      departures: this.processFlights(rawData.departures || [], 'departure'),
      arrivals: this.processFlights(rawData.arrivals || [], 'arrival'),
      lastUpdate: lastUpdate.toISOString(),
      lastUpdateFormatted: this.formatLastUpdate(lastUpdate),
      source: rawData.source || 'unknown',
      totalFlights: rawData.totalFlights || 0,
      dataQuality: {
        isStale: isStale,
        isVeryStale: isVeryStale,
        ageInMinutes: Math.round(ageInMinutes),
        status: isVeryStale ? 'error' : isStale ? 'warning' : 'ok'
      },
      error: rawData.error || null
    };
  }

  /**
   * Procesar lista de vuelos individual
   * @param {Array} flights - Lista de vuelos
   * @param {string} type - Tipo de vuelo (departure/arrival)
   * @returns {Array} - Vuelos procesados
   */
  processFlights(flights, type) {
    if (!Array.isArray(flights)) return [];
    
    return flights.map((flight, index) => ({
      id: `${type}_${index}`,
      flightNumber: flight.flightNumber || 'N/A',
      airline: flight.airline || 'Aerolínea desconocida',
      destination: flight.destination || 'Destino desconocido',
      origin: flight.origin || 'Origen desconocido',
      scheduledTime: flight.scheduledTime || null,
      estimatedTime: flight.estimatedTime || null,
      scheduledTimeFormatted: this.formatFlightTime(flight.scheduledTime),
      estimatedTimeFormatted: this.formatFlightTime(flight.estimatedTime),
      status: flight.status || 'Desconocido',
      terminal: flight.terminal || null,
      gate: flight.gate || null,
      aircraft: flight.aircraft || null,
      // Información adicional para mostrar en pantalla
      displayInfo: this.getFlightDisplayInfo(flight, type)
    })).slice(0, 20); // Limitar a 20 vuelos máximo
  }

  /**
   * Obtener información formateada para mostrar en pantalla
   * @param {Object} flight - Datos del vuelo
   * @param {string} type - Tipo de vuelo
   * @returns {Object} - Información de display
   */
  getFlightDisplayInfo(flight, type) {
    const now = new Date();
    const scheduledTime = flight.scheduledTime ? new Date(flight.scheduledTime) : null;
    const estimatedTime = flight.estimatedTime ? new Date(flight.estimatedTime) : null;
    
    let primaryTime = scheduledTime;
    let secondaryTime = estimatedTime;
    let timeStatus = 'scheduled';
    
    if (estimatedTime) {
      primaryTime = estimatedTime;
      timeStatus = 'estimated';
    }
    
    // Determinar color del estado basado en tiempo y status
    let statusColor = 'gray';
    if (flight.status?.toLowerCase().includes('cancelado')) statusColor = 'red';
    else if (flight.status?.toLowerCase().includes('retrasado')) statusColor = 'orange';
    else if (flight.status?.toLowerCase().includes('vuelo') || flight.status?.toLowerCase().includes('despeg')) statusColor = 'green';
    else if (flight.status?.toLowerCase().includes('aterrizó') || flight.status?.toLowerCase().includes('llegó')) statusColor = 'blue';
    
    return {
      primaryTime: primaryTime ? this.formatFlightTime(primaryTime.toISOString()) : '--:--',
      secondaryTime: secondaryTime && secondaryTime !== primaryTime ? this.formatFlightTime(secondaryTime.toISOString()) : null,
      timeStatus: timeStatus,
      statusColor: statusColor,
      isDelayed: estimatedTime && scheduledTime && estimatedTime > scheduledTime,
      minutesDelay: estimatedTime && scheduledTime ? Math.round((estimatedTime - scheduledTime) / (1000 * 60)) : 0,
      relativeTime: primaryTime ? this.getRelativeTime(primaryTime, now) : null
    };
  }

  /**
   * Formatear hora de vuelo
   * @param {string} timeString - Hora en formato ISO
   * @returns {string} - Hora formateada (HH:MM)
   */
  formatFlightTime(timeString) {
    if (!timeString) return '--:--';
    
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('es-MX', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } catch (error) {
      return '--:--';
    }
  }

  /**
   * Formatear última actualización
   * @param {Date} date - Fecha de última actualización
   * @returns {string} - Texto formateado
   */
  formatLastUpdate(date) {
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);
    
    if (diffInMinutes < 1) return 'Hace un momento';
    if (diffInMinutes < 60) return `Hace ${Math.floor(diffInMinutes)} minutos`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} horas`;
    return date.toLocaleDateString('es-MX');
  }

  /**
   * Obtener tiempo relativo (ej: "En 2 horas", "Hace 30 minutos")
   * @param {Date} flightTime - Hora del vuelo
   * @param {Date} now - Hora actual
   * @returns {string} - Tiempo relativo
   */
  getRelativeTime(flightTime, now) {
    const diffInMinutes = (flightTime - now) / (1000 * 60);
    
    if (Math.abs(diffInMinutes) < 5) return 'Ahora';
    if (diffInMinutes > 0) {
      if (diffInMinutes < 60) return `En ${Math.floor(diffInMinutes)} min`;
      return `En ${Math.floor(diffInMinutes / 60)}h ${Math.floor(diffInMinutes % 60)}min`;
    } else {
      const absDiff = Math.abs(diffInMinutes);
      if (absDiff < 60) return `Hace ${Math.floor(absDiff)} min`;
      return `Hace ${Math.floor(absDiff / 60)}h ${Math.floor(absDiff % 60)}min`;
    }
  }

  /**
   * Obtener datos vacíos cuando no hay información disponible
   * @param {string} airportCode - Código del aeropuerto
   * @returns {Object} - Estructura de datos vacía
   */
  getEmptyFlightData(airportCode) {
    return {
      airport: {
        code: airportCode,
        name: `Aeropuerto ${airportCode}`,
      },
      departures: [],
      arrivals: [],
      lastUpdate: new Date().toISOString(),
      lastUpdateFormatted: 'Sin datos',
      source: 'none',
      totalFlights: 0,
      dataQuality: {
        isStale: true,
        isVeryStale: true,
        ageInMinutes: 0,
        status: 'error'
      },
      error: 'No hay datos de vuelos disponibles'
    };
  }

  /**
   * Desuscribirse de todas las suscripciones activas
   */
  unsubscribeAll() {
    console.log(`🔄 Desuscribiendo ${this.activeListeners.size} listeners activos`);
    
    this.activeListeners.forEach((unsubscribe, airport) => {
      try {
        unsubscribe();
        console.log(`✅ Desuscrito de ${airport}`);
      } catch (error) {
        console.error(`❌ Error desuscribiendo de ${airport}:`, error);
      }
    });
    
    this.activeListeners.clear();
  }

  /**
   * Desuscribirse de un aeropuerto específico
   * @param {string} airport - Código del aeropuerto
   */
  unsubscribeFromAirport(airport) {
    const airportCode = airport.toUpperCase();
    const unsubscribe = this.activeListeners.get(airportCode);
    
    if (unsubscribe) {
      try {
        unsubscribe();
        this.activeListeners.delete(airportCode);
        console.log(`✅ Desuscrito de ${airportCode}`);
      } catch (error) {
        console.error(`❌ Error desuscribiendo de ${airportCode}:`, error);
      }
    }
  }

  /**
   * Verificar el estado de conectividad con Firebase
   * @returns {Promise<boolean>} - true si hay conexión
   */
  async checkConnectivity() {
    try {
      // Intentar leer un documento pequeño para verificar conectividad
      const testDoc = await getDoc(doc(this.db, 'flightData', 'MEX'));
      return true;
    } catch (error) {
      console.error('❌ Sin conectividad con Firebase:', error);
      return false;
    }
  }

  /**
   * Obtener datos de distancia de hotel para un companyId específico
   * Integra con el nuevo sistema optimizado de Distance Matrix
   * @param {string} companyId - ID de la compañía/hotel
   * @returns {Promise<Object>} - Datos de distancia del hotel
   */
  async getHotelDistanceData(companyId) {
    try {
      console.log(`🏨 Obteniendo datos de distancia para hotel: ${companyId}`);

      // Primero intentar obtener desde Firebase
      const configDocRef = doc(this.db, 'hotelDistanceConfig', companyId);
      const configSnap = await getDoc(configDocRef);

      if (configSnap.exists()) {
        const configData = configSnap.data();

        console.log(`✅ Datos de distancia encontrados en Firebase para ${companyId}`);

        return {
          success: true,
          source: 'firebase',
          hotelLocation: configData.hotelLocation || {},
          activeAirports: configData.activeAirports || [],
          distanceData: configData.distanceData || {},
          lastUpdate: configData.lastDistanceUpdate?.toDate?.()?.toISOString() || null,
          calculationStats: configData.calculationStats || {},
          needsRecalculation: configData.needsDistanceRecalculation || false
        };
      }

      // Si no hay datos en Firebase, intentar desde Cloud Function
      console.log(`📡 No hay datos en Firebase, consultando Cloud Function...`);

      try {
        const response = await fetch(`https://gethoteldistancedata-wsvcv36oca-uc.a.run.app?companyId=${companyId}`);

        if (response.ok) {
          const cloudData = await response.json();
          console.log(`✅ Datos obtenidos desde Cloud Function para ${companyId}`);

          return {
            success: true,
            source: 'cloud_function',
            ...cloudData
          };
        } else {
          console.warn(`⚠️ Cloud Function respondió con error: ${response.status}`);
        }
      } catch (cloudError) {
        console.error('❌ Error consultando Cloud Function:', cloudError);
      }

      // Fallback: Datos por defecto con ubicación Sheraton María Isabel
      console.log(`📍 Usando datos por defecto para ${companyId}`);

      return {
        success: true,
        source: 'default',
        hotelLocation: {
          address: "Sheraton María Isabel Hotel, Avenida Paseo de la Reforma, Colonia Cuauhtémoc, Mexico City, CDMX, Mexico",
          lat: 19.427940,
          lng: -99.167127,
          lastUpdated: new Date().toISOString()
        },
        activeAirports: ['MEX', 'GDL', 'CUN'],
        distanceData: {},
        lastUpdate: null,
        calculationStats: {},
        needsRecalculation: true,
        message: 'Datos por defecto - configurar ubicación del hotel'
      };

    } catch (error) {
      console.error(`❌ Error obteniendo datos de distancia para ${companyId}:`, error);

      return {
        success: false,
        source: 'error',
        error: error.message,
        hotelLocation: {},
        activeAirports: [],
        distanceData: {},
        lastUpdate: null
      };
    }
  }

  /**
   * Combinar datos de vuelos con datos de distancia del hotel
   * @param {Object} flightData - Datos de vuelos obtenidos
   * @param {string} companyId - ID de la compañía/hotel
   * @returns {Promise<Object>} - Datos combinados
   */
  async getFlightDataWithDistances(airport, companyId) {
    try {
      console.log(`🔄 Obteniendo datos combinados para ${airport} (hotel: ${companyId})`);

      // Obtener datos de vuelos
      const flightData = await this.getFlightData(airport);

      // Obtener datos de distancia del hotel
      const distanceData = await this.getHotelDistanceData(companyId);

      // Combinar los datos
      const combinedData = {
        ...flightData,
        hotelDistance: {
          configured: distanceData.success && distanceData.hotelLocation.lat,
          hotelLocation: distanceData.hotelLocation,
          distanceToAirport: distanceData.distanceData[airport] || null,
          lastDistanceUpdate: distanceData.lastUpdate,
          distanceSource: distanceData.source
        }
      };

      console.log(`✅ Datos combinados preparados para ${airport} (hotel: ${companyId})`);

      return combinedData;

    } catch (error) {
      console.error(`❌ Error combinando datos para ${airport}:`, error);

      // Fallback: solo datos de vuelos sin distancia
      const flightData = await this.getFlightData(airport);

      return {
        ...flightData,
        hotelDistance: {
          configured: false,
          error: error.message,
          hotelLocation: {},
          distanceToAirport: null,
          lastDistanceUpdate: null,
          distanceSource: 'error'
        }
      };
    }
  }
}

// Exportar instancia singleton
export default new FlightFirebaseService();