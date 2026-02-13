# Mockup Visual: Nuevo Dashboard UpperDS
> Archivo generado por Claude durante auditoría técnica
> Revisión: v1.1 — Actualizado para incluir sección Publicidad

---

## 1. ESTRUCTURA ACTUAL vs PROPUESTA

### Estado Actual (Siloed)
```
┌─────────────────────────────────────────────────────────────────┐
│  SIDEBAR ACTUAL                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [🏠] Dashboard                                                 │
│                                                                 │
│  ─── PANTALLAS ───                                              │
│  [📺] Pantallas Vuelos        ← Config aislada, datos propios   │
│  [📺] Pantallas Promociones   ← Config aislada, datos propios   │
│  [📺] Pantallas Directorio    ← Config aislada, datos propios   │
│  [📺] Pantallas Salón         ← Config aislada, datos propios   │
│  [📺] Pantallas Tarifario     ← Config aislada, datos propios   │
│                                                                 │
│  ─── CONTENIDO ───                                              │
│  [📅] Alta de Eventos                                           │
│  [📋] Consulta de Eventos                                       │
│  [💬] Mensajes Dinámicos                                        │
│  [📢] Publicidad              ← EXISTE pero NO en sidebar!      │
│                                                                 │
│  ─── SISTEMA ───                                                │
│  [📱] Dispositivos                                              │
│  [🔗] Vincular Dispositivo                                      │
│  [📊] Monitor de Pantallas                                      │
│                                                                 │
│  ─── ADMIN ───                                                  │
│  [⚙️] API Monitor                                               │
│  [📄] Licencia                                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

PROBLEMAS IDENTIFICADOS:
1. Cada "Pantallas X" es un mundo aparte
2. No hay reutilización de contenido
3. Para cambiar logo → 5 lugares diferentes
4. PUBLICIDAD existe en código pero no aparece en sidebar
5. Publicidad fragmentada en 7 archivos diferentes
```

---

### Estado Propuesto (Unified)
```
┌─────────────────────────────────────────────────────────────────┐
│  SIDEBAR NUEVO                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [🏠] Dashboard                                                 │
│                                                                 │
│  ─── CONTENIDO ─── (Primero el contenido)                       │
│  [🖼️] Biblioteca Multimedia   ← NUEVO: Assets centralizados     │
│  [▶️] Playlists               ← ACTIVAR: Ya existe en código    │
│  [📅] Eventos                 ← Unificado (Alta + Consulta)     │
│  [💬] Mensajes                ← Se mantiene                     │
│                                                                 │
│  ─── PANTALLAS ─── (Luego dónde mostrar)                        │
│  [🖥️] Editor de Pantallas    ← NUEVO: Unificado para TODOS      │
│  [📊] Monitor en Vivo         ← Se mantiene                     │
│                                                                 │
│  ─── DISPOSITIVOS ───                                           │
│  [📱] Mis Dispositivos        ← Unificado (Lista + Vincular)    │
│                                                                 │
│  ─── PROGRAMACIÓN ───                                           │
│  [📆] Calendario/Scheduler    ← NUEVO: Override por horarios    │
│                                                                 │
│  ─── CONFIGURACIÓN ───                                          │
│  [⚙️] API Monitor             ← Solo Admin                      │
│  [🏢] Mi Empresa              ← Logo, colores, fuentes GLOBAL   │
│  [📄] Licencia                                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

NOTA IMPORTANTE: ¿Dónde está Publicidad?
══════════════════════════════════════════
Publicidad se UNIFICA dentro de Playlists.
"Publicidad" = "Playlist de Fallback" asignada a cada pantalla.

BENEFICIO: Flujo lógico Contenido → Pantalla → Dispositivo → Horario
           Reutilización total de assets y playlists.
           Publicidad es solo otra playlist, no un módulo separado.
```

---

## 2. PUBLICIDAD: ANTES Y DESPUÉS

