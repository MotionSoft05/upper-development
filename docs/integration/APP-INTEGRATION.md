# 📱 Guía de Integración - App Android TV

> Cómo la app se conecta y consume datos de la plataforma web

---

## 🔗 Resumen de Conexión

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FLUJO DE DATOS                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   DASHBOARD WEB                    FIREBASE                APP TV   │
│   ─────────────                    ───────                 ──────   │
│                                                                     │
│   Usuario configura  ──────────►  Firestore  ◄──────────  App lee  │
│   - Colores                       (colecciones)           - onSnapshot │
│   - Logo                                                  - Tiempo real │
│   - Eventos                                                         │
│   - Publicidad                                                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**La app NO se conecta directamente a la web.** Se conecta a **Firebase Firestore** y escucha cambios en tiempo real.

---

## 🖥️ Tipos de Pantalla

### 1. Pantallas Salón

**Uso**: Mostrar eventos en salas de hoteles/eventos

**Colección Firestore**: `TemplateSalon`

**Documento ID**: `{empresa}_{numeroPantalla}` (ej: `HOTEL_MARRIOTT_1`)

```javascript
// Estructura del documento
{
  empresa: "HOTEL_MARRIOTT",
  selectedPantalla: 1,
  template: "PSTemplate1",        // o "PSTemplate2"
  templateColor: "#1E3A8A",       // Color de fondo
  fontColor: "#FFFFFF",           // Color de texto
  fontStyle: "Inter",             // Fuente de Google Fonts
  idioma: "es",                   // "es" o "en"
  logo: "https://storage.../logo.png",
  selectedCity: { value: "mexico-city", label: "Ciudad de México" },
  orientation: "horizontal"       // o "vertical"
}
```

**Eventos a mostrar**: Colección `eventos`

```javascript
// Query para obtener eventos
db.collection("eventos")
  .where("empresa", "==", empresa)
  .where("dispositivos", "array-contains", "salon_1");
```

---

### 2. Pantallas Directorio

**Uso**: Directorios de edificios con listado de eventos del día

**Colección Firestore**: `TemplateDirectorio`

**Documento ID**: `{empresa}_{numeroPantalla}`

```javascript
{
  empresa: "HOTEL_MARRIOTT",
  pantallaId: 1,
  template: "PDTemplate1Horizontal",  // o "PDTemplate1Vertical"
  templateColor: "#1E3A8A",
  fontColor: "#FFFFFF",
  logoUrl: "https://storage.../logo.png",
  selectedCity: { value: "mexico-city" },
  showWeather: true,
  showRSS: true
}
```

**Publicidad**: Colección `publicidadDirectorio`

```javascript
db.collection("publicidadDirectorio")
  .where("empresa", "==", empresa)
  .where("activo", "==", true)
  .where("tipoPantalla", "array-contains", "horizontal");
```

---

### 3. Pantallas Tarifario

**Uso**: Mostrar tarifas/precios (hoteles, transporte)

**Colección Firestore**: `TemplateTarifario`

```javascript
{
  empresa: "HOTEL_MARRIOTT",
  pantallaId: 1,
  template: "PTTemplate1Horizontal",
  templateColor: "#1E3A8A",
  fontColor: "#FFFFFF",
  tarifas: [
    { destino: "Aeropuerto Zona 1", precio: "350.00" },
    { destino: "Aeropuerto Zona 2", precio: "450.00" },
    { destino: "Centro", precio: "250.00" }
  ]
}
```

---

### 4. Pantallas Vuelos

**Uso**: Información de vuelos en tiempo real

**Colección Firestore**: `flightData`

**Documento ID**: Código del aeropuerto (`MEX`, `GDL`, `CUN`, `MTY`, `PVR`)

```javascript
// Datos actualizados cada 40 minutos por Cloud Functions
{
  airport: "MEX",
  arrivals: [
    {
      flightNumber: "AM123",
      airline: "Aeromexico",
      origin: "LAX",
      scheduledTime: "10:30",
      status: "On Time",
      gate: "A5"
    }
  ],
  departures: [...],
  lastUpdated: Timestamp,
  source: "aerodatabox"
}
```

**Configuración por hotel**: `hotelDistanceConfig`

```javascript
{
  empresa: "HOTEL_MARRIOTT",
  airport: "MEX",
  distance: "25 min"  // Distancia al aeropuerto
}
```

---

### 5. Pantallas Promociones

**Uso**: Contenido promocional (imágenes, videos)

**Colección Firestore**: `TemplatePromociones`

```javascript
{
  empresa: "HOTEL_MARRIOTT",
  pantallaId: 1,
  nombre: "Lobby Screen",
  template: "fullscreen",
  sections: [
    {
      id: "main",
      contents: [
        { type: "image", url: "https://...", duration: 10 },
        { type: "video", url: "https://...", duration: 30 }
      ]
    }
  ],
  dateRange: {
    startDate: "2026-01-01",
    endDate: "2026-12-31"
  }
}
```

