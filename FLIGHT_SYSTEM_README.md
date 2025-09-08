# 🛫 Sistema de Vuelos en Tiempo Real - UpperDS

Sistema completo para obtener y mostrar información de vuelos en tiempo real para las pantallas de UpperDS.

## 📋 Componentes del Sistema

### 1. **Firebase Functions** (`/functions/`)
- **Obtención automática** de datos de vuelos cada 15 minutos
- **APIs REST** para testing y consultas manuales
- **Limpieza automática** de datos antiguos
- **Logging completo** de todas las operaciones

### 2. **Servicio Cliente** (`/src/services/FlightFirebaseService.js`)
- **Suscripciones en tiempo real** para Android TV
- **Procesamiento inteligente** de datos
- **Gestión de conectividad** y fallbacks

### 3. **Configuración Web** (`/src/components/dashboard/PantallasVuelos.jsx`)
- **Panel de administración** completo
- **Configuración por pantalla** individual
- **Mensajes dinámicos** personalizables

## 🚀 Proceso de Deploy

### PASO 1: Preparar el entorno

```bash
# 1. Navegar al directorio de functions
cd functions

# 2. Instalar dependencias
npm install

# 3. (Opcional) Configurar API keys para mejor rendimiento
cp .env.example .env
# Editar .env con tus API keys para OAuth2:
# OPENSKY_CLIENT_ID=tu_username
# OPENSKY_CLIENT_SECRET=tu_password  
# AVIATIONSTACK_KEY=tu_api_key
```

> **🔐 OAuth2 OpenSky**: Sistema automático implementado con renovación de tokens cada 25 minutos y fallback a API anónima.

### APIs Disponibles (Opcionales)

#### **OpenSky Network** (Recomendado)
- **Gratis**: Funciona sin autenticación pero con rate limits
- **Con cuenta OAuth2**: Rate limits más altos + datos históricos + autenticación automática
- **Registro**: https://opensky-network.org/
- **OAuth2**: Sistema implementado con renovación automática de tokens

#### **AviationStack** (Fallback)
- **Plan gratuito**: 1,000 requests/mes
- **Datos premium**: Más detalles de vuelos
- **Registro**: https://aviationstack.com/

> ⚠️ **Nota**: El sistema funciona sin APIs configuradas, usando datos simulados para testing.

### PASO 2: Testing local

```bash
# Probar el servicio de vuelos localmente
npm run test:flight

# Iniciar emulador de Firebase Functions
npm run serve

# En otra terminal, probar las APIs:
curl "http://localhost:5001/tu-proyecto/us-central1/testFlightUpdate?airport=MEX"
```

### PASO 3: Deploy a producción

```bash
# 1. Hacer login en Firebase CLI
firebase login

# 2. Seleccionar el proyecto correcto
firebase use tu-proyecto-id

# 3. Desplegar las functions
npm run deploy

# O usar el comando directo:
firebase deploy --only functions
```

### PASO 4: Verificar el deploy

```bash
# Ver logs en tiempo real
npm run logs

# Probar la función deployada
curl "https://tu-region-tu-proyecto.cloudfunctions.net/testFlightUpdate?airport=MEX&force=true"

# Ver estadísticas del sistema
curl "https://tu-region-tu-proyecto.cloudfunctions.net/getFlightStats"
```

## 🔧 APIs Disponibles

### 1. **testFlightUpdate** - Testing y actualización manual
```bash
GET /testFlightUpdate?airport=MEX&force=true
```
**Parámetros:**
- `airport`: Código del aeropuerto (MEX, TLC, NLU)
- `force`: Si es `true`, guarda los datos en Firebase

**Respuesta:**
```json
{
  "success": true,
  "airport": "MEX",
  "data": {
    "departures": [...],
    "arrivals": [...],
    "totalFlights": 15,
    "source": "opensky"
  },
  "savedToFirestore": true,
  "timestamp": "2025-01-08T..."
}
```

### 2. **getFlightData** - Obtener datos desde la app
```bash
GET /getFlightData?airport=MEX&maxAge=900
```
**Parámetros:**
- `airport`: Código del aeropuerto
- `maxAge`: Edad máxima en segundos (default: 900)

### 3. **getFlightStats** - Estadísticas del sistema
```bash
GET /getFlightStats
```

## 📱 Uso en Android TV

### Importar el servicio
```javascript
import FlightFirebaseService from '@/services/FlightFirebaseService';
```

### Suscribirse a actualizaciones en tiempo real
```javascript
// Suscripción automática
const unsubscribe = FlightFirebaseService.subscribeToFlightData(
  'MEX', 
  (flightData) => {
    console.log('Nuevos datos:', flightData);
    // Actualizar la UI con los nuevos datos
    updateFlightDisplay(flightData);
  },
  (error) => {
    console.error('Error:', error);
    // Manejar error de conexión
    showErrorMessage();
  }
);

// Importante: desuscribirse al desmontar
useEffect(() => {
  return () => {
    unsubscribe();
  };
}, []);
```

### Obtener datos una sola vez
```javascript
try {
  const flightData = await FlightFirebaseService.getFlightData('MEX');
  console.log('Datos obtenidos:', flightData);
} catch (error) {
  console.error('Error obteniendo datos:', error);
}
```

## 🗂️ Estructura de Datos