### Situación Actual (Fragmentada)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PUBLICIDAD ACTUAL - 7 ARCHIVOS SEPARADOS                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  publicidad.jsx ───────────────► Wrapper simple                             │
│         │                                                                   │
│         ▼                                                                   │
│  PublicidadCombinada.jsx ─────► Componente principal (605 líneas)           │
│         │                       - Lista de publicidades                     │
│         │                       - Formulario de creación                    │
│         │                       - Asignación a pantallas                    │
│         │                                                                   │
│         ├──► publicidadDirec.jsx ──► Publicidad específica Directorio       │
│         │                                                                   │
│         └──► publicidadSalon.jsx ──► Publicidad específica Salón            │
│                                                                             │
│  PlaylistManager.jsx ─────────► "En desarrollo, no disponible"              │
│                                  (Concepto correcto, desactivado)           │
│                                                                             │
│  SLIDERS (Display en TV):                                                   │
│  ├── sliderPublicidadPD.jsx ───► Slider para Pantalla Directorio            │
│  ├── sliderPublicidadPS.jsx ───► Slider para Pantalla Salón                 │
│  └── sliderPublicidadTarifario.jsx ► Slider para Tarifario                  │
│                                                                             │
│  PROBLEMA: El usuario debe configurar publicidad en múltiples lugares       │
│            dependiendo del tipo de pantalla que quiera.                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Situación Propuesta (Unificada)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PUBLICIDAD NUEVA - INTEGRADA EN PLAYLISTS                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  PLAYLISTS (Un solo lugar para todo)                                │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │                                                                     │    │
│  │  ▶️ Promociones Verano 2026      │ Tipo: Contenido  │ Prioridad 10 │    │
│  │  ▶️ Bienvenida Congreso          │ Tipo: Override   │ Prioridad 50 │    │
│  │  ▶️ Publicidad General           │ Tipo: FALLBACK   │ Prioridad 0  │    │
│  │  ▶️ Publicidad Restaurante       │ Tipo: FALLBACK   │ Prioridad 0  │    │
│  │  ▶️ Publicidad Navidad           │ Tipo: FALLBACK   │ Prioridad 0  │    │
│  │                                                                     │    │
│  │  [+ Nueva Playlist]                                                 │    │
│  │                                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  BENEFICIO: "Publicidad" es simplemente una Playlist con Prioridad 0        │
│             Se configura UNA vez, se usa en TODAS las pantallas             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. BIBLIOTECA MULTIMEDIA (Media Library)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🖼️ BIBLIOTECA MULTIMEDIA                                    [+ Subir]     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Filtros: [Todos ▼] [Imágenes] [Videos] [Logos] [Publicidad]  🔍 Buscar... │
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │             │  │             │  │             │  │             │        │
│  │   🖼️        │  │   🖼️        │  │   🎬        │  │   🖼️        │        │
│  │  Promo      │  │  Banner     │  │  Video      │  │  Logo       │        │
│  │  Verano     │  │  Ofertas    │  │  Bienvenida │  │  Empresa    │        │
│  │             │  │             │  │             │  │             │        │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤  ├─────────────┤        │
│  │ 1920x1080   │  │ 1920x1080   │  │ 1080p 15s   │  │ 500x500     │        │
│  │ Usado en: 3 │  │ Usado en: 1 │  │ Usado en: 5 │  │ Usado en: 8 │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │             │  │             │  │             │  │             │        │
│  │   🎬        │  │   🖼️        │  │   🖼️        │  │    ╋        │        │
│  │  Tour       │  │  Menú       │  │  Spa        │  │             │        │
│  │  Virtual    │  │  Rest.      │  │  Promo      │  │  + Subir    │        │
│  │             │  │             │  │             │  │    Nuevo    │        │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤  ├─────────────┤        │
│  │ 1080p 45s   │  │ 1080x1920   │  │ 1920x1080   │  │             │        │
│  │ Usado en: 2 │  │ Usado en: 1 │  │ Usado en: 0 │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                             │
│  ────────────────────────────────────────────────────────────────────────   │
│  📊 Total: 47 archivos | 📦 Almacenamiento: 2.3 GB de 10 GB               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

CONCEPTO: Un solo lugar para TODOS los archivos.
          "Usado en: X" muestra cuántas playlists/pantallas lo usan.
          Subir una vez → Usar en todas partes.

          Assets de PUBLICIDAD viven aquí junto con todo lo demás.
