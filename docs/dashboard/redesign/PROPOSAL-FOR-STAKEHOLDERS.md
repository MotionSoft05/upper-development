# Propuesta de Evolución: UpperDS Platform v2

## 1. Resumen Ejecutivo

Actualmente, el dashboard de UpperDS opera bajo un modelo **"Siloed Configuration"**: cada módulo (Promociones, Vuelos, Directorio, Eventos) funciona como una mini-aplicación aislada con su propia configuración de colores, logos y reglas.

Si bien este modelo nació para cumplir con el requerimiento de "máxima flexibilidad por pantalla", irónicamente ha generado una **rigidez operativa**:

- Para actualizar el logo de una empresa, hay que editarlo en 4 lugares diferentes.
- No es posible combinar funcionalidades (ej: Vuelos + Publicidad Lateral) sin desarrollar un nuevo módulo desde cero.
- La escalabilidad técnica está comprometida por la duplicación de datos (ej: al guardar un Salón, se copian datos a cientos de eventos históricos).

Esta propuesta presenta la arquitectura **"Unified Screen Editor"**, el estándar de la industria (utilizado por Yodeck, MagicInfo, Broadsign), que garantiza la flexibilidad deseada por la dirección pero con una arquitectura sostenible y escalable.

---

## 2. Validación de Industria (Benchmarking)

Las plataformas líderes de Digital Signage operan bajo un modelo unificado:

| Plataforma            | Modelo de Datos                                   | Concepto Clave                                                       |
| :-------------------- | :------------------------------------------------ | :------------------------------------------------------------------- |
| **Yodeck**            | Media -> Playlists -> Layouts -> Screens          | El "Layout" define las zonas; el contenido es independiente.         |
| **Samsung MagicInfo** | Content -> Playlist -> Schedule -> Device         | Separación total entre contenido y dispositivo físico.               |
| **Scala**             | Scripts -> Channels -> Players                    | Máxima flexibilidad lógica antes de tocar el hardware.               |
| **UpperDS (Actual)**  | TemplateVuelos / TemplatePromos / TemplateSalones | **Modelo rígido:** El tipo de contenido define la pantalla completa. |

**Tendencia:** El mercado se mueve hacia **"Layouts Composables"**. El usuario no elige "Pantalla de Vuelos", elige un layout con una "Zona Principal" y arrastra el widget de "Vuelos" ahí.

---

## 3. La Solución: UpperDS Screen Editor

Proponemos migrar de "Configuradores por Módulo" a un **Editor Unificado** basado en 4 pilares:

### A. Biblioteca Multimedia Global (Assets)

- Un repositorio único por empresa para imágenes, videos, logos y fuentes.
- **Beneficio:** Subes el logo una vez, se actualiza en las 50 pantallas (Vuelos, Lobbys, Salones).
- **Flexibilidad:** Aun así, puedes subir un logo "Alternativo" y asignarlo solo a una pantalla específica si se requiere.

### B. Playlist & Widget Builder (Logic)

- **Playlists:** Secuencias de imágenes/videos (como Promociones actuales).
- **Widgets:** Componentes inteligentes (Vuelos, Clima, Tarifario, Eventos).
- _Configuración una sola vez:_ Configuras el widget de "Vuelos MEX" una vez y lo reutilizas en el Lobby y en el Bar.

### C. Screen Layout Editor (Visual)

La pieza clave. Una interfaz visual donde el usuario:

1.  Elige una plantilla de diseño (ej: "Pantalla Completa", "L con Barra Lateral", "3 Columnas").
2.  Arrastra contenidos a las zonas:
    - _Zona A (Principal):_ Widget de Vuelos.
    - _Zona B (Lateral):_ Playlist de Publicidad "Restaurante".
    - _Zona C (Ticker):_ Widget de Clima + RSS Noticias.
3.  Personaliza el tema (Colores/Fuentes) para este layout específico.

### D. Device Matrix (Physical)

Un panel donde vinculas los Layouts con las TV físicas (detectadas por Monitors/Heartbeats).

- "TV Recepción" -> Muestra "Layout Lobby".
- "TV Pasillo" -> Muestra "Layout Vuelos".

### E. Advanced Scheduler (Nueva Solicitud: "Playlist Override")

Esta es la funcionalidad que solicitaste: poder "sobreponer" contenido en horarios específicos (ej: interrumpir la programación normal para mostrar un aviso especial o un evento intercalado).

- **Modelo Actual:** Imposible. La programación vive _dentro_ de la configuración de la pantalla. No puedes decir "interrumpe esto" sin reescribir la configuración base.
- **Nuevo Modelo:** Nativo.
  - _Default Playlist:_ Loop normal de eventos.
  - _Override Playlist:_ "Mostrar contenido X, el día Y, de 10:00 a 11:00, con **Prioridad Alta**".
  - El Player de la TV detecta la prioridad y hace el switch automáticamente.

---

## 4. Análisis de ROI (Retorno de Inversión)

| Área                 | Situación Actual                                                | Con Nuevo Modelo                                                        |
| :------------------- | :-------------------------------------------------------------- | :---------------------------------------------------------------------- |
| **Operaciones**      | Cambio de logo toma 15 mins x 4 módulos.                        | Cambio de logo toma 1 min (Global).                                     |
| **Ventas / Negocio** | Vender "Publicidad en Vuelos" requiere desarrollo a medida.     | **Inmediato:** Arrastrar Playlist Publicidad al lado del Widget Vuelos. |
| **Mantenimiento**    | Bug de "Clima" debe corregirse en Vuelos, Directorio y Salones. | Se corrige una vez en el "Widget Clima".                                |
| **Costos Cloud**     | Datos duplicados exponencialmente en Eventos.                   | Referencias ligeras, reducción de lectura/escritura en Firestore.       |

---

## 5. Estrategia de Transición (Roadmap)

Entendemos el riesgo de reescribir todo. Por eso proponemos una migración gradual:

- **Fase 1: Frontend Híbrido (UX Unificada)**
  - Construir el "Container" del nuevo Dashboard.
  - Mantener las estructuras de datos viejas (`TemplateVuelos`) por debajo, pero presentarlas en la nueva UI unificada.
  - _Usuario ve:_ Una mejora visual inmediata.
  - _Backend:_ Sigue igual (sin riesgo).

- **Fase 2: Nuevo Motor de Datos (Widgets & Layouts)**
  - Implementar la colección `Screens` `Layouts` y `Playlists` solo para **nuevas funcionalidades** (ej: la nueva pantalla solicitada).
  - Los módulos viejos conviven con los nuevos.

- **Fase 3: Migración & Switch**
  - Script de migración para convertir `TemplateVuelos` -> `Layout Vuelos`.
  - Apagado de los editores antiguos.

## 6. Siguientes Pasos

1.  Aprobación del concepto "Screen Editor".
2.  Definición de las especificaciones de la **Nueva Pantalla** (que nacerá ya en este nuevo modelo).
3.  Inicio de la Fase 1 (Refactor UI Sidebar y Estructura Base - _En Progreso_).
