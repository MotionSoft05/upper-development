# 📺 Guía para Dashboard Web - Cómo Funciona la App TV

> Documentación para el equipo de Dashboard Web sobre cómo la App Android TV consume y procesa los datos

---

## 🎯 Resumen Ejecutivo

La **UpperDS TV App** es una aplicación Android TV construida con **Expo/React Native** que:

1. Se vincula mediante un código de 6 caracteres
2. Escucha cambios en Firestore con `onSnapshot` (tiempo real)
3. Cachea medios localmente para reducir bandwidth
4. Muestra contenido según la configuración del Dashboard

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA TV APP                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   FIREBASE                         APP TV                           │
│   ───────                          ──────                           │
│                                                                     │
│   Firestore ──────────────────►  DeviceCodeService                 │
│   (onSnapshot)                   (Gestiona vinculación)            │
│                                         │                           │
│                                         ▼                           │
│                                  TemplateManager                    │
│                                  (Selecciona template visual)       │
│                                         │                           │
│   Storage ────────────────────►  CacheManager                       │
│   (videos, imágenes)             (Descarga y cachea localmente)    │
│                                         │                           │
│                                         ▼                           │
│                                  [PSTemplate1/PPTemplate1/etc]      │
│                                  (Renderiza contenido)              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📱 Stack Tecnológico

| Tecnología              | Versión | Uso                           |
| ----------------------- | ------- | ----------------------------- |
| Expo SDK                | 53      | Framework principal           |
| React Native            | 0.79.6  | UI Framework                  |
| Expo Router             | 5.x     | Navegación basada en archivos |
| Firebase                | 11.x    | Backend (Firestore, Storage)  |
| NativeWind              | 4.x     | Estilos (Tailwind-like)       |
| React Native Reanimated | 3.x     | Animaciones complejas         |

---

## 🔗 Flujo de Vinculación

### Paso 1: App genera código

```javascript
// DeviceCodeService.js
const code = generateRandomHex(6).toUpperCase(); // Ej: "A3F2E1"
const hardwareId = await getHardwareId(); // ID único del dispositivo

// Crear documento en Firestore
await setDoc(doc(db, 'devices', deviceId), {
  code: code,
  hardwareId: hardwareId,
  status: 'waiting',
  createdAt: serverTimestamp(),
});
```

### Paso 2: Dashboard vincula dispositivo

Cuando el usuario ingresa el código en el Dashboard:

```javascript
// Lo que la App ESPERA recibir en el documento
{
  code: "A3F2E1",
  status: "linked",           // ← Cambió de "waiting" a "linked"
  ownerId: "user_uid_xxx",
  empresa: "HOTEL_MARRIOTT",
  userData: {
    email: "admin@hotel.com",
    nombre: "Juan Pérez"
  }
}
```

### Paso 3: App detecta cambio (onSnapshot)

```javascript
// DeviceCodeService.js - Listener activo
onSnapshot(doc(db, 'devices', deviceId), (snapshot) => {
  const data = snapshot.data();

  if (data.status === 'linked') {
    // Guardar datos localmente
    this.deviceData = data;
    this.empresa = data.empresa;

    // Notificar a suscriptores
    this._notifyDataSubscribers(data);
  }

  if (data.status === 'configured') {
    // Navegar a la pantalla configurada
    const { type, screenId } = data.configuration;
    router.replace(`/pantallas/${type}/${screenId}`);
  }
});
```

### Paso 4: Dashboard configura pantalla

```javascript
// Lo que la App ESPERA para navegar
{
  status: "configured",       // ← Cambió de "linked" a "configured"
  configuration: {
    type: "salon",            // salon | directorio | promociones | vuelos | tarifario
    screenId: "1"             // ID de la pantalla
  }
}
```

---

## 📺 Cómo la App Consume Cada Tipo de Pantalla

### 🎭 Pantallas Salón

**Colecciones que lee**:

- `TemplateSalon` → Configuración visual
- `eventos` → Eventos a mostrar

**Query de eventos**:

```javascript
// app/pantallas/salon/[id].jsx
const q = query(
  collection(db, 'eventos'),
  where('empresa', '==', empresa),
  where('dispositivos', 'array-contains', `salon_${screenId}`)
);

onSnapshot(q, (snapshot) => {
  const eventos = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Filtrar por fecha actual
  const eventosActivos = eventos.filter((e) => e.startDate <= hoy && e.endDate >= hoy);

  setEventos(eventosActivos);
});
```

**Campos que la App USA de eventos**:
| Campo | Uso |
|-------|-----|
| `nombre` / `nombreEvento` | Título del evento |
| `descripcion` | Descripción (si template la muestra) |
| `imagenes[]` | Array de URLs de imágenes |
| `startDate`, `endDate` | Filtrado por fecha |
| `horaInicialSalon`, `horaFinalSalon` | Mostrar horario |
| `ubicacion` / `salonAsignado` | Ubicación del evento |
| `tiempoDeVisualizacion` | Duración de rotación |

