# 🔐 Permission System Documentation

> Role-based access control in Upper Digital Signage

---

## Overview

The permission system controls access to dashboard sections based on user roles and specific section permissions.

---

## Permission Levels

### User Roles

| Level | Name          | Description                         |
| ----- | ------------- | ----------------------------------- |
| 1     | Standard User | Access based on `permisosSecciones` |
| 10    | SuperAdmin    | Full access to all sections         |

---

## Permission Structure

### User Document

```javascript
// usuarios collection
{
  permisos: 1,  // 1 = normal, 10 = SuperAdmin

  permisosSecciones: {
    // Screen Personalization
    tablero: true,
    altaEventos: true,
    consultaEventos: true,
    mensajesDinamicos: true,
    editInformacionTarifa: true,

    // Screen Settings
    pantallasSalon: true,
    pantallasDirectorio: true,
    pantallasPromociones: true,
    pantallasvuelos: true,
    pantallasTarifario: true,
    monitoreo: true,
    publicidad: true,

    // Android TV
    androidTv: true,

    // Information
    datosUsuario: true,
    guiaUsuario: true,
    contactoSoporte: true
  }
}
```

---

## Permission Checking

### In Sidebar Component

```javascript
// src/components/dashboard/SideBar.jsx

function Sidebar(props) {
  const userData = props.userData || {};
  const permisosSecciones = userData.permisosSecciones || {};

  // SuperAdmin check
  const isSuperAdmin = userData.permisos === 10;

  // Section permission check
  const tienePermiso = (seccion) => {
    return isSuperAdmin || permisosSecciones[seccion] === true;
  };

  return (
    <div>
      {/* SuperAdmin only section */}
      {isSuperAdmin && (
        <li>
          <button onClick={() => changePanel("setShowAdmin")}>Admin</button>
        </li>
      )}

      {/* Permission-based sections */}
      {tienePermiso("pantallasSalon") && (
        <li>
          <button onClick={() => changePanel("setShowPantallaSalon")}>
            Pantallas Salón
          </button>
        </li>
      )}
    </div>
  );
}
```

---

## Permission Categories

### 1. Admin Section (SuperAdmin Only)

| Permission            | Component           | Description           |
| --------------------- | ------------------- | --------------------- |
| N/A (permisos === 10) | Admin               | User management       |
| N/A (permisos === 10) | Edición de Empresas | Company management    |
| N/A (permisos === 10) | Monitor de APIs     | API status monitoring |

### 2. Screen Personalization

| Permission Key          | Component           | Description             |
| ----------------------- | ------------------- | ----------------------- |
| `tablero`               | Dashboard           | User dashboard overview |
| `altaEventos`           | Alta de Eventos     | Create new events       |
| `consultaEventos`       | Consulta de Eventos | Query/edit events       |
| `mensajesDinamicos`     | Mensajes Dinámicos  | Dynamic messages        |
| `editInformacionTarifa` | Edit Info Tarifas   | Rate information        |

### 3. Android TV

| Permission Key | Component        | Description       |
| -------------- | ---------------- | ----------------- |
| `androidTv`    | Mis Pantallas TV | Device management |

### 4. Screen Settings

| Permission Key         | Component             | Description              |
| ---------------------- | --------------------- | ------------------------ |
| `pantallasSalon`       | Pantallas Salón       | Salon screen config      |
| `pantallasDirectorio`  | Pantallas Directorio  | Directory screen config  |
| `pantallasPromociones` | Pantallas Promociones | Promo screen config      |
| `pantallasvuelos`      | Pantallas Vuelos      | Flight screen config     |
| `pantallasTarifario`   | Pantallas Tarifario   | Rate screen config       |
| `monitoreo`            | Monitor de Pantallas  | Screen monitoring        |
| `publicidad`           | Publicidad            | Advertisement management |

### 5. Information

| Permission Key    | Component        | Description          |
| ----------------- | ---------------- | -------------------- |
| `datosUsuario`    | Mis Datos        | User profile/license |
| `guiaUsuario`     | Guía de Usuario  | User guides          |
| `contactoSoporte` | Contacto Soporte | Support contact      |

---

## Default Permissions

When creating a new user, default permissions can be set:

```javascript
const defaultPermissions = {
  permisos: 1,
  permisosSecciones: {
    tablero: true,
    altaEventos: true,
    consultaEventos: true,
    pantallasSalon: true,
    datosUsuario: true,
    guiaUsuario: true,
    contactoSoporte: true,
  },
};
```

---

## SuperAdmin Capabilities

SuperAdmins (`permisos === 10`) have additional capabilities:

| Capability         | Description                      |
| ------------------ | -------------------------------- |
| Company Selection  | Can switch between companies     |
| All Sections       | Access to all dashboard sections |
| User Management    | Create/modify users              |
| API Monitoring     | View API status and logs         |
| Cross-Company View | See data from all companies      |

---

## Company-Level Filtering

All data queries are scoped by company:

```javascript
// Non-SuperAdmin: Always filter by their company
const q = query(
  collection(db, "eventos"),
  where("empresa", "==", userData.empresa),
);

// SuperAdmin: Can select any company
const q = query(
  collection(db, "eventos"),
  where("empresa", "==", selectedEmpresa), // User-selected
);
```

---

## Screen Access Control

Users also have screen-level access:

```javascript
// User can only configure screens assigned to them
{
  pantallaSalon: [1, 2, 3, 4, 5],        // Salon screens 1-5
  pantallaDirectorio: [1, 2],            // Directory screens 1-2
  pantallaTarifario: [1],                // Rate screen 1
  pantallaVuelos: [],                    // No flight screens
  pantallaPromociones: [1, 2]            // Promo screens 1-2
}
```

---

## Permission Management UI

SuperAdmins can manage permissions through the Admin section:

```javascript
// Toggle permission for a user
const togglePermiso = async (userId, seccion, value) => {
  await updateDoc(doc(db, "usuarios", userId), {
    [`permisosSecciones.${seccion}`]: value,
  });
};

// Set user as SuperAdmin
const setSuperAdmin = async (userId, value) => {
  await updateDoc(doc(db, "usuarios", userId), {
    permisos: value ? 10 : 1,
  });
};
```

---

## Security Notes

1. **Client-Side Only**: Permission checks in sidebar are client-side for UI purposes
2. **Server Validation**: Firebase Security Rules should enforce actual access
3. **Never Trust Client**: All data operations should be validated server-side

```javascript
// Firebase Security Rules should validate
match /eventos/{eventId} {
  allow read, write: if request.auth != null &&
    (
      // SuperAdmin can access all
      get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.permisos == 10 ||
      // Or user is from same company
      get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.empresa == resource.data.empresa
    );
}
```

---

_See [Firebase Integration](./FIREBASE-INTEGRATION.md) for security rules details._
