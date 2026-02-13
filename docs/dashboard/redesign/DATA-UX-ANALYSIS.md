# Análisis de Datos y Propuesta de Rediseño UX (Dashboard)

## 1. Análisis de Situación Actual

### Estructura de Datos (Promociones vs. Tarifario)

Actualmente existen dos modelos de datos paralelos y desconectados para funciones similares (mostrar contenido multimedia):

| Característica    | Promociones (`TemplatePromociones`)                                  | Tarifario (`pantallasTarifario`)             |
| :---------------- | :------------------------------------------------------------------- | :------------------------------------------- |
| **Estructura**    | Anidada: `pantallasConfig` > `promoN` > `sections` > `N` > `content` | Plana: Campo `publicidad` (array de objetos) |
| **Contenido**     | Imágenes y Videos                                                    | Solo Imágenes                                |
| **Programación**  | Fechas Start/End por item, duración individual                       | Duración (H/M/S) por item                    |
| **Configuración** | Mezclada (fonts globales, templates por promo)                       | Mezclada al mismo nivel                      |
| **Flexibilidad**  | Rígida (`promo1`, `promo2` hardcoded)                                | Rígida (array único)                         |

**Problemas Detectados:**

1.  **Redundancia:** Si el cliente quiere usar la misma imagen en Promociones y Tarifario, debe subirla y configurarla dos veces.
2.  **Inconsistencia:** Tarifario no soporta video ni programación por fechas, limitando su potencial comercial.
3.  **Escalabilidad:** La estructura `promo1`, `promo2`... en un mapa hace difícil agregar pantallas dinámicamente sin cambiar el código.
4.  **UX Fragmentada:** El usuario configura "Publicidad" en Tarifario de una forma y "Contenido" en Promociones de otra totalmente distinta.

---

## 2. Propuesta de Nueva Estructura de Datos

El objetivo es desacoplar el **Contenido** (Qué mostrar) de la **Pantalla** (Dónde mostrarlo).

### A. Colección `MediaAssets` (Biblioteca Central)

Un repositorio único de archivos subidos.

```json
{
  "id": "uuid",
  "empresaId": "empresa123",
  "type": "image" | "video",
  "url": "firebase_url",
  "thumbnail": "thumb_url",
  "metadata": {
    "width": 1920,
    "height": 1080,
    "duration": 15, // seg
    "size": 102400
  },
  "uploadDate": "timestamp"
}
```

### B. Colección `Playlists` (Secuencias de Contenido)

Listas ordenadas de assets con reglas de reproducción. Reutilizables.

```json
{
  "id": "playlist_uuid",
  "name": "Campaña Verano 2026",
  "empresaId": "empresa123",
  "items": [
    {
      "assetId": "asset_uuid", // Referencia a MediaAsset
      "duration": 10,
      "schedule": {
        "startDate": "2026-01-01",
        "endDate": "2026-03-01",
        "daysOfWeek": [1, 2, 3, 4, 5], // L-V
        "startTime": "08:00",
        "endTime": "18:00"
      }
    }
  ]
}
```

### C. Colección `Screens` (Configuración de Pantalla)

Configuración física y lógica de cada dispositivo.

```json
{
  "id": "screen_uuid",
  "name": "TV Recepción",
  "type": "promociones" | "tarifario" | "vuelos",
  "empresaId": "empresa123",
  "hardwareId": "mac_address", // Para vinculación futura
  "config": {
    "orientation": "landscape", // o "portrait"
    "resolution": "1920x1080",
    "theme": {
        "fontFamily": "Roboto",
        "primaryColor": "#000000",
        "backgroundColor": "#ffffff"
    },
    "widgets": {
        "weather": { "city": "CDMX", "enabled": true },
        "clock": { "format": "24h", "enabled": true },
        "news": { "source": "rss", "enabled": false }
    }
  },
  // La clave: Asignación de Zonas
  "layout": {
    "templateId": "layout_3_zones", // O un ID de template
    "zones": {
      "main": { "playlistId": "playlist_verano" }, // Referencia a Playlist
      "sidebar": { "playlistId": "playlist_ofertas" },
      "ticker": { "text": "Bienvenido a Upper..." }
    }
  }
}
```

---

## 3. Rediseño UX del Dashboard

Para resolver la fricción actual ("muchos clics", "configuraciones separadas"), propongo un flujo basado en objetos en lugar de pantallas monolíticas.

### Nueva Arquitectura de Información

1.  **Biblioteca Multimedia (Assets)**
    - Subir, organizar y etiquetar fotos/videos.
    - Ver metadatos.
    - _Beneficio:_ Subes el logo una vez, lo usas en 10 pantallas.

2.  **Gestor de Playlists**
    - Crear listas de reproducción.
    - Arrastrar y soltar assets.
    - Definir calendarios y horarios aquí.
    - _Beneficio:_ Cambias la promo en la Playlist y se actualiza en todas las pantallas vinculadas automáticamente.

3.  **Mis Pantallas (Device Manager)**
    - Lista de pantallas activas con status (Online/Offline).
    - Botón "Configurar".

