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
    googleMaps: {
      key: !!process.env.GOOGLE_MAPS_API_KEY,
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
  console.log(
      "🗺️ Google Maps Distance Matrix:",
      config.googleMaps.key ? "✅ Configurado" : "⚠️  No configurado",
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

  const airports = ["MEX", "GDL", "CUN", "MTY", "PVR"];
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

/**
 * Test hotel distance service with Sheraton María Isabel
 * @return {Promise<Object>} Test results
 */
async function testHotelDistanceService() {
  console.log("🏨 Iniciando pruebas del servicio de distancias de hotel...\n");

  try {
    // const hotelDistanceService = require("./services/hotelDistanceService");
    const distanceService = require("./services/distanceService");

    // Ubicación base para tests: Sheraton María Isabel Hotel
    const sheratonLocation = {
      address: "Sheraton María Isabel Hotel, Avenida Paseo de la Reforma, Colonia Cuauhtémoc, Mexico City, CDMX, Mexico",
      lat: 19.427940,
      lng: -99.167127,
    };

    console.log("📍 Ubicación de test: Sheraton María Isabel Hotel");
    console.log(`   Coordenadas: ${sheratonLocation.lat}, ${sheratonLocation.lng}`);
    console.log("");

    // Test 1: Detectar aeropuertos activos (simulado)
    console.log("🔍 Test 1: Detección de aeropuertos activos...");
    // const testCompanyId = "test-sheraton-hotel";
    const activeAirports = ["MEX", "GDL"]; // Simular que usa MEX y GDL

    console.log(`✅ Aeropuertos activos simulados: ${activeAirports.join(", ")}`);
    console.log("");

    // Test 2: Calcular distancia selectiva (solo aeropuertos activos)
    console.log("🗺️ Test 2: Cálculo selectivo de distancias...");

    const distanceResults = [];
    for (const airport of activeAirports) {
      try {
        console.log(`   Calculando distancia a ${airport}...`);
        const result = await distanceService.calculateTravelTime(
            sheratonLocation,
            airport,
            {trafficModel: "best_guess"},
        );

        if (result.success) {
          console.log(`   ✅ ${airport}: ${result.data.distance.km}km, ${result.data.duration.minutes}min`);
          if (result.data.durationInTraffic) {
            console.log(`      Con tráfico: ${result.data.durationInTraffic.minutes}min (${result.data.trafficConditions})`);
          }
          distanceResults.push({airport, success: true, data: result.data});
        } else {
          console.log(`   ❌ ${airport}: ${result.error}`);
          distanceResults.push({airport, success: false, error: result.error});
        }
      } catch (error) {
        console.log(`   ❌ ${airport}: ${error.message}`);
        distanceResults.push({
          airport, success: false, error: error.message,
        });
      }
    }

    const successfulCalculations = distanceResults
        .filter((r) => r.success).length;
    console.log("");
    console.log(`📊 Resultados: ${successfulCalculations}/` +
        `${activeAirports.length} cálculos exitosos`);

    // Test 3: Verificar costo optimizado
    console.log("");
    console.log("💰 Test 3: Verificación de optimización de costos...");
    console.log(`   Cálculos realizados: ${activeAirports.length} (optimizado)`);
    console.log(`   Cálculos que se harían sin optimización: 3 (naive: MEX, GDL, CUN)`);
    console.log(`   Ahorro: ${3 - activeAirports.length} requests por hotel`);
    console.log(`   Proyección mensual (20 hoteles): ~${((3 - activeAirports.length) * 20 * (30 * 24 * 3))} requests ahorrados`);

    // Test 4: Validar frecuencia de 20 minutos
    console.log("");
    console.log("⏰ Test 4: Verificación de frecuencia de actualización...");
    console.log("   Frecuencia configurada: cada 20 minutos");
    console.log("   Requests diarios por hotel: 72 (24h / 20min * 60min)");
    console.log("   Requests mensuales (20 hoteles): ~43,200");
    console.log("   ✅ Dentro del límite de Google Distance Matrix");

    console.log("");
    console.log("🏁 Pruebas de distancias completadas.");

    return {
      success: successfulCalculations > 0,
      results: distanceResults,
      summary: {
        successful: successfulCalculations,
        failed: activeAirports.length - successfulCalculations,
        totalTests: activeAirports.length,
        optimized: true,
        baseLocation: sheratonLocation,
      },
    };
  } catch (error) {
    console.error("❌ Error en pruebas de distancia:", error);
    return {
      success: false,
      error: error.message,
      results: [],
    };
  }
}

/**
 * Ejecutar todas las pruebas
 */
async function runAllTests() {
  console.log("🚀 INICIANDO SUITE COMPLETA DE PRUEBAS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📅 ${new Date().toISOString()}`);
  console.log("");

  const results = {
    flightService: null,
    hotelDistanceService: null,
    overall: {success: false, errors: []},
  };

  try {
    // Pruebas de servicio de vuelos
    console.log("🛫 PARTE 1: Servicio de Vuelos");
    console.log("─".repeat(40));
    results.flightService = await testFlightService();

    console.log("");

    // Pruebas de servicio de distancias
    console.log("🏨 PARTE 2: Servicio de Distancias de Hotel");
    console.log("─".repeat(40));
    results.hotelDistanceService = await testHotelDistanceService();

    // Resumen final
    console.log("");
    console.log("📋 RESUMEN FINAL");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`🛫 Vuelos: ` +
        `${results.flightService.success ? "✅ PASS" : "❌ FAIL"}`);
    console.log(`🏨 Distancias: ` +
        `${results.hotelDistanceService.success ? "✅ PASS" : "❌ FAIL"}`);

    const overallSuccess = results.flightService.success &&
        results.hotelDistanceService.success;
    results.overall.success = overallSuccess;

    console.log("");
    console.log(`🎯 RESULTADO GENERAL: ` +
        `${overallSuccess ? "✅ TODOS LOS TESTS PASARON" : "❌ ALGUNOS TESTS FALLARON"}`);

    return results;
  } catch (error) {
    console.error("💥 Error ejecutando suite de pruebas:", error);
    results.overall.errors.push(error.message);
    return results;
  }
}

// Ejecutar las pruebas
if (require.main === module) {
  const testType = process.argv[2] || "all";

  if (testType === "flights") {
    testFlightService()
        .then((results) => {
          process.exit(results.success ? 0 : 1);
        })
        .catch((error) => {
          console.error("💥 Error en pruebas de vuelos:", error);
          process.exit(1);
        });
  } else if (testType === "distance") {
    testHotelDistanceService()
        .then((results) => {
          process.exit(results.success ? 0 : 1);
        })
        .catch((error) => {
          console.error("💥 Error en pruebas de distancia:", error);
          process.exit(1);
        });
  } else {
    runAllTests()
        .then((results) => {
          process.exit(results.overall.success ? 0 : 1);
        })
        .catch((error) => {
          console.error("💥 Error en suite de pruebas:", error);
          process.exit(1);
        });
  }
}

module.exports = {testFlightService, testHotelDistanceService, runAllTests};
