# 🏗️ Architecture Overview

> Complete technical architecture of the Upper Digital Signage platform

---

## Technology Stack

### Frontend

| Technology        | Version | Purpose                      |
| ----------------- | ------- | ---------------------------- |
| **Next.js**       | 14.x    | React framework with SSG/SSR |
| **React**         | 18.x    | UI component library         |
| **Tailwind CSS**  | 3.x     | Utility-first CSS            |
| **react-i18next** | -       | Internationalization         |
| **keen-slider**   | -       | Image/content sliders        |
| **react-color**   | -       | Color pickers                |
| **SweetAlert2**   | -       | Alert dialogs                |
| **Heroicons**     | -       | Icon library                 |
| **FontAwesome**   | -       | Additional icons             |

### Backend (Firebase)

| Service             | Purpose                      |
| ------------------- | ---------------------------- |
| **Firebase Auth**   | User authentication          |
| **Cloud Firestore** | NoSQL database               |
| **Cloud Storage**   | Media files (images, videos) |
| **Cloud Functions** | Serverless backend logic     |

### External APIs

| API             | Purpose                |
| --------------- | ---------------------- |
| **WeatherAPI**  | Real-time weather data |
| **AeroDataBox** | Flight information     |
| **RSS Feeds**   | News ticker content    |
| **Google Maps** | Location services      |

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │   Web Browser   │  │   Android TV    │  │   Mobile App    │     │
│  │   (Dashboard)   │  │   (Display)     │  │   (Future)      │     │
│  └────────┬────────┘  └────────┬────────┘  └─────────────────┘     │
│           │                    │                                    │
└───────────┼────────────────────┼────────────────────────────────────┘
            │                    │
            ▼                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         NEXT.JS APPLICATION                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      APP ROUTER                              │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                              │   │
│  │  /              → Landing Page (Marketing)                   │   │
│  │  /login         → User Authentication                        │   │
│  │  /register      → User Registration                         │   │
│  │  /dashboard     → Admin Dashboard                           │   │
│  │  /pantalla/[id] → Salon Screens (1-300)                     │   │
│  │  /pantallaDirec/[id] → Directory Screens                    │   │
│  │  /pantallaTarifario/[id] → Rate Screens                     │   │
│  │  /pantallaVuelos → Flight Monitors                          │   │
│  │  /pantallaDeServicio → Service Screens                      │   │
│  │                                                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     COMPONENTS (80+)                         │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                              │   │
│  │  Dashboard:              Screen Bases:        Templates:     │   │
│  │  - SideBar               - PantallaBaseSalon  - PSTemplate1  │   │
│  │  - pantallasSalon        - PantallaBaseDirec  - PSTemplate2  │   │
│  │  - PantallasDirectorio   - pantallaBaseTarif  - PDTemplate1H │   │
│  │  - PantallasPromociones                       - PDTemplate1V │   │
│  │  - PantallasVuelos       Devices:             - PTTemplate1H │   │
│  │  - pantallasTarifario    - DevicesList        - PTTemplate1V │   │
│  │  - altaEventos           - DeviceConfiguration              │   │
│  │  - consultaModEventos    - DeviceLinker                     │   │
│  │  - publicidadDirec                                          │   │
│  │  - publicidadSalon                                          │   │
│  │                                                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       FIREBASE SERVICES                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐           │
│  │  Auth         │  │  Firestore    │  │  Storage      │           │
│  │               │  │               │  │               │           │
│  │  - Email/Pass │  │  Collections: │  │  - Images     │           │
│  │  - Session    │  │  - usuarios   │  │  - Videos     │           │
│  │    Management │  │  - eventos    │  │  - Logos      │           │
│  │               │  │  - Template*  │  │               │           │
│  └───────────────┘  │  - devices    │  └───────────────┘           │
│                     │  - flightData │                               │
│                     │  - publicidad │                               │
│                     └───────────────┘                               │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    CLOUD FUNCTIONS                           │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                              │   │
│  │  Scheduled:                    HTTP Endpoints:               │   │
│  │  - updateFlights40Min          - testFlightUpdate            │   │
│  │    (every 40 minutes)          - getFlightData              │   │
│  │                                 - updateFlightsManually      │   │
│  │  Services:                                                   │   │
│  │  - flightService               - hotelDistanceService       │   │
│  │                                                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Content Update Flow