```

---

## 4. PLAYLIST BUILDER

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ▶️ PLAYLISTS                                           [+ Nueva Playlist]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ 📋 Mis Playlists                                                      │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │                                                                       │  │
│  │  ▶️ Promociones Verano 2026   │ 5 items │ 2:30 min │ Usado en: 3     │  │
│  │     Tipo: Contenido           │ Prioridad: 10                        │  │
│  │                                                                       │  │
│  │  ▶️ Bienvenida Congreso       │ 2 items │ 1:00 min │ Usado en: 1     │  │
│  │     Tipo: Override            │ Prioridad: 50                        │  │
│  │                                                                       │  │
│  │  ▶️ Loop Institucional        │ 8 items │ 4:00 min │ Usado en: 5     │  │
│  │     Tipo: Contenido           │ Prioridad: 10                        │  │
│  │                                                                       │  │
│  │  ───────────────────────────────────────────────────────────────────  │  │
│  │  📢 PLAYLISTS DE PUBLICIDAD (Fallback)                                │  │
│  │  ───────────────────────────────────────────────────────────────────  │  │
│  │                                                                       │  │
│  │  ▶️ Publicidad General        │ 6 items │ 1:30 min │ Fallback: 8     │  │
│  │     Tipo: FALLBACK            │ Prioridad: 0     ◄── Siempre mínima  │  │
│  │                                                                       │  │
│  │  ▶️ Publicidad Restaurante    │ 3 items │ 0:45 min │ Fallback: 2     │  │
│  │     Tipo: FALLBACK            │ Prioridad: 0                         │  │
│  │                                                                       │  │
│  │  ▶️ Publicidad Spa            │ 4 items │ 1:00 min │ Fallback: 1     │  │
│  │     Tipo: FALLBACK            │ Prioridad: 0                         │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

                              ↓ Click en "Publicidad General"

┌─────────────────────────────────────────────────────────────────────────────┐
│  ▶️ EDITOR DE PLAYLIST: Publicidad General                        [Guardar] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Tipo de Playlist: [● Fallback/Publicidad  ○ Contenido  ○ Override]        │
│                                                                             │
│  ┌─────────────────────────────┐    ┌─────────────────────────────────────┐ │
│  │  📚 BIBLIOTECA              │    │  📋 CONTENIDO DE LA PLAYLIST        │ │
│  │  (Drag & Drop desde aquí)   │    │  (Soltar aquí, reordenar)           │ │
│  ├─────────────────────────────┤    ├─────────────────────────────────────┤ │
│  │                             │    │                                     │ │
│  │  ┌─────┐ ┌─────┐ ┌─────┐   │    │  1. ┌─────┐ Promo Spa        15s    │ │
│  │  │ 🖼️  │ │ 🖼️  │ │ 🎬  │   │    │     │ 🖼️  │ Siempre          [≡][✕]│ │
│  │  │     │ │     │ │     │   │    │     └─────┘                         │ │
│  │  └─────┘ └─────┘ └─────┘   │    │                                     │ │
│  │  Spa     Buffet  Video1    │    │  2. ┌─────┐ Video Servicios   30s   │ │
│  │                             │    │     │ 🎬  │ Siempre          [≡][✕]│ │
│  │  ┌─────┐ ┌─────┐ ┌─────┐   │    │     └─────┘                         │ │
│  │  │ 🖼️  │ │ 🖼️  │ │ 🖼️  │   │    │                                     │ │
│  │  │     │ │     │ │     │   │    │  3. ┌─────┐ Oferta Restaurant 15s   │ │
│  │  └─────┘ └─────┘ └─────┘   │    │     │ 🖼️  │ Siempre          [≡][✕]│ │
│  │  Rest.   Pool    Gym       │    │     └─────┘                         │ │
│  │                             │    │                                     │ │
│  │         ───────────         │    │  4. ┌─────┐ Promo Pool       15s   │ │
│  │    Arrastra para agregar    │    │     │ 🖼️  │ Siempre          [≡][✕]│ │
│  │             →               │    │     └─────┘                         │ │
│  │                             │    │                                     │ │
│  └─────────────────────────────┘    │  5. ┌─────┐ Promo Gym        10s   │ │
│                                      │     │ 🖼️  │ Siempre          [≡][✕]│ │
│                                      │     └─────┘                         │ │
│                                      │                                     │ │
│                                      │  6. ┌─────┐ Descuento Spa   10s   │ │
│                                      │     │ 🖼️  │ Siempre          [≡][✕]│ │
│                                      │     └─────┘                         │ │
│                                      │                                     │ │
│                                      │  ─────────────────────────────────  │ │
│                                      │  Total: 6 items | Duración: 1:35    │ │
│                                      └─────────────────────────────────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  INFO: Esta playlist se mostrará automáticamente cuando no haya        ││
│  │  contenido programado en las pantallas que la tengan asignada.         ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

CONCEPTO: Publicidad es simplemente una Playlist marcada como "Fallback".
          Se crea igual que cualquier otra playlist.
          La diferencia es que se activa cuando NO hay otro contenido.
```