**Selección de Template**:

```javascript
// PSTemplateManager.jsx
switch (templateConfig.template) {
  case 'PSTemplate1':
    return <PSTemplate1 {...props} />;
  case 'PSTemplate2':
    return <PSTemplate2 {...props} />;
  case 'PSTemplate3':
    return <PSTemplate3 {...props} />;
  default:
    return <PSTemplate1 {...props} />;
}
```

---

### 📋 Pantallas Directorio

**Colecciones que lee**:

- `TemplateDirectorio` → Configuración visual
- `eventos` → Todos los eventos del día
- `publicidadDirectorio` → Anuncios laterales

**Diferencia con Salón**: Muestra TODOS los eventos de la empresa del día, no solo los asignados a esa pantalla.

```javascript
// Query de eventos para directorio
const q = query(
  collection(db, 'eventos'),
  where('empresa', '==', empresa),
  where('startDate', '<=', hoy),
  where('endDate', '>=', hoy)
);
```

**Campos adicionales que lee**:
| Campo | Uso |
|-------|-----|
| `tipoEvento` | Categoría (Conferencia, Taller, etc.) |
| `salonAsignado` | Mostrar en qué salón es |

---

### 🎨 Pantallas Promociones

**Colección que lee**: `TemplatePromociones`

**Estructura esperada**:

```javascript
{
  empresa: "HOTEL_MARRIOTT",
  pantallaId: 1,
  template: "fullscreen",  // o "3-sections", "split"
  sections: [
    {
      id: "main",
      contents: [
        {
          type: "image",
          url: "https://storage.../promo1.jpg",
          duration: 10,           // Segundos
          fechaInicio: "2026-01-01",
          fechaFinal: "2026-12-31"
        },
        {
          type: "video",
          url: "https://storage.../video1.mp4",
          duration: 30
        }
      ]
    }
  ]
}
```

**Cómo la App procesa contenido**:

```javascript
// app/pantallas/promociones/[id].jsx
// 1. Filtrar por fechas activas
const activeContent = contents.filter((item) => {
  const hoy = new Date();
  const inicio = new Date(item.fechaInicio);
  const final = new Date(item.fechaFinal);
  return hoy >= inicio && hoy <= final;
});

// 2. Cachear medios localmente (reducir bandwidth)
activeContent.forEach((item) => {
  if (item.type === 'video') {
    PromosCacheManager.cachePromoVideo(item.url);
  } else {
    PromosCacheManager.cachePromoImage(item.url);
  }
});

// 3. Rotar contenido
useEffect(() => {
  const timer = setTimeout(() => {
    setCurrentIndex((prev + 1) % activeContent.length);
  }, currentItem.duration * 1000);

  return () => clearTimeout(timer);
}, [currentIndex]);
```

---

### ✈️ Pantallas Vuelos

**Colección que lee**: `flightData`

**Documento ID**: Código del aeropuerto (MEX, GDL, CUN, MTY, PVR)

**Cómo la App procesa vuelos**:

```javascript
// app/pantallas/vuelos/[id].jsx
onSnapshot(doc(db, 'flightData', airport), (snapshot) => {
  const data = snapshot.data();

  // Aplicar filtros
  const filteredDepartures = FlightFirebaseService.applyFilters(data.departures, {
    timeWindow: 5, // Próximas 5 horas
    maxFlights: 12, // Máximo 12 vuelos
    showDepartures: true,
  });

  // Filtrar vuelos expirados (>30 min después de hora)
  const activeDepartures = filteredDepartures.filter((flight) => {
    return !isFlightExpired(flight.scheduledTime);
  });

  setDepartures(activeDepartures);
});
```

**Sistema de expiración automática**:

- La App remueve vuelos 30 minutos después de su hora programada
- Lo hace con animación fade-out
- No depende del Dashboard para esto

---

### 💰 Pantallas Tarifario

**Colección que lee**: `TemplateTarifario`

**Estructura esperada**:

```javascript
{
  empresa: "HOTEL_MARRIOTT",
  pantallaId: 1,
  template: "PTTemplate1Horizontal",
  templateColor: "#1E3A8A",
  fontColor: "#FFFFFF",
  fontStyle: "Inter",
  tarifas: [
    { destino: "Aeropuerto Zona 1", precio: "350.00" },
    { destino: "Aeropuerto Zona 2", precio: "450.00" }
  ]
}
```

La App simplemente renderiza las tarifas como las recibe.

---

## 💾 Sistema de Caché

### Por qué cacheamos

| Sin Caché                 | Con Caché             |
| ------------------------- | --------------------- |
| Descarga 500MB/día        | Descarga 50MB/día     |
| Alto costo Firebase       | 90% menos costos      |
| Lento en conexiones malas | Contenido instantáneo |

