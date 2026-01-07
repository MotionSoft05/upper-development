# 🎛️ Sidebar Navigation Documentation

> Complete guide to the dashboard sidebar structure, navigation flow, and state management

---

## Overview

The Sidebar (`src/components/dashboard/SideBar.jsx`) is a **790-line component** that controls all navigation within the dashboard. It implements permission-based visibility and manages panel state switching.

---

## Sidebar Architecture

### Location & Size

| Property  | Value                                  |
| --------- | -------------------------------------- |
| **File**  | `src/components/dashboard/SideBar.jsx` |
| **Lines** | 790                                    |
| **Bytes** | 32,501                                 |

### Core Responsibilities

1. **Navigation** - Switch between dashboard panels
2. **Permission Control** - Show/hide sections based on user role
3. **State Management** - Ensure only one panel is visible at a time
4. **Responsive Behavior** - Collapse on mobile

---

## Section Structure

### Hierarchy

```
SIDEBAR
├── 📋 ADMINISTRADOR (SuperAdmin Only - permisos === 10)
│   ├── Admin (user management)
│   ├── Edición de Empresas (company editing)
│   └── Monitor de APIs (API status)
│
├── 🎨 PERSONALICE SUS PANTALLAS
│   ├── Tablero (dashboard overview)
│   ├── Alta de Eventos (create events)
│   ├── Consulta de Eventos (query events)
│   ├── Mensajes Dinámicos (dynamic messages)
│   └── Editar Información Tarifas (rate info)
│
├── 📺 ANDROID TV (if androidTv permission)
│   └── Mis Pantallas TV (device management)
│
├── ⚙️ AJUSTES PANTALLAS
│   ├── Pantallas Salón
│   ├── Pantallas Directorio
│   ├── Pantallas Promociones
│   ├── Pantallas Vuelos
│   ├── Pantallas Tarifario
│   ├── Monitor de Pantallas
│   └── Publicidad
│
├── ℹ️ MÁS INFORMACIÓN
│   ├── Mis Datos (user profile)
│   ├── Guía de Usuario
│   └── Contacto Soporte
│
└── 🚪 SALIR (logout)
```

---

## State Management

### Panel State Pattern

Each panel has a show/setShow state pair in the parent dashboard:

```javascript
// In Dashboard component
const [showPantallaSalon, setShowPantallaSalon] = useState(false);
const [showPantallaDirectorio, setShowPantallaDirectorio] = useState(false);
const [showPantallaPromociones, setShowPantallaPromociones] = useState(false);
const [showPantallasVuelos, setShowPantallasVuelos] = useState(false);
const [showPantallaTarifario, setShowPantallaTarifario] = useState(false);
const [showAltaEvento, setShowAltaEvento] = useState(false);
const [showConsultaEvento, setShowConsultaEvento] = useState(false);
// ... 20+ more states
```

### changePanel Function

The core function that switches between panels:

```javascript
const changePanel = (setVisible) => {
  // 1. Hide ALL panels
  props.setShowAdmin(false);
  props.setShowUserAdmin(false);
  props.setShowEdiciondeempresa(false);
  props.setShowAPIMonitor && props.setShowAPIMonitor(false);
  props.setShowAltaEvento(false);
  props.setShowConsultaEvento(false);
  props.setShowPantallaSalon(false);
  props.setShowPantallaDirectorio(false);
  props.setShowPantallaPromociones(false);
  props.setShowPantallasVuelos && props.setShowPantallasVuelos(false);
  props.setShowPublicidad(false);
  props.setShowlicencia(false);
  props.setShowGuia(false);
  props.setShowSoporte(false);
  props.setShowPantallaServicio(false);
  props.setShowMonitorScreen(false);
  props.setShowPantallaTarifario(false);
  props.setShowEditInformacionTarifa(false);
  props.setShowMensajesDinamicos && props.setShowMensajesDinamicos(false);
  props.setShowDevicesList && props.setShowDevicesList(false);
  props.setShowDeviceLinker && props.setShowDeviceLinker(false);

  // 2. Toggle sidebar on mobile
  props.toggleSidebar();

  // 3. Show ONLY the selected panel
  props[setVisible](true);
};
```

