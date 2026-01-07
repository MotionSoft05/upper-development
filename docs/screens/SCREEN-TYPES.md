# 📺 Screen Types Documentation

> Comprehensive guide to all 5 screen types in Upper Digital Signage

---

## Overview

Upper Digital Signage supports 5 distinct screen types, each designed for specific use cases:

| Type | Name                  | Primary Use                     | Max Screens |
| ---- | --------------------- | ------------------------------- | ----------- |
| 1    | Pantallas Salón       | Event displays in venues        | 300         |
| 2    | Pantallas Directorio  | Building directories            | 10+         |
| 3    | Pantallas Tarifario   | Rate boards (hotels, transport) | 10+         |
| 4    | Pantallas Vuelos      | Flight information displays     | 10+         |
| 5    | Pantallas Promociones | Promotional content             | 10+         |

---

## 1. Pantallas Salón (Event Screens)

### Purpose

Display event information with rotating content, weather, time, and RSS feeds.

### Route

```
/pantalla/[id]  →  /pantalla/1, /pantalla/2, ... /pantalla/300
```

### Configuration Component

**File**: `src/components/dashboard/pantallasSalon.jsx` (1,416 lines)

### Key Features

- Template selection (PSTemplate1, PSTemplate2)
- Logo upload
- Color customization (template color, font color)
- Font family selection
- Weather city configuration
- Language selection (ES/EN)
- Orientation (horizontal/vertical)

### Screen Base Component

**File**: `src/components/PantallaBaseSalon.jsx` (726 lines)

### Data Structure

```javascript
// Firebase Collection: TemplateSalon
{
  empresa: "COMPANY_ID",
  selectedCity: { value: "city", label: "City Name" },
  selectedPantalla: 1,
  template: "PSTemplate1",
  templateColor: "#1E3A8A",
  fontColor: "#FFFFFF",
  fontStyle: "Inter",
  idioma: "es",
  logo: "https://firebase-storage-url/logo.png",
  orientation: "horizontal"
}
```

### Templates Available

| Template    | File                        | Description          |
| ----------- | --------------------------- | -------------------- |
| PSTemplate1 | `templates/PSTemplate1.jsx` | Classic event layout |
| PSTemplate2 | `templates/PSTemplate2.jsx` | Modern event layout  |

### Screen Layout

```
┌────────────────────────────────────────┐
│  LOGO    │    EVENT CONTENT    │ TIME  │
│          │                     │       │
├──────────┴─────────────────────┴───────┤
│              EVENT DETAILS              │
│                                        │
│   Name, Date, Description, Images      │
│                                        │
├────────────────────────────────────────┤
│  WEATHER  │    RSS TICKER     │  DATE  │
└────────────────────────────────────────┘
```

---

## 2. Pantallas Directorio (Directory Screens)

### Purpose

Display building directories with event listings, organized by time slots.

### Route

```
/pantallaDirec/[id]
```

### Configuration Component

**File**: `src/components/dashboard/PantallasDirectorio.jsx` (1,749 lines)

### Key Features

- Horizontal and Vertical templates
- Multi-screen support with individual settings
- Weather integration
- RSS news ticker
- QR code generation
- Event rotation
- Advertising slider integration

### Screen Base Component

**File**: `src/components/PantallaBaseDirectorio.jsx` (923 lines)

### Data Structure

```javascript
// Firebase Collection: TemplateDirectorio
{
  empresa: "COMPANY_ID",
  pantallas: [
    {
      pantallaId: 1,
      template: "PDTemplate1Horizontal",
      templateColor: "#1E3A8A",
      fontColor: "#FFFFFF",
      logoUrl: "https://...",
      selectedCity: { value: "city" }
    }
  ]
}
```

### Templates Available

| Template              | File                                  | Orientation |
| --------------------- | ------------------------------------- | ----------- |
| PDTemplate1Horizontal | `templates/PDTemplate1Horizontal.jsx` | Landscape   |
| PDTemplate1Vertical   | `templates/PDTemplate1Vertical.jsx`   | Portrait    |

### Screen Layout (Horizontal)