### Cómo funciona

```javascript
// CacheManager.js (simplificado)
async getCachedUrl(url) {
  // 1. ¿Está en caché?
  const cached = this.cacheIndex[url];
  if (cached && await this.fileExists(cached.path)) {
    return cached.path; // Retornar archivo local
  }

  // 2. Verificar tamaño (máx 5MB imágenes, 50MB videos)
  const size = await this.checkFileSize(url);
  if (size > MAX_SIZE) {
    return url; // Usar streaming
  }

  // 3. Descargar y cachear
  const localPath = await this.downloadToCache(url);
  return localPath;
}
```

### Límites configurados

| Tipo        | Límite    | Expiración  |
| ----------- | --------- | ----------- |
| Imágenes    | 5 MB máx  | 7 días      |
| Videos      | 50 MB máx | 7 días      |
| Total caché | 500 MB    | LRU cleanup |

---

## 🔄 Heartbeat (Monitoreo de Estado)

La App envía su estado cada 30 segundos:

```javascript
// DeviceCodeService.js
setInterval(async () => {
  await updateDoc(doc(db, 'devices', deviceId), {
    lastSeen: serverTimestamp(),
    currentScreen: {
      type: 'salon',
      id: '1',
    },
  });
}, 30000);
```

**Campos que la App actualiza**:
| Campo | Valor |
|-------|-------|
| `lastSeen` | Timestamp del servidor |
| `currentScreen` | Pantalla actual { type, id } |
| `appVersion` | Versión de la app |

---

## 🎨 Fuentes Soportadas

La App soporta **39 fuentes** configurables desde el Dashboard:

### Fuentes del Sistema (13)

Arial, Courier New, Georgia, Times New Roman, Trebuchet MS, Verdana, Comic Sans MS, Impact, Lucida Console, Tahoma, Segoe UI, Roboto, San Francisco

### Google Fonts (26)

Bebas Neue, Cabin, Crimson Text, Cormorant, Dancing Script, Dosis, Exo, Fira Sans, Josefin Sans, Lato, Merriweather, Montserrat, Mulish, Nunito, Noticia Text, Open Sans, Oswald, Pacifico, Playfair Display, Poppins, Quicksand, Raleway, Roboto, Source Sans Pro, Ubuntu, Varela Round

**Cómo aplicar**: El campo `fontStyle` del template se mapea a la fuente correcta.

---

## ⚠️ Campos REQUERIDOS por la App

### Para dispositivos (`devices`)

```javascript
{
  code: string,              // REQUERIDO
  status: string,            // REQUERIDO: 'waiting' | 'linked' | 'configured'
  empresa: string,           // REQUERIDO para queries
  configuration: {           // REQUERIDO para navegación
    type: string,
    screenId: string
  }
}
```

### Para eventos (`eventos`)

```javascript
{
  empresa: string,           // REQUERIDO para filtrar
  startDate: string,         // REQUERIDO: "YYYY-MM-DD"
  endDate: string,           // REQUERIDO: "YYYY-MM-DD"
  nombre: string,            // Título del evento
  imagenes: string[],        // Array de URLs
  dispositivos: string[]     // Array: ["salon_1", "direc_1"]
}
```

### Para templates (`Template*`)

```javascript
{
  empresa: string,           // REQUERIDO
  template: string,          // REQUERIDO: nombre del template
  templateColor: string,     // Color de fondo
  fontColor: string,         // Color de texto
  fontStyle: string,         // Nombre de la fuente
  logo: string               // URL del logo
}
```

---

## 🐛 Debugging

### Logs importantes que genera la App

```
🔑 [DeviceCode] Código generado: A3F2E1
🔄 [DeviceCode] Status cambió a: linked
📺 [Navigation] Navegando a: /pantallas/salon/1
📥 [CacheManager] Descargando: imagen1.jpg (2.5 MB)
✅ [CacheManager] Cacheado: imagen1.jpg
⚠️ [CacheManager] Archivo muy grande, usando streaming: video.mp4 (120 MB)
```

### Errores comunes

| Error                | Causa                       | Solución                                 |
| -------------------- | --------------------------- | ---------------------------------------- |
| "No empresa found"   | Falta campo `empresa`       | Verificar documento del dispositivo      |
| "Template not found" | Template inválido           | Usar nombres válidos (PSTemplate1, etc.) |
| "Cannot parse date"  | Formato de fecha incorrecto | Usar formato "YYYY-MM-DD"                |

---

## 📞 Contacto

Para preguntas sobre la App TV, consultar:

- Esta documentación
- `docs/QUICK-START-GUIDE.md`
- `docs/architecture/ARCHITECTURE-OVERVIEW.md`

---

_Última actualización: 2026-01-07_