> ⚠️ **Technical Debt**: This function lists every panel manually. Adding a new panel requires updating this function.

---

## Permission System

### User Data Structure

```javascript
const userData = {
  permisos: 1, // 1 = normal, 10 = SuperAdmin
  permisosSecciones: {
    tablero: true,
    altaEventos: true,
    consultaEventos: true,
    pantallasSalon: true,
    pantallasDirectorio: true,
    pantallasPromociones: true,
    pantallasvuelos: true,
    pantallasTarifario: true,
    publicidad: true,
    monitoreo: true,
    datosUsuario: true,
    guiaUsuario: true,
    contactoSoporte: true,
    androidTv: true,
    mensajesDinamicos: true,
    editInformacionTarifa: true,
  },
};
```

### Permission Check Functions

```javascript
// Extract from props
const userData = props.userData || {};
const permisosSecciones = userData.permisosSecciones || {};

// SuperAdmin check
const isSuperAdmin = userData.permisos === 10;

// Permission check function
const tienePermiso = (seccion) => {
  return isSuperAdmin || permisosSecciones[seccion] === true;
};
```

### Permission Mapping

| Section               | Permission Key          | SuperAdmin Only |
| --------------------- | ----------------------- | --------------- |
| Admin                 | N/A                     | ✅ Yes          |
| Edición Empresas      | N/A                     | ✅ Yes          |
| Monitor APIs          | N/A                     | ✅ Yes          |
| Tablero               | `tablero`               | No              |
| Alta Eventos          | `altaEventos`           | No              |
| Consulta Eventos      | `consultaEventos`       | No              |
| Mensajes Dinámicos    | `mensajesDinamicos`     | No              |
| Info Tarifas          | `editInformacionTarifa` | No              |
| Android TV            | `androidTv`             | No              |
| Pantallas Salón       | `pantallasSalon`        | No              |
| Pantallas Directorio  | `pantallasDirectorio`   | No              |
| Pantallas Promociones | `pantallasPromociones`  | No              |
| Pantallas Vuelos      | `pantallasvuelos`       | No              |
| Pantallas Tarifario   | `pantallasTarifario`    | No              |
| Monitoreo             | `monitoreo`             | No              |
| Publicidad            | `publicidad`            | No              |
| Mis Datos             | `datosUsuario`          | No              |
| Guía Usuario          | `guiaUsuario`           | No              |
| Contacto Soporte      | `contactoSoporte`       | No              |

---

## UI Components

### Active State Styling

```javascript
const isActive = (show) => show === true;

// Button styling based on active state
<button
  className={`w-full flex items-center px-4 py-2.5 text-sm rounded-lg
    transition-all duration-200 group ${
      isActive(props.showPantallaSalon)
        ? "bg-white shadow-md text-blue-700 font-medium"  // Active
        : "text-blue-100 hover:bg-blue-700/50"            // Inactive
    }`}
  onClick={() => changePanel("setShowPantallaSalon")}
>
```

### Icon Styling

```javascript
<span
  className={`flex-shrink-0 ${
    isActive(props.showPantallaSalon)
      ? "text-blue-600" // Active icon
      : "text-blue-200 group-hover:text-white" // Inactive icon
  }`}
>
  <FontAwesomeIcon icon={faTelevision} className="w-5 h-5" />
</span>
```

### Section Headers

```javascript
<div className="px-4 py-2">
  <h3
    className="text-xs font-semibold tracking-wider text-blue-100 
    uppercase mb-2 flex items-center"
  >
    <span className="mr-2 w-6 border-t border-blue-300"></span>
    {t("sidebar.screenSettings")}
    <span className="ml-2 w-6 border-t border-blue-300"></span>
  </h3>
</div>
```

---

## Icons Used

