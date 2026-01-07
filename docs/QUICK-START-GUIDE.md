# 🧠 Upper Digital Signage - Guía Rápida

> Todo lo que necesitas saber para entender el proyecto en 5 minutos

---

## ¿Qué es esto?

**Upper Digital Signage** es una plataforma B2B SaaS para gestionar pantallas digitales en hoteles, restaurantes, oficinas y aeropuertos.

```
Usuario → Dashboard Web → Configura contenido → Firebase → Pantallas (Android TV)
```

---

## 🎯 Las 4 Cosas Principales

### 1. Dashboard (`/dashboard`)

El panel de administración donde los usuarios gestionan todo.

→ **[Más detalles](./dashboard/DASHBOARD-OVERVIEW.md)**

### 2. Pantallas (5 tipos)

| Tipo            | Uso                     | Ruta                      |
| --------------- | ----------------------- | ------------------------- |
| **Salón**       | Eventos en salas        | `/pantalla/[1-300]`       |
| **Directorio**  | Directorios de edificio | `/pantallaDirec/[id]`     |
| **Tarifario**   | Precios/tarifas         | `/pantallaTarifario/[id]` |
| **Vuelos**      | Info de vuelos          | `/pantallaVuelos`         |
| **Promociones** | Contenido promocional   | `/pantallaPromociones`    |

→ **[Más detalles](./screens/SCREEN-TYPES.md)**

### 3. Firebase (todo el backend)

- **Auth**: Login de usuarios
- **Firestore**: Base de datos
- **Storage**: Imágenes/videos
- **Functions**: Lógica de vuelos

→ **[Más detalles](./technical/FIREBASE-INTEGRATION.md)**

### 4. Android TV App

Una app que corre en las pantallas y muestra el contenido configurado en el dashboard.

→ **[Más detalles](./devices/DEVICE-MANAGEMENT.md)**

---

## 🗂️ Estructura del Código

```
src/
├── app/              # Páginas (Next.js App Router)
│   ├── dashboard/    # Panel de admin
│   ├── pantalla/     # 300 rutas de pantallas Salón
│   └── ...
├── components/
│   ├── dashboard/    # Componentes del dashboard (GRANDES, 2000+ líneas)
│   └── templates/    # Templates de pantallas
├── firebase/         # Config de Firebase
└── lang/             # Traducciones ES/EN

functions/            # Cloud Functions (vuelos, etc)
```

---

## ⚡ Flujo de Datos

```
1. Usuario en Dashboard
         ↓
2. Guarda config en Firestore
         ↓
3. Pantalla suscrita con onSnapshot()
         ↓
4. Contenido se actualiza en tiempo real
```

---

## 🔐 Sistema de Permisos

| Rol            | Nivel          | Puede hacer                    |
| -------------- | -------------- | ------------------------------ |
| **SuperAdmin** | `permisos: 10` | TODO                           |
| **Usuario**    | `permisos: 1`  | Solo según `permisosSecciones` |

Las secciones visibles dependen de `permisosSecciones.nombreSeccion === true`.

→ **[Más detalles](./technical/PERMISSION-SYSTEM.md)**

---

## ⚠️ Problemas Conocidos

| Problema                    | Impacto             | Prioridad |
| --------------------------- | ------------------- | --------- |
| Componentes de 2000+ líneas | Difícil de mantener | 🔴 Alta   |
| Sidebar con 40+ props       | Tech debt           | 🔴 Alta   |
| No es mobile-friendly       | UX malo en móvil    | 🟡 Media  |
| Landing desactualizada      | Marketing viejo     | 🟡 Media  |
| Sin TypeScript              | Errores en runtime  | 🟢 Baja   |

→ **[Más detalles](./technical/TECHNICAL-DEBT.md)**

---

## 📚 Índice Completo de Documentación

| ¿Qué quieres saber?        | Documento                                                                |
| -------------------------- | ------------------------------------------------------------------------ |
| Arquitectura general       | [ARCHITECTURE-OVERVIEW.md](./architecture/ARCHITECTURE-OVERVIEW.md)      |
| Cómo funciona el dashboard | [DASHBOARD-OVERVIEW.md](./dashboard/DASHBOARD-OVERVIEW.md)               |
| Cómo funciona la sidebar   | [SIDEBAR-NAVIGATION.md](./dashboard/SIDEBAR-NAVIGATION.md)               |
| Tipos de pantallas         | [SCREEN-TYPES.md](./screens/SCREEN-TYPES.md)                             |
| Sistema de templates       | [TEMPLATE-SYSTEM.md](./templates/TEMPLATE-SYSTEM.md)                     |
| Gestión de eventos         | [EVENT-SYSTEM.md](./events/EVENT-SYSTEM.md)                              |
| Publicidad                 | [ADVERTISING-SYSTEM.md](./advertising/ADVERTISING-SYSTEM.md)             |
| Dispositivos Android TV    | [DEVICE-MANAGEMENT.md](./devices/DEVICE-MANAGEMENT.md)                   |
| Firebase/Firestore         | [FIREBASE-INTEGRATION.md](./technical/FIREBASE-INTEGRATION.md)           |
| Cloud Functions            | [CLOUD-FUNCTIONS.md](./technical/CLOUD-FUNCTIONS.md)                     |
| Permisos                   | [PERMISSION-SYSTEM.md](./technical/PERMISSION-SYSTEM.md)                 |
| Multi-idioma               | [I18N-SYSTEM.md](./technical/I18N-SYSTEM.md)                             |
| Generación de rutas        | [ROUTING-STATIC-GENERATION.md](./technical/ROUTING-STATIC-GENERATION.md) |
| Problemas a resolver       | [TECHNICAL-DEBT.md](./technical/TECHNICAL-DEBT.md)                       |
| Sistema de vuelos          | [FLIGHT-SYSTEM.md](./flights/FLIGHT-SYSTEM.md)                           |
| Deploy seguro              | [SECURE-DEPLOYMENT.md](./deployment/SECURE-DEPLOYMENT.md)                |
| **Integración Web ↔ App**  | [integration/README.md](./integration/README.md)                         |

---

## 🚀 Comandos Útiles

```bash
# Desarrollo
npm run dev              # http://localhost:3000

# Producción
npm run build            # Build
npm run export           # Static export

# Functions
cd functions && npm run serve   # Local
firebase deploy --only functions  # Deploy
```

---

## 📍 ¿Por dónde empezar?

1. **Entender la estructura**: Lee este documento
2. **Ver el código**: Empieza por `src/components/dashboard/SideBar.jsx`
3. **Ver las pantallas**: Mira `src/components/templates/`
4. **Entender Firebase**: Lee `FIREBASE-INTEGRATION.md`

---

_Última actualización: 2026-01-07_