### Datos de Vuelos Procesados
```javascript
{
  airport: {
    code: "MEX",
    name: "Aeropuerto Internacional Ciudad de México"
  },
  departures: [
    {
      id: "departure_0",
      flightNumber: "AM123",
      airline: "Aeromexico",
      destination: "GDL",
      scheduledTime: "2025-01-08T10:30:00Z",
      scheduledTimeFormatted: "10:30",
      status: "En vuelo",
      displayInfo: {
        primaryTime: "10:30",
        statusColor: "green",
        isDelayed: false,
        relativeTime: "En 2h 15min"
      }
    }
    // ... más vuelos
  ],
  arrivals: [...],
  totalFlights: 15,
  lastUpdate: "2025-01-08T08:15:00Z",
  lastUpdateFormatted: "Hace 5 minutos",
  source: "opensky",
  dataQuality: {
    isStale: false,
    status: "ok",
    ageInMinutes: 5
  }
}
```

## 🔍 Troubleshooting

### Problema: No se obtienen datos de vuelos
**Solución:**
1. Verificar que las Firebase Functions estén desplegadas correctamente
2. Revisar los logs: `firebase functions:log`
3. Probar la API manualmente: `curl https://tu-proyecto.../testFlightUpdate?airport=MEX`
4. **OAuth2**: Verificar que las credenciales OpenSky estén configuradas correctamente

### Problema: Datos muy antiguos
**Solución:**
1. Verificar que el scheduler esté funcionando
2. Forzar una actualización: `...testFlightUpdate?airport=MEX&force=true`
3. Revisar las reglas de Firestore para escritura

### Problema: Error de CORS en la web
**Solución:**
- Las APIs ya tienen configurado CORS (`Access-Control-Allow-Origin: *`)
- Verificar que el dominio esté en la whitelist de Firebase

### Problema: Límites de API alcanzados
**Solución OpenSky:**
- API gratuita sin límites estrictos
- **Con OAuth2**: Límites más altos y mejor rendimiento
- Token se renueva automáticamente cada 25 minutos
- Fallback automático a API anónima si OAuth2 falla

**Solución AviationStack:**
- Configurar API key en variables de entorno
- Monitorear uso mensual

### Problema: Error de autenticación OAuth2
**Solución:**
1. Verificar credenciales OPENSKY_CLIENT_ID y OPENSKY_CLIENT_SECRET
2. Revisar logs para errores de token: `firebase functions:log`
3. El sistema usa fallback automático a API anónima
4. Token se renueva automáticamente, no requiere intervención manual

## 📊 Monitoreo y Mantenimiento

### Logs importantes a revigilar
```bash
# Ver logs de todas las functions
firebase functions:log

# Filtrar por función específica
firebase functions:log --only updateFlightData

# Ver errores únicamente
firebase functions:log | grep "ERROR"
```

### Colecciones de Firebase creadas
- `flightData/{airport}` - Datos actuales de vuelos
- `flightUpdateLogs` - Historial de actualizaciones
- `flightErrors` - Errores para debugging

### Limpieza automática
- Los logs se limpian automáticamente después de 30 días
- Los errores se limpian automáticamente después de 30 días
- La función `cleanupOldData` se ejecuta diariamente

## 🔐 Seguridad y Permisos

### Reglas de Firestore recomendadas
```javascript
// En firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Datos de vuelos - solo lectura para usuarios autenticados
    match /flightData/{airport} {
      allow read: if request.auth != null;
      allow write: if false; // Solo las Functions pueden escribir
    }
    
    // Logs - solo para administradores
    match /flightUpdateLogs/{logId} {
      allow read: if request.auth != null && 
                     request.auth.token.email == 'admin@upperds.com';
    }
  }
}
```

### Variables de entorno (opcionales)

#### **Desarrollo local** (.env file)
```bash
# En /functions/.env
# OAuth2 OpenSky Network (recomendado para mejor rendimiento)
OPENSKY_CLIENT_ID=tu_username_opensky
OPENSKY_CLIENT_SECRET=tu_password_opensky

# AviationStack API (fallback)
AVIATIONSTACK_KEY=tu_api_key_aviationstack
```

> **🔐 OAuth2**: El sistema implementa renovación automática de tokens cada 25 minutos. No requiere intervención manual.

#### **Producción** (Firebase Console)
```bash
# En Firebase Console > Functions > Configuration
firebase functions:config:set opensky.client_id="tu_username"
firebase functions:config:set opensky.client_secret="tu_password"
firebase functions:config:set aviationstack.key="tu_api_key"

# Deploy después de configurar
firebase deploy --only functions
```

## 🎯 Próximos Pasos

1. **Mejorar precisión**: Implementar rutas conocidas y destinos reales
2. **Más aeropuertos**: Agregar soporte para aeropuertos internacionales
3. **Notificaciones**: Alertas para retrasos significativos
4. **Analytics**: Métricas de uso y rendimiento del sistema
5. **Caché inteligente**: Implementar estrategias de caché más sofisticadas

## 📞 Soporte

Para problemas o dudas sobre el sistema de vuelos:
1. Revisar los logs de Firebase Functions
2. Consultar este README
3. Contactar al equipo de desarrollo UpperDS

---

**✅ Sistema de Vuelos UpperDS - Listo para Producción** 🚀