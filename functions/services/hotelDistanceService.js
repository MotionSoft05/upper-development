/**
 * Hotel Distance Service - Optimized Distance Matrix
 *
 * Sistema inteligente para calcular distancias hotel-aeropuerto que:
 * - Solo calcula aeropuertos que cada hotel realmente usa
 * - Se actualiza cada 20 minutos (sincronizado con vuelos)
 * - Escala eficientemente con 15-20 hoteles iniciales
 * - Costo mínimo: ~$0.50 USD/mes vs ~$50 naive
 */

require("dotenv").config();
const admin = require("firebase-admin");
const distanceService = require("./distanceService");

// Inicializar Firebase Admin si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

// Referencia a Firestore
const db = admin.firestore();

/**
 * Detectar qué aeropuertos usa realmente un hotel
 * Escanea todas las pantallas configuradas del hotel
 * @param {string} companyId - ID de la compañía/hotel
 * @return {Promise<Array>} Lista única de aeropuertos activos
 */
async function detectActiveAirports(companyId) {
  try {
    console.log(`🔍 Detectando aeropuertos activos para hotel: ${companyId}`);

    // Obtener todas las pantallas de vuelos configuradas para este hotel
    const screensQuery = await db
      .collection("flightScreens")
      .where("companyId", "==", companyId)
      .where("isActive", "==", true)
      .get();

    const activeAirports = new Set();

    // Escanear cada pantalla y extraer aeropuertos seleccionados
    screensQuery.docs.forEach((doc) => {
      const screenData = doc.data();

      // Extraer aeropuertos de la configuración
      if (screenData.selectedAirport) {
        activeAirports.add(screenData.selectedAirport);
      }

      // Si hay múltiples aeropuertos configurados
      if (screenData.airports && Array.isArray(screenData.airports)) {
        screenData.airports.forEach(airport => {
          if (airport && typeof airport === 'string') {
            activeAirports.add(airport);
          }
        });
      }

      // Si hay configuraciones específicas de aeropuertos
      if (screenData.flightConfig && screenData.flightConfig.airports) {
        screenData.flightConfig.airports.forEach(airport => {
          if (airport && typeof airport === 'string') {
            activeAirports.add(airport);
          }
        });
      }
    });

    const activeAirportsList = Array.from(activeAirports);
    console.log(`✅ Aeropuertos detectados para ${companyId}:`, activeAirportsList);

    return activeAirportsList;
  } catch (error) {
    console.error(`❌ Error detectando aeropuertos para ${companyId}:`, error);
    // Fallback: devolver todos los aeropuertos disponibles
    return ["MEX", "GDL", "CUN"];
  }
}

/**
 * Actualizar configuración de distancias para un hotel
 * @param {string} companyId - ID de la compañía/hotel
 * @param {Object} hotelLocation - {address, lat, lng}
 * @param {Array} activeAirports - Lista de aeropuertos activos
 * @return {Promise<Object>} Resultado de la actualización
 */
async function updateHotelDistanceConfig(companyId, hotelLocation, activeAirports) {
  try {
    const docRef = db.collection("hotelDistanceConfig").doc(companyId);

    // Obtener configuración anterior para comparar
    const previousDoc = await docRef.get();
    const previousData = previousDoc.exists ? previousDoc.data() : {};
    const previousAirports = previousData.activeAirports || [];

    // Verificar si hay cambios
    const airportsChanged = JSON.stringify(activeAirports.sort()) !==
                           JSON.stringify(previousAirports.sort());

    const locationChanged = !previousData.hotelLocation ||
                           previousData.hotelLocation.lat !== hotelLocation.lat ||
                           previousData.hotelLocation.lng !== hotelLocation.lng;

    if (!airportsChanged && !locationChanged) {
      console.log(`✓ No hay cambios en configuración para ${companyId}`);
      return { updated: false, reason: 'no_changes' };
    }

    // Preparar datos para actualizar
    const configUpdate = {
      hotelLocation: {
        address: hotelLocation.address,
        lat: hotelLocation.lat,
        lng: hotelLocation.lng,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      },
      activeAirports: activeAirports,
      lastConfigUpdate: admin.firestore.FieldValue.serverTimestamp(),
      needsDistanceRecalculation: true,
    };

    // Limpiar datos de aeropuertos que ya no se usan
    if (previousData.distanceData) {
      const cleanedDistanceData = {};
      activeAirports.forEach(airport => {
        if (previousData.distanceData[airport]) {
          cleanedDistanceData[airport] = previousData.distanceData[airport];
        }
      });
      configUpdate.distanceData = cleanedDistanceData;
    }

    await docRef.set(configUpdate, { merge: true });

    // Actualizar índice de uso de aeropuertos
    await updateAirportUsageIndex(companyId, activeAirports, previousAirports);

    console.log(`✅ Configuración actualizada para ${companyId}:`,
               `${activeAirports.length} aeropuertos activos`);

    return {
      updated: true,
      activeAirports,
      airportsChanged,
      locationChanged,
    };
  } catch (error) {
    console.error(`❌ Error actualizando configuración ${companyId}:`, error);
    throw error;
  }
}

/**
 * Actualizar índice global de uso de aeropuertos
 * @param {string} companyId - ID de la compañía
 * @param {Array} newAirports - Nuevos aeropuertos activos
 * @param {Array} previousAirports - Aeropuertos anteriores
 */
async function updateAirportUsageIndex(companyId, newAirports, previousAirports) {
  try {
    const batch = db.batch();

    // Remover hotel de aeropuertos que ya no usa
    const removedAirports = previousAirports.filter(airport =>
      !newAirports.includes(airport)
    );

    for (const airport of removedAirports) {
      const airportRef = db.collection("airportUsageIndex").doc(airport);
      const airportDoc = await airportRef.get();

      if (airportDoc.exists) {
        const data = airportDoc.data();
        const updatedHotels = (data.hotelsUsingThisAirport || [])
          .filter(id => id !== companyId);

        batch.update(airportRef, {
          hotelsUsingThisAirport: updatedHotels,
          totalHotels: updatedHotels.length,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    // Agregar hotel a aeropuertos nuevos
    const addedAirports = newAirports.filter(airport =>
      !previousAirports.includes(airport)
    );

    for (const airport of addedAirports) {
      const airportRef = db.collection("airportUsageIndex").doc(airport);
      const airportDoc = await airportRef.get();

      if (airportDoc.exists) {
        const data = airportDoc.data();
        const currentHotels = data.hotelsUsingThisAirport || [];

        if (!currentHotels.includes(companyId)) {
          currentHotels.push(companyId);
        }

        batch.update(airportRef, {
          hotelsUsingThisAirport: currentHotels,
          totalHotels: currentHotels.length,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        batch.set(airportRef, {
          hotelsUsingThisAirport: [companyId],
          totalHotels: 1,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    await batch.commit();
    console.log(`✅ Índice de aeropuertos actualizado para ${companyId}`);
  } catch (error) {
    console.error("❌ Error actualizando índice de aeropuertos:", error);
  }
}

/**
 * Calcular distancias para un hotel específico
 * Solo calcula los aeropuertos que el hotel realmente usa
 * @param {string} companyId - ID de la compañía/hotel
 * @return {Promise<Object>} Resultado del cálculo
 */
async function calculateHotelDistances(companyId) {
  try {
    console.log(`🗺️ Calculando distancias para hotel: ${companyId}`);

    // Obtener configuración del hotel
    const configDoc = await db.collection("hotelDistanceConfig").doc(companyId).get();

    if (!configDoc.exists) {
      throw new Error(`No se encontró configuración para hotel ${companyId}`);
    }

    const config = configDoc.data();
    const { hotelLocation, activeAirports } = config;

    if (!hotelLocation || !activeAirports || activeAirports.length === 0) {
      throw new Error(`Configuración incompleta para hotel ${companyId}`);
    }

    console.log(`📍 Calculando ${activeAirports.length} rutas desde:`,
               `${hotelLocation.address} (${hotelLocation.lat}, ${hotelLocation.lng})`);

    // Calcular distancias solo para aeropuertos activos
    const distancePromises = activeAirports.map(async (airport) => {
      const result = await distanceService.calculateTravelTime(
        hotelLocation,
        airport,
        {
          trafficModel: 'best_guess',
          departureTime: Math.floor(Date.now() / 1000),
        }
      );

      return { airport, result };
    });

    const distanceResults = await Promise.all(distancePromises);

    // Procesar resultados
    const distanceData = {};
    let successfulCalculations = 0;

    distanceResults.forEach(({ airport, result }) => {
      if (result.success) {
        distanceData[airport] = {
          distance: result.data.distance,
          duration: result.data.duration,
          durationInTraffic: result.data.durationInTraffic,
          recommendations: result.data.recommendations,
          trafficConditions: result.data.trafficConditions,
          lastCalculated: admin.firestore.FieldValue.serverTimestamp(),
        };
        successfulCalculations++;
        console.log(`  ✅ ${airport}: ${result.data.distance.km}km, ${result.data.duration.minutes}min`);
      } else {
        console.error(`  ❌ ${airport}: ${result.error}`);
        // Mantener datos anteriores si existen
        if (config.distanceData && config.distanceData[airport]) {
          distanceData[airport] = config.distanceData[airport];
        }
      }
    });

    // Actualizar base de datos
    await db.collection("hotelDistanceConfig").doc(companyId).update({
      distanceData: distanceData,
      lastDistanceUpdate: admin.firestore.FieldValue.serverTimestamp(),
      needsDistanceRecalculation: false,
      calculationStats: {
        totalAirports: activeAirports.length,
        successful: successfulCalculations,
        failed: activeAirports.length - successfulCalculations,
        lastCalculationAt: admin.firestore.FieldValue.serverTimestamp(),
      }
    });

    console.log(`✅ Distancias calculadas para ${companyId}: ` +
               `${successfulCalculations}/${activeAirports.length} exitosas`);

    return {
      success: true,
      companyId,
      calculatedAirports: activeAirports.length,
      successfulCalculations,
      distanceData,
    };
  } catch (error) {
    console.error(`❌ Error calculando distancias para ${companyId}:`, error);
    return {
      success: false,
      companyId,
      error: error.message,
    };
  }
}

/**
 * Obtener lista de hoteles que necesitan recálculo de distancias
 * @return {Promise<Array>} Lista de companyIds que necesitan actualización
 */
async function getHotelsNeedingDistanceUpdate() {
  try {
    // Obtener hoteles que necesitan recálculo
    const hotelsQuery = await db
      .collection("hotelDistanceConfig")
      .where("needsDistanceRecalculation", "==", true)
      .limit(50) // Procesar máximo 50 hoteles por lote
      .get();

    const hotelIds = hotelsQuery.docs.map(doc => doc.id);

    console.log(`🏨 Encontrados ${hotelIds.length} hoteles que necesitan actualización`);

    return hotelIds;
  } catch (error) {
    console.error("❌ Error obteniendo hoteles para actualización:", error);
    return [];
  }
}

/**
 * Proceso principal para actualizar distancias de todos los hoteles activos
 * Se ejecuta cada 20 minutos junto con la actualización de vuelos
 * @return {Promise<Object>} Resumen de la ejecución
 */
async function updateAllHotelDistances() {
  try {
    console.log("🏨 Iniciando actualización masiva de distancias de hoteles...");

    const startTime = Date.now();
    const hotelIds = await getHotelsNeedingDistanceUpdate();

    if (hotelIds.length === 0) {
      console.log("✓ No hay hoteles que requieran actualización de distancias");
      return {
        success: true,
        processed: 0,
        message: "No hotels needed distance updates"
      };
    }

    // Procesar hoteles en lotes para evitar timeout
    const batchSize = 5;
    const results = [];

    for (let i = 0; i < hotelIds.length; i += batchSize) {
      const batch = hotelIds.slice(i, i + batchSize);
      console.log(`📦 Procesando lote ${Math.floor(i/batchSize) + 1}: ${batch.length} hoteles`);

      const batchPromises = batch.map(companyId => calculateHotelDistances(companyId));
      const batchResults = await Promise.all(batchPromises);

      results.push(...batchResults);

      // Pausa pequeña entre lotes para evitar rate limits
      if (i + batchSize < hotelIds.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const duration = Date.now() - startTime;

    console.log(`🏁 Actualización de distancias completada en ${duration}ms:`);
    console.log(`   ✅ Exitosos: ${successful}/${hotelIds.length}`);
    console.log(`   ❌ Fallidos: ${failed}/${hotelIds.length}`);

    return {
      success: true,
      processed: hotelIds.length,
      successful,
      failed,
      duration,
      results,
    };
  } catch (error) {
    console.error("❌ Error en actualización masiva de distancias:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Obtener datos de distancia para un hotel específico
 * @param {string} companyId - ID de la compañía/hotel
 * @return {Promise<Object>} Datos de distancia del hotel
 */
async function getHotelDistanceData(companyId) {
  try {
    const configDoc = await db.collection("hotelDistanceConfig").doc(companyId).get();

    if (!configDoc.exists) {
      return {
        success: false,
        error: "Hotel not configured for distance calculations"
      };
    }

    const config = configDoc.data();

    return {
      success: true,
      hotelLocation: config.hotelLocation,
      activeAirports: config.activeAirports || [],
      distanceData: config.distanceData || {},
      lastUpdate: config.lastDistanceUpdate,
      calculationStats: config.calculationStats,
    };
  } catch (error) {
    console.error(`❌ Error obteniendo datos de distancia para ${companyId}:`, error);
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = {
  detectActiveAirports,
  updateHotelDistanceConfig,
  calculateHotelDistances,
  updateAllHotelDistances,
  getHotelDistanceData,
  getHotelsNeedingDistanceUpdate,
};