---

## 📅 Sistema de Eventos

**Colección**: `eventos`

```javascript
{
  id: "auto-generated",
  nombre: "Conferencia Anual",
  descripcion: "Descripción del evento",
  empresa: "HOTEL_MARRIOTT",

  // Imágenes del evento
  imagenes: [
    "https://storage.../imagen1.jpg",
    "https://storage.../imagen2.jpg"
  ],

  // Fechas (filtrar por estos campos)
  startDate: "2026-01-15",
  endDate: "2026-01-17",

  // Pantallas asignadas
  dispositivos: ["salon_1", "salon_2", "direc_1"],

  // Tiempo de visualización
  tiempoDeVisualizacion: {
    hours: 0,
    minutes: 1,
    seconds: 30
  }
}
```

**Filtrar eventos activos**:

```javascript
const hoy = new Date().toISOString().split("T")[0];

db.collection("eventos")
  .where("empresa", "==", empresa)
  .where("startDate", "<=", hoy)
  .where("endDate", ">=", hoy);
```

---

## 📢 Sistema de Publicidad

**Colecciones**:

- `publicidadDirectorio` - Para pantallas Directorio
- `publicidadSalon` - Para pantallas Salón
- `publicidadTarifario` - Para pantallas Tarifario

```javascript
{
  empresa: "HOTEL_MARRIOTT",
  tipo: "imagen",              // "imagen" o "video"
  url: "https://storage.../ad.jpg",
  tiempo: 10,                  // Segundos de visualización
  tipoPantalla: ["horizontal", "vertical"],
  activo: true
}
```

**Rotación de anuncios**:

```javascript
// La app debe rotar anuncios según el campo "tiempo"
const timer = setTimeout(() => {
  setCurrentAdIndex((prev + 1) % ads.length);
}, currentAd.tiempo * 1000);
```

---

## 📺 Monitoreo de Pantallas (Heartbeat)

La app debe enviar un "heartbeat" cada 30 segundos para indicar que está activa.

**Colección**: `devices`

```javascript
// Actualizar lastSeen periódicamente
db.collection("devices").doc(deviceId).update({
  lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
});
```

**Estados**:
| lastSeen | Estado |
|----------|--------|
| < 2 min | 🟢 Online |
| 2-5 min | 🟡 Idle |
| > 5 min | 🔴 Offline |

---

## 🔐 Autenticación

La app necesita autenticarse con Firebase Auth para acceder a los datos.

**Flujo**:

1. Usuario vincula dispositivo con código de 6 caracteres
2. Dashboard guarda `ownerId` y `empresa` en el dispositivo
3. App usa esos datos para queries filtrados por empresa

**Colección**: `devices`

```javascript
{
  code: "ABC123",
  status: "linked",
  ownerId: "user_uid",
  empresa: "HOTEL_MARRIOTT",
  configuration: {
    type: "salon",
    screenId: "1"
  },
  userData: { /* datos del usuario */ }
}
```

---

## 🌤️ Datos de Clima

La app debe obtener clima usando la ciudad configurada.

**API**: WeatherAPI.com
**Key**: Variable de entorno `NEXT_PUBLIC_WEATHER_API_KEY`

```javascript
const response = await fetch(
  `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}&lang=es`,
);
```

---

## 📋 Checklist de Implementación

### Para cada tipo de pantalla:

- [ ] Suscribirse a colección de Template correspondiente
- [ ] Filtrar datos por `empresa`
- [ ] Implementar `onSnapshot` para actualizaciones en tiempo real
- [ ] Cargar fuentes de Google Fonts según `fontStyle`
- [ ] Aplicar colores de `templateColor` y `fontColor`
- [ ] Cargar logo desde `logoUrl`

### General:

- [ ] Implementar heartbeat cada 30 segundos
- [ ] Cachear videos localmente para mejor rendimiento
- [ ] Manejar pérdida de conexión (mostrar último contenido)
- [ ] Soportar orientación horizontal y vertical

---

## 🔗 Resumen de Colecciones

| Pantalla    | Config Template       | Contenido     | Publicidad             |
| ----------- | --------------------- | ------------- | ---------------------- |
| Salón       | `TemplateSalon`       | `eventos`     | `publicidadSalon`      |
| Directorio  | `TemplateDirectorio`  | `eventos`     | `publicidadDirectorio` |
| Tarifario   | `TemplateTarifario`   | (en template) | `publicidadTarifario`  |
| Vuelos      | -                     | `flightData`  | -                      |
| Promociones | `TemplatePromociones` | (en template) | -                      |

---

_Última actualización: 2026-01-07_