```
┌─────────────────────────────────────────────────────────┐
│  LOGO  │        CURRENT DATE/TIME         │  WEATHER   │
├────────┴──────────────────────────────────┬────────────┤
│                                           │            │
│             EVENT LISTINGS                │  AD SLIDER │
│                                           │            │
│  ┌─────────────────────────────────────┐  │            │
│  │ Time │ Event Name │ Location        │  │  (Images/  │
│  ├─────────────────────────────────────┤  │   Videos)  │
│  │ 09:00 │ Meeting A │ Salon A         │  │            │
│  │ 10:00 │ Workshop  │ Room 101        │  │            │
│  │ 14:00 │ Conference│ Main Hall       │  │            │
│  └─────────────────────────────────────┘  │            │
│                                           │            │
├───────────────────────────────────────────┴────────────┤
│                    RSS NEWS TICKER                     │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Pantallas Tarifario (Rate Screens)

### Purpose

Display rate information for hotels, transportation, or services.

### Route

```
/pantallaTarifario/[id]
```

### Configuration Component

**File**: `src/components/dashboard/pantallasTarifario.jsx` (2,270 lines)

### Key Features

- Rate table configuration
- Multiple tariff items
- Pricing updates
- Currency display
- Template color customization
- Advertising integration

### Data Structure

```javascript
// Firebase Collection: TemplateTarifario
{
  empresa: "COMPANY_ID",
  pantallas: [
    {
      pantallaId: 1,
      template: "PTTemplate1Horizontal",
      templateColor: "#1E3A8A",
      fontColor: "#FFFFFF",
      tarifas: [
        { destino: "Location A", precio: "100.00" },
        { destino: "Location B", precio: "150.00" }
      ]
    }
  ]
}
```

### Templates Available

| Template              | File                                  | Orientation |
| --------------------- | ------------------------------------- | ----------- |
| PTTemplate1Horizontal | `templates/PTTemplate1Horizontal.jsx` | Landscape   |
| PTTemplate1Vertical   | `templates/PTTemplate1Vertical.jsx`   | Portrait    |

### Screen Layout

```
┌─────────────────────────────────────────────────────────┐
│  LOGO  │           TARIFARIO            │  DATE/TIME  │
├────────┴────────────────────────────────┬─────────────┤
│                                         │             │
│           RATE TABLE                    │   WEATHER   │
│                                         │             │
│  ┌───────────────────────────────────┐  │             │
│  │ Destination      │  Price (MXN)   │  │             │
│  ├───────────────────────────────────┤  │             │
│  │ Airport Zone 1   │    $350.00     │  │             │
│  │ Airport Zone 2   │    $450.00     │  │             │
│  │ Downtown         │    $250.00     │  │             │
│  │ Beach Zone       │    $500.00     │  │             │
│  └───────────────────────────────────┘  │             │
│                                         │             │
├─────────────────────────────────────────┴─────────────┤
│                    RSS TICKER                          │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Pantallas Vuelos (Flight Screens)

### Purpose

Display real-time flight information for airports and hotels near airports.

### Route

```
/pantallaVuelos
```

### Configuration Component

**File**: `src/components/dashboard/PantallasVuelos.jsx` (1,655 lines)

### Key Features

- Real-time flight data from AeroDataBox API
- Configurable airport selection (MEX, GDL, CUN, MTY, PVR)
- Arrival/Departure filtering
- Hotel distance information
- Automatic refresh (40-minute intervals)

### Supported Airports

| Code | Airport Name                  |
| ---- | ----------------------------- |
| MEX  | Mexico City International     |
| GDL  | Guadalajara International     |
| CUN  | Cancún International          |
| MTY  | Monterrey International       |
| PVR  | Puerto Vallarta International |

### Data Structure

```javascript
// Firebase Collection: flightData
{
  airport: "MEX",
  arrivals: [...],
  departures: [...],
  lastUpdated: Timestamp
}

// Firebase Collection: hotelDistanceConfig
{
  empresa: "COMPANY_ID",
  airport: "MEX",
  distance: "25 min"
}
```