### Flujo de Edición "Todo en Uno" (Screen Editor)

Cuando el usuario entra a configurar una pantalla (ej. "Promociones Lobby"), ve una interfaz unificada con 3 paneles o pestañas:

#### Panel A: Layout y Diseño

- Selector visual de Template (1 zona, 3 zonas, etc.).
- Ajustes de Tema (Fuentes, Colores).
- Preview en tiempo real (lado derecho o central).

#### Panel B: Contenido (Zonas)

- Muestra las "Zonas" disponibles según el template elegido.
- Dropdown para asignar una **Playlist** existente a cada zona.
- Opción rápida "Crear nueva playlist" (modal).

#### Panel C: Ajustes Dispositivo

- Nombre, Ubicación, Horarios de encendido/apagado.
- Widgets (Clima, Reloj).

---

## 4. Estrategia de Implementación Progresiva

Dado que no podemos detener el sistema actual:

1.  **Fase 1: Refactor UI (Frontend only)**
    - Mantener la estructura de datos actual de Firebase al guardar/leer.
    - Pero en la UI, consolidar los formularios dispersos en el nuevo "Screen Editor" unificado.
    - Simular la separación de playlists visualmente, aunque por debajo se guarde en `promo1`.

2.  **Fase 2: Migración de Datos**
    - Crear las nuevas colecciones (`MediaAssets`, `Playlists`).
    - Script para migrar datos existentes (`TemplatePromociones` -> `Playlists`).

3.  **Fase 3: Switch completo**
    - Actualizar las Apps de TV para leer la nueva estructura `Screens` + `Playlists`.

**Recomendación Inmediata:**
Comenzar con la **Fase 1**. Rediseñar `PantallasPromociones.jsx` para que use este nuevo paradigma de UX (Editor visual + Pestañas lógicas), pero adaptando la lógica de guardado (adapters) para que siga escribiendo en `TemplatePromociones` por ahora. Esto mejora la experiencia del usuario YA, sin romper las TVs existentes.

---

## 5. Análisis Pantalla por Pantalla

### A. Pantallas de Vuelos (`PantallasVuelos.jsx`)

**Diagnóstico Actual:**
La pantalla de vuelos sigue un patrón similar a Promociones pero con datos específicos de API.

| Característica     | Implementación Actual (`TemplateVuelos`)                                                                                                                                                                          |
| :----------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Configuración**  | Centralizada en un doc por empresa. Mapa `pantallasConfig` > `vueloN`.                                                                                                                                            |
| **Datos Externos** | Depende de APIs (OpenSky/AviationStack) configuradas en Backend.                                                                                                                                                  |
| **Layout**         | Rígido: Lista de Salidas/Llegadas. Opciones limitadas (mostrar/ocultar columnas).                                                                                                                                 |
| **Integraciones**  | `MensajesDinamicos` (Ticker), Clima (vía `selectedCity`), Tráfico (Google Maps).                                                                                                                                  |
| **Problema UX**    | La configuración de "Mensajes Dinámicos" está en una pestaña separada, desconectada de la visualización de la pantalla. El usuario no ve cómo quedará el mensaje en la pantalla hasta que lo guarda y mira la TV. |

**Oportunidad en Nuevo Modelo:**

- **Vuelos como Widget**: En el nuevo "Screen Editor", el componente de Vuelos sería un "Widget Principal" asignable a la zona central.
- **Mensajes como Contenido**: Los mensajes dinámicos son esencialmente una **Playlist de Texto**. Deberían gestionarse igual que las imágenes, asignándose a la zona "Ticker" o "Footer" del layout.
-

* **Unificación de Configuración**: La ubicación del hotel (para Distance Matrix) y la ciudad (para Clima) deberían ser propiedades de la **Pantalla Física** o del **Edificio/Sede**, no repetirse en cada módulo (Vuelos, Directorio, etc.).

### B. Pantallas de Directorio (`PantallasDirectorio.jsx`)

**Diagnóstico Actual:**
Esta pantalla muestra listados de inquilinos/locales más publicidad lateral.

| Característica         | Implementación Actual (`TemplateDirectorios`)                                                                                                                           |
| :--------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Configuración**      | Centralizada por empresa.                                                                                                                                               |
| **Publicidad**         | **Muy limitada:** Solo permite 1 imagen `publicidadLandscape` y 1 `publicidadPortrait` para TODAS las pantallas de directorio de la empresa.                            |
| **Datos Ineficientes** | Al guardar, intenta actualizar el nombre de las pantallas en **todos los documentos de usuario** de esa empresa. Alta latencia de escritura y riesgo de inconsistencia. |
| **Personalización**    | Permite elegir Logo, Colores, Fuente y Template (Layout).                                                                                                               |

**Problema Crítico:**
Si un edificio quiere tener publicidades diferentes en el Lobby que en el Piso 10, la arquitectura actual no lo permite (es un campo único global).

**Oportunidad en Nuevo Modelo:**

- **Playlists por Zona:** Permitir asignar una Playlist a la zona de publicidad. Esto habilita que diferentes pantallas tengan diferentes anuncios.
- **Gestión Centralizada de Tenants:** Los datos del directorio (nombres, logos de empresas) deberían estar en una colección `DirectoryData` separada de la configuración visual de la pantalla.

