/**
 * Script de testing para verificar el servicio de vuelos
 * Ejecutar con: node test-flight.js
 */

require("dotenv").config();
const flightService = require("./services/flightService");

/**
 * Test API configuration and display status
 * @return {Promise<Object>} Configuration status
 */
async function testAPIConfiguration() {
  console.log("🔧 Verificando configuración de APIs...\n");

  const config = {
    openSky: {
      clientId: !!process.env.OPENSKY_CLIENT_ID,
      clientSecret: !!process.env.OPENSKY_CLIENT_SECRET,
    },
    aviationStack: {
      key: !!process.env.AVIATIONSTACK_KEY,
    },
  };

  console.log(
      "📡 OpenSky Network:",
      config.openSky.clientId && config.openSky.clientSecret ?
          "✅ Configurado" : "⚠️  Sin autenticación",
  );
  console.log(
      "📡 AviationStack:",
      config.aviationStack.key ? "✅ Configurado" : "⚠️  No configurado",
  );
  console.log("");

  return config;
}

/**
 * Main test function for flight service
 * @return {Promise<Object>} Test results
 */
async function testFlightService() {
  console.log("🧪 Iniciando pruebas del servicio de vuelos...\n");

  // Verificar configuración de APIs
  await testAPIConfiguration();

  const airports = ["MEX", "TLC", "NLU"];
  const results = [];

  for (const airport of airports) {
    console.log(`📡 Probando ${airport}...`);

    try {
      const startTime = Date.now();
      const data = await flightService.getFlightData(airport);
      const endTime = Date.now();

      const result = {
        airport,
        success: true,
        responseTime: endTime - startTime,
        data: data,
      };

      console.log(`✅ ${airport} - OK (${result.responseTime}ms)`);
      console.log(`   📊 Vuelos totales: ${data.totalFlights}`);
      console.log(`   🛫 Salidas: ${data.departures.length}`);
      console.log(`   🛬 Llegadas: ${data.arrivals.length}`);
      console.log(`   📡 Fuente: ${data.source}`);
      console.log(`   ⏰ Actualización: ${data.lastUpdate}`);

      if (data.departures.length > 0) {
        const firstFlight = data.departures[0];
        console.log(
            `   ✈️  Ejemplo: ${firstFlight.flightNumber} - ` +
            `${firstFlight.airline} - ${firstFlight.status}`,
        );
      }

      if (data.error) {
        console.log(`   ⚠️  Error: ${data.error}`);
        result.hasError = true;
      }

      results.push(result);
    } catch (error) {
      console.log(`❌ ${airport} - ERROR: ${error.message}`);
      results.push({
        airport,
        success: false,
        error: error.message,
      });
    }

    console.log("");

    // Pequeño delay entre requests para evitar rate limits
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Resumen final
  console.log("📊 RESUMEN DE PRUEBAS:");
  console.log("========================");
  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`✅ Exitosos: ${successful}/${airports.length}`);
  console.log(`❌ Fallidos: ${failed}/${airports.length}`);

  if (successful > 0) {
    const avgResponseTime = results
        .filter((r) => r.success)
        .reduce((sum, r) => sum + r.responseTime, 0) / successful;
    console.log(`⏱️  Tiempo promedio: ${Math.round(avgResponseTime)}ms`);
  }

  console.log("\n🏁 Pruebas completadas.");

  // Retornar resultados para uso en CI/CD
  return {
    success: failed === 0,
    results: results,
    summary: {successful, failed, totalTests: airports.length},
  };
}

// Ejecutar las pruebas
if (require.main === module) {
  testFlightService()
      .then((results) => {
        process.exit(results.success ? 0 : 1);
      })
      .catch((error) => {
        console.error("💥 Error en pruebas:", error);
        process.exit(1);
      });
}

module.exports = {testFlightService};
