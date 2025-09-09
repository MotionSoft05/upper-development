// Script de prueba para AeroDataBox integration
require("dotenv").config();
const FlightService = require('./services/flightService');

async function testAeroDataBoxIntegration() {
  console.log('🧪 Iniciando test de integración AeroDataBox...\n');
  
  // Test 1: Verificar configuración
  console.log('1. Verificando configuración de APIs...');
  console.log(`   - AeroDataBox API Key: ${process.env.AERODATABOX_API_KEY ? '✅ Configurada' : '❌ No configurada'}`);
  console.log(`   - OpenSky Client ID: ${process.env.OPENSKY_CLIENT_ID ? '✅ Configurada' : '❌ No configurada'}`);
  console.log(`   - AviationStack Key: ${process.env.AVIATIONSTACK_KEY ? '✅ Configurada' : '❌ No configurada'}\n`);
  
  // Test 2: Probar método específico de AeroDataBox (FREE TIER)
  if (process.env.AERODATABOX_API_KEY) {
    try {
      console.log('2. Probando método FREE TIER testAeroDataBoxFreeTier()...');
      const testResult = await FlightService.testAeroDataBoxFreeTier('MEX');
      console.log(`   ✅ Test FREE TIER exitoso:`);
      console.log(`   - Vuelos: ${testResult.totalFlights}`);
      console.log(`   - Fuente: ${testResult.source}`);
      console.log(`   - Aeropuerto: ${testResult.airportInfo?.name || 'N/A'}`);
      console.log(`   - Nota: ${testResult.note || 'N/A'}\n`);
    } catch (error) {
      console.error(`   ❌ Test FREE TIER falló: ${error.message}`);
      
      // Fallback al test original
      try {
        console.log('   Probando método original como fallback...');
        const originalResult = await FlightService.testAeroDataBox('MEX');
        console.log(`   ✅ Test original exitoso: ${originalResult.totalFlights} vuelos encontrados\n`);
      } catch (originalError) {
        console.error(`   ❌ Ambos tests fallaron: ${originalError.message}\n`);
      }
    }
  } else {
    console.log('2. ⚠️ Saltando test directo - API Key no configurada\n');
  }
  
  // Test 3: Probar método principal getFlightData con nueva jerarquía
  try {
    console.log('3. Probando método principal getFlightData() con nueva jerarquía...');
    const flightData = await FlightService.getFlightData('MEX');
    
    console.log(`   ✅ Datos obtenidos exitosamente:`);
    console.log(`   - Fuente: ${flightData.source}`);
    console.log(`   - Salidas: ${flightData.departures?.length || 0}`);
    console.log(`   - Llegadas: ${flightData.arrivals?.length || 0}`);
    console.log(`   - Total vuelos: ${flightData.totalFlights || 0}`);
    console.log(`   - Última actualización: ${flightData.lastUpdate}`);
    
    if (flightData.error) {
      console.log(`   ⚠️ Error reportado: ${flightData.error}`);
    }
    
  } catch (error) {
    console.error(`   ❌ Test principal falló: ${error.message}`);
  }
  
  console.log('\n🏁 Test de integración completado.');
}

// Ejecutar test si se llama directamente
if (require.main === module) {
  testAeroDataBoxIntegration().catch(console.error);
}

module.exports = { testAeroDataBoxIntegration };