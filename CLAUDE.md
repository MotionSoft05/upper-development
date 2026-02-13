# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Upper Digital Signage is a B2B SaaS platform for managing digital signage across hotels, restaurants, offices, and venues. This repository contains the **Dashboard Web** (Next.js 13) which administrators use to configure content.

**Content is displayed on a separate Android TV App** (Expo/React Native) that reads from Firebase in real-time. The web routes for screens (`/pantalla/[id]`, etc.) are for preview/development only—the primary display method is the TV app.

```
Dashboard Web (this repo)     Firebase        Android TV App (separate repo)
         │                       │                       │
         │ writes configs ──────►│◄────── reads realtime │
         │ (events, templates)   │         (onSnapshot)  │
         │                       │                       │
         └───────────────────────┴───────────────────────┘
```

## Commands

```bash
# Development
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build with static export to /out
npm run lint         # Run ESLint

# Firebase Functions (from /functions directory)
cd functions
npm run serve        # Local emulator testing
npm run deploy       # Deploy to Firebase
npm run test:flight  # Test flight API integration
```

## Architecture

### Dashboard (Admin Panel)

- `src/app/dashboard/` - Single page that switches panels via Zustand state
- `src/components/dashboard/` - Dashboard panels (altaEventos, pantallasSalon, PantallasVuelos, etc.)
- `src/stores/useDashboardStore.ts` - Navigation and sidebar state
- No React Router in dashboard—uses `activePanel` state for panel switching

### Screen Types (5 types)

| Type        | Firebase Collection   | Purpose                 |
|-------------|-----------------------|-------------------------|
| Salon       | `TemplateSalon`       | Event displays          |
| Directory   | `TemplateDirectorio`  | Building directories    |
| Tarifario   | `TemplateTarifario`   | Rate boards             |
| Vuelos      | `flightData`          | Flight monitors         |
| Promociones | `TemplatePromociones` | Promotional content     |

### Device Linking Flow

1. TV App generates 6-char code, creates `devices` doc with `status: 'waiting'`
2. Dashboard user enters code, updates doc to `status: 'linked'` with `empresa`
3. Dashboard configures screen type, updates to `status: 'configured'`
4. TV App detects change via `onSnapshot`, navigates to configured screen

### Multi-Tenancy

All data scoped by `empresa` (company) field. User permissions checked via `permisosSecciones` object.

### Key Directories

- `src/components/templates/` - Web preview renderers (PS=Salon, PD=Directory, PT=Tarifario)
- `src/firebase/` - Firebase config and service exports
- `src/services/` - Business logic (FlightFirebaseService)
- `functions/` - Cloud Functions for flight data (40 min scheduled updates)

## Firebase Collections

| Collection            | Purpose                          |
|-----------------------|----------------------------------|
| `usuarios`            | Users with company & permissions |
| `eventos`             | Events for salon screens         |
| `devices`             | Android TV device linking        |
| `Template*`           | Screen configs (by type)         |
| `publicidad*`         | Advertising content              |
| `flightData`          | Cached flight information        |

## i18n

Spanish/English in `src/lang/translationES.json` and `translationEN.json` (~70KB each). Uses react-i18next.

## External APIs

- **AeroDataBox**: Flight data (Cloud Functions, 40 min intervals)
- **WeatherAPI**: Weather data
- **Google Maps**: Location services

## Documentation

Full docs in `/docs` folder. Key files:
- `docs/integration/DASHBOARD-GUIDE.md` - How TV App consumes data
- `docs/architecture/ARCHITECTURE-OVERVIEW.md` - System design
- `docs/devices/DEVICE-MANAGEMENT.md` - Device linking