### C. Eventos y Salones (`consultaModEventos.jsx` y `pantallasSalon.jsx`)

**Diagnóstico Actual:**
Este módulo se divide en dos: la gestión de la agenda (Eventos) y la configuración visual de la pantalla de la puerta (Salones).

| Característica           | Implementación Actual                                                                                                                                                                                                                                                                |
| :----------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Flujo de Trabajo**     | **Content-First:** Creas el evento y le asignas pantallas (`devices`). Esto es correcto y diferente a las otras pantallas.                                                                                                                                                           |
| **Configuración Visual** | Global para toda la empresa (`TemplateSalones`). Incluye logo, colores, fuentes.                                                                                                                                                                                                     |
| **Duplicación de Datos** | **Crítico:** Al guardar la configuración visual en `PantallasSalon`, el código itera sobre **todos los eventos** de la empresa y les inyecta una copia de la configuración (`personalizacionTemplate`). Esto hace que cambiar un logo sea una operación pesada y propensa a errores. |
| **Segmentación**         | No permite estilos diferentes para diferentes salones (ej: Salón VIP vs Salón General).                                                                                                                                                                                              |

**Oportunidad en Nuevo Modelo:**

- **Separación Estricta:** La configuración visual (Template/Logo) debe estar en el objeto `Screen` (o `Playlist`). El objeto `Event` solo debe tener datos del evento.
- **Eliminar Duplicidad:** La TV debe leer el estilo de la configuración de la pantalla y el contenido de la colección de eventos, haciendo merge en tiempo real, no guardando copias estáticas.
- **Playlists Inteligentes:** Una "Playlist de Eventos" podría ser una regla dinámica: "Mostrar eventos donde `room == 'Salon A'`".

### D. Monitor de Estado (`MonitorScreen.jsx`)

**Diagnóstico Actual:**
Este componente lee la colección `heartbeats`, donde las TVs reportan su actividad.

| Característica       | Implementación Actual                                                                                                                                                                                      |
| :------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Fuente de Verdad** | Colección `heartbeats` (escrita por las TVs).                                                                                                                                                              |
| **Datos**            | `deviceName`, `screenId`, `screenType`, `lastActivity`.                                                                                                                                                    |
| **Desconexión**      | La conexión entre la "Configuración Lógica" (ej: `TemplatePromociones`) y el "Dispositivo Físico" (`heartbeats`) es implícita y débil, basada a veces en nombres o índices numéricos (`promo1`, `vuelo2`). |

**El Eslabón Perdido:**
No existe un "Device Registration" real. El sistema asume que si configuras la pantalla #1 en Promociones, y la TV dice ser la pantalla #1, entonces hacen match. Esto falla si cambias una TV, o si quieres mover una TV de Promociones a Vuelos sin reconfigurarla físicamente.

### E. Backend de Vuelos y Admin (`flightService.js` y `AdminAPIMonitor.jsx`)

**Diagnóstico Actual:**

- **Multi-API Robusto:** El servicio `flightService.js` maneja fallbacks entre OpenSky, AviationStack y AeroDataBox correctamente.
- **Datos Tiered:** Normaliza datos de múltiples fuentes.
- **Control Admin:** `AdminAPIMonitor.jsx` permite encender/apagar polling por aeropuerto para ahorrar costos.

**Desconexión Frontend-Backend:**

- **Hardcoding:** Las coordenadas y códigos de aeropuertos están hardcodeados en el backend (`this.airportCoords`).
- **Validación:** Un usuario puede configurar el aeropuerto "MTY" en el Dashboard, pero si el Admin lo tiene desactivado en `AdminAPIMonitor`, no habrá datos y el usuario no sabrá por qué.
- **Falta feedback:** El widget de vuelos no consulta el estado del servicio ("¿Hay datos para MTY?") antes de intentar renderizar.

---

## 6. Conclusión y Nuevo Flujo Unificado

El análisis confirma que la fragmentación actual (`TemplatePromociones`, `TemplateVuelos`, `TemplateDirectorios`, `Eventos`) impide una experiencia de usuario fluida y escalable.

**El Nuevo Flujo "Todo en Uno" del Screen Editor:**

1.  **Biblioteca Multimedia (Global):** Subes tus logos, videos y fondos una vez (ya no repetido por módulo).
2.  **Playlist Builder (Lógica):** Creas listas de reproducción (de imágenes, de vuelos, de directorio).
3.  **Screen Editor (Visual):**
    - Seleccionas un **Layout** (Ej: "Principal + Barra lateral").
    - Arrastras la **Playlist de Vuelos** a la zona Principal.
    - Arrastras la **Playlist de Publicidad** a la barra lateral.
    - Personalizas colores y tema.
4.  **Device Matrix (Físico):** Asignas esa configuración a un grupo de pantallas físicas (detectadas vía `heartbeats`).

Este flujo elimina el 90% de la redundancia actual y unifica la experiencia en una sola interfaz potente.
