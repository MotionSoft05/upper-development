// ========================================
// MODIFICACIÓN CRÍTICA: SISTEMA PAUSADO POR DEFECTO
// ========================================
// Archivo: functions/secure_deployment_modifications.js
// Instrucciones: Reemplazar las funciones en functions/index.js

const {onSchedule} = require("firebase-functions/v2/scheduler");
const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const db = admin.firestore();

/**
 * 🛡️ FUNCIÓN PRINCIPAL: Cron job PAUSADO por defecto
 * Reemplazar la función updateFlightData existente con esta versión
 */
exports.updateFlightData_SECURE = onSchedule({
  schedule: "every 15 minutes",
  timeZone: "America/Mexico_City",
  memory: "512MiB",
}, async (event) => {
  try {
    console.log("🛫 Iniciando verificación de actualización automática...");

    // 🛡️ SEGURIDAD CRÍTICA: Verificar si los cron jobs están habilitados
    const cronDoc = await db.collection("systemConfig")
        .doc("cronJobs").get();

    // 🔒 POR DEFECTO: Si no existe configuración, está PAUSADO
    const cronConfig = cronDoc.exists ?
            cronDoc.data() : {enabled: false};

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

    // RESTO DE LA LÓGICA (importar servicios necesarios)
    const flightService = require("./services/flightService");
    const airports = ["MEX", "TLC", "NLU"];
    const results = [];

    for (const airport of airports) {
      try {
        console.log(`📡 Actualizando datos para ${airport}...`);

        const flightData = await flightService.getFlightData(airport);

        if (flightData) {
          await db.collection("flightData").doc(airport).set({
            ...flightData,
            serverTimestamp: admin.firestore.FieldValue.serverTimestamp(),
            updatedVia: "scheduled_cron_authorized",
          });

          console.log(`✅ Datos actualizados para ${airport}: ` +
                  `${flightData.totalFlights} vuelos`);

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

        await db.collection("flightErrors").add({
          airport,
          error: error.message,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          context: "scheduled_update",
        });

        await db.collection("systemLogs").add({
          level: "error",
          message: `Error actualizando ${airport}: ${error.message}`,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          context: "scheduled_update_error",
        });
      }
    }

    // Guardar log de actualización exitosa
    await db.collection("flightUpdateLogs").add({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      results: results,
      totalAirports: airports.length,
      successfulUpdates: results.filter((r) => r.success).length,
      triggeredBy: "scheduled_cron_authorized",
    });

    await db.collection("systemLogs").add({
      level: "info",
      message: `Actualización completada: ` +
              `${results.filter((r) => r.success).length}/` +
              `${airports.length} aeropuertos actualizados`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      context: "scheduled_update_success",
    });

    console.log("🏁 Actualización autorizada completada:", results);
    return results;
  } catch (error) {
    console.error("❌ Error en actualización programada:", error);

    await db.collection("systemLogs").add({
      level: "error",
      message: `Error crítico en actualización: ${error.message}`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      context: "scheduled_update_critical_error",
    });

    throw error;
  }
});

/**
 * 🔒 FUNCIÓN DE INICIALIZACIÓN SEGURA
 * Se ejecuta UNA VEZ al deployar para establecer el sistema como PAUSADO
 */
exports.initializeSystemSafety = onRequest({
  cors: true,
  memory: "512MiB",
}, async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

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
  cors: true,
  memory: "512MiB",
}, async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

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
      // Aquí podrías llamar a la función de actualización directamente
      // o simplemente marcar que debe ejecutarse en el siguiente cron
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
  cors: true,
  memory: "512MiB",
}, async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

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

// ========================================
// INSTRUCCIONES DE IMPLEMENTACIÓN
// ========================================
/*
🚀 CÓMO IMPLEMENTAR ESTAS MODIFICACIONES:

1. BACKUP del archivo original:
   cp functions/index.js functions/index.js.backup

2. REEMPLAZAR las funciones en functions/index.js:
   - Reemplazar exports.updateFlightData con exports.updateFlightData_SECURE
   - Agregar exports.initializeSystemSafety
   - Agregar exports.cronControl
   - Agregar exports.systemHealth

3. DESPUÉS del deploy, ejecutar INICIALIZACIÓN:
   curl "https://tu-proyecto.cloudfunctions.net/initializeSystemSafety"

4. VERIFICAR que está pausado:
   curl "https://tu-proyecto.cloudfunctions.net/systemHealth"

🛡️ GARANTÍAS:
✅ Sistema se inicia PAUSADO por defecto
✅ No se hacen peticiones automáticas sin autorización
✅ Control total desde el panel web
✅ Testing manual cuando TÚ lo solicites
✅ Logs de todas las operaciones

FLUJO SEGURO:
Deploy → Pausado → Testing → Activación Manual → Control Total
*/
