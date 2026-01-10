# Dashboard Redesign Progress Log

**Fecha inicio:** 2026-01-09
**Estado:** En progreso

---

## Sesión 1: 2026-01-09

### Resumen de cambios

#### 1. Zustand Stores (NUEVOS)

- `src/stores/useDashboardStore.ts` - Store centralizado para estado del dashboard
  - Reemplaza 20+ useState hooks del viejo DashboardClient
  - Maneja: activePanel, sidebarCollapsed, sidebarOpen, userData
- `src/stores/useThemeStore.ts` - Store para tema dark/light
  - Detecta preferencia del sistema
  - Persiste en localStorage
- `src/stores/index.ts` - Barrel export

#### 2. Layout Components (NUEVOS)

Ubicación: `src/components/dashboard/layout/`

- `DashboardSidebar.tsx` - Sidebar colapsable con animaciones
  - Collapsible icons ↔ expanded
  - Mobile drawer con overlay
  - Framer-motion animations
  - Sistema de permisos tienePermiso()
- `DashboardHeader.tsx` - Header sticky con glassmorphism
  - Menú de usuario con dropdown
  - Toggle tema (sol/luna)
  - Toggle idioma (ES/EN)
  - Nombre de empresa
- `DashboardFooter.tsx` - Footer con badges
  - Google Cloud, Firebase, SSL badges
  - Versión y estado operativo
- `DashboardLayout.tsx` - Wrapper principal
  - Maneja auth state listener
  - Background gradients sutiles
  - Responsive margin para sidebar

#### 3. DashboardClientNew.tsx (NUEVO)

- Reemplaza viejo DashboardClient.jsx
- Usa panel registry pattern en lugar de 20+ useState
- Mapeo panelComponents para renderizar dinámicamente

#### 4. Modificaciones a archivos existentes

##### `src/components/LayoutWrapper.jsx`

- **Antes:** Dashboard route incluía Navigation y Footer viejos
- **Después:** Dashboard route retorna solo children (layout propio)

```diff
-  if (isDashboard) {
-    return (
-      <div className="flex flex-col min-h-screen">
-        <Navigation />
-        <div className="flex-grow">{children}</div>
-        <Footer />
-      </div>
-    );
-  }
+  if (isDashboard) {
+    return children;
+  }
```

##### `tailwind.config.js`

- Agregado: `darkMode: 'class'` para soporte de dark mode

##### `src/app/dashboard/page.jsx`

- Cambiado import de DashboardClient a DashboardClientNew

---

### Organización del Sidebar

#### Versión inicial (feature-based):

```
Admin → Personalizar → Android TV → Pantallas → Información
```

#### Versión optimizada (workflow-based):

```
📊 Inicio
   └── Dashboard

📝 Contenido
   ├── Crear Evento
   ├── Mis Eventos
   └── Contenido Tarifario  ← Antes era "Mensajes" en otra sección

📺 Mis Pantallas
   ├── Salón
   ├── Directorio
   ├── Promociones
   ├── Vuelos
   ├── Tarifario
   └── Info Tarifas

📱 Dispositivos
   ├── Android TV
   └── Monitor

🎯 Publicidad
   └── Gestionar Anuncios

⚙️ Ajustes
   ├── Mi Cuenta
   ├── Guía
   └── Soporte

🔧 Administrador (solo superadmin)
   ├── Panel Admin
   ├── Empresas
   └── API Monitor
```

---

### Cambios pendientes en esta sesión:

- [x] Implementar secciones colapsables
- [x] Mover "Mensajes Tarifario" a sección Contenido
- [x] Renombrar a "Contenido Tarifario"

### Detalles técnicos de secciones colapsables:

- Estado `collapsedSections` en useState para recordar qué secciones están cerradas
- Propiedad `collapsible: true` en MenuSection interface
- Animación con framer-motion `motion.ul`
- ChevronDown icon que rota -90° cuando colapsado
- Solo Contenido y Mis Pantallas son colapsables

### Fixes de animación (sesión 2):

- Removido "Mensajes Dinámicos" del sidebar (irá dentro de Vuelos panel)
- Cambiado `SidebarContent` de función a variable JSX para evitar re-renders
- Agregado `AnimatePresence` con `initial={false}` para animación de colapso correcta
- Agregado `key` prop al motion.ul para mount/unmount correcto
- Reducido duration de animación a 0.15s para sensación más responsive

### Integración de Mensajes Dinámicos:

- Eliminado ítem "Contenido Tarifario" del sidebar
- Modificado `MensajesDinamicos.jsx`:
  - Agregado prop `overrideCompany` para uso administrativo
  - Agregado prop `isEmbedded` para ajustar UI (ocultar header)
- Modificado `PantallasVuelos.jsx`:
  - Agregado tab "Mensajes Dinámicos"
  - Importado e integrado el componente `MensajesDinamicos`
  - Paso de `empresaSeleccionada` para gestión de admins

### Ajustes finales de Sidebar y Header:

- Corregido bug visual de colapso de sidebar (añadido `overflow-hidden` a `motion.aside`)
- Movido enlace "Mi Cuenta" del sidebar al dropdown de usuario en el header (usando `setActivePanel("licencia")`)
- Renombrado ítem "Monitor" a "Monitor de Estado" en el sidebar
- Eliminada expansión automática por hover (UX feedback)
- Mejorada animación de sidebar (Spring physics) para mayor fluidez

---

## Próximos pasos sugeridos:

1. Refactorizar componentes grandes (pantallasTarifario.jsx, etc.)
2. Migrar gradualmente a TypeScript
3. Agregar traducciones para nuevos labels
