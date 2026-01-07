# 📊 Dashboard Overview

> Complete guide to the Upper Digital Signage admin dashboard

---

## Overview

The dashboard (`/dashboard`) is the central control panel where users manage all aspects of their digital signage system: screens, content, events, devices, and settings.

**Main File**: `src/app/dashboard/page.jsx`

---

## Dashboard Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           DASHBOARD LAYOUT                              │
├────────────────────┬────────────────────────────────────────────────────┤
│                    │                                                    │
│                    │          HEADER                                    │
│                    │  - Company name                                    │
│                    │  - User info                                       │
│                    │  - Language switcher                               │
│                    │                                                    │
│     SIDEBAR        ├────────────────────────────────────────────────────┤
│                    │                                                    │
│  - Admin Section   │                                                    │
│    (SuperAdmin)    │                                                    │
│                    │                                                    │
│  - Personalize     │           MAIN CONTENT AREA                        │
│    Screens         │                                                    │
│                    │     (One component shown at a time)                │
│  - Android TV      │                                                    │
│                    │     Based on sidebar selection:                    │
│  - Screen Settings │     - userAdmin (Dashboard)                        │
│                    │     - pantallasSalon                               │
│  - More Info       │     - PantallasDirectorio                          │
│                    │     - etc...                                       │
│  - Logout          │                                                    │
│                    │                                                    │
└────────────────────┴────────────────────────────────────────────────────┘
```

---

## Sidebar Sections

### 1. ADMINISTRADOR (SuperAdmin Only)

Only visible to users with `permisos === 10`:

| Item                | Component              | Icon           | Permission |
| ------------------- | ---------------------- | -------------- | ---------- |
| Admin               | `showAdmin`            | `faUserShield` | SuperAdmin |
| Edición de Empresas | `showEdiciondeempresa` | `faBuilding`   | SuperAdmin |
| Monitor de APIs     | `showAPIMonitor`       | `faServer`     | SuperAdmin |

### 2. PERSONALICE SUS PANTALLAS

Content management section:

| Item                 | Component                   | Icon              | Permission Key          |
| -------------------- | --------------------------- | ----------------- | ----------------------- |
| Tablero              | `showUserAdmin`             | `faTachometerAlt` | `tablero`               |
| Alta de Eventos      | `showAltaEvento`            | `faCalendarPlus`  | `altaEventos`           |
| Consulta de Eventos  | `showConsultaEvento`        | `faCalendarDay`   | `consultaEventos`       |
| Mensajes Dinámicos   | `showMensajesDinamicos`     | `faComments`      | `mensajesDinamicos`     |
| Editar Info. Tarifas | `showEditInformacionTarifa` | `faEdit`          | `editInformacionTarifa` |

### 3. ANDROID TV

Device management (when permission `androidTv` is true):

| Item             | Component         | Icon       |
| ---------------- | ----------------- | ---------- |
| Mis Pantallas TV | `showDevicesList` | Custom SVG |

### 4. AJUSTES PANTALLAS

Screen configuration section:

| Item                  | Component                 | Icon           | Permission Key         |
| --------------------- | ------------------------- | -------------- | ---------------------- |
| Pantallas Salón       | `showPantallaSalon`       | `faTelevision` | `pantallasSalon`       |
| Pantallas Directorio  | `showPantallaDirectorio`  | `faListUl`     | `pantallasDirectorio`  |
| Pantallas Promociones | `showPantallaPromociones` | `faImages`     | `pantallasPromociones` |
| Pantallas Vuelos      | `showPantallasVuelos`     | `faPlane`      | `pantallasvuelos`      |
| Pantallas Tarifario   | `showPantallaTarifario`   | `faTags`       | `pantallasTarifario`   |
| Monitoreo             | `showMonitorScreen`       | `faDesktopAlt` | `monitoreo`            |
| Publicidad            | `showPublicidad`          | `faAd`         | `publicidad`           |

### 5. MÁS INFORMACIÓN

Support and settings:

| Item             | Component      | Icon        | Permission Key    |
| ---------------- | -------------- | ----------- | ----------------- |
| Mis Datos        | `showlicencia` | `faIdCard`  | `datosUsuario`    |
| Guía de Usuario  | `showGuia`     | `faBook`    | `guiaUsuario`     |
| Contacto Soporte | `showSoporte`  | `faHeadset` | `contactoSoporte` |

---

## Dashboard Components

### Screen Management Components

| Component              | File                       | Lines | Purpose                          |
| ---------------------- | -------------------------- | ----- | -------------------------------- |
| `pantallasSalon`       | `pantallasSalon.jsx`       | 1,416 | Configure salon/event screens    |
| `PantallasDirectorio`  | `PantallasDirectorio.jsx`  | 1,749 | Configure directory screens      |
| `pantallasTarifario`   | `pantallasTarifario.jsx`   | 2,270 | Configure rate board screens     |
| `PantallasVuelos`      | `PantallasVuelos.jsx`      | 1,655 | Configure flight monitor screens |
| `PantallasPromociones` | `PantallasPromociones.jsx` | 2,391 | Configure promotional screens    |

### Event Management

| Component           | File                     | Lines | Purpose               |
| ------------------- | ------------------------ | ----- | --------------------- |
| `AltaEventos`       | `altaEventos.jsx`        | 1,125 | Create new events     |
| `ConsultaModEvento` | `consultaModEventos.jsx` | 1,756 | Query and edit events |

### Advertising Management

| Component         | File                  | Lines  | Purpose              |
| ----------------- | --------------------- | ------ | -------------------- |
| `PublicidadDirec` | `publicidadDirec.jsx` | 1,261  | Directory screen ads |
| `publicidadSalon` | `publicidadSalon.jsx` | ~1,000 | Salon screen ads     |

### Device Management

| Component             | File                      | Lines | Purpose                  |
| --------------------- | ------------------------- | ----- | ------------------------ |
| `DevicesList`         | `DevicesList.jsx`         | 702   | List all linked devices  |
| `DeviceConfiguration` | `DeviceConfiguration.jsx` | 668   | Configure device display |
| `DeviceLinker`        | `DeviceLinker.jsx`        | ~500  | Link new devices         |

### Utility Components

| Component               | File                        | Purpose                |
| ----------------------- | --------------------------- | ---------------------- |
| `SideBar`               | `SideBar.jsx`               | Navigation sidebar     |
| `MonitorScreen`         | `MonitorScreen.jsx`         | Live screen monitoring |
| `MensajesDinamicos`     | `MensajesDinamicos.jsx`     | Dynamic messages       |
| `EditInformacionTarifa` | `EditInformacionTarifa.jsx` | Rate information edit  |

---

## State Management

The dashboard uses React `useState` for panel visibility:

```javascript
// Each panel has a show/setShow state pair
const [showPantallaSalon, setShowPantallaSalon] = useState(false);
const [showPantallaDirectorio, setShowPantallaDirectorio] = useState(false);
const [showPantallaPromociones, setShowPantallaPromociones] = useState(false);
// ... etc
```

### Panel Navigation Logic

The `changePanel` function in SideBar ensures only one panel is visible:

```javascript
const changePanel = (setVisible) => {
  // Hide all panels
  props.setShowAdmin(false);
  props.setShowUserAdmin(false);
  props.setShowPantallaSalon(false);
  // ... hide all others

  // Show selected panel
  props[setVisible](true);

  // Toggle sidebar on mobile
  props.toggleSidebar();
};
```

---

## Permission System

### User Object Structure

```javascript
{
  permisos: 10,  // 10 = SuperAdmin
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
    editInformacionTarifa: true
  }
}
```

### Permission Check Function

```javascript
const tienePermiso = (seccion) => {
  return isSuperAdmin || permisosSecciones[seccion] === true;
};
```

---

## Common Features Across Components

### 1. Company Selector (SuperAdmin)

SuperAdmins can switch between companies to manage their screens.

### 2. Screen Selector

Each screen type component shows numbered screens (1-10+) that the user can customize.

### 3. Color Pickers

Uses `react-color` ChromePicker for template and font colors.

### 4. Font Selectors

Dropdown for Google Fonts selection.

### 5. Image Upload

Firebase Storage integration for logos and content images.

### 6. Save/Cancel Actions

All edit forms have save/cancel with SweetAlert2 confirmation.

---

## Responsive Design

| Breakpoint | Sidebar Behavior                 |
| ---------- | -------------------------------- |
| Mobile     | Hidden by default, toggle button |
| Tablet     | Collapsible                      |
| Desktop    | Always visible                   |

---

## Files Summary

| Category            | Total Files | Total Lines  |
| ------------------- | ----------- | ------------ |
| Screen Management   | 5           | ~9,500       |
| Event Management    | 2           | ~2,900       |
| Advertising         | 2           | ~2,200       |
| Device Management   | 3           | ~1,900       |
| Sidebar             | 1           | 790          |
| **Total Dashboard** | **~27**     | **~20,000+** |

---

_See [Screen Types](../screens/SCREEN-TYPES.md) for detailed screen configuration._