| Section          | Icon              | Library     |
| ---------------- | ----------------- | ----------- |
| Admin            | `faUserShield`    | FontAwesome |
| Empresas         | `faBuilding`      | FontAwesome |
| APIs             | `faServer`        | FontAwesome |
| Tablero          | `faTachometerAlt` | FontAwesome |
| Alta Eventos     | `faCalendarPlus`  | FontAwesome |
| Consulta Eventos | `faCalendarDay`   | FontAwesome |
| Mensajes         | `faComments`      | FontAwesome |
| Info Tarifas     | `faEdit`          | FontAwesome |
| Android TV       | Custom SVG        | Inline      |
| Pantallas Salón  | `faTelevision`    | FontAwesome |
| Directorio       | `faListUl`        | FontAwesome |
| Promociones      | `faImages`        | FontAwesome |
| Vuelos           | `faPlane`         | FontAwesome |
| Tarifario        | `faTags`          | FontAwesome |
| Monitor          | `faDesktopAlt`    | FontAwesome |
| Publicidad       | `faAd`            | FontAwesome |
| Mis Datos        | `faIdCard`        | FontAwesome |
| Guía             | `faBook`          | FontAwesome |
| Soporte          | `faHeadset`       | FontAwesome |
| Logout           | `faSignOutAlt`    | FontAwesome |

---

## Known Issues & Technical Debt

### 1. Manual Panel Management

```javascript
// ❌ Current: Each panel must be manually added to changePanel()
props.setShowPantallaSalon(false);
props.setShowPantallaDirectorio(false);
// ... 20+ more lines

// ✅ Better: Use a single state object
const [activePanel, setActivePanel] = useState(null);
```

### 2. Prop Drilling

The sidebar receives 40+ props from the parent dashboard for state management.

### 3. Mobile Responsiveness

Some sidebar sections don't display optimally on mobile devices.

### 4. No TypeScript

Component lacks type safety for props and permission keys.

---

## Recommended Refactoring

### 1. State Consolidation

```javascript
// Instead of 20+ useState calls:
const [activePanel, setActivePanel] = useState("dashboard");

// Panel definitions as config
const PANELS = {
  dashboard: { component: UserAdmin, permission: "tablero" },
  altaEventos: { component: AltaEventos, permission: "altaEventos" },
  // ...
};
```

### 2. Context-Based Navigation

```javascript
const DashboardContext = createContext();

function DashboardProvider({ children }) {
  const [activePanel, setActivePanel] = useState("dashboard");
  return (
    <DashboardContext.Provider value={{ activePanel, setActivePanel }}>
      {children}
    </DashboardContext.Provider>
  );
}
```

### 3. Component Splitting

Break the 790-line file into smaller components:

- `SidebarSection.jsx` - Reusable section container
- `SidebarItem.jsx` - Individual navigation item
- `SidebarHeader.jsx` - Section headers

---

## Translation Keys

| Key                         | Spanish                   | English                  |
| --------------------------- | ------------------------- | ------------------------ |
| `sidebar.admin`             | Administrador             | Admin                    |
| `sidebar.title`             | Personalice sus Pantallas | Personalize Your Screens |
| `sidebar.dashboard`         | Tablero                   | Dashboard                |
| `sidebar.eventRegistration` | Alta de Eventos           | Event Registration       |
| `sidebar.eventQuery`        | Consulta de Eventos       | Event Query              |
| `sidebar.screenSettings`    | Ajustes Pantallas         | Screen Settings          |
| `sidebar.roomScreens`       | Pantallas Salón           | Room Screens             |
| `sidebar.directoryScreens`  | Pantallas Directorio      | Directory Screens        |
| `sidebar.flightScreens`     | Pantallas Vuelos          | Flight Screens           |
| `sidebar.rateScreen`        | Pantallas Tarifario       | Rate Screens             |
| `sidebar.monitorScreen`     | Monitoreo de Pantallas    | Screen Monitoring        |
| `sidebar.advertisement`     | Publicidad                | Advertisement            |
| `sidebar.moreInformation`   | Más Información           | More Information         |
| `sidebar.myData`            | Mis Datos                 | My Data                  |
| `sidebar.userGuides`        | Guía de Usuario           | User Guide               |
| `sidebar.supportContact`    | Contacto Soporte          | Support Contact          |
| `sidebar.logout`            | Salir                     | Logout                   |

---

_See [Dashboard Overview](./DASHBOARD-OVERVIEW.md) for the complete dashboard structure._