---

## 5. EDITOR DE PANTALLAS (Con Fallback/Publicidad)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🖥️ EDITOR DE PANTALLAS                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  MIS PANTALLAS                                                         │ │
│  ├────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                        │ │
│  │  🖥️ Lobby Principal    │ Layout: Vuelos+Sidebar │ Fallback: Pub.Gen. │ │
│  │  🖥️ Restaurante        │ Layout: Fullscreen     │ Fallback: Pub.Rest │ │
│  │  🖥️ Sala de Espera     │ Layout: 3 Zonas        │ Fallback: Pub.Gen. │ │
│  │  🖥️ Entrada Salón A    │ Layout: Eventos        │ Fallback: Pub.Gen. │ │
│  │  🖥️ Pasillo Hab.       │ Layout: Directorio     │ Fallback: Pub.Gen. │ │
│  │                                                                        │ │
│  │                                              [+ Agregar Nueva Pantalla]│ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

                              ↓ Click en "Lobby Principal"

┌─────────────────────────────────────────────────────────────────────────────┐
│  🖥️ CONFIGURAR: Lobby Principal                          [Guardar] [Vista] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─ PASO 1: ELEGIR LAYOUT ─────────────────────────────────────────────────┐│
│  │                                                                         ││
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       ││
│  │  │█████████│  │███│     │  │██│  │  │  │█████████│  │███│█████│       ││
│  │  │█████████│  │███│█████│  │██│██│██│  │█████████│  │███│█████│       ││
│  │  │█████████│  │███│█████│  │██│██│██│  │─────────│  │███│█████│       ││
│  │  │█████████│  │███│█████│  │██│██│██│  │▓▓▓▓▓▓▓▓▓│  │███│█████│       ││
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘       ││
│  │  Fullscreen   L-Sidebar    3 Columnas   Con Ticker   L-Invertida       ││
│  │                  ✓                                                      ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  ┌─ PASO 2: ASIGNAR CONTENIDO A ZONAS ─────────────────────────────────────┐│
│  │                                                                         ││
│  │   PREVIEW EN VIVO                      │   CONFIGURACIÓN               ││
│  │  ┌─────────────────────────────────┐   │                               ││
│  │  │            │                    │   │   ZONA A (Sidebar):           ││
│  │  │   ZONA A   │                    │   │   ┌─────────────────────────┐ ││
│  │  │  Sidebar   │      ZONA B        │   │   │ Widget: Clima + Reloj  ▼│ ││
│  │  │            │    (Principal)     │   │   └─────────────────────────┘ ││
│  │  │  ┌──────┐  │                    │   │                               ││
│  │  │  │ 🌤️   │  │   ┌────────────┐   │   │   ZONA B (Principal):         ││
│  │  │  │ 24°C │  │   │            │   │   │   ┌─────────────────────────┐ ││
│  │  │  │      │  │   │  ✈️ VUELOS  │   │   │   │ Widget: Vuelos MEX    ▼│ ││
│  │  │  │ 10:30│  │   │  MEX → CUN │   │   │   └─────────────────────────┘ ││
│  │  │  └──────┘  │   │  AA 1234   │   │   │   ┌─────────────────────────┐ ││
│  │  │            │   │  10:45     │   │   │   │ Playlist: Loop Promo  ▼│ ││
│  │  │  ┌──────┐  │   │  ...       │   │   │   └─────────────────────────┘ ││
│  │  │  │ 🖼️   │  │   │            │   │   │   Modo: [●Alternar ○Solo Vuel]││
│  │  │  │Promo │  │   └────────────┘   │   │                               ││
│  │  │  └──────┘  │                    │   │                               ││
│  │  │            │                    │   │                               ││
│  │  └─────────────────────────────────┘   │                               ││
│  │                                         │                               ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  ┌─ PASO 3: FALLBACK / PUBLICIDAD ─────────────────────────────────────────┐│
│  │                                                                         ││
│  │  Cuando no hay contenido activo en alguna zona, mostrar:                ││
│  │                                                                         ││
│  │  Playlist de Fallback: [Publicidad General ▼]                           ││
│  │                                                                         ││
│  │  ┌─────────────────────────────────────────────────────────────────┐   ││
│  │  │ PREVIEW: Publicidad General                                     │   ││
│  │  │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                │   ││
│  │  │ │ 🖼️  │ │ 🎬  │ │ 🖼️  │ │ 🖼️  │ │ 🖼️  │ │ 🖼️  │  6 items      │   ││
│  │  │ │ Spa │ │Serv.│ │Rest.│ │Pool │ │ Gym │ │Desc.│  1:35 total   │   ││
│  │  │ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                │   ││
│  │  └─────────────────────────────────────────────────────────────────┘   ││
│  │                                                                         ││
│  │  ○ Usar publicidad global de la empresa                                 ││
│  │  ● Usar playlist específica para esta pantalla                          ││
│  │                                                                         ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  ┌─ PASO 4: PERSONALIZACIÓN ───────────────────────────────────────────────┐│
│  │                                                                         ││
│  │  Tema: [Oscuro ▼]    Fuente: [Montserrat ▼]    Color Primario: [■ #00F]││
│  │                                                                         ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

CONCEPTO: UNA interfaz para TODOS los tipos de pantalla.
          Cada pantalla tiene su "Playlist de Fallback" (antes: Publicidad).
          Layout define las zonas → Zonas reciben Widgets o Playlists.
          Si no hay contenido → Se muestra la Publicidad automáticamente.
```

---

## 6. SISTEMA DE PRIORIDADES (Con Publicidad como Fallback)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SISTEMA DE PRIORIDADES - CÓMO FUNCIONA                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Prioridad 100 ──► EMERGENCIAS                                              │
│  ████████████████  Alertas críticas, evacuación, etc.                       │
│  ████████████████  Interrumpe TODO inmediatamente                           │
│                                                                             │
│  Prioridad 50 ───► OVERRIDES PROGRAMADOS                                    │
│  ████████████      Eventos especiales, congresos, promociones temporales    │
│  ████████████      Se programa en el Calendario/Scheduler                   │
│                                                                             │
│  Prioridad 10 ───► CONTENIDO PRINCIPAL                                      │
│  ████████          Vuelos, Directorio, Eventos del día                      │
│  ████████          Lo que normalmente muestra la pantalla                   │
│                                                                             │
│  Prioridad 0 ────► PUBLICIDAD / FALLBACK  ◄── ESTO ES LO QUE YA EXISTE     │
│  ████              Cuando NO hay nada más activo                            │
│  ████              Loop de imágenes/videos de servicios del hotel           │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  EJEMPLO EN TIEMPO REAL:                                                    │
│                                                                             │
│  06:00 ─────────────────────────────────────────────────────────────────   │
│         ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│         ░░░░░░░░░░ PUBLICIDAD: Loop servicios del hotel ░░░░░░░░░░░░░░   │
│         ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│                    (Prioridad 0 - No hay nada más programado)              │
│  08:00 ─────────────────────────────────────────────────────────────────   │
│         ████████████████████████████████████████████████████████████████   │
│         ████████ CONTENIDO: Información de vuelos del día █████████████   │
│         ████████████████████████████████████████████████████████████████   │
│                    (Prioridad 10 - Vuelos tienen prioridad)                │
│  10:00 ─────────────────────────────────────────────────────────────────   │
│         ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
│         ▓▓▓▓ OVERRIDE: Bienvenida Congreso Médico 2026 ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
│         ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
│                    (Prioridad 50 - Override programado)                    │
│  18:00 ─────────────────────────────────────────────────────────────────   │
│         ████████████████████████████████████████████████████████████████   │
│         ████████ CONTENIDO: Información de vuelos del día █████████████   │
│         ████████████████████████████████████████████████████████████████   │
│                    (Prioridad 10 - Vuelve a vuelos)                        │
│  22:00 ─────────────────────────────────────────────────────────────────   │
│         ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│         ░░░░░░░░░░ PUBLICIDAD: Loop servicios del hotel ░░░░░░░░░░░░░░   │
│         ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│                    (Prioridad 0 - No hay vuelos, vuelve a publicidad)      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

CONCEPTO CLAVE:
═══════════════
La "Publicidad" actual ya implementa el concepto de Prioridad 0.
Solo necesita:
1. Unificarse en el sistema de Playlists
2. Conectarse al Scheduler para que el cambio sea automático
```

---

## 7. CALENDARIO / SCHEDULER

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  📆 PROGRAMACIÓN DE CONTENIDO                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Pantalla: [Lobby Principal ▼]     ◀ Enero 2026 ▶      [Semana] [Mes] [Día]│
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  LUN 5    MAR 6    MIÉ 7    JUE 8    VIE 9    SÁB 10   DOM 11          ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │                                                                         ││
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ││
│  │  ░░░░░ FALLBACK: Publicidad General (cuando no hay contenido) ░░░░░░░░ ││
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ││
│  │                                                                         ││
│  │  06:00 ─────────────────────────────────────────────────────────────── ││
│  │                                                                         ││
│  │  08:00 ───────████████████████████████████████████████████████──────── ││
│  │              ████ Información de Vuelos (Contenido Principal) ████     ││
│  │              ████ Widget: Vuelos MEX | Prioridad 10           ████     ││
│  │  ...         ████████████████████████████████████████████████████      ││
│  │                                                                         ││
│  │  09:00 ──────│          ┌──────────────────────────────┐               ││
│  │              │          │  ████████████████████████████ │               ││
│  │  10:00 ──────│          │  █ Congreso Médico 2026     █ │◄─ OVERRIDE   ││
│  │              │          │  █ Playlist: Bienvenida     █ │  (Prio 50)   ││
│  │              │          │  ████████████████████████████ │  Viernes 9   ││
│  │  ...         │          │                              │   09:00-18:00 ││
│  │              │          │                              │               ││
│  │  17:00 ──────│          │                              │               ││
│  │              │          │                              │               ││
│  │  18:00 ──────│──────────└──────────────────────────────┘               ││
│  │              ████ Información de Vuelos continúa ████                  ││
│  │                                                                         ││
│  │  22:00 ───────────────────────────────────────────────────────────────  ││
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ││
│  │  ░░░░░ FALLBACK: Publicidad General (no hay vuelos nocturnos) ░░░░░░░░ ││
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ││
│  │                                                                         ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  LEYENDA:                                                               ││
│  │  ░░░ = Fallback/Publicidad (siempre activo como respaldo - Prio 0)      ││
│  │  ███ = Contenido Principal (vuelos, directorio, etc. - Prio 10)         ││
│  │  ▓▓▓ = Override Programado (eventos especiales - Prio 50)               ││
│  │  ▒▒▒ = Emergencia (máxima prioridad - Prio 100)                         ││
│  │                                                                         ││
│  │  [+ Nuevo Override]  [+ Nueva Emergencia]  [Editar Fallback]            ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

CONCEPTO: Calendario visual estilo Google Calendar.
          El gris (░░░) es la Publicidad - siempre como respaldo.
          Los bloques (███) muestran el contenido programado.
          Los overrides (▓▓▓) tienen prioridad sobre todo menos emergencias.
```

---

## 8. FLUJO COMPLETO DEL USUARIO (Incluyendo Publicidad)

```
                           ┌─────────────────────────┐
                           │                         │
                           │  1. SUBIR CONTENIDO     │
                           │  ─────────────────────  │
                           │  🖼️ Biblioteca          │
                           │  "Subir nuevo asset"    │
                           │  (Promos, videos, etc.) │
                           │                         │
                           └───────────┬─────────────┘
                                       │
                                       ▼
                           ┌─────────────────────────┐
                           │                         │
                           │  2. CREAR PLAYLISTS     │
                           │  ─────────────────────  │
                           │  ▶️ Playlists           │
                           │                         │
                           │  ├─ Contenido normal    │
                           │  └─ PUBLICIDAD/Fallback │◄── Antes era módulo
                           │                         │     separado, ahora
                           │     (Mismo lugar,       │     es solo un tipo
                           │      solo marca tipo)   │     de playlist
                           │                         │
                           └───────────┬─────────────┘
                                       │
                                       ▼
                           ┌─────────────────────────┐
                           │                         │
                           │  3. CONFIGURAR PANTALLA │
                           │  ─────────────────────  │
                           │  🖥️ Editor de Pantallas │
                           │  Elegir layout          │
                           │  Asignar contenido      │
                           │  Asignar FALLBACK ◄─────│── Seleccionar playlist
                           │                         │   de publicidad
                           └───────────┬─────────────┘
                                       │
                                       ▼
                           ┌─────────────────────────┐
                           │                         │
                           │  4. VINCULAR DEVICE     │
                           │  ─────────────────────  │
                           │  📱 Dispositivos        │
                           │  Código de 6 dígitos    │
                           │  TV recibe la config    │
                           │                         │
                           └───────────┬─────────────┘
                                       │
                                       ▼
                           ┌─────────────────────────┐
                           │                         │
                           │  5. (OPCIONAL)          │
                           │  PROGRAMAR OVERRIDE     │
                           │  ─────────────────────  │
                           │  📆 Calendario          │
                           │  "Este viernes de 9-18  │
                           │   mostrar X en vez de Y"│
                           │                         │
                           │  Cuando no hay override │
                           │  → Muestra contenido    │
                           │  Cuando no hay contenido│
                           │  → Muestra PUBLICIDAD   │
                           │                         │
                           └─────────────────────────┘


ANTES (Flujo actual - Publicidad separada):
──────────────────────────────────────────────────────────
Usuario quiere configurar publicidad:

1. Ir a "Publicidad" (si encuentra el link...)
2. Crear publicidad para Salón
3. Crear publicidad para Directorio (otro componente)
4. Crear publicidad para Tarifario (otro componente)
5. Configurar duración en cada uno por separado

Problema: 3 lugares diferentes para lo mismo.


DESPUÉS (Flujo propuesto - Publicidad unificada):
──────────────────────────────────────────────────────────
Usuario quiere configurar publicidad:

1. Ir a Playlists
2. Crear nueva playlist tipo "Fallback"
3. Agregar imágenes/videos desde Biblioteca
4. Ir a Editor de Pantallas
5. Asignar esa playlist como Fallback a las pantallas deseadas

Tiempo: 5 minutos. Un solo lugar. Una sola configuración.
```

---

## 9. COMPARACIÓN VISUAL: ANTES vs DESPUÉS

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│   ANTES: "Quiero configurar publicidad para todas mis pantallas"              │
│   ══════════════════════════════════════════════════════════════              │
│                                                                               │
│   1. Buscar dónde está Publicidad (no está en sidebar)                        │
│   2. Ir a publicidadDirec.jsx para pantallas Directorio                       │
│   3. Subir imágenes, configurar duración                                      │
│   4. Ir a publicidadSalon.jsx para pantallas Salón                            │
│   5. Subir LAS MISMAS imágenes de nuevo, configurar duración                  │
│   6. Repetir para Tarifario...                                                │
│                                                                               │
│   Tiempo: 30-45 minutos                                                       │
│   Frustración: ALTA (¿por qué tengo que hacerlo 3 veces?)                     │
│                                                                               │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   DESPUÉS: "Quiero configurar publicidad para todas mis pantallas"            │
│   ═══════════════════════════════════════════════════════════════             │
│                                                                               │
│   1. Ir a Playlists                                                           │
│   2. Crear playlist "Publicidad General" (tipo: Fallback)                     │
│   3. Arrastrar assets desde Biblioteca                                        │
│   4. Ir a Editor de Pantallas                                                 │
│   5. Seleccionar todas las pantallas → Asignar fallback                       │
│                                                                               │
│   Tiempo: 5 minutos                                                           │
│   Frustración: NINGUNA                                                        │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘


┌───────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│   ANTES: "Quiero cambiar una imagen de publicidad"                            │
│   ════════════════════════════════════════════════                            │
│                                                                               │
│   1. Ir a publicidadDirec → Buscar imagen → Eliminar → Subir nueva            │
│   2. Ir a publicidadSalon → Buscar imagen → Eliminar → Subir nueva            │
│   3. Ir a publicidadTarifario → Buscar imagen → Eliminar → Subir nueva        │
│                                                                               │
│   Riesgo: Olvidar alguno → Inconsistencia entre pantallas                     │
│                                                                               │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   DESPUÉS: "Quiero cambiar una imagen de publicidad"                          │
│   ═══════════════════════════════════════════════════                         │
│                                                                               │
│   1. Ir a Biblioteca → Buscar imagen → Reemplazar                             │
│                                                                               │
│   Riesgo: NINGUNO (todas las pantallas usan la misma referencia)              │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. RESUMEN DE CAMBIOS EN SIDEBAR

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│  SECCIONES ELIMINADAS (se fusionan):                                   │
│  ──────────────────────────────────                                    │
│  ❌ Pantallas Vuelos                                                   │
│  ❌ Pantallas Promociones       ──┬──►  🖥️ Editor de Pantallas         │
│  ❌ Pantallas Directorio          │     (Unificado con layouts)        │
│  ❌ Pantallas Salón               │                                    │
│  ❌ Pantallas Tarifario        ───┘                                    │
│                                                                        │
│  ❌ Alta de Eventos            ───┬──►  📅 Eventos                     │
│  ❌ Consulta de Eventos        ───┘     (Unificado)                    │
│                                                                        │
│  ❌ Dispositivos               ───┬──►  📱 Mis Dispositivos            │
│  ❌ Vincular Dispositivo       ───┘     (Unificado)                    │
│                                                                        │
│  ❌ publicidad.jsx                                                     │
│  ❌ publicidadDirec.jsx        ───┬──►  ▶️ Playlists                   │
│  ❌ publicidadSalon.jsx           │     (Publicidad = Playlist         │
│  ❌ publicidadTarifario        ───┘      tipo "Fallback")              │
│                                                                        │
│  SECCIONES NUEVAS:                                                     │
│  ─────────────────                                                     │
│  ✅ 🖼️ Biblioteca Multimedia    (Assets centralizados)                 │
│  ✅ ▶️ Playlists                (ACTIVAR - ya existe PlaylistManager)  │
│  ✅ 📆 Calendario/Scheduler     (Programación por horarios)            │
│  ✅ 🏢 Mi Empresa               (Config global: logo, colores, etc.)   │
│                                                                        │
│  SECCIONES QUE SE MANTIENEN:                                           │
│  ───────────────────────────                                           │
│  ✓ 💬 Mensajes Dinámicos                                               │
│  ✓ 📊 Monitor en Vivo                                                  │
│  ✓ ⚙️ API Monitor (Admin)                                              │
│  ✓ 📄 Licencia                                                         │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

NOTA IMPORTANTE SOBRE PUBLICIDAD:
═════════════════════════════════
La sección "Publicidad" actual (7 archivos) se ELIMINA como módulo separado.
En su lugar, Publicidad se convierte en un TIPO de Playlist ("Fallback").

Ventajas:
1. Un solo lugar para crear y editar
2. Reutilizable en cualquier pantalla
3. Se integra automáticamente con el Scheduler
4. Misma UX que cualquier otra playlist
```

---

**Archivo generado por Claude durante auditoría técnica - Enero 2026**
**Revisión v1.1: Actualizado para incluir integración de Publicidad en nueva arquitectura**
