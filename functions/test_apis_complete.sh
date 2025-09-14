#!/bin/bash
# ========================================
# TESTS COMPLETOS DE APIs - ANTES DEL DEPLOY
# ========================================
# Archivo: functions/test_apis_complete.sh
# Uso: chmod +x test_apis_complete.sh && ./test_apis_complete.sh

echo "🚀 INICIANDO TESTS COMPLETOS DE APIs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📅 $(date)"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ ERROR: Ejecutar desde el directorio functions/"
    echo "   cd functions/ && ./test_apis_complete.sh"
    exit 1
fi

echo "✅ Directorio correcto: functions/"
echo ""

# PASO 1: Tests de APIs de Vuelos
# ========================================

echo "🛫 PASO 1: Testing APIs de vuelos..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

node -e "
require('dotenv').config();

// Verificar que el servicio existe
let flightService;
try {
  flightService = require('./services/flightService');
  console.log('✅ Servicio de vuelos cargado correctamente');
} catch (error) {
  console.log('❌ ERROR: No se pudo cargar ./services/flightService');
  console.log('   Verifica que el archivo existe y no tiene errores de sintaxis');
  process.exit(1);
}

async function testFlights() {
  console.log('📡 Testing OpenSky Network + AviationStack...');
  console.log('');
  
  const airports = ['MEX', 'GDL', 'CUN'];
  let totalSuccess = 0;
  let totalTests = airports.length;
  
  for (const airport of airports) {
    try {
      console.log(\`🔍 Testing \${airport}...\`);
      const startTime = Date.now();
      
      const result = await flightService.getFlightData(airport);
      
      const duration = Date.now() - startTime;
      
      if (result && result.totalFlights !== undefined) {
        console.log(\`✅ \${airport} - SUCCESS\`);
        console.log(\`   Source: \${result.source || 'Unknown'}\`);
        console.log(\`   Departures: \${result.departures?.length || 0}\`);
        console.log(\`   Arrivals: \${result.arrivals?.length || 0}\`);
        console.log(\`   Total: \${result.totalFlights}\`);
        console.log(\`   Time: \${duration}ms\`);
        totalSuccess++;
      } else {
        console.log(\`❌ \${airport} - FAILED: No data or invalid format\`);
        console.log(\`   Response: \${JSON.stringify(result)}\`);
      }
      
    } catch (error) {
      console.log(\`❌ \${airport} - ERROR: \${error.message}\`);
      if (error.response) {
        console.log(\`   HTTP Status: \${error.response.status}\`);
      }
    }
    
    console.log(''); // Línea en blanco
  }
  
  console.log(\`🏁 Flight APIs test completed: \${totalSuccess}/\${totalTests} successful\`);
  
  if (totalSuccess === 0) {
    console.log('❌ CRÍTICO: Ningún aeropuerto funcionó. Revisar configuración de APIs.');
    process.exit(1);
  } else if (totalSuccess < totalTests) {
    console.log('⚠️ ADVERTENCIA: Algunos aeropuertos fallaron. Revisar logs.');
  } else {
    console.log('🎉 PERFECTO: Todos los aeropuertos funcionaron correctamente.');
  }
}

testFlights().catch(error => {
  console.log('❌ ERROR CRÍTICO en test de vuelos:', error.message);
  process.exit(1);
});
"

echo ""
echo "⏳ Esperando 5 segundos antes del siguiente test..."
sleep 5

# PASO 2: Tests de Google Distance Matrix
# ========================================

echo "🗺️ PASO 2: Testing Google Distance Matrix API..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 2.1 Test básico de distancia (Centro CDMX → MEX)
node -e "
require('dotenv').config();

let distanceService;
try {
  distanceService = require('./services/distanceService');
  console.log('✅ Servicio de distancia cargado correctamente');
} catch (error) {
  console.log('❌ ERROR: No se pudo cargar ./services/distanceService');
  console.log('   Verifica que el archivo existe y no tiene errores de sintaxis');
  process.exit(1);
}

async function testSingleDistance() {
  console.log('🔍 Testing single route: Centro CDMX → MEX...');
  console.log('');
  
  try {
    const startTime = Date.now();
    const result = await distanceService.calculateTravelTime(
      {lat: 19.4326, lng: -99.1332, address: 'Centro CDMX'}, 
      'MEX'
    );
    const duration = Date.now() - startTime;
    
    if (result && result.success) {
      console.log('✅ SINGLE ROUTE - SUCCESS');
      console.log(\`   Distance: \${result.data?.distance?.text || 'N/A'}\`);
      console.log(\`   Duration: \${result.data?.duration?.text || 'N/A'}\`);
      console.log(\`   Duration with traffic: \${result.data?.durationInTraffic?.text || 'N/A'}\`);
      console.log(\`   Traffic conditions: \${result.data?.trafficConditions || 'N/A'}\`);
      console.log(\`   API Time: \${duration}ms\`);
    } else {
      console.log('❌ SINGLE ROUTE - FAILED:', result?.error || 'Unknown error');
      console.log(\`   Full response: \${JSON.stringify(result)}\`);
    }
  } catch (error) {
    console.log('❌ SINGLE ROUTE - ERROR:', error.message);
    if (error.response) {
      console.log(\`   HTTP Status: \${error.response.status}\`);
      console.log(\`   Response data: \${JSON.stringify(error.response.data)}\`);
    }
  }
}

testSingleDistance().catch(error => {
  console.log('❌ ERROR CRÍTICO en test de distancia:', error.message);
});
"

echo ""
echo "⏳ Esperando 3 segundos..."
sleep 3

# 2.2 Test de múltiples rutas (Sheraton María Isabel → MEX, GDL, CUN)
node -e "
require('dotenv').config();
const distanceService = require('./services/distanceService');

async function testMultipleRoutes() {
  console.log('🔍 Testing multiple routes: Sheraton María Isabel → MEX, GDL, CUN...');
  console.log('');

  try {
    const startTime = Date.now();
    const sheratonLocation = {
      lat: 19.427940,
      lng: -99.167127,
      address: 'Sheraton María Isabel Hotel, Avenida Paseo de la Reforma, Colonia Cuauhtémoc, Mexico City, CDMX, Mexico'
    };
    const result = await distanceService.calculateMultipleRoutes(
      sheratonLocation,
      ['MEX', 'GDL', 'CUN']
    );
    const duration = Date.now() - startTime;
    
    if (result && result.success) {
      console.log('✅ MULTIPLE ROUTES - SUCCESS');
      console.log(\`   Total routes calculated: \${result.results?.length || 0}\`);
      console.log(\`   Failed routes: \${result.failed?.length || 0}\`);
      console.log(\`   API Time: \${duration}ms\`);
      
      if (result.fastest && result.fastest.success) {
        const fastest = result.fastest.data;
        console.log(\`   Fastest route: \${fastest.airportCode}\`);
        console.log(\`   Fastest time: \${fastest.duration?.text || 'N/A'}\`);
      }
      
      // Mostrar detalles de cada ruta
      if (result.results && Array.isArray(result.results)) {
        console.log('   Route details:');
        result.results.forEach(route => {
          if (route.success) {
            const data = route.data;
            console.log(\`     → \${data.airportCode}: \${data.distance?.text || 'N/A'}, \${data.duration?.text || 'N/A'}\`);
          }
        });
      }
      
    } else {
      console.log('❌ MULTIPLE ROUTES - FAILED:', result?.error || 'Unknown error');
      console.log(\`   Full response: \${JSON.stringify(result)}\`);
    }
  } catch (error) {
    console.log('❌ MULTIPLE ROUTES - ERROR:', error.message);
    if (error.response) {
      console.log(\`   HTTP Status: \${error.response.status}\`);
    }
  }
}

testMultipleRoutes().catch(error => {
  console.log('❌ ERROR CRÍTICO en test de múltiples rutas:', error.message);
});
"

echo ""

# PASO 3: Testing Hotel Distance Matrix Optimizado
# ========================================

echo "🏨 PASO 3: Testing Hotel Distance Matrix Optimizado..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 3.1 Test con ubicación Sheraton María Isabel
node -e "
require('dotenv').config();

async function testOptimizedDistanceMatrix() {
  console.log('🏨 Testing optimized distance matrix with Sheraton María Isabel...');
  console.log('');

  // Ubicación base para tests
  const sheratonLocation = {
    address: 'Sheraton María Isabel Hotel, Avenida Paseo de la Reforma, Colonia Cuauhtémoc, Mexico City, CDMX, Mexico',
    lat: 19.427940,
    lng: -99.167127,
  };

  console.log(\`📍 Base location: \${sheratonLocation.address}\`);
  console.log(\`   Coordinates: \${sheratonLocation.lat}, \${sheratonLocation.lng}\`);
  console.log('');

  // Test detección aeropuertos activos (simulado)
  console.log('🔍 Testing active airport detection...');
  const testHotel = 'test-sheraton-hotel';
  const activeAirports = ['MEX', 'GDL']; // Simulado: hotel usa solo MEX y GDL

  console.log(\`   Hotel: \${testHotel}\`);
  console.log(\`   Active airports (simulated): \${activeAirports.join(', ')}\`);
  console.log(\`   ✅ Optimization: calculating only \${activeAirports.length}/3 airports\`);
  console.log('');

  // Test cálculo selectivo
  console.log('🗺️ Testing selective distance calculation...');

  try {
    const distanceService = require('./services/distanceService');
    let successfulCalculations = 0;
    let totalTime = 0;

    for (const airport of activeAirports) {
      try {
        console.log(\`   Calculating route to \${airport}...\`);
        const startTime = Date.now();

        const result = await distanceService.calculateTravelTime(
          sheratonLocation,
          airport,
          { trafficModel: 'best_guess' }
        );

        const duration = Date.now() - startTime;
        totalTime += duration;

        if (result.success) {
          console.log(\`   ✅ \${airport}: \${result.data.distance.km}km, \${result.data.duration.minutes}min (\${duration}ms)\`);
          if (result.data.durationInTraffic) {
            console.log(\`      With traffic: \${result.data.durationInTraffic.minutes}min (\${result.data.trafficConditions})\`);
          }
          successfulCalculations++;
        } else {
          console.log(\`   ❌ \${airport}: \${result.error}\`);
        }

        // Pausa entre requests para evitar rate limits
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.log(\`   ❌ \${airport}: \${error.message}\`);
      }
    }

    console.log('');
    console.log(\`📊 Results: \${successfulCalculations}/\${activeAirports.length} successful calculations\`);
    console.log(\`⏱️  Total time: \${totalTime}ms\`);
    console.log('');

    // Análisis de optimización
    console.log('💰 Cost optimization analysis:');
    console.log(\`   Calculations performed: \${activeAirports.length} (optimized)\`);
    console.log(\`   Calculations without optimization: 3 (naive: MEX, GDL, CUN)\`);
    console.log(\`   Savings per hotel: \${3 - activeAirports.length} requests\`);
    console.log(\`   Daily requests per hotel (20min freq): \${Math.ceil(24 * 60 / 20)} requests\`);
    console.log(\`   Monthly savings (20 hotels): ~\${((3 - activeAirports.length) * 20 * Math.ceil(24 * 60 / 20) * 30)} requests\`);
    console.log('');

    if (successfulCalculations > 0) {
      console.log('✅ OPTIMIZED DISTANCE MATRIX - SUCCESS');
    } else {
      console.log('❌ OPTIMIZED DISTANCE MATRIX - FAILED');
    }

  } catch (error) {
    console.log(\`❌ OPTIMIZED DISTANCE MATRIX - ERROR: \${error.message}\`);
  }
}

testOptimizedDistanceMatrix().catch(error => {
  console.log('❌ ERROR CRÍTICO en test optimizado:', error.message);
});
"

echo ""

# PASO 4: Test de Conectividad General
# ========================================

echo "🌐 PASO 4: Testing general connectivity..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 3.1 Test de conectividad a OpenSky
echo "🔍 Testing OpenSky Network connectivity..."
if curl -s --connect-timeout 10 --max-time 15 "https://opensky-network.org/api/flights/departure?airport=MEX&begin=1517227200&end=1517230800" > /dev/null 2>&1; then
    echo "✅ OpenSky Network - ACCESSIBLE"
else
    echo "❌ OpenSky Network - CONNECTION ISSUE"
fi

# 3.2 Test de conectividad a AviationStack
echo "🔍 Testing AviationStack connectivity..."
if curl -s --connect-timeout 10 --max-time 15 "https://api.aviationstack.com/v1/flights" > /dev/null 2>&1; then
    echo "✅ AviationStack - ACCESSIBLE"
else
    echo "❌ AviationStack - CONNECTION ISSUE"
fi

# 3.3 Test de conectividad a Google Maps
echo "🔍 Testing Google Distance Matrix connectivity..."
if curl -s --connect-timeout 10 --max-time 15 "https://maps.googleapis.com/maps/api/distancematrix/json?origins=19.4326,-99.1332&destinations=19.4363,-99.0721&key=invalid" > /dev/null 2>&1; then
    echo "✅ Google Distance Matrix - ACCESSIBLE"
else
    echo "❌ Google Distance Matrix - CONNECTION ISSUE"
fi

echo ""

# PASO 4: Verificación de Variables de Entorno
# ========================================

echo "🔧 PASO 4: Verificando configuración de variables de entorno..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f ".env" ]; then
    echo "✅ Archivo .env encontrado"
    echo ""
    
    # Verificar OpenSky
    if grep -q "OPENSKY_CLIENT_ID" .env && grep -q "OPENSKY_CLIENT_SECRET" .env; then
        echo "✅ OpenSky credentials - CONFIGURED"
        # Verificar que no estén vacías
        if grep -q "OPENSKY_CLIENT_ID=" .env && ! grep -q "OPENSKY_CLIENT_ID=$" .env; then
            echo "   ✓ CLIENT_ID has value"
        else
            echo "   ⚠️ CLIENT_ID appears empty"
        fi
        if grep -q "OPENSKY_CLIENT_SECRET=" .env && ! grep -q "OPENSKY_CLIENT_SECRET=$" .env; then
            echo "   ✓ CLIENT_SECRET has value"
        else
            echo "   ⚠️ CLIENT_SECRET appears empty"
        fi
    else
        echo "❌ OpenSky credentials - MISSING"
        echo "   Agregar: OPENSKY_CLIENT_ID=tu-client-id"
        echo "   Agregar: OPENSKY_CLIENT_SECRET=tu-client-secret"
    fi
    
    echo ""
    
    # Verificar AviationStack
    if grep -q "AVIATIONSTACK_KEY" .env; then
        echo "✅ AviationStack API Key - CONFIGURED"
        if grep -q "AVIATIONSTACK_KEY=" .env && ! grep -q "AVIATIONSTACK_KEY=$" .env; then
            echo "   ✓ API Key has value"
        else
            echo "   ⚠️ API Key appears empty"
        fi
    else
        echo "❌ AviationStack API Key - MISSING"
        echo "   Agregar: AVIATIONSTACK_KEY=tu-api-key"
    fi
    
    echo ""
    
    # Verificar Google Maps
    if grep -q "GOOGLE_MAPS_API_KEY" .env; then
        echo "✅ Google Maps API Key - CONFIGURED"
        if grep -q "GOOGLE_MAPS_API_KEY=" .env && ! grep -q "GOOGLE_MAPS_API_KEY=$" .env; then
            echo "   ✓ API Key has value"
        else
            echo "   ⚠️ API Key appears empty"
        fi
    else
        echo "❌ Google Maps API Key - MISSING"
        echo "   Agregar: GOOGLE_MAPS_API_KEY=tu-api-key"
        echo "   ⚠️ Distance Matrix NO funcionará sin esta key"
    fi
    
else
    echo "❌ Archivo .env NO ENCONTRADO"
    echo ""
    echo "Crear functions/.env con las siguientes variables:"
    echo "OPENSKY_CLIENT_ID=tu-client-id"
    echo "OPENSKY_CLIENT_SECRET=tu-client-secret" 
    echo "AVIATIONSTACK_KEY=tu-api-key"
    echo "GOOGLE_MAPS_API_KEY=tu-google-maps-key"
    echo ""
fi

echo ""

# PASO 5: Resumen Final
# ========================================

echo "🎯 RESUMEN DE TESTS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🛫 APIs de Vuelos: Verificar resultados arriba ⬆️"
echo "🗺️ Google Maps: Verificar resultados arriba ⬆️"  
echo "🌐 Conectividad: Verificar estados de conexión ⬆️"
echo "🔧 Configuración: Verificar variables de entorno ⬆️"
echo ""
echo "⚠️ IMPORTANTE:"
echo "   ✅ Solo procede con el deploy si la mayoría de tests son exitosos"
echo "   🛡️ El sistema se deployará en modo PAUSADO por seguridad"
echo "   🎛️ Podrás activarlo manualmente desde el panel web"
echo "   🧪 Los tests manuales estarán disponibles en el panel"
echo ""

# PASO 6: Comandos post-deploy
# ========================================

echo "📝 DESPUÉS DEL DEPLOY, ejecuta estos comandos:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "# 1. Inicializar sistema en modo pausado (OBLIGATORIO)"
echo "curl 'https://tu-proyecto.cloudfunctions.net/initializeSystemSafety'"
echo ""
echo "# 2. Verificar que está pausado"  
echo "curl 'https://tu-proyecto.cloudfunctions.net/systemHealth'"
echo ""
echo "# 3. Test manual de aeropuerto (opcional)"
echo "curl 'https://tu-proyecto.cloudfunctions.net/testFlightUpdate?airport=MEX&force=false'"
echo ""
echo "🛡️ GARANTÍAS DE SEGURIDAD:"
echo "   ✅ Sistema inicia PAUSADO automáticamente"
echo "   ✅ CERO peticiones automáticas hasta tu autorización"
echo "   ✅ Panel de administración para control total"
echo "   ✅ Testing manual cuando tú lo solicites"
echo ""
echo "🚀 DEPLOY SEGURO LISTO - Procede cuando todos los tests sean ✅"