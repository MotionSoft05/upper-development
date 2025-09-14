/**
 * Firebase Trigger: onPantallaConfigChange
 *
 * Se ejecuta automáticamente cuando cambia la configuración de pantallas de vuelos
 * Detecta cambios en aeropuertos seleccionados y actualiza la configuración de distancias
 */

const admin = require("firebase-admin");
const hotelDistanceService = require("../services/hotelDistanceService");

// Referencia a Firestore
const db = admin.firestore();

/**
 * Trigger que se ejecuta al escribir en flightScreens
 * @param {Object} change - Datos del cambio
 * @param {Object} context - Contexto del evento
 */
async function onFlightScreenConfigChange(change, context) {
  try {
    const { companyId } = context.params;

    // Ignorar eliminaciones
    if (!change.after.exists) {
      console.log(`🗑️ Pantalla eliminada para ${companyId}, no hay acción requerida`);
      return null;
    }

    const newData = change.after.data();
    const previousData = change.before.exists ? change.before.data() : {};

    console.log(`🔄 Detectado cambio en configuración de pantallas para: ${companyId}`);

    // Verificar si es un cambio relevante para distancias
    const relevantChange = isRelevantChangeForDistances(newData, previousData);

    if (!relevantChange) {
      console.log(`✓ Cambio no relevante para cálculo de distancias`);
      return null;
    }

    console.log(`📍 Cambio relevante detectado, procesando actualización...`);

    // Detectar aeropuertos activos para este hotel
    const activeAirports = await hotelDistanceService.detectActiveAirports(companyId);

    // Obtener ubicación del hotel desde la configuración
    const hotelLocation = await getHotelLocationFromConfig(companyId, newData);

    if (!hotelLocation) {
      console.log(`⚠️ No se encontró ubicación del hotel para ${companyId}`);
      // Usar ubicación por defecto (Sheraton María Isabel) para testing
      const defaultLocation = {
        address: "Sheraton María Isabel Hotel, Avenida Paseo de la Reforma, Colonia Cuauhtémoc, Mexico City, CDMX, Mexico",
        lat: 19.427940,
        lng: -99.167127,
      };

      console.log(`📍 Usando ubicación por defecto para ${companyId}: ${defaultLocation.address}`);
      await hotelDistanceService.updateHotelDistanceConfig(
        companyId,
        defaultLocation,
        activeAirports
      );
    } else {
      // Actualizar configuración con ubicación real
      await hotelDistanceService.updateHotelDistanceConfig(
        companyId,
        hotelLocation,
        activeAirports
      );
    }

    console.log(`✅ Configuración actualizada para ${companyId} con ${activeAirports.length} aeropuertos`);

    return null;
  } catch (error) {
    console.error("❌ Error en trigger de configuración de pantallas:", error);
    return null;
  }
}

/**
 * Verificar si el cambio es relevante para cálculo de distancias
 * @param {Object} newData - Nuevos datos
 * @param {Object} previousData - Datos anteriores
 * @return {boolean} Si el cambio es relevante
 */
function isRelevantChangeForDistances(newData, previousData) {
  // Campos relevantes que afectan distancias
  const relevantFields = [
    'selectedAirport',
    'airports',
    'flightConfig.airports',
    'isActive',
    'hotelLocation',
  ];

  for (const field of relevantFields) {
    const newValue = getNestedValue(newData, field);
    const previousValue = getNestedValue(previousData, field);

    if (JSON.stringify(newValue) !== JSON.stringify(previousValue)) {
      console.log(`📋 Cambio detectado en campo: ${field}`);
      console.log(`   Anterior: ${JSON.stringify(previousValue)}`);
      console.log(`   Nuevo: ${JSON.stringify(newValue)}`);
      return true;
    }
  }

  return false;
}

/**
 * Obtener valor anidado de un objeto usando notación de punto
 * @param {Object} obj - Objeto a consultar
 * @param {string} path - Ruta como 'flightConfig.airports'
 * @return {any} Valor encontrado
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Obtener ubicación del hotel desde la configuración
 * @param {string} companyId - ID de la compañía
 * @param {Object} screenData - Datos de la pantalla
 * @return {Promise<Object|null>} Ubicación del hotel
 */
async function getHotelLocationFromConfig(companyId, screenData) {
  try {
    // Buscar ubicación en los datos de la pantalla
    if (screenData.hotelLocation &&
        screenData.hotelLocation.lat &&
        screenData.hotelLocation.lng) {
      return screenData.hotelLocation;
    }

    // Buscar en configuración global de la compañía
    const companyDoc = await db.collection("companies").doc(companyId).get();

    if (companyDoc.exists) {
      const companyData = companyDoc.data();

      if (companyData.hotelLocation &&
          companyData.hotelLocation.lat &&
          companyData.hotelLocation.lng) {
        return companyData.hotelLocation;
      }

      // Buscar en address si está disponible
      if (companyData.address) {
        // En un caso real, aquí podrías geocodificar la dirección
        // Por ahora, devolver null para usar ubicación por defecto
        console.log(`📍 Dirección encontrada para ${companyId}: ${companyData.address}`);
        return null;
      }
    }

    // Buscar en configuración existente de hotelDistanceConfig
    const existingConfigDoc = await db
      .collection("hotelDistanceConfig")
      .doc(companyId)
      .get();

    if (existingConfigDoc.exists) {
      const existingConfig = existingConfigDoc.data();
      if (existingConfig.hotelLocation) {
        return existingConfig.hotelLocation;
      }
    }

    return null;
  } catch (error) {
    console.error(`❌ Error obteniendo ubicación del hotel ${companyId}:`, error);
    return null;
  }
}

/**
 * Trigger para detectar cambios en configuración de compañía
 * @param {Object} change - Datos del cambio
 * @param {Object} context - Contexto del evento
 */
async function onCompanyConfigChange(change, context) {
  try {
    const { companyId } = context.params;

    // Ignorar eliminaciones
    if (!change.after.exists) {
      return null;
    }

    const newData = change.after.data();
    const previousData = change.before.exists ? change.before.data() : {};

    // Verificar si cambió la ubicación del hotel
    const newLocation = newData.hotelLocation;
    const previousLocation = previousData.hotelLocation;

    if (JSON.stringify(newLocation) !== JSON.stringify(previousLocation)) {
      console.log(`📍 Ubicación del hotel actualizada para ${companyId}`);

      if (newLocation && newLocation.lat && newLocation.lng) {
        // Detectar aeropuertos activos
        const activeAirports = await hotelDistanceService.detectActiveAirports(companyId);

        // Actualizar configuración de distancias
        await hotelDistanceService.updateHotelDistanceConfig(
          companyId,
          newLocation,
          activeAirports
        );

        console.log(`✅ Configuración de distancias actualizada para nueva ubicación`);
      }
    }

    return null;
  } catch (error) {
    console.error("❌ Error en trigger de configuración de compañía:", error);
    return null;
  }
}

module.exports = {
  onFlightScreenConfigChange,
  onCompanyConfigChange,
};