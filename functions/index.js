const functions = require("firebase-functions");
const admin = require("firebase-admin");
const flightService = require("./services/flightService");

// Inicializar Firebase Admin
admin.initializeApp();

// Referencia a Firestore
const db = admin.firestore();

/**
 * Función que se ejecuta cada 15 minutos para actualizar datos de vuelos
 */
exports.updateFlightData = functions.pubsub
    .schedule("every 15 minutes")
    .timeZone("America/Mexico_City")
    .onRun(async (context) => {
      console.log("🛫 Iniciando actualización automática de datos de vuelos...");

      const airports = ["MEX", "TLC", "NLU"];
      const results = [];

      for (const airport of airports) {
        try {
          console.log(`📡 Actualizando datos para ${airport}...`);

          const flightData = await flightService.getFlightData(airport);

          if (flightData) {
          // Guardar en Firestore
            await db.collection("flightData").doc(airport).set({
              ...flightData,
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
exports.testFlightUpdate = functions.https.onRequest(async (req, res) => {
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
      // Guardar en Firestore si se solicita
      await db.collection("flightData").doc(airport.toUpperCase()).set({
        ...flightData,
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
exports.getFlightData = functions.https.onRequest(async (req, res) => {
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
exports.cleanupOldData = functions.pubsub
    .schedule("every 24 hours")
    .timeZone("America/Mexico_City")
    .onRun(async (context) => {
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
exports.getFlightStats = functions.https.onRequest(async (req, res) => {
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
