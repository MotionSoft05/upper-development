# Especificación Técnica: Advanced Scheduler (Overlays & Interrupts)

## 1. El Concepto

El requerimiento es permitir que un usuario programe contenido que "sobreponga" o "interrumpa" el flujo normal de una pantalla en momentos específicos (ej: "Mostrar Evento Especial este Viernes de 18:00 a 20:00").

En la arquitectura unificada, esto se resuelve mediante un **Sistema de Prioridades**.

---

## 2. Modelo de Prioridades

La TV (Player) ya no reproduce una lista plana. Sigue este algoritmo de decisión en cada ciclo de loop:

1.  **¿Hay una "Emergencia"?** (Prioridad 100) -> Mostrar Alerta.
2.  **¿Hay un "Override Programado" activo ahora?** (Prioridad 50) -> Mostrar Playlist Override.
3.  **¿Sino?** (Prioridad 10) -> Mostrar Playlist Default / Loop Standard.
4.  **¿Sino?** (Prioridad 0) -> Mostrar Fallback (Logo empresa).

### Ejemplo de Uso

- **Default:** "Rotación de Promociones Generales" (24/7).
- **Override:** "Bienvenida Congreso Médico" (Viernes 09:00 - 18:00).
- **Resultado:** El viernes a las 9:00, la TV deja de mostrar Promociones y muestra solo la Bienvenida. A las 18:01, vuelve automáticamente a Promociones.

---

## 3. Interfaz de Usuario (UI) - "The Calendar View"

Para que esto sea intuitivo, la nueva pantalla no debe ser una tabla de configuración complicada, sino un **Calendario Visual** (similar a Google Calendar o Outlook).

1.  **Vista:** Calendario Semanal/Mensual.
2.  **Fondo:** Se ve en gris el "Loop Default" (ocupando todo el tiempo).
3.  **Acción:** El usuario hace clic y arrastra ("Drag & Drop") para crear un bloque de tiempo de 10:00 a 11:00.
4.  **Config:** Al soltar, elige qué Playlist o Contenido quiere asignar a ese bloque.
5.  **Visual:** El bloque aparece "encima" del gris, indicando visualmente que va a tapar al contenido base.

---

## 4. Estructura de Datos (Firebase)

Necesitamos una colección `Schedules` separada de la configuración de la pantalla.

```typescript
interface ScheduleItem {
  id: string;
  companyId: string;
  screenIds: string[]; // En qué pantallas aplica (puede ser 1 o muchas)
  playlistId: string; // Qué contenido mostrar

  // Reglas de Tiempo
  startDate: Timestamp;
  endDate: Timestamp;
  recurrence?: "NONE" | "DAILY" | "WEEKLY"; // Opcional: Repetición

  // Nivel de Agresividad
  priority: number; // 10 = Default, 50 = Override, 90 = Exclusive
  behavior: "INTERRUPT" | "INSERT"; // INTERRUPT = Reemplaza todo / INSERT = Se mezcla
}
```

## 5. Ventajas sobre el Modelo Actual

- **Desacoplado:** No tocas la configuración de la pantalla. Si borras el evento del calendario, la pantalla vuelve a la normalidad sola.
- **Multi-Pantalla:** Puedes crear un Override que aplique a "Lobby" + "Bar" + "Pasillo" al mismo tiempo.
- **Automatización:** No necesitas estar presente a las 10:00 para cambiar el canal. Lo dejas programado.

Esta funcionalidad **solo es posible** si migramos al modelo unificado de "Screen Editor" donde el contenido es independiente del hardware.
