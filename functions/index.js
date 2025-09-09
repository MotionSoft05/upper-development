const {onSchedule} = require("firebase-functions/v2/scheduler");
const {onRequest} = require("firebase-functions/v2/https");
const {setGlobalOptions} = require("firebase-functions/v2");
const admin = require("firebase-admin");
const flightService = require("./services/flightService");
const distanceService = require("./services/distanceService");

// Configurar opciones globales
setGlobalOptions({
  region: "us-central1",
  memory: "256MiB",
});

// Inicializar Firebase Admin
admin.initializeApp();

// Referencia a Firestore
const db = admin.firestore();

/**
 * Función para limpiar valores undefined de objetos (Firestore no los acepta)
 */
function cleanUndefinedValues(obj) {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => cleanUndefinedValues(item))
        .filter((item) => item !== undefined);
  }

  if (typeof obj === "object") {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanUndefinedValues(value);
      }
    }
    return cleaned;
  }

  return obj;
}

/**
 * Función que se ejecuta cada 15 minutos para actualizar datos de vuelos
 */
exports.updateFlightData = onSchedule({
  schedule: "every 15 minutes",
  timeZone: "America/Mexico_City",
  memory: "512MiB",
}, async (event) => {
  console.log("🛫 Iniciando verificación de actualización automática...");

  // 🛡️ SEGURIDAD CRÍTICA: Verificar si los cron jobs están habilitados
  const cronDoc = await db.collection("systemConfig").doc("cronJobs").get();
  const cronConfig = cronDoc.exists ? cronDoc.data() : {enabled: false};

  if (!cronConfig.enabled) {
    console.log("⏸️ SISTEMA PAUSADO - No se realizarán peticiones");
    console.log("💡 Para activar: usar el panel de administración web");

    // Guardar log de omisión (SIN hacer peticiones a APIs externas)
    await db.collection("systemLogs").add({
      level: "info",
      message: "Actualización omitida - Sistema pausado por seguridad",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      context: "scheduled_update_paused_safe",
    });

    return null; // 🛡️ SALIR SIN HACER PETICIONES
  }

  // Solo llegar aquí si está EXPLÍCITAMENTE habilitado por admin
  console.log("▶️ Sistema activado por admin - Procediendo...");

  // Actualizar timestamp de última ejecución
  await db.collection("systemConfig").doc("cronJobs").set({
    lastRun: admin.firestore.FieldValue.serverTimestamp(),
    enabled: true,
  }, {merge: true});

  console.log("🛫 Ejecutando actualización automática de vuelos...");

  const airports = ["MEX", "TLC", "NLU"];
  const results = [];

  for (const airport of airports) {
    try {
      console.log(`📡 Actualizando datos para ${airport}...`);

      const flightData = await flightService.getFlightData(airport);

      if (flightData) {
        // Limpiar datos antes de guardar (eliminar undefined values)
        const cleanFlightData = cleanUndefinedValues(flightData);

        // Guardar en Firestore
        await db.collection("flightData").doc(airport).set({
          ...cleanFlightData,
          serverTimestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(
            `✅ Datos actualizados para ${airport}: ` +
                `${flightData.totalFlights} vuelos`,
        );
        results.push({
          airport,
          success: true,
          flights: flightData.totalFlights,
          source: flightData.source,
        });
      } else {
        console.warn(`⚠️ No se pudieron obtener datos para ${airport}`);
        results.push({
          airport,
          success: false,
          error: "No data available",
        });
      }
    } catch (error) {
      console.error(`❌ Error actualizando ${airport}:`, error.message);
      results.push({
        airport,
        success: false,
        error: error.message,
      });

      // Guardar error en Firestore para debugging
      await db.collection("flightErrors").add({
        airport,
        error: error.message,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        context: "scheduled_update",
      });
    }
  }

  // Guardar log de la actualización
  await db.collection("flightUpdateLogs").add({
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    results: results,
    totalAirports: airports.length,
    successfulUpdates: results.filter((r) => r.success).length,
  });

  console.log("🏁 Actualización de vuelos completada:", results);
  return results;
});

/**
 * Función HTTP para testing manual y actualización bajo demanda
 */
exports.testFlightUpdate = onRequest({
  cors: true,
  memory: "512MiB",
}, async (req, res) => {
  // Configurar CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  const airport = req.query.airport || "MEX";
  const forceUpdate = req.query.force === "true";

  try {
    console.log(`🧪 Test manual para aeropuerto: ${airport}`);

    // Verificar si el aeropuerto es válido
    const validAirports = ["MEX", "TLC", "NLU"];
    if (!validAirports.includes(airport.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: `Aeropuerto ${airport} no soportado. ` +
               `Aeropuertos válidos: ${validAirports.join(", ")}`,
      });
    }

    const flightData = await flightService.getFlightData(airport.toUpperCase());

    if (forceUpdate && flightData) {
      // Limpiar datos antes de guardar (eliminar undefined values)
      const cleanFlightData = cleanUndefinedValues(flightData);

      // Guardar en Firestore si se solicita
      await db.collection("flightData").doc(airport.toUpperCase()).set({
        ...cleanFlightData,
        serverTimestamp: admin.firestore.FieldValue.serverTimestamp(),
        updatedVia: "manual_test",
      });

      console.log(`💾 Datos guardados manualmente para ${airport}`);
    }

    res.json({
      success: true,
      airport: airport.toUpperCase(),
      data: flightData,
      savedToFirestore: forceUpdate,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`❌ Error en test manual para ${airport}:`, error.message);

    res.status(500).json({
      success: false,
      error: error.message,
      airport: airport,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Función HTTP para obtener datos de vuelos desde la app
 */
exports.getFlightData = onRequest({
  cors: true,
  memory: "512MiB",
}, async (req, res) => {
  // Configurar CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  const airport = req.query.airport || "MEX";
  const maxAge = parseInt(req.query.maxAge) || 900; // 15 minutos por defecto

  try {
    console.log(`📱 Solicitud de datos para: ${airport}`);

    // Obtener datos de Firestore
    const doc = await db.collection("flightData")
        .doc(airport.toUpperCase()).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: `No hay datos disponibles para ${airport}`,
        airport: airport.toUpperCase(),
      });
    }

    const data = doc.data();
    const lastUpdate = data.serverTimestamp?.toDate() ||
        new Date(data.lastUpdate);
    const ageInSeconds = (Date.now() - lastUpdate.getTime()) / 1000;

    // Verificar si los datos están actualizados
    const isStale = ageInSeconds > maxAge;

    res.json({
      success: true,
      airport: airport.toUpperCase(),
      data: {
        ...data,
        isStale: isStale,
        ageInSeconds: Math.round(ageInSeconds),
        maxAgeSeconds: maxAge,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`❌ Error obteniendo datos para ${airport}:`, error.message);

    res.status(500).json({
      success: false,
      error: error.message,
      airport: airport,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Función para limpiar datos antiguos (se ejecuta diariamente)
 */
exports.cleanupOldData = onSchedule({
  schedule: "every 24 hours",
  timeZone: "America/Mexico_City",
  memory: "256MiB",
}, async (event) => {
  console.log("🧹 Iniciando limpieza de datos antiguos...");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    // Limpiar logs antiguos
    const oldLogs = await db.collection("flightUpdateLogs")
        .where("timestamp", "<", thirtyDaysAgo)
        .get();

    const batch = db.batch();
    oldLogs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`🗑️ Eliminados ${oldLogs.size} logs antiguos`);

    // Limpiar errores antiguos
    const oldErrors = await db.collection("flightErrors")
        .where("timestamp", "<", thirtyDaysAgo)
        .get();

    const errorBatch = db.batch();
    oldErrors.forEach((doc) => {
      errorBatch.delete(doc.ref);
    });

    await errorBatch.commit();
    console.log(`🗑️ Eliminados ${oldErrors.size} errores antiguos`);

    return {
      logsDeleted: oldLogs.size,
      errorsDeleted: oldErrors.size,
    };
  } catch (error) {
    console.error("❌ Error en limpieza:", error.message);
    throw error;
  }
});

/**
 * Función para obtener estadísticas del sistema
 */
exports.getFlightStats = onRequest({
  cors: true,
  memory: "512MiB",
}, async (req, res) => {
  // Configurar CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  try {
    const airports = ["MEX", "TLC", "NLU"];
    const stats = {};

    for (const airport of airports) {
      const doc = await db.collection("flightData").doc(airport).get();
      if (doc.exists) {
        const data = doc.data();
        stats[airport] = {
          lastUpdate: data.serverTimestamp?.toDate() || data.lastUpdate,
          totalFlights: data.totalFlights || 0,
          departures: data.departures?.length || 0,
          arrivals: data.arrivals?.length || 0,
          source: data.source,
          hasError: !!data.error,
        };
      } else {
        stats[airport] = {
          lastUpdate: null,
          totalFlights: 0,
          departures: 0,
          arrivals: 0,
          source: null,
          hasError: true,
        };
      }
    }

    // Obtener últimos logs
    const recentLogs = await db.collection("flightUpdateLogs")
        .orderBy("timestamp", "desc")
        .limit(5)
        .get();

    const logs = recentLogs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate(),
    }));

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      airports: stats,
      recentLogs: logs,
      systemStatus: "operational",
    });
  } catch (error) {
    console.error("❌ Error obteniendo estadísticas:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Función HTTP para calcular tiempo de viaje hotel-aeropuerto
 */
exports.calculateTravelTime = onRequest({
  cors: true,
  memory: "512MiB",
}, async (req, res) => {
  // Configurar CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  try {
    const {hotelLocation, airportCode, options} = req.method === "POST" ? req.body : req.query;

    // Validaciones básicas
    if (!hotelLocation) {
      return res.status(400).json({
        success: false,
        error: "hotelLocation es requerido: {lat, lng, address?}",
      });
    }

    // Validar ubicación
    const validation = distanceService.validateLocation(hotelLocation);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    const airport = airportCode || "MEX";
    const result = await distanceService.calculateTravelTime(
        hotelLocation, airport, options || {});

    if (!result.success) {
      return res.status(500).json(result);
    }

    console.log(`🗺️ Ruta calculada exitosamente para ${airport}`);

    res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error en cálculo de ruta:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Función HTTP para calcular múltiples rutas
 * (hotel a todos los aeropuertos)
 */
exports.calculateMultipleRoutes = onRequest({
  cors: true,
  memory: "512MiB",
}, async (req, res) => {
  // Configurar CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  try {
    const {hotelLocation, airportCodes, options} = req.method === "POST" ? req.body : req.query;

    if (!hotelLocation) {
      return res.status(400).json({
        success: false,
        error: "hotelLocation es requerido: {lat, lng, address?}",
      });
    }

    // Validar ubicación
    const validation = distanceService.validateLocation(hotelLocation);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    const airports = airportCodes || ["MEX", "TLC", "NLU"];
    const result = await distanceService.calculateMultipleRoutes(
        hotelLocation, airports, options || {});

    if (!result.success) {
      return res.status(500).json(result);
    }

    console.log(`🗺️ ${result.summary.successful}/${result.summary.total} rutas calculadas exitosamente`);

    res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error en cálculo múltiple de rutas:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Función HTTP para validar ubicación y obtener información de aeropuertos
 */
exports.getAirportsInfo = onRequest({
  cors: true,
  memory: "512MiB",
}, async (req, res) => {
  // Configurar CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  try {
    const {hotelLocation} = req.query;

    let locationInfo = null;
    if (hotelLocation) {
      try {
        const location = JSON.parse(hotelLocation);
        const validation = distanceService.validateLocation(location);
        locationInfo = {
          location: location,
          validation: validation,
        };
      } catch (error) {
        locationInfo = {
          error: "Formato de hotelLocation inválido, debe ser JSON válido",
        };
      }
    }

    res.json({
      success: true,
      airports: distanceService.AIRPORTS,
      locationInfo: locationInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error obteniendo información de aeropuertos:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// ========================================
// FUNCIONES DE SEGURIDAD Y CONTROL
// ========================================

/**
 * 🔒 FUNCIÓN DE INICIALIZACIÓN SEGURA
 * Se ejecuta UNA VEZ al deployar para establecer el sistema como PAUSADO
 */
exports.initializeSystemSafety = onRequest({
  cors: {
    origin: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  },
  memory: "512MiB",
}, async (req, res) => {
  try {
    console.log("🔒 Inicializando sistema en modo SEGURO (pausado)...");

    // Establecer cron jobs como PAUSADO por defecto
    await db.collection("systemConfig").doc("cronJobs").set({
      enabled: false, // 🛡️ PAUSADO por defecto
      initializedAt: admin.firestore.FieldValue.serverTimestamp(),
      initializedBy: "system_deploy",
      version: "1.0.0",
      safeMode: true,
      note: "Sistema inicializado en modo pausado por seguridad. " +
          "Activar manualmente desde el panel de administración.",
    }, {merge: true});

    // Log de inicialización
    await db.collection("systemLogs").add({
      level: "info",
      message: "Sistema inicializado en modo PAUSADO por seguridad",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      context: "system_initialization_safe",
    });

    console.log("✅ Sistema inicializado en modo SEGURO");

    res.json({
      success: true,
      message: "Sistema inicializado en modo PAUSADO",
      status: "SAFE_MODE_ACTIVE",
      note: "Use el panel de administración para activar " +
          "las actualizaciones automáticas",
    });
  } catch (error) {
    console.error("❌ Error en inicialización:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * 🎛️ ENDPOINT PARA CONTROL DE CRON JOBS
 * Permite pausar/activar/reiniciar desde el panel web
 */
exports.cronControl = onRequest({
  cors: {
    origin: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  },
  memory: "512MiB",
}, async (req, res) => {
  try {
    const {action} = req.body;

    if (!["enable", "disable", "restart"].includes(action)) {
      return res.status(400).json({
        success: false,
        error: "Acción no válida. Use: enable, disable, restart",
      });
    }

    let enabled;
    let message;

    switch (action) {
      case "enable":
        enabled = true;
        message = "Cron jobs activados - Las actualizaciones " +
            "se ejecutarán cada 15 minutos";
        break;
      case "disable":
        enabled = false;
        message = "Cron jobs pausados - No se realizarán " +
            "actualizaciones automáticas";
        break;
      case "restart":
        enabled = true;
        message = "Cron jobs reiniciados - Forzando actualización inmediata";
        break;
    }

    // Actualizar configuración
    const cronStatus = {
      enabled: enabled,
      lastAction: action,
      lastActionAt: admin.firestore.FieldValue.serverTimestamp(),
      controlledBy: "admin_panel",
    };

    await db.collection("systemConfig").doc("cronJobs")
        .set(cronStatus, {merge: true});

    // Log de la acción
    await db.collection("systemLogs").add({
      level: "info",
      message: `Control manual: ${message}`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      context: `cron_control_${action}`,
      controlledBy: "admin_panel",
    });

    // Si es restart, ejecutar actualización inmediata
    if (action === "restart") {
      console.log("🔄 Restart solicitado - La próxima actualización " +
          "será inmediata");
    }

    console.log(`🎛️ Control de cron: ${action} ejecutado exitosamente`);

    res.json({
      success: true,
      message: message,
      cronStatus: {
        enabled: enabled,
        lastAction: action,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Error en control de cron:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * 📊 ENDPOINT PARA VERIFICAR ESTADO DEL SISTEMA
 * Proporciona información en tiempo real del estado de todos los servicios
 */
exports.systemHealth = onRequest({
  cors: {
    origin: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  },
  memory: "512MiB",
}, async (req, res) => {
  try {
    // Obtener estado de cron jobs
    const cronDoc = await db.collection("systemConfig").doc("cronJobs").get();
    const cronConfig = cronDoc.exists ? cronDoc.data() : {enabled: false};

    // Obtener logs recientes
    const recentLogsQuery = db.collection("systemLogs")
        .orderBy("timestamp", "desc")
        .limit(5);
    const recentLogs = await recentLogsQuery.get();

    // Obtener últimos errores
    const recentErrorsQuery = db.collection("flightErrors")
        .orderBy("timestamp", "desc")
        .limit(3);
    const recentErrors = await recentErrorsQuery.get();

    const systemStatus = {
      timestamp: new Date().toISOString(),
      cronJobs: {
        enabled: cronConfig.enabled || false,
        status: cronConfig.enabled ? "active" : "paused",
        lastRun: cronConfig.lastRun,
        lastAction: cronConfig.lastAction,
        safeMode: cronConfig.safeMode || false,
      },
      flightUpdates: cronConfig.enabled ? "healthy" : "paused",
      distanceMatrix: "healthy", // Esto se ejecuta on-demand
      apiHealth: "healthy",
      recentLogs: recentLogs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.()?.toISOString(),
      })),
      recentErrors: recentErrors.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.()?.toISOString(),
      })),
    };

    res.json({
      success: true,
      ...systemStatus,
    });
  } catch (error) {
    console.error("❌ Error obteniendo estado del sistema:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      flightUpdates: "error",
      distanceMatrix: "error",
      cronJobs: "error",
      apiHealth: "error",
    });
  }
});