```
User Dashboard                Firebase                  Display Screen
     │                           │                           │
     │ 1. Update content         │                           │
     ├──────────────────────────►│                           │
     │                           │                           │
     │                           │ 2. onSnapshot triggers    │
     │                           ├──────────────────────────►│
     │                           │                           │
     │                           │ 3. Screen updates         │
     │                           │    immediately            │
     │                           │◄──────────────────────────┤
```

### 2. Device Linking Flow

```
Android TV App          Firebase Firestore         Web Dashboard
     │                        │                         │
     │ 1. Generate code       │                         │
     ├───────────────────────►│                         │
     │                        │                         │
     │                        │                         │
     │                        │◄────────────────────────┤
     │                        │  2. Enter code           │
     │                        │                         │
     │ 3. Link confirmed      │                         │
     │◄───────────────────────┤                         │
     │                        │                         │
     │ 4. Receive config      │                         │
     │◄───────────────────────┤                         │
```

---

## Directory Structure

```
upper-development/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.js             # Landing page
│   │   ├── login/              # Auth pages
│   │   ├── register/
│   │   ├── dashboard/          # Main dashboard
│   │   ├── pantalla/[id]/      # Salon screens (1-300)
│   │   ├── pantallaDirec/[id]/ # Directory screens
│   │   ├── pantallaTarifario/  # Rate screens
│   │   ├── pantallaVuelos/     # Flight screens
│   │   └── pantallaDeServicio/ # Service screens
│   │
│   ├── components/
│   │   ├── dashboard/          # 27 dashboard components
│   │   ├── templates/          # Screen template designs
│   │   ├── homeComponents/     # Landing page sections
│   │   ├── sliders/            # Slider components
│   │   └── *.jsx               # Shared components
│   │
│   ├── firebase/               # Firebase configuration
│   │   ├── firebaseConfig.js
│   │   ├── auth.js
│   │   ├── firestore.js
│   │   └── storage.js
│   │
│   ├── utils/                  # Utility functions
│   │   ├── deviceManager.js    # Device CRUD operations
│   │   ├── weatherUtils.js     # Weather API helpers
│   │   ├── videoCache.js       # Video caching
│   │   └── i18n.js             # i18n setup
│   │
│   ├── hook/                   # React hooks
│   │   ├── useDeviceSync.js    # Real-time device sync
│   │   └── useHeartbeat.js     # Screen heartbeat
│   │
│   └── lang/                   # Translations
│       ├── translationES.json  # Spanish (~75KB)
│       └── translationEN.json  # English (~68KB)
│
├── functions/                  # Firebase Cloud Functions
│   ├── index.js                # Main functions file
│   └── services/               # Service modules
│
├── server/                     # Local server utilities
│   └── server.js
│
├── public/                     # Static assets
│   └── img/                    # Images
│
└── docs/                       # Documentation
```

---

## Key Design Patterns

### 1. Static Generation for Screens

Screens are pre-generated at build time for performance:

```javascript
// generateStaticParams creates 300 routes
export function generateStaticParams() {
  return Array.from({ length: 300 }, (_, i) => ({
    id: (i + 1).toString(),
  }));
}
```

### 2. Real-Time Subscriptions

All screen content uses Firebase `onSnapshot` for real-time updates:

```javascript
// Screen subscribes to content changes
const unsubscribe = onSnapshot(
  query(eventsRef, where("empresa", "==", company)),
  (snapshot) => {
    // Update screen content immediately
  },
);
```

### 3. Company-Based Multi-Tenancy

All data is scoped by company (`empresa` field):

```javascript
// All queries filter by company
where("empresa", "==", userData.empresa);
```

### 4. Permission-Based UI

Dashboard sections are shown based on user permissions:

```javascript
const tienePermiso = (seccion) => {
  return isSuperAdmin || permisosSecciones[seccion] === true;
};
```

---

## Environment Variables

| Variable                      | Purpose                |
| ----------------------------- | ---------------------- |
| `NEXT_PUBLIC_FIREBASE_*`      | Firebase configuration |
| `NEXT_PUBLIC_WEATHER_API_KEY` | Weather API key        |
| `AERODATABOX_API_KEY`         | Flight data API key    |
| `GOOGLE_MAPS_API_KEY`         | Maps integration       |

---

## Deployment

### Current Deployment

- **Frontend**: Static export to hosting (e.g., Vercel, Firebase Hosting)
- **Functions**: Firebase Cloud Functions (us-central1)
- **Database**: Firebase Firestore

### Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Firebase deploy
npm run deploy
```

---

_See [Technical Documentation](../technical/) for detailed implementation guides._