### Screen Layout

```
┌─────────────────────────────────────────────────────────┐
│  LOGO  │        FLIGHT INFORMATION       │   WEATHER   │
├────────┴────────────────────────────────────────────────┤
│                                                         │
│                    ARRIVALS                             │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Flight  │ Origin    │ Time  │ Gate │ Status      │  │
│  ├───────────────────────────────────────────────────┤  │
│  │ AM 123  │ LAX       │ 10:30 │ A5   │ On Time     │  │
│  │ VB 456  │ JFK       │ 11:00 │ B2   │ Delayed     │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│           Distance to Hotel: 25 min                     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│              HOTEL INFO / PROMOTIONS                    │
└─────────────────────────────────────────────────────────┘
```

### Cloud Functions Integration

```javascript
// Scheduled function: Every 40 minutes
exports.updateFlights40Min = onSchedule(
  {
    schedule: "*/40 * * * *",
    timeZone: "America/Mexico_City",
  },
  async (event) => {
    // Updates flight data for all active airports
  },
);
```

---

## 5. Pantallas Promociones (Promo Screens)

### Purpose

Display promotional content, advertisements, and marketing materials.

### Route

Dynamic routes for promotional screens

### Configuration Component

**File**: `src/components/dashboard/PantallasPromociones.jsx` (2,391 lines)

### Key Features

- Multiple content sections
- Image and video support
- Date-range scheduling
- Fullscreen mode toggle
- Template switching
- Content rotation with timers

### Content Sections

Each promotional screen can have multiple sections:

- Main content area
- Side panels
- Header/Footer areas

### Data Structure

```javascript
// Firebase Collection: TemplatePromociones
{
  empresa: "COMPANY_ID",
  pantallas: [
    {
      pantallaId: 1,
      nombre: "Lobby Screen",
      template: "fullscreen",
      sections: [
        {
          id: "main",
          contents: [
            {
              type: "image",
              url: "https://...",
              duration: 10
            },
            {
              type: "video",
              url: "https://...",
              duration: 30
            }
          ]
        }
      ],
      dateRange: {
        startDate: "2026-01-01",
        endDate: "2026-12-31"
      }
    }
  ]
}
```

### Screen Layout (Fullscreen)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                                                         │
│                                                         │
│                   PROMOTIONAL                           │
│                    CONTENT                              │
│                                                         │
│              (Rotating images/videos)                   │
│                                                         │
│                                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Screen Generation Logic

### Static Route Generation

All screens use `generateStaticParams` for SSG:

```javascript
// Example: Generates 300 routes for salon screens
export function generateStaticParams() {
  return Array.from({ length: 300 }, (_, i) => ({
    id: (i + 1).toString(),
  }));
}
```

### Why 300-500 Screens?

- **Scalability**: Pre-generates routes for large installations
- **Performance**: Static pages load instantly
- **Flexibility**: Companies can scale without code changes

### Dynamic Content Loading

Even with static routes, content is dynamic via Firebase subscriptions:

```javascript
// Real-time content subscription
onSnapshot(query(eventsRef, where("empresa", "==", empresa)), (snapshot) => {
  // Content updates in real-time without page reload
});
```

---

## Screen Rendering Flow

```
1. User navigates to /pantalla/5
           ↓
2. Next.js serves pre-built static page
           ↓
3. Client-side React hydration
           ↓
4. Component fetches user auth state
           ↓
5. Firebase subscription established
           ↓
6. Screen renders with real-time data
           ↓
7. onSnapshot listeners update content automatically
```

---

## Common Features Across All Screens

| Feature        | Description                         |
| -------------- | ----------------------------------- |
| Weather Widget | Real-time weather from WeatherAPI   |
| RSS Ticker     | News feed from external RSS sources |
| Time Display   | Current time (auto-updates)         |
| Company Logo   | Customizable per screen             |
| Color Themes   | Template and font color selection   |
| Language       | Spanish/English switching           |
| Heartbeat      | Device connectivity monitoring      |

---

_See [Template System](../templates/TEMPLATE-SYSTEM.md) for template implementation details._